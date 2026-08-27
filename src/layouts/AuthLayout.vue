<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" lg="4" md="5" sm="8">
          <div class="d-flex flex-column align-center ga-3 mb-6">
            <v-avatar color="primary" rounded="lg" size="44">
              <v-icon color="white" icon="mdi-wallet" size="24" />
            </v-avatar>

            <h1 class="text-h6 font-weight-bold">Wallet</h1>
          </div>

          <v-card>
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
