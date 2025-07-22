<template>
  <div class="qr-printable">
    <!-- QR visible para el usuario -->
    <img 
      v-if="!useFallback"
      :src="qrImageUrl" 
      :alt="`QR Code para ${value}`"
      :width="size"
      :height="size"
      class="qr-image"
      @error="handleImageError"
      @load="handleImageLoad"
      crossorigin="anonymous"
    />
    
    <!-- Fallback que siempre funciona para impresión -->
    <canvas 
      v-if="useFallback"
      ref="qrCanvas"
      :width="size"
      :height="size"
      class="qr-canvas"
    ></canvas>
    
    <!-- Información adicional para debug -->
    <div v-if="showDebug" class="debug-info">
      URL: {{ value }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
  useFallback: {
    type: Boolean,
    default: false
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

const qrCanvas = ref(null)
const imageLoaded = ref(false)

const qrImageUrl = computed(() => {
  const encodedValue = encodeURIComponent(props.value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${props.size}x${props.size}&data=${encodedValue}&format=png`
})

async function generateCanvasQR() {
  if (!qrCanvas.value || !props.value) return
  
  try {
    await QRCode.toCanvas(qrCanvas.value, props.value, {
      width: props.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    console.log('QR Canvas generado exitosamente')
  } catch (error) {
    console.error('Error generando QR Canvas:', error)
    // Dibujar un placeholder simple
    const ctx = qrCanvas.value.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, props.size, props.size)
    ctx.fillStyle = '#000000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('QR', props.size / 2, props.size / 2)
  }
}

function handleImageError() {
  console.warn('Error cargando imagen QR')
  imageLoaded.value = false
}

function handleImageLoad() {
  console.log('Imagen QR cargada exitosamente')
  imageLoaded.value = true
}

onMounted(() => {
  if (props.useFallback) {
    generateCanvasQR()
  }
})

watch(() => props.value, () => {
  if (props.useFallback) {
    generateCanvasQR()
  }
})

watch(() => props.useFallback, (newVal) => {
  if (newVal) {
    generateCanvasQR()
  }
})
</script>

<style scoped>
.qr-printable {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image,
.qr-canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-info {
  font-size: 8px;
  color: #666;
  margin-top: 5px;
  word-break: break-all;
  max-width: 120px;
}
</style>
