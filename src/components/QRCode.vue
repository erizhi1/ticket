<template>
  <canvas 
    ref="canvas" 
    :width="size" 
    :height="size"
    class="qr-canvas"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import qrcode from 'qrcode-generator'

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

function generateQR() {
  if (!canvas.value || !props.value) return
  
  try {
    const qr = qrcode(4, props.level)
    qr.addData(props.value)
    qr.make()
    
    const ctx = canvas.value.getContext('2d')
    const cells = qr.modules
    const tileW = props.size / cells.length
    const tileH = props.size / cells.length
    
    // Limpiar canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, props.size, props.size)
    
    // Dibujar QR
    ctx.fillStyle = '#000000'
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        if (cells[r][c]) {
          ctx.fillRect(c * tileW, r * tileH, tileW, tileH)
        }
      }
    }
  } catch (error) {
    console.error('Error generando QR:', error)
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
.qr-canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
