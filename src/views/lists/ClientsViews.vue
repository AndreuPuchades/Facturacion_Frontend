<template>
  <div class="clients-list-container">
    <LoadingSpinner v-if="isLoading" />
    <div class="search-and-add">
      <div class="search-container">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar cliente por nombre..."
            class="search-input"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button @click="openAddClientPopup" class="add-client-btn" aria-label="Añadir Cliente">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="add-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
        </svg>
      </button>
    </div>
    <ClientFormPopup
        :is-open="isPopupOpen"
        :client-to-edit="clientToEdit"
        @close="closePopup"
    />

    <div class="clients-grid">
      <div v-for="client in filteredClients" :key="client.id" class="client-card">
        <div class="card-header">
          <div class="client-avatar">
            {{ getInitial(client.name) }}
          </div>
          <h2 class="client-name">{{ client.name }}</h2>
          <button class="more-options">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="more-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        <div class="client-info">
          <p class="client-detail">{{ client.email }}</p>
          <p class="client-phone">{{ client.phone }}</p>
        </div>
        <div class="card-footer">
          <div class="actions">
            <button @click="editClient(client.id)" class="action-btn edit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="deleteClient(client.id)" class="action-btn delete">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div class="due-date">
            <span>Última actualización</span>
            <span class="date">{{ formatDate() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from "@/stores/index.js";
import ClientFormPopup from "@/components/forms/ClientFormPopup.vue";
import ClientsRepository from "@/repositories/clients.repository.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {useAuthStore} from "@/stores/auth.js";

export default {
  components: { ClientFormPopup, LoadingSpinner },
  setup() {
    const isPopupOpen = ref(false);
    const clientToEdit = ref(null);
    const isLoading = ref(true);

    const openAddClientPopup = () => {
      clientToEdit.value = null;
      isPopupOpen.value = true;
    };

    const openEditClientPopup = (client) => {
      clientToEdit.value = client;
      isPopupOpen.value = true;
    };

    const closePopup = () => {
      isPopupOpen.value = false;
      clientToEdit.value = null;
    };

    return {
      isPopupOpen,
      clientToEdit,
      isLoading,
      openAddClientPopup,
      openEditClientPopup,
      closePopup
    }
  },
  data() {
    return {
      searchQuery: '',
    }
  },
  computed: {
    ...mapState(useCounterStore, ['clients']),
    ...mapState(useAuthStore, ['isAuthenticated']),
    filteredClients() {
      return this.clients.filter(client =>
          client.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }

    this.isLoading = true;
    try {
      if (this.clients.length === 0) {
        await this.loadClients();
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    ...mapActions(useCounterStore, ['loadClients']),
    getInitial(name) {
      return name.charAt(0).toUpperCase();
    },
    formatDate() {
      return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    async editClient(id) {
      this.isLoading = true;
      try {
        const clientToEdit = this.clients.find(client => client.id === id);
        if (clientToEdit) {
          this.openEditClientPopup(clientToEdit);
        }
      } catch (error) {
        console.error('Error editing client:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async deleteClient(id) {
      this.isLoading = true;
      try {
        const clientsRepository = new ClientsRepository()
        await clientsRepository.removeClient(id)
        await this.loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.clients-list-container {
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8fafc;
}

.search-and-add {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  flex-grow: 1;
  margin-right: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1e293b;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
}

.add-client-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-client-btn:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.add-icon {
  width: 24px;
  height: 24px;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.client-card {
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

.client-card:hover {
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

.client-avatar {
  width: 48px;
  height: 48px;
  background-color: #eff6ff;
  color: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.client-name {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 500;
  margin: 0;
  flex-grow: 1;
}

.more-options {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.more-options:hover {
  background-color: #f8fafc;
  color: #64748b;
}

.more-icon {
  width: 20px;
  height: 20px;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.client-detail, .client-phone {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.action-btn:hover {
  background-color: #f8fafc;
}

.action-btn.edit:hover {
  color: #3b82f6;
  background-color: #eff6ff;
}

.action-btn.delete:hover {
  color: #f87171;
  background-color: #fef2f2;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.due-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.due-date span {
  font-size: 0.75rem;
  color: #94a3b8;
}

.due-date .date {
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 768px) {
  .clients-grid {
    grid-template-columns: 1fr;
  }

  .clients-list-container {
    padding: 1rem;
  }
}
</style>