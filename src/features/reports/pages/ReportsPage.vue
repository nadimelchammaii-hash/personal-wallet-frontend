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
  import { useTheme } from 'vuetify'
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

  ChartJS.defaults.font.family = '\'Inter\', sans-serif'
  ChartJS.defaults.font.size = 12

  const reportsStore = useReportsStore()
  const theme = useTheme()
  const colors = computed(() => theme.current.value.colors as Record<string, string>)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const periodLabel = computed(() => `${monthNames[reportsStore.month - 1]} ${reportsStore.year}`)

  const successColor = computed(() => colors.value.success)
  const errorColor = computed(() => colors.value.error)
  const primaryColor = computed(() => colors.value.primary)
  const gridColor = computed(() => colors.value['surface-variant'])
  const tickColor = computed(() => colors.value['on-surface-variant'])

  const palette = computed(() => [
    colors.value['category-01'], colors.value['category-02'], colors.value['category-03'],
    colors.value['category-04'], colors.value['category-05'], colors.value['category-06'],
    colors.value['category-07'], colors.value['category-08'], colors.value['category-09'],
    colors.value['category-10'],
  ])

  const trendsChartData = computed(() => ({
    labels: reportsStore.spendingTrends.map(point => point.period),
    datasets: [
      {
        label: 'Income',
        data: reportsStore.spendingTrends.map(point => Number(point.income)),
        borderColor: successColor.value,
        backgroundColor: successColor.value,
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: reportsStore.spendingTrends.map(point => Number(point.expenses)),
        borderColor: errorColor.value,
        backgroundColor: errorColor.value,
        tension: 0.3,
      },
    ],
  }))

  const axisOptions = computed(() => ({
    x: { grid: { color: gridColor.value }, ticks: { color: tickColor.value } },
    y: { grid: { color: gridColor.value }, ticks: { color: tickColor.value } },
  }))

  const trendsChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: axisOptions.value,
    plugins: { legend: { labels: { color: tickColor.value } } },
  }))

  const breakdownChartData = computed(() => ({
    labels: reportsStore.categoryBreakdown.map(row => row.category.name),
    datasets: [
      {
        data: reportsStore.categoryBreakdown.map(row => Number(row.amount)),
        backgroundColor: reportsStore.categoryBreakdown.map((row, index) => row.category.color ?? palette.value[index % palette.value.length]),
      },
    ],
  }))

  const breakdownChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: tickColor.value } } },
  }))

  const performanceChartData = computed(() => ({
    labels: reportsStore.budgetPerformance.map(row => row.category.name),
    datasets: [
      {
        label: 'Budgeted',
        data: reportsStore.budgetPerformance.map(row => Number(row.budgeted)),
        backgroundColor: primaryColor.value,
      },
      {
        label: 'Spent',
        data: reportsStore.budgetPerformance.map(row => Number(row.spent)),
        backgroundColor: errorColor.value,
      },
    ],
  }))

  const performanceChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: axisOptions.value,
    plugins: { legend: { labels: { color: tickColor.value } } },
  }))

  onMounted(() => {
    reportsStore.fetchAll()
  })
</script>
