<template>
  <div class="qr-simple">
    <div ref="qrElement" class="qr-container"></div>
    <div v-if="error" class="error-message">
      Error al generar QR
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 120
  }
})

const qrElement = ref(null)
const error = ref(false)

async function generateQR() {
  if (!qrElement.value || !props.value) {
    console.error('QR: Elemento o valor faltante')
    return
  }

  try {
    error.value = false
    console.log('Generando QR para URL:', props.value)
    
    // Limpiar contenido anterior
    qrElement.value.innerHTML = ''
    
    // Generar QR como SVG string
    const qrString = await QRCode.toString(props.value, {
      type: 'svg',
      width: props.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    
    qrElement.value.innerHTML = qrString
    console.log('QR generado exitosamente')
    
  } catch (err) {
    console.error('Error generando QR:', err)
    error.value = true
    
    // Fallback visual
    qrElement.value.innerHTML = `
      <div style="
        width: ${props.size}px; 
        height: ${props.size}px; 
        border: 2px solid #ddd; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: #f8f8f8;
        border-radius: 4px;
        color: #666;
        font-size: 12px;
      ">
        QR Code
      </div>
    `
  }
}

onMounted(() => {
  generateQR()
})

watch(() => props.value, () => {
  generateQR()
}, { immediate: true })
</script>

<style scoped>
.qr-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-container svg {
  border-radius: 4px;
  border: 1px solid #ddd;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 5px;
}
</style>
