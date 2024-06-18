<script setup lang="ts">
import { ref } from 'vue'
import { auth, firestore } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { collection, getDocs, query, where, updateDoc, addDoc } from "firebase/firestore"

const user = ref(null)
const users = ref([])
const isShowPopup = ref(false)
const popupText = ref('')

function loginGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account"
  })

  const onSuccess = () => {
    showPopup("Udało się zalogować")
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

  const onSuccess = () => {
    showPopup("Udało się zalogować")
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

  const onSuccess = () => {
    showPopup("Udało się zalogować")
  }

  const onError = (error) => {
    console.log(error)
  }

  signInWithPopup(auth, provider).then(onSuccess).catch(onError)
}

function logout() {
  const onSuccess = () => {
    user.value = null

    showPopup("Wylogowano się")
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
    user.value = null
  }
})

function mapTimestamp(data) {
  const date = data.toDate()

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function showPopup(text) {
  isShowPopup.value = true
  popupText.value = text

  setTimeout(() => {
    closePopup()
  }, 3 * 1000)
}

function closePopup() {
  isShowPopup.value = false
  popupText.value = ''
}
</script>

<template>
  <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-left" v-if="user">
          <span class="navbar-item">Username: {{ user.displayName }}</span>
        </div>

        <div class="navbar-right">
          <button v-if="user" class="navbar-item" @click="logout">Wyloguj się</button>
          
          <div v-else>
            <button class="navbar-item" @click="loginGoogle">Zaloguj się za pomocą Google</button>
            <button class="navbar-item" @click="loginFacebook">Zaloguj się za pomocą Facebooka</button>
            <button class="navbar-item" @click="loginGithub">Zaloguj się za pomocą Githuba</button>
          </div>
        </div>
      </div>
    </nav>

  <div class="content" v-if="user">
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
  </div>

  <div v-if="isShowPopup" class="popup-overlay">
    <div class="popup-content">
      <button @click="closePopup" class="close-button">×</button>
      <div class="popup-text">{{ popupText }}</div>
    </div>
  </div>
</template>

<style scoped>
body, html, #app {
  margin: 0;
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #000;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.content {
  padding-top: 60px;
}

.navbar {
  background-color: #333;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: 30px;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  width: 95%;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.navbar-item {
  color: #fff;
  margin: 0 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.navbar-item:hover {
  background-color: #575757;
}

.popup-overlay {
  position: fixed;
  left: 0;
  width: 100%;
  height: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.popup-content {
  background-color: #fff;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.close-button {
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #888;
}

.popup-text {
  margin-top: auto;
  padding-top: 20px;
  text-align: center;
}
</style>