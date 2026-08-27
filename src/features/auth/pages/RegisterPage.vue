<template>
  <h2 class="text-h6 mb-4">Create an account</h2>

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
      v-model="form.name"
      autocomplete="name"
      :error-messages="errors.name"
      label="Name"
    />

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
      label="Password"
      type="password"
    />

    <v-text-field
      v-model="form.password_confirmation"
      autocomplete="new-password"
      label="Confirm password"
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
      Create account
    </v-btn>
  </v-form>

  <div class="mt-4 text-body-2">
    <RouterLink to="/login">Already have an account?</RouterLink>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import { RouterLink, useRouter } from 'vue-router'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()

  const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await authStore.register(form)
      router.push('/')
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
