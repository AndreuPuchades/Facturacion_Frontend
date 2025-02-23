<template>
  <div v-if="isOpen" class="popup-overlay">
    <div class="popup-content">
      <h2>{{ isEditing ? 'Editar Cliente' : 'Añadir Cliente' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input type="text" id="name" v-model="form.name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required>
        </div>
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input type="tel" id="phone" v-model="form.phone">
        </div>
        <div class="form-group">
          <label for="address">Dirección</label>
          <input type="text" id="address" v-model="form.address">
        </div>
        <div class="button-group">
          <button type="submit" class="btn-primary">{{ isEditing ? 'Actualizar' : 'Añadir' }}</button>
          <button type="button" @click="closePopup" class="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import ClientsRepository from "@/repositories/clients.repository.js";
import {useAuthStore} from "@/stores/auth.js";
import {mapState} from "pinia";

export default defineComponent({
  name: 'ClientFormPopup',
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
  computed:{
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
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}
</style>