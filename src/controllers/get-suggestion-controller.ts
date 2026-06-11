import { Request, Response } from 'express'

import { GetSuggestionService } from '../services/get-suggestions-service'


export class GetSuggestionController {

    async handle(
        request: Request,
         response: Response
    ) {

      const { gameId } = request.params

      const service = new GetSuggestionService()

      const suggestions = await service.execute({gameId: gameId})

      return response.json(suggestions)
    }
}