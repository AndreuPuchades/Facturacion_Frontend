<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="loginSubmit">
      <h2 class="form-title">Bienvenido</h2>
      <p class="form-subtitle">Ingresa a tu cuenta</p>

      <div class="form-group">
        <label>Email</label>
        <div class="input-container">
          <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
              type="email"
              v-model="form.email"
              placeholder="Ingresa tu email"
              required
          >
        </div>
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <div class="input-container">
          <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="Ingresa tu contraseña"
              required
          >
          <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
      </div>

      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="form.remember">
          <span>Recordarme</span>
        </label>
        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" class="submit-button" :disabled="loading">
        <span v-if="!loading">Iniciar Sesión</span>
        <span v-else class="loading-spinner"></span>
      </button>

      <div class="divider">
        <span>O continúa con</span>
      </div>

      <div class="social-login">
        <button type="button" class="social-button google" @click="loginConGoogle">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c2.17 0 4.1.72 5.63 1.92l4.17-4.17C19.05.96 15.76 0 12 0 7.31 0 3.07 2.69.64 6.64l4.72 3.72C6.87 7.04 9.24 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.76 12.25c0-.76-.07-1.51-.19-2.25H12v4.26h6.43c-.29 1.57-1.13 2.91-2.4 3.82v3.17h3.88c2.26-2.09 3.57-5.17 3.57-8.99z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.88-3.17c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96l-3.98 3.09C3.32 21.27 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.09c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.44H1.29C.47 8.09 0 10.07 0 12.19c0 2.12.47 4.1 1.29 5.75l3.98-3.09z"/>
          </svg>
          Google
        </button>
      </div>

      <p class="signup-text">
        ¿No tienes una cuenta? <a href="#" @click="goToSignup">Regístrate</a>
      </p>
    </form>
  </div>
</template>

<script>
import {mapActions, mapState} from "pinia";
import {useAuthStore} from "@/stores/auth.js";

export default {
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      showPassword: false,
      loading: false
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['login', 'setUser','loginWithGoogle']),
    async loginSubmit() {
      try {
        const response = await this.login(this.form.email, this.form.password)
        if (response) {
          this.$router.push('/dashboard')
        } else {
          alert('Error al iniciar sesión')
        }
      } catch (error) {
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.')
      }
    },
    async loginConGoogle() {
      try {
        const response = await this.loginWithGoogle()
        if (response) {
          this.$router.push('/dashboard')
        } else {
          alert('Error al iniciar sesión')
        }
      } catch (error) {
        console.error('Error during Google login:', error)
      }
    },
  },
  mounted() {
    if (this.isAuthenticated) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1rem;
}

.login-form {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94a3b8;
}

.input-container input {
  width: 100%;
  padding: 0.75rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s;
}

.input-container input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
}

.forgot-password {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 4rem);
  height: 1px;
  background-color: #e2e8f0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background-color: white;
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  color: #1e293b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.social-button:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.signup-text {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.signup-text a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.signup-text a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-form {
    padding: 1.5rem;
  }

  .social-login {
    grid-template-columns: 1fr;
  }
}
</style>
