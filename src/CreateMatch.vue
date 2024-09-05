<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { VDatePicker } from 'vuetify/lib/components/index.mjs'
import { VTimePicker } from 'vuetify/lib/labs/components.mjs'
import { Timestamp } from 'firebase/firestore'
import { MatchModel } from './models/match'
import type { TeamModel } from './models/team'

const props = defineProps<{
  teams: TeamModel[]
}>()

const emit = defineEmits<{
  (e: 'save', match: MatchModel): void
}>()

const { teams } = toRefs(props)

const isShow = defineModel<boolean>('isShow', { default: false })

const selectedDate = ref(new Date())
const selectedTime = ref<any>(null)
const selectedTeamA = ref<{ title: string, value: TeamModel } | null>(null)
const selectedTeamB = ref<{ title: string, value: TeamModel } | null>(null)

const yesterday = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  return date
})

const minTime = computed(() => {
  const now = new Date()

  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
})

const teamItems = computed(() => {
  return teams.value.filter(team => team.reference.id !== selectedTeamA.value?.value.reference.id && team.reference.id !== selectedTeamB.value?.value.reference.id)
    .map(team => ({
      title: team.name,
      value: team,
    }))
})

function close() {
  isShow.value = false
  selectedDate.value = new Date()
  selectedTeamA.value = null
  selectedTeamB.value = null
}

function checkData() {
  if (!selectedDate.value || !selectedTime.value || !selectedTeamA.value || !selectedTeamB.value)
    return false

  return true
}

function formatDate() {
  const date = selectedDate.value
  const [hour, minute] = selectedTime.value.split(':')

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
}

function getStatus(date: Date) {
  const now = new Date()

  const timeDifference = Math.abs(date.getTime() - now.getTime())
  const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60))

  if (hoursDifference < 2)
    return 'in-progress'
  else
    return 'planned'
}

function createMatchModel() {
  const date = formatDate()
  const timestamp = Timestamp.fromDate(date)

  return new MatchModel({
    date: timestamp,
    teamA: selectedTeamA.value!.value.reference,
    teamB: selectedTeamB.value!.value.reference,
    result: '0:0',
    resultDetailed: {
      resD: [],
      timeout: [],
    },
    status: getStatus(date),
  }, null)
}

function save() {
  if (!checkData())
    return

  const model = createMatchModel()
  emit('save', model)

  close()
}

function allowedMinutes(minute: number) {
  return minute % 5 === 0
}
</script>

<template>
  <v-dialog
    v-model="isShow"
    max-width="800"
  >
    <v-card>
      <v-btn @click="() => console.log(selectedTime)">
        xdd
      </v-btn>

      <v-card-title>
        Stwórz nowy mecz
      </v-card-title>

      <v-card-text>
        Data meczu
        <VDatePicker
          v-model="selectedDate"
          class="mb-4"
          :min="yesterday"
          hide-header
          hide-weekdays
          color="primary"
        />

        Godzina meczu
        <VTimePicker
          v-model="selectedTime"
          :allowed-minutes="allowedMinutes"
          class="mb-4"
          ampm-in-title
          color="primary"
          :min="minTime"
        />

        <v-row>
          <v-col cols="6">
            Gospodarz
            <v-select
              v-model="selectedTeamA"
              return-object
              :items="teamItems"
              class="my-2"
            />
          </v-col>

          <v-col cols="6">
            Gość
            <v-select
              v-model="selectedTeamB"
              return-object
              :items="teamItems"
              class="my-2"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="text"
          color="red"
          @click="close"
        >
          Anuluj
        </v-btn>

        <v-btn
          color="green"
          variant="text"
          @click="save"
        >
          Zapisz
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
