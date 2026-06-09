import { prisma } from '../lib/prisma.js'

interface CreateGameRequest {
  name: string
  playerCount: number
}

export class CreateGameService {
  async execute({
    name,
    playerCount
  }: CreateGameRequest) {
    
    if (!name) {
      throw new Error('Game name is required')
    }

    if (playerCount < 3) {
      throw new Error('Minimum players is 3')
    }

    const game = await prisma.game.create({
      data: {
        name,
        playerCount
      }
    })

    return game
  }
}