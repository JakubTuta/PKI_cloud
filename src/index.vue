<script setup lang="ts">
import { loginFacebook, loginGithub, loginGoogle, logout, user } from './firebase_functions'
import LoggedUserView from './LoggedUserView.vue'
import NotLoggedUserView from './NotLoggedUserView.vue'
</script>

<template>
    <v-container>
        <v-card>
          <v-card-title class="mb-5">
            <v-btn
              v-if="!user"
              @click="loginGoogle"
            >
              Logowanie Google
            </v-btn>

            <v-btn
              v-if="!user"
              @click="loginFacebook"
            >
              Logowanie Facebook
            </v-btn>

            <v-btn
              v-if="!user"
              @click="loginGithub"
            >
              Logowanie Github
            </v-btn>

            <v-btn
              v-if="user"
              @click="logout"
            >
              Wyloguj się
            </v-btn>
          </v-card-title>

          <v-card-text>
            <LoggedUserView v-if="user" />

            <NotLoggedUserView v-else />
          </v-card-text>
        </v-card>
      </v-container>
</template>