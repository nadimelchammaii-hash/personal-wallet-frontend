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
  import AppLayout from '@/layouts/AppLayout.vue'
  import AuthLayout from '@/layouts/AuthLayout.vue'

  const layouts = {
    app: AppLayout,
    auth: AuthLayout,
  }

  const route = useRoute()
  const layout = computed(() => layouts[(route.meta.layout as keyof typeof layouts) ?? 'app'])
</script>
