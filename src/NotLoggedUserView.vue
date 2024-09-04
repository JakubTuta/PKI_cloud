<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMatches, getTeams } from './firebase_functions'
import type { MatchModel } from './models/match'
import { TeamModel } from './models/team';
import router from './router';

const matches = ref<MatchModel[]>([])
const teams = ref<TeamModel[]>([])
const selectedStatus = ref<string | null>(null)

const statuses = [
  {
    title: 'Zaplanowane',
    value: 'planned',
  },
  {
    title: 'Trwające',
    value: 'in-progress',
  },
  {
    title: 'Zakończone',
    value: 'finished',
  },
]

onMounted(async () => {
  matches.value = await getMatches()
  teams.value = await getTeams()
})

const currentMatches = computed(() => {
  if (!selectedStatus.value)
    return matches.value

  return matches.value.filter(match => match.status === selectedStatus.value)
})

function findTeam(teamId: string) {
  return teams.value.find(team => team.reference.id === teamId) || null
}

function goToMatch(match: MatchModel) {
  router.push(`/match/${match.reference.id}`)
}
</script>

<template>
  <v-select
    v-model="selectedStatus"
    :items="statuses"
    label="Status"
    clearable
  />

  <v-list variant="outlined">
    <v-list-item v-for="match in currentMatches" :key="match.reference.id" class="my-2" @click="goToMatch(match)">
      {{ `${findTeam(match.teamA.id)?.name} vs ${findTeam(match.teamB.id)?.name}` }}
    </v-list-item>
  </v-list>
</template>
