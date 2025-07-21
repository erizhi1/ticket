<template>
  <div class="queue-admin">
    <div class="admin-header">
      <h2>🎛️ Administración de Turnos</h2>
      <div class="admin-stats">
        <div class="stat-card">
          <span class="stat-number">{{ ticketStore.currentServingTicket }}</span>
          <span class="stat-label">Atendiendo</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ ticketStore.queueLength }}</span>
          <span class="stat-label">En Cola</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ ticketStore.servedTickets.length }}</span>
          <span class="stat-label">Completados</span>
        </div>
      </div>
    </div>

    <div class="admin-controls">
      <div class="control-section">
        <h3>Controles Principales</h3>
        <div class="button-group">
          <button 
            @click="callNext" 
            class="action-btn primary"
            :disabled="ticketStore.queueLength === 0"
          >
            📢 Llamar Siguiente
          </button>
          
          <button 
            @click="finishCurrent" 
            class="action-btn success"
            :disabled="ticketStore.servingNumber === 0"
          >
            ✅ Finalizar Actual
          </button>
          
          <button 
            @click="showResetModal = true" 
            class="action-btn danger"
          >
            🔄 Reiniciar Sistema
          </button>
        </div>
      </div>

      <div class="control-section">
        <h3>Configuración</h3>
        <div class="config-group">
          <label>
            Prefijo de Tickets:
            <input 
              v-model="ticketStore.servicePrefix" 
              type="text" 
              maxlength="2"
              class="config-input"
            >
          </label>
        </div>
      </div>
    </div>

    <div class="queue-section">
      <h3>Cola de Espera</h3>
      <div v-if="ticketStore.queueLength === 0" class="empty-queue">
        <p>😴 No hay tickets en la cola</p>
        <p class="empty-subtitle">Los nuevos tickets aparecerán aquí</p>
      </div>
      
      <div v-else class="queue-list">
        <div 
          v-for="(ticket, index) in ticketStore.waitingQueue" 
          :key="ticket.id"
          class="queue-item"
          :class="{ 'next': index === 0 }"
        >
          <div class="ticket-info">
            <span class="ticket-number">{{ ticket.number }}</span>
            <span class="ticket-time">{{ formatTime(ticket.timestamp) }}</span>
          </div>
          <div class="queue-position">
            <span class="position">{{ index + 1 }}°</span>
          </div>
          <div class="ticket-actions">
            <button 
              @click="callSpecific(ticket)" 
              class="mini-btn primary"
              title="Llamar este ticket"
            >
              📢
            </button>
            <button 
              @click="removeFromQueue(ticket)" 
              class="mini-btn danger"
              title="Remover de la cola"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="served-section">
      <h3>Tickets Atendidos Hoy</h3>
      <div class="served-summary">
        <p>Total atendidos: <strong>{{ completedTickets.length }}</strong></p>
        <p>Tiempo promedio: <strong>{{ averageServiceTime }}</strong></p>
      </div>
      
      <div class="served-list">
        <div 
          v-for="ticket in recentServedTickets" 
          :key="ticket.id"
          class="served-item"
        >
          <span class="ticket-number">{{ ticket.number }}</span>
          <span class="served-time">{{ formatTime(ticket.completedAt) }}</span>
          <span class="status-badge" :class="ticket.status">
            {{ ticket.status === 'completed' ? '✅' : '🔄' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para reiniciar -->
    <div v-if="showResetModal" class="modal-overlay" @click="showResetModal = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Confirmar Reinicio</h3>
        <p>¿Estás seguro de que quieres reiniciar el sistema?</p>
        <p class="warning-text">Esto eliminará todos los tickets y reiniciará los contadores.</p>
        <div class="modal-actions">
          <button @click="showResetModal = false" class="cancel-btn">Cancelar</button>
          <button @click="confirmReset" class="confirm-btn">Sí, Reiniciar</button>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/ticketStore'

const ticketStore = useTicketStore()
const showResetModal = ref(false)
const notification = ref(null)

const completedTickets = computed(() => 
  ticketStore.servedTickets.filter(t => t.status === 'completed')
)

const recentServedTickets = computed(() => 
  [...ticketStore.servedTickets].reverse().slice(0, 10)
)

const averageServiceTime = computed(() => {
  const completed = completedTickets.value
  if (completed.length === 0) return 'N/A'
  
  const totalTime = completed.reduce((sum, ticket) => {
    if (ticket.completedAt && ticket.timestamp) {
      return sum + (new Date(ticket.completedAt) - new Date(ticket.timestamp))
    }
    return sum
  }, 0)
  
  const avgMinutes = Math.round(totalTime / completed.length / 60000)
  return `${avgMinutes} min`
})

function callNext() {
  const nextTicket = ticketStore.callNextTicket()
  if (nextTicket) {
    showNotification(`Llamando ticket ${nextTicket.number}`, 'success')
    // Aquí podrías reproducir un sonido o mostrar en pantalla grande
  } else {
    showNotification('No hay tickets en la cola', 'warning')
  }
}

function finishCurrent() {
  if (ticketStore.servingNumber > 0) {
    const currentTicket = `${ticketStore.servicePrefix}${String(ticketStore.servingNumber).padStart(3, '0')}`
    ticketStore.finishCurrentTicket()
    showNotification(`Ticket ${currentTicket} completado`, 'success')
  }
}

function callSpecific(ticket) {
  // Remover de la cola y llamar inmediatamente
  const index = ticketStore.waitingQueue.findIndex(t => t.id === ticket.id)
  if (index !== -1) {
    ticketStore.waitingQueue.splice(index, 1)
    ticketStore.servingNumber = ticket.id
    ticket.status = 'serving'
    ticketStore.servedTickets.push(ticket)
    showNotification(`Llamando ticket ${ticket.number}`, 'success')
  }
}

function removeFromQueue(ticket) {
  const index = ticketStore.waitingQueue.findIndex(t => t.id === ticket.id)
  if (index !== -1) {
    ticketStore.waitingQueue.splice(index, 1)
    showNotification(`Ticket ${ticket.number} removido de la cola`, 'info')
  }
}

function confirmReset() {
  ticketStore.resetSystem()
  showResetModal.value = false
  showNotification('Sistema reiniciado exitosamente', 'success')
}

function showNotification(message, type = 'info') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

function formatTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.queue-admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

.admin-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-width: 120px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 5px;
}

.admin-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.control-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-btn {
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-btn.success {
  background: #28a745;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #218838;
}

.action-btn.danger {
  background: #dc3545;
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: #c82333;
}

.action-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-group label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 500;
}

.config-input {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.config-input:focus {
  outline: none;
  border-color: #007bff;
}

.queue-section, .served-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.queue-section h3, .served-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.empty-queue {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
}

.empty-queue p {
  margin: 10px 0;
}

.empty-subtitle {
  font-size: 0.9rem;
  opacity: 0.7;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
  transition: all 0.3s;
}

.queue-item.next {
  background: #e7f5e7;
  border-left-color: #28a745;
}

.ticket-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ticket-number {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.ticket-time {
  font-size: 0.9rem;
  color: #6c757d;
}

.queue-position {
  margin: 0 20px;
}

.position {
  background: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
}

.ticket-actions {
  display: flex;
  gap: 10px;
}

.mini-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.mini-btn.primary {
  background: #007bff;
  color: white;
}

.mini-btn.danger {
  background: #dc3545;
  color: white;
}

.served-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.served-summary p {
  margin: 5px 0;
}

.served-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.served-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  gap: 15px;
}

.served-time {
  flex: 1;
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  font-size: 1.2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #dc3545;
}

.warning-text {
  color: #dc3545;
  font-size: 0.9rem;
  margin: 10px 0;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.confirm-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background: #28a745;
}

.notification.warning {
  background: #ffc107;
  color: #333;
}

.notification.info {
  background: #17a2b8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-controls {
    grid-template-columns: 1fr;
  }
  
  .admin-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .queue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .queue-position {
    margin: 0;
  }
}
</style>
