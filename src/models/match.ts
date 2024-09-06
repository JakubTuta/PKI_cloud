import type { DocumentData, DocumentReference } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'

export type TStatus = 'planned' | 'in-progress' | 'finished'

export interface IMatch {
  date: Timestamp
  teamA: DocumentReference
  teamB: DocumentReference
  result: string
  status: TStatus
  resultDetailed: {
    resD: string[]
    timeout: string[]
  }
  matchSettings: {
    sets: number
    pointsToWinSet: number
    isLastTiebreak: boolean
    pointsToWinTiebreak: number
  }
}

export class MatchModel implements IMatch {
  date: Timestamp
  teamA: DocumentReference
  teamB: DocumentReference
  result: string
  status: TStatus
  resultDetailed: {
    resD: string[]
    timeout: string[]
  }

  matchSettings: {
    sets: number
    pointsToWinSet: number
    isLastTiebreak: boolean
    pointsToWinTiebreak: number
  }

  reference: DocumentReference | null

  constructor(match: IMatch, reference: DocumentReference | null) {
    this.date = match.date || Timestamp.now()
    this.teamA = match.teamA || null
    this.teamB = match.teamB || null
    this.result = match.result || ''
    this.resultDetailed = match.resultDetailed || { resD: [], timeout: [] }
    this.status = match.status || 'planned'
    this.matchSettings = match.matchSettings || {
      sets: 3,
      pointsToWinSet: 25,
      isLastTiebreak: true,
      pointsToWinTiebreak: 15,
    }

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
      matchSettings: this.matchSettings,
    }
  }
}

export function mapMatch(match: DocumentData) {
  return new MatchModel(match.data() as IMatch, match.ref)
}
