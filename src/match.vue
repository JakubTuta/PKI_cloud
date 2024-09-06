<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mdiSwapHorizontal } from '@mdi/js'
import { getMatch, getTeams } from './firebase_functions'
import type { MatchModel } from './models/match'
import router from './router'
import type { TeamModel } from './models/team'

const route = useRoute()

const match = ref<MatchModel | null>(null)
const teams = ref<TeamModel[]>([])
const team1 = ref<TeamModel | null>(null)
const team2 = ref<TeamModel | null>(null)

onMounted(async () => {
  const docId = String(route.params.id)

  match.value = await getMatch(docId)
  teams.value = await getTeams()
})

watch(match, (newMatch) => {
  if (!newMatch)
    return

  team1.value = findTeam(newMatch.teamA?.id || '')
  team2.value = findTeam(newMatch.teamB?.id || '')
}, { immediate: true })

watch(teams, (newTeams) => {
  if (!newTeams.length)
    return

  team1.value = findTeam(match.value?.teamA?.id || '')
  team2.value = findTeam(match.value?.teamB?.id || '')
}, { immediate: true })

const setsTeam1 = computed(() => {
  if (!team1.value || !match.value)
    return 0

  const team1Sets = match.value.result.split(':')[0]

  return team1Sets
})

const setsTeam2 = computed(() => {
  if (!team2.value || !match.value)
    return 0

  const team2Sets = match.value.result.split(':')[1]

  return team2Sets
})

function findTeam(teamId: string) {
  return teams.value.find(team => team.reference?.id === teamId) || null
}
</script>

<template>
  <v-container>
    <v-btn
      class="my-3"
      @click="router.push('/')"
    >
      Powrót
    </v-btn>

    <v-card v-if="!match || !findTeam(match.teamA?.id || '') || !findTeam(match.teamB?.id || '')">
      <v-card-title>
        Nie znaleziono meczu
      </v-card-title>
    </v-card>

    <v-card v-else>
      <v-card-title>
        <span class="mr-6">
          {{ team1?.name || '' }}
        </span>

        {{ setsTeam1 }}

        <v-icon
          :icon="mdiSwapHorizontal"
          class="mx-6"
        />

        {{ setsTeam2 }}

        <span class="ml-6">
          {{ team2?.name || '' }}
        </span>
      </v-card-title>
    </v-card>
  </v-container>
</template>
