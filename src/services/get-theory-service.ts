import { prisma } from '../lib/prisma'
import { cards } from '../constants/cards'

export class GetTheoryService {

  async execute(gameId: string) {

    const theory = await prisma.theory.findUnique({
      where: {
        gameId
      }
    })

    if (!theory) {
      throw new Error('Theory not found')
    }

    const suspect = cards.find(
      card => card.id === theory.suspectCardId
    )

    const weapon = cards.find(
      card => card.id === theory.weaponCardId
    )

    const room = cards.find(
      card => card.id === theory.roomCardId
    )

    return {
      suspect: suspect
        ? {
            id: suspect.id,
            name: suspect.name
          }
        : null,

      weapon: weapon
        ? {
            id: weapon.id,
            name: weapon.name
          }
        : null,

      room: room
        ? {
            id: room.id,
            name: room.name
          }
        : null
    }
  }
}