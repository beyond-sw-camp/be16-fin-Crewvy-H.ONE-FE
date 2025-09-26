<template>
  <div class="attendance-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'AttendanceChart',
  data() {
    return {
      chart: null,
      chartData: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        datasets: [
          {
            label: '출근 시간',
            data: [9.25, 9.15, 9.30, 9.10, 9.20, 0, 0], // 시간을 소수점으로 표현 (9.25 = 9:15)
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '퇴근 시간',
            data: [18.25, 18.15, 18.30, 18.10, 18.20, 0, 0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '근무 시간',
            data: [8.5, 8.5, 8.5, 8.5, 8.5, 0, 0],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || ''
                let value = context.parsed.y
                
                if (label.includes('시간')) {
                  if (value === 0) return label + ': 휴무'
                  const hours = Math.floor(value)
                  const minutes = Math.round((value - hours) * 60)
                  return label + ': ' + hours + '시간 ' + minutes + '분'
                } else {
                  if (value === 0) return label + ': 휴무'
                  const hours = Math.floor(value)
                  const minutes = Math.round((value - hours) * 60)
                  return label + ': ' + hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 8,
            max: 20,
            ticks: {
              callback: function(value) {
                if (value === 0) return '휴무'
                const hours = Math.floor(value)
                const minutes = Math.round((value - hours) * 60)
                return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
              },
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 10,
            ticks: {
              callback: function(value) {
                if (value === 0) return '휴무'
                return value + '시간'
              },
              font: {
                size: 11
              }
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    }
  },
  mounted() {
    this.createChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d')
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: this.chartOptions
      })
    },
    updateChart(newData) {
      if (this.chart) {
        this.chart.data = newData
        this.chart.update()
      }
    }
  }
}
</script>

<style scoped>
.attendance-chart-container {
  height: 200px;
  width: 100%;
  position: relative;
}

canvas {
  max-height: 200px;
}
</style>
