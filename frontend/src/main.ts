/**
 * @file main.ts - Punto de entrada de la aplicación Vue.
 * 
 * Configura:
 * - Pinia (Gestión de Estado)
 * - Vue Router (Navegación)
 * - Vuetify (Framework UI)
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

// Registro de plugins globales
app.use(createPinia())
app.use(router)
app.use(vuetify)

// Montaje en el DOM (#app)
app.mount('#app')
