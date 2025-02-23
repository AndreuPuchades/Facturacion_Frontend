<template>
  <div class="companies-layout">
    <div class="companies-container" :class="{ 'with-form': showForm }">
      <div class="companies-header">
        <div class="header-title">
          <div class="icon-container">
            <Building2 class="icon" />
          </div>
          <h1>Companies</h1>
        </div>
        <button class="add-button" @click="toggleForm">
          <PlusCircle class="icon" />
          <span>{{ showForm ? 'Close Form' : 'Add Company' }}</span>
        </button>
      </div>

      <div class="companies-grid">
        <div v-for="company in companies" :key="company.id" class="company-card">
          <div class="card-content">
            <div class="card-header">
              <div class="company-title">
                <div class="icon-container">
                  <Building2 class="icon" />
                </div>
                <h2>{{ company.name }}</h2>
              </div>
              <div class="action-buttons">
                <button class="action-btn edit" @click="handleEditCompany(company)">
                  <Edit2 class="icon" />
                </button>
                <button class="action-btn delete" @click="handleDeleteCompany(company.id)">
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>

            <div class="company-details">
              <div v-if="company.phone" class="detail-item">
                <Phone class="icon" />
                <span>{{ company.phone }}</span>
              </div>

              <div v-if="company.email" class="detail-item">
                <Mail class="icon" />
                <a :href="'mailto:' + company.email">{{ company.email }}</a>
              </div>

              <div v-if="company.website" class="detail-item">
                <Globe class="icon" />
                <a :href="company.website" target="_blank">{{ company.website }}</a>
              </div>
            </div>
          </div>

          <div v-if="company.address" class="card-footer">
            <MapPin class="icon" />
            <p>{{ company.address }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="company-form" :class="{ 'show': showForm }">
      <div class="form-header">
        <h2>Nueva Empresa</h2>
        <button class="close-button" @click="toggleForm">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-content">
        <div class="form-group">
          <label>Nombre empresa</label>
          <input
              v-model="newCompany.name"
              type="text"
              placeholder="Introduce el nombre"
              required
          >
        </div>

        <div class="form-group">
          <label>Teléfono</label>
          <input
              v-model="newCompany.phone"
              type="tel"
              placeholder="Introduce el número de teléfono"
          >
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
              v-model="newCompany.email"
              type="email"
              placeholder="Intruduce el email"
          >
        </div>

        <div class="form-group">
          <label>Web</label>
          <input
              v-model="newCompany.website"
              type="url"
              placeholder="Introduce la web"
          >
        </div>

        <div class="form-group">
          <label>Dirección</label>
          <textarea
              v-model="newCompany.address"
              placeholder="Introduce la dirección"
              rows="3"
          ></textarea>
        </div>

        <button type="submit" class="submit-button">
          <Save class="icon" />
          Save Company
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Building2, Phone, Mail, Globe, Hash, Edit2, Trash2, PlusCircle, MapPin, X, Save } from 'lucide-vue-next'
import { mapActions, mapState } from "pinia"
import { useCounterStore } from "@/stores/index.js"
import CompaniesRepository from "@/repositories/companies.repository.js";
import {useAuthStore} from "@/stores/auth.js";

export default {
  components: {
    Building2, Phone, Mail, Globe, Hash, Edit2, Trash2, PlusCircle, MapPin, X, Save
  },
  computed: {
    ...mapState(useCounterStore, ['companies']),
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  setup() {
    const showForm = ref(false)
    const newCompany = ref({
      name: '',
      phone: '',
      email: '',
      website: '',
      address: ''
    })

    return {
      showForm,
      newCompany
    }
  },
  methods: {
    ...mapActions(useCounterStore, ['loadCompanies']),

    toggleForm() {
      this.showForm = !this.showForm
    },

    async handleSubmit() {
      try {
        const companiesRespotiry = new CompaniesRepository()
        this.newCompany.user_id = useAuthStore().user.id
        if (this.newCompany.id) {
          await companiesRespotiry.updateCompany(this.newCompany)
        } else {
          const response = await companiesRespotiry.addCompany(this.newCompany)
          this.companies.push(response.data)
        }

        this.newCompany = {
          name: '',
          phone: '',
          email: '',
          website: '',
          address: ''
        }
        this.showForm = false
      } catch (error) {
        console.error('Error adding company:', error)
      }
    },

    handleEditCompany(company) {
      this.showForm = !this.showForm
      this.newCompany = company
    },

    async handleDeleteCompany(id) {
      if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
        const companiesRepository = new CompaniesRepository()
        await companiesRepository.removeCompany(id)
        this.companies = this.companies.filter(company => company.id !== id)
      }
    }
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }
    if (this.companies.length === 0) {
      await this.loadCompanies()
    }
  }
}
</script>

<style scoped>
.companies-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
}

.companies-container {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.companies-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.companies-header {
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

.companies-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.company-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.company-card:hover {
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

.company-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.company-title h2 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.company-card:hover .action-buttons {
  opacity: 1;
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
  background-color: #f8fafc;
  color: #3b82f6;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.company-details {
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

.detail-item a {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.detail-item a:hover {
  color: #2563eb;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-footer .icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.card-footer p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-card {
  animation: fadeIn 0.3s ease-out forwards;
}

.companies-grid > *:nth-child(1) { animation-delay: 0.1s; }
.companies-grid > *:nth-child(2) { animation-delay: 0.2s; }
.companies-grid > *:nth-child(3) { animation-delay: 0.3s; }
.companies-grid > *:nth-child(4) { animation-delay: 0.4s; }
.companies-grid > *:nth-child(5) { animation-delay: 0.5s; }
.companies-grid > *:nth-child(6) { animation-delay: 0.6s; }

@media (max-width: 768px) {
  .companies-grid {
    grid-template-columns: 1fr;
  }

  .companies-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-left: 1rem;
}

.company-form {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.company-form.show {
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
}

.close-button {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
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
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
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
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .companies-container.with-form {
    margin-right: 0;
    opacity: 0.5;
    pointer-events: none;
  }

  .company-form {
    width: 100%;
    right: -100%;
  }

  .company-form.show {
    right: 0;
  }
}

@media (max-width: 1024px) {
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

  .company-details {
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

  .company-card {
    position: relative;
  }
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
</style>