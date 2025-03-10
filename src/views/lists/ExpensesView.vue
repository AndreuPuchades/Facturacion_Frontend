<template>
  <div class="expenses-layout">
    <LoadingSpinner v-if="isLoading" />
    <div class="expenses-container" :class="{ 'with-form': showForm }">
      <div class="expenses-header">
        <div class="header-title">
          <div class="icon-container">
            <CreditCard class="icon pastel-red" />
          </div>
          <h1>{{ $t('expenses.title') }}</h1>
        </div>
        <button class="add-button" @click="toggleForm">
          <PlusCircle class="icon" />
          <span>{{ showForm ? $t('expenses.closeForm') : $t('expenses.new') }}</span>
        </button>
      </div>

      <div class="filter-container">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
              v-model="filters.description"
              type="text"
              :placeholder="$t('expenses.search')"
              class="search-input"
          />
        </div>
        <select v-model="filters.category_id" class="category-select">
          <option value="">{{ $t('expenses.allCategories') }}</option>
          <option v-for="category in expense_categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <button @click="isFilterOpen = !isFilterOpen" class="filter-button">
          <Filter class="icon" />
          {{ isFilterOpen ? $t('expenses.filters.hide') : $t('expenses.filters.show') }}
        </button>
        <button @click="searchExpenses" class="search-button">
          <Search class="icon" />
        </button>
      </div>

      <div v-if="isFilterOpen" class="advanced-filters">
        <div class="filter-group">
          <label>{{ $t('expenses.filters.dateRange') }}</label>
          <div class="date-range">
            <input v-model="filters.date_from" type="date" class="date-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.date_to" type="date" class="date-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>{{ $t('expenses.filters.amountRange') }}</label>
          <div class="amount-range">
            <input v-model="filters.amount_min" type="number" :placeholder="$t('common.min')" class="amount-input" />
            <span>{{ $t('common.to') }}</span>
            <input v-model="filters.amount_max" type="number" :placeholder="$t('common.max')" class="amount-input" />
          </div>
        </div>
        <div class="filter-actions">
          <button @click="resetFilters" class="reset-filters-button">{{ $t('expenses.filters.reset') }}</button>
        </div>
      </div>

      <div class="expenses-grid">
        <div v-for="expense in expenses.data" :key="expense.id" class="expense-card">
          <div class="card-content">
            <div class="card-header">
              <div class="expense-title">
                <div class="icon-container">
                  <CreditCard class="icon pastel-red" />
                </div>
                <h6>{{ expense.description || $t('expenses.noDescription') }}</h6>
              </div>
            </div>

            <div class="expense-details">
              <div class="detail-item">
                <DollarSign class="icon pastel-purple" />
                <span>{{ formatCurrency(expense.amount) }}</span>
              </div>

              <div class="detail-item">
                <Calendar class="icon pastel-orange" />
                <span>{{ formatDate(expense.date) }}</span>
              </div>

              <div v-if="expense.category" class="detail-item">
                <Tag class="icon pastel-yellow" />
                <span>{{ expense.category.name }}</span>
              </div>

              <div v-if="expense.company" class="detail-item">
                <Building class="icon pastel-pink" />
                <span>{{ expense.company.name }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn edit" @click="handleEditExpense(expense)">
                <Edit2 class="icon pastel-blue" />
              </button>
              <button class="action-btn delete" @click="handleDeleteExpense(expense.id)">
                <Trash2 class="icon pastel-red" />
              </button>
            </div>
          </div>

          <div v-if="expense.is_recurring" class="card-footer">
            <RefreshCw class="icon pastel-teal" />
            <p>{{ $t('common.recurring') }}: {{ $t(`common.${expense.recurrence_frequency}`) }}</p>
          </div>
        </div>
      </div>

      <div v-if="expenses.links && expenses.meta" class="pagination">
        <button
            @click="changePage(expenses.meta.current_page - 1)"
            :disabled="!expenses.links.prev"
            class="pagination-button"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="page-info">{{ $t('common.page') }} {{ expenses.meta.current_page }} {{ $t('common.of') }} {{ expenses.meta.last_page }}</span>
        <button
            @click="changePage(expenses.meta.current_page + 1)"
            :disabled="!expenses.links.next"
            class="pagination-button"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>

    <div class="expense-form" :class="{ 'show': showForm }">
      <div class="form-header">
        <h2>{{ editingExpense ? $t('expenses.edit') : $t('expenses.new') }}</h2>
        <button class="close-button" @click="toggleForm">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-content">
        <div class="form-group">
          <label>{{ $t('expenses.form.amount') }}</label>
          <input
              v-model="newExpense.amount"
              type="number"
              step="0.01"
              :placeholder="$t('common.amount')"
              required
          >
        </div>

        <div class="form-group">
          <label>{{ $t('expenses.form.date') }}</label>
          <input
              v-model="newExpense.date"
              type="date"
              required
          >
        </div>

        <div class="form-group">
          <label>{{ $t('expenses.form.description') }}</label>
          <input
              v-model="newExpense.description"
              type="text"
              :placeholder="$t('common.description')"
          >
        </div>

        <div class="form-group">
          <label>{{ $t('expenses.form.category') }}</label>
          <select v-model="newExpense.category_id" required>
            <option value="">{{ $t('expenses.form.selectCategory') }}</option>
            <option v-for="category in expense_categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input v-model="newExpense.tax_deductible" type="checkbox">
            {{ $t('expenses.form.taxDeductible') }}
          </label>
        </div>

        <div class="form-group">
          <label>
            <input v-model="newExpense.is_recurring" type="checkbox">
            {{ $t('expenses.form.recurring') }}
          </label>
        </div>

        <div v-if="newExpense.is_recurring" class="form-group">
          <label>{{ $t('expenses.form.recurrenceFrequency') }}</label>
          <select v-model="newExpense.recurrence_frequency" required>
            <option value="daily">{{ $t('common.daily') }}</option>
            <option value="weekly">{{ $t('common.weekly') }}</option>
            <option value="monthly">{{ $t('common.monthly') }}</option>
            <option value="yearly">{{ $t('common.yearly') }}</option>
          </select>
        </div>

        <button type="submit" class="submit-button">
          <Save class="icon" />
          {{ editingExpense ? $t('expenses.update') : $t('expenses.save') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { CreditCard, PlusCircle, Edit2, Trash2, DollarSign, Calendar, Tag, Building, RefreshCw, X, Save, Search, Filter } from 'lucide-vue-next'
import { mapActions, mapState } from "pinia"
import { useCounterStore } from "@/stores/index.js"
import ExpensesRepository from "@/repositories/expenses.repository.js"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { useAuthStore } from "@/stores/auth.js"

export default {
  components: {
    CreditCard, PlusCircle, Edit2, Trash2, DollarSign, Calendar, Tag, Building, RefreshCw, X, Save, Search, Filter, LoadingSpinner
  },
  data() {
    return {
      showForm: false,
      editingExpense: null,
      isLoading: true,
      isFilterOpen: false,
      filters: {
        description: '',
        category_id: '',
        date_from: '',
        date_to: '',
        amount_min: '',
        amount_max: ''
      },
      newExpense: {
        amount: '',
        date: '',
        description: '',
        category_id: '',
        id_company: '',
        is_recurring: false,
        tax_deductible: false,
        recurrence_frequency: 'monthly'
      },
      expensesRepository: new ExpensesRepository()
    }
  },
  computed: {
    ...mapState(useCounterStore, ['expenses', 'expense_categories', 'companies', 'selectedCompany']),
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  methods: {
    ...mapActions(useCounterStore, ['loadExpenses', 'loadExpenseCategories', 'loadCompanies']),
    toggleForm() {
      this.showForm = !this.showForm
      if (!this.showForm) {
        this.resetForm()
      }
    },
    resetForm() {
      this.newExpense = {
        amount: '',
        date: '',
        description: '',
        category_id: '',
        id_company: '',
        is_recurring: false,
        tax_deductible: false,
        recurrence_frequency: 'monthly'
      }
      this.editingExpense = null
    },
    async handleSubmit() {
      this.isLoading = true
      try {
        this.newExpense.tax_deductible = this.newExpense.tax_deductible ? 1 : 0
        this.newExpense.is_recurring = this.newExpense.is_recurring ? 1 : 0
        this.newExpense.id_company = this.selectedCompany.id

        if (this.editingExpense) {
          await this.expensesRepository.updateExpense(this.newExpense)
        } else {
          await this.expensesRepository.addExpense(this.newExpense)
        }

        this.resetForm()
        this.showForm = false
        await this.searchExpenses()
      } catch (error) {
        console.error('Error saving expense:', error)
      } finally {
        this.isLoading = false
      }
    },
    async handleEditExpense(expense) {
      this.editingExpense = expense
      this.newExpense = {
        id: expense.id,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        category_id: expense.category.id,
        id_company: expense.company.id,
        is_recurring: !!expense.is_recurring,
        tax_deductible: !!expense.tax_deductible,
        recurrence_frequency: expense.is_recurring ? expense.recurrence_frequency : 'monthly'
      }
      this.showForm = true
    },
    async handleDeleteExpense(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        this.isLoading = true
        try {
          await this.expensesRepository.removeExpense(id)
          await this.searchExpenses()
        } catch (error) {
          console.error('Error deleting expense:', error)
        } finally {
          this.isLoading = false
        }
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES')
    },
    resetFilters() {
      this.filters = {
        description: '',
        category_id: '',
        date_from: '',
        date_to: '',
        amount_min: '',
        amount_max: '',
        is_recurring: false,
        tax_deductible: false
      }
      this.searchExpenses()
    },
    async searchExpenses(page = 1) {
      this.isLoading = true
      try {
        const params = {
          company_id: this.selectedCompany.id,
          page,
          per_page: 10,
          ...this.filters
        }
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key])

        console.log(params, this.selectedCompany)
        await this.loadExpenses(params)
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        this.isLoading = false
      }
    },
    async changePage(page) {
      if (page < 1 || page > this.expenses.meta.last_page) return
      await this.searchExpenses(page)
    },
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
      return
    }

    this.isLoading = true
    try {
      await this.searchExpenses()
      if (this.expense_categories.length === 0) {
        await this.loadExpenseCategories()
      }
      if (this.companies.length === 0) {
        await this.loadCompanies()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.expenses-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
}

.expenses-container {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.expenses-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.expenses-header {
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

.expenses-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.expense-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.expense-card:hover {
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

.expense-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.company-title h2 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.company-card:hover .action-buttons {
  opacity: 1;
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

.expense-details {
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

.detail-item a {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.detail-item a:hover {
  color: #2563eb;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-footer .icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.card-footer p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expense-card {
  animation: fadeIn 0.3s ease-out forwards;
}

.companies-grid > *:nth-child(1) { animation-delay: 0.1s; }
.companies-grid > *:nth-child(2) { animation-delay: 0.2s; }
.companies-grid > *:nth-child(3) { animation-delay: 0.3s; }
.companies-grid > *:nth-child(4) { animation-delay: 0.4s; }
.companies-grid > *:nth-child(5) { animation-delay: 0.5s; }
.companies-grid > *:nth-child(6) { animation-delay: 0.6s; }

@media (max-width: 768px) {
  .expenses-grid {
    grid-template-columns: 1fr;
  }

  .expenses-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
  margin-left: 1rem;
}

.expense-form {
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
}

.expense-form.show {
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

.form-group input,
.form-group textarea {
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
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
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
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .expenses-container.with-form {
    margin-right: 0;
    opacity: 0.5;
    pointer-events: none;
  }

  .expense-form {
    width: 100%;
    right: -100%;
  }

  .expense-form.show {
    right: 0;
  }
}

@media (max-width: 1024px) {
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

  .expense-details {
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

  .expense-card {
    position: relative;
  }
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

.pastel-green { color: #98FB98; }
.pastel-blue { color: #ADD8E6; }
.pastel-red { color: #FFA07A; }
.pastel-purple { color: #DDA0DD; }
.pastel-orange { color: #FFD8B1; }
.pastel-yellow { color: #FFFACD; }
.pastel-pink { color: #FFB6C1; }
.pastel-teal { color: #AFEEEE; }

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #1e293b;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group select:hover {
  border-color: #cbd5e1;
}

.form-group select option {
  padding: 0.5rem;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-group label[for="is_recurring"] {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-group + .form-group {
  margin-top: 1.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  transform: translateY(-2px);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
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

.category-select {
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

.category-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
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
</style>