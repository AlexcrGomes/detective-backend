import { CardStatus } from '@prisma/client'

import { prisma } from '../lib/prisma'
import { cardIds } from '../constants/cards'

interface PlayerInput {
  name: string
  isMe: boolean
  cardCount: number
}

interface SetupGameRequest {
  gameId: string
  players: PlayerInput[]
  myCards: string[]
}

export class SetupGameService {
  async execute({
    gameId,
    players,
    myCards
  }: SetupGameRequest) {
    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.isSetupComplete) {
      throw new Error('Game already configured')
    }

    const mePlayers = players.filter(player => player.isMe)

    if (mePlayers.length !== 1) {
      throw new Error('Must have exactly one main player')
    }

    if (players.length !== game.playerCount) {
      throw new Error(
        `Expected ${game.playerCount} players, received ${players.length}`
      )
    }

    const hasEmptyName = players.some(
      player => !player.name || !player.name.trim()
    )

    if (hasEmptyName) {
      throw new Error('All players must have a name')
    }

    const names = players.map(player =>
      player.name.trim().toLowerCase()
    )

    const duplicatedNames =
      new Set(names).size !== names.length

    if (duplicatedNames) {
      throw new Error('Duplicated player names')
    }

    const duplicatedCards =
      new Set(myCards).size !== myCards.length

    if (duplicatedCards) {
      throw new Error('Duplicated cards')
    }

    const invalidCards = myCards.some(
      card => !cardIds.includes(card)
    )

    if (invalidCards) {
      throw new Error('Invalid cards')
    }

    const result = await prisma.$transaction(
      async tx => {

        const createdPlayers = []

        for (const player of players) {
          const createdPlayer = await tx.player.create({
            data: {
              gameId,
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

            if (player.isMe) {
              status = myCards.includes(cardId) ? 'HAS' : 'DOES_NOT_HAVE'
            } else if (myCards.includes(cardId)) {
              status = 'DOES_NOT_HAVE'
            }

            notes.push({
              gameId,
              playerId: player.id,
              cardId,
              status,
              observation: null
            })
          }
        }

        await tx.cardNote.createMany({
          data: notes
        })

        await tx.theory.create({
          data: {
            gameId
          }
        })

        await tx.game.update({
          where: {
            id: gameId
          },
          data: {
            isSetupComplete: true
          }
        })

        return {
          success: true,
          gameId
        }
      }
    )

    return result
  }
}