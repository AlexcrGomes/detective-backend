import { prisma } from '../lib/prisma.js'

interface GetSuggestionRequest {
  gameId: string
}

export class GetSuggestionService {
  async execute({
    gameId
  }: GetSuggestionRequest) {

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    const suggestions = await prisma.suggestion.findMany({
      where: {
        gameId
      },
      include: {
        checks: {
          select: {
            playerId: true,
            responded: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return suggestions
  }
}