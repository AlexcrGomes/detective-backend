import { Request, Response } from 'express'

import { GetBoardService } from '../services/get-board-service'

export class GetBoardController {
  async handle(request: Request, response: Response) {

    const { gameId } = request.params

    const service = new GetBoardService()

    const result = await service.execute({
      gameId: gameId
    })

    return response.json(result)
  }
}