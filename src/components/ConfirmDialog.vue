<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="dialog-overlay" @click="closeDialog">
        <div class="dialog-container" @click.stop>
          <div class="dialog-content">
            <h2 class="dialog-title">{{ title }}</h2>
            <p class="dialog-message">{{ message }}</p>
            <div class="dialog-actions">
              <button @click="confirm" class="dialog-button confirm-button">
                {{ confirmText }}
              </button>
              <button @click="closeDialog" class="dialog-button cancel-button">
                {{ cancelText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ConfirmDialog',
  props: {
    title: {
      type: String,
      default: 'Confirmar acción'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const isOpen = ref(false);

    const openDialog = () => {
      isOpen.value = true;
    };

    const closeDialog = () => {
      isOpen.value = false;
      emit('cancel');
    };

    const confirm = () => {
      emit('confirm');
      closeDialog();
    };

    return {
      isOpen,
      openDialog,
      closeDialog,
      confirm
    };
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 400px;
  width: 90%;
}

.dialog-content {
  padding: 1.5rem;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.dialog-message {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.dialog-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.confirm-button:hover {
  background-color: #2563eb;
}

.cancel-button {
  background-color: #e2e8f0;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.cancel-button:hover {
  background-color: #cbd5e1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>