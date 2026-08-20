<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" lg="4" md="5" sm="8">
          <div class="text-center mb-6">
            <h1 class="text-h5 font-weight-bold">Wallet</h1>
          </div>

          <v-card elevation="2" rounded="lg">
            <v-card-text class="pa-6">
              <slot />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
</script>
