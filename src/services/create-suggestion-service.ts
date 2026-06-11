import { prisma } from '../lib/prisma.js'

interface SuggestionCheckRequest {
  playerId: string
  responded: boolean
}

interface CreateSuggestionRequest {
  gameId: string
  askedByPlayerId: string
  suspectCardId: string
  weaponCardId: string
  roomCardId: string
  checks: SuggestionCheckRequest[]
}

export class CreateSuggestionService {
  async execute({
    gameId,
    askedByPlayerId,
    suspectCardId,
    weaponCardId,
    roomCardId,
    checks
  }: CreateSuggestionRequest) {
    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    const createdSuggestion = await prisma.$transaction(
      async (tx) => {
        const suggestion = await tx.suggestion.create({
          data: {
            gameId,
            askedByPlayerId,
            suspectCardId,
            weaponCardId,
            roomCardId
          }
        })

        await tx.suggestionCheck.createMany({
          data: checks.map((check) => ({
            suggestionId: suggestion.id,
            playerId: check.playerId,
            responded: check.responded
          }))
        })

        for (const check of checks) {
          if (!check.responded) {
            await tx.cardNote.updateMany({
              where: {
                gameId,
                playerId: check.playerId,
                cardId: {
                  in: [
                    suspectCardId,
                    weaponCardId,
                    roomCardId
                  ]
                }
              },
              data: {
                status: 'DOES_NOT_HAVE',
                observation:
                  'Inferido por não responder sugestão'
              }
            })
          }
        }

        return await tx.suggestion.findUnique({
          where: {
            id: suggestion.id
          },
          include: {
            checks: {
              select: {
                playerId: true,
                responded: true
              }
            }
          }
        })
      }
    )

    return createdSuggestion
  }
}