<template>
  <div class="invoices-layout">
    <LoadingSpinner v-if="isLoading" />
    <div class="invoices-container" :class="{ 'with-form': isPopupOpen }">
      <div class="invoices-header">
        <div class="header-title">
          <div class="icon-container">
            <FileText class="icon" />
          </div>
          <h1>{{ $t('invoices.title') }}</h1>
        </div>
        <button class="add-button" @click="openAddInvoicePopup">
          <PlusCircle class="icon" />
          <span>{{ $t('invoices.new') }}</span>
        </button>
      </div>

      <div class="filter-container">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
              v-model="filters.client"
              type="text"
              :placeholder="$t('invoices.search')"
              class="search-input"
          />
        </div>
        <select v-model="filters.status" class="status-select">
          <option value="">{{ $t('common.allStatuses') }}</option>
          <option value="draft">{{ $t('invoices.status.draft') }}</option>
          <option value="sent">{{ $t('invoices.status.sent') }}</option>
          <option value="paid">{{ $t('invoices.status.paid') }}</option>
          <option value="overdue">{{ $t('invoices.status.overdue') }}</option>
        </select>
        <button @click="isFilterOpen = !isFilterOpen" class="filter-button">
          <Filter class="icon" />
          {{ isFilterOpen ? $t('invoices.filters.hide') : $t('invoices.filters.show') }}
        </button>
        <button @click="searchInvoices" class="search-button">
          <Search class="icon" />
          {{ $t('common.search') }}
        </button>
      </div>

      <div v-if="isFilterOpen" class="advanced-filters">
        <div class="filter-group">
          <label>{{ $t('invoices.filters.dateRange') }}</label>
          <div class="date-range">
            <input v-model="filters.date_from" type="date" class="date-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.date_to" type="date" class="date-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>{{ $t('invoices.filters.amountRange') }}</label>
          <div class="amount-range">
            <input v-model="filters.amount_min" type="number" :placeholder="$t('common.min')" class="amount-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.amount_max" type="number" :placeholder="$t('common.max')" class="amount-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>{{ $t('common.type') }}</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">{{ $t('invoices.filters.allTypes') }}</option>
            <option value="income">{{ $t('invoices.type.income') }}</option>
            <option value="expense">{{ $t('invoices.type.expense') }}</option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="resetFilters" class="reset-filters-button">{{ $t('invoices.filters.reset') }}</button>
        </div>
      </div>

      <div class="invoices-grid">
        <div v-if="!!invoices?.data" v-for="invoice in invoices.data" @click="showInvoiceDetail(invoice)" :key="invoice.id" class="invoice-card">
          <div class="card-content">
            <div class="card-header">
              <div class="invoice-title">
                <div class="icon-container">
                  <FileText class="icon pastel-blue" />
                </div>
                <h6>{{ $t('invoices.invoiceNumber', { id: invoice.id }) }}</h6>
              </div>
            </div>

            <div class="invoice-details">
              <div class="detail-item">
                <User class="icon pastel-green" />
                <span>{{ invoice.client.name }}</span>
              </div>

              <div class="detail-item">
                <Calendar class="icon pastel-yellow" />
                <span>{{ formatDate(invoice.issue_date) }}</span>
              </div>

              <div class="detail-item">
                <DollarSign class="icon pastel-purple" />
                <span>{{ formatCurrency(invoice.total) }}</span>
              </div>

              <div class="detail-item">
                <Tag class="icon pastel-orange" />
                <span>{{ $t(`invoices.status.${invoice.status}`) }}</span>
              </div>

              <div class="detail-item">
                <Briefcase class="icon pastel-teal" />
                <span>{{ $t(`invoices.type.${invoice.type}`) }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn edit" @click.stop="editInvoice(invoice)">
                <Edit2 class="icon pastel-blue" />
              </button>
              <button class="action-btn delete" @click.stop="deleteInvoice(invoice.id)">
                <Trash2 class="icon pastel-red" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!!invoices?.links && !!invoices?.meta" class="pagination">
        <button
            @click="changePage(invoices.meta.current_page - 1)"
            :disabled="!invoices.links.prev"
            class="pagination-button"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="page-info">{{ $t('common.page') }} {{ invoices.meta.current_page }} {{ $t('common.of') }} {{ invoices.meta.last_page }}</span>
        <button
            @click="changePage(invoices.meta.current_page + 1)"
            :disabled="!invoices.links.next"
            class="pagination-button"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>

    <InvoiceFormPopup
        :is-open="isPopupOpen"
        :invoice-to-edit="invoiceToEdit"
        @close="closePopup"
        @invoice-saved="handleInvoiceSaved"
    />
    <InvoiceDetailView
        v-if="selectedInvoice"
        :invoice="selectedInvoice"
        @close="closeInvoiceDetail"
        @edit="editInvoice"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from "@/stores/index.js"
import InvoiceFormPopup from "@/components/forms/InvoiceFormPopup.vue"
import InvoicesRepository from "@/repositories/invoices.repository.js"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { useAuthStore } from "@/stores/auth.js"
import { FileText, PlusCircle, Edit2, Trash2, DollarSign, Tag, User, Calendar, Search, Filter, Briefcase } from 'lucide-vue-next'
import InvoiceDetailView from "@/views/details/InvoiceDetailView.vue";

export default {
  name: 'InvoicesView',
  components: {
    InvoiceDetailView,
    InvoiceFormPopup,
    LoadingSpinner,
    FileText,
    PlusCircle,
    Edit2,
    Trash2,
    DollarSign,
    Tag,
    User,
    Calendar,
    Search,
    Filter,
    Briefcase
  },
  data() {
    return {
      selectedInvoice: null,
    }
  },
  setup() {
    const store = useCounterStore()
    const isPopupOpen = ref(false)
    const invoiceToEdit = ref(null)
    const isLoading = ref(true)
    const isFilterOpen = ref(false)
    const filters = ref({
      client: '',
      status: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      type: ''
    })

    return {
      isPopupOpen,
      invoiceToEdit,
      isLoading,
      isFilterOpen,
      filters
    }
  },
  computed: {
    ...mapState(useCounterStore, ['invoices', 'selectedCompany']),
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  methods: {
    ...mapActions(useCounterStore, ['loadInvoices']),
    async showInvoiceDetail(invoice) {
      const invoicesRepository = new InvoicesRepository()
      this.selectedInvoice = await invoicesRepository.getInvoice(invoice.id)
      this.selectedInvoice = this.selectedInvoice.data
    },
    closeInvoiceDetail() {
      this.selectedInvoice = null
    },
    openAddInvoicePopup() {
      this.invoiceToEdit = null
      this.isPopupOpen = true
    },
    closePopup() {
      this.isPopupOpen = false
      this.invoiceToEdit = null
    },
    resetFilters() {
      this.filters = {
        client: '',
        status: '',
        date_from: '',
        date_to: '',
        amount_min: '',
        amount_max: '',
        type: ''
      }
      this.searchInvoices()
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
    },
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
    async editInvoice(invoice) {
      if (!!invoice?.products && invoice?.products?.length !== 0) {
        this.selectedInvoice = null
        this.invoiceToEdit = invoice
      } else {
        const invoicesRepository = new InvoicesRepository()
        this.invoiceToEdit = await invoicesRepository.getInvoice(invoice.id)
        this.invoiceToEdit = this.invoiceToEdit.data
      }

      this.isPopupOpen = true
    },
    async deleteInvoice(id) {
      if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
        this.isLoading = true
        try {
          const invoicesRepository = new InvoicesRepository()
          await invoicesRepository.removeInvoice(id)
          await this.searchInvoices()
        } catch (error) {
          console.error('Error deleting invoice:', error)
        } finally {
          this.isLoading = false
        }
      }
    },
    handleInvoiceSaved() {
      this.closePopup()
      this.searchInvoices()
    },
    async changePage(page) {
      if (page < 1 || page > this.invoices.meta.last_page) return
      await this.searchInvoices(page)
    },
    async searchInvoices(page = 1) {
      this.isLoading = true
      try {
        const params = {
          company_id: this.selectedCompany.id,
          page,
          per_page: 15,
          ...this.filters
        }
        Object.keys(params).forEach(key =>
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        )
        await this.loadInvoices(params)
      } catch (error) {
        console.error('Error loading invoices:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }

    await this.searchInvoices(1)
  }
}
</script>

<style scoped>
.invoices-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
}

.invoices-container {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.invoices-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.invoices-header {
  background-color: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  font-size: 1.25rem;
  font-weight: 500;
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
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-button:hover {
  background-color: #eff6ff;
}

.invoices-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.invoice-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.invoice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 2rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-bottom: 0;
}

.invoice-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.invoice-title h6 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
  margin-left: 1rem;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit:hover {
  background-color: #E6F3FF;
}

.action-btn.delete:hover {
  background-color: #FFE6E6;
}

.invoice-details {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  min-width: 200px;
}

.detail-item:hover {
  background-color: #f8fafc;
}

.detail-item .icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  margin-right: 0.75rem;
}

.detail-item span {
  font-size: 0.875rem;
  color: #475569;
}

.filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.status-select {
  padding: 0.625rem 2rem 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  transition: all 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.advanced-filters {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  flex: 1 1 200px;
}

.filter-group label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.date-range,
.amount-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input,
.amount-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
}

.reset-filters-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #e2e8f0;
  color: #64748b;
}

.reset-filters-button:hover {
  background-color: #cbd5e1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .search-button {
    width: 100%;
    margin-top: 0.5rem;
  }

  .invoices-container.with-form {
    margin-right: 0;
    opacity: 0.5;
    pointer-events: none;
  }

  .invoices-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .card-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .invoice-details {
    flex-direction: column;
    align-items: stretch;
    margin-left: 0;
    gap: 0.5rem;
  }

  .detail-item {
    min-width: 0;
  }

  .action-buttons {
    position: absolute;
    top: 1rem;
    right: 1rem;
    margin-left: 0;
  }

  .invoice-card {
    position: relative;
  }
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #5d92fa;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-button:hover {
  background-color: #346eef;
}

.search-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.search-button .icon {
  width: 1rem;
  height: 1rem;
}

.pastel-green { color: #98FB98; }
.pastel-blue { color: #ADD8E6; }
.pastel-red { color: #FFA07A; }
.pastel-purple { color: #DDA0DD; }
.pastel-orange { color: #FFD8B1; }
.pastel-yellow { color: #FFFACD; }
.pastel-pink { color: #FFB6C1; }
.pastel-teal { color: #AFEEEE; }
</style>