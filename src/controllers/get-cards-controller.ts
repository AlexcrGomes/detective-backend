import { Request, Response } from 'express'
import { GetCardsService } from '../services/get-cards-service.js'

export class GetCardsController {
  async handle(request: Request, response: Response) {
    const service = new GetCardsService()

    const result = service.execute()

    return response.json(result)
  }
}