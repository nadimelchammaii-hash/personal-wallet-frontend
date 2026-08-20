import { isAxiosError } from 'axios'

/** Laravel's standard 422 validation error shape: { message, errors: { field: string[] } }. */
export function extractFieldErrors (error: unknown): Record<string, string> {
  if (isAxiosError(error) && error.response?.status === 422) {
    const errors = error.response.data?.errors as Record<string, string[]> | undefined
    if (errors) {
      return Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
      )
    }
  }

  return {}
}

export function extractErrorMessage (error: unknown): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }

  return 'Something went wrong. Please try again.'
}
