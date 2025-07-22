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
import QRCode from 'qrcode'

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
    console.log('Iniciando impresión del ticket...')
    
    // Generar QR directamente para la impresión
    let qrImageSrc = ''
    try {
      // Usar la librería importada estáticamente
      qrImageSrc = await QRCode.toDataURL(qrUrl.value, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        type: 'image/png'
      })
      console.log('QR generado exitosamente, tamaño:', qrImageSrc.length, 'bytes')
    } catch (qrError) {
      console.warn('Error generando QR, usando API fallback:', qrError)
      const encodedValue = encodeURIComponent(qrUrl.value)
      qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedValue}&format=png`
    }
    
    // Verificar que tenemos el QR
    if (!qrImageSrc) {
      throw new Error('No se pudo generar el código QR')
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
              font-family: Arial, sans-serif;
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
              border: 1px dashed #ccc;
              padding: 15px;
            }
            .qr-code {
              margin: 10px 0;
            }
            .qr-code img { 
              border: 2px solid #000;
              background: white !important;
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
                border: 2px solid #000 !important;
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
                  <img src="${qrImageSrc}" alt="QR Code" width="120" height="120" style="display: block; margin: 0 auto; background: white;" />
                </div>
                <p class="qr-text">Escanea para ver el turno actual</p>
              </div>
              
              <div class="ticket-footer">
                <p>Conserve este ticket</p>
                <small>${qrUrl.value}</small>
              </div>
            </div>
          </div>
          
          <script>
            console.log('Ticket cargado, preparando impresion...');
            
            function doPrint() {
              console.log('Ejecutando impresion...');
              window.print();
            }
            
            var qrImg = document.querySelector('.qr-code img');
            if (qrImg && qrImg.src.indexOf('data:') === 0) {
              console.log('QR base64 detectado, imprimiendo inmediatamente');
              setTimeout(doPrint, 200);
            } else if (qrImg) {
              if (qrImg.complete) {
                console.log('QR externo ya cargado');
                setTimeout(doPrint, 200);
              } else {
                qrImg.onload = function() {
                  console.log('QR externo cargado');
                  setTimeout(doPrint, 200);
                };
                qrImg.onerror = function() {
                  console.log('Error cargando QR, imprimiendo de todas formas');
                  setTimeout(doPrint, 200);
                };
              }
            } else {
              console.log('No se encontro QR, imprimiendo de todas formas');
              setTimeout(doPrint, 500);
            }
          </scrip` + `t>
        </body>
      </html>
    `
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.')
      return
    }
    
    console.log('Escribiendo HTML a la ventana de impresión...')
    printWindow.document.write(printHTML)
    printWindow.document.close()
    
  } catch (error) {
    console.error('Error al imprimir:', error)
    alert('Error al imprimir el ticket: ' + error.message)
  }
}

async function downloadTicket() {
  try {
    console.log('Iniciando descarga del ticket PDF...')
    
    // Generar QR directamente para el PDF
    let qrImageSrc = ''
    try {
      qrImageSrc = await QRCode.toDataURL(qrUrl.value, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        type: 'image/png'
      })
      console.log('QR generado para PDF exitosamente')
    } catch (qrError) {
      console.warn('Error generando QR para PDF, usando API fallback:', qrError)
      const encodedValue = encodeURIComponent(qrUrl.value)
      qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedValue}&format=png`
    }

    // Crear un elemento temporal con el ticket y QR embebido
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = `
      <div style="
        width: 280px;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        border: 2px solid #000;
      ">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">SISTEMA DE TURNOS</h3>
          <div style="font-size: 48px; font-weight: bold; color: #007bff; margin: 10px 0;">
            ${generatedTicket.value?.number}
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <p style="margin: 8px 0; font-size: 14px;"><strong>Fecha:</strong> ${formatDate(generatedTicket.value?.timestamp)}</p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Hora:</strong> ${formatTime(generatedTicket.value?.timestamp)}</p>
          <p style="margin: 15px 0; font-weight: bold; color: #dc3545;">Personas delante: ${queuePosition.value}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0; border: 1px dashed #ccc; padding: 15px;">
          <img src="${qrImageSrc}" alt="QR Code" width="120" height="120" style="display: block; margin: 0 auto; background: white; border: 1px solid #000;" />
          <p style="font-size: 12px; margin: 10px 0; color: #666;">Escanea para ver el turno actual</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-weight: bold; margin: 10px 0;">Conserve este ticket</p>
          <small style="font-size: 10px; color: #666; word-break: break-all;">${qrUrl.value}</small>
        </div>
      </div>
    `
    
    // Agregar temporalmente al DOM (oculto)
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '-9999px'
    tempDiv.style.visibility = 'hidden'
    document.body.appendChild(tempDiv)
    
    console.log('Elemento temporal agregado al DOM')
    
    // Función para verificar si las imágenes están cargadas
    const waitForImages = () => {
      return new Promise((resolve) => {
        const images = tempDiv.querySelectorAll('img')
        console.log('Imágenes encontradas:', images.length)
        
        if (images.length === 0) {
          console.log('No hay imágenes, continuando...')
          resolve()
          return
        }
        
        let loadedCount = 0
        const totalImages = images.length
        
        const checkComplete = () => {
          loadedCount++
          console.log(`Imagen ${loadedCount}/${totalImages} cargada`)
          if (loadedCount === totalImages) {
            console.log('Todas las imágenes cargadas')
            resolve()
          }
        }
        
        images.forEach((img, index) => {
          if (img.complete) {
            console.log(`Imagen ${index} ya estaba cargada`)
            checkComplete()
          } else {
            img.onload = () => {
              console.log(`Imagen ${index} cargó exitosamente`)
              checkComplete()
            }
            img.onerror = () => {
              console.log(`Error cargando imagen ${index}, continuando...`)
              checkComplete()
            }
          }
        })
        
        // Timeout de seguridad
        setTimeout(() => {
          console.log('Timeout alcanzado, continuando sin esperar más imágenes')
          resolve()
        }, 3000)
      })
    }
    
    // Esperar a que las imágenes se carguen
    await waitForImages()
    
    // Esperar un poco más para asegurar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Capturar con html2canvas
    const canvas = await html2canvas(tempDiv.firstElementChild, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      logging: false
    })
    
    // Verificar que el canvas tiene contenido
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Error: Canvas vacío, no se puede generar PDF')
    }
    
    console.log('Canvas generado exitosamente:', canvas.width, 'x', canvas.height)
    
    // Remover el elemento temporal
    document.body.removeChild(tempDiv)
    
    // Crear PDF con tamaño más grande para mejor calidad
    const pdf = new jsPDF('p', 'mm', [80, 120])
    const imgData = canvas.toDataURL('image/png', 1.0) // Máxima calidad
    
    console.log('Datos de imagen generados, tamaño:', imgData.length, 'bytes')
    
    // Verificar que tenemos datos de imagen
    if (!imgData || imgData === 'data:,') {
      throw new Error('Error: No se pudieron generar los datos de imagen')
    }
    
    // Calcular dimensiones para el PDF
    const pdfWidth = 70
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    // Agregar imagen al PDF
    pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth, pdfHeight, undefined, 'FAST')
    
    // Generar nombre único para el archivo
    const fileName = `ticket-${generatedTicket.value?.number}-${Date.now()}.pdf`
    
    // Descargar
    pdf.save(fileName)
    
    console.log('PDF generado y descargado exitosamente:', fileName)
    
  } catch (error) {
    console.error('Error detallado al generar PDF:', error)
    
    // Intentar método alternativo con menos opciones de html2canvas
    try {
      console.log('Intentando método alternativo para PDF...')
      
      // Crear elemento temporal más simple
      const simpleDiv = document.createElement('div')
      simpleDiv.style.cssText = `
        position: absolute; 
        left: -9999px; 
        top: -9999px; 
        width: 300px; 
        padding: 20px; 
        background: white; 
        color: black;
        font-family: Arial, sans-serif;
      `
      
      simpleDiv.innerHTML = `
        <div style="text-align: center; border: 2px solid black; padding: 20px;">
          <h3>SISTEMA DE TURNOS</h3>
          <div style="font-size: 40px; font-weight: bold; color: blue; margin: 20px 0;">
            ${generatedTicket.value?.number}
          </div>
          <p><strong>Fecha:</strong> ${formatDate(generatedTicket.value?.timestamp)}</p>
          <p><strong>Hora:</strong> ${formatTime(generatedTicket.value?.timestamp)}</p>
          <p><strong>Personas delante:</strong> ${queuePosition.value}</p>
          <div style="margin: 20px 0;">
            ${qrImageSrc ? `<img src="${qrImageSrc}" width="100" height="100" style="border: 1px solid black;" />` : '<div>QR Code no disponible</div>'}
          </div>
          <p style="font-size: 12px;">Escanea para ver el turno actual</p>
          <p><strong>Conserve este ticket</strong></p>
        </div>
      `
      
      document.body.appendChild(simpleDiv)
      
      // Captura más simple
      const simpleCanvas = await html2canvas(simpleDiv, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: true
      })
      
      document.body.removeChild(simpleDiv)
      
      if (simpleCanvas && simpleCanvas.width > 0) {
        const pdf = new jsPDF('p', 'mm', [80, 120])
        const imgData = simpleCanvas.toDataURL('image/png')
        
        const pdfWidth = 70
        const pdfHeight = (simpleCanvas.height * pdfWidth) / simpleCanvas.width
        
        pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth, pdfHeight)
        pdf.save(`ticket-${generatedTicket.value?.number}-simple.pdf`)
        
        console.log('PDF alternativo generado exitosamente')
      } else {
        alert('Error: No se pudo generar el PDF. Intente usar la función de imprimir.')
      }
      
    } catch (fallbackError) {
      console.error('Error en método alternativo:', fallbackError)
      alert('Error al generar el PDF: ' + error.message + '\n\nIntente usar la función de imprimir en su lugar.')
    }
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
