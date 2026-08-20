<template>
  <h2 class="text-h6 mb-4">Reset your password</h2>

  <v-alert v-if="successMessage" class="mb-4" type="success">
    {{ successMessage }}
  </v-alert>

  <v-alert
    v-if="generalError"
    class="mb-4"
    closable
    type="error"
    @click:close="generalError = null"
  >
    {{ generalError }}
  </v-alert>

  <p class="text-body-2 text-medium-emphasis mb-4">
    Enter your email and we'll send you a link to reset your password.
  </p>

  <v-form @submit.prevent="handleSubmit">
    <v-text-field
      v-model="email"
      autocomplete="email"
      :error-messages="errors.email"
      label="Email"
      type="email"
    />

    <v-btn
      block
      class="mt-2"
      color="primary"
      :loading="isSubmitting"
      size="large"
      type="submit"
    >
      Send reset link
    </v-btn>
  </v-form>

  <div class="mt-4 text-body-2">
    <RouterLink to="/login">Back to log in</RouterLink>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()

  const email = ref('')
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const isSubmitting = ref(false)

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    successMessage.value = null
    isSubmitting.value = true

    try {
      await authStore.forgotPassword(email.value)
      successMessage.value = 'If an account exists for that email, a reset link has been sent.'
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        errors.value = fieldErrors
      } else {
        generalError.value = extractErrorMessage(error)
      }
    } finally {
      isSubmitting.value = false
    }
  }
</script>
