<template>
  <div v-if="isOpen" class="popup-overlay">
    <div class="popup-content">
      <h2>{{ projectToEdit ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Nombre del Proyecto</label>
          <input
              id="name"
              v-model="formData.name"
              type="text"
              required
          >
        </div>
        <div class="form-group">
          <label for="client_id">Cliente</label>
          <select
              id="client_id"
              v-model="formData.client_id"
              required
          >
            <option value="">Seleccionar Cliente</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
              id="description"
              v-model="formData.description"
              rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="start_date">Fecha de Inicio</label>
          <input
              id="start_date"
              v-model="formData.start_date"
              type="date"
              required
          >
        </div>
        <div class="form-group">
          <label for="end_date">Fecha de Fin</label>
          <input
              id="end_date"
              v-model="formData.end_date"
              type="date"
          >
        </div>
        <div class="form-group">
          <label for="status">Estado</label>
          <select
              id="status"
              v-model="formData.status"
              required
          >
            <option value="not_started">No iniciado</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completado</option>
            <option value="on_hold">En espera</option>
          </select>
        </div>
        <div class="form-group">
          <label for="budget">Presupuesto</label>
          <input
              id="budget"
              v-model="formData.budget"
              type="number"
              step="0.01"
              min="0"
          >
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ projectToEdit ? 'Actualizar' : 'Crear' }} Proyecto
          </button>
          <button type="button" @click="closePopup" class="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from '@/stores/index.js'
import ProjectsRepository from '@/repositories/projects.repository.js'

export default {
  name: 'ProjectFormPopup',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    projectToEdit: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const formData = ref({
      name: '',
      client_id: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'not_started',
      budget: null
    })

    const projectsRepository = new ProjectsRepository()

    const resetForm = () => {
      formData.value = {
        name: '',
        client_id: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'not_started',
        budget: null
      }
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }

    const closePopup = () => {
      emit('close')
      resetForm()
    }

    watch(() => props.projectToEdit, (newProject) => {
      if (newProject) {
        formData.value = { ...newProject }
        formData.value.client_id = newProject.client.id
        formatDateForInput(newProject.start_date)
        formData.value.end_date = formatDateForInput(newProject.end_date)
      } else {
        resetForm()
      }
    }, { immediate: true })

    return {
      formData,
      closePopup,
      projectsRepository
    }
  },
  computed: {
    ...mapState(useCounterStore, ['clients'])
  },
  methods: {
    ...mapActions(useCounterStore, ['loadProjects', 'loadClients']),
    async handleSubmit() {
      try {
        if (this.projectToEdit) {
          await this.projectsRepository.updateProject(this.projectToEdit.id, this.formData)
        } else {
          await this.projectsRepository.createProject(this.formData)
        }
        await this.loadProjects()
        this.closePopup()
      } catch (error) {
        console.error('Error submitting project:', error)
      }
    }
  },
  async mounted() {
    if (this.clients.length === 0) {
      await this.loadClients()
    }
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

input[type="text"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="text"]:focus,
input[type="date"]:focus,
input[type="number"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #1e293b;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}
</style>