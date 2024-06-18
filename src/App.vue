<script setup lang="ts">
import { ref } from 'vue'
import { auth } from './firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, FacebookAuthProvider, GithubAuthProvider, User } from 'firebase/auth'

const user = ref<User | null>(null)

function loginGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onError = (error: any) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

function loginFacebook() {
  const provider = new FacebookAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onError = (error: any) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

function loginGithub() {
  const provider = new GithubAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onError = (error: any) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).catch(onError)
}

function logout() {
  const onSuccess = () => {
    user.value = null
  }

  const onError = (error: any) => {
    console.log(error)
  }

  signOut(auth)
    .then(onSuccess)
    .catch(onError)
}


onAuthStateChanged(auth, async currentUser => {
  if (currentUser) {
    user.value = currentUser
  }
  else if (user.value && !currentUser) {
    user.value = null
  }
})
</script>

<template>
</template>