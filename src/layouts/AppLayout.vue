<template>
  <v-navigation-drawer permanent>
    <v-list-item
      class="px-4 py-4"
      subtitle="Personal budgeting"
      title="Wallet"
    />

    <v-divider />

    <v-list nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>

    <template #append>
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-account-circle"
          :subtitle="authStore.user?.email"
          :title="authStore.user?.name"
          to="/profile"
        />

        <v-list-item
          prepend-icon="mdi-logout"
          title="Log out"
          @click="handleLogout"
        />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar flat />

  <v-main>
    <v-container fluid>
      <slot />
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()

  const navItems = [
    { title: 'Dashboard', to: '/', icon: 'mdi-view-dashboard' },
    { title: 'Accounts', to: '/accounts', icon: 'mdi-wallet' },
    { title: 'Transactions', to: '/transactions', icon: 'mdi-swap-horizontal' },
    { title: 'Budgets', to: '/budgets', icon: 'mdi-chart-donut' },
    { title: 'Goals', to: '/goals', icon: 'mdi-flag-checkered' },
    { title: 'Reports', to: '/reports', icon: 'mdi-chart-line' },
  ]

  async function handleLogout () {
    await authStore.logout()
    router.push('/login')
  }
</script>
