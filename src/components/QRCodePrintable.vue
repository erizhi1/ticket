<template>
  <div class="qr-printable">
    <!-- QR principal usando base64 para mejor impresión -->
    <img 
      v-if="qrDataUrl"
      :src="qrDataUrl" 
      :alt="`QR Code para ${value}`"
      :width="size"
      :height="size"
      class="qr-image-inline"
    />
    
    <!-- Placeholder mientras se genera -->
    <div v-else class="qr-placeholder">
      <div class="loading">Generando QR...</div>
    </div>
    
    <!-- Información adicional para debug -->
    <div v-if="showDebug" class="debug-info">
      URL: {{ value }}
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
  useFallback: {
    type: Boolean,
    default: false
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

const qrDataUrl = ref('')

async function generateQRDataUrl() {
  if (!props.value) return
  
  try {
    // Generar QR como base64 data URL para mejor impresión
    const dataUrl = await QRCode.toDataURL(props.value, {
      width: props.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      type: 'image/png'
    })
    qrDataUrl.value = dataUrl
    console.log('QR DataURL generado exitosamente')
  } catch (error) {
    console.error('Error generando QR DataURL:', error)
    // Fallback con imagen generada por API
    const encodedValue = encodeURIComponent(props.value)
    qrDataUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=${props.size}x${props.size}&data=${encodedValue}&format=png`
  }
}

onMounted(() => {
  generateQRDataUrl()
})

watch(() => props.value, () => {
  generateQRDataUrl()
})
</script>
<style scoped>
.qr-printable {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image-inline {
  border: 1px solid #ddd;
  border-radius: 4px;
  /* Asegurar que la imagen se imprima correctamente */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background: white;
}

.qr-placeholder {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.loading {
  font-size: 12px;
  color: #666;
}

.debug-info {
  font-size: 8px;
  color: #666;
  margin-top: 5px;
  word-break: break-all;
  max-width: 120px;
}

/* Estilos específicos para impresión */
@media print {
  .qr-image-inline {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    filter: none !important;
    background: white !important;
  }
}
</style>
