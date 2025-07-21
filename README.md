# 🎫 Sistema de Turnos con QR

Un sistema completo de gestión de turnos desarrollado con Vue.js 3 que incluye generación de códigos QR, impresión de tickets y monitoreo en tiempo real.

## 🌐 **Demo en Vivo**
🚀 **[Ver Demo](https://erizhi1.github.io/ticket/)**

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

1. **Clonar o descargar el proyecto**
   ```bash
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

### Configurar URL del QR
En `src/stores/ticketStore.js`, modifica la función `getQRUrl()`:

```javascript
function getQRUrl(ticketId) {
  // Cambiar por tu dominio en producción
  return `https://tu-dominio.com/current-ticket.html`
}
```

### Personalizar Estilos
- Modifica los componentes Vue en `src/components/`
- Personaliza `current-ticket.html` para el diseño del panel público
- Ajusta colores y fuentes en los archivos de estilo

## 🌐 Despliegue en Producción

### 1. Build del Proyecto
```bash
npm run build
```

### 2. Configurar Servidor Web
- Sube los archivos de la carpeta `dist/` a tu servidor
- Asegúrate de que `current-ticket.html` esté accesible
- Configura un dominio o subdominio

### 3. Actualizar URLs
- Modifica `getQRUrl()` en el store para usar tu dominio
- Actualiza cualquier referencia a localhost

### 4. Consideraciones de Servidor
Para una implementación completa en producción:
- Implementar una API backend real
- Base de datos para persistir turnos
- WebSockets para actualizaciones en tiempo real
- Autenticación para el panel de administración

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

## 🐛 Solución de Problemas

### El QR no funciona
- Verifica que `current-ticket.html` esté accesible
- Comprueba la URL generada en `getQRUrl()`

### Los estilos no se cargan
- Ejecuta `npm run build` y verifica los archivos generados
- Asegúrate de que las rutas sean correctas en el servidor

### Los datos no persisten
- Por defecto, los datos solo existen en memoria
- Para persistencia, implementa un backend con base de datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado con ❤️ usando Vue.js 3**
