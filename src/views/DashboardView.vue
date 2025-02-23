<template>
  <div class="dashboard-container">
    <LoadingSpinner v-if="isLoading" />

    <div v-else>
      <div class="metrics-grid">
        <div v-for="metric in metrics" :key="metric.title" class="metric-card" :class="metric.color">
          <div class="metric-content">
            <h3 class="metric-title">{{ metric.title }}</h3>
            <p class="metric-value">{{ metric.value }}</p>
            <div class="metric-change" :class="{ 'positive': metric.change > 0, 'negative': metric.change < 0 }">
              <ArrowUp v-if="metric.change > 0" class="change-icon" />
              <ArrowDown v-else class="change-icon" />
              {{ Math.abs(metric.change).toFixed(2) }}% desde el mes pasado
            </div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Ingresos vs Gastos</h3>
            <div class="chart-controls">
              <select v-model="selectedYear" class="period-select">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
              <div class="period-toggle">
                <button
                    :class="{ active: period === 'month' }"
                    @click="setPeriod('month')"
                >
                  Mes
                </button>
                <button
                    :class="{ active: period === 'year' }"
                    @click="setPeriod('year')"
                >
                  Año
                </button>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <IncomeExpenseChart :chart-data="chartData" :period="period" />
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Total de Facturas</h3>
            <div class="chart-controls">
              <select v-model="selectedMonth" class="period-select" v-if="period === 'month'">
                <option v-for="(name, index) in months" :key="index" :value="index + 1">
                  {{ name }}
                </option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <InvoicesChart :chart-data="chartData" :period="period" />
          </div>
        </div>
      </div>
      <div class="summary-section">
        <div class="summary-item">
          <h4>Total Ingresos</h4>
          <p>{{ formatCurrency(totalIncome) }}</p>
        </div>
        <div class="summary-item">
          <h4>Total Gastos</h4>
          <p>{{ formatCurrency(totalExpense) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ArrowUp, ArrowDown } from 'lucide-vue-next'
import IncomeExpenseChart from '@/components/IncomeExpenseChart.vue'
import InvoicesChart from '@/components/InvoicesChart.vue'
import { mapState } from "pinia"
import { useAuthStore } from "@/stores/auth.js"
import DashboardRepository from '@/repositories/dashboard.repository.js'
import {useCounterStore} from "@/stores/index.js";

export default {
  name: 'DashboardView',
  components: { LoadingSpinner, ArrowUp, ArrowDown, IncomeExpenseChart, InvoicesChart },
  setup() {
    const authStore = useAuthStore()
    const counterStore = useCounterStore()
    const isLoading = ref(true)
    const metrics = ref([])
    const period = ref('month')
    const selectedYear = ref(new Date().getFullYear())
    const selectedMonth = ref(new Date().getMonth() + 1)
    const chartData = ref([])
    const years = computed(() => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i))
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const dashboardRepository = new DashboardRepository()

    const fetchMetrics = async () => {
      try {
        const response = await dashboardRepository.getStats(counterStore.selectedCompany.id)
        metrics.value = response.metrics
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    const fetchChartData = async () => {
      try {
        const response = await dashboardRepository.getChartData(
            counterStore.selectedCompany.id,
            period.value,
            selectedYear.value,
            selectedMonth.value
        )
        chartData.value = response.chartData || response.dates
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        isLoading.value = false
      }
    }

    const setPeriod = (newPeriod) => {
      period.value = newPeriod
      fetchChartData()
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
    }

    const totalIncome = computed(() => {
      return chartData.value ? chartData.value.reduce((sum, item) => sum + Number(item.income), 0) : 0
    })

    const totalExpense = computed(() => {
      return chartData.value ? chartData.value.reduce((sum, item) => sum + Number(item.expense), 0) : 0
    })

    onMounted(async () => {
      if (counterStore.selectedCompany.id) {
        await fetchMetrics()
        await fetchChartData()
      }
    })

    watch(() => counterStore.selectedCompany.id, async () => {
      if (counterStore.selectedCompany.id) {
        isLoading.value = true
        await fetchMetrics()
        await fetchChartData()
      }
    })

    watch([selectedYear, selectedMonth], () => {
      fetchChartData()
    })

    return {
      isLoading,
      metrics,
      period,
      selectedYear,
      selectedMonth,
      years,
      months,
      chartData,
      setPeriod,
      formatCurrency,
      totalIncome,
      totalExpense
    }
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'user']),
    ...mapState(useCounterStore, ['selectedCompany']),
  },
  mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: all 0.2s ease;
}

.metric-card.red::before { background-color: #ef4444; }
.metric-card.orange::before { background-color: #f97316; }
.metric-card.green::before { background-color: #10b981; }
.metric-card.blue::before { background-color: #3b82f6; }

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-title {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.metric-change.positive { color: #10b981; }
.metric-change.negative { color: #ef4444; }

.change-icon {
  width: 16px;
  height: 16px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #1e293b;
  font-size: 0.875rem;
}

.period-toggle {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
}

.period-toggle button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-toggle button.active {
  background-color: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 300px;
  position: relative;
}

.summary-section {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.summary-item {
  text-align: center;
}

.summary-item h4 {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.summary-item p {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>