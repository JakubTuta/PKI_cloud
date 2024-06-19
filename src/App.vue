<script setup lang="ts">
import { loginFacebook, loginGithub, loginGoogle, logout, user } from './firebase_functions'
import LoggedUserView from './LoggedUserView.vue'
import NotLoggedUserView from './NotLoggedUserView.vue'
</script>

<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card>
          <v-card-title class="mb-5">
            <v-btn
              v-if="!user"
              @click="loginGoogle"
            >
              Login with Google
            </v-btn>

            <v-btn
              v-if="!user"
              @click="loginFacebook"
            >
              Login with Facebook
            </v-btn>

            <v-btn
              v-if="!user"
              @click="loginGithub"
            >
              Login with Github
            </v-btn>

            <v-btn
              v-if="user"
              @click="logout"
            >
              Logout
            </v-btn>
          </v-card-title>

          <v-card-text>
            <LoggedUserView v-if="user" />

            <NotLoggedUserView v-else />
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
