<script setup>
import { ref } from 'vue'
import { auth, firestore } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { collection, getDocs, query, where, updateDoc, addDoc } from "firebase/firestore"

const user = ref(null)
const users = ref([])

function loginGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onSuccess = (response) => {
    console.log(response)
  }

  const onError = (error) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).then(onSuccess).catch(onError)
}

function loginFacebook() {
  const provider = new FacebookAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onSuccess = (response) => {
    console.log(response)
  }

  const onError = (error) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).then(onSuccess).catch(onError)
}

function loginGithub() {
  const provider = new GithubAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onSuccess = (response) => {
    console.log(response)
  }

  const onError = (error) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).then(onSuccess).catch(onError)
}

function logout() {
  const onSuccess = () => {
    user.value = null
  }

  const onError = (error) => {
    console.log(error)
  }

  signOut(auth)
    .then(onSuccess)
    .catch(onError)
}

async function checkIfUserExists() {
  const userId = user.value?.uid || ''

  const querySnapshot = await getDocs(query(collection(firestore, "users"), where('id', '==', userId)))

  if (querySnapshot.docs.length > 0)
    return querySnapshot.docs.map(user => {
      return {
        ref: user.ref,
        ...user.data()
      }
    })[0]

  return null
}

async function increaseCounter(dbUser) {
  console.log(dbUser)
  await updateDoc(dbUser.ref, {
    counter: dbUser.counter + 1,
    lastVisit: new Date()
  })
}

async function addUserToDatabase() {
  await addDoc(collection(firestore, "users"), {
    id: user.value?.uid || '',
    name: user.value?.displayName || '',
    joined: new Date(),
    lastVisit: new Date(),
    counter: 1,
  })
}

async function getAllUsers() {
  const querySnapshot = await getDocs(collection(firestore, "users"))

  users.value = querySnapshot.docs.map(user => {
    return {
      ref: user.ref,
      ...user.data()
    }
  })
}

onAuthStateChanged(auth, async currentUser => {
  if (currentUser) {
    console.log("logged in")
    user.value = currentUser

    const dbUser = await checkIfUserExists()

    if (dbUser) {
      await increaseCounter(dbUser)
    }
    else {
      await addUserToDatabase()
    }

    getAllUsers()
  }
  else if (user.value && !currentUser) {
    console.log("logged out")
    user.value = null
  }
})

function mapTimestamp(data) {
  return new Date(data.toDate())
}
</script>

<template>
  Hello world

  <br>

  <div v-if="!user">
    <button @click="loginGoogle">
      Zaloguj się za pomocą Google
    </button>

    <br>

    <button v-if="!user" @click="loginFacebook">
      Zaloguj się za pomocą Facebooka
    </button>

    <br>

    <button v-if="!user" @click="loginGithub">
      Zaloguj się za pomocą Githuba
    </button>
  </div>

  <button v-if="user" @click="logout">
    Wyloguj się
  </button>

  <br>

  <span v-if="user">
    {{ user.displayName }}
  </span>

  <br>

  <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Joined</th>
          <th>Last Visit</th>
          <th>Counter</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in users" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ mapTimestamp(item.joined) }}</td>
          <td>{{ mapTimestamp(item.lastVisit) }}</td>
          <td>{{ item.counter }}</td>
        </tr>
      </tbody>
    </table>
</template>