<template>
  <div>
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else>Cargando datos...</p>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default defineComponent({
  components: { Line },
  props: {
    chartData: {
      type: Array,
      required: true
    },
    period: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const data = computed(() => {
      if (!props.chartData) return null;

      return {
        labels: props.chartData.map(item => {
          const date = new Date(item.date)
          return props.period === 'month' ? date.getDate() : date.toLocaleString('default', { month: 'short' })
        }),
        datasets: [
          {
            label: 'Ingresos',
            data: props.chartData.map(item => item.income),
            borderColor: 'rgba(164, 219, 232, 1)', // Azul pastel
            backgroundColor: 'rgba(164, 219, 232, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Gastos',
            data: props.chartData.map(item => item.expense),
            borderColor: 'rgba(255, 182, 185, 1)', // Rosa pastel
            backgroundColor: 'rgba(255, 182, 185, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      }
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#e0e0e0',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#666',
            callback: function(value) {
              return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#666'
          }
        }
      }
    }

    return { chartData: data, chartOptions }
  }
})
</script>