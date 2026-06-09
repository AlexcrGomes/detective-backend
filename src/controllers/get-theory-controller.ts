import { Request, Response } from 'express'

import { GetTheoryService } from '../services/get-theory-service'

export class GetTheoryController {

  async handle(
    request: Request,
    response: Response
  ) {

    const { gameId } = request.params

    const service = new GetTheoryService()

    const result = await service.execute(gameId)

    return response.json(result)
  }
}