import { defineStore } from "pinia"
import AuthRepository from "@/repositories/auth.repository.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: '',
    googleMessageError: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userInitial: (state) => (state.user ? state.user.name.charAt(0).toUpperCase() : ""),
  },
  actions: {
    async login(email, password) {
      try {
        const authRepository = new AuthRepository()
        const response = await authRepository.login(email, password)
        if(response.success) {
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem("token", this.token)
          localStorage.setItem("user", JSON.stringify(this.user))
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error("Login error:", error)
        return false
      }
    },
    async loginWithGoogle() {
      const authRepository = new AuthRepository()
      const response = await authRepository.loginWithGoogle()

      if (response) {
        if(response.error){
          this.googleMessageError = response.error
          return false
        }

        if(response.token && response.user) {
          this.token = response.token
          this.user = response.user
          localStorage.setItem("token", response.token)
          localStorage.setItem("user", JSON.stringify(response.user))
          return true
        }
      } else {
        return false
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem("selectedCompany")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
    initializeAuth() {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      if (token && user) {
        this.token = token
        this.user = user
      }
    },
  },
})