import { prisma } from '../lib/prisma'

interface GetGameRequest {
  gameId: string
}

export class GetGameService {
  async execute({ gameId }: GetGameRequest) {

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      },
      include: {
        players: true,
        notes: true,
        theory: true
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    return game
  }
}