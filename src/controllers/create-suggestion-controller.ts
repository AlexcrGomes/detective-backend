import { Request, Response } from 'express'
import { CreateSuggestionService } from '../services/create-suggestion-service'

export class CreateSuggestionController {

  async handle(
    request: Request,
    response: Response
  ) {

    const { gameId } = request.params

    const {
      askedByPlayerId,
      suspectCardId,
      weaponCardId,
      roomCardId,
      checks
    } = request.body

    const service =
      new CreateSuggestionService()

    const result =
      await service.execute({
        gameId,
        askedByPlayerId,
        suspectCardId,
        weaponCardId,
        roomCardId,
        checks
      })

    return response.json(result)
  }
}