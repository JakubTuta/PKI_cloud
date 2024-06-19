import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { auth, firestore } from './firebase'
import type { IMatch } from './models/match'
import { createMatch } from './models/match'
import type { ITeam } from './models/team'
import { createTeam } from './models/team'

export const user = ref<User | null>(null)
export const matches = ref<IMatch[]>([])
export const teams = ref<ITeam[]>([])

const collectionMatches = collection(firestore, 'matches')

function setValues(currentUser: User) {
  user.value = currentUser
  getMatches()
  getTeams()
}

function reset() {
  user.value = null
  matches.value = []
  teams.value = []
}

onAuthStateChanged(auth, (currentUser) => {
  if (currentUser)
    setValues(currentUser)

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

async function getMatches() {
  const matchesQuery = query(collectionMatches, orderBy('date', 'desc'))

  try {
    const docs = await getDocs(matchesQuery)

    matches.value = docs.docs.map(createMatch)
  }
  catch (error) {
    console.error(error)

    matches.value = []
  }
}

async function getTeams() {
  const teamsQuery = query(collectionMatches, orderBy('date', 'desc'))

  try {
    const docs = await getDocs(teamsQuery)

    teams.value = docs.docs.map(createTeam)
  }
  catch (error) {
    console.error(error)

    teams.value = []
  }
}
