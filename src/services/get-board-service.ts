import { prisma } from '../lib/prisma'
import { cards } from '../constants/cards'

interface GetBoardRequest {
  gameId: string
}

export class GetBoardService {
  async execute({ gameId }: GetBoardRequest) {

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      },

      include: {
        players: true,
        notes: true
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    const boardCards = cards.map(card => {

      const playerNotes = game.notes
        .filter(note => note.cardId === card.id)

      const players = playerNotes.map(note => ({
        noteId: note.id,
        playerId: note.playerId,
        status: note.status,
        observation: note.observation
      }))

      return {
        cardId: card.id,
        cardName: card.name,
        cardType: card.type,

        players
      }
    })

    return {
      gameId: game.id,

      players: game.players.map(player => ({
        id: player.id,
        name: player.name,
        isMe: player.isMe
      })),

      cards: boardCards
    }
  }
}