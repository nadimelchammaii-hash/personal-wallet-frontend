/**
 * useSnackbar
 *
 * Minimal global toast for unexpected failures (network errors, 5xx
 * responses) that aren't already handled inline by a form's field/general
 * error state. Shared module-level state, same pattern as useAppTheme.
 */
import { ref } from 'vue'

const isOpen = ref(false)
const message = ref('')

export function useSnackbar () {
  function show (text: string) {
    message.value = text
    isOpen.value = true
  }

  return { isOpen, message, show }
}
