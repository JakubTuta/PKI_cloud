import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { auth, firestore } from './firebase'
import type { MatchModel } from './models/match'
import { mapMatch } from './models/match'
import type { TeamModel } from './models/team'
import { mapTeam } from './models/team'

export const user = ref<User | null>(null)

const collectionMatches = collection(firestore, 'matches')
const collectionTeams = collection(firestore, 'teams')

function reset() {
  user.value = null
}

onAuthStateChanged(auth, (currentUser) => {
  if (currentUser)
    user.value = currentUser

  else if (user.value && !currentUser)
    reset()
})

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

export async function getMatches() {
  const matchesQuery = query(collectionMatches, orderBy('date', 'desc'))

  try {
    const docs = await getDocs(matchesQuery)

    const matches = docs.docs.map(mapMatch)

    return matches
  }
  catch (error) {
    console.error(error)

    return []
  }
}

export async function getMatch(id: string) {
  try {
    const response = await getDoc(doc(collectionMatches, id))

    return mapMatch(response)
  }
  catch (error) {
    console.error(error)

    return null
  }
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

export async function createMatch(match: MatchModel) {
  try {
    const ref = await addDoc(collectionMatches, match.toMap())
    match.reference = ref

    return match
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
