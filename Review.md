_<h1 align="center"> English version </h1>_


## EventHub: Advanced Event Management (Pure JavaScript SPA)

This project is a Single Page Application (SPA) designed for event management. It allows users to explore events, register for them, and enables administrators to manage users and events through a dedicated control panel. The application is built using pure JavaScript, HTML, and CSS, demonstrating modern web development principles without relying on complex frameworks.

## 1. JavaScript Project Structure

The core of this application lies in its modular JavaScript architecture. Each main component of the application's logic is encapsulated in its own file, promoting maintainability, scalability, and code clarity.

The `JS/` folder contains the following key files:

-   `app.js`: The main entry point of the application. It orchestrates the initialization of all modules and handles the rendering logic for different views.
-   `api.js`: A service for interacting with the backend API (simulated with `json-server`). It centralizes all HTTP calls (GET, POST, PUT, PATCH, DELETE) for events, users, and registrations.
-   `auth.js`: Manages user authentication, registration, login/logout, and session persistence. It also handles role-based authorization (user/admin).
-   `router.js`: Implements a client-side routing system for the SPA. It allows navigation between different "pages" without a full page reload, including protected routes and parameter handling.
-   `ui-manager.js`: A dedicated class for managing the user interface. It is responsible for dynamically rendering content, displaying loading spinners, modals, "toast" notifications, and setting up form validation.
-   `vite.config.js`: Configuration file for Vite, the build tool used in this project. It defines how the application is served and compiled.

## 2. How JavaScript Works? (Architecture and Flow)

The application follows a modular design pattern and relies on the interaction between its main components:

### 2.1. `app.js` (The Orchestrator)

-   **Initialization (`init()`):** Upon DOM loading (`DOMContentLoaded`), `app.js` creates instances of `Router`, `AuthManager`, `ApiService`, and `UIManager`.
-   **Loading Management:** Displays a loading spinner at startup and hides it once the application is ready.
-   **Navigation Setup:** Sets up listeners for the mobile navigation menu and updates navigation links based on the user's authentication status (`updateNavigation()`).
-   **Route Definition:** Uses the `Router` to define all application routes (public, protected, and admin) and their respective rendering handlers.
-   **Global Error Handling:** Includes `window.addEventListener("error")` and `window.addEventListener("unhandledrejection")` to catch unhandled errors and ensure navigation updates, displaying an error message if necessary.
-   **View Rendering:** Contains methods like `renderHome()`, `renderLogin()`, `renderAdmin()`, etc., which are responsible for generating dynamic HTML for each "page" and passing it to the `UIManager` for display.
-   **UI Interaction:** Provides global functions (accessible via `window.app`) to interact with the UI, such as `showCreateEventModal()`, `registerForEvent()`, etc., which are called directly from the HTML.

### 2.2. `router.js` (The SPA Navigator)

-   **Client-Side Routing:** Instead of full page reloads, the `Router` intercepts URL hash changes (`#/`) and renders the corresponding content.
-   **`addRoute(path, handler, requiresAuth, requiredRole)`:** Allows defining routes with regular expressions to handle parameters (e.g., `/events/:id`).
-   **Programmatic Navigation:** The `navigate(path)` method updates the browser history and triggers route handling.
-   **Access Control:** Before executing a route handler, it checks if the route requires authentication (`requiresAuth`) and if the user has the necessary role (`requiredRole`) using the `AuthManager`. If requirements are not met, it redirects to login or displays an "Access Denied" message.
-   **Parameter Extraction:** Dynamically extracts parameters from the URL (e.g., `id` from `/events/123`).

### 2.3. `auth.js` (The Session Guardian)

-   **Session Management:** Stores and retrieves authenticated user information in `localStorage` to persist the session across page reloads.
-   **`login(identifier, password)`:** Authenticates the user against the simulated database, creates a session, and saves it.
-   **`register(userData)`:** Registers new users, including basic validations (required fields, email format, password length) and checks for unique username/email.
-   **`logout()`:** Clears the session from `localStorage` and resets the authentication state.
-   **Role Control:** Provides methods like `getCurrentUser()`, `hasRole(role)`, and `isAdmin()` to check user status and permissions.
-   **Change Notification:** Uses an observer pattern (`onAuthStateChange`, `notifyAuthStateChange`) to inform other modules (like `app.js` for navigation updates) about changes in the authentication state.

### 2.4. `api.js` (The Backend Communicator)

-   **Call Centralization:** Encapsulates all interactions with the backend (simulated by `json-server`).
-   **`request(endpoint, options)`:** A generic method for making HTTP requests, with error handling and response content type detection.
-   **Specific Methods:** Provides convenient methods for CRUD operations (`get`, `post`, `put`, `patch`, `delete`) and specific functions for business logic (e.g., `getEvents()`, `createEvent()`, `registerForEvent()`, `getDashboardStats()`).
-   **Data Validation:** Includes basic validations before sending data to the backend (e.g., required fields when creating an event).
-   **Business Logic:** Contains logic such as event capacity verification and managing `registeredCount` when registering/canceling.

### 2.5. `ui-manager.js` (The Interface Builder)

-   **Dynamic Rendering:** Injects HTML content into the main application container (`#content`).
-   **Reusable UI Components:**
    -   **`showLoading()` / `hideLoading()`:** Controls the visibility of a loading spinner.
    -   **`showModal(title, content, options)` / `hideModal()`:** Manages the opening and closing of modals, including their content, title, and footer.
    -   **`showToast(message, type, duration)`:** Displays "toast" notifications (pop-up messages) with different types (success, error, warning, info).
    -   **`showConfirmation(message, onConfirm, onCancel)`:** Presents a confirmation dialog before executing critical actions.
-   **Form Validation (`setupFormValidation(form, rules)`):**
    -   Applies validation rules to form fields.
    -   Displays specific error messages below each field.
    -   Prevents form submission if there are errors.
    -   Performs real-time validation (on field blur) and upon form submission attempt.
-   **UI Utilities:** Includes functions for formatting dates, currencies, controlling button states (`setButtonLoading`), and basic animations.

## 3. Key JavaScript Concepts Used

-   **ES Modules (`import`/`export`):** The project is fully modularized, allowing code to be organized into separate files and easily reused.
-   **JavaScript Classes:** Classes (`EventManagementApp`, `ApiService`, `AuthManager`, `Router`, `UIManager`) are used to encapsulate logic and data, following an object-oriented programming approach.
-   **Asynchronous Programming (`async`/`await`, `Promises`):** All operations involving the network (API calls) or component initialization are handled asynchronously to prevent blocking the user interface. `Promise.all` is used to execute multiple promises concurrently.
-   **DOM Manipulation:** Native JavaScript is used to select DOM elements (`document.getElementById`, `document.querySelectorAll`), modify their content (`innerHTML`), add/remove classes (`classList`), and attach/remove event listeners.
-   **Event Listeners:** Used to respond to user interactions (clicks, form submissions, input changes) and browser events (DOM load, history changes).
-   **`localStorage` and `sessionStorage`:** Used by `AuthManager` for user session persistence.
-   **`FormData` API:** For easily collecting data from HTML forms.
-   **`URLSearchParams`:** For building and parsing query parameters in API URLs.
-   **Regular Expressions (`RegExp`):** Used in the `Router` to match routes with parameters and in `UIManager` for email validation.

## 4. Project Setup and Execution

To run this project locally, you will need Node.js and `json-server` to simulate the backend.

### Prerequisites

-   Node.js (version 14 or higher)
-   npm (Node Package Manager) or yarn

### Execution Steps

1.  **Clone the Repository (if applicable) or download the files.**

2.  **Install Dependencies:**
    Open your terminal in the project root and run:
    \`\`\`bash
    npm install
    \`\`\`
    This will install `vite` and `json-server`.

3.  **Start the API Server (Simulated Backend):**
    The `db.json` file acts as your database. Start `json-server` to serve this data:
    \`\`\`bash
    npm run server
    \`\`\`
    This will start the API server at `http://localhost:3001`.

4.  **Start the Web Application (Frontend):**
    In a **new terminal** (keep the API server running in the first one), navigate to the project root and run:
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the web application at `http://localhost:3000` (or a similar port). It will automatically open in your browser.

### Test Credentials

-   **Admin User:**
    -   **Username:** `admin`
    -   **Password:** `admin123`
-   **Regular User:**
    -   **Username:** `user1`
    -   **Password:** `user123`

## 5. Potential Future Improvements

-   **Global State Management:** For larger applications, consider a state management solution (e.g., Redux-like pattern) to simplify communication between components.
-   **Reusable Components:** Create more complex and reusable UI components (e.g., an `EventCard` component instead of generating HTML in `app.js`).
-   **Unit/Integration Testing:** Implement automated tests for business logic and UI components.
-   **Performance Optimization:** Lazy loading modules, list virtualization for large tables.
-   **Internationalization (i18n):** Support for multiple languages.
-   **Accessibility (A11y):** Additional improvements for users with disabilities.
-   **Real Backend:** Replace `json-server` with a real backend (Node.js with Express, Python with Flask/Django, etc.) and a database.

---
<br>

_<h1 align="center"> Version Español </h1>_


## EventHub: Gestión Avanzada de Eventos (SPA con JavaScript Puro)

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
