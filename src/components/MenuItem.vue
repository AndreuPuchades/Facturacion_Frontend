<template>
  <div class="menu-container">
    <button v-if="!isOpen && isMobile" @click="toggleSidebar" class="menu-toggle" :class="{ 'open': isOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <div v-if="isOpen && isMobile" class="sidebar-overlay" @click="closeSidebar"></div>
    <aside class="sidebar" :class="{ 'open': isOpen, 'mobile': isMobile }">
      <div class="sidebar-header">
        <div class="header-content">
          <div class="logo-container">
            <img src="../assets/Icono.webp" alt="FacturaApp Logo" class="logo-image" />
            <span class="logo-text">InvoiceHub</span>
          </div>
          <LanguageSwitcher class="language-switcher" />
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/dashboard" class="nav-link" :class="{ 'active': currentRoute === 'dashboard' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>{{ $t('menu.dashboard') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/fichaje/empleados" class="nav-link" :class="{ 'active': currentRoute === 'fichajeEmpleados' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ $t('menu.employeesTimesheet') }}</span>
            </router-link>
          </li>

          <li v-if="hasRole(['employee'])" class="nav-item">
            <router-link to="/fichaje" class="nav-link" :class="{ 'active': currentRoute === 'fichar' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ $t('menu.timesheet') }}</span>
            </router-link>
          </li>

          <li v-if="hasRole(['employee'])" class="nav-item">
            <router-link to="/fichaje/calendario" class="nav-link" :class="{ 'active': currentRoute === 'fichajeCalendario' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ $t('menu.timesheetCalendar') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/clientes" class="nav-link" :class="{ 'active': currentRoute === 'clientes' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{{ $t('menu.clients') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/proyectos" class="nav-link" :class="{ 'active': currentRoute === 'proyectos' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>{{ $t('menu.projects') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/facturas" class="nav-link" :class="{ 'active': currentRoute === 'facturas' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>{{ $t('menu.invoices') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/productos" class="nav-link" :class="{ 'active': currentRoute === 'productos' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>{{ $t('menu.products') }}</span>
            </router-link>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-section">
            <span class="nav-section-title">{{ $t('menu.finances') }}</span>
          </li>

          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/ingresos" class="nav-link" :class="{ 'active': currentRoute === 'ingresos' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>{{ $t('menu.incomes') }}</span>
            </router-link>
          </li>

          <!-- Gastos - Solo para admin y client -->
          <li v-if="selectedCompany && hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/gastos" class="nav-link" :class="{ 'active': currentRoute === 'gastos' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
              <span>{{ $t('menu.expenses') }}</span>
            </router-link>
          </li>

          <li class="nav-section">
            <span class="nav-section-title">{{ $t('menu.settings') }}</span>
          </li>

          <li v-if="hasRole(['admin', 'client'])" class="nav-item">
            <div class="nav-link" @click="toggleCompanyDropdown" :class="{ 'active': currentRoute === 'empresa' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>{{ $t('menu.companies') }}</span>
              <svg class="dropdown-icon" :class="{ 'open': isCompanyDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <ul v-show="isCompanyDropdownOpen" class="company-dropdown">
              <li v-for="company in companies" :key="company.id" @click="selectCompany(company)">
                {{ company.name }}
              </li>
            </ul>
          </li>

          <li v-if="hasRole(['admin', 'client'])" class="nav-item">
            <router-link to="/ajustes" class="nav-link" :class="{ 'active': currentRoute === 'ajustes' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>{{ $t('menu.settings') }}</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/perfil" class="nav-link" :class="{ 'active': currentRoute === 'perfil' }">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{{ $t('menu.profile') }}</span>
            </router-link>
          </li>

          <li class="nav-item">
            <a href="#" class="nav-link" @click="logoutAction">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>{{ $t('menu.logout') }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script>
import LanguageSwitcher from './LanguageSwitcher.vue';
import { mapActions, mapState } from "pinia"
import { useCounterStore } from "@/stores/index.js"
import { useAuthStore } from "@/stores/auth.js";

export default {
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      isOpen: false,
      isMobile: false,
      isCompanyDropdownOpen: false,
    };
  },
  computed: {
    ...mapState(useCounterStore, ['selectedCompany', 'companies']),
    ...mapState(useAuthStore, ['user']),
    currentRoute() {
      return this.$route.name;
    }
  },
  async mounted() {
    if (this.companies.length === 0 && this.hasRole(['admin', 'client'])) {
      await this.loadCompanies()
    }
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    ...mapActions(useCounterStore, ['loadCompanies']),
    ...mapActions(useAuthStore, ['logout']),
    toggleSidebar() {
      this.isOpen = !this.isOpen;
    },
    closeSidebar() {
      this.isOpen = false;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    toggleCompanyDropdown() {
      this.isCompanyDropdownOpen = !this.isCompanyDropdownOpen;
    },
    selectCompany(company) {
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      this.isCompanyDropdownOpen = false;
      window.location.reload();
    },
    logoutAction() {
      this.logout()
      this.$router.push('/login');
    },
    hasRole(roles) {
      if (!this.user || !this.user.role) return false;
      return roles.includes(this.user.role);
    }
  }
};
</script>

<style scoped>
.menu-container {
  position: relative;
}

.menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #94a3b8;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.menu-toggle.open span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-toggle.open span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.open span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 998;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar.mobile {
  transform: translateX(-100%);
}

.sidebar.mobile.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-container .logo-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1e293b;
}

.language-switcher {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.sidebar-nav {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.5rem 0;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}

.nav-item {
  margin: 0.25rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
  gap: 0.75rem;
  border-radius: 8px;
  margin: 0 0.5rem;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: #f8fafc;
}

.nav-link.active {
  color: #3b82f6;
  background-color: #eff6ff;
}

.nav-link .icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.5;
}

.nav-link[href="/dashboard"] .icon { color: #3b82f6; }
.nav-link[href="/clientes"] .icon { color: #06b6d4; }
.nav-link[href="/facturas"] .icon { color: #6366f1; }
.nav-link[href="/productos"] .icon { color: #f59e0b; }
.nav-link[href="/ingresos"] .icon { color: #10b981; }
.nav-link[href="/gastos"] .icon { color: #ef4444; }
.nav-link[href="/empresa"] .icon { color: #8b5cf6; }
.nav-link[href="/ajustes"] .icon { color: #64748b; }
.nav-link[href="/perfil"] .icon { color: #64748b; }
.nav-link[href="#"] .icon { color: #dc2626; }
.nav-link[href="/proyectos"] .icon { color: #8b5cf6; }
.nav-link[href="/fichaje"] .icon { color: #10b981; }
.nav-link[href="/fichaje/calendario"] .icon { color: #0ea5e9; }

.nav-section {
  margin-top: 1.5rem;
  padding: 0 1.25rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.05em;
  padding: 0 0.5rem;
}

.nav-link:hover .icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0;
  background-color: currentColor;
  opacity: 0.1;
  transition: height 0.2s;
}

.nav-link:hover::after {
  height: 100%;
}

.company-dropdown {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.company-dropdown li {
  padding: 0.5rem 1.25rem 0.5rem 3.5rem;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.company-dropdown li:hover {
  background-color: #eff6ff;
  color: #3b82f6;
}

.nav-item:has(.company-dropdown) {
  margin-bottom: 0.25rem;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.language-switcher {
  margin-top: 0.5rem;
  align-self: flex-end;
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
  }

  .menu-toggle {
    display: none;
  }

  .sidebar.open {
    width: 80px;
  }

  .sidebar.open .header-content {
    justify-content: center;
  }

  .sidebar.open .logo-text,
  .sidebar.open .language-switcher,
  .sidebar.open .nav-link span,
  .sidebar.open .nav-section-title {
    display: none;
  }

  .sidebar.open .nav-link {
    justify-content: center;
  }

  .sidebar.open .logo-container {
    justify-content: center;
  }
}

.nav-link[href="#"]:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

.nav-link[href="#"]:hover::after {
  background-color: #dc2626;
  opacity: 0.1;
}

.logo-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>