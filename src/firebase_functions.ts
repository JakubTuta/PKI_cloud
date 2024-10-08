import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/firestore'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { auth, firestore } from './firebase'
import type { MatchModel } from './models/match'
import { mapMatch } from './models/match'
import type { TeamModel } from './models/team'
import { mapTeam } from './models/team'
import { UserData, mapUserData } from './userData'

export const user = ref<User | null>(null)
export const userData = ref<UserData | null>(null)

export const matches = ref<MatchModel[]>([])
const unsubscribeMatches = ref<Unsubscribe | null>(null)

export const match = ref<MatchModel | null>(null)
const unsubscribeMatch = ref<Unsubscribe | null>(null)

const collectionMatches = collection(firestore, 'matches')
const collectionTeams = collection(firestore, 'teams')
const collectionUsers = collection(firestore, 'users')

function reset() {
  user.value = null
  userData.value = null
}

onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    user.value = currentUser

    getUserData(currentUser)
  }

  else if (user.value && !currentUser) {
    reset()
  }
})

async function getUserData(currentUser: User) {
  const q = query(collectionUsers, where('email', '==', currentUser.email))

  try {
    const docs = await getDocs(q)

    if (docs.empty)
      createUser(currentUser)
    else
      userData.value = mapUserData(docs.docs[0])
  }
  catch (error) {
    console.error(error)
  }
}

async function createUser(currentUser: User) {
  user.value = currentUser

  try {
    const model = new UserData({ email: currentUser.email || '', role: 'user' }, null)
    const ref = await addDoc(collectionUsers, model.toMap())

    model.reference = ref
    userData.value = model
  }
  catch (error) {
    console.error(error)
  }
}

export function loginGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: 'select_account',
  })

  const onError = (error: any) => {
    console.error(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

export function loginFacebook() {
  const provider = new FacebookAuthProvider()
  provider.setCustomParameters({
    prompt: 'select_account',
  })

  const onError = (error: any) => {
    console.error(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

export function loginGithub() {
  const provider = new GithubAuthProvider()
  provider.setCustomParameters({
    prompt: 'select_account',
  })

  const onError = (error: any) => {
    console.error(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

export function logout() {
  const onSuccess = () => {
    user.value = null
  }

  const onError = (error: any) => {
    console.error(error)
  }

  signOut(auth)
    .then(onSuccess)
    .catch(onError)
}

export function getMatches() {
  const matchesQuery = query(collectionMatches, orderBy('date', 'desc'))

  if (unsubscribeMatches.value)
    unsubscribeMatches.value()

  const onSuccess = (snapshot: any) => {
    matches.value = snapshot.docs.map(mapMatch)

    const matchesToFinish: MatchModel[] = []
    const matchesToInProgress: MatchModel[] = []
    const matchesToPlanned: MatchModel[] = []

    matches.value.forEach((match) => {
      const now = new Date()
      const nowMinusTwoHours = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const nowPlusTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)

      if (match.date.toDate() < nowMinusTwoHours && match.status !== 'finished')
        matchesToFinish.push(match)
      else if (match.date.toDate() > nowMinusTwoHours && match.date.toDate() < now && match.status !== 'in-progress')
        matchesToInProgress.push(match)
      else if (match.date.toDate() > nowPlusTwoHours && match.status !== 'planned')
        matchesToPlanned.push(match)
    })

    matchesToFinish.forEach(match => updateMatchStatus(match, 'finished'))
    matchesToInProgress.forEach(match => updateMatchStatus(match, 'in-progress'))
    matchesToPlanned.forEach(match => updateMatchStatus(match, 'planned'))
  }

  const onError = (error: any) => {
    console.error(error)
  }

  unsubscribeMatches.value = onSnapshot(matchesQuery, onSuccess, onError)

  // try {
  //   const docs = await getDocs(matchesQuery)

  //   const matches = docs.docs.map(mapMatch)

  //   return matches
  // }
  // catch (error) {
  //   console.error(error)

  //   return []
  // }
}

export function getMatch(id: string) {
  if (!id) {
    match.value = null

    return
  }

  if (unsubscribeMatch.value)
    unsubscribeMatch.value()

  const onSuccess = (snapshot: any) => {
    match.value = mapMatch(snapshot)

    const now = new Date()
    const nowPlusTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const nowMinusTwoHours = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    if (match.value.date.toDate() < nowMinusTwoHours && match.value.status !== 'finished')
      updateMatchStatus(match.value, 'finished')
    else if (match.value.date.toDate() > nowMinusTwoHours && match.value.date.toDate() < now && match.value.status !== 'in-progress')
      updateMatchStatus(match.value, 'in-progress')
    else if (match.value.date.toDate() > nowPlusTwoHours && match.value.status !== 'planned')
      updateMatchStatus(match.value, 'planned')
  }

  const onError = (error: any) => {
    console.error(error)
  }

  unsubscribeMatch.value = onSnapshot(doc(collectionMatches, id), onSuccess, onError)
  // try {
  //   const response = await getDoc(doc(collectionMatches, id))

  //   return mapMatch(response)
  // }
  // catch (error) {
  //   console.error(error)

  //   return null
  // }
}

export async function getTeams() {
  const teamsQuery = query(collectionTeams)

  try {
    const docs = await getDocs(teamsQuery)

    const teams = docs.docs.map(mapTeam)

    return teams
  }
  catch (error) {
    console.error(error)

    return []
  }
}

export function deleteMatch(match: MatchModel) {
  if (!match.reference)
    return

  try {
    deleteDoc(match.reference)
  }
  catch (error) {
    console.error(error)
  }
}

export function deleteTeam(team: TeamModel) {
  if (!team.reference)
    return

  try {
    deleteDoc(team.reference)
  }
  catch (error) {
    console.error(error)
  }
}

export function createMatch(match: MatchModel) {
  try {
    addDoc(collectionMatches, match.toMap())
    // const ref = await addDoc(collectionMatches, match.toMap())
    // match.reference = ref

    // return match
  }
  catch (error) {
    console.error(error)

    return match
  }
}

export async function createTeam(team: TeamModel) {
  try {
    const ref = await addDoc(collectionTeams, team.toMap())
    team.reference = ref

    return team
  }
  catch (error) {
    console.error(error)

    return null
  }
}

export function updateTeam(team: TeamModel) {
  if (!team.reference)
    return

  try {
    updateDoc(team.reference, team.toMap())
  }
  catch (error) {
    console.error(error)
  }
}

export function updateMatchStatus(match: MatchModel, status: string) {
  if (!match.reference)
    return

  try {
    updateDoc(match.reference, { status })
  }
  catch (error) {
    console.error(error)
  }
}

export function updateMatchPoints(newSets: string, newPoints: string[]) {
  if (!match.value?.reference)
    return

  try {
    match.value.result = newSets
    match.value.resultDetailed = { resD: newPoints, timeout: [] }
    updateDoc(match.value.reference, { result: newSets, resultDetailed: { resD: newPoints } })
  }
  catch (error) {
    console.error(error)
  }
}
