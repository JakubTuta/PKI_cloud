import type { DocumentData, DocumentReference } from 'firebase/firestore'

export interface ITeam {
  name: string
  players: string[]
}

export class TeamModel implements ITeam {
  name: string
  players: string[]

  reference: DocumentReference | null

  constructor(data: ITeam, reference: DocumentReference | null) {
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

export function mapTeam(team: DocumentData) {
  return new TeamModel(team.data() as ITeam, team.ref)
}
