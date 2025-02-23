<template>
  <div class="products-layout">
    <LoadingSpinner v-if="isLoading" />
    <div class="products-container" :class="{ 'with-form': isPopupOpen }">
      <div class="products-header">
        <div class="header-title">
          <div class="icon-container">
            <Package class="icon" />
          </div>
          <h1>Gestión de Productos</h1>
        </div>
        <button class="add-button" @click="openAddProductPopup">
          <PlusCircle class="icon" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div class="filter-container">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
              v-model="filters.name"
              type="text"
              placeholder="Buscar producto..."
              class="search-input"
          />
        </div>
        <select v-model="filters.category" class="category-select">
          <option value="">Todas las categorías</option>
          <option v-for="category in product_categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <button @click="isFilterOpen = !isFilterOpen" class="filter-button">
          <Filter class="icon" />
          {{ isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
        </button>
        <button @click="applyFilters" class="search-button">
          <Search class="icon" />
        </button>
      </div>

      <div v-if="isFilterOpen" class="advanced-filters">
        <div class="filter-group">
          <label>Rango de precios</label>
          <div class="amount-range">
            <input v-model="filters.price_min" type="number" placeholder="Mín" class="amount-input" />
            <span>a</span>
            <input v-model="filters.price_max" type="number" placeholder="Máx" class="amount-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>Impuesto</label>
          <select v-model="filters.tax_id" class="filter-select">
            <option value="">Todos los impuestos</option>
            <option v-for="tax in taxes" :key="tax.id" :value="tax.id">
              {{ tax.name }}
            </option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="resetFilters" class="reset-filters-button">Restablecer filtros</button>
        </div>
      </div>

      <div class="products-grid">
        <div v-if="!!products?.data" v-for="product in products.data" :key="product.id" class="product-card">
          <div class="card-content">
            <div class="card-header">
              <div class="product-title">
                <div class="icon-container">
                  <Package class="icon pastel-blue" />
                </div>
                <h6>{{ product.name }}</h6>
              </div>
            </div>

            <div class="product-details">
              <div class="detail-item">
                <DollarSign class="icon pastel-green" />
                <span>{{ formatCurrency(product.price) }}</span>
              </div>

              <div class="detail-item">
                <Tag class="icon pastel-yellow" />
                <span>{{ product.category ? product.category.name : 'Sin categoría' }}</span>
              </div>

              <div class="detail-item">
                <Percent class="icon pastel-purple" />
                <span>{{ product.tax ? `${product.tax.name} (${product.tax.rate}%)` : 'Sin impuesto' }}</span>
              </div>

              <div class="detail-item">
                <Hash class="icon pastel-orange" />
                <span>Cantidad: {{ product.quantity }}</span>
              </div>

              <div class="detail-item">
                <FileText class="icon pastel-orange" />
                <span>Factura: #{{ product.invoice.id }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn edit" @click="editProduct(product)">
                <Edit2 class="icon pastel-blue" />
              </button>
              <button class="action-btn delete" @click="deleteProduct(product.id)">
                <Trash2 class="icon pastel-red" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!!products?.links && !!products?.meta" class="pagination">
        <button
            @click="changePage(products.meta.current_page - 1)"
            :disabled="!products.links.prev"
            class="pagination-button"
        >
          Previous
        </button>
        <span class="page-info">Page {{ products.meta.current_page }} of {{ products.meta.last_page }}</span>
        <button
            @click="changePage(products.meta.current_page + 1)"
            :disabled="!products.links.next"
            class="pagination-button"
        >
          Next
        </button>
      </div>
    </div>

    <ProductFormPopup
        :is-open="isPopupOpen"
        :product-to-edit="productToEdit"
        @close="closePopup"
        @product-saved="handleProductSaved"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from "@/stores/index.js"
import ProductFormPopup from "@/components/forms/ProductFormPopup.vue"
import ProductsRepository from "@/repositories/products.repository.js"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { useAuthStore } from "@/stores/auth.js"
import { Package, PlusCircle, Edit2, Trash2, DollarSign, Tag, Percent, Hash, Search, Filter, FileText } from 'lucide-vue-next'

export default {
  name: 'ProductsView',
  components: {
    ProductFormPopup,
    LoadingSpinner,
    Package,
    PlusCircle,
    Edit2,
    Trash2,
    DollarSign,
    Tag,
    Percent,
    Hash,
    Search,
    Filter,
    FileText
  },
  setup() {
    const store = useCounterStore()
    const isPopupOpen = ref(false)
    const productToEdit = ref(null)
    const isLoading = ref(true)
    const isFilterOpen = ref(false)
    const filters = ref({
      name: '',
      category: '',
      price_min: '',
      price_max: '',
      tax_id: ''
    })

    return {
      isPopupOpen,
      productToEdit,
      isLoading,
      isFilterOpen,
      filters
    }
  },
  computed: {
    ...mapState(useCounterStore, ['products', 'product_categories', 'taxes']),
    ...mapState(useAuthStore, ['isAuthenticated']),
  },
  methods: {
    ...mapActions(useCounterStore, ['loadProducts', 'loadProductCategories', 'loadTaxes']),
    openAddProductPopup() {
      this.productToEdit = null
      this.isPopupOpen = true
    },
    closePopup() {
      this.isPopupOpen = false
      this.productToEdit = null
    },
    resetFilters() {
      this.filters = {
        name: '',
        category: '',
        price_min: '',
        price_max: '',
        tax_id: ''
      }
      this.applyFilters()
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
    },
    async editProduct(product) {
      this.productToEdit = product
      this.isPopupOpen = true
    },
    async deleteProduct(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        this.isLoading = true
        try {
          const productsRepository = new ProductsRepository()
          await productsRepository.removeProduct(id)
          await this.applyFilters()
        } catch (error) {
          console.error('Error deleting product:', error)
        } finally {
          this.isLoading = false
        }
      }
    },
    handleProductSaved() {
      this.closePopup()
      this.applyFilters()
    },
    async changePage(page) {
      if (page < 1 || page > this.products.meta.last_page) return
      await this.applyFilters(page)
    },
    async applyFilters(page = 1) {
      this.isLoading = true
      try {
        const params = {
          ...this.filters,
          page: page.toString(),
          per_page: '15'
        }
        Object.keys(params).forEach(key =>
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        )

        await this.loadProducts(params)
      } catch (error) {
        console.error('Error applying filters:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }

    this.isLoading = true
    try {
      await this.applyFilters()

      if (this.product_categories.length === 0) {
        await this.loadProductCategories()
      }
      if (this.taxes.length === 0) {
        await this.loadTaxes()
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
.products-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
  overflow-x: hidden;
}

.products-container {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.products-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.products-header {
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

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.product-card:hover {
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

.product-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.product-title h6 {
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

.product-details {
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

.amount-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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

  .products-container.with-form {
    margin-right: 0;
    opacity: 0.5;
    pointer-events: none;
  }

  .products-header {
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

  .product-details {
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

  .product-card {
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