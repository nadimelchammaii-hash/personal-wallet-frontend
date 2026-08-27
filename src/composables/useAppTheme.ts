/**
 * useAppTheme
 *
 * Lets the user override the OS-detected ('system') theme with an explicit
 * Light or Dark choice, persisted in localStorage across sessions.
 */
import { ref, watch } from 'vue'
import { useTheme } from 'vuetify'

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'wallet:theme-preference'

const VALID_PREFERENCES = new Set<ThemePreference>(['system', 'light', 'dark'])

function readStoredPreference (): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return VALID_PREFERENCES.has(stored as ThemePreference) ? stored as ThemePreference : 'system'
}

const preference = ref<ThemePreference>(readStoredPreference())

export function useAppTheme () {
  const theme = useTheme()

  watch(preference, value => {
    theme.global.name.value = value
    localStorage.setItem(STORAGE_KEY, value)
  }, { immediate: true })

  function setPreference (value: ThemePreference) {
    preference.value = value
  }

  return { preference, setPreference }
}
