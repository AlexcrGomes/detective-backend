import { Router } from 'express'

import { GetCardsController } from './controllers/get-cards-controller'
import { CreateGameController } from './controllers/create-game-controller'
import { GetGameController } from './controllers/get-game-controller'
import { GetBoardController } from './controllers/get-board-controller'
import { GetTheoryController } from './controllers/get-theory-controller'
import { CreateSuggestionController } from './controllers/create-suggestion-controller'
import { GetSuggestionController } from './controllers/get-suggestion-controller'
import { UpdateNoteController } from './controllers/update-note-controller'

const routes = Router()

const getCardsController = new GetCardsController()
const createGameController = new CreateGameController()
const getGameController = new GetGameController()
const getBoardController = new GetBoardController()
const getTheoryController = new GetTheoryController()
const createSuggestionController = new CreateSuggestionController()
const getSuggestionController = new GetSuggestionController()
const updateNoteController = new UpdateNoteController()

routes.get('/cards', getCardsController.handle)

routes.post('/games', createGameController.handle)

routes.get('/games/:gameId', getGameController.handle)

routes.get('/games/:gameId/board', getBoardController.handle)

routes.post('/games/:gameId/suggestions', createSuggestionController.handle)

routes.get('/games/:gameId/theory', getTheoryController.handle)

routes.get('/games/:gameId/suggestions', getSuggestionController.handle)

routes.patch('/games/:gameId/notes', updateNoteController.handle)

export { routes }