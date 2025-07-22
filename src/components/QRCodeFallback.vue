<template>
  <div class="qr-fallback">
    <img 
      :src="qrImageUrl" 
      :alt="`QR Code para ${value}`"
      :width="size"
      :height="size"
      class="qr-image"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <div v-if="imageError" class="qr-placeholder">
      <div class="placeholder-content">
        📱 QR<br>
        <small>{{ value }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const imageError = ref(false)

const qrImageUrl = computed(() => {
  // Usar API pública para generar QR como fallback
  const encodedValue = encodeURIComponent(props.value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${props.size}x${props.size}&data=${encodedValue}`
})

function handleImageError() {
  console.warn('Error cargando QR desde API externa')
  imageError.value = true
}

function handleImageLoad() {
  console.log('QR cargado exitosamente desde API externa')
  imageError.value = false
}
</script>

<style scoped>
.qr-fallback {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-image {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-placeholder {
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.placeholder-content {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 10px;
}

.placeholder-content small {
  font-size: 8px;
  word-break: break-all;
  max-width: 100px;
  display: inline-block;
}
</style>
