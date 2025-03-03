<template>
  <div class="profile-container">
    <LoadingSpinner v-if="isLoading" />
    <div v-if="!isLoading" class="profile-header">
      <h1 class="profile-title">Perfil de Usuario</h1>
      <button @click="updateProfile" class="save-profile-btn" :disabled="loading">
        <svg v-if="loading" class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Guardar Cambios
      </button>
    </div>

    <div v-if="!isLoading" class="profile-grid">
      <div class="profile-card">
        <div class="card-header">
          <div class="profile-avatar">
            <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="Profile photo" class="avatar-image" />
            <span v-else>{{getInitial(form.name)}}</span>
          </div>
          <h2 class="profile-name">{{ form.name }}</h2>
          <button @click="$refs.photoInput.click()" class="change-photo-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input
              style="display: none"
              ref="photoInput"
              type="file"
              class="hidden"
              accept="image/*"
              @change="updateProfilePhoto"
          />
        </div>
        <div class="profile-info">
          <div class="info-group">
            <label for="name" class="info-label">Nombre</label>
            <input id="name" v-model="form.name" type="text" class="info-input" />
          </div>
          <div class="info-group">
            <label for="email" class="info-label">Email</label>
            <input id="email" v-model="form.email" type="email" class="info-input" />
          </div>
        </div>
      </div>

      <div v-if="!isLoading" class="profile-card">
        <div class="card-header">
          <h2 class="section-title">Cambiar Contraseña</h2>
        </div>
        <div class="profile-info">
          <div class="info-group">
            <label for="current_password" class="info-label">Contraseña Actual</label>
            <input id="current_password" v-model="passwordForm.current_password" type="password" class="info-input" />
          </div>
          <div class="info-group">
            <label for="new_password" class="info-label">Nueva Contraseña</label>
            <input id="new_password" v-model="passwordForm.password" type="password" class="info-input" />
          </div>
          <div class="info-group">
            <label for="password_confirmation" class="info-label">Confirmar Nueva Contraseña</label>
            <input id="password_confirmation" v-model="passwordForm.password_confirmation" type="password" class="info-input" />
          </div>
        </div>
        <div class="card-footer">
          <button @click="updatePassword" class="update-password-btn" :disabled="passwordLoading">
            <svg v-if="passwordLoading" class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizar Contraseña
          </button>
        </div>
      </div>

      <div v-if="userStats.role === 'admin' && userStats.role === 'client' && !isLoading" class="profile-card stats-card">
        <div class="card-header">
          <h2 class="section-title">Estadísticas</h2>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Empresas</span>
            <span class="stat-value">{{ userStats.companies_count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Clientes</span>
            <span class="stat-value">{{ userStats.clients_count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Miembro desde</span>
            <span class="stat-value">{{ formatDate(userStats.created_at) }}</span>
          </div>
        </div>
      </div>

      <div v-if="userStats.role === 'employee' && !isLoading" class="profile-card stats-card">
        <div style="justify-content: center; align-content: center; text-align: center">
          <div class="stat-item">
            <span class="stat-label">Miembro desde</span>
            <span class="stat-value">{{ formatDate(userStats.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-container">
      <transition name="fade">
        <div v-if="showSuccess" class="toast success">
          {{ successMessage }}
        </div>
      </transition>
      <transition name="fade">
        <div v-if="showError" class="toast error">
          {{ errorMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import UserRepository from '@/repositories/user.repository.js'
import {mapState} from "pinia";
import {useAuthStore} from "@/stores/auth.js";

export default {
  components: { LoadingSpinner },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  data() {
    return {
      userRepository: new UserRepository(),
      form: {
        name: '',
        email: '',
      },
      passwordForm: {
        current_password: '',
        password: '',
        password_confirmation: '',
      },
      loading: false,
      passwordLoading: false,
      profilePhotoUrl: '',
      userStats: {
        companies_count: 0,
        clients_count: 0,
        created_at: null,
      },
      showSuccess: false,
      showError: false,
      successMessage: '',
      errorMessage: '',
      isLoading: true,
    }
  },
  methods: {
    async loadUserData() {
      try {
        const userData = await this.userRepository.getUserProfile()
        this.form.name = userData.data.name
        this.form.email = userData.data.email
        this.profilePhotoUrl = userData.data.profile_photo_url

        this.userStats = {
          role: userData.data.role,
          companies_count: userData.data.companies_count,
          clients_count: userData.data.clients_count,
          created_at: userData.data.created_at,
        }
      } catch (error) {
        this.showError = true
        this.errorMessage = 'Error al cargar los datos del usuario'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        this.isLoading = false
      }
    },
    async updateProfile() {
      this.loading = true
      try {
        await this.userRepository.updateUserProfile(this.form)
        this.showSuccess = true
        this.successMessage = 'Perfil actualizado correctamente'
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)
      } catch (error) {
        this.showError = true
        this.errorMessage = error.message || 'Error al actualizar el perfil'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        this.loading = false
      }
    },
    async updateProfilePhoto(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const response = await this.userRepository.updateProfilePhoto(file)
        this.profilePhotoUrl = response.profile_photo_url
        this.showSuccess = true
        this.successMessage = 'Foto de perfil actualizada correctamente'
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)
      } catch (error) {
        this.showError = true
        this.errorMessage = 'Error al actualizar la foto de perfil'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      }
    },
    async updatePassword() {
      this.passwordLoading = true
      try {
        await this.userRepository.updateUserPassword(this.passwordForm)
        this.passwordForm = {
          current_password: '',
          password: '',
          password_confirmation: '',
        }
        this.showSuccess = true
        this.successMessage = 'Contraseña actualizada correctamente'
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)
      } catch (error) {
        this.showError = true
        this.errorMessage = error.message || 'Error al actualizar la contraseña'
        setTimeout(() => {
          this.showError = false
        }, 3000)
      } finally {
        this.passwordLoading = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getInitial(name) {
      return name.charAt(0).toUpperCase()
    }
  },
  mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }
    this.loadUserData()
  }
}
</script>

<style scoped>
.profile-container {
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-title {
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 600;
}

.save-profile-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-profile-btn:hover {
  background-color: #2563eb;
}

.save-profile-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 0.5fr, 1fr));
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9;
}

.profile-card:hover {
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background-color: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 500;
  margin: 0;
  flex-grow: 1;
}

.change-photo-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.change-photo-btn:hover {
  background-color: #f8fafc;
  color: #64748b;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.info-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.info-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.update-password-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.update-password-btn:hover {
  background-color: #2563eb;
}

.update-password-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.stats-card {
  grid-column: span 2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 600;
}

.section-title {
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 500;
  margin: 0;
}

.toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toast.success {
  background-color: #10b981;
  color: white;
}

.toast.error {
  background-color: #ef4444;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .stats-card {
    grid-column: span 1;
  }

  .profile-container {
    padding: 1rem;
  }
}
</style>