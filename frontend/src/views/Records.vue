<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import type { Record } from '../types/record'
import { useRecords } from '../composables/useRecords'

// Inyección de lógica de negocio (Composables)
const { 
    records, 
    loading, 
    loadRecords, 
    saveRecord: saveRecordApi, 
    deleteRecord: deleteRecordApi,
    runEtl, 
    generateNextId 
} = useRecords()

// Estado local exclusivo de la UI (Búsqueda, diálogos)
const search = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editedIndex = ref(-1)
const recordToDelete = ref<number | null>(null)

// Item en edición
const editedItem = ref<Partial<Record>>({
    sourceId: '',
    date: '',
    category: '',
    amount: 0,
    status: 'pendiente',
    description: ''
})

// Columnas de la tabla
const headers = [
  { title: 'ID', key: 'sourceId' },
  { title: 'Fecha', key: 'date' },
  { title: 'Categoría', key: 'category' },
  { title: 'Monto', key: 'amount' },
  { title: 'Estado', key: 'status' },
  { title: 'Descripción', key: 'description' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

/**
 * Abre el diálogo de creación/edición.
 * Si recibe un item, lo carga para editar. Si no, inicializa uno nuevo con ID automático.
 */
const openDialog = (item?: Record) => {
    if (item) {
        editedIndex.value = records.value.indexOf(item);
        editedItem.value = { ...item };
    } else {
        editedIndex.value = -1;
        editedItem.value = {
            sourceId: generateNextId(),
            date: new Date().toISOString().substr(0, 10),
            category: 'Servicios',
            amount: 0,
            status: 'pendiente',
            description: ''
        };
    }
    dialog.value = true;
}

const closeDialog = () => {
    dialog.value = false;
    setTimeout(() => {
        editedItem.value = {} as any;
        editedIndex.value = -1;
    }, 300)
}

/**
 * Maneja el guardado del registro delegando al composable.
 */
const saveRecord = async () => {
    const isEdit = editedIndex.value > -1;
    const success = await saveRecordApi(editedItem.value, isEdit);
    
    if (success) {
        closeDialog();
    }
}

// Lógica de eliminación
const openDeleteDialog = (id: number) => {
    recordToDelete.value = id;
    deleteDialog.value = true;
}

const closeDeleteDialog = () => {
    deleteDialog.value = false;
    recordToDelete.value = null;
}

const confirmDelete = async () => {
    if (recordToDelete.value === null) return;
    const success = await deleteRecordApi(recordToDelete.value);
    if(success) {
        closeDeleteDialog();
    }
}

onMounted(() => {
  loadRecords()
})
</script>

<template>
  <MainLayout>
    <v-card class="elevation-2 rounded-lg">
      <v-card-title class="d-flex align-center flex-wrap bg-white pa-4 gap-2">
        <span class="text-h5 font-weight-bold text-primary mr-4">Registros Financieros</span>
        <v-spacer class="d-none d-sm-flex"></v-spacer>
        
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar por ID, Categoría..."
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="flex-grow-1 flex-sm-grow-0 my-2 my-sm-0"
          style="min-width: 200px; max-width: 300px"
        ></v-text-field>

        <div class="d-flex mt-2 mt-sm-0 ml-sm-2 w-100 w-sm-auto justify-end">
            <v-btn color="secondary" @click="runEtl" prepend-icon="mdi-refresh" class="mr-2" :loading="loading">
                ETL
            </v-btn>
            <v-btn color="primary" @click="openDialog()" prepend-icon="mdi-plus">
                Nuevo
            </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="records"
        :search="search"
        :loading="loading"
        loading-text="Cargando registros..."
        no-data-text="No hay registros disponibles"
        class="elevation-0"
        hover
      >
        <!-- Formato de Moneda (CLP) -->
        <template v-slot:item.amount="{ item }">
           {{ new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.amount) }}
        </template>
        
        <!-- Chips de Estado (Colores dinámicos) -->
        <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'activo' || item.status === 'completado' ? 'success' : (item.status === 'cancelado' ? 'error' : 'warning')" size="small" class="text-capitalize">
                {{ item.status }}
            </v-chip>
        </template>

        <!-- Columna de Acciones (Editar/Eliminar) -->
        <template v-slot:item.actions="{ item }">
            <v-tooltip text="Editar">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" class="me-2 text-primary" @click="openDialog(item)">mdi-pencil</v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Eliminar">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" class="text-error" @click="openDeleteDialog(item.id)">mdi-delete</v-icon>
                </template>
            </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog for Create/Edit -->
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="bg-primary text-white pa-4">
                <span class="text-h6">{{ editedIndex === -1 ? '✨ Crear Nuevo Registro' : '✏️ Editar Registro' }}</span>
            </v-card-title>
            <v-card-text class="pt-4">
                <v-container>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field 
                                v-model="editedItem.sourceId" 
                                label="ID de Referencia (Auto)" 
                                variant="outlined" 
                                density="compact"
                                prepend-inner-icon="mdi-identifier"
                                hint="Formato: INV-YYYY-XXX"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field 
                                v-model="editedItem.date" 
                                label="Fecha" 
                                type="date" 
                                variant="outlined" 
                                density="compact"
                            ></v-text-field>
                        </v-col>
                         <v-col cols="12" sm="6">
                            <v-text-field 
                                v-model.number="editedItem.amount" 
                                label="Monto" 
                                type="number" 
                                variant="outlined" 
                                density="compact"
                                prefix="$"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select 
                                v-model="editedItem.category" 
                                :items="['Servicios', 'Inventario', 'Gastos', 'Ventas']"
                                label="Categoría" 
                                variant="outlined" 
                                density="compact"
                            ></v-select>
                        </v-col>
                        <v-col cols="12">
                             <v-select
                                v-model="editedItem.status"
                                :items="['pendiente', 'completado', 'cancelado', 'activo']"
                                label="Estado"
                                variant="outlined"
                                density="compact"
                            ></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea 
                                v-model="editedItem.description" 
                                label="Descripción" 
                                variant="outlined" 
                                rows="2"
                                auto-grow
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey-darken-1" variant="tonal" @click="closeDialog">Cancelar</v-btn>
                <v-btn color="primary" variant="elevated" @click="saveRecord" :loading="loading" class="ml-2">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
            <v-card-title class="text-h5 bg-red-lighten-1 text-white">¿Eliminar Registro?</v-card-title>
            <v-card-text class="pa-4">
                Estás a punto de eliminar este registro permanentemente. ¿Estás seguro de que deseas continuar?
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey-darken-1" variant="text" @click="closeDeleteDialog">Cancelar</v-btn>
                <v-btn color="red-darken-1" variant="elevated" @click="confirmDelete" :loading="loading">Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </MainLayout>
</template>
