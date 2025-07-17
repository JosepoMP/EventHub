# EventHub: Gestión Avanzada de Eventos (SPA con JavaScript Puro)

Este proyecto es una aplicación web de una sola página (SPA - Single Page Application) diseñada para la gestión de eventos. Permite a los usuarios explorar eventos, registrarse en ellos, y a los administradores gestionar usuarios y eventos a través de un panel de control dedicado. La aplicación está construida utilizando JavaScript puro, HTML y CSS, demostrando principios de desarrollo web moderno sin el uso de frameworks complejos.

## 1. Estructura del Proyecto JavaScript

El corazón de esta aplicación reside en su arquitectura modular de JavaScript. Cada componente principal de la lógica de la aplicación está encapsulado en su propio archivo, promoviendo la mantenibilidad, la escalabilidad y la claridad del código.

La carpeta `JS/` contiene los siguientes archivos clave:

-   `app.js`: El punto de entrada principal de la aplicación. Orquesta la inicialización de todos los módulos y maneja la lógica de renderizado de las diferentes vistas.
-   `api.js`: Un servicio para interactuar con la API de backend (simulada con `json-server`). Centraliza todas las llamadas HTTP (GET, POST, PUT, PATCH, DELETE) para eventos, usuarios y registros.
-   `auth.js`: Gestiona la autenticación de usuarios, el registro, el inicio/cierre de sesión y la persistencia de la sesión. También maneja la autorización basada en roles (usuario/administrador).
-   `router.js`: Implementa un sistema de enrutamiento del lado del cliente para la SPA. Permite la navegación entre diferentes "páginas" sin recargar la página completa, incluyendo rutas protegidas y manejo de parámetros.
-   `ui-manager.js`: Una clase dedicada a la gestión de la interfaz de usuario. Se encarga de renderizar contenido dinámicamente, mostrar spinners de carga, modales, notificaciones "toast" y configurar la validación de formularios.
-   `vite.config.js`: Archivo de configuración para Vite, la herramienta de construcción utilizada en este proyecto. Define cómo se sirve y se compila la aplicación.

## 2. ¿Cómo Funciona el JavaScript? (Arquitectura y Flujo)

La aplicación sigue un patrón de diseño modular y se basa en la interacción entre sus componentes principales:

### 2.1. `app.js` (El Orquestador)

-   **Inicialización (`init()`):** Al cargar el DOM (`DOMContentLoaded`), `app.js` crea instancias de `Router`, `AuthManager`, `ApiService` y `UIManager`.
-   **Gestión de la Carga:** Muestra un spinner de carga al inicio y lo oculta una vez que la aplicación está lista.
-   **Configuración de Navegación:** Establece listeners para el menú de navegación móvil y actualiza los enlaces de navegación según el estado de autenticación del usuario (`updateNavigation()`).
-   **Definición de Rutas:** Utiliza el `Router` para definir todas las rutas de la aplicación (públicas, protegidas y de administrador) y sus respectivos manejadores de renderizado.
-   **Manejo de Errores Globales:** Incluye `window.addEventListener("error")` y `window.addEventListener("unhandledrejection")` para capturar errores no manejados y asegurar que la navegación se actualice, mostrando un mensaje de error si es necesario.
-   **Renderizado de Vistas:** Contiene métodos como `renderHome()`, `renderLogin()`, `renderAdmin()`, etc., que son responsables de generar el HTML dinámico para cada "página" y pasarlo al `UIManager` para su visualización.
-   **Interacción con la UI:** Proporciona funciones globales (accesibles a través de `window.app`) para interactuar con la UI, como `showCreateEventModal()`, `registerForEvent()`, etc., que son llamadas directamente desde el HTML.

### 2.2. `router.js` (El Navegador SPA)

-   **Enrutamiento del Lado del Cliente:** En lugar de recargar la página, el `Router` intercepta los cambios en el hash de la URL (`#/`) y renderiza el contenido correspondiente.
-   **`addRoute(path, handler, requiresAuth, requiredRole)`:** Permite definir rutas con expresiones regulares para manejar parámetros (ej. `/events/:id`).
-   **Navegación Programática:** El método `navigate(path)` actualiza el historial del navegador y dispara el manejo de la ruta.
-   **Control de Acceso:** Antes de ejecutar un manejador de ruta, verifica si la ruta requiere autenticación (`requiresAuth`) y si el usuario tiene el rol necesario (`requiredRole`) utilizando el `AuthManager`. Si no se cumplen los requisitos, redirige al login o muestra un mensaje de "Acceso Denegado".
-   **Extracción de Parámetros:** Extrae dinámicamente los parámetros de la URL (ej. `id` de `/events/123`).

### 2.3. `auth.js` (El Guardián de la Sesión)

-   **Gestión de Sesiones:** Almacena y recupera la información del usuario autenticado en `localStorage` para persistir la sesión entre recargas de página.
-   **`login(identifier, password)`:** Autentica al usuario contra la base de datos simulada, crea una sesión y la guarda.
-   **`register(userData)`:** Registra nuevos usuarios, incluyendo validaciones básicas (campos requeridos, formato de email, longitud de contraseña) y verifica la unicidad de username/email.
-   **`logout()`:** Limpia la sesión del `localStorage` y restablece el estado de autenticación.
-   **Control de Roles:** Proporciona métodos como `getCurrentUser()`, `hasRole(role)` e `isAdmin()` para verificar el estado y los permisos del usuario.
-   **Notificación de Cambios:** Utiliza un patrón de observador (`onAuthStateChange`, `notifyAuthStateChange`) para informar a otros módulos (como `app.js` para actualizar la navegación) sobre cambios en el estado de autenticación.

### 2.4. `api.js` (El Comunicador con el Backend)

-   **Centralización de Llamadas:** Encapsula todas las interacciones con el backend (simulado por `json-server`).
-   **`request(endpoint, options)`:** Un método genérico para realizar peticiones HTTP, con manejo de errores y detección del tipo de contenido de la respuesta.
-   **Métodos Específicos:** Proporciona métodos convenientes para operaciones CRUD (`get`, `post`, `put`, `patch`, `delete`) y funciones específicas para la lógica de negocio (ej. `getEvents()`, `createEvent()`, `registerForEvent()`, `getDashboardStats()`).
-   **Validación de Datos:** Incluye validaciones básicas antes de enviar datos al backend (ej. campos requeridos al crear un evento).
-   **Lógica de Negocio:** Contiene lógica como la verificación de capacidad de eventos y la gestión de `registeredCount` al registrar/cancelar.

### 2.5. `ui-manager.js` (El Constructor de la Interfaz)

-   **Renderizado Dinámico:** Inyecta contenido HTML en el contenedor principal de la aplicación (`#content`).
-   **Componentes UI Reutilizables:**
    -   **`showLoading()` / `hideLoading()`:** Controla la visibilidad de un spinner de carga.
    -   **`showModal(title, content, options)` / `hideModal()`:** Gestiona la apertura y cierre de modales, incluyendo su contenido, título y pie de página.
    -   **`showToast(message, type, duration)`:** Muestra notificaciones "toast" (mensajes emergentes) con diferentes tipos (éxito, error, advertencia, información).
    -   **`showConfirmation(message, onConfirm, onCancel)`:** Presenta un diálogo de confirmación antes de ejecutar acciones críticas.
-   **Validación de Formularios (`setupFormValidation(form, rules)`):**
    -   Aplica reglas de validación a los campos de un formulario.
    -   Muestra mensajes de error específicos debajo de cada campo.
    -   Previene el envío del formulario si hay errores.
    -   Realiza validación en tiempo real (al perder el foco del campo) y al intentar enviar el formulario.
-   **Utilidades UI:** Incluye funciones para formatear fechas, monedas, controlar el estado de botones (`setButtonLoading`) y animaciones básicas.

## 3. Conceptos Clave de JavaScript Utilizados

-   **Módulos ES (`import`/`export`):** El proyecto está completamente modularizado, lo que permite organizar el código en archivos separados y reutilizarlos fácilmente.
-   **Clases de JavaScript:** Se utilizan clases (`EventManagementApp`, `ApiService`, `AuthManager`, `Router`, `UIManager`) para encapsular la lógica y los datos, siguiendo un enfoque de programación orientada a objetos.
-   **Programación Asíncrona (`async`/`await`, `Promises`):** Todas las operaciones que involucran la red (llamadas a la API) o la inicialización de componentes se manejan de forma asíncrona para evitar bloquear la interfaz de usuario. `Promise.all` se usa para ejecutar múltiples promesas concurrentemente.
-   **Manipulación del DOM:** Se utiliza JavaScript nativo para seleccionar elementos del DOM (`document.getElementById`, `document.querySelectorAll`), modificar su contenido (`innerHTML`), añadir/quitar clases (`classList`) y adjuntar/quitar event listeners.
-   **Event Listeners:** Se usan para responder a interacciones del usuario (clics, envíos de formulario, cambios de input) y eventos del navegador (carga del DOM, cambios de historial).
-   **`localStorage` y `sessionStorage`:** Utilizados por `AuthManager` para la persistencia de la sesión del usuario.
-   **`FormData` API:** Para recolectar fácilmente los datos de los formularios HTML.
-   **`URLSearchParams`:** Para construir y parsear parámetros de consulta en las URLs de la API.
-   **Expresiones Regulares (`RegExp`):** Utilizadas en el `Router` para hacer coincidir rutas con parámetros y en `UIManager` para la validación de emails.

## 4. Configuración y Ejecución del Proyecto

Para ejecutar este proyecto localmente, necesitarás Node.js y `json-server` para simular el backend.

### Prerrequisitos

-   Node.js (versión 14 o superior)
-   npm (Node Package Manager) o yarn

### Pasos para la Ejecución

1.  **Clonar el Repositorio (si aplica) o descargar los archivos.**

2.  **Instalar Dependencias:**
    Abre tu terminal en la raíz del proyecto y ejecuta:
    \`\`\`bash
    npm install
    \`\`\`
    Esto instalará `vite` y `json-server`.

3.  **Iniciar el Servidor de la API (Backend Simulado):**
    El archivo `db.json` actúa como tu base de datos. Inicia `json-server` para servir estos datos:
    \`\`\`bash
    npm run server
    \`\`\`
    Esto iniciará el servidor de la API en `http://localhost:3001`.

4.  **Iniciar la Aplicación Web (Frontend):**
    En una **nueva terminal** (mantén el servidor de la API ejecutándose en la primera), navega a la raíz del proyecto y ejecuta:
    \`\`\`bash
    npm run dev
    \`\`\`
    Esto iniciará la aplicación web en `http://localhost:3000` (o un puerto similar). Se abrirá automáticamente en tu navegador.

### Credenciales de Prueba

-   **Usuario Administrador:**
    -   **Usuario:** `admin`
    -   **Contraseña:** `admin123`
-   **Usuario Normal:**
    -   **Usuario:** `user1`
    -   **Contraseña:** `user123`

## 5. Mejoras Futuras Potenciales

-   **Manejo de Estado Global:** Para aplicaciones más grandes, considerar una solución de manejo de estado (ej. Redux-like pattern) para simplificar la comunicación entre componentes.
-   **Componentes Reutilizables:** Crear componentes UI más complejos y reutilizables (ej. un componente `EventCard` en lugar de generar HTML en `app.js`).
-   **Pruebas Unitarias/Integración:** Implementar pruebas automatizadas para la lógica de negocio y los componentes de la UI.
-   **Optimización de Rendimiento:** Lazy loading de módulos, virtualización de listas para tablas grandes.
-   **Internacionalización (i18n):** Soporte para múltiples idiomas.
-   **Accesibilidad (A11y):** Mejoras adicionales para usuarios con discapacidades.
-   **Backend Real:** Reemplazar `json-server` con un backend real (Node.js con Express, Python con Flask/Django, etc.) y una base de datos.

---
