/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify, type ThemeDefinition } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const walletLight: ThemeDefinition = {
  dark: false,
  colors: {
    'background': '#F8FAFC',
    'surface': '#FFFFFF',
    'surface-variant': '#F1F5F9',
    'on-surface-variant': '#64748B',
    'primary': '#4F46E5',
    'primary-darken-1': '#4338CA',
    'secondary': '#64748B',
    'error': '#E11D48',
    'success': '#059669',
    'warning': '#D97706',
    'info': '#0284C7',
    'category-01': '#6366F1',
    'category-02': '#0EA5E9',
    'category-03': '#10B981',
    'category-04': '#F59E0B',
    'category-05': '#F43F5E',
    'category-06': '#8B5CF6',
    'category-07': '#14B8A6',
    'category-08': '#F97316',
    'category-09': '#EC4899',
    'category-10': '#64748B',
  },
}

const walletDark: ThemeDefinition = {
  dark: true,
  colors: {
    'background': '#0A0F1C',
    'surface': '#121826',
    'surface-variant': '#1A2233',
    'on-surface-variant': '#94A3B8',
    'primary': '#818CF8',
    'primary-darken-1': '#A5B4FC',
    'secondary': '#94A3B8',
    'error': '#FB7185',
    'success': '#34D399',
    'warning': '#FBBF24',
    'info': '#38BDF8',
    'category-01': '#818CF8',
    'category-02': '#38BDF8',
    'category-03': '#34D399',
    'category-04': '#FBBF24',
    'category-05': '#FB7185',
    'category-06': '#A78BFA',
    'category-07': '#2DD4BF',
    'category-08': '#FB923C',
    'category-09': '#F472B6',
    'category-10': '#94A3B8',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: walletLight,
      dark: walletDark,
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'lg',
      border: true,
    },
    VBtn: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'pill',
      variant: 'tonal',
    },
    VAlert: {
      variant: 'tonal',
      rounded: 'lg',
    },
    VProgressLinear: {
      rounded: true,
      height: 8,
    },
    VDataTable: {
      density: 'comfortable',
    },
    VDataTableServer: {
      density: 'comfortable',
    },
    VDialog: {
      rounded: 'lg',
    },
    VAvatar: {
      rounded: 'circle',
    },
  },
})
