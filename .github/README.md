
# 🎫 Sistema de Turnos con QR

Un sistema completo de gestión de turnos desarrollado con Vue.js 3 que incluye generación de códigos QR, impresión de tickets y monitoreo en tiempo real.

## 🌐 **Demo en Vivo**
🚀 **[Ver Demo](https://erizhi1.github.io/ticket/)**

📱 **QR Demo**: [Página del QR](https://erizhi1.github.io/ticket/current-ticket.html)

📊 **Repositorio**: [GitHub](https://github.com/erizhi1/ticket)

## 🚀 Características

### ✨ Funcionalidades Principales
- **Generación de Tickets**: Números secuenciales con códigos QR únicos
- **Impresión**: Tickets físicos con información del turno y QR
- **Panel Público**: Pantalla para mostrar el turno actual siendo atendido
- **Administración**: Interface completa para gestionar la cola de turnos
- **QR Dinámico**: Al escanear el QR, muestra el turno actual (no el número del ticket)

### 🎯 Cómo Funciona el Sistema

1. **Cliente genera ticket**: Obtiene un número estático (ej: A005) y un QR
2. **QR apunta a página web**: El código QR dirige a una URL que muestra el turno actual siendo atendido
3. **Monitoreo remoto**: El cliente puede escanear su QR en cualquier momento para ver qué turno se está atendiendo actualmente
4. **Panel de administración**: Permite llamar al siguiente turno, finalizar atenciones y gestionar la cola

## 📱 **Prueba el Sistema**

### 🎮 **Modo Demo Interactivo**
1. **Visita**: https://erizhi1.github.io/ticket/
2. **Genera tickets** en la pestaña "Generar Tickets"
3. **Simula el QR** viendo la pestaña "Panel Público"
4. **Administra la cola** en la pestaña "Administración"

### 📲 **Simulación de QR Real**
- Los QR generados apuntan a: https://erizhi1.github.io/ticket/current-ticket.html
- Puedes abrir esta URL en tu móvil para simular el escaneo
- La página se actualiza automáticamente cada 3 segundos

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3** - Framework principal
- **Pinia** - Gestión de estado
- **Vite** - Build tool y servidor de desarrollo
- **vue-qr-code** - Generación de códigos QR
- **html2canvas** - Captura de pantalla para impresión
- **jsPDF** - Generación de PDFs

## 📦 Instalación y Configuración

### Prerequisitos
- Node.js (v16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/erizhi1/ticket.git
   cd ticket
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### 🏗️ Compilar para Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

## 🎮 Uso del Sistema

### 1. Generar Tickets
- Ve a la sección "Generar Tickets"
- Haz clic en "Generar Ticket"
- Se muestra el ticket con:
  - Número de turno (ej: A005)
  - Fecha y hora
  - Posición en la cola
  - Código QR
- Opciones para imprimir o descargar PDF

### 2. Panel Público (Escaneo QR)
- El QR del ticket dirige a `current-ticket.html`
- Muestra el turno actual siendo atendido
- Se actualiza automáticamente cada 3 segundos
- Información visible:
  - Número actualmente en atención
  - Cantidad de personas en cola
  - Total de turnos atendidos
  - Estado del sistema

### 3. Administración
- Sección "Administración" para operadores
- Funciones disponibles:
  - **Llamar Siguiente**: Avanza al próximo turno en la cola
  - **Finalizar Actual**: Marca como completado el turno actual
  - **Reiniciar Sistema**: Limpia todos los datos
  - **Gestionar Cola**: Ver, llamar o remover tickets específicos
  - **Estadísticas**: Monitoreo de turnos atendidos y tiempos

## 📱 Flujo de Trabajo Típico

### Para el Cliente:
1. Llega al establecimiento
2. Genera un ticket desde la aplicación
3. Recibe ticket impreso con número A005 y QR
4. Puede escanear el QR en cualquier momento para ver qué turno están atendiendo
5. Cuando vea que están atendiendo A004, sabe que es su turno próximo

### Para el Operador:
1. Abre la sección de "Administración"
2. Ve la cola de turnos pendientes
3. Hace clic en "Llamar Siguiente" cuando termine con el cliente actual
4. El sistema actualiza automáticamente el turno actual
5. Todos los QR escaneados mostrarán el nuevo turno en atención

## 🎨 Personalización

### Modificar Prefijo de Tickets
En el panel de administración, puedes cambiar el prefijo (A, B, C, etc.) para diferentes servicios.

### GitHub Pages (Automático)
Este proyecto está configurado para desplegarse automáticamente en GitHub Pages:

- ✅ **URL del Demo**: https://erizhi1.github.io/ticket/
- ✅ **Página QR**: https://erizhi1.github.io/ticket/current-ticket.html
- ✅ **Despliegue automático** con cada push a la rama `main`

### Consideraciones para Servidor Real
Para una implementación completa en producción:
- **API Backend**: Implementar servidor real para persistir datos
- **Base de datos**: Para mantener turnos entre sesiones
- **WebSockets**: Para actualizaciones en tiempo real
- **Autenticación**: Para el panel de administración

## 🔧 Desarrollo y Extensiones

### Estructura del Proyecto
```
src/
├── components/
│   ├── TicketGenerator.vue    # Generación de tickets
│   ├── TicketDisplay.vue      # Panel público
│   └── QueueAdmin.vue         # Administración
├── stores/
│   └── ticketStore.js         # Estado global con Pinia
├── App.vue                    # Componente principal
└── main.js                    # Punto de entrada
```

### Extensiones Sugeridas
- **API Backend**: Conectar con servidor real
- **Base de Datos**: Persistir datos entre sesiones
- **Notificaciones**: SMS o email cuando se acerque el turno
- **Múltiples Servicios**: Diferentes colas para diferentes servicios
- **Reportes**: Estadísticas detalladas y reportes de productividad
- **Impresora Térmica**: Integración directa con impresoras de tickets

### Los estilos no se cargan
- Ejecuta `npm run build` y verifica los archivos generados
- Asegúrate de que las rutas sean correctas en el servidor

### Los datos no persisten
- Por defecto, los datos solo existen en memoria
- Para persistencia, implementa un backend con base de datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Erich Gomez**
- GitHub: [@erizhi1](https://github.com/erizhi1)
- Email: erich.gomez.aguilera@gmail.com
- Repositorio: [ticket](https://github.com/erizhi1/ticket)



## ⭐ ¿Te gustó el proyecto?

Si este proyecto te fue útil, ¡no olvides darle una estrella! ⭐

---

**Desarrollado con ❤️ usando Vue.js 3 | [Demo en Vivo](https://erizhi1.github.io/ticket/)**
