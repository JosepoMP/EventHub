// Main Application Entry Point
import { Router } from "./router.js"
import { AuthManager } from "./auth.js"
import { ApiService } from "./api.js"
import { UIManager } from "./ui-manager.js"

/**
 * Main Application Class
 * Orchestrates the entire SPA functionality
 */
class EventManagementApp {
  constructor() {
    this.router = new Router()
    this.auth = new AuthManager()
    this.api = new ApiService()
    this.ui = new UIManager()

    this.init()
  }

  /**
   * Initialize the application
   * Sets up event listeners and starts the router
   */
  async init() {
    try {
      // Show loading spinner
      this.ui.showLoading()

      // Setup navigation event listeners FIRST
      this.setupNavigation()

      // Initialize authentication state
      await this.auth.init()

      // Initialize router with routes
      this.setupRoutes()

      // Start the router
      this.router.start()

      // Add global error handler to maintain navigation
      window.addEventListener("error", () => {
        setTimeout(() => this.forceNavigationUpdate(), 100)
      })

      // Add unhandled promise rejection handler
      window.addEventListener("unhandledrejection", () => {
        setTimeout(() => this.forceNavigationUpdate(), 100)
      })

      // Periodically check and update navigation (every 5 seconds)
      setInterval(() => {
        this.forceNavigationUpdate()
      }, 5000)

      // Hide loading spinner
      this.ui.hideLoading()

      console.log("✅ EventHub Application initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize application:", error)
      this.ui.showToast("Failed to initialize application", "error")

      // Even on error, ensure navigation is shown
      this.updateNavigation(this.auth.getCurrentUser())
      this.ui.hideLoading()
    }
  }

  /**
   * Setup navigation event listeners
   */
  setupNavigation() {
    // Mobile menu toggle
    const navToggle = document.getElementById("nav-toggle")
    const navMenu = document.getElementById("nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active")
      })
    }

    // Close mobile menu when clicking on links
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-route]")) {
        navMenu?.classList.remove("active")
      }
    })

    // Update navigation based on auth state
    this.auth.onAuthStateChange((user) => {
      this.updateNavigation(user)
    })
  }

  /**
   * Update navigation based on authentication state
   */
  updateNavigation(user) {
    const navAuth = document.getElementById("nav-auth")
    if (!navAuth) {
      // If nav-auth doesn't exist yet, try again in a moment
      setTimeout(() => this.updateNavigation(user), 100)
      return
    }

    // Clear existing content
    navAuth.innerHTML = ""

    if (user) {
      navAuth.innerHTML = `
<div class="nav-user">
 <span class="nav-username">
   <i class="fas fa-user-circle"></i>
   ${user.firstName} ${user.lastName}
   ${user.role === "admin" ? '<span class="admin-badge">Admin</span>' : ""}
 </span>
 <button class="btn btn-secondary btn-sm" id="logout-btn">
   <i class="fas fa-sign-out-alt"></i>
   Logout
 </button>
</div>
`

      // Add logout functionality with proper event handling
      const logoutBtn = document.getElementById("logout-btn")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
          e.preventDefault()
          e.stopPropagation()

          try {
            await this.auth.logout()
            this.ui.showToast("Logged out successfully!", "success")
            this.router.navigate("/")
          } catch (error) {
            console.error("Logout error:", error)
            this.ui.showToast("Error logging out", "error")
            // Force logout even on error
            this.auth.currentUser = null
            this.auth.clearSession()
            this.updateNavigation(null)
          }
        })
      }

      // Add admin navigation if user is admin
      if (user.role === "admin") {
        this.addAdminNavigation()
        this.removeUserNavigation() // Ensure user nav is removed for admin
      } else {
        this.removeAdminNavigation()
        this.addUserNavigation() // Ensure user nav is added for regular users
      }
    } else {
      navAuth.innerHTML = `
<a href="#/login" class="btn btn-secondary btn-sm" data-route="/login">
 <i class="fas fa-sign-in-alt"></i>
 Login
</a>
<a href="#/register" class="btn btn-primary btn-sm" data-route="/register">
 <i class="fas fa-user-plus"></i>
 Register
</a>
`
      this.removeAdminNavigation()
      this.removeUserNavigation()
    }

    console.log("Navigation updated for user:", user ? user.username : "anonymous")
  }

  /**
   * Add admin-specific navigation items
   */
  addAdminNavigation() {
    const navMenu = document.getElementById("nav-menu")
    const existingAdminLink = navMenu.querySelector('[data-route="/admin"]')

    if (!existingAdminLink) {
      const adminLink = document.createElement("a")
      adminLink.href = "#/admin"
      adminLink.className = "nav-link"
      adminLink.setAttribute("data-route", "/admin")
      adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin Panel'

      // Insert before auth section
      const navAuth = document.getElementById("nav-auth")
      navMenu.insertBefore(adminLink, navAuth)
    }
  }

  /**
   * Remove admin-specific navigation items
   */
  removeAdminNavigation() {
    const navMenu = document.getElementById("nav-menu")
    const existingAdminLink = navMenu.querySelector('[data-route="/admin"]')
    if (existingAdminLink) {
      existingAdminLink.remove()
    }
  }

  /**
   * Add user-specific navigation items
   */
  addUserNavigation() {
    const navMenu = document.getElementById("nav-menu")
    const existingEnrollmentLink = navMenu.querySelector('[data-route="/enrollment"]')
    const existingMyEventsLink = navMenu.querySelector('[data-route="/my-events"]')
    const existingProfileLink = navMenu.querySelector('[data-route="/profile"]')

    // Add Enrollment link
    if (!existingEnrollmentLink) {
      const enrollmentLink = document.createElement("a")
      enrollmentLink.href = "#/enrollment"
      enrollmentLink.className = "nav-link"
      enrollmentLink.setAttribute("data-route", "/enrollment")
      enrollmentLink.innerHTML = '<i class="fas fa-ticket-alt"></i> Enrollment'
      const navAuth = document.getElementById("nav-auth")
      navMenu.insertBefore(enrollmentLink, navAuth)
    }

    // Add My Events link
    if (!existingMyEventsLink) {
      const myEventsLink = document.createElement("a")
      myEventsLink.href = "#/my-events"
      myEventsLink.className = "nav-link"
      myEventsLink.setAttribute("data-route", "/my-events")
      myEventsLink.innerHTML = '<i class="fas fa-calendar-check"></i> My Events'
      const navAuth = document.getElementById("nav-auth")
      navMenu.insertBefore(myEventsLink, navAuth)
    }

    // Add Profile link
    if (!existingProfileLink) {
      const profileLink = document.createElement("a")
      profileLink.href = "#/profile"
      profileLink.className = "nav-link"
      profileLink.setAttribute("data-route", "/profile")
      profileLink.innerHTML = '<i class="fas fa-user-circle"></i> Profile'
      const navAuth = document.getElementById("nav-auth")
      navMenu.insertBefore(profileLink, navAuth)
    }
  }

  /**
   * Remove user-specific navigation items
   */
  removeUserNavigation() {
    const navMenu = document.getElementById("nav-menu")
    const existingEnrollmentLink = navMenu.querySelector('[data-route="/enrollment"]')
    const existingMyEventsLink = navMenu.querySelector('[data-route="/my-events"]')
    const existingProfileLink = navMenu.querySelector('[data-route="/profile"]')

    if (existingEnrollmentLink) {
      existingEnrollmentLink.remove()
    }
    if (existingMyEventsLink) {
      existingMyEventsLink.remove()
    }
    if (existingProfileLink) {
      existingProfileLink.remove()
    }
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    // Public routes
    this.router.addRoute("/", () => this.renderHome())
    // Removed /events and /events/:id routes as per request
    this.router.addRoute("/login", () => this.renderLogin())
    this.router.addRoute("/register", () => this.renderRegister())

    // Protected routes
    this.router.addRoute("/profile", () => this.renderProfile(), true)
    this.router.addRoute("/my-events", () => this.renderMyEvents(), true)
    this.router.addRoute("/enrollment", () => this.renderEnrollment(), true)

    // Admin routes
    this.router.addRoute("/admin", () => this.renderAdmin(), true, "admin")
    this.router.addRoute("/admin/events", () => this.renderAdminEvents(), true, "admin")
    this.router.addRoute("/admin/users", () => this.renderAdminUsers(), true, "admin")

    // 404 route
    this.router.addRoute("*", () => this.render404())
  }

  /**
   * Render Home Page
   */
  async renderHome() {
    try {
      const events = await this.api.getEvents()
      const stats = await this.getStats()
      const currentUser = this.auth.getCurrentUser()
      let registeredEventIds = new Set()

      // Fetch user registrations if logged in to determine 'isRegistered' status
      if (currentUser) {
        const userRegistrations = await this.api.getUserRegistrations(currentUser.id)
        registeredEventIds = new Set(userRegistrations.map((reg) => reg.eventId))
      }

      const content = `
             <div class="hero">
                 <div class="hero-content">
                     <h1 class="hero-title">Welcome to EventHub</h1>
                     <p class="hero-subtitle">
                         Discover amazing events, connect with people, and create unforgettable experiences
                     </p>
                     <div class="hero-actions">
                         <a href="#/enrollment" class="btn btn-primary btn-lg" data-route="/enrollment">
                             <i class="fas fa-calendar"></i>
                             Explore Events
                         </a>
                         ${
                           !this.auth.getCurrentUser()
                             ? `
                             <a href="#/register" class="btn btn-secondary btn-lg" data-route="/register">
                                 <i class="fas fa-user-plus"></i>
                                 Join Now
                             </a>
                         `
                             : ""
                         }
                     </div>
                 </div>
             </div>

             <div class="stats">
                 <div class="stat-card">
                     <div class="stat-number">${stats.totalEvents}</div>
                     <div class="stat-label">Total Events</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">${stats.totalRegistrations}</div>
                     <div class="stat-label">Registrations</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">${stats.activeEvents}</div>
                     <div class="stat-label">Active Events</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">${stats.totalUsers}</div>
                     <div class="stat-label">Users</div>
                 </div>
             </div>

             <section class="featured-events">
                 <h2 class="section-title">Featured Events</h2>
                 <div class="card">
                     <div class="card-body">
                         <div class="featured-events-scroll-wrapper">
                             <div class="featured-events-grid">
                                 ${events
                                   .map((event) => this.createEventCard(event, registeredEventIds.has(event.id)))
                                   .join("")}
                             </div>
                         </div>
                     </div>
                 </div>
                 <div class="text-center mt-8">
                     <a href="#/enrollment" class="btn btn-primary" data-route="/enrollment">
                         View All Events
                     </a>
                 </div>
             </section>
         `

      this.ui.renderContent(content)
      this.updateActiveNavLink("/")
    } catch (error) {
      console.error("Error rendering home page:", error)
      this.ui.showToast("Failed to load home page", "error")
    }
  }

  /**
   * Create event card HTML
   * @param {object} event - Event data
   * @param {boolean} isRegistered - True if the current user is registered for this event
   */
  createEventCard(event, isRegistered) {
    const isFull = event.registeredCount >= event.capacity
    const user = this.auth.getCurrentUser()

    return `
 <div class="card event-card">
   <div class="event-content">
     <div class="event-header">
       <div class="event-category">${event.category}</div>
       <div class="event-status ${event.status}">
         ${isFull ? "Full" : event.status}
       </div>
     </div>
     <h3 class="event-title">${event.title}</h3>
     <p class="event-description">${event.description}</p>
     <div class="event-meta">
       <div class="event-meta-item">
         <i class="fas fa-calendar"></i>
         <span>${new Date(event.date).toLocaleDateString()}</span>
       </div>
       <div class="event-meta-item">
         <i class="fas fa-clock"></i>
         <span>${event.time}</span>
       </div>
       <div class="event-meta-item">
         <i class="fas fa-map-marker-alt"></i>
         <span>${event.location}</span>
       </div>
       <div class="event-meta-item">
         <i class="fas fa-users"></i>
         <span>${event.registeredCount}/${event.capacity}</span>
       </div>
     </div>
     <div class="event-footer">
       <div class="event-price">$${event.price}</div>
       <div class="event-actions">
         <button class="btn btn-secondary btn-sm" onclick="app.showEventDetails(${event.id})">
           <i class="fas fa-info-circle"></i>
           Details
         </button>
         ${
           user && !isRegistered && !isFull
             ? `
             <button class="btn btn-primary btn-sm" onclick="app.registerForEvent(${event.id})">
               <i class="fas fa-ticket-alt"></i>
               Register
             </button>
           `
             : ""
         }
         ${
           isRegistered
             ? `
             <span class="btn btn-success btn-sm">
               <i class="fas fa-check"></i> Registered
             </span>
           `
             : ""
         }
       </div>
     </div>
   </div>
 </div>
`
  }

  /**
   * Render Login Page
   */
  renderLogin() {
    if (this.auth.getCurrentUser()) {
      this.router.navigate("/")
      return
    }

    const content = `
         <div class="auth-container">
             <div class="card auth-card">
                 <div class="card-header">
                     <h2 class="modal-title">Login to EventHub</h2>
                 </div>
                 <div class="card-body">
                     <form id="login-form">
                         <div class="form-group">
                             <label class="form-label">Email or Username</label>
                             <input type="text" id="login-identifier" class="form-input" required>
                             <div class="form-error" id="identifier-error"></div>
                         </div>
                         <div class="form-group">
                             <label class="form-label">Password</label>
                             <input type="password" id="login-password" class="form-input" required>
                             <div class="form-error" id="password-error"></div>
                         </div>
                         <button type="submit" class="btn btn-primary w-full">
                             <i class="fas fa-sign-in-alt"></i>
                             Login
                         </button>
                     </form>
                 </div>
                 <div class="card-footer text-center">
                     <p>Don't have an account? 
                         <a href="#/register" data-route="/register">Register here</a>
                     </p>
                 </div>
             </div>
         </div>
     `

    this.ui.renderContent(content)
    this.setupLoginForm()
    this.updateActiveNavLink("/login")
  }

  /**
   * Setup login form functionality
   */
  setupLoginForm() {
    const form = document.getElementById("login-form")
    form?.addEventListener("submit", async (e) => {
      e.preventDefault()

      const identifier = document.getElementById("login-identifier").value
      const password = document.getElementById("login-password").value

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]')
      this.ui.setButtonLoading(submitBtn, true)

      try {
        const user = await this.auth.login(identifier, password)
        this.ui.showToast("Login successful!", "success")

        // Force navigation update immediately
        this.updateNavigation(user)

        // Navigate to home after a short delay to ensure UI updates
        setTimeout(() => {
          this.router.navigate("/")
        }, 100)
      } catch (error) {
        this.ui.showToast(error.message, "error")
        // Ensure navigation is still shown even on login error
        this.updateNavigation(this.auth.getCurrentUser())
      } finally {
        this.ui.setButtonLoading(submitBtn, false)
      }
    })
  }

  /**
   * Render Register Page
   */
  renderRegister() {
    if (this.auth.getCurrentUser()) {
      this.router.navigate("/")
      return
    }

    const content = `
         <div class="auth-container">
             <div class="card auth-card">
                 <div class="card-header">
                     <h2 class="modal-title">Join EventHub</h2>
                 </div>
                 <div class="card-body">
                     <form id="register-form">
                         <div class="grid grid-cols-2">
                             <div class="form-group">
                                 <label class="form-label">First Name</label>
                                 <input type="text" id="register-firstname" class="form-input" required>
                             </div>
                             <div class="form-group">
                                 <label class="form-label">Last Name</label>
                                 <input type="text" id="register-lastname" class="form-input" required>
                             </div>
                         </div>
                         <div class="form-group">
                             <label class="form-label">Username</label>
                             <input type="text" id="register-username" class="form-input" required>
                         </div>
                         <div class="form-group">
                             <label class="form-label">Email</label>
                             <input type="email" id="register-email" class="form-input" required>
                         </div>
                         <div class="form-group">
                             <label class="form-label">Password</label>
                             <input type="password" id="register-password" class="form-input" required>
                         </div>
                         <div class="form-group">
                             <label class="form-label">Confirm Password</label>
                             <input type="password" id="register-confirm-password" class="form-input" required>
                         </div>
                         <button type="submit" class="btn btn-primary w-full">
                             <i class="fas fa-user-plus"></i>
                             Create Account
                         </button>
                     </form>
                 </div>
                 <div class="card-footer text-center">
                     <p>Already have an account? 
                         <a href="#/login" data-route="/login">Login here</a>
                     </p>
                 </div>
             </div>
         </div>
     `

    this.ui.renderContent(content)
    this.setupRegisterForm()
    this.updateActiveNavLink("/register")
  }

  /**
   * Setup register form functionality
   */
  setupRegisterForm() {
    const form = document.getElementById("register-form")
    form?.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        firstName: document.getElementById("register-firstname").value,
        lastName: document.getElementById("register-lastname").value,
        username: document.getElementById("register-username").value,
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        confirmPassword: document.getElementById("register-confirm-password").value,
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        this.ui.showToast("Passwords do not match", "error")
        return
      }

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]')
      this.ui.setButtonLoading(submitBtn, true)

      try {
        await this.auth.register(formData)
        this.ui.showToast("Registration successful!", "success")
        this.router.navigate("/")
      } catch (error) {
        this.ui.showToast(error.message, "error")
      } finally {
        this.ui.setButtonLoading(submitBtn, false)
      }
    })
  }

  /**
   * Render Admin Dashboard
   */
  async renderAdmin() {
    try {
      const stats = await this.api.getDashboardStats()
      const recentEvents = await this.api.getEvents()
      const recentUsers = await this.api.getUsers()

      const content = `
   <div class="admin-dashboard">
     <div class="admin-header">
       <h1 class="page-title">
         <i class="fas fa-tachometer-alt"></i>
         Admin Dashboard
       </h1>
       <div class="admin-actions">
         <button class="btn btn-primary" onclick="app.showCreateEventModal()">
           <i class="fas fa-plus"></i>
           Create Event
         </button>
       </div>
     </div>

     <!-- Stats Cards -->
     <div class="admin-stats grid grid-cols-4">
       <div class="stat-card admin-stat-card">
         <div class="stat-icon">
           <i class="fas fa-calendar"></i>
         </div>
         <div class="stat-info">
           <div class="stat-number">${stats.totalEvents}</div>
           <div class="stat-label">Total Events</div>
         </div>
       </div>
       <div class="stat-card admin-stat-card">
         <div class="stat-icon">
           <i class="fas fa-users"></i>
         </div>
         <div class="stat-info">
           <div class="stat-number">${stats.totalUsers}</div>
           <div class="stat-label">Total Users</div>
         </div>
       </div>
       <div class="stat-card admin-stat-card">
         <div class="stat-icon">
           <i class="fas fa-ticket-alt"></i>
         </div>
         <div class="stat-info">
           <div class="stat-number">${stats.totalRegistrations}</div>
           <div class="stat-label">Registrations</div>
         </div>
       </div>
       <div class="stat-card admin-stat-card">
         <div class="stat-icon">
           <i class="fas fa-dollar-sign"></i>
         </div>
         <div class="stat-info">
           <div class="stat-number">$${stats.totalRevenue?.toLocaleString() || 0}</div>
           <div class="stat-label">Total Revenue</div>
         </div>
       </div>
     </div>

     <!-- Quick Actions -->
     <div class="admin-sections grid grid-cols-2">
       <div class="admin-section">
         <div class="section-header">
           <h3>
             <i class="fas fa-calendar-alt"></i>
             Event Management
           </h3>
           <a href="#/admin/events" class="btn btn-secondary btn-sm" data-route="/admin/events">
             View All
           </a>
         </div>
         <div class="section-content">
           <div class="recent-items">
             ${recentEvents
               .slice(0, 5)
               .map(
                 (event) => `
                 <div class="recent-item">
                   <div class="item-info">
                     <div class="item-title">${event.title}</div>
                     <div class="item-meta">${new Date(event.date).toLocaleDateString()} • ${event.registeredCount}/${event.capacity} registered</div>
                   </div>
                   <div class="item-actions">
                     <button class="btn-icon" onclick="app.showEditEventModal(${event.id})" title="Edit">
                       <i class="fas fa-edit"></i>
                     </button>
                     <button class="btn-icon btn-danger" onclick="app.confirmDeleteEvent(${event.id})" title="Delete">
                       <i class="fas fa-trash"></i>
                     </button>
                   </div>
                 </div>
               `,
               )
               .join("")}
           </div>
         </div>
       </div>

       <div class="admin-section">
         <div class="section-header">
           <h3>
             <i class="fas fa-users"></i>
             User Management
           </h3>
           <a href="#/admin/users" class="btn btn-secondary btn-sm" data-route="/admin/users">
             View All
           </a>
         </div>
         <div class="section-content">
           <div class="recent-items">
             ${recentUsers
               .slice(0, 5)
               .map(
                 (user) => `
                 <div class="recent-item">
                   <div class="item-info">
                     <div class="item-title">${user.firstName} ${user.lastName}</div>
                     <div class="item-meta">${user.email} • ${user.role}</div>
                   </div>
                   <div class="item-status">
                     <span class="status-badge ${user.role}">${user.role}</span>
                   </div>
                 </div>
               `,
               )
               .join("")}
           </div>
         </div>
       </div>
     </div>
   </div>
 `

      this.ui.renderContent(content)
      this.updateActiveNavLink("/admin")
    } catch (error) {
      console.error("Error rendering admin dashboard:", error)
      this.ui.showToast("Failed to load admin dashboard", "error")
    }
  }

  /**
   * Render Admin Events Management
   */
  async renderAdminEvents() {
    try {
      const events = await this.api.getEvents()

      const content = `
   <div class="admin-events">
     <div class="admin-header">
       <h1 class="page-title">
         <i class="fas fa-calendar-alt"></i>
         Event Management
       </h1>
       <div class="admin-actions">
         <button class="btn btn-primary" onclick="app.showCreateEventModal()">
           <i class="fas fa-plus"></i>
           Create New Event
         </button>
       </div>
     </div>

     <!-- Events Table -->
     <div class="admin-table-container">
       <table class="admin-table">
         <thead>
           <tr>
             <th>Event</th>
             <th>Date & Time</th>
             <th>Location</th>
             <th>Capacity</th>
             <th>Price</th>
             <th>Status</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
           ${events
             .map(
               (event) => `
             <tr>
               <td>
                 <div class="event-info">
                   <div class="event-title">${event.title}</div>
                   <div class="event-category">${event.category}</div>
                 </div>
               </td>
               <td>
                 <div class="event-datetime">
                   <div>${new Date(event.date).toLocaleDateString()}</div>
                   <div class="event-time">${event.time}</div>
                 </div>
               </td>
               <td>${event.location}</td>
               <td>
                 <div class="capacity-info">
                   <span class="registered">${event.registeredCount}</span>
                   <span class="separator">/</span>
                   <span class="total">${event.capacity}</span>
                 </div>
               </td>
               <td class="event-price">$${event.price}</td>
               <td>
                 <span class="status-badge ${event.status}">
                   ${event.status}
                 </span>
               </td>
               <td>
                 <div class="action-buttons">
                   <button class="btn btn-secondary btn-sm" onclick="app.showEditEventModal(${event.id})">
                     <i class="fas fa-edit"></i>
                     Edit
                   </button>
                   <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteEvent(${event.id})">
                     <i class="fas fa-trash"></i>
                     Delete
                   </button>
                 </div>
               </td>
             </tr>
           `,
             )
             .join("")}
         </tbody>
       </table>
     </div>

     ${
       events.length === 0
         ? `
       <div class="empty-state">
         <i class="fas fa-calendar-times"></i>
         <h3>No Events Found</h3>
         <p>Start by creating your first event.</p>
         <button class="btn btn-primary" onclick="app.showCreateEventModal()">
           <i class="fas fa-plus"></i>
           Create Event
         </button>
       </div>
     `
         : ""
     }
   </div>
 `

      this.ui.renderContent(content)
      this.updateActiveNavLink("/admin/events")
    } catch (error) {
      console.error("Error rendering admin events:", error)
      this.ui.showToast("Failed to load events", "error")
    }
  }

  /**
   * Show Create Event Modal
   */
  showCreateEventModal() {
    const modalContent = `
 <form id="create-event-form" class="event-form">
   <div class="form-row">
     <div class="form-group">
       <label class="form-label">Event Title *</label>
       <input type="text" name="title" class="form-input" required>
       <div class="form-error"></div>
     </div>
     <div class="form-group">
       <label class="form-label">Category *</label>
       <select name="category" class="form-select" required>
         <option value="">Select Category</option>
         <option value="Technology">Technology</option>
         <option value="Music">Music</option>
         <option value="Sports">Sports</option>
         <option value="Business">Business</option>
         <option value="Arts">Arts</option>
         <option value="Education">Education</option>
         <option value="Food">Food & Drink</option>
         <option value="Health">Health & Wellness</option>
       </select>
       <div class="form-error"></div>
     </div>
   </div>

   <div class="form-group">
     <label class="form-label">Description *</label>
     <textarea name="description" class="form-textarea" rows="4" required></textarea>
     <div class="form-error"></div>
   </div>

   <div class="form-row">
     <div class="form-group">
       <label class="form-label">Date *</label>
       <input type="date" name="date" class="form-input" required>
       <div class="form-error"></div>
     </div>
     <div class="form-group">
       <label class="form-label">Time *</label>
       <input type="time" name="time" class="form-input" required>
       <div class="form-error"></div>
     </div>
   </div>

   <div class="form-group">
     <label class="form-label">Location *</label>
     <input type="text" name="location" class="form-input" required>
     <div class="form-error"></div>
   </div>

   <div class="form-row">
     <div class="form-group">
       <label class="form-label">Capacity *</label>
       <input type="number" name="capacity" class="form-input" min="1" required>
       <div class="form-error"></div>
     </div>
     <div class="form-group">
       <label class="form-label">Price ($) *</label>
       <input type="number" name="price" class="form-input" min="0" step="0.01" required>
       <div class="form-error"></div>
     </div>
   </div>

   <div class="form-group">
     <label class="form-label">Organizer</label>
     <input type="text" name="organizer" class="form-input" placeholder="Event organizer name">
     <div class="form-error"></div>
   </div>
 </form>
`

    const modalFooter = `
 <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
   Cancel
 </button>
 <button type="submit" form="create-event-form" class="btn btn-primary">
   <i class="fas fa-plus"></i>
   Create Event
 </button>
`

    this.ui.showModal("Create New Event", modalContent, { footer: modalFooter })
    this.setupEventForm("create-event-form", "create")
  }

  /**
   * Show Edit Event Modal
   */
  async showEditEventModal(eventId) {
    try {
      const event = await this.api.getEvent(eventId)

      const modalContent = `
   <form id="edit-event-form" class="event-form">
     <input type="hidden" name="id" value="${event.id}">
     
     <div class="form-row">
       <div class="form-group">
         <label class="form-label">Event Title *</label>
         <input type="text" name="title" class="form-input" value="${event.title}" required>
         <div class="form-error"></div>
       </div>
       <div class="form-group">
         <label class="form-label">Category *</label>
         <select name="category" class="form-select" required>
           <option value="">Select Category</option>
           <option value="Technology" ${event.category === "Technology" ? "selected" : ""}>Technology</option>
           <option value="Music" ${event.category === "Music" ? "selected" : ""}>Music</option>
           <option value="Sports" ${event.category === "Sports" ? "selected" : ""}>Sports</option>
           <option value="Business" ${event.category === "Business" ? "selected" : ""}>Business</option>
           <option value="Arts" ${event.category === "Arts" ? "selected" : ""}>Arts</option>
           <option value="Education" ${event.category === "Education" ? "selected" : ""}>Education</option>
           <option value="Food" ${event.category === "Food" ? "selected" : ""}>Food & Drink</option>
           <option value="Health" ${event.category === "Health" ? "selected" : ""}>Health & Wellness</option>
         </select>
         <div class="form-error"></div>
       </div>
     </div>

     <div class="form-group">
       <label class="form-label">Description *</label>
       <textarea name="description" class="form-textarea" rows="4" required>${event.description}</textarea>
       <div class="form-error"></div>
     </div>

     <div class="form-row">
       <div class="form-group">
         <label class="form-label">Date *</label>
         <input type="date" name="date" class="form-input" value="${event.date}" required>
         <div class="form-error"></div>
       </div>
       <div class="form-group">
         <label class="form-label">Time *</label>
         <input type="time" name="time" class="form-input" value="${event.time}" required>
         <div class="form-error"></div>
       </div>
     </div>

     <div class="form-group">
       <label class="form-label">Location *</label>
       <input type="text" name="location" class="form-input" value="${event.location}" required>
       <div class="form-error"></div>
     </div>

     <div class="form-row">
       <div class="form-group">
         <label class="form-label">Capacity *</label>
         <input type="number" name="capacity" class="form-input" min="${event.registeredCount}" value="${event.capacity}" required>
         <div class="form-error"></div>
         <small class="form-help">Cannot be less than current registrations (${event.registeredCount})</small>
       </div>
       <div class="form-group">
         <label class="form-label">Price ($) *</label>
         <input type="number" name="price" class="form-input" min="0" step="0.01" value="${event.price}" required>
         <div class="form-error"></div>
       </div>
     </div>

     <div class="form-row">
       <div class="form-group">
         <label class="form-label">Organizer</label>
         <input type="text" name="organizer" class="form-input" value="${event.organizer || ""}" placeholder="Event organizer name">
         <div class="form-error"></div>
       </div>
       <div class="form-group">
         <label class="form-label">Status</label>
         <select name="status" class="form-select">
           <option value="active" ${event.status === "active" ? "selected" : ""}>Active</option>
           <option value="inactive" ${event.status === "inactive" ? "selected" : ""}>Inactive</option>
           <option value="cancelled" ${event.status === "cancelled" ? "selected" : ""}>Cancelled</option>
         </select>
         <div class="form-error"></div>
       </div>
     </div>
   </form>
 `

      const modalFooter = `
   <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
     Cancel
   </button>
   <button type="submit" form="edit-event-form" class="btn btn-primary">
     <i class="fas fa-save"></i>
     Update Event
   </button>
 `

      this.ui.showModal("Edit Event", modalContent, { footer: modalFooter })
      this.setupEventForm("edit-event-form", "edit")
    } catch (error) {
      console.error("Error loading event for edit:", error)
      this.ui.showToast("Failed to load event details", "error")
    }
  }

  /**
   * Setup Event Form (Create/Edit)
   */
  setupEventForm(formId, mode) {
    const form = document.getElementById(formId)
    if (!form) return

    // Form validation rules
    const validationRules = {
      title: {
        required: true,
        minLength: 3,
        label: "Event Title",
      },
      category: {
        required: true,
        label: "Category",
      },
      description: {
        required: true,
        minLength: 10,
        label: "Description",
      },
      date: {
        required: true,
        custom: (value) => new Date(value) >= new Date().setHours(0, 0, 0, 0),
        customMessage: "Event date cannot be in the past",
        label: "Date",
      },
      time: {
        required: true,
        label: "Time",
      },
      location: {
        required: true,
        minLength: 3,
        label: "Location",
      },
      capacity: {
        required: true,
        custom: (value) => Number.parseInt(value) > 0,
        customMessage: "Capacity must be greater than 0",
        label: "Capacity",
      },
      price: {
        required: true,
        custom: (value) => Number.parseFloat(value) >= 0,
        customMessage: "Price cannot be negative",
        label: "Price",
      },
    }

    // Setup form validation
    this.ui.setupFormValidation(form, validationRules)

    // Handle form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(form)
      const eventData = Object.fromEntries(formData.entries())

      // Convert numeric fields
      eventData.capacity = Number.parseInt(eventData.capacity)
      eventData.price = Number.parseFloat(eventData.price)

      const submitBtn = form.querySelector('button[type="submit"]')
      this.ui.setButtonLoading(submitBtn, true)

      try {
        if (mode === "create") {
          await this.api.createEvent(eventData)
          this.ui.showToast("Event created successfully!", "success")
        } else {
          await this.api.updateEvent(eventData.id, eventData)
          this.ui.showToast("Event updated successfully!", "success")
        }

        this.ui.hideModal()

        // Refresh the current page
        this.router.refresh()
      } catch (error) {
        console.error(`Error ${mode}ing event:`, error)
        this.ui.showToast(error.message, "error")
      } finally {
        this.ui.setButtonLoading(submitBtn, false)
      }
    })
  }

  /**
   * Confirm Delete Event
   */
  confirmDeleteEvent(eventId) {
    this.ui.showConfirmation(
      "Are you sure you want to delete this event? This action cannot be undone and will affect all registered users.",
      async () => {
        try {
          await this.api.deleteEvent(eventId)
          this.ui.showToast("Event deleted successfully!", "success")
          this.router.refresh()
        } catch (error) {
          console.error("Error deleting event:", error)
          this.ui.showToast("Failed to delete event", "error")
        }
      },
    )
  }

  /**
   * Render Admin Users Management
   */
  async renderAdminUsers() {
    try {
      const users = await this.api.getUsers()

      const content = `
   <div class="admin-users">
     <div class="admin-header">
       <h1 class="page-title">
         <i class="fas fa-users"></i>
         User Management
       </h1>
     </div>

     <!-- Users Table -->
     <div class="admin-table-container">
       <table class="admin-table">
         <thead>
           <tr>
             <th>User</th>
             <th>Email</th>
             <th>Role</th>
             <th>Joined</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
           ${users
             .map(
               (user) => `
             <tr>
               <td>
                 <div class="user-info">
                   <div class="user-name">${user.firstName} ${user.lastName}</div>
                   <div class="user-username">@${user.username}</div>
                 </div>
               </td>
               <td>${user.email}</td>
               <td>
                   <span class="role-badge ${user.role}">
                     ${user.role}
                   </span>
               </td>
               <td>${new Date(user.createdAt).toLocaleDateString()}</td>
               <td>
                 <div class="action-buttons">
                   <button class="btn btn-secondary btn-sm" onclick="app.showEditUserModal(${user.id})">
                     <i class="fas fa-edit"></i>
                     Edit
                   </button>
                   <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteUser(${user.id})">
                     <i class="fas fa-trash"></i>
                     Delete
                   </button>
                 </div>
               </td>
             </tr>
           `,
             )
             .join("")}
         </tbody>
       </table>
     </div>
   </div>
 `

      this.ui.renderContent(content)
      this.updateActiveNavLink("/admin/users")
    } catch (error) {
      console.error("Error rendering admin users:", error)
      this.ui.showToast("Failed to load users", "error")
    }
  }

  /**
   * Show Edit User Modal
   * @param {number} userId - The ID of the user to edit
   */
  async showEditUserModal(userId) {
    try {
      const user = await this.api.getUser(userId)

      const modalContent = `
        <form id="edit-user-form" class="event-form">
          <input type="hidden" name="id" value="${user.id}">
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name *</label>
              <input type="text" name="firstName" class="form-input" value="${user.firstName}" required>
              <div class="form-error"></div>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input type="text" name="lastName" class="form-input" value="${user.lastName}" required>
              <div class="form-error"></div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Username *</label>
            <input type="text" name="username" class="form-input" value="${user.username}" required>
            <div class="form-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input type="email" name="email" class="form-input" value="${user.email}" required>
            <div class="form-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Role *</label>
            <select name="role" class="form-select" required>
              <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
            <div class="form-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">New Password (optional)</label>
            <input type="password" name="password" class="form-input">
            <div class="form-error"></div>
            <small class="form-help">Leave blank to keep current password.</small>
          </div>
        </form>
      `

      const modalFooter = `
        <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
          Cancel
        </button>
        <button type="submit" form="edit-user-form" class="btn btn-primary">
          <i class="fas fa-save"></i>
          Update User
        </button>
      `

      this.ui.showModal("Edit User", modalContent, { footer: modalFooter })
      this.setupUserForm("edit-user-form", "edit")
    } catch (error) {
      console.error("Error loading user for edit:", error)
      this.ui.showToast("Failed to load user details", "error")
    }
  }

  /**
   * Setup User Form (Edit)
   * @param {string} formId - The ID of the form element
   * @param {string} mode - 'edit'
   */
  setupUserForm(formId, mode) {
    const form = document.getElementById(formId)
    if (!form) return

    // Form validation rules for user
    const validationRules = {
      firstName: { required: true, minLength: 2, label: "First Name" },
      lastName: { required: true, minLength: 2, label: "Last Name" },
      username: { required: true, minLength: 3, label: "Username" },
      email: { required: true, email: true, label: "Email" },
      role: { required: true, label: "Role" },
      password: { minLength: 6, label: "New Password" }, // Optional password
    }

    // Setup form validation
    this.ui.setupFormValidation(form, validationRules)

    // Handle form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(form)
      const userData = Object.fromEntries(formData.entries())

      // Remove empty password field if not updated
      if (!userData.password) {
        delete userData.password
      }

      const submitBtn = form.querySelector('button[type="submit"]')
      this.ui.setButtonLoading(submitBtn, true)

      try {
        await this.api.updateUser(userData.id, userData)
        this.ui.showToast("User updated successfully!", "success")
        this.ui.hideModal()
        this.router.refresh() // Refresh the current page (admin users list)
      } catch (error) {
        console.error(`Error updating user:`, error)
        this.ui.showToast(error.message, "error")
      } finally {
        this.ui.setButtonLoading(submitBtn, false)
      }
    })
  }

  /**
   * Confirm Delete User
   * @param {number} userId - The ID of the user to delete
   */
  confirmDeleteUser(userId) {
    this.ui.showConfirmation("Are you sure you want to delete this user? This action cannot be undone.", async () => {
      try {
        await this.api.deleteUser(userId)
        this.ui.showToast("User deleted successfully!", "success")
        this.router.refresh() // Refresh the current page (admin users list)
      } catch (error) {
        console.error("Error deleting user:", error)
        this.ui.showToast("Failed to delete user", "error")
      }
    })
  }

  /**
   * Render User Profile Page
   */
  async renderProfile() {
    const user = this.auth.getCurrentUser()
    if (!user) {
      this.router.navigate("/login")
      return
    }

    const content = `
   <div class="profile-page">
     <div class="page-header">
       <h1 class="page-title">
         <i class="fas fa-user-circle"></i>
         My Profile
       </h1>
     </div>
     <div class="card profile-card">
       <div class="card-body">
         <div class="profile-info-grid">
           <div class="info-item">
             <label class="form-label">First Name:</label>
             <p>${user.firstName}</p>
           </div>
           <div class="info-item">
             <label class="form-label">Last Name:</label>
             <p>${user.lastName}</p>
           </div>
           <div class="info-item">
             <label class="form-label">Username:</label>
             <p>@${user.username}</p>
           </div>
           <div class="info-item">
             <label class="form-label">Email:</label>
             <p>${user.email}</p>
           </div>
           <div class="info-item">
             <label class="form-label">Role:</label>
             <p><span class="role-badge ${user.role}">${user.role}</span></p>
           </div>
           <div class="info-item">
             <label class="form-label">Joined:</label>
             <p>${new Date(user.createdAt).toLocaleDateString()}</p>
           </div>
         </div>
         <div class="profile-actions mt-8">
           <button class="btn btn-primary" onclick="app.showEditProfileModal()">
             <i class="fas fa-edit"></i>
             Edit Profile
           </button>
         </div>
       </div>
     </div>
   </div>
 `
    this.ui.renderContent(content)
    this.updateActiveNavLink("/profile")
  }

  /**
   * Show Edit Profile Modal
   */
  async showEditProfileModal() {
    const user = this.auth.getCurrentUser()
    if (!user) return

    const modalContent = `
   <form id="edit-profile-form" class="event-form">
     <div class="form-row">
       <div class="form-group">
         <label class="form-label">First Name</label>
         <input type="text" name="firstName" class="form-input" value="${user.firstName}" required>
       </div>
       <div class="form-group">
         <label class="form-label">Last Name</label>
         <input type="text" name="lastName" class="form-input" value="${user.lastName}" required>
       </div>
     </div>
     <div class="form-group">
       <label class="form-label">Email</label>
       <input type="email" name="email" class="form-input" value="${user.email}" required>
     </div>
     <div class="form-group">
       <label class="form-label">New Password (optional)</label>
       <input type="password" name="password" class="form-input">
       <small class="form-help">Leave blank to keep current password.</small>
     </div>
   </form>
 `

    const modalFooter = `
   <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
     Cancel
   </button>
   <button type="submit" form="edit-profile-form" class="btn btn-primary">
     <i class="fas fa-save"></i>
     Save Changes
   </button>
 `

    this.ui.showModal("Edit Profile", modalContent, { footer: modalFooter })
    this.setupEditProfileForm()
  }

  /**
   * Setup Edit Profile Form
   */
  setupEditProfileForm() {
    const form = document.getElementById("edit-profile-form")
    if (!form) return

    const validationRules = {
      firstName: { required: true, minLength: 2, label: "First Name" },
      lastName: { required: true, minLength: 2, label: "Last Name" },
      email: { required: true, email: true, label: "Email" },
      password: { minLength: 6, label: "New Password" }, // Optional password
    }

    this.ui.setupFormValidation(form, validationRules)

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const updateData = Object.fromEntries(formData.entries())

      // Remove empty password field if not updated
      if (!updateData.password) {
        delete updateData.password
      }

      const submitBtn = form.querySelector('button[type="submit"]')
      this.ui.setButtonLoading(submitBtn, true)

      try {
        await this.auth.updateProfile(updateData)
        this.ui.showToast("Profile updated successfully!", "success")
        this.ui.hideModal()
        this.router.refresh() // Refresh profile page
      } catch (error) {
        console.error("Error updating profile:", error)
        this.ui.showToast(error.message, "error")
      } finally {
        this.ui.setButtonLoading(submitBtn, false)
      }
    })
  }

  /**
   * Render My Events Page
   */
  async renderMyEvents() {
    const user = this.auth.getCurrentUser()
    if (!user) {
      this.router.navigate("/login")
      return
    }

    try {
      const userRegistrations = await this.api.getUserRegistrations(user.id)
      const eventPromises = userRegistrations.map((reg) => this.api.getEvent(reg.eventId))
      const myEvents = await Promise.all(eventPromises)

      const content = `
     <div class="my-events-page">
       <div class="page-header">
         <h1 class="page-title">
           <i class="fas fa-calendar-check"></i>
           My Events
         </h1>
       </div>

       <div class="events-grid grid grid-cols-3" id="my-events-grid">
         ${
           myEvents.length > 0
             ? myEvents.map((event) => this.createEventCard(event, true)).join("")
             : `
           <div class="empty-state col-span-full">
             <i class="fas fa-ticket-alt"></i>
             <h3>No Events Enrolled</h3>
             <p>You haven't enrolled in any events yet. Explore available events!</p>
             <a href="#/enrollment" class="btn btn-primary mt-4" data-route="/enrollment">
               <i class="fas fa-calendar"></i>
               Explore Events
             </a>
           </div>
         `
         }
       </div>
     </div>
   `
      this.ui.renderContent(content)
      this.updateActiveNavLink("/my-events")
    } catch (error) {
      console.error("Error rendering my events page:", error)
      this.ui.showToast("Failed to load your events", "error")
    }
  }

  /**
   * Render 404 Page
   */
  render404() {
    const content = `
         <div class="error-page">
             <div class="error-content">
                 <h1 class="error-code">404</h1>
                 <h2 class="error-title">Page Not Found</h2>
                 <p class="error-description">
                     The page you're looking for doesn't exist or has been moved.
                 </p>
                 <a href="#/" class="btn btn-primary" data-route="/">
                     <i class="fas fa-home"></i>
                     Go Home
                 </a>
             </div>
         </div>
     `

    this.ui.renderContent(content)
  }

  /**
   * Update active navigation link
   */
  updateActiveNavLink(route) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("data-route") === route) {
        link.classList.add("active")
      }
    })
  }

  /**
   * Get application statistics
   */
  async getStats() {
    try {
      const [events, users, registrations] = await Promise.all([
        this.api.getEvents(),
        this.api.getUsers(),
        this.api.getRegistrations(),
      ])

      return {
        totalEvents: events.length,
        activeEvents: events.filter((e) => e.status === "active").length,
        totalUsers: users.length,
        totalRegistrations: registrations.length,
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalEvents: 0,
        activeEvents: 0,
        totalUsers: 0,
        totalRegistrations: 0,
      }
    }
  }

  /**
   * Register user for an event
   */
  async registerForEvent(eventId) {
    const user = this.auth.getCurrentUser()
    if (!user) {
      this.ui.showToast("Please login to register for events", "error")
      this.router.navigate("/login")
      return
    }

    try {
      // Show confirmation modal
      const event = await this.api.getEvent(eventId)

      this.ui.showConfirmation(
        `Are you sure you want to enroll in "${event.title}"? This will cost $${event.price}.`,
        async () => {
          try {
            await this.api.registerForEvent(user.id, eventId)
            this.ui.showToast("Successfully registered for event!", "success")
            // Refresh the current page to update the UI
            this.router.refresh()
          } catch (error) {
            this.ui.showToast(error.message, "error")
          }
        },
      )
    } catch (error) {
      console.error("Error enrolling in event:", error)
      this.ui.showToast("Failed to enroll in event", "error")
    }
  }

  /**
   * Force navigation update - called when needed to ensure UI consistency
   */
  forceNavigationUpdate() {
    const currentUser = this.auth.getCurrentUser()
    this.updateNavigation(currentUser)
    console.log("🔄 Navigation force updated")
  }

  /**
   * Render Enrollment Page
   */
  async renderEnrollment() {
    try {
      const user = this.auth.getCurrentUser()
      if (!user) {
        this.router.navigate("/login")
        return
      }

      const [events, userRegistrations] = await Promise.all([
        this.api.getEvents(),
        this.api.getUserRegistrations(user.id),
      ])

      // Get registered event IDs for quick lookup
      const registeredEventIds = new Set(userRegistrations.map((reg) => reg.eventId))

      const content = `
  <div class="enrollment-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-ticket-alt"></i>
        Event Enrollment
      </h1>
      <div class="enrollment-stats">
        <div class="stat-item">
          <span class="stat-number">${userRegistrations.length}</span>
          <span class="stat-label">Enrolled Events</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${events.filter((e) => e.status === "active").length}</span>
          <span class="stat-label">Available Events</span>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="enrollment-filters">
      <div class="filter-group">
        <input type="text" id="enrollment-search" class="form-input" placeholder="Search events...">
        <select id="enrollment-category" class="form-select">
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Business">Business</option>
          <option value="Arts">Arts</option>
          <option value="Education">Education</option>
          <option value="Food">Food & Drink</option>
          <option value="Health">Health & Wellness</option>
        </select>
        <select id="enrollment-status" class="form-select">
          <option value="">All Events</option>
          <option value="available">Available</option>
          <option value="enrolled">My Enrollments</option>
          <option value="sold-out">Sold Out</option>
        </select>
      </div>
    </div>

    <!-- Events Grid -->
    <div class="enrollment-grid" id="enrollment-grid">
      ${events.map((event) => this.createEnrollmentCard(event, registeredEventIds.has(event.id))).join("")}
    </div>

    ${
      events.length === 0
        ? `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h3>No Events Available</h3>
        <p>There are no events available for enrollment at the moment.</p>
      </div>
    `
        : ""
    }
  </div>
`

      this.ui.renderContent(content)
      this.setupEnrollmentFilters(events, registeredEventIds)
      this.updateActiveNavLink("/enrollment")
    } catch (error) {
      console.error("Error rendering enrollment page:", error)
      this.ui.showToast("Failed to load enrollment page", "error")
    }
  }

  /**
   * Create enrollment card HTML
   */
  createEnrollmentCard(event, isEnrolled) {
    const isSoldOut = event.registeredCount >= event.capacity
    const isActive = event.status === "active"
    const canEnroll = isActive && !isSoldOut && !isEnrolled

    return `
 <div class="enrollment-card ${isSoldOut ? "sold-out" : ""} ${isEnrolled ? "enrolled" : ""}">
   <div class="enrollment-card-header">
     <div class="event-category-badge">${event.category}</div>
     <div class="event-status-indicator">
       ${
         isSoldOut
           ? '<span class="status-badge sold-out"><i class="fas fa-times-circle"></i> SOLD OUT</span>'
           : isEnrolled
             ? '<span class="status-badge enrolled"><i class="fas fa-check-circle"></i> ENROLLED</span>'
             : '<span class="status-badge available"><i class="fas fa-circle"></i> AVAILABLE</span>'
       }
     </div>
   </div>

   <div class="enrollment-card-content">
     <h3 class="event-title">${event.title}</h3>
     <p class="event-description">${event.description}</p>
     
     <div class="event-details">
       <div class="detail-row">
         <div class="detail-item">
           <i class="fas fa-calendar"></i>
           <span>${new Date(event.date).toLocaleDateString("en-US", {
             weekday: "long",
             year: "numeric",
             month: "long",
             day: "numeric",
           })}</span>
         </div>
         <div class="detail-item">
           <i class="fas fa-clock"></i>
           <span>${event.time}</span>
         </div>
       </div>
       
       <div class="detail-row">
         <div class="detail-item">
           <i class="fas fa-map-marker-alt"></i>
           <span>${event.location}</span>
         </div>
         <div class="detail-item">
           <i class="fas fa-building"></i>
           <span>${event.organizer || "EventHub"}</span>
         </div>
       </div>
     </div>

     <div class="enrollment-info">
       <div class="capacity-bar">
         <div class="capacity-label">
           <span>Capacity</span>
           <span>${event.registeredCount}/${event.capacity}</span>
         </div>
         <div class="capacity-progress">
           <div class="capacity-fill" style="width: ${(event.registeredCount / event.capacity) * 100}%"></div>
         </div>
       </div>
       
       <div class="event-price">
         <span class="price-label">Price</span>
         <span class="price-amount">$${event.price}</span>
       </div>
     </div>
   </div>

   <div class="enrollment-card-footer">
     ${
       canEnroll
         ? `
       <button class="btn btn-primary enrollment-btn" onclick="app.enrollInEvent(${event.id})">
         <i class="fas fa-ticket-alt"></i>
         Enroll Now
       </button>
     `
         : isSoldOut
           ? `
       <button class="btn btn-secondary" disabled>
         <i class="fas fa-times-circle"></i>
         Sold Out
       </button>
     `
           : isEnrolled
             ? `
       <div class="enrolled-actions">
         <button class="btn btn-success" disabled>
           <i class="fas fa-check-circle"></i>
           Enrolled
         </button>
         <button class="btn btn-danger btn-sm" onclick="app.unenrollFromEvent(${event.id})">
           <i class="fas fa-times"></i>
           Cancel
         </button>
       </div>
     `
             : `
       <button class="btn btn-secondary" disabled>
         <i class="fas fa-ban"></i>
         Unavailable
       </button>
     `
     }
     
     <button class="btn btn-secondary btn-sm" onclick="app.showEventDetails(${event.id})">
       <i class="fas fa-info-circle"></i>
       Details
     </button>
   </div>
 </div>
`
  }

  /**
   * Setup enrollment filtering functionality
   */
  setupEnrollmentFilters(events, registeredEventIds) {
    const searchInput = document.getElementById("enrollment-search")
    const categoryFilter = document.getElementById("enrollment-category")
    const statusFilter = document.getElementById("enrollment-status")
    const enrollmentGrid = document.getElementById("enrollment-grid")

    const filterEvents = () => {
      const searchTerm = searchInput.value.toLowerCase()
      const selectedCategory = categoryFilter.value
      const selectedStatus = statusFilter.value

      const filteredEvents = events.filter((event) => {
        const isEnrolled = registeredEventIds.has(event.id)
        const isSoldOut = event.registeredCount >= event.capacity

        // Text search
        const matchesSearch =
          !searchTerm ||
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)

        // Category filter
        const matchesCategory = !selectedCategory || event.category === selectedCategory

        // Status filter
        let matchesStatus = true
        if (selectedStatus === "available") {
          matchesStatus = !isEnrolled && !isSoldOut && event.status === "active"
        } else if (selectedStatus === "enrolled") {
          matchesStatus = isEnrolled
        } else if (selectedStatus === "sold-out") {
          matchesStatus = isSoldOut
        }

        return matchesSearch && matchesCategory && matchesStatus
      })

      enrollmentGrid.innerHTML = filteredEvents
        .map((event) => this.createEnrollmentCard(event, registeredEventIds.has(event.id)))
        .join("")
    }

    searchInput?.addEventListener("input", filterEvents)
    categoryFilter?.addEventListener("change", filterEvents)
    statusFilter?.addEventListener("change", filterEvents)
  }

  /**
   * Enroll user in an event
   */
  async enrollInEvent(eventId) {
    const user = this.auth.getCurrentUser()
    if (!user) {
      this.ui.showToast("Please login to enroll in events", "error")
      this.router.navigate("/login")
      return
    }

    try {
      // Show confirmation modal
      const event = await this.api.getEvent(eventId)

      this.ui.showConfirmation(
        `Are you sure you want to enroll in "${event.title}"? This will cost $${event.price}.`,
        async () => {
          try {
            await this.api.registerForEvent(user.id, eventId)
            this.ui.showToast("Successfully enrolled in event!", "success")
            // Refresh the enrollment page
            this.router.refresh()
          } catch (error) {
            this.ui.showToast(error.message, "error")
          }
        },
      )
    } catch (error) {
      console.error("Error enrolling in event:", error)
      this.ui.showToast("Failed to enroll in event", "error")
    }
  }

  /**
   * Unenroll user from an event
   */
  async unenrollFromEvent(eventId) {
    const user = this.auth.getCurrentUser()
    if (!user) return

    try {
      const event = await this.api.getEvent(eventId)

      this.ui.showConfirmation(`Are you sure you want to cancel your enrollment in "${event.title}"?`, async () => {
        try {
          await this.api.cancelRegistration(user.id, eventId)
          this.ui.showToast("Successfully cancelled enrollment!", "success")
          // Refresh the enrollment page
          this.router.refresh()
        } catch (error) {
          this.ui.showToast(error.message, "error")
        }
      })
    } catch (error) {
      console.error("Error cancelling enrollment:", error)
      this.ui.showToast("Failed to cancel enrollment", "error")
    }
  }

  /**
   * Show event details modal
   */
  async showEventDetails(eventId) {
    try {
      const event = await this.api.getEvent(eventId)
      const user = this.auth.getCurrentUser()
      const userRegistrations = user ? await this.api.getUserRegistrations(user.id) : []
      const isEnrolled = userRegistrations.some((reg) => reg.eventId === eventId)
      const isSoldOut = event.registeredCount >= event.capacity

      const modalContent = `
   <div class="event-details-modal">
     <div class="event-header-info">
       <div class="event-category-large">${event.category}</div>
       <h2 class="event-title-large">${event.title}</h2>
       <p class="event-description-full">${event.description}</p>
     </div>

     <div class="event-info-grid">
       <div class="info-section">
         <h4><i class="fas fa-calendar"></i> Date & Time</h4>
         <p>${new Date(event.date).toLocaleDateString("en-US", {
           weekday: "long",
           year: "numeric",
           month: "long",
           day: "numeric",
         })} at ${event.time}</p>
       </div>

       <div class="info-section">
         <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
         <p>${event.location}</p>
       </div>

       <div class="info-section">
         <h4><i class="fas fa-building"></i> Organizer</h4>
         <p>${event.organizer || "EventHub"}</p>
       </div>

       <div class="info-section">
         <h4><i class="fas fa-users"></i> Capacity</h4>
         <p>${event.registeredCount} / ${event.capacity} registered</p>
         <div class="capacity-progress">
           <div class="capacity-fill" style="width: ${(event.registeredCount / event.capacity) * 100}%"></div>
         </div>
       </div>

       <div class="info-section">
         <h4><i class="fas fa-dollar-sign"></i> Price</h4>
         <p class="price-large">$${event.price}</p>
       </div>

       <div class="info-section">
         <h4><i class="fas fa-info-circle"></i> Status</h4>
         <p>
           ${
             isSoldOut
               ? '<span class="status-badge sold-out">Sold Out</span>'
               : isEnrolled
                 ? '<span class="status-badge enrolled">You are enrolled</span>'
                 : '<span class="status-badge available">Available</span>'
           }
         </p>
       </div>
     </div>
   </div>
 `

      const modalFooter = user
        ? `
   <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
     Close
   </button>
   ${
     !isEnrolled && !isSoldOut && event.status === "active"
       ? `
     <button type="button" class="btn btn-primary" onclick="app.ui.hideModal(); app.enrollInEvent(${event.id})">
       <i class="fas fa-ticket-alt"></i>
       Enroll Now
     </button>
   `
       : ""
   }
 `
        : `
   <button type="button" class="btn btn-secondary" onclick="app.ui.hideModal()">
     Close
   </button>
   <a href="#/login" class="btn btn-primary" data-route="/login" onclick="app.ui.hideModal()">
     Login to Enroll
   </a>
 `

      this.ui.showModal("Event Details", modalContent, { footer: modalFooter })
    } catch (error) {
      console.error("Error showing event details:", error)
      this.ui.showToast("Failed to load event details", "error")
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new EventManagementApp()
})

// Export for module usage
export { EventManagementApp }
