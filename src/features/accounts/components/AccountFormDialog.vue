<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>{{ account ? 'Edit account' : 'New account' }}</v-card-title>

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
            v-model="form.name"
            :error-messages="errors.name"
            label="Name"
          />

          <v-select
            v-model="form.type"
            :error-messages="errors.type"
            item-title="title"
            item-value="value"
            :items="typeOptions"
            label="Type"
          />

          <v-select
            v-model="form.currency"
            :error-messages="errors.currency"
            :items="currencies"
            label="Currency"
          />

          <v-text-field
            v-model.number="form.initial_balance"
            :error-messages="errors.initial_balance"
            label="Initial balance"
            step="0.01"
            type="number"
          />

          <v-switch
            v-if="account"
            v-model="form.is_archived"
            color="primary"
            hide-details
            label="Archived"
          />

          <div class="d-flex justify-end mt-4 ga-2">
            <v-btn variant="text" @click="isOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" type="submit">Save</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { type Account, type AccountType, useAccountsStore } from '@/stores/accounts'

  const props = defineProps<{
    account: Account | null
  }>()

  const emit = defineEmits<{
    saved: []
  }>()

  const isOpen = defineModel<boolean>({ required: true })

  const accountsStore = useAccountsStore()

  const typeOptions: { title: string, value: AccountType }[] = [
    { title: 'Cash', value: 'cash' },
    { title: 'Bank Account', value: 'bank' },
    { title: 'Credit Card', value: 'credit_card' },
    { title: 'Savings Account', value: 'savings' },
    { title: 'Other', value: 'other' },
  ]
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']

  const form = reactive({
    name: '',
    type: 'bank' as AccountType,
    currency: 'USD',
    initial_balance: 0,
    is_archived: false,
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  watch(isOpen, open => {
    if (!open) return

    errors.value = {}
    generalError.value = null

    if (props.account) {
      form.name = props.account.name
      form.type = props.account.type
      form.currency = props.account.currency
      form.initial_balance = Number(props.account.initial_balance)
      form.is_archived = props.account.is_archived
    } else {
      form.name = ''
      form.type = 'bank'
      form.currency = 'USD'
      form.initial_balance = 0
      form.is_archived = false
    }
  })

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await (props.account ? accountsStore.updateAccount(props.account.id, { ...form }) : accountsStore.createAccount({ ...form }))
      emit('saved')
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
