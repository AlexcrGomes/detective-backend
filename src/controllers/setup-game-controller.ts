import { Request, Response } from 'express'

import { SetupGameService } from '../services/setup-game-service'

export class SetupGameController {
  async handle(request: Request, response: Response) {

    const { gameId } = request.params

    const { players, myCards } = request.body

    const service = new SetupGameService()

    const result = await service.execute({
      gameId: gameId,
      players,
      myCards
    })

    return response.json(result)
  }
}