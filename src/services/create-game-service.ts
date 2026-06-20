import { CardStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { cardIds } from '../constants/cards.js'

interface PlayerInput {
  name: string
  isMe: boolean
  cardCount: number
}

interface CreateGameRequest {
  name: string
  playerCount: number
  players: PlayerInput[]
  myCards: string[]
}

export class CreateGameService {
  async execute({ name, playerCount, players, myCards }: CreateGameRequest) {

    if (!name) {
      throw new Error('Game name is required')
    }

    if (playerCount < 3) {
      throw new Error('Minimum players is 3')
    }

    if (players.length !== playerCount) {
      throw new Error(`Expected ${playerCount} players, received ${players.length}`)
    }

    const mePlayers = players.filter((p) => p.isMe)
    if (mePlayers.length !== 1) {
      throw new Error('Must have exactly one main player')
    }

    const hasEmptyName = players.some((p) => !p.name || !p.name.trim())
    if (hasEmptyName) {
      throw new Error('All players must have a name')
    }

    const names = players.map((p) => p.name.trim().toLowerCase())
    if (new Set(names).size !== names.length) {
      throw new Error('Duplicated player names')
    }

    if (new Set(myCards).size !== myCards.length) {
      throw new Error('Duplicated cards')
    }

    if (myCards.some((card) => !cardIds.includes(card))) {
      throw new Error('Invalid cards')
    }

    const result = await prisma.$transaction(async (tx) => {

      const game = await tx.game.create({
        data: {
          name,
          playerCount,
          isSetupComplete: true
        }
      })

      const createdPlayers = []
      for (const player of players) {
        const createdPlayer = await tx.player.create({
          data: {
            gameId: game.id,
            name: player.name.trim(),
            isMe: player.isMe,
            cardCount: player.cardCount
          }
        })
        createdPlayers.push(createdPlayer)
      }

      const notes = []
      for (const player of createdPlayers) {
        for (const cardId of cardIds) {
          let status: CardStatus = 'UNKNOWN'

          if (player.isMe && myCards.includes(cardId)) {
            status = 'HAS'
          }

          if (player.isMe && !myCards.includes(cardId)) {
            status = 'DOES_NOT_HAVE'
          }

          if (!player.isMe && myCards.includes(cardId)) {
            status = 'DOES_NOT_HAVE'
          }

          notes.push({
            gameId: game.id,
            playerId: player.id,
            cardId,
            status,
            observation: null
          })
        }
      }

      await tx.cardNote.createMany({ data: notes })

      await tx.theory.create({ data: { gameId: game.id } })

      return game
    })

    return result
  }
}