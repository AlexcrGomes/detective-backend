import { Request, Response } from 'express'

import { UpdateNoteService } from '../services/update-note-service'

export class UpdateNoteController {
  async handle(
    request: Request,
    response: Response
  ) {

    const { gameId } = request.params

    const {
      playerId,
      cardId,
      status,
      observation
    } = request.body

    const service = new UpdateNoteService()

    const result = await service.execute({
      gameId,
      playerId,
      cardId,
      status,
      observation
    })

    return response.json(result)
  }
}