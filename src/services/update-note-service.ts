import { CardStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { cards } from '../constants/cards'

interface UpdateNoteRequest {
  gameId: string
  playerId: string
  cardId: string
  status: CardStatus
  observation?: string
}

export class UpdateNoteService {

  async execute({
    gameId,
    playerId,
    cardId,
    status,
    observation
  }: UpdateNoteRequest) {

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    const note = await prisma.cardNote.findFirst({
      where: {
        gameId,
        playerId,
        cardId
      }
    })

    if (!note) {
      throw new Error('Note not found')
    }

    const updatedNote = await prisma.cardNote.update({
      where: {
        id: note.id
      },
      data: {
        status,
        observation
      }
    })

    if (status === 'HAS') {

      await prisma.cardNote.updateMany({
        where: {
          gameId,
          cardId,
          NOT: {
            playerId
          }
        },
        data: {
          status: 'DOES_NOT_HAVE'
        }
      })
    }

    const player = await prisma.player.findUnique({
      where: {
        id: playerId
      }
    })

    if (player) {

      const hasCount = await prisma.cardNote.count({
        where: {
          playerId,
          status: 'HAS'
        }
      })

      if (hasCount >= player.cardCount) {

        await prisma.cardNote.updateMany({
          where: {
            playerId,
            status: 'UNKNOWN'
          },
          data: {
            status: 'DOES_NOT_HAVE'
          }
        })
      }
    }

    await this.updateTheory(gameId)

    await this.processSuggestions(gameId)

    return updatedNote
  }

  private async updateTheory(
    gameId: string
  ) {

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      },
      include: {
        players: true,
        notes: true,
        theory: true
      }
    })

    if (!game || !game.theory) {
      return
    }

    let suspectCardId: string | null = null
    let weaponCardId: string | null = null
    let roomCardId: string | null = null

    for (const card of cards) {

      const notes = game.notes.filter(
        note => note.cardId === card.id
      )

      const allPlayersDoNotHave =
        notes.length > 0 &&
        notes.every(
          note => note.status === 'DOES_NOT_HAVE'
        )

      if (!allPlayersDoNotHave) {
        continue
      }

      if (card.type === 'SUSPECT') {
        suspectCardId = card.id
      }

      if (card.type === 'WEAPON') {
        weaponCardId = card.id
      }

      if (card.type === 'ROOM') {
        roomCardId = card.id
      }
    }

    await prisma.theory.update({
      where: {
        gameId
      },
      data: {
        suspectCardId,
        weaponCardId,
        roomCardId
      }
    })
  }

  private async processSuggestions(
    gameId: string
  ) {

    const suggestions =
      await prisma.suggestion.findMany({
        where: {
          gameId
        }
      })

    for (const suggestion of suggestions) {

      if (!suggestion.responderId) {
        continue
      }

      const candidateCards = [
        suggestion.suspectCardId,
        suggestion.weaponCardId,
        suggestion.roomCardId
      ]

      const possibleCards: string[] = []

      for (const cardId of candidateCards) {

        const note =
          await prisma.cardNote.findFirst({
            where: {
              gameId,
              playerId: suggestion.responderId,
              cardId
            }
          })

        if (!note) {
          continue
        }

        if (note.status !== 'DOES_NOT_HAVE') {
          possibleCards.push(cardId)
        }
      }

      if (possibleCards.length === 1) {

        const inferredCardId = possibleCards[0]

        const existingNote =
          await prisma.cardNote.findFirst({
            where: {
              gameId,
              playerId: suggestion.responderId,
              cardId: inferredCardId
            }
          })

        if (
          !existingNote ||
          existingNote.status === 'HAS'
        ) {
          continue
        }

        await prisma.cardNote.update({
          where: {
            id: existingNote.id
          },
          data: {
            status: 'HAS',
            observation:
              'Inferido automaticamente por sugestão'
          }
        })

        await prisma.cardNote.updateMany({
          where: {
            gameId,
            cardId: inferredCardId,
            NOT: {
              playerId: suggestion.responderId
            }
          },
          data: {
            status: 'DOES_NOT_HAVE'
          }
        })
      }
    }
  }
}