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
  
  // Función para guardar el estado en localStorage
  function saveToLocalStorage() {
    const state = {
      currentNumber: currentNumber.value,
      servingNumber: servingNumber.value,
      waitingQueue: waitingQueue.value,
      servedTickets: servedTickets.value,
      servicePrefix: servicePrefix.value,
      currentServingTicket: currentServingTicket.value,
      queueLength: queueLength.value,
      lastUpdate: new Date().toISOString()
    }
    localStorage.setItem('ticketSystemData', JSON.stringify(state))
  }

  // Función para cargar el estado desde localStorage
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('ticketSystemData')
      if (saved) {
        const state = JSON.parse(saved)
        currentNumber.value = state.currentNumber || 1
        servingNumber.value = state.servingNumber || 0
        waitingQueue.value = state.waitingQueue || []
        servedTickets.value = state.servedTickets || []
        servicePrefix.value = state.servicePrefix || 'A'
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }
  
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
    
    // Guardar en localStorage
    saveToLocalStorage()
    
    return ticket
  }
  
  function callNextTicket() {
    if (waitingQueue.value.length > 0) {
      const nextTicket = waitingQueue.value.shift()
      servingNumber.value = nextTicket.id
      nextTicket.status = 'serving'
      servedTickets.value.push(nextTicket)
      
      // Guardar en localStorage
      saveToLocalStorage()
      
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
      
      // Guardar en localStorage
      saveToLocalStorage()
    }
  }
  
  function resetSystem() {
    currentNumber.value = 1
    servingNumber.value = 0
    waitingQueue.value = []
    servedTickets.value = []
    
    // Guardar en localStorage
    saveToLocalStorage()
  }
  
  function getQRUrl(ticketId) {
    // Detectar el entorno automáticamente
    const currentHost = window.location.hostname
    
    // Obtener datos actuales para incluir en la URL
    const currentData = {
      serving: currentServingTicket.value,
      queue: queueLength.value,
      served: servedTickets.value.length,
      timestamp: Date.now()
    }
    
    // Codificar datos como parámetros URL
    const params = new URLSearchParams(currentData).toString()
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      // Desarrollo local - usar IP de la red para que funcione en teléfonos
      return `http://192.168.1.116:5173/ticket/current-ticket.html?${params}`
    } else if (currentHost.includes('github.io')) {
      // GitHub Pages - usar URL completa de GitHub Pages
      return `https://erizhi1.github.io/ticket/current-ticket.html?${params}`
    } else {
      // Producción o cualquier otro entorno
      return `${window.location.origin}/ticket/current-ticket.html?${params}`
    }
  }

  // Inicializar el store cargando datos del localStorage
  loadFromLocalStorage()

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
    getQRUrl,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
