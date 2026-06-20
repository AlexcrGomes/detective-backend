import { Request, Response } from 'express'
import { CreateGameService } from '../services/create-game-service.js'

export class CreateGameController {
  async handle(request: Request, response: Response) {
    const { name, playerCount, players, myCards } = request.body

    const service = new CreateGameService()

    const result = await service.execute({
      name,
      playerCount,
      players,
      myCards
    })

    return response.status(201).json(result)
  }
}