import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore"

export type TStatus = "planned" | "in-progress" | "finished"

export interface IMatch {
    id: string
    date: Date | Timestamp
    teamA: DocumentReference
    teamB: DocumentReference
    result: string
    resultDetailed: {
        resD: string[],
        timeout: string[]
    }
    timestamp: Date | Timestamp
    status: TStatus
}

export class MatchModel implements IMatch {
    id: string
    date: Date | Timestamp
    teamA: DocumentReference
    teamB: DocumentReference
    result: string
    resultDetailed: {
        resD: string[],
        timeout: string[]
    }
    timestamp: Date | Timestamp
    status: TStatus

    reference: DocumentReference

    constructor(match: IMatch, reference: DocumentReference) {
        this.id = match.id
        this.date = match.date
        this.teamA = match.teamA
        this.teamB = match.teamB
        this.result = match.result
        this.resultDetailed = match.resultDetailed
        this.timestamp = match.timestamp
        this.status = match.status

        this.reference = reference
    }

    toMap() {
        return {
            id: this.id,
            date: this.date,
            teamA: this.teamA,
            teamB: this.teamB,
            result: this.result,
            resultDetailed: this.resultDetailed,
            timestamp: this.timestamp,
            status: this.status
        }
    }
}

export function createMatch(match: DocumentData) {
    return new MatchModel(match.data() as IMatch, match.ref)
}