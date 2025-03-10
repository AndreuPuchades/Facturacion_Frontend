<template>
  <div class="client-form" :class="{ 'show': isOpen }">
    <div class="form-header">
      <h2>{{ $t(isEditing ? 'clients.form.title.edit' : 'clients.form.title.add') }}</h2>
      <button class="close-button" @click="closePopup">
        <X class="icon" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <div class="form-group">
        <label for="name">{{ $t('common.name') }}</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            required
            :placeholder="$t('common.name')"
        >
      </div>

      <div class="form-group">
        <label for="email">{{ $t('common.email') }}</label>
        <input
            type="email"
            id="email"
            v-model="form.email"
            required
            :placeholder="$t('common.email')"
        >
      </div>

      <div class="form-group">
        <label for="phone">{{ $t('common.phone') }}</label>
        <input
            type="tel"
            id="phone"
            v-model="form.phone"
            :placeholder="$t('common.phone')"
        >
      </div>

      <div class="form-group">
        <label for="address">{{ $t('common.address') }}</label>
        <input
            type="text"
            id="address"
            v-model="form.address"
            :placeholder="$t('common.address')"
        >
      </div>

      <button type="submit" class="submit-button">
        <Save class="icon" />
        {{ $t(isEditing ? 'clients.form.submit.update' : 'clients.form.submit.add') }}
      </button>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import ClientsRepository from "@/repositories/clients.repository.js";
import { useAuthStore } from "@/stores/auth.js";
import { mapState } from "pinia";
import { X, Save } from 'lucide-vue-next';

export default defineComponent({
  name: 'ClientFormPopup',
  components: {
    X,
    Save
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    clientToEdit: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user'])
  },
  setup(props, { emit }) {
    const form = ref({
      name: '',
      email: '',
      phone: '',
      address: ''
    })

    const isEditing = computed(() => !!props.clientToEdit)

    const initForm = () => {
      if (props.clientToEdit) {
        form.value = { ...props.clientToEdit }
      } else {
        form.value = { name: '', email: '', phone: '', address: '' }
      }
    }

    const handleSubmit = async () => {
      const clientsRepository = new ClientsRepository()
      form.value.user_id = useAuthStore().user.id

      if (isEditing.value) {
        form.value.id = props.clientToEdit.id
        await clientsRepository.updateClient(form.value)
      } else {
        await clientsRepository.addClient(form.value)
      }
      closePopup()
    }

    const closePopup = () => {
      emit('close')
    }

    watch(() => props.clientToEdit, initForm, { immediate: true })
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        initForm()
      }
    })

    return {
      form,
      isEditing,
      handleSubmit,
      closePopup
    }
  }
})
</script>

<style scoped>
.client-form {
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
  z-index: 1000;
}

.client-form.show {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #1e293b;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
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
  .client-form {
    width: 100%;
    right: -100%;
  }
}
</style>