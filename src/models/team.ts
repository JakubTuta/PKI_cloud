import type { DocumentData, DocumentReference } from 'firebase/firestore'

export interface ITeam {
  name: string
  players: string[]
}

export class TeamModel implements ITeam {
  name: string
  players: string[]

  reference: DocumentReference

  constructor(data: ITeam, reference: DocumentReference) {
    this.name = data.name
    this.players = data.players

    this.reference = reference
  }

  toMap() {
    return {
      name: this.name,
      players: this.players,
    }
  }
}

export function createTeam(team: DocumentData) {
  return new TeamModel(team.data() as ITeam, team.ref)
}
