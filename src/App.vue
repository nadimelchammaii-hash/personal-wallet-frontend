<template>
  <v-app>
    <component :is="layout">
      <router-view />
    </component>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppTheme } from '@/composables/useAppTheme'
  import AppLayout from '@/layouts/AppLayout.vue'
  import AuthLayout from '@/layouts/AuthLayout.vue'

  // Applies the user's stored theme preference (system/light/dark) on load.
  useAppTheme()

  const layouts = {
    app: AppLayout,
    auth: AuthLayout,
  }

  const route = useRoute()
  const layout = computed(() => layouts[(route.meta.layout as keyof typeof layouts) ?? 'app'])
</script>
