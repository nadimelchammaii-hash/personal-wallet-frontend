<template>
  <h1 class="text-h4 mb-6">Dashboard</h1>

  <template v-if="summary">
    <v-row>
      <v-col cols="6" md="true" sm="4">
        <v-card>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Balance</div>
            <div class="text-h5 font-weight-bold">{{ formatMoney(summary.balance) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" md="true" sm="4">
        <v-card>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Income (this month)</div>
            <div class="text-h5 font-weight-bold text-success">{{ formatMoney(summary.income) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" md="true" sm="4">
        <v-card>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Expenses (this month)</div>
            <div class="text-h5 font-weight-bold text-error">{{ formatMoney(summary.expenses) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" md="true" sm="4">
        <v-card>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Savings (this month)</div>

            <div class="text-h5 font-weight-bold" :class="Number(summary.savings) >= 0 ? 'text-success' : 'text-error'">
              {{ formatMoney(summary.savings) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" md="true" sm="4">
        <v-card>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Remaining Budget</div>

            <div v-if="summary.remaining_budget !== null" class="text-h5 font-weight-bold">
              {{ formatMoney(summary.remaining_budget) }}
            </div>

            <div v-else class="text-body-1 text-medium-emphasis mt-1">No budget set</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card class="mb-4">
          <v-card-title>Recent Transactions</v-card-title>

          <v-list v-if="summary.recent_transactions.length > 0">
            <v-list-item v-for="transaction in summary.recent_transactions" :key="transaction.id">
              <template #prepend>
                <v-icon :icon="transaction.category?.icon ?? transaction.account.icon ?? 'mdi-swap-horizontal'" />
              </template>

              <v-list-item-title>
                {{ transaction.category?.name ?? (transaction.type === 'transfer_out' ? `Transfer to ${transaction.related_account?.name}` : `Transfer from ${transaction.related_account?.name}`) }}
              </v-list-item-title>

              <v-list-item-subtitle>{{ transaction.transaction_date }} · {{ transaction.account.name }}</v-list-item-subtitle>

              <template #append>
                <span :class="transaction.type === 'income' || transaction.type === 'transfer_in' ? 'text-success' : 'text-error'">
                  {{ transaction.type === 'income' || transaction.type === 'transfer_in' ? '+' : '−' }}{{ formatMoney(transaction.amount) }}
                </span>
              </template>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="text-medium-emphasis">No transactions yet.</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="mb-4">
          <v-card-title>Spending by Category</v-card-title>

          <v-card-text v-if="summary.spending_by_category.length > 0">
            <div v-for="row in summary.spending_by_category" :key="row.category.id" class="mb-3">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>{{ row.category.name }}</span>
                <span>{{ formatMoney(row.amount) }}</span>
              </div>

              <v-progress-linear
                :color="row.category.color ?? 'primary'"
                height="8"
                :model-value="(Number(row.amount) / maxCategorySpend) * 100"
                rounded
              />
            </div>
          </v-card-text>

          <v-card-text v-else class="text-medium-emphasis">No spending recorded this month.</v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Goals</v-card-title>

          <v-card-text v-if="summary.goals.length > 0">
            <div v-for="goal in summary.goals" :key="goal.id" class="mb-3">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>{{ goal.name }}</span>
                <span>{{ goal.progress_percentage }}%</span>
              </div>

              <v-progress-linear
                color="primary"
                height="8"
                :model-value="Math.min(goal.progress_percentage, 100)"
                rounded
              />
            </div>
          </v-card-text>

          <v-card-text v-else class="text-medium-emphasis">No active goals.</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from 'vue'
  import { useDashboardStore } from '@/stores/dashboard'

  const dashboardStore = useDashboardStore()
  const summary = computed(() => dashboardStore.summary)

  const maxCategorySpend = computed(() => {
    if (!summary.value || summary.value.spending_by_category.length === 0) return 1

    return Math.max(...summary.value.spending_by_category.map(row => Number(row.amount)))
  })

  function formatMoney (amount: string) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount))
  }

  onMounted(() => {
    dashboardStore.fetchSummary()
  })
</script>
