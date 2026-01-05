<script setup lang="ts">
/**
 * @file App.vue - Componente Raíz.
 * Contenedor principal para el sistema de enrutamiento (RouterView).
 */
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- v-app es requerido por Vuetify para funcionar correctamente -->
  <v-app>
    <RouterView />
  </v-app>
</template>

<style>
/* Estilos globales */
body {
  font-family: 'Roboto', sans-serif;
}
</style>
