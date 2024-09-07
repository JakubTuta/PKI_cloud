import type { DocumentData, DocumentReference } from 'firebase/firestore'

export interface IUserData {
  email: string
  role: 'admin' | 'user'
}

export class UserData implements IUserData {
  email: string
  role: 'admin' | 'user'

  reference: DocumentReference | null

  constructor(data: IUserData, reference: DocumentReference | null) {
    this.email = data.email
    this.role = data.role
    this.reference = reference
  }

  toMap() {
    return {
      email: this.email,
      role: this.role,
    }
  }
}

export function mapUserData(doc: DocumentData) {
  return new UserData(doc.data() as IUserData, doc.ref)
}
