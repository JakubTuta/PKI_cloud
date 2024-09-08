<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mdiListBoxOutline, mdiMinus, mdiPlus, mdiSwapHorizontal } from '@mdi/js'
import {
  updateMatchPoints as firebaseUpdateMatchPoints,
  updateMatchStatus as firebaseUpdateMatchStatus,
  getMatch,
  getTeams,
  match,
  userData,
} from './firebase_functions'
import router from './router'
import type { TeamModel } from './models/team'
import Players from './Players.vue'

const route = useRoute()

const teams = ref<TeamModel[]>([])
const team1 = ref<TeamModel | null>(null)
const team2 = ref<TeamModel | null>(null)
const currentTime = ref(new Date())
const gameTimeInSeconds = ref(0)
const setsTeam1 = ref(0)
const setsTeam2 = ref(0)
const team1Points = ref(0)
const team2Points = ref(0)
const teamToEdit = ref<TeamModel | null>(null)
const isShowPlayersDialog = ref(false)

const socket = new WebSocket('https://websocket-image-1088248617300.europe-central2.run.app')

socket.onopen = () => {
  console.log('Połączono z serwerem')
  socket.send(String(route.params.id))
}

socket.onmessage = (event) => {
  if (!match.value)
    return
  // message format: "sets_team_1:sets_team_2:points_team_1:points_team_2"
  const data = event.data.split(':')

  if (match.value.teamA.id === team1.value?.reference?.id) {
    setsTeam1.value = Number.parseInt(data[0])
    setsTeam2.value = Number.parseInt(data[1])
    team1Points.value = Number.parseInt(data[2])
    team2Points.value = Number.parseInt(data[3])
  }
  else {
    setsTeam1.value = Number.parseInt(data[1])
    setsTeam2.value = Number.parseInt(data[0])
    team1Points.value = Number.parseInt(data[3])
    team2Points.value = Number.parseInt(data[2])
  }
}

socket.onclose = () => {
  console.log('Rozłączono z serwerem')
}

function prepareMessageForWebsocket() {
  if (!match.value)
    return

  if (match.value.teamA.id === team1.value?.reference?.id)
    return `${setsTeam1.value}:${setsTeam2.value}:${team1Points.value}:${team2Points.value}`
  else
    return `${setsTeam2.value}:${setsTeam1.value}:${team2Points.value}:${team1Points.value}`
}

onMounted(async () => {
  const docId = String(route.params.id)

  match.value = await getMatch(docId)
  teams.value = await getTeams()
})

const isAdmin = computed(() => userData.value?.role === 'admin')
const isMatchInProgress = computed(() => match.value?.status === 'in-progress')

function calculateTime() {
  if (!match.value)
    return

  const gameDate = match.value.date.toDate()
  const currentTime = new Date()

  gameTimeInSeconds.value = Math.floor((currentTime.getTime() - gameDate.getTime()) / 1000)
}

function endMatch() {
  if (!match.value)
    return

  match.value.status = 'finished'

  firebaseUpdateMatchStatus(match.value, 'finished')
}

function isMatchOver() {
  if (!match.value || match.value.status === 'finished')
    return

  const [setA, setB] = match.value.result.split(':').map(Number)

  if (setA === match.value.matchSettings.sets || setB === match.value.matchSettings.sets)
    endMatch()
}

watch(match, (newMatch) => {
  if (!newMatch)
    return

  isMatchOver()

  if (isMatchInProgress.value) {
    calculateTime()

    setInterval(() => {
      gameTimeInSeconds.value++
    }, 1000)
  }

  setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  team1.value = findTeam(newMatch.teamA?.id || '')
  team2.value = findTeam(newMatch.teamB?.id || '')

  setsTeam1.value = Number.parseInt(newMatch.result.split(':')[0]) || 0
  setsTeam2.value = Number.parseInt(newMatch.result.split(':')[1]) || 0

  const whichSet = newMatch.resultDetailed.resD.length

  if (!whichSet) {
    team1Points.value = 0
    team2Points.value = 0

    return
  }

  team1Points.value = Number.parseInt(newMatch.resultDetailed.resD[whichSet - 1].split(':')[0]) || 0
  team2Points.value = Number.parseInt(newMatch.resultDetailed.resD[whichSet - 1].split(':')[1]) || 0
}, { immediate: true })

watch(teams, (newTeams) => {
  if (!newTeams.length)
    return

  team1.value = findTeam(match.value?.teamA?.id || '')
  team2.value = findTeam(match.value?.teamB?.id || '')
}, { immediate: true })

function findTeam(teamId: string) {
  return teams.value.find(team => team.reference?.id === teamId) || null
}

function showPlayers(team: TeamModel | null) {
  isShowPlayersDialog.value = !isShowPlayersDialog.value
  teamToEdit.value = team
}

function mapStatus() {
  if (!match.value)
    return ''

  switch (match.value.status) {
    case 'planned':
      return 'Zaplanowany'
    case 'in-progress':
      return 'Trwający'
    case 'finished':
      return 'Zakończony'
    default:
      return ''
  }
}

function swapTeams() {
  const temp = team1.value
  team1.value = team2.value
  team2.value = temp

  const tempSets = setsTeam1.value
  setsTeam1.value = setsTeam2.value
  setsTeam2.value = tempSets

  const tempPoints = team1Points.value
  team1Points.value = team2Points.value
  team2Points.value = tempPoints
}

function getTeamPoints(team: TeamModel | null) {
  if (!team)
    return 0

  if (team.reference?.id === team1.value?.reference?.id)
    return team1Points.value
  else
    return team2Points.value
}

function addPoint(team: TeamModel | null) {
  if (!team)
    return

  if (team.reference?.id === team1.value?.reference?.id)
    team1Points.value++
  else
    team2Points.value++

  const message = prepareMessageForWebsocket()

  if (message) {
    socket.send(message)
    updateMatchPoints(message)
  }
}

function removePoint(team: TeamModel | null) {
  if (!team)
    return

  if (team.reference?.id === team1.value?.reference?.id)
    team1Points.value--
  else
    team2Points.value--

  const message = prepareMessageForWebsocket()

  if (message) {
    socket.send(message)
    updateMatchPoints(message)
  }
}

function mapDate() {
  const day = String(currentTime.value.getDate()).padStart(2, '0')
  const month = String(currentTime.value.getMonth() + 1).padStart(2, '0')
  const year = currentTime.value.getFullYear()

  const hour = String(currentTime.value.getHours()).padStart(2, '0')
  const minute = String(currentTime.value.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hour}:${minute}`
}

function mapTime() {
  const seconds = gameTimeInSeconds.value % 60
  const minutes = Math.floor((gameTimeInSeconds.value / 60) % 60)
  const hours = Math.floor(gameTimeInSeconds.value / 3600)

  return `${hours}:${minutes}:${seconds}`
}

const isLastSet = computed(() => {
  if (!match.value || !isMatchInProgress.value)
    return false

  return (setsTeam1.value + setsTeam2.value + 1) >= (match.value.matchSettings.sets * 2 - 1)
})

const lastSetPoints = computed(() => {
  if (!match.value || !isMatchInProgress.value)
    return 999

  if (match.value.matchSettings.isLastTiebreak)
    return match.value.matchSettings.pointsToWinTiebreak

  return match.value.matchSettings.pointsToWinSet
})

const canEndSet = computed(() => {
  if (!match.value || !isMatchInProgress.value)
    return false

  if (isLastSet.value) {
    return (team1Points.value >= lastSetPoints.value
      || team2Points.value >= lastSetPoints.value)
      && Math.abs(team1Points.value - team2Points.value) >= 2
  }

  return (team1Points.value >= match.value.matchSettings.pointsToWinSet
    || team2Points.value >= match.value.matchSettings.pointsToWinSet)
    && Math.abs(team1Points.value - team2Points.value) >= 2
})

const canEndMatch = computed(() => {
  if (!match.value || !isMatchInProgress.value || !isLastSet.value)
    return false

  if (team1Points.value < lastSetPoints.value && team2Points.value < lastSetPoints.value)
    return false

  const team = team1Points.value > team2Points.value
    ? 'team1'
    : 'team2'

  if (team === 'team1')
    return setsTeam1.value + 1 >= match.value.matchSettings.sets
  else
    return setsTeam2.value + 1 >= match.value.matchSettings.sets
})

function updateMatchPoints(data: string, isNewSet: boolean = false) {
  const [setsTeam1, setsTeam2, pointsTeam1, pointsTeam2] = data.split(':').map(Number)

  const newSets = `${setsTeam1}:${setsTeam2}`
  const newPoints = `${pointsTeam1}:${pointsTeam2}`

  let newResultDetailed = []
  if (isNewSet) {
    newResultDetailed = [...match.value?.resultDetailed.resD || [], newPoints]
  }
  else {
    newResultDetailed = [...match.value?.resultDetailed.resD || []]
    newResultDetailed[newResultDetailed.length - 1] = newPoints
  }

  firebaseUpdateMatchPoints(match.value!, newSets, newResultDetailed)
}

function newSet() {
  const whoWon = team1Points.value > team2Points.value
    ? 'team1'
    : 'team2'

  if (whoWon === 'team1')
    setsTeam1.value++
  else
    setsTeam2.value++

  team1Points.value = 0
  team2Points.value = 0

  swapTeams()

  const message = prepareMessageForWebsocket()

  if (message) {
    socket.send(message)
    updateMatchPoints(message, true)
  }
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
      <v-card-title
        style="display: flex; align-items: center; justify-content: space-between;"
      >
        <v-btn
          icon
          flat
          @click="showPlayers(team1)"
        >
          <v-icon
            :icon="mdiListBoxOutline"
          />
        </v-btn>

        <span>
          {{ team1?.name || '' }}
        </span>

        {{ setsTeam1 }}

        <v-icon
          style="cursor: pointer;"
          :icon="mdiSwapHorizontal"
          @click="swapTeams"
        />

        {{ setsTeam2 }}

        <span>
          {{ team2?.name || '' }}
        </span>

        <v-btn
          icon
          flat
          @click="showPlayers(team2)"
        >
          <v-icon
            :icon="mdiListBoxOutline"
          />
        </v-btn>
      </v-card-title>

      <v-card-subtitle
        align="center"
        class="text-subtitle-1"
      >
        {{ mapStatus() }}
      </v-card-subtitle>

      <v-card-text>
        <v-row
          justify="center"
          class="my-2"
        >
          <div>
            <p>
              Obecna data:
            </p>

            <p>
              {{ mapDate() }}
            </p>

            <p
              v-if="isMatchInProgress"
              class="mt-1"
            >
              Czas gry:
            </p>

            <p v-if="isMatchInProgress">
              {{ mapTime() }}
            </p>
          </div>
        </v-row>

        <v-row>
          <v-col
            v-for="team in [
              team1,
              team2,
            ]"
            :key="team?.reference?.id"
            cols="6"
          >
            <v-row
              justify="center"
              class="text-h2 my-2"
            >
              {{ getTeamPoints(team) }}
            </v-row>

            <v-row
              v-if="isAdmin"
              justify="center"
            >
              <v-btn
                :icon="mdiMinus"
                class="mr-4"
                flat
                @click="removePoint(team)"
              />

              <v-btn
                :icon="mdiPlus"
                flat
                @click="addPoint(team)"
              />
            </v-row>
          </v-col>
        </v-row>

        <v-row
          v-if="isAdmin && canEndSet && !canEndMatch"
          justify="center"
          class="my-1"
        >
          <v-btn
            @click="newSet"
          >
            Zakończ set
          </v-btn>
        </v-row>

        <v-row
          v-if="isAdmin && canEndSet && canEndMatch"
          justify="center"
          class="my-1"
        >
          <v-btn
            @click="endMatch"
          >
            Zakończ mecz
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>

  <Players
    :is-show="isShowPlayersDialog"
    :team="teamToEdit"
    @close="showPlayers(null)"
  />
</template>
