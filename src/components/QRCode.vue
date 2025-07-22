<template>
  <div class="qr-container">
    <canvas 
      ref="canvas" 
      :width="size" 
      :height="size"
      class="qr-canvas"
    ></canvas>
    <div v-if="error" class="qr-error">
      Error generando QR
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
  },
  level: {
    type: String,
    default: 'M'
  }
})

const canvas = ref(null)
const error = ref(false)

async function generateQR() {
  if (!canvas.value || !props.value) {
    console.log('QR Error: Canvas o value faltante', { canvas: !!canvas.value, value: props.value })
    return
  }
  
  try {
    console.log('Generando QR para:', props.value)
    error.value = false
    
    // Usar la librería qrcode que es más robusta
    await QRCode.toCanvas(canvas.value, props.value, {
      width: props.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: props.level
    })
    
    console.log('QR generado exitosamente')
  } catch (err) {
    console.error('Error generando QR:', err)
    error.value = true
    
    // Fallback: dibujar un placeholder
    const ctx = canvas.value.getContext('2d')
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, props.size, props.size)
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('QR Error', props.size / 2, props.size / 2)
  }
}

onMounted(() => {
  generateQR()
})

watch(() => props.value, () => {
  generateQR()
})

watch(() => props.size, () => {
  generateQR()
})
</script>

<style scoped>
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-error {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 5px;
  text-align: center;
}
</style>
