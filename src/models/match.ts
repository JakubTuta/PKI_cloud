import type { DocumentData, DocumentReference, Timestamp } from 'firebase/firestore'

export type TStatus = 'planned' | 'in-progress' | 'finished'

export interface IMatch {
  date: Timestamp
  teamA: DocumentReference
  teamB: DocumentReference
  result: string
  resultDetailed: {
    resD: string[]
    timeout: string[]
  }
  status: TStatus
}

export class MatchModel implements IMatch {
  date: Timestamp
  teamA: DocumentReference
  teamB: DocumentReference
  result: string
  resultDetailed: {
    resD: string[]
    timeout: string[]
  }

  status: TStatus

  reference: DocumentReference

  constructor(match: IMatch, reference: DocumentReference) {
    this.date = match.date
    this.teamA = match.teamA
    this.teamB = match.teamB
    this.result = match.result
    this.resultDetailed = match.resultDetailed
    this.status = match.status

    this.reference = reference
  }

  toMap() {
    return {
      date: this.date,
      teamA: this.teamA,
      teamB: this.teamB,
      result: this.result,
      resultDetailed: this.resultDetailed,
      status: this.status,
    }
  }
}

export function createMatch(match: DocumentData) {
  return new MatchModel(match.data() as IMatch, match.ref)
}
