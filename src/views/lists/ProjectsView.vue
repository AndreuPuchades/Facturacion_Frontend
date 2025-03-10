<template>
  <div class="projects-layout">
    <LoadingSpinner v-if="isLoading" />
    <div class="projects-container" :class="{ 'with-form': isPopupOpen }">
      <div class="projects-header">
        <div class="header-title">
          <div class="icon-container">
            <Briefcase class="icon" />
          </div>
          <h1>{{ $t('projects.title') }}</h1>
        </div>
        <button class="add-button" @click="openAddProjectPopup">
          <PlusCircle class="icon" />
          <span>{{ $t('projects.new') }}</span>
        </button>
      </div>

      <div class="filter-container">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
              v-model="filters.name"
              type="text"
              :placeholder="$t('projects.search')"
              class="search-input"
          />
        </div>
        <select v-model="filters.client" class="category-select">
          <option value="">{{ $t('projects.allClients') }}</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
        <button @click="isFilterOpen = !isFilterOpen" class="filter-button">
          <Filter class="icon" />
          {{ isFilterOpen ? $t('projects.hideFilters') : $t('projects.showFilters') }}
        </button>
        <button @click="searchProjects" class="search-button">
          <Search class="icon" />
        </button>
      </div>

      <div v-if="isFilterOpen" class="advanced-filters">
        <div class="filter-group">
          <label>{{ $t('projects.titleStatus') }}</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">{{ $t('projects.allStatuses') }}</option>
            <option value="not_started">{{ $t('projects.status.notStarted') }}</option>
            <option value="in_progress">{{ $t('projects.status.inProgress') }}</option>
            <option value="completed">{{ $t('projects.status.completed') }}</option>
            <option value="on_hold">{{ $t('projects.status.onHold') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ $t('projects.startDateRange') }}</label>
          <div class="date-range">
            <input v-model="filters.start_date" type="date" class="date-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.end_date" type="date" class="date-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>{{ $t('projects.budgetRange') }}</label>
          <div class="amount-range">
            <input v-model="filters.budget_min" type="number" :placeholder="$t('projects.min')" class="amount-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.budget_max" type="number" :placeholder="$t('projects.max')" class="amount-input" />
          </div>
        </div>
        <div class="filter-actions">
          <button @click="resetFilters" class="reset-filters-button">{{ $t('projects.resetFilters') }}</button>
        </div>
      </div>

      <div class="projects-grid">
        <div v-for="project in projects.data" :key="project.id" class="project-card">
          <div class="card-content">
            <div class="card-header">
              <div class="project-title">
                <div class="icon-container">
                  <Briefcase class="icon pastel-blue" />
                </div>
                <h6>{{ project.name }}</h6>
              </div>
            </div>

            <div class="project-details">
              <div class="detail-item">
                <User2 class="icon pastel-purple" />
                <span>{{ getClientName(project.client) }}</span>
              </div>

              <div class="detail-item">
                <Calendar class="icon pastel-orange" />
                <span>{{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}</span>
              </div>

              <div class="detail-item">
                <Tag class="icon pastel-yellow" />
                <span :class="['status-badge', project.status]">
                  {{ getStatusText(project.status) }}
                </span>
              </div>

              <div class="detail-item">
                <DollarSign class="icon pastel-green" />
                <span>{{ formatCurrency(project.budget) }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn edit" @click="editProject(project.id)">
                <Edit2 class="icon pastel-blue" />
              </button>
              <button class="action-btn delete" @click="deleteProject(project.id)">
                <Trash2 class="icon pastel-red" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="projects.links && projects.meta" class="pagination">
        <button
            @click="changePage(projects.meta.current_page - 1)"
            :disabled="!projects.links.prev"
            class="pagination-button"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="page-info">{{ $t('common.page') }} {{ projects.meta.current_page }} {{ $t('common.of') }} {{ projects.meta.last_page }}</span>
        <button
            @click="changePage(projects.meta.current_page + 1)"
            :disabled="!projects.links.next"
            class="pagination-button"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>

    <ProjectFormPopup
        :is-open="isPopupOpen"
        :project-to-edit="projectToEdit"
        @close="closePopup"
        @project-saved="handleProjectSaved"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from "@/stores/index.js"
import ProjectFormPopup from "@/components/forms/ProjectFormPopup.vue"
import ProjectsRepository from "@/repositories/projects.repository.js"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { useAuthStore } from "@/stores/auth.js"
import { Briefcase, PlusCircle, Edit2, Trash2, User2, Calendar, Tag, DollarSign, Search, Filter } from 'lucide-vue-next'

export default {
  name: 'ProjectsView',
  components: {
    ProjectFormPopup,
    LoadingSpinner,
    Briefcase,
    PlusCircle,
    Edit2,
    Trash2,
    User2,
    Calendar,
    Tag,
    DollarSign,
    Search,
    Filter
  },
  data() {
    return {
      isPopupOpen: false,
      projectToEdit: null,
      isLoading: true,
      isFilterOpen: false,
      filters: {
        name: '',
        client: '',
        status: '',
        start_date: '',
        end_date: '',
        budget_min: '',
        budget_max: ''
      },
      projectsRepository: new ProjectsRepository()
    }
  },
  computed: {
    ...mapState(useCounterStore, ['projects', 'clients', 'selectedCompany']),
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  methods: {
    ...mapActions(useCounterStore, ['loadProjects', 'loadClients']),
    async searchProjects(page = 1) {
      this.isLoading = true
      try {
        const params = {
          company_id: this.selectedCompany.id,
          page,
          per_page: 10,
          ...this.filters
        }
        Object.keys(params).forEach(key =>
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        )
        await this.loadProjects(params)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        this.isLoading = false
      }
    },
    resetFilters() {
      this.filters = {
        name: '',
        client: '',
        status: '',
        start_date: '',
        end_date: '',
        budget_min: '',
        budget_max: ''
      }
      this.searchProjects()
    },
    openAddProjectPopup() {
      this.projectToEdit = null
      this.isPopupOpen = true
    },
    closePopup() {
      this.isPopupOpen = false
      this.projectToEdit = null
    },
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString(this.$i18n.locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    formatCurrency(amount) {
      if (amount === null) return 'N/A'
      return new Intl.NumberFormat(this.$i18n.locale === 'es' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: this.$i18n.locale === 'es' ? 'EUR' : 'USD'
      }).format(amount)
    },
    getStatusText(status) {
      const statusMap = {
        'not_started': this.$t('projects.status.notStarted'),
        'in_progress': this.$t('projects.status.inProgress'),
        'completed': this.$t('projects.status.completed'),
        'on_hold': this.$t('projects.status.onHold')
      }
      return statusMap[status] || status
    },
    getClientName(client) {
      return client ? client.name : this.$t('projects.noClient')
    },
    async editProject(id) {
      this.isLoading = true
      try {
        const projectToEdit = this.projects.data.find(project => project.id === id)
        if (projectToEdit) {
          this.projectToEdit = projectToEdit
          this.isPopupOpen = true
        }
      } catch (error) {
        console.error('Error editing project:', error)
      } finally {
        this.isLoading = false
      }
    },
    async deleteProject(id) {
      if (confirm(this.$t('projects.confirmDelete'))) {
        this.isLoading = true
        try {
          await this.projectsRepository.removeProject(id)
          await this.searchProjects()
        } catch (error) {
          console.error('Error deleting project:', error)
        } finally {
          this.isLoading = false
        }
      }
    },
    handleProjectSaved() {
      this.closePopup()
      this.searchProjects()
    },
    async changePage(page) {
      if (page < 1 || page > this.projects.meta.last_page) return
      await this.searchProjects(page)
    },
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
      return
    }

    this.isLoading = true
    try {
      await this.searchProjects()
      if (this.clients.length === 0) {
        await this.loadClients()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
/* Styles remain unchanged */
.projects-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
}

.projects-container {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.projects-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.projects-header {
  background-color: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1e293b;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  padding: 0.5rem;
  border-radius: 8px;
}

.icon-container .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-button:hover {
  background-color: #eff6ff;
}

.projects-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.project-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 2rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-bottom: 0;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.project-title h6 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
  margin-left: 1rem;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit:hover {
  background-color: #E6F3FF;
}

.action-btn.delete:hover {
  background-color: #FFE6E6;
}

.project-details {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  min-width: 200px;
}

.detail-item:hover {
  background-color: #f8fafc;
}

.detail-item .icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  margin-right: 0.75rem;
}

.detail-item span {
  font-size: 0.875rem;
  color: #475569;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.not_started { background-color: #e9ecef; color: #495057; }
.status-badge.in_progress { background-color: #d0ebff; color: #1971c2; }
.status-badge.completed { background-color: #d3f9d8; color: #2b8a3e; }
.status-badge.on_hold { background-color: #fff3bf; color: #e67700; }

.filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.category-select {
  padding: 0.625rem 2rem 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  transition: all 0.3s ease;
}

.category-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.advanced-filters {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  flex: 1 1 200px;
}

.filter-group label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.date-range,
.amount-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input,
.amount-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
}

.reset-filters-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #e2e8f0;
  color: #64748b;
}

.reset-filters-button:hover {
  background-color: #cbd5e1;
}

@media (max-width: 768px) {
  .projects-container.with-form {
    margin-right: 0;
    opacity: 0.5;
    pointer-events: none;
  }

  .projects-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .card-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .project-details {
    flex-direction: column;
    align-items: stretch;
    margin-left: 0;
    gap: 0.5rem;
  }

  .detail-item {
    min-width: 0;
  }

  .action-buttons {
    position: absolute;
    top: 1rem;
    right: 1rem;
    margin-left: 0;
  }

  .project-card {
    position: relative;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #5d92fa;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-button:hover {
  background-color: #346eef;
}

.search-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.search-button .icon {
  width: 1rem;
  height: 1rem;
}

.pastel-green { color: #98FB98; }
.pastel-blue { color: #ADD8E6; }
.pastel-red { color: #FFA07A; }
.pastel-purple { color: #DDA0DD; }
.pastel-orange { color: #FFD8B1; }
.pastel-yellow { color: #FFFACD; }
.pastel-pink { color: #FFB6C1; }
.pastel-teal { color: #AFEEEE; }
</style>