import { Request, Response } from 'express'

import { GetGameService } from '../services/get-game-service'

export class GetGameController {
  async handle(request: Request, response: Response) {

    const { gameId } = request.params

    const service = new GetGameService()

    const result = await service.execute({
      gameId: gameId
    })

    return response.json(result)
  }
}