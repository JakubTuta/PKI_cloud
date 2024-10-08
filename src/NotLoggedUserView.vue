<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Timestamp } from 'firebase/firestore'
import { mdiContentCopy, mdiDelete, mdiListBoxOutline } from '@mdi/js'
import {
  createMatch as firebaseCreateMatch,
  createTeam as firebaseCreateTeam,
  deleteMatch as firebaseDeleteMatch,
  deleteTeam as firebaseDeleteTeam,
  updateTeam as firebaseUpdateTeam,
  getMatches,
  getTeams,
  matches,
  userData,
} from './firebase_functions'
import type { MatchModel } from './models/match'
import type { TeamModel } from './models/team'
import router from './router'
import CreateMatch from './CreateMatch.vue'
import CreateTeam from './CreateTeam.vue'
import Players from './Players.vue'

const teams = ref<TeamModel[]>([])
const selectedStatus = ref<string | null>(null)
const isShowCreateMatchDialog = ref(false)
const isShowCreateTeamDialog = ref(false)
const selectedTab = ref('Mecze')
const teamToEdit = ref<TeamModel | null>(null)
const isShowPlayersDialog = ref(false)

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

const tabs = ['Mecze', 'Drużyny']

onMounted(async () => {
  getMatches()
  teams.value = await getTeams()
})

const isAdmin = computed(() => userData.value?.role === 'admin')

const currentMatches = computed(() => {
  if (!selectedStatus.value)

    return matches.value.sort((a, b) => b.date.seconds - a.date.seconds)

  return matches.value.filter(match => match.status === selectedStatus.value).sort((a, b) => b.date.seconds - a.date.seconds)
})

function findTeam(teamId: string) {
  return teams.value.find(team => team.reference?.id === teamId) || null
}

function goToMatch(match: MatchModel) {
  router.push(`/match/${match.reference?.id || ''}`)
}

function formatDate(date: Timestamp) {
  const dateObj = date.toDate()

  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()

  const hour = String(dateObj.getHours()).padStart(2, '0')
  const minute = String(dateObj.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hour}:${minute}`
}

function formatStatus(status: string) {
  switch (status) {
    case 'planned':
      return 'Zaplanowany'
    case 'in-progress':
      return 'Trwający'
    case 'finished':
      return 'Zakończony'
    default:
      return 'Nieznany'
  }
}

function formatResult(match: MatchModel) {
  const [pointsA, pointsB] = match.result.split(':')

  if (match.status === 'planned')
    return 'Mecz jeszcze się nie odbył'

  else if (match.status === 'in-progress')
    return `Mecz trwa ${pointsA}:${pointsB}`

  if (pointsA > pointsB)
    return `Zwycięstwo ${findTeam(match.teamA.id)?.name} ${pointsA}:${pointsB}`
  else if (pointsA < pointsB)
    return `Zwycięstwo ${findTeam(match.teamB.id)?.name} ${pointsB}:${pointsA}`
  else
    return `Mecz jeszcze trwa ${pointsA}:${pointsB}`
}

function getPoints(match: MatchModel) {
  const setsA = match.resultDetailed.resD.map(set => Number.parseInt(set.split(':')[0]))
  const setsB = match.resultDetailed.resD.map(set => Number.parseInt(set.split(':')[1]))

  const timeoutPointsA = match.resultDetailed.timeout.map(set => Number.parseInt(set.split(':')[0]))
  const timeoutPointsB = match.resultDetailed.timeout.map(set => Number.parseInt(set.split(':')[1]))

  const combinedPointsA = setsA.map((set, index) => String(set + timeoutPointsA[index]).padStart(2, '0'))
  const combinedPointsB = setsB.map((set, index) => String(set + timeoutPointsB[index]).padStart(2, '0'))

  return [combinedPointsA, combinedPointsB]
}

function fillShorterName(name: string, length: number) {
  return name + ' '.repeat(length - name.length)
}

function createHeader(match: MatchModel, emptySpace: string) {
  const [resultA, resultB] = match.result.split(':')
  const sets = Number.parseInt(resultA) + Number.parseInt(resultB)

  let setHeader = ''
  for (let i = 0; i < sets; i++)
    setHeader += ` S${i + 1} |`

  const header = `${emptySpace}\t${setHeader} Razem`

  return header
}

function copyMatch(match: MatchModel) {
  const teamA = findTeam(match.teamA.id) || null
  const teamB = findTeam(match.teamB.id) || null

  if (!teamA || !teamB)
    return

  const [pointsA, pointsB] = getPoints(match)
  const [setsA, setsB] = match.result.split(':')

  let teamAName = teamA.name
  let teamBName = teamB.name
  if (teamA.name.length > teamB.name.length)
    teamBName = fillShorterName(teamB.name, teamA.name.length)
  else
    teamAName = fillShorterName(teamA.name, teamB.name.length)

  const emptySpace = ' '.repeat(teamAName.length)

  const header = createHeader(match, emptySpace)

  const matchData = `${header}\n${teamAName}\t ${pointsA.join(' | ')} | ${setsA}\n${teamBName}\t ${pointsB.join(' | ')} | ${setsB}`

  navigator.clipboard.writeText(matchData)
}

function deleteMatch(match: MatchModel) {
  matches.value = matches.value.filter(m => m.reference?.id !== match.reference?.id)

  firebaseDeleteMatch(match)
}

function deleteTeam(team: TeamModel) {
  teams.value = teams.value.filter(t => t.reference?.id !== team.reference?.id)

  firebaseDeleteTeam(team)
}

function toggleCreateMatchDialog() {
  isShowCreateMatchDialog.value = !isShowCreateMatchDialog.value
}

function createNewMatch(match: MatchModel) {
  firebaseCreateMatch(match)
  // const matchWithRef = await firebaseCreateMatch(match)

  // if (matchWithRef)
  //   matches.value.push(matchWithRef)
}

function toggleCreateTeamDialog(team: TeamModel | null = null) {
  teamToEdit.value = team
  isShowCreateTeamDialog.value = !isShowCreateTeamDialog.value
}

async function createNewTeam(team: TeamModel) {
  const teamWithRef = await firebaseCreateTeam(team)

  if (teamWithRef)
    teams.value.push(teamWithRef)
}

function updateTeam(team: TeamModel) {
  const teamIndex = teams.value.findIndex(t => t.reference?.id === team.reference?.id)

  if (teamIndex === -1)
    return

  teams.value[teamIndex] = team

  firebaseUpdateTeam(team)

  teamToEdit.value = null
}

function showPlayers(team: TeamModel | null) {
  isShowPlayersDialog.value = !isShowPlayersDialog.value
  teamToEdit.value = team
}
</script>

<template>
  <v-row
    v-if="isAdmin"
    class="mb-4"
  >
    <v-col cols="4">
      <v-btn
        block
        @click="toggleCreateMatchDialog"
      >
        Dodaj nowy mecz
      </v-btn>
    </v-col>

    <v-col cols="4">
      <v-btn
        block
        @click="toggleCreateTeamDialog(null)"
      >
        Dodaj nową drużynę
      </v-btn>
    </v-col>
  </v-row>

  <v-tabs
    v-model="selectedTab"
    :items="tabs"
    grow
    class="mb-8"
  />

  <div v-if="selectedTab === 'Mecze'">
    <v-select
      v-model="selectedStatus"
      :items="statuses"
      label="Status"
      clearable
    />

    <v-list
      variant="outlined"
      lines="three"
    >
      <v-list-item
        v-for="match in currentMatches"
        :key="match.reference?.id || ''"
        class="my-2"
        @click="goToMatch(match)"
      >
        <v-list-item-title class="mb-2">
          {{ `${findTeam(match.teamA.id)?.name} vs ${findTeam(match.teamB.id)?.name}` }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-subtitle-1">
          {{ formatDate(match.date) }}
        </v-list-item-subtitle>

        <v-list-item-subtitle class="text-subtitle-1 my-2">
          {{ formatStatus(match.status) }}
        </v-list-item-subtitle>

        <v-list-item-subtitle class="text-subtitle-1">
          {{ formatResult(match) }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
            :icon="mdiContentCopy"
            variant="flat"
            @click.stop="copyMatch(match)"
          />

          <v-btn
            v-if="isAdmin"
            variant="flat"
            :icon="mdiDelete"
            @click.stop="deleteMatch(match)"
          >
            <v-icon
              color="red"
              :icon="mdiDelete"
            />
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>

  <div v-else>
    <v-list
      variant="outlined"
      lines="two"
    >
      <v-list-item
        v-for="team in teams"
        :key="team.reference!.id"
        class="my-2"
        :title="team.name"
        @click="isAdmin
          ? toggleCreateTeamDialog(team)
          : ''"
      >
        <template #append>
          <v-btn
            :icon="mdiListBoxOutline"
            variant="flat"
            @click.stop="showPlayers(team)"
          />

          <v-btn
            v-if="isAdmin"
            :icon="mdiDelete"
            variant="flat"
            @click.stop="deleteTeam(team)"
          >
            <v-icon
              color="red"
              :icon="mdiDelete"
            />
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>

  <CreateMatch
    v-model:is-show="isShowCreateMatchDialog"
    :teams="teams"
    @save="createNewMatch"
  />

  <CreateTeam
    v-model:is-show="isShowCreateTeamDialog"
    :team="teamToEdit"
    @save="createNewTeam"
    @update="updateTeam"
  />

  <Players
    :is-show="isShowPlayersDialog"
    :team="teamToEdit"
    @close="showPlayers(null)"
  />
</template>
