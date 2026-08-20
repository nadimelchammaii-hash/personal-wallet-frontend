<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card>
      <v-card-title>Manage categories</v-card-title>

      <v-card-text>
        <v-alert
          v-if="generalError"
          class="mb-4"
          closable
          type="error"
          @click:close="generalError = null"
        >
          {{ generalError }}
        </v-alert>

        <div v-for="type in ['expense', 'income'] as const" :key="type" class="mb-4">
          <div class="text-subtitle-2 text-medium-emphasis mb-1">
            {{ type === 'expense' ? 'Expense categories' : 'Income categories' }}
          </div>

          <v-list density="compact">
            <v-list-item v-for="category in byType(type)" :key="category.id">
              <template #prepend>
                <v-icon :color="category.color ?? undefined" :icon="category.icon ?? 'mdi-shape'" />
              </template>

              <v-list-item-title>{{ category.name }}</v-list-item-title>

              <template v-if="!category.is_default" #append>
                <v-btn icon="mdi-pencil" size="small" variant="text" @click="startEdit(category)" />
                <v-btn icon="mdi-delete" size="small" variant="text" @click="handleDelete(category)" />
              </template>

              <template v-else #append>
                <v-chip size="small">Default</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <v-divider class="mb-4" />

        <div class="text-subtitle-2 mb-2">{{ editingId ? 'Edit category' : 'Add a category' }}</div>

        <v-form @submit.prevent="handleSubmit">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.name" :error-messages="errors.name" label="Name" />
            </v-col>

            <v-col cols="6" sm="3">
              <v-select
                v-model="form.type"
                :error-messages="errors.type"
                item-title="title"
                item-value="value"
                :items="typeOptions"
                label="Type"
              />
            </v-col>

            <v-col cols="6" sm="3">
              <v-select
                v-model="form.icon"
                item-title="title"
                item-value="value"
                :items="iconOptions"
                label="Icon"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps" :prepend-icon="item.value" />
                </template>

                <template #selection="{ item }">
                  <v-icon :icon="item.value" start />{{ item.title }}
                </template>
              </v-select>
            </v-col>

            <v-col class="d-flex align-center" cols="12" sm="2">
              <v-btn block color="primary" :loading="isSubmitting" type="submit">
                {{ editingId ? 'Save' : 'Add' }}
              </v-btn>
            </v-col>
          </v-row>

          <v-btn v-if="editingId" size="small" variant="text" @click="resetForm">Cancel edit</v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { type Category, type CategoryType, useCategoriesStore } from '@/stores/categories'

  const categoriesStore = useCategoriesStore()

  const isOpen = defineModel<boolean>({ required: true })

  const typeOptions: { title: string, value: CategoryType }[] = [
    { title: 'Expense', value: 'expense' },
    { title: 'Income', value: 'income' },
  ]

  const iconOptions = [
    { title: 'Food', value: 'mdi-food' },
    { title: 'Transport', value: 'mdi-car' },
    { title: 'Shopping', value: 'mdi-cart' },
    { title: 'Bills', value: 'mdi-file-document-outline' },
    { title: 'Entertainment', value: 'mdi-movie-open' },
    { title: 'Health', value: 'mdi-medical-bag' },
    { title: 'Education', value: 'mdi-school' },
    { title: 'Salary', value: 'mdi-cash-multiple' },
    { title: 'Home', value: 'mdi-home' },
    { title: 'Gift', value: 'mdi-gift' },
    { title: 'Other', value: 'mdi-shape' },
  ]

  function byType (type: CategoryType) {
    return categoriesStore.categories.filter(category => category.type === type)
  }

  const editingId = ref<number | null>(null)
  const form = reactive({ name: '', type: 'expense' as CategoryType, icon: 'mdi-shape' })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  function resetForm () {
    editingId.value = null
    form.name = ''
    form.type = 'expense'
    form.icon = 'mdi-shape'
    errors.value = {}
  }

  function startEdit (category: Category) {
    editingId.value = category.id
    form.name = category.name
    form.type = category.type
    form.icon = category.icon ?? 'mdi-shape'
  }

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      await (editingId.value ? categoriesStore.updateCategory(editingId.value, { ...form }) : categoriesStore.createCategory({ ...form }))
      resetForm()
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

  async function handleDelete (category: Category) {
    try {
      await categoriesStore.deleteCategory(category.id)
    } catch (error) {
      generalError.value = extractErrorMessage(error)
    }
  }
</script>
