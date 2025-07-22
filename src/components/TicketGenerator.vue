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
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generar QR directamente para la impresión
    let qrImageSrc = ''
    try {
      // Intentar generar QR como base64
      const QRCode = (await import('qrcode')).default
      qrImageSrc = await QRCode.toDataURL(qrUrl.value, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        type: 'image/png'
      })
      console.log('QR generado para impresión:', qrImageSrc.substring(0, 50) + '...')
    } catch (qrError) {
      console.warn('Error generando QR, usando API fallback:', qrError)
      const encodedValue = encodeURIComponent(qrUrl.value)
      qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedValue}&format=png`
    }
    
    // Crear el HTML de impresión con QR embebido
    const printHTML = `
      <html>
        <head>
          <title>Ticket ${generatedTicket.value?.number}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif;
              padding: 20px; 
              background: white;
              color: black;
            }
            .ticket-print {
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #000;
              border-radius: 10px;
              background: white;
            }
            .ticket-header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .ticket-header h3 {
              font-size: 1.2rem;
              margin-bottom: 10px;
            }
            .ticket-number { 
              font-size: 2.5rem; 
              font-weight: bold; 
              color: #007bff; 
              margin: 15px 0;
            }
            .ticket-body p {
              margin: 8px 0;
              font-size: 14px;
            }
            .queue-info {
              font-weight: bold;
              margin: 15px 0;
            }
            .qr-section { 
              text-align: center; 
              margin: 20px 0; 
              background: white;
            }
            .qr-code {
              margin: 10px 0;
            }
            .qr-code img { 
              border: 1px solid #ddd;
              background: white;
              display: block;
              margin: 0 auto;
            }
            .qr-text {
              font-size: 12px;
              margin-top: 10px;
              color: #666;
            }
            .ticket-footer {
              margin-top: 20px;
              text-align: center;
            }
            .ticket-footer p {
              font-weight: bold;
              margin: 10px 0;
            }
            .ticket-footer small {
              font-size: 10px;
              color: #666;
              word-break: break-all;
            }
            @media print {
              body { 
                padding: 0; 
                margin: 0; 
              }
              .qr-code img { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                background: white !important;
                border: 1px solid #000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-print">
            <div class="ticket-header">
              <h3>SISTEMA DE TURNOS</h3>
              <div class="ticket-number">${generatedTicket.value?.number}</div>
            </div>
            
            <div class="ticket-body">
              <p><strong>Fecha:</strong> ${formatDate(generatedTicket.value?.timestamp)}</p>
              <p><strong>Hora:</strong> ${formatTime(generatedTicket.value?.timestamp)}</p>
              <p class="queue-info">Personas delante: ${queuePosition.value}</p>
              
              <div class="qr-section">
                <div class="qr-code">
                  <img src="${qrImageSrc}" alt="QR Code" width="120" height="120" />
                </div>
                <p class="qr-text">Escanea para ver el turno actual</p>
              </div>
              
              <div class="ticket-footer">
                <p>Conserve este ticket</p>
                <small>${qrUrl.value}</small>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.')
      return
    }
    
    printWindow.document.write(printHTML)
    printWindow.document.close()
    
    // Esperar a que se cargue todo antes de imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
    
  } catch (error) {
    console.error('Error al imprimir:', error)
    alert('Error al imprimir el ticket: ' + error.message)
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
