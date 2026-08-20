/**
 * router/index.ts
 *
 * Manual routes for ./src/features/*\/pages/*.vue.
 * meta.layout picks AppLayout vs AuthLayout in App.vue;
 * meta.requiresAuth / meta.guestOnly are enforced by the guard below.
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import AccountsPage from '@/features/accounts/pages/AccountsPage.vue'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage.vue'
import LoginPage from '@/features/auth/pages/LoginPage.vue'
import RegisterPage from '@/features/auth/pages/RegisterPage.vue'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage.vue'
import BudgetsPage from '@/features/budgets/pages/BudgetsPage.vue'
// Pages
import DashboardPage from '@/features/dashboard/pages/DashboardPage.vue'
import GoalsPage from '@/features/goals/pages/GoalsPage.vue'
import ProfilePage from '@/features/profile/pages/ProfilePage.vue'
import ReportsPage from '@/features/reports/pages/ReportsPage.vue'
import TransactionsPage from '@/features/transactions/pages/TransactionsPage.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/accounts',
      component: AccountsPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/transactions',
      component: TransactionsPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/budgets',
      component: BudgetsPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/goals',
      component: GoalsPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/reports',
      component: ReportsPage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/profile',
      component: ProfilePage,
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/login',
      component: LoginPage,
      meta: { layout: 'auth', guestOnly: true },
    },
    {
      path: '/register',
      component: RegisterPage,
      meta: { layout: 'auth', guestOnly: true },
    },
    {
      path: '/forgot-password',
      component: ForgotPasswordPage,
      meta: { layout: 'auth', guestOnly: true },
    },
    {
      path: '/reset-password',
      component: ResetPasswordPage,
      meta: { layout: 'auth', guestOnly: true },
    },
  ],
})

router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/' }
  }
})

export default router
