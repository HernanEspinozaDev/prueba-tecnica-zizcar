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
  <v-container class="fill-height login-background" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <!-- Logo Corporativo -->
        <div class="text-center mb-10">
            <v-img src="/logo-zizcar2.webp" max-height="150" contain class="mx-auto filter-drop-shadow"></v-img>
        </div>

        <!-- Tarjeta de Login -->
        <v-card class="elevation-8 rounded-xl">
          <v-card-text class="pa-8">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Email Corporativo"
                name="username"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                color="primary"
                density="comfortable"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-inner-icon="mdi-lock"
                type="password"
                variant="outlined"
                color="primary"
                density="comfortable"
              ></v-text-field>
              
              <v-alert v-if="error" type="error" class="mb-4" density="compact" variant="tonal">{{ error }}</v-alert>

              <v-btn type="submit" color="primary" block size="large" class="mt-6 text-none font-weight-bold rounded-lg" :loading="loading" elevation="4">
                Iniciar Sesión
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-background {
  /* Fondo Verde Claro "Tipo Crema" que permite ver letras blancas.
     Usamos un verde suave pero con suficiente saturación. */
  background-color: #81C784; 
  background: linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%);
}

.filter-drop-shadow {
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}
</style>
