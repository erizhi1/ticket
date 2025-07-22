<template>
  <div class="ticket-generator">
    <div class="generator-section">
      <h2>Generar Nuevo Ticket</h2>
      <div class="info-panel">
        <p><strong>Próximo número:</strong> {{ ticketStore.nextTicketNumber }}</p>
        <p><strong>En cola:</strong> {{ ticketStore.queueLength }} personas</p>
        <p><strong>Atendiendo:</strong> {{ ticketStore.currentServingTicket }}</p>
      </div>
      
      <button 
        @click="generateNewTicket" 
        class="generate-btn"
        :disabled="isGenerating"
      >
        {{ isGenerating ? 'Generando...' : 'Generar Ticket' }}
      </button>
    </div>

    <!-- Modal para mostrar el ticket generado -->
    <div v-if="showTicket" class="ticket-modal" @click="closeTicket">
      <div class="ticket-content" @click.stop>
        <div class="ticket-print" ref="ticketRef">
          <div class="ticket-header">
            <h3>SISTEMA DE TURNOS</h3>
            <div class="ticket-number">{{ generatedTicket?.number }}</div>
          </div>
          
          <div class="ticket-body">
            <p><strong>Fecha:</strong> {{ formatDate(generatedTicket?.timestamp) }}</p>
            <p><strong>Hora:</strong> {{ formatTime(generatedTicket?.timestamp) }}</p>
            <p class="queue-info">Personas delante: {{ queuePosition }}</p>
            
            <!-- QR Code -->
            <div class="qr-section">
              <div class="qr-code">
                <QRCodePrintable 
                  :value="qrUrl" 
                  :size="120"
                  :useFallback="true"
                />
              </div>
              <p class="qr-text">Escanea para ver el turno actual</p>
            </div>
            
            <div class="ticket-footer">
              <p>Conserve este ticket</p>
              <small>{{ qrUrl }}</small>
            </div>
          </div>
        </div>
        
        <div class="ticket-actions">
          <button @click="printTicket" class="print-btn">🖨️ Imprimir</button>
          <button @click="downloadTicket" class="download-btn">📄 Descargar PDF</button>
          <button @click="closeTicket" class="close-btn">✕ Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/ticketStore'
import QRCodePrintable from './QRCodePrintable.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const ticketStore = useTicketStore()
const isGenerating = ref(false)
const showTicket = ref(false)
const generatedTicket = ref(null)
const ticketRef = ref(null)

const qrUrl = computed(() => {
  const url = ticketStore.getQRUrl()
  console.log('QR URL generada:', url)
  return url
})
const queuePosition = computed(() => {
  if (!generatedTicket.value) return 0
  return ticketStore.waitingQueue.findIndex(t => t.id === generatedTicket.value.id) + 1
})

async function generateNewTicket() {
  isGenerating.value = true
  
  try {
    // Simular un pequeño delay para UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    generatedTicket.value = ticketStore.generateTicket()
    showTicket.value = true
  } catch (error) {
    console.error('Error generando ticket:', error)
    alert('Error al generar el ticket. Intente nuevamente.')
  } finally {
    isGenerating.value = false
  }
}

function closeTicket() {
  showTicket.value = false
  generatedTicket.value = null
}

async function printTicket() {
  try {
    // Esperar un poco para que las imágenes se carguen completamente
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Intentar captura con html2canvas
    try {
      const canvas = await html2canvas(ticketRef.value, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false
      })
      
      // Verificar si el canvas tiene contenido
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasContent = imageData.data.some((channel, index) => 
        index % 4 !== 3 && channel !== 255 // No es canal alpha y no es blanco
      )
      
      if (hasContent) {
        // Crear nueva ventana para imprimir
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket ${generatedTicket.value?.number}</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL()}" />
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        return
      }
    } catch (canvasError) {
      console.warn('Error con html2canvas, usando método alternativo:', canvasError)
    }
    
    // Método alternativo: impresión directa del HTML
    const printContent = ticketRef.value.innerHTML
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${generatedTicket.value?.number}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .ticket-print {
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #000;
              border-radius: 10px;
            }
            .ticket-header { text-align: center; margin-bottom: 20px; }
            .ticket-number { font-size: 2rem; font-weight: bold; color: #007bff; }
            .qr-section { text-align: center; margin: 20px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-print">
            ${printContent}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    
  } catch (error) {
    console.error('Error al imprimir:', error)
    alert('Error al imprimir el ticket')
  }
}

async function downloadTicket() {
  try {
    // Esperar un poco para que las imágenes se carguen completamente
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const canvas = await html2canvas(ticketRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true
    })
    
    const pdf = new jsPDF('p', 'mm', [80, 120]) // Tamaño de ticket pequeño
    const imgData = canvas.toDataURL('image/png')
    
    pdf.addImage(imgData, 'PNG', 5, 5, 70, 110)
    pdf.save(`ticket-${generatedTicket.value?.number}.pdf`)
  } catch (error) {
    console.error('Error al descargar:', error)
    alert('Error al descargar el ticket')
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES')
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.ticket-generator {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.generator-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.info-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.info-panel p {
  margin: 8px 0;
  font-size: 16px;
}

.generate-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.generate-btn:hover:not(:disabled) {
  background: #0056b3;
}

.generate-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.ticket-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ticket-content {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.ticket-print {
  width: 300px;
  padding: 20px;
  background: white;
  font-family: 'Courier New', monospace;
}

.ticket-header {
  text-align: center;
  border-bottom: 2px dashed #ccc;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.ticket-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.ticket-number {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.ticket-body p {
  margin: 8px 0;
  font-size: 14px;
}

.queue-info {
  font-weight: bold;
  color: #dc3545;
}

.qr-section {
  text-align: center;
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
}

.qr-code {
  margin: 10px 0;
}

.qr-text {
  font-size: 12px;
  color: #666;
  margin: 5px 0;
}

.ticket-footer {
  text-align: center;
  margin-top: 15px;
}

.ticket-footer p {
  font-weight: bold;
  margin-bottom: 5px;
}

.ticket-footer small {
  font-size: 10px;
  color: #666;
  word-break: break-all;
}

.ticket-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
}

.ticket-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.print-btn {
  background: #28a745;
  color: white;
}

.print-btn:hover {
  background: #218838;
}

.download-btn {
  background: #17a2b8;
  color: white;
}

.download-btn:hover {
  background: #138496;
}

.close-btn {
  background: #dc3545;
  color: white;
}

.close-btn:hover {
  background: #c82333;
}
</style>
