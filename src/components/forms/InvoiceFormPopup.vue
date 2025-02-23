<template>
  <div v-if="isOpen" class="popup-overlay">
    <div class="popup-content">
      <div class="form-header">
        <h2>{{ invoiceToEdit ? 'Editar Factura' : 'Nueva Factura' }}</h2>
        <button @click="closePopup" class="close-button">
          <X class="icon" />
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="client">
            <User class="icon pastel-blue" />
            Cliente
          </label>
          <select id="client" v-model="form.client_id" required>
            <option value="">Seleccionar cliente</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="project">
            <Briefcase class="icon pastel-green" />
            Proyecto
          </label>
          <select id="project" v-model="form.project_id">
            <option value="">Seleccionar proyecto (opcional)</option>
            <option v-for="project in projects.data" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="issue_date">
            <Calendar class="icon pastel-yellow" />
            Fecha de emisión
          </label>
          <input id="issue_date" v-model="form.issue_date" type="date" required>
        </div>

        <div class="form-group">
          <label for="notes">
            <FileText class="icon pastel-purple" />
            Notas
          </label>
          <textarea id="notes" v-model="form.notes" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="status">
            <Tag class="icon pastel-orange" />
            Estado
          </label>
          <select id="status" v-model="form.status" required>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="paid">Pagada</option>
            <option value="overdue">Vencida</option>
          </select>
        </div>

        <div class="form-group">
          <label for="type">
            <DollarSign class="icon pastel-pink" />
            Tipo
          </label>
          <select id="type" v-model="form.type" required>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>

        <h3>
          <Package class="icon pastel-teal" />
          Productos
        </h3>
        <div v-for="(product, index) in form.products" :key="index" class="product-form">
          <div class="form-group">
            <label :for="'product-name-' + index">Nombre del Producto</label>
            <input :id="'product-name-' + index" v-model="product.name" type="text" required>
          </div>
          <div class="form-group">
            <label :for="'product-price-' + index">Precio</label>
            <input :id="'product-price-' + index" v-model="product.price" type="number" step="0.01" required @input="calculateTotals">
          </div>
          <div class="form-group">
            <label :for="'product-quantity-' + index">Cantidad</label>
            <input :id="'product-quantity-' + index" v-model="product.quantity" type="number" required @input="calculateTotals">
          </div>
          <div class="form-group">
            <label :for="'product-tax-' + index">Impuesto</label>
            <select :id="'product-tax-' + index" v-model="product.tax_id" required @change="calculateTotals">
              <option v-for="tax in taxes" :key="tax.id" :value="tax.id">
                {{ tax.name }} ({{ tax.rate }}%)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label :for="'product-category-' + index">Categoría</label>
            <select :id="'product-category-' + index" v-model="product.category_id" required>
              <option v-for="category in product_categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <button type="button" @click="removeProduct(index)" class="btn-secondary">
            <Trash2 class="icon" />
            Eliminar Producto
          </button>
        </div>
        <button type="button" @click="addProduct" class="btn-secondary">
          <PlusCircle class="icon" />
          Añadir Producto
        </button>

        <div class="totals">
          <p>Subtotal: {{ form.subtotal.toFixed(2) }}</p>
          <p>Impuestos: {{ form.tax_amount.toFixed(2) }}</p>
          <p>Total: {{ form.total.toFixed(2) }}</p>
        </div>

        <div class="form-actions">
          <button type="button" @click="closePopup" class="btn-secondary">
            <X class="icon" />
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            <Save class="icon" />
            {{ invoiceToEdit ? 'Actualizar' : 'Crear' }} Factura
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from "@/stores/index.js"
import InvoicesRepository from "@/repositories/invoices.repository.js"
import { User, Briefcase, Calendar, FileText, Tag, DollarSign, Package, Trash2, PlusCircle, Save, X } from 'lucide-vue-next'

export default {
  components: {
    User, Briefcase, Calendar, FileText, Tag, DollarSign, Package, Trash2, PlusCircle, Save, X
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    invoiceToEdit: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'invoice-saved'],
  setup(props, { emit }) {
    const store = useCounterStore()
    const form = ref({
      client_id: '',
      project_id: '',
      issue_date: '',
      subtotal: 0,
      tax_amount: 0,
      total: 0,
      notes: '',
      status: 'draft',
      type: 'income',
      products: []
    })

    const invoicesRepository = new InvoicesRepository()

    const resetForm = () => {
      form.value = {
        client_id: '',
        project_id: '',
        issue_date: '',
        subtotal: 0,
        tax_amount: 0,
        total: 0,
        notes: '',
        status: 'draft',
        type: 'income',
        products: []
      }
    }

    const addProduct = () => {
      form.value.products.push({
        name: '',
        price: 0,
        quantity: 1,
        tax_id: '',
        category_id: ''
      })
    }

    const removeProduct = (index) => {
      form.value.products.splice(index, 1)
      calculateTotals()
    }

    const calculateTotals = () => {
      let subtotal = 0
      let taxAmount = 0

      form.value.products.forEach(product => {
        const productTotal = product.price * product.quantity
        subtotal += productTotal

        const tax = store.taxes.find(tax => tax.id === product.tax_id)
        if (tax) {
          taxAmount += productTotal * (tax.rate / 100)
        }
      })

      form.value.subtotal = subtotal
      form.value.tax_amount = taxAmount
      form.value.total = subtotal + taxAmount
    }

    watch(() => props.invoiceToEdit, (newValue) => {
      if (newValue) {
        form.value = {
          client_id: newValue.client.id,
          project_id: newValue.project ? newValue.project.id : '',
          issue_date: newValue.issue_date,
          subtotal: parseFloat(newValue.subtotal),
          tax_amount: parseFloat(newValue.tax_amount),
          total: parseFloat(newValue.total),
          notes: newValue.notes,
          status: newValue.status,
          type: newValue.type,
          products: newValue.products.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: product.quantity,
            tax_id: product.tax.id,
            category_id: product.category.id
          }))
        }
      } else {
        resetForm()
      }
    }, { immediate: true })

    const handleSubmit = async () => {
      try {
        if (props.invoiceToEdit) {
          await invoicesRepository.updateInvoice(props.invoiceToEdit.id, form.value)
        } else {
          form.value.company_id = store.selectedCompany.id
          await invoicesRepository.createInvoice(form.value)
        }
        emit('invoice-saved')
        closePopup()
      } catch (error) {
        console.error('Error saving invoice:', error)
      }
    }

    const closePopup = () => {
      resetForm()
      emit('close')
    }

    return {
      form,
      handleSubmit,
      closePopup,
      addProduct,
      removeProduct,
      calculateTotals
    }
  },
  computed: {
    ...mapState(useCounterStore, ['clients', 'projects', 'taxes', 'product_categories', 'selectedCompany'])
  },
  methods: {
    ...mapActions(useCounterStore, ['loadClients', 'loadProjects', 'loadTaxes', 'loadProductCategories'])
  },
  async mounted() {
    if (this.clients.length === 0) await this.loadClients()
    if (this.projects.length === 0) await this.loadProjects({company_id: this.selectedCompany.id})
    if (this.taxes.length === 0) await this.loadTaxes()
    if (this.product_categories.length === 0) await this.loadProductCategories()
  }
}
</script>

<style scoped>
.popup-overlay {
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

.popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.popup-content::-webkit-scrollbar {
  display: none;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h2, h3 {
  margin-bottom: 1.5rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.25rem;
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  width: 30%;
  min-width: 120px;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
textarea {
  width: 70%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="date"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

textarea {
  resize: vertical;
}

.product-form {
  border: 1px solid #e5e7eb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.totals {
  margin-top: 1.5rem;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563;
}

.close-button:hover {
  color: #1e293b;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.pastel-blue { color: #ADD8E6; }
.pastel-green { color: #98FB98; }
.pastel-yellow { color: #FFFACD; }
.pastel-purple { color: #DDA0DD; }
.pastel-orange { color: #FFD8B1; }
.pastel-pink { color: #FFB6C1; }
.pastel-teal { color: #AFEEEE; }
</style>