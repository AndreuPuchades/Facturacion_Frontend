<template>
  <div v-if="isOpen" class="popup-overlay">
    <div class="popup-content">
      <div class="form-header">
        <h2>{{ productToEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <button class="close-button" @click="close">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-content">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input v-model="form.name" id="name" type="text" required placeholder="Introduce el nombre del producto">
        </div>

        <div class="form-group">
          <label for="price">Precio</label>
          <input v-model="form.price" id="price" type="number" step="0.01" required placeholder="Introduce el precio">
        </div>

        <div class="form-group">
          <label for="invoice">Factura Relacionada</label>
          <select v-model="form.invoice_id" id="invoice" required>
            <option value="">Selecciona una factura</option>
            <option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
              #{{ invoice.id }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">Categoría</label>
          <select v-model="form.category_id" id="category" required>
            <option value="">Selecciona una categoría</option>
            <option v-for="category in product_categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="tax">Impuesto</label>
          <select v-model="form.tax_id" id="tax" required>
            <option value="">Selecciona un impuesto</option>
            <option v-for="tax in taxes" :key="tax.id" :value="tax.id">
              {{ tax.name }} ({{ tax.rate }}%)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="quantity">Cantidad</label>
          <input v-model="form.quantity" id="quantity" type="number" required placeholder="Introduce la cantidad">
        </div>

        <button type="submit" class="submit-button">
          <Save class="icon" />
          {{ productToEdit ? 'Actualizar Producto' : 'Guardar Producto' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useCounterStore } from '@/stores/index.js'
import ProductsRepository from '@/repositories/products.repository.js'
import { X, Save } from 'lucide-vue-next'

export default {
  components: {
    X,
    Save
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    productToEdit: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'product-saved'],
  setup(props, { emit }) {
    const store = useCounterStore()
    const form = ref({
      name: '',
      price: 0,
      invoice_id: '',
      category_id: '',
      tax_id: '',
      quantity: 0
    })

    const resetForm = () => {
      form.value = {
        name: '',
        price: 0,
        invoice_id: '',
        category_id: '',
        tax_id: '',
        quantity: 0
      }
    }

    const handleSubmit = async () => {
      try {
        const productsRepository = new ProductsRepository()
        if (props.productToEdit) {
          await productsRepository.updateProduct(props.productToEdit.id, form.value)
        } else {
          await productsRepository.createProduct(form.value)
        }
        emit('product-saved')
        emit('close')
      } catch (error) {
        console.error('Error saving product:', error)
      }
    }

    const close = () => {
      emit('close')
    }

    watch(() => props.productToEdit, (newValue) => {
      if (newValue) {
        form.value = {
          name: newValue.name,
          price: newValue.price,
          invoice_id: newValue.invoice.id,
          category_id: newValue.category.id,
          tax_id: newValue.tax.id,
          quantity: newValue.quantity
        }
      } else {
        resetForm()
      }
    }, { immediate: true })

    return {
      form,
      handleSubmit,
      close
    }
  },
  computed: {
    ...mapState(useCounterStore, ['product_categories', 'taxes', 'invoices'])
  },
  methods: {
    ...mapActions(useCounterStore, ['loadProductCategories', 'loadTaxes', 'loadInvoices'])
  },
  async mounted() {
    if (this.product_categories.length === 0) {
      await this.loadProductCategories()
    }
    if (this.taxes.length === 0) {
      await this.loadTaxes()
    }
    if (this.invoices.length === 0) {
      await this.loadInvoices()
    }
  }
}
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
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
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
  padding: 1.5rem;
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
.form-group select {
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
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
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

@media (max-width: 640px) {
  .popup-content {
    max-width: 90%;
  }
}
</style>