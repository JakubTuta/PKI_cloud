import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { auth, firestore } from './firebase'
import { createMatch } from './models/match'
import { createTeam } from './models/team'

export const user = ref<User | null>(null)

const collectionMatches = collection(firestore, 'matches')

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

    const matches = docs.docs.map(createMatch)

    return matches
  }
  catch (error) {
    console.error(error)

    return []
  }
}

export async function getTeams() {
  const teamsQuery = query(collectionMatches, orderBy('date', 'desc'))

  try {
    const docs = await getDocs(teamsQuery)

    const teams = docs.docs.map(createTeam)

    return teams
  }
  catch (error) {
    console.error(error)

    return []
  }
}
