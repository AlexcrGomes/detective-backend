import { Request, Response } from 'express'

import { CreateGameService } from '../services/create-game-service.js'

export class CreateGameController {
  async handle(request: Request, response: Response) {
    const { name, playerCount } = request.body

    const service = new CreateGameService()

    const result = await service.execute({
      name,
      playerCount
    })

    return response.status(201).json(result)
  }
}