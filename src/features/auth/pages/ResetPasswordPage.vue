<template>
  <h2 class="text-h6 mb-4">Set a new password</h2>

  <v-alert
    v-if="generalError"
    class="mb-4"
    closable
    type="error"
    @click:close="generalError = null"
  >
    {{ generalError }}
  </v-alert>

  <v-form @submit.prevent="handleSubmit">
    <v-text-field
      v-model="form.email"
      autocomplete="email"
      :error-messages="errors.email"
      label="Email"
      type="email"
    />

    <v-text-field
      v-model="form.password"
      autocomplete="new-password"
      :error-messages="errors.password"
      label="New password"
      type="password"
    />

    <v-text-field
      v-model="form.password_confirmation"
      autocomplete="new-password"
      label="Confirm new password"
      type="password"
    />

    <v-btn
      block
      class="mt-2"
      color="primary"
      :loading="isSubmitting"
      size="large"
      type="submit"
    >
      Reset password
    </v-btn>
  </v-form>

  <div class="mt-4 text-body-2">
    <RouterLink to="/login">Back to log in</RouterLink>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import { RouterLink, useRoute, useRouter } from 'vue-router'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const form = reactive({
    token: typeof route.query.token === 'string' ? route.query.token : '',
    email: typeof route.query.email === 'string' ? route.query.email : '',
    password: '',
    password_confirmation: '',
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await authStore.resetPassword(form)
      router.push('/login')
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
