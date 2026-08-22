<template>
  <div class="d-flex align-center justify-space-between mb-6">
    <h1 class="text-h4">Accounts</h1>

    <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
      New account
    </v-btn>
  </div>

  <v-switch
    v-model="accountsStore.includeArchived"
    class="mb-2"
    color="primary"
    density="compact"
    hide-details
    label="Show archived"
    @update:model-value="accountsStore.fetchAccounts()"
  />

  <v-row v-if="accountsStore.accounts.length > 0">
    <v-col
      v-for="account in accountsStore.accounts"
      :key="account.id"
      cols="12"
      md="4"
      sm="6"
    >
      <v-card :class="{ 'opacity-60': account.is_archived }">
        <v-card-item>
          <template #prepend>
            <v-avatar color="primary" variant="tonal">
              <v-icon :icon="account.icon ?? 'mdi-wallet'" />
            </v-avatar>
          </template>

          <v-card-title>{{ account.name }}</v-card-title>
          <v-card-subtitle>{{ typeLabel(account.type) }}</v-card-subtitle>

          <template #append>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEditDialog(account)" />
                <v-list-item prepend-icon="mdi-delete" title="Delete" @click="confirmDelete(account)" />
              </v-list>
            </v-menu>
          </template>
        </v-card-item>

        <v-card-text>
          <div class="text-h5 font-weight-bold tabular-nums">
            {{ formatCurrency(account.current_balance, account.currency) }}
          </div>

          <v-chip v-if="account.is_archived" class="mt-2" size="small">Archived</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-empty-state
    v-else-if="!accountsStore.isLoading"
    headline="No accounts yet"
    icon="mdi-wallet-outline"
    text="Add your first cash, bank, or credit card account to start tracking balances."
  >
    <template #actions>
      <v-btn color="primary" @click="openCreateDialog">New account</v-btn>
    </template>
  </v-empty-state>

  <AccountFormDialog v-model="isDialogOpen" :account="editingAccount" @saved="accountsStore.fetchAccounts()" />

  <v-dialog v-model="isDeleteDialogOpen" max-width="420">
    <v-card>
      <v-card-title>Delete account</v-card-title>

      <v-card-text>
        Delete <strong>{{ deletingAccount?.name }}</strong>? This can't be undone.
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
  import AccountFormDialog from '@/features/accounts/components/AccountFormDialog.vue'
  import { type Account, type AccountType, useAccountsStore } from '@/stores/accounts'

  const accountsStore = useAccountsStore()

  const typeLabels: Record<AccountType, string> = {
    cash: 'Cash',
    bank: 'Bank Account',
    credit_card: 'Credit Card',
    savings: 'Savings Account',
    other: 'Other',
  }
  function typeLabel (type: AccountType) {
    return typeLabels[type]
  }

  function formatCurrency (amount: string, currency: string) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))
  }

  const isDialogOpen = ref(false)
  const editingAccount = ref<Account | null>(null)

  function openCreateDialog () {
    editingAccount.value = null
    isDialogOpen.value = true
  }
  function openEditDialog (account: Account) {
    editingAccount.value = account
    isDialogOpen.value = true
  }

  const isDeleteDialogOpen = ref(false)
  const deletingAccount = ref<Account | null>(null)
  const isDeleting = ref(false)

  function confirmDelete (account: Account) {
    deletingAccount.value = account
    isDeleteDialogOpen.value = true
  }

  async function handleDelete () {
    if (!deletingAccount.value) return

    isDeleting.value = true
    try {
      await accountsStore.deleteAccount(deletingAccount.value.id)
      isDeleteDialogOpen.value = false
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(() => {
    accountsStore.fetchAccounts()
  })
</script>
