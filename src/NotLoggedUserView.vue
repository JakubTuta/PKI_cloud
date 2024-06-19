<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMatches } from './firebase_functions'
import type { MatchModel } from './models/match'

const matches = ref<MatchModel[]>([])
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
})

const currentMatches = computed(() => {
  if (!selectedStatus.value)
    return matches.value

  return matches.value.filter(match => match.status === selectedStatus.value)
})
</script>

<template>
  <v-select
    v-model="selectedStatus"
    :items="statuses"
    label="Status"
    clearable
  />

  <div
    v-for="(match, index) in currentMatches"
    :key="index"
  >
    {{ match.result }}
  </div>
</template>
