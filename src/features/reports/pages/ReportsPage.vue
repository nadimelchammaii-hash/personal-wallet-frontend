<template>
  <h1 class="text-h4 mb-6">Reports</h1>

  <v-card class="mb-4">
    <v-card-title>Income vs. Expenses</v-card-title>

    <v-card-text>
      <div v-if="reportsStore.spendingTrends.length > 0" style="height: 320px;">
        <Line :data="trendsChartData" :options="trendsChartOptions" />
      </div>

      <div v-else class="text-medium-emphasis">No transaction history yet.</div>
    </v-card-text>
  </v-card>

  <div class="d-flex align-center ga-2 mb-4">
    <v-btn icon="mdi-chevron-left" variant="text" @click="reportsStore.previousMonth()" />
    <div class="text-h6" style="min-width: 12ch; text-align: center;">{{ periodLabel }}</div>
    <v-btn icon="mdi-chevron-right" variant="text" @click="reportsStore.nextMonth()" />
  </div>

  <v-row>
    <v-col cols="12" md="5">
      <v-card>
        <v-card-title>Spending by Category</v-card-title>

        <v-card-text>
          <div v-if="reportsStore.categoryBreakdown.length > 0" style="height: 280px;">
            <Doughnut :data="breakdownChartData" :options="breakdownChartOptions" />
          </div>

          <div v-else class="text-medium-emphasis">No spending recorded this month.</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="7">
      <v-card>
        <v-card-title>Budget vs. Actual</v-card-title>

        <v-card-text>
          <div v-if="reportsStore.budgetPerformance.length > 0" style="height: 280px;">
            <Bar :data="performanceChartData" :options="performanceChartOptions" />
          </div>

          <div v-else class="text-medium-emphasis">No budgets set for this month.</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
  } from 'chart.js'
  import { computed, onMounted } from 'vue'
  import { Bar, Doughnut, Line } from 'vue-chartjs'
  import { useReportsStore } from '@/stores/reports'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    LineController,
    BarController,
    DoughnutController,
    Tooltip,
    Legend,
  )

  const reportsStore = useReportsStore()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const periodLabel = computed(() => `${monthNames[reportsStore.month - 1]} ${reportsStore.year}`)

  const successColor = '#4caf50'
  const errorColor = '#ff5252'
  const primaryColor = '#1867c0'

  const palette = [
    '#1867c0', '#5cbbf6', '#4caf50', '#ff9800', '#ff5252',
    '#9c27b0', '#00bcd4', '#795548', '#607d8b', '#cddc39',
  ]

  const trendsChartData = computed(() => ({
    labels: reportsStore.spendingTrends.map(point => point.period),
    datasets: [
      {
        label: 'Income',
        data: reportsStore.spendingTrends.map(point => Number(point.income)),
        borderColor: successColor,
        backgroundColor: successColor,
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: reportsStore.spendingTrends.map(point => Number(point.expenses)),
        borderColor: errorColor,
        backgroundColor: errorColor,
        tension: 0.3,
      },
    ],
  }))

  const trendsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  const breakdownChartData = computed(() => ({
    labels: reportsStore.categoryBreakdown.map(row => row.category.name),
    datasets: [
      {
        data: reportsStore.categoryBreakdown.map(row => Number(row.amount)),
        backgroundColor: reportsStore.categoryBreakdown.map((row, index) => row.category.color ?? palette[index % palette.length]),
      },
    ],
  }))

  const breakdownChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  const performanceChartData = computed(() => ({
    labels: reportsStore.budgetPerformance.map(row => row.category.name),
    datasets: [
      {
        label: 'Budgeted',
        data: reportsStore.budgetPerformance.map(row => Number(row.budgeted)),
        backgroundColor: primaryColor,
      },
      {
        label: 'Spent',
        data: reportsStore.budgetPerformance.map(row => Number(row.spent)),
        backgroundColor: errorColor,
      },
    ],
  }))

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }

  onMounted(() => {
    reportsStore.fetchAll()
  })
</script>
