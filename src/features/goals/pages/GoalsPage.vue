<template>
  <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
    <h1 class="text-h4">Savings Goals</h1>

    <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
      New goal
    </v-btn>
  </div>

  <v-row v-if="goalsStore.goals.length > 0">
    <v-col
      v-for="goal in goalsStore.goals"
      :key="goal.id"
      cols="12"
      md="4"
      sm="6"
    >
      <v-card :class="{ 'opacity-60': goal.status === 'archived' }">
        <v-card-item>
          <template #prepend>
            <v-avatar :color="goal.color ?? 'primary'" variant="tonal">
              <v-icon :icon="goal.icon ?? 'mdi-flag'" />
            </v-avatar>
          </template>

          <v-card-title>{{ goal.name }}</v-card-title>
          <v-card-subtitle v-if="goal.target_date">Target: {{ goal.target_date }}</v-card-subtitle>

          <template #append>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-cash-plus" title="Contribute" @click="openContributeDialog(goal)" />
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEditDialog(goal)" />
                <v-list-item prepend-icon="mdi-delete" title="Delete" @click="confirmDelete(goal)" />
              </v-list>
            </v-menu>
          </template>
        </v-card-item>

        <v-card-text>
          <div class="text-h6 font-weight-bold">
            {{ formatMoney(goal.current_amount) }} <span class="text-body-2 text-medium-emphasis">of {{ formatMoney(goal.target_amount) }}</span>
          </div>

          <v-progress-linear
            class="mt-2"
            :color="goal.status === 'completed' ? 'success' : 'primary'"
            height="10"
            :model-value="Math.min(goal.progress_percentage, 100)"
            rounded
          />

          <div class="d-flex justify-space-between mt-2 text-body-2">
            <span class="text-medium-emphasis">{{ formatMoney(goal.remaining_amount) }} to go</span>
            <span class="text-medium-emphasis">{{ goal.progress_percentage }}%</span>
          </div>

          <v-chip v-if="goal.status === 'completed'" class="mt-3" color="success" size="small">
            <v-icon icon="mdi-check-circle" start />Goal reached
          </v-chip>

          <v-chip v-else-if="goal.status === 'archived'" class="mt-3" size="small">Archived</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-empty-state
    v-else-if="!goalsStore.isLoading"
    headline="No savings goals yet"
    icon="mdi-flag-outline"
    text="Set a target and start tracking your progress toward it."
  >
    <template #actions>
      <v-btn color="primary" @click="openCreateDialog">New goal</v-btn>
    </template>
  </v-empty-state>

  <GoalFormDialog v-model="isDialogOpen" :goal="editingGoal" />
  <ContributionDialog v-model="isContributeDialogOpen" :goal="contributingGoal" />

  <v-dialog v-model="isDeleteDialogOpen" max-width="420">
    <v-card>
      <v-card-title>Delete goal</v-card-title>

      <v-card-text>
        Delete <strong>{{ deletingGoal?.name }}</strong>? This can't be undone.
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancel</v-btn>
        <v-btn color="error" :loading="isDeleting" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import ContributionDialog from '@/features/goals/components/ContributionDialog.vue'
  import GoalFormDialog from '@/features/goals/components/GoalFormDialog.vue'
  import { type SavingsGoal, useGoalsStore } from '@/stores/goals'

  const goalsStore = useGoalsStore()

  function formatMoney (amount: string) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount))
  }

  const isDialogOpen = ref(false)
  const editingGoal = ref<SavingsGoal | null>(null)

  function openCreateDialog () {
    editingGoal.value = null
    isDialogOpen.value = true
  }
  function openEditDialog (goal: SavingsGoal) {
    editingGoal.value = goal
    isDialogOpen.value = true
  }

  const isContributeDialogOpen = ref(false)
  const contributingGoal = ref<SavingsGoal | null>(null)
  function openContributeDialog (goal: SavingsGoal) {
    contributingGoal.value = goal
    isContributeDialogOpen.value = true
  }

  const isDeleteDialogOpen = ref(false)
  const deletingGoal = ref<SavingsGoal | null>(null)
  const isDeleting = ref(false)

  function confirmDelete (goal: SavingsGoal) {
    deletingGoal.value = goal
    isDeleteDialogOpen.value = true
  }

  async function handleDelete () {
    if (!deletingGoal.value) return

    isDeleting.value = true
    try {
      await goalsStore.deleteGoal(deletingGoal.value.id)
      isDeleteDialogOpen.value = false
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(() => {
    goalsStore.fetchGoals()
  })
</script>
