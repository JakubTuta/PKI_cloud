<script setup lang="ts">
import { toRefs, watch } from 'vue'
import type { TeamModel } from './models/team'

const props = defineProps<{
  isShow: boolean
  team: TeamModel | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isShow, team } = toRefs(props)

function close() {
  emit('close')
}
</script>

<template>
  <v-dialog
    :model-value="isShow"
    max-width="600"
    @update:model-value="close"
  >
    <v-card v-if="team">
      <v-card-title>
        {{ team.name }}
      </v-card-title>

      <v-card-text>
        <v-list
          variant="outlined"
        >
          <v-list-item
            v-for="player in team.players"
            :key="player"
            :title="player"
            class="my-2"
          />
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-btn
          text
          @click="close"
        >
          Zamknij
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
