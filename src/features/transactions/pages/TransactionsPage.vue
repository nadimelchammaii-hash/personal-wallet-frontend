<template>
  <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
    <h1 class="text-h4">Transactions</h1>

    <div class="d-flex ga-2">
      <v-btn prepend-icon="mdi-shape-outline" variant="tonal" @click="isCategoryDialogOpen = true">
        Categories
      </v-btn>

      <v-btn prepend-icon="mdi-swap-horizontal" variant="tonal" @click="openTransferDialog">
        Transfer
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        New transaction
      </v-btn>
    </div>
  </div>

  <v-card class="mb-4" variant="outlined">
    <v-card-text>
      <v-row dense>
        <v-col cols="6" md="2">
          <v-select
            v-model="transactionsStore.filters.account_id"
            clearable
            density="compact"
            item-title="name"
            item-value="id"
            :items="accountsStore.accounts"
            label="Account"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="transactionsStore.filters.category_id"
            clearable
            density="compact"
            item-title="name"
            item-value="id"
            :items="categoriesStore.categories"
            label="Category"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            v-model="transactionsStore.filters.type"
            clearable
            density="compact"
            item-title="title"
            item-value="value"
            :items="typeFilterOptions"
            label="Type"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            v-model="transactionsStore.filters.date_from"
            clearable
            density="compact"
            label="From"
            type="date"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            v-model="transactionsStore.filters.date_to"
            clearable
            density="compact"
            label="To"
            type="date"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            v-model="transactionsStore.filters.search"
            clearable
            density="compact"
            label="Search notes"
            prepend-inner-icon="mdi-magnify"
            @update:model-value="applyFilters"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-data-table-server
    :headers="headers"
    :items="transactionsStore.transactions"
    :items-length="transactionsStore.meta?.total ?? 0"
    :items-per-page="transactionsStore.meta?.per_page ?? 20"
    :loading="transactionsStore.isLoading"
    :page="transactionsStore.filters.page"
    @update:page="onPageChange"
  >
    <template #item.transaction_date="{ item }">
      {{ item.transaction_date }}
    </template>

    <template #item.account="{ item }">
      <div v-if="item.type === 'transfer_in' || item.type === 'transfer_out'" class="d-flex align-center ga-1">
        {{ item.type === 'transfer_out' ? item.account.name : item.related_account?.name }}
        <v-icon icon="mdi-arrow-right" size="small" />
        {{ item.type === 'transfer_out' ? item.related_account?.name : item.account.name }}
      </div>

      <div v-else class="d-flex align-center ga-1">
        <v-icon :icon="item.account.icon ?? 'mdi-wallet'" size="small" />
        {{ item.account.name }}
      </div>
    </template>

    <template #item.category="{ item }">
      <v-chip v-if="item.category" :color="item.category.color ?? undefined" :prepend-icon="item.category.icon ?? undefined" size="small">
        {{ item.category.name }}
      </v-chip>

      <span v-else class="text-medium-emphasis">—</span>
    </template>

    <template #item.amount="{ item }">
      <span :class="amountClass(item.type)">{{ formatAmount(item) }}</span>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        :disabled="item.type === 'transfer_in' || item.type === 'transfer_out'"
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="openEditDialog(item)"
      />

      <v-btn icon="mdi-delete" size="small" variant="text" @click="confirmDelete(item)" />
    </template>
  </v-data-table-server>

  <TransactionFormDialog v-model="isFormDialogOpen" :transaction="editingTransaction" />
  <TransferFormDialog v-model="isTransferDialogOpen" />
  <CategoryManagerDialog v-model="isCategoryDialogOpen" />

  <v-dialog v-model="isDeleteDialogOpen" max-width="420">
    <v-card>
      <v-card-title>Delete transaction</v-card-title>

      <v-card-text>
        <template v-if="deletingTransaction?.transfer_group_id">
          This will delete both legs of the transfer and reverse both account balances.
        </template>

        <template v-else>
          Delete this transaction? This can't be undone.
        </template>
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
  import CategoryManagerDialog from '@/features/transactions/components/CategoryManagerDialog.vue'
  import TransactionFormDialog from '@/features/transactions/components/TransactionFormDialog.vue'
  import TransferFormDialog from '@/features/transactions/components/TransferFormDialog.vue'
  import { useAccountsStore } from '@/stores/accounts'
  import { useCategoriesStore } from '@/stores/categories'
  import { type Transaction, type TransactionType, useTransactionsStore } from '@/stores/transactions'

  const accountsStore = useAccountsStore()
  const categoriesStore = useCategoriesStore()
  const transactionsStore = useTransactionsStore()

  const headers = [
    { title: 'Date', key: 'transaction_date' },
    { title: 'Account', key: 'account' },
    { title: 'Category', key: 'category' },
    { title: 'Note', key: 'note' },
    { title: 'Amount', key: 'amount', align: 'end' as const },
    { title: '', key: 'actions', sortable: false, align: 'end' as const },
  ]

  const typeFilterOptions: { title: string, value: TransactionType }[] = [
    { title: 'Income', value: 'income' },
    { title: 'Expense', value: 'expense' },
    { title: 'Transfer in', value: 'transfer_in' },
    { title: 'Transfer out', value: 'transfer_out' },
  ]

  function applyFilters () {
    transactionsStore.filters.page = 1
    transactionsStore.fetchTransactions()
  }

  function onPageChange (page: number) {
    transactionsStore.filters.page = page
    transactionsStore.fetchTransactions()
  }

  function amountClass (type: TransactionType) {
    return type === 'income' || type === 'transfer_in' ? 'text-success font-weight-medium' : 'text-error font-weight-medium'
  }

  function formatAmount (item: Transaction) {
    const sign = item.type === 'income' || item.type === 'transfer_in' ? '+' : '−'

    return `${sign}${Number(item.amount).toFixed(2)}`
  }

  const isFormDialogOpen = ref(false)
  const editingTransaction = ref<Transaction | null>(null)

  function openCreateDialog () {
    editingTransaction.value = null
    isFormDialogOpen.value = true
  }
  function openEditDialog (transaction: Transaction) {
    editingTransaction.value = transaction
    isFormDialogOpen.value = true
  }

  const isTransferDialogOpen = ref(false)
  function openTransferDialog () {
    isTransferDialogOpen.value = true
  }

  const isCategoryDialogOpen = ref(false)

  const isDeleteDialogOpen = ref(false)
  const deletingTransaction = ref<Transaction | null>(null)
  const isDeleting = ref(false)

  function confirmDelete (transaction: Transaction) {
    deletingTransaction.value = transaction
    isDeleteDialogOpen.value = true
  }

  async function handleDelete () {
    if (!deletingTransaction.value) return

    isDeleting.value = true
    try {
      await transactionsStore.deleteTransaction(deletingTransaction.value.id)
      isDeleteDialogOpen.value = false
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(() => {
    accountsStore.fetchAccounts()
    categoriesStore.fetchCategories()
    transactionsStore.fetchTransactions()
  })
</script>
