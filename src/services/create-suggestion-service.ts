import { prisma } from '../lib/prisma'

interface SuggestionCheckInput {
  playerId: string
  responded: boolean
}

interface CreateSuggestionRequest {
  gameId: string
  askedByPlayerId: string
  suspectCardId: string
  weaponCardId: string
  roomCardId: string
  checks: SuggestionCheckInput[]
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

    const suggestion =
      await prisma.suggestion.create({
        data: {
          gameId,
          askedByPlayerId,
          suspectCardId,
          weaponCardId,
          roomCardId
        }
      })

    for (const check of checks) {

      await prisma.suggestionCheck.create({
        data: {
          suggestionId: suggestion.id,
          playerId: check.playerId,
          responded: check.responded
        }
      })

      if (!check.responded) {

        await prisma.cardNote.updateMany({
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

    return suggestion
  }
}