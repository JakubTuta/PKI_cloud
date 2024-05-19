<script setup>
import { ref } from 'vue'
import { auth } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'

const user = ref(null)

function login() {
  const provider = new GoogleAuthProvider()

  const onSuccess = (response) => {
    console.log(response)
  }

  const onError = (error) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).then(onSuccess).catch(onError)
}

onAuthStateChanged(auth, currentUser => {
  if (currentUser) {
    console.log("logged in")
    user.value = currentUser
  }
  else {
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
</template>