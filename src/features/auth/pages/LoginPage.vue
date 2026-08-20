<template>
  <h2 class="text-h6 mb-4">Log in</h2>

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
      autocomplete="current-password"
      :error-messages="errors.password"
      label="Password"
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
      Log in
    </v-btn>
  </v-form>

  <div class="d-flex justify-space-between mt-4 text-body-2">
    <RouterLink to="/register">Need an account?</RouterLink>
    <RouterLink to="/forgot-password">Forgot password?</RouterLink>
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

  const form = reactive({ email: '', password: '' })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await authStore.login(form)
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      router.push(redirect)
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
