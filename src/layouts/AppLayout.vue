<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
  >
    <div class="d-flex align-center ga-3 px-2 py-4">
      <v-avatar color="primary" rounded="lg" size="36">
        <v-icon color="white" icon="mdi-wallet" size="20" />
      </v-avatar>

      <div>
        <div class="text-subtitle-1 font-weight-bold">Wallet</div>
        <div class="text-caption text-medium-emphasis">Personal budgeting</div>
      </div>
    </div>

    <v-divider class="mb-2" />

    <template v-for="group in navGroups" :key="group.label">
      <div class="px-4 pt-2 pb-1 text-caption font-weight-medium text-medium-emphasis text-uppercase">
        {{ group.label }}
      </div>

      <v-list class="px-2" density="compact" nav>
        <v-list-item
          v-for="item in group.items"
          :key="item.to"
          color="primary"
          :prepend-icon="item.icon"
          rounded="lg"
          :title="item.title"
          :to="item.to"
        />
      </v-list>
    </template>

    <template #append>
      <v-divider class="mb-2" />

      <v-list class="px-2" density="compact" nav>
        <v-list-item
          prepend-icon="mdi-account-circle"
          rounded="lg"
          :subtitle="authStore.user?.email"
          :title="authStore.user?.name"
          to="/profile"
        />

        <v-list-item
          prepend-icon="mdi-logout"
          rounded="lg"
          title="Log out"
          @click="handleLogout"
        />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar flat>
    <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawerOpen = !drawerOpen" />
    <v-app-bar-title class="font-weight-medium">{{ route.meta.title }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="content-container" fluid>
      <slot />
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const { mdAndUp } = useDisplay()

  // Permanent on desktop, closed by default on mobile (it renders as a
  // full-screen temporary overlay there, so open-by-default would block
  // the page on load).
  const drawerOpen = ref(mdAndUp.value)

  // Collapse the temporary mobile drawer after navigating to a page.
  watch(route, () => {
    if (!mdAndUp.value) drawerOpen.value = false
  })

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', to: '/', icon: 'mdi-view-dashboard' },
        { title: 'Reports', to: '/reports', icon: 'mdi-chart-line' },
      ],
    },
    {
      label: 'Money',
      items: [
        { title: 'Accounts', to: '/accounts', icon: 'mdi-wallet' },
        { title: 'Transactions', to: '/transactions', icon: 'mdi-swap-horizontal' },
      ],
    },
    {
      label: 'Planning',
      items: [
        { title: 'Budgets', to: '/budgets', icon: 'mdi-chart-donut' },
        { title: 'Goals', to: '/goals', icon: 'mdi-flag-checkered' },
      ],
    },
  ]

  async function handleLogout () {
    await authStore.logout()
    router.push('/login')
  }
</script>
