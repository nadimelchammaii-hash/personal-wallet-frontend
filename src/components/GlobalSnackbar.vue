<template>
  <v-snackbar v-model="isOpen" color="error" location="bottom" timeout="5000">
    {{ message }}

    <template #actions>
      <v-btn variant="text" @click="isOpen = false">Dismiss</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
  import { useSnackbar } from '@/composables/useSnackbar'

  const { isOpen, message } = useSnackbar()
</script>
