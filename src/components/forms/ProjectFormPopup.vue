<template>
  <div class="project-form" :class="{ 'show': isOpen }">
    <div class="form-header">
      <h2>{{ $t(projectToEdit ? 'projects.form.title.edit' : 'projects.form.title.add') }}</h2>
      <button class="close-button" @click="closePopup">
        <X class="icon" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <div class="form-group">
        <label for="name">{{ $t('projects.form.projectName') }}</label>
        <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            :placeholder="$t('projects.form.projectName')"
        >
      </div>

      <div class="form-group">
        <label for="client_id">{{ $t('projects.form.client') }}</label>
        <select
            id="client_id"
            v-model="formData.client_id"
            required
        >
          <option value="">{{ $t('projects.form.selectClient') }}</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">{{ $t('projects.form.description') }}</label>
        <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            :placeholder="$t('projects.form.description')"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="start_date">{{ $t('projects.form.startDate') }}</label>
        <input
            id="start_date"
            v-model="formData.start_date"
            type="date"
            required
        >
      </div>

      <div class="form-group">
        <label for="end_date">{{ $t('projects.form.endDate') }}</label>
        <input
            id="end_date"
            v-model="formData.end_date"
            type="date"
        >
      </div>

      <div class="form-group">
        <label for="status">{{ $t('projects.form.status') }}</label>
        <select
            id="status"
            v-model="formData.status"
            required
        >
          <option value="not_started">{{ $t('projects.status.notStarted') }}</option>
          <option value="in_progress">{{ $t('projects.status.inProgress') }}</option>
          <option value="completed">{{ $t('projects.status.completed') }}</option>
          <option value="on_hold">{{ $t('projects.status.onHold') }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="budget">{{ $t('projects.form.budget') }}</label>
        <input
            id="budget"
            v-model="formData.budget"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
        >
      </div>

      <button type="submit" class="submit-button">
        <Save class="icon" />
        {{ projectToEdit ? $t('projects.form.update') : $t('projects.form.create') }} {{ $t('projects.project') }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from '@/stores/index.js'
import ProjectsRepository from '@/repositories/projects.repository.js'
import { X, Save } from 'lucide-vue-next'

export default {
  name: 'ProjectFormPopup',
  components: {
    X,
    Save
  },
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
        formData.value.start_date = formatDateForInput(newProject.start_date)
        formData.value.end_date = formatDateForInput(newProject.end_date)
      } else {
        resetForm()
      }
    }, { immediate: true })

    watch(() => props.isOpen, (newVal) => {
      if (!newVal) {
        resetForm()
      }
    })

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
/* Styles remain unchanged */
.project-form {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.project-form.show {
  right: 0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.form-header h2 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0;
}

.close-button {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #ef4444;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #1e293b;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.form-content::-webkit-scrollbar {
  width: 6px;
}

.form-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.form-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.form-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .project-form {
    width: 100%;
    right: -100%;
  }
}
</style>