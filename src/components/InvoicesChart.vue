<template>
  <div>
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else>Cargando datos...</p>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default defineComponent({
  components: { Bar },
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
        datasets: [{
          label: 'Ingresos',
          data: props.chartData.map(item => item.income),
          backgroundColor: 'rgba(255, 206, 168, 0.7)', // Melocotón pastel
          borderColor: 'rgba(255, 206, 168, 1)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(255, 206, 168, 1)'
        }]
      }
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
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