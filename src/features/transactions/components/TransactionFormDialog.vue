<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>{{ transaction ? 'Edit transaction' : 'New transaction' }}</v-card-title>

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

        <v-btn-toggle
          v-model="form.type"
          class="mb-4"
          color="primary"
          divided
          mandatory
          @update:model-value="onTypeChange"
        >
          <v-btn value="expense">Expense</v-btn>
          <v-btn value="income">Income</v-btn>
        </v-btn-toggle>

        <v-form @submit.prevent="handleSubmit">
          <v-select
            v-model="form.account_id"
            :error-messages="errors.account_id"
            item-title="name"
            item-value="id"
            :items="activeAccounts"
            label="Account"
          />

          <v-select
            v-model="form.category_id"
            :error-messages="errors.category_id"
            item-title="name"
            item-value="id"
            :items="categoryOptions"
            label="Category"
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
            <v-btn color="primary" :loading="isSubmitting" type="submit">Save</v-btn>
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
  import { useCategoriesStore } from '@/stores/categories'
  import { type Transaction, useTransactionsStore } from '@/stores/transactions'

  const props = defineProps<{
    transaction: Transaction | null
  }>()

  const isOpen = defineModel<boolean>({ required: true })

  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const transactionsStore = useTransactionsStore()

  function todayIso () {
    return new Date().toISOString().slice(0, 10)
  }

  const form = reactive({
    account_id: null as number | null,
    category_id: null as number | null,
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    transaction_date: todayIso(),
    note: '',
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  const activeAccounts = computed(() => accountsStore.accounts.filter(account => !account.is_archived))
  const categoryOptions = computed(() => categoriesStore.categories.filter(category => category.type === form.type))

  function onTypeChange () {
    if (!categoryOptions.value.some(category => category.id === form.category_id)) {
      form.category_id = null
    }
  }

  watch(isOpen, open => {
    if (!open) return

    errors.value = {}
    generalError.value = null

    if (props.transaction) {
      form.account_id = props.transaction.account.id
      form.category_id = props.transaction.category?.id ?? null
      form.type = props.transaction.type === 'income' ? 'income' : 'expense'
      form.amount = Number(props.transaction.amount)
      form.transaction_date = props.transaction.transaction_date
      form.note = props.transaction.note ?? ''
    } else {
      form.account_id = activeAccounts.value[0]?.id ?? null
      form.category_id = null
      form.type = 'expense'
      form.amount = 0
      form.transaction_date = todayIso()
      form.note = ''
    }
  })

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null

    if (!form.account_id || !form.category_id) {
      errors.value = {
        ...(form.account_id ? {} : { account_id: 'Please choose an account.' }),
        ...(form.category_id ? {} : { category_id: 'Please choose a category.' }),
      }

      return
    }

    isSubmitting.value = true

    try {
      const payload = {
        account_id: form.account_id,
        category_id: form.category_id,
        type: form.type,
        amount: form.amount,
        transaction_date: form.transaction_date,
        note: form.note || null,
      }

      await (props.transaction ? transactionsStore.updateTransaction(props.transaction.id, payload) : transactionsStore.createTransaction(payload))

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
