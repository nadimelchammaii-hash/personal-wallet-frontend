<template>
  <v-dialog v-model="isOpen" max-width="480">
    <v-card v-if="goal">
      <v-card-title>Contribute to {{ goal.name }}</v-card-title>

      <v-card-text>
        <v-alert
          v-if="generalError"
          class="mb-4"
          closable
          type="error"
          @click:close="generalError = null"
        >
          {{ generalError }}
        </v-alert>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model.number="form.amount"
            :error-messages="errors.amount"
            label="Amount"
            min="0"
            step="0.01"
            type="number"
          />

          <v-text-field
            v-model="form.contributed_at"
            :error-messages="errors.contributed_at"
            label="Date"
            type="date"
          />

          <v-text-field v-model="form.note" label="Note (optional)" />

          <v-btn block color="primary" :loading="isSubmitting" type="submit">Add contribution</v-btn>
        </v-form>

        <v-divider class="my-4" />

        <div class="text-subtitle-2 mb-2">History</div>

        <v-list v-if="contributions.length > 0" density="compact">
          <v-list-item v-for="contribution in contributions" :key="contribution.id">
            <v-list-item-title>{{ formatMoney(contribution.amount) }}</v-list-item-title>

            <v-list-item-subtitle>
              {{ contribution.contributed_at }}<template v-if="contribution.note"> — {{ contribution.note }}</template>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <p v-else class="text-body-2 text-medium-emphasis">No contributions yet.</p>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { type Contribution, type SavingsGoal, useGoalsStore } from '@/stores/goals'

  const props = defineProps<{
    goal: SavingsGoal | null
  }>()

  const isOpen = defineModel<boolean>({ required: true })

  const goalsStore = useGoalsStore()

  function todayIso () {
    return new Date().toISOString().slice(0, 10)
  }

  const form = reactive({ amount: 0, contributed_at: todayIso(), note: '' })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)
  const contributions = ref<Contribution[]>([])

  function formatMoney (amount: string) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount))
  }

  watch(isOpen, async open => {
    if (!open || !props.goal) return

    errors.value = {}
    generalError.value = null
    form.amount = 0
    form.contributed_at = todayIso()
    form.note = ''
    contributions.value = await goalsStore.fetchContributions(props.goal.id)
  })

  async function handleSubmit () {
    if (!props.goal) return

    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await goalsStore.addContribution(props.goal.id, {
        amount: form.amount,
        contributed_at: form.contributed_at,
        note: form.note || null,
      })
      contributions.value = await goalsStore.fetchContributions(props.goal.id)
      form.amount = 0
      form.note = ''
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        errors.value = fieldErrors
      } else {
        generalError.value = extractErrorMessage(error)
      }
    } finally {
      isSubmitting.value = false
    }
  }
</script>
