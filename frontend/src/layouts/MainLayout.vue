<script setup lang="ts">
/**
 * @file MainLayout.vue - Layout principal de la aplicación.
 * 
 * Estructura:
 * - AppBar: Barra superior con título y botón de logout.
 * - NavigationDrawer: Menú lateral colapsable.
 * - Main: Área de contenido dinámico.
 * - GlobalSnackbar: Componente global para notificaciones.
 */
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const drawer = ref(true)
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

/**
 * Cierra la sesión del usuario.
 */
const logout = () => {
  authStore.logout()
}
</script>

<template>
  <v-layout class="rounded rounded-md">
    <!-- Barra Superior -->
    <v-app-bar color="primary" density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Zizcar Records</v-app-bar-title>

      <template v-slot:append>
         <span class="mr-4 text-caption">{{ authStore.user?.email || authStore.user?.username || 'User' }}</span>
        <v-btn icon="mdi-logout" variant="text" @click="logout" title="Cerrar Sesión"></v-btn>
      </template>
    </v-app-bar>

    <!-- Menú Lateral -->
    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item
          prepend-icon="mdi-table"
          title="Registros"
          value="records"
          to="/records"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido Principal -->
    <v-main>
       <v-container fluid class="fill-height bg-grey-lighten-4">
          <slot></slot>
       </v-container>
    </v-main>
    
    <!-- Snackbar Global (Notificaciones) -->
    <v-snackbar
      v-model="notificationStore.show"
      :color="notificationStore.color"
      :timeout="2000"
      location="top right"
    >
      <div class="d-flex align-center">
        <v-icon :icon="notificationStore.icon" class="mr-2"></v-icon>
        {{ notificationStore.text }}
      </div>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="notificationStore.show = false" icon="mdi-close"></v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>
