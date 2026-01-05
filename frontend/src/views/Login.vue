<script setup lang="ts">
/**
 * @file Login.vue - Vista de Autenticación.
 * 
 * Permite a los usuarios ingresar sus credenciales para obtener un JWT.
 * Maneja errores de validación y redirige al dashboard al tener éxito.
 */
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const username = ref('')
const password = ref('')
const authStore = useAuthStore()
const error = ref('')
const loading = ref(false)

/**
 * Maneja el envío del formulario de login.
 * Muestra feedback visual durante la carga y en caso de erro.
 */
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
  } catch (e: any) {
    // Captura errores específicos del backend
    if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message // Ej: 'El usuario no existe'
    } else {
      error.value = 'Error al iniciar sesión'
    }
    // Auto-ocultar error después de 2 segundos
    setTimeout(() => {
        error.value = ''
    }, 2000)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height bg-deep-purple-accent-4" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <!-- Tarjeta de Login -->
        <v-card class="elevation-12 rounded-lg">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Zizcar Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Email"
                name="username"
                prepend-icon="mdi-email"
                type="email"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                variant="outlined"
              ></v-text-field>
              
              <v-alert v-if="error" type="error" class="mb-4" density="compact">{{ error }}</v-alert>

              <v-btn type="submit" color="primary" block size="large" :loading="loading">Ingresar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
