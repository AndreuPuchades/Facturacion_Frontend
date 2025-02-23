<template>
  <div class="invoice-detail-layout">
    <div class="invoice-detail-container">
      <div class="invoice-detail-header">
        <div class="header-title">
          <div class="icon-container">
            <FileText class="icon" />
          </div>
          <h1>Detalle de Factura #{{ invoice?.id }}</h1>
        </div>
        <button class="close-button" @click="closeDetail">
          <X class="icon" />
        </button>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <h2>Información General</h2>
          <div class="info-grid">
            <div class="info-item">
              <User class="icon pastel-blue" />
              <div>
                <span class="label">Cliente:</span>
                <span class="value">{{ invoice?.client?.name }}</span>
              </div>
            </div>
            <div class="info-item">
              <Calendar class="icon pastel-yellow" />
              <div>
                <span class="label">Fecha de emisión:</span>
                <span class="value">{{ formatDate(invoice?.issue_date) }}</span>
              </div>
            </div>
            <div class="info-item">
              <Tag class="icon pastel-orange" />
              <div>
                <span class="label">Estado:</span>
                <span class="value">{{ formatStatus(invoice?.status) }}</span>
              </div>
            </div>
            <div class="info-item">
              <Briefcase class="icon pastel-green" />
              <div>
                <span class="label">Tipo:</span>
                <span class="value">{{ invoice?.type === 'income' ? 'Ingreso' : 'Gasto' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Productos</h2>
          <div class="products-list">
            <div v-for="product in invoice?.products" :key="product.id" class="product-item">
              <div class="product-info">
                <Package class="icon pastel-purple" />
                <span class="product-name">{{ product?.name }}</span>
              </div>
              <div class="product-details">
                <span class="product-quantity">{{ product?.quantity }} x</span>
                <span class="product-price">{{ formatCurrency(product?.price) }}</span>
                <span class="product-total">= {{ formatCurrency(product?.quantity * product?.price) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Resumen Financiero</h2>
          <div class="financial-summary">
            <div class="summary-item">
              <span class="label">Subtotal:</span>
              <span class="value">{{ formatCurrency(invoice?.subtotal) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Impuestos:</span>
              <span class="value">{{ formatCurrency(invoice?.tax_amount) }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">Total:</span>
              <span class="value">{{ formatCurrency(invoice.total) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Notas</h2>
          <p class="invoice-notes">{{ invoice?.notes || 'No hay notas disponibles.' }}</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-secondary" @click="closeDetail">
          <ArrowLeft class="icon" />
          Volver
        </button>
        <button class="btn-primary" @click="editInvoice">
          <Edit2 class="icon" />
          Editar Factura
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { FileText, User, Calendar, Tag, Briefcase, Package, X, ArrowLeft, Edit2 } from 'lucide-vue-next'

export default {
  name: 'InvoiceDetailView',
  components: {
    FileText, User, Calendar, Tag, Briefcase, Package, X, ArrowLeft, Edit2
  },
  props: {
    invoice: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit'],
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES')
    },
    formatStatus(status) {
      const statusMap = {
        draft: 'Borrador',
        sent: 'Enviada',
        paid: 'Pagada',
        overdue: 'Vencida'
      }
      return statusMap[status] || status
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
    },
    closeDetail() {
      this.$emit('close')
    },
    editInvoice() {
      console.log('Edit invoice:', this.invoice, this.invoice.products.length === 0)
      this.$emit('edit', this.invoice)
    }
  }
}
</script>

<style scoped>
.invoice-detail-layout {
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

.invoice-detail-container {
  background-color: #f8fafc;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.invoice-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  padding: 0.5rem;
  border-radius: 8px;
}

.icon-container .icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}

.close-button:hover {
  color: #1e293b;
}

.info-section {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.info-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-item .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
  display: block;
}

.value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 8px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-name {
  font-weight: 500;
  color: #1e293b;
}

.product-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.product-total {
  font-weight: 600;
  color: #1e293b;
}

.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.summary-item.total {
  font-weight: 600;
  font-size: 1.25rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.invoice-notes {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
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
  background-color: #e2e8f0;
  color: #1e293b;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.pastel-blue { color: #ADD8E6; }
.pastel-yellow { color: #FFFACD; }
.pastel-orange { color: #FFD8B1; }
.pastel-green { color: #98FB98; }
.pastel-purple { color: #DDA0DD; }

@media (max-width: 640px) {
  .invoice-detail-container {
    width: 95%;
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-details {
    width: 100%;
    justify-content: space-between;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>