<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { TeamModel } from './models/team'

const props = defineProps<{
  team: TeamModel | null
}>()

const emit = defineEmits<{
  (e: 'save', team: TeamModel): void
  (e: 'update', team: TeamModel): void
}>()

const { team } = toRefs(props)

const isShow = defineModel<boolean>('isShow', { default: false })

const teamName = ref<string | null>(null)
const playerNames = ref<string[]>([])

watch(team, (newTeam, oldTeam) => {
  if (newTeam && !oldTeam) {
    teamName.value = newTeam.name
    playerNames.value = newTeam.players
  }
}, { immediate: true })

function close() {
  isShow.value = false
  teamName.value = null
  playerNames.value = []
}

function checkData() {
  if (!teamName.value)
    return false

  return true
}

function createTeamModel() {
  return new TeamModel({
    name: teamName.value!,
    players: playerNames.value,
  }, null)
}

function save() {
  if (!checkData())
    return

  if (team.value) {
    team.value.name = teamName.value!
    team.value.players = playerNames.value

    emit('update', team.value)
  }
  else {
    const model = createTeamModel()
    emit('save', model)
  }

  close()
}
</script>

<template>
  <v-dialog
    v-model="isShow"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        Stwórz nową drużynę
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="teamName"
          label="Nazwa drużyny"
          class="mb-4"
        />

        <v-combobox
          v-model="playerNames"
          chips
          multiple
          label="Zawodnicy"
        />
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
