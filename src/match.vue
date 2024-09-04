<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMatch, getTeams } from './firebase_functions'
import type { MatchModel } from './models/match'
import router from './router'
import { TeamModel } from './models/team'

const route = useRoute()

const match = ref<MatchModel | null>(null)
const teams = ref<TeamModel[]>([])

onMounted(async () => {
  const docId = String(route.params.id)

  match.value = await getMatch(docId)
  teams.value = await getTeams()
})

function findTeam(teamId: string) {
  return teams.value.find(team => team.reference.id === teamId) || null
}
</script>

<template>
  <v-container>
    <v-btn @click="router.go(-1)" class="my-3">
      Powrót
    </v-btn>

    <v-card>
      <v-card-title>
        {{ `${findTeam(match?.teamA.id || '')?.name || ''} vs ${findTeam(match?.teamB.id || '')?.name || ''}` }}
      </v-card-title>
    </v-card>
  </v-container>
</template>
