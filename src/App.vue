<script setup>
import { ref } from 'vue'
import TicketGenerator from './components/TicketGenerator.vue'
import TicketDisplay from './components/TicketDisplay.vue'
import QueueAdmin from './components/QueueAdmin.vue'

const currentView = ref('generator')

const views = {
  generator: 'Generar Tickets',
  display: 'Panel Público',
  admin: 'Administración'
}

function switchView(view) {
  currentView.value = view
}
</script>

<template>
  <div id="app">
    <nav class="navigation">
      <div class="nav-brand">
        <h1>🎫 Sistema de Turnos</h1>
      </div>
      
      <div class="nav-menu">
        <button 
          v-for="(label, view) in views" 
          :key="view"
          @click="switchView(view)"
          class="nav-btn"
          :class="{ active: currentView === view }"
        >
          {{ label }}
        </button>
      </div>
    </nav>

    <main class="main-content">
      <TicketGenerator v-if="currentView === 'generator'" />
      <TicketDisplay v-if="currentView === 'display'" />
      <QueueAdmin v-if="currentView === 'admin'" />
    </main>

    <footer class="app-footer">
      <p>Sistema de Turnos con QR - Vue.js 3 + Pinia</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navigation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.nav-brand h1 {
  font-size: 1.8rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

.app-footer {
  background: #343a40;
  color: white;
  text-align: center;
  padding: 15px;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .nav-brand h1 {
    font-size: 1.5rem;
  }
  
  .nav-menu {
    justify-content: center;
  }
  
  .nav-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 15px;
  }
}

/* Estilos globales para formularios */
button {
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}

/* Utilidades */
.text-center {
  text-align: center;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
