<script setup>
import { ref } from 'vue'
import { auth, firestore } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { collection, getDocs } from "firebase/firestore"

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

async function getAllUsers() {
  const querySnapshot = await getDocs(collection(firestore, "users"))

  users.value = querySnapshot.docs.map(user => user.data())
}

onAuthStateChanged(auth, currentUser => {
  if (currentUser) {
    console.log("logged in")
    user.value = currentUser

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