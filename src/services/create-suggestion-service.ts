import { prisma } from '../lib/prisma.js'
import { cards } from '../constants/cards.js'

interface SuggestionCheckRequest {
  playerId: string
  responded: boolean
  shownCardId?: string
}

interface CreateSuggestionRequest {
  gameId: string
  askedByPlayerId: string
  suspectCardId: string
  weaponCardId: string
  roomCardId: string
  checks: SuggestionCheckRequest[]
}

export class CreateSuggestionService {
  async execute({
    gameId,
    askedByPlayerId,
    suspectCardId,
    weaponCardId,
    roomCardId,
    checks
  }: CreateSuggestionRequest) {

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) throw new Error('Game not found')

    const createdSuggestion = await prisma.$transaction(async (tx) => {

      const suggestion = await tx.suggestion.create({
        data: { gameId, askedByPlayerId, suspectCardId, weaponCardId, roomCardId }
      })

      await tx.suggestionCheck.createMany({
        data: checks.map((check) => ({
          suggestionId: suggestion.id,
          playerId: check.playerId,
          responded: check.responded,
          shownCardId: check.shownCardId ?? null
        }))
      })

      for (const check of checks) {
        if (!check.responded) {
          await tx.cardNote.updateMany({
            where: {
              gameId,
              playerId: check.playerId,
              cardId: { in: [suspectCardId, weaponCardId, roomCardId] }
            },
            data: {
              status: 'DOES_NOT_HAVE',
              observation: 'Inferido por não responder sugestão'
            }
          })
        }

        if (check.responded && check.shownCardId) {
          await tx.cardNote.updateMany({
            where: {
              gameId,
              cardId: check.shownCardId,
              NOT: { playerId: check.playerId }
            },
            data: { status: 'DOES_NOT_HAVE' }
          })

          await tx.cardNote.update({
            where: {
              playerId_cardId: {
                playerId: check.playerId,
                cardId: check.shownCardId
              }
            },
            data: {
              status: 'HAS',
              observation: 'Mostrou na sugestão'
            }
          })
        }
      }

      return await tx.suggestion.findUnique({
        where: { id: suggestion.id },
        include: { checks: { select: { playerId: true, responded: true, shownCardId: true } } }
      })
    })

    await this.propagateCardLimits(gameId)
    await this.updateTheory(gameId)
    await this.processSuggestions(gameId)

    return createdSuggestion
  }

  private async propagateCardLimits(gameId: string) {
    const players = await prisma.player.findMany({ where: { gameId } })

    for (const player of players) {
      const hasCount = await prisma.cardNote.count({
        where: { playerId: player.id, status: 'HAS' }
      })

      if (hasCount >= player.cardCount) {
        await prisma.cardNote.updateMany({
          where: { playerId: player.id, status: 'UNKNOWN' },
          data: { status: 'DOES_NOT_HAVE' }
        })
      }
    }
  }

  private async updateTheory(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true, notes: true, theory: true }
    })

    if (!game || !game.theory) return

    let suspectCardId: string | null = null
    let weaponCardId: string | null = null
    let roomCardId: string | null = null

    for (const card of cards) {
      const notes = game.notes.filter(note => note.cardId === card.id)

      const allPlayersDoNotHave =
        notes.length > 0 &&
        notes.every(note => note.status === 'DOES_NOT_HAVE')

      if (!allPlayersDoNotHave) continue

      if (card.type === 'SUSPECT') suspectCardId = card.id
      if (card.type === 'WEAPON') weaponCardId = card.id
      if (card.type === 'ROOM') roomCardId = card.id
    }

    await prisma.theory.update({
      where: { gameId },
      data: { suspectCardId, weaponCardId, roomCardId }
    })
  }

  private async processSuggestions(gameId: string) {
    const suggestions = await prisma.suggestion.findMany({
      where: { gameId },
      include: { checks: true }
    })

    for (const suggestion of suggestions) {
      const responderCheck = suggestion.checks.find(c => c.responded)
      if (!responderCheck) continue

      const candidateCards = [
        suggestion.suspectCardId,
        suggestion.weaponCardId,
        suggestion.roomCardId
      ]

      const possibleCards: string[] = []

      for (const cardId of candidateCards) {
        const note = await prisma.cardNote.findFirst({
          where: { gameId, playerId: responderCheck.playerId, cardId }
        })

        if (!note || note.status !== 'DOES_NOT_HAVE') {
          possibleCards.push(cardId)
        }
      }

      if (possibleCards.length === 1) {
        const inferredCardId = possibleCards[0]

        const existingNote = await prisma.cardNote.findFirst({
          where: { gameId, playerId: responderCheck.playerId, cardId: inferredCardId }
        })

        if (!existingNote || existingNote.status === 'HAS') continue

        await prisma.cardNote.update({
          where: { id: existingNote.id },
          data: {
            status: 'HAS',
            observation: 'Inferido automaticamente por sugestão'
          }
        })

        await prisma.cardNote.updateMany({
          where: {
            gameId,
            cardId: inferredCardId,
            NOT: { playerId: responderCheck.playerId }
          },
          data: { status: 'DOES_NOT_HAVE' }
        })
      }
    }
  }
}