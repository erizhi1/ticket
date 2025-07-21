<template>
  <div class="ticket-display">
    <div class="display-header">
      <h1>🎫 Sistema de Turnos</h1>
      <div class="current-time">{{ currentTime }}</div>
    </div>

    <div class="main-display">
      <div class="serving-section">
        <h2>Atendiendo Ahora</h2>
        <div class="current-ticket" :class="{ 'no-ticket': !isServing }">
          {{ ticketStore.currentServingTicket }}
        </div>
        <div v-if="!isServing" class="no-service">
          No hay turnos siendo atendidos
        </div>
      </div>

      <div class="queue-info">
        <div class="queue-stats">
          <div class="stat">
            <span class="stat-number">{{ ticketStore.queueLength }}</span>
            <span class="stat-label">En Cola</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ ticketStore.servedTickets.length }}</span>
            <span class="stat-label">Atendidos</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ totalTickets }}</span>
            <span class="stat-label">Total Hoy</span>
          </div>
        </div>
      </div>

      <div class="next-tickets" v-if="nextTickets.length > 0">
        <h3>Próximos Turnos</h3>
        <div class="next-list">
          <div 
            v-for="(ticket, index) in nextTickets" 
            :key="ticket.id"
            class="next-ticket"
            :class="`position-${index + 1}`"
          >
            <span class="ticket-number">{{ ticket.number }}</span>
            <span class="position">{{ index + 1 }}°</span>
          </div>
        </div>
      </div>

      <div class="status-indicator">
        <div class="indicator" :class="systemStatus">
          <div class="pulse"></div>
        </div>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <div class="footer-info">
      <p>🔄 Actualización automática cada 3 segundos</p>
      <p>📱 Escanea el QR de tu ticket para ver esta información</p>
      <div class="last-updated">
        Última actualización: {{ lastUpdated }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTicketStore } from '../stores/ticketStore'

const ticketStore = useTicketStore()
const currentTime = ref('')
const lastUpdated = ref('')
let timeInterval = null
let updateInterval = null

const isServing = computed(() => ticketStore.servingNumber > 0)
const totalTickets = computed(() => ticketStore.currentNumber - 1)

const nextTickets = computed(() => {
  return ticketStore.waitingQueue.slice(0, 5) // Mostrar próximos 5 tickets
})

const systemStatus = computed(() => {
  if (isServing.value) return 'active'
  if (ticketStore.queueLength > 0) return 'waiting'
  return 'idle'
})

const statusText = computed(() => {
  switch (systemStatus.value) {
    case 'active': return 'Sistema activo - Atendiendo'
    case 'waiting': return 'En espera - Hay turnos pendientes'
    case 'idle': return 'Sistema inactivo - Sin turnos'
    default: return 'Estado desconocido'
  }
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function updateLastUpdated() {
  const now = new Date()
  lastUpdated.value = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  updateLastUpdated()
  
  // Actualizar reloj cada segundo
  timeInterval = setInterval(updateTime, 1000)
  
  // Actualizar datos cada 3 segundos (simular auto-refresh)
  updateInterval = setInterval(() => {
    updateLastUpdated()
    // Aquí se podría hacer una llamada a la API para actualizar datos
  }, 3000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (updateInterval) clearInterval(updateInterval)
})
</script>

<style scoped>
.ticket-display {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.display-header {
  text-align: center;
  margin-bottom: 30px;
}

.display-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.current-time {
  font-size: 1.5rem;
  font-weight: bold;
  opacity: 0.9;
}

.main-display {
  max-width: 800px;
  margin: 0 auto;
}

.serving-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.serving-section h2 {
  font-size: 1.8rem;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.current-ticket {
  font-size: 4rem;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

.current-ticket.no-ticket {
  color: #ffeb3b;
  font-size: 2rem;
}

.no-service {
  font-size: 1.2rem;
  opacity: 0.7;
  font-style: italic;
}

.queue-info {
  margin-bottom: 30px;
}

.queue-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 20px;
  min-width: 120px;
  text-align: center;
  backdrop-filter: blur(5px);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffeb3b;
}

.stat-label {
  display: block;
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
}

.next-tickets {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.next-tickets h3 {
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.next-list {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.next-ticket {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  min-width: 80px;
  position: relative;
}

.next-ticket.position-1 {
  background: rgba(76, 175, 80, 0.3);
  border: 2px solid #4caf50;
}

.ticket-number {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
}

.position {
  display: block;
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 5px;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
}

.indicator.active {
  background: #4caf50;
}

.indicator.waiting {
  background: #ff9800;
}

.indicator.idle {
  background: #f44336;
}

.pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: pulse-ring 2s infinite;
}

.status-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.footer-info {
  text-align: center;
  margin-top: 40px;
  opacity: 0.8;
}

.footer-info p {
  margin: 10px 0;
}

.last-updated {
  font-size: 0.9rem;
  opacity: 0.6;
  margin-top: 15px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .display-header h1 {
    font-size: 2rem;
  }
  
  .current-ticket {
    font-size: 3rem;
  }
  
  .queue-stats {
    gap: 20px;
  }
  
  .stat {
    min-width: 100px;
    padding: 15px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>
