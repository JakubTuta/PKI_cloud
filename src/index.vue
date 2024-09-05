<script setup lang="ts">
import { loginFacebook, loginGithub, loginGoogle, logout, user } from './firebase_functions'
import LoggedUserView from './LoggedUserView.vue'
import NotLoggedUserView from './NotLoggedUserView.vue'
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title class="mb-5">
        <v-row>
          <v-col cols="4">
            <v-btn
              v-if="!user"
              block
              @click="loginGoogle"
            >
              Logowanie Google
            </v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn
              v-if="!user"
              block
              @click="loginFacebook"
            >
              Logowanie Facebook
            </v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn
              v-if="!user"
              block
              @click="loginGithub"
            >
              Logowanie Github
            </v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn
              v-if="user"
              @click="logout"
            >
              Wyloguj się
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <LoggedUserView v-if="user" />

        <NotLoggedUserView v-else />
      </v-card-text>
    </v-card>
  </v-container>
</template>
