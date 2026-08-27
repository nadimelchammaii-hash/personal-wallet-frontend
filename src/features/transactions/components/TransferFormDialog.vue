<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>New transfer</v-card-title>

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
          <v-select
            v-model="form.from_account_id"
            :error-messages="errors.from_account_id"
            item-title="name"
            item-value="id"
            :items="activeAccounts"
            label="From account"
          />

          <v-select
            v-model="form.to_account_id"
            :error-messages="errors.to_account_id"
            item-title="name"
            item-value="id"
            :items="activeAccounts"
            label="To account"
          />

          <v-text-field
            v-model.number="form.amount"
            :error-messages="errors.amount"
            label="Amount"
            min="0"
            step="0.01"
            type="number"
          />

          <v-text-field
            v-model="form.transaction_date"
            :error-messages="errors.transaction_date"
            label="Date"
            type="date"
          />

          <v-textarea v-model="form.note" label="Note (optional)" rows="2" />

          <div class="d-flex justify-end mt-4 ga-2">
            <v-btn variant="text" @click="isOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" type="submit">Transfer</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { useAccountsStore } from '@/stores/accounts'
  import { useTransactionsStore } from '@/stores/transactions'

  const isOpen = defineModel<boolean>({ required: true })

  const accountsStore = useAccountsStore()
  const transactionsStore = useTransactionsStore()
  const activeAccounts = computed(() => accountsStore.accounts.filter(account => !account.is_archived))

  function todayIso () {
    return new Date().toISOString().slice(0, 10)
  }

  const form = reactive({
    from_account_id: null as number | null,
    to_account_id: null as number | null,
    amount: 0,
    transaction_date: todayIso(),
    note: '',
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  watch(isOpen, open => {
    if (!open) return

    errors.value = {}
    generalError.value = null
    form.from_account_id = activeAccounts.value[0]?.id ?? null
    form.to_account_id = activeAccounts.value[1]?.id ?? null
    form.amount = 0
    form.transaction_date = todayIso()
    form.note = ''
  })

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null

    if (!form.from_account_id || !form.to_account_id) {
      errors.value = {
        ...(form.from_account_id ? {} : { from_account_id: 'Please choose an account.' }),
        ...(form.to_account_id ? {} : { to_account_id: 'Please choose an account.' }),
      }

      return
    }

    isSubmitting.value = true

    try {
      await transactionsStore.createTransfer({
        from_account_id: form.from_account_id,
        to_account_id: form.to_account_id,
        amount: form.amount,
        transaction_date: form.transaction_date,
        note: form.note || null,
      })

      isOpen.value = false
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
