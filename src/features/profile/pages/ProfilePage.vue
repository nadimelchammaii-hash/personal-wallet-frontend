<template>
  <h1 class="text-h4 mb-6">Profile</h1>

  <v-row>
    <v-col cols="12" md="6">
      <v-card class="mb-4">
        <v-card-title>Appearance</v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">Choose how Wallet looks on this device.</div>

          <v-btn-toggle
            color="primary"
            divided
            mandatory
            :model-value="preference"
            variant="outlined"
            @update:model-value="setPreference"
          >
            <v-btn prepend-icon="mdi-theme-light-dark" value="system">System</v-btn>
            <v-btn prepend-icon="mdi-white-balance-sunny" value="light">Light</v-btn>
            <v-btn prepend-icon="mdi-weather-night" value="dark">Dark</v-btn>
          </v-btn-toggle>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Profile info</v-card-title>

        <v-card-text>
          <v-alert v-if="profileSuccess" class="mb-4" type="success">Profile updated.</v-alert>

          <v-alert
            v-if="profileError"
            class="mb-4"
            closable
            type="error"
            @click:close="profileError = null"
          >
            {{ profileError }}
          </v-alert>

          <v-form @submit.prevent="handleProfileSubmit">
            <v-text-field
              v-model="profileForm.name"
              :error-messages="profileErrors.name"
              label="Name"
            />

            <v-text-field
              v-model="profileForm.email"
              :error-messages="profileErrors.email"
              label="Email"
              type="email"
            />

            <v-select
              v-model="profileForm.currency"
              :error-messages="profileErrors.currency"
              :items="currencies"
              label="Currency"
            />

            <v-select
              v-model="profileForm.timezone"
              :error-messages="profileErrors.timezone"
              :items="timezones"
              label="Timezone"
            />

            <v-btn color="primary" :loading="isProfileSubmitting" type="submit">
              Save changes
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Change password</v-card-title>

        <v-card-text>
          <v-alert v-if="passwordSuccess" class="mb-4" type="success">Password updated.</v-alert>

          <v-alert
            v-if="passwordError"
            class="mb-4"
            closable
            type="error"
            @click:close="passwordError = null"
          >
            {{ passwordError }}
          </v-alert>

          <v-form @submit.prevent="handlePasswordSubmit">
            <v-text-field
              v-model="passwordForm.current_password"
              autocomplete="current-password"
              :error-messages="passwordErrors.current_password"
              label="Current password"
              type="password"
            />

            <v-text-field
              v-model="passwordForm.password"
              autocomplete="new-password"
              :error-messages="passwordErrors.password"
              label="New password"
              type="password"
            />

            <v-text-field
              v-model="passwordForm.password_confirmation"
              autocomplete="new-password"
              label="Confirm new password"
              type="password"
            />

            <v-btn color="primary" :loading="isPasswordSubmitting" type="submit">
              Update password
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import { useAppTheme } from '@/composables/useAppTheme'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const { preference, setPreference } = useAppTheme()

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  const timezones = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['UTC']

  const profileForm = reactive({
    name: authStore.user?.name ?? '',
    email: authStore.user?.email ?? '',
    currency: authStore.user?.currency ?? 'USD',
    timezone: authStore.user?.timezone ?? 'UTC',
  })
  const profileErrors = ref<Record<string, string>>({})
  const profileError = ref<string | null>(null)
  const profileSuccess = ref(false)
  const isProfileSubmitting = ref(false)

  async function handleProfileSubmit () {
    profileErrors.value = {}
    profileError.value = null
    profileSuccess.value = false
    isProfileSubmitting.value = true

    try {
      await authStore.updateProfile(profileForm)
      profileSuccess.value = true
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        profileErrors.value = fieldErrors
      } else {
        profileError.value = extractErrorMessage(error)
      }
    } finally {
      isProfileSubmitting.value = false
    }
  }

  const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' })
  const passwordErrors = ref<Record<string, string>>({})
  const passwordError = ref<string | null>(null)
  const passwordSuccess = ref(false)
  const isPasswordSubmitting = ref(false)

  async function handlePasswordSubmit () {
    passwordErrors.value = {}
    passwordError.value = null
    passwordSuccess.value = false
    isPasswordSubmitting.value = true

    try {
      await authStore.updatePassword(passwordForm)
      passwordSuccess.value = true
      passwordForm.current_password = ''
      passwordForm.password = ''
      passwordForm.password_confirmation = ''
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        passwordErrors.value = fieldErrors
      } else {
        passwordError.value = extractErrorMessage(error)
      }
    } finally {
      isPasswordSubmitting.value = false
    }
  }
</script>
