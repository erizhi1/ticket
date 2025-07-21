import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTicketStore = defineStore('ticket', () => {
  // Estado de los tickets
  const currentNumber = ref(1) // Último número generado
  const servingNumber = ref(0) // Número actualmente siendo atendido
  const waitingQueue = ref([]) // Cola de espera
  const servedTickets = ref([]) // Tickets ya atendidos
  
  // Configuración
  const servicePrefix = ref('A') // Prefijo para los tickets (A001, B002, etc.)
  const maxTicketsPerDay = ref(999) // Máximo de tickets por día
  
  // Computed
  const nextTicketNumber = computed(() => {
    return `${servicePrefix.value}${String(currentNumber.value).padStart(3, '0')}`
  })
  
  const currentServingTicket = computed(() => {
    return servingNumber.value > 0 
      ? `${servicePrefix.value}${String(servingNumber.value).padStart(3, '0')}`
      : 'Ninguno'
  })
  
  const queueLength = computed(() => waitingQueue.value.length)
  
  // Acciones
  function generateTicket() {
    const ticket = {
      id: currentNumber.value,
      number: nextTicketNumber.value,
      timestamp: new Date(),
      status: 'waiting'
    }
    
    waitingQueue.value.push(ticket)
    currentNumber.value++
    
    return ticket
  }
  
  function callNextTicket() {
    if (waitingQueue.value.length > 0) {
      const nextTicket = waitingQueue.value.shift()
      servingNumber.value = nextTicket.id
      nextTicket.status = 'serving'
      servedTickets.value.push(nextTicket)
      return nextTicket
    }
    return null
  }
  
  function finishCurrentTicket() {
    if (servingNumber.value > 0) {
      const ticket = servedTickets.value.find(t => t.id === servingNumber.value)
      if (ticket) {
        ticket.status = 'completed'
        ticket.completedAt = new Date()
      }
      servingNumber.value = 0
    }
  }
  
  function resetSystem() {
    currentNumber.value = 1
    servingNumber.value = 0
    waitingQueue.value = []
    servedTickets.value = []
  }
  
  function getQRUrl(ticketId) {
    // URL que apunta a la página de consulta de turno actual
    return `${window.location.origin}/current-ticket`
  }

  return { 
    // Estado
    currentNumber,
    servingNumber,
    waitingQueue,
    servedTickets,
    servicePrefix,
    maxTicketsPerDay,
    
    // Computed
    nextTicketNumber,
    currentServingTicket,
    queueLength,
    
    // Acciones
    generateTicket,
    callNextTicket,
    finishCurrentTicket,
    resetSystem,
    getQRUrl
  }
})
