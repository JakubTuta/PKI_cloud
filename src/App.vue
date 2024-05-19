<script setup>
import { ref } from 'vue'
import { auth } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth'

const user = ref(null)

function login() {
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

onAuthStateChanged(auth, currentUser => {
  if (currentUser) {
    console.log("logged in")
    user.value = currentUser
  }
  else if (user.value && !currentUser) {
    console.log("logged out")
    user.value = null
  }
})
</script>

<template>
  Hello world

  <br>

  <button v-if="!user" @click="login">
    Zaloguj się za pomocą Google
  </button>

  <button v-if="user" @click="logout">
    Wyloguj się
  </button>

  <br>

  <span v-if="user">
    {{ user.displayName }}
  </span>
</template>