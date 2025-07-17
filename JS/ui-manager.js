/**
 * Advanced UI Manager
 * Handles all UI interactions, animations, and dynamic content rendering
 */
export class UIManager {
  constructor() {
    this.contentContainer = null
    this.loadingSpinner = null
    this.modalOverlay = null
    this.toastContainer = null

    this.init()
  }

  /**
   * Initialize UI Manager
   * Cache DOM elements and setup event listeners
   */
  init() {
    this.contentContainer = document.getElementById("content")
    this.loadingSpinner = document.getElementById("loading-spinner")
    this.modalOverlay = document.getElementById("modal-overlay")
    this.toastContainer = document.getElementById("toast-container")

    this.setupModalEvents()
  }

  /**
   * Render content to the main container
   * @param {string} html - HTML content to render
   */
  renderContent(html) {
    if (this.contentContainer) {
      this.contentContainer.innerHTML = html
      this.scrollToTop()
    }
  }

  /**
   * Show loading spinner
   */
  showLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = "flex"
    }
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = "none"
    }
  }

  /**
   * Show modal with content
   * @param {string} title - Modal title
   * @param {string} content - Modal content HTML
   * @param {object} options - Modal options
   */
  showModal(title, content, options = {}) {
    if (!this.modalOverlay) return

    const modalContainer = this.modalOverlay.querySelector("#modal-container")

    modalContainer.innerHTML = `
          <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              <button class="modal-close" id="modal-close">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          <div class="modal-body">
              ${content}
          </div>
          ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ""}
      `

    this.modalOverlay.classList.add("active")
    document.body.style.overflow = "hidden"

    // Setup close functionality
    const closeBtn = document.getElementById("modal-close")
    closeBtn?.addEventListener("click", () => this.hideModal())
  }

  /**
   * Hide modal
   */
  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  /**
   * Setup modal event listeners
   */
  setupModalEvents() {
    if (!this.modalOverlay) return

    // Close modal when clicking overlay
    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) {
        this.hideModal()
      }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalOverlay.classList.contains("active")) {
        this.hideModal()
      }
    })
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = "info", duration = 5000) {
    if (!this.toastContainer) return

    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icon = this.getToastIcon(type)
    toast.innerHTML = `
          <i class="${icon}"></i>
          <span>${message}</span>
          <button class="toast-close" onclick="this.parentElement.remove()">
              <i class="fas fa-times"></i>
          </button>
      `

    this.toastContainer.appendChild(toast)

    // Auto remove toast after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = "slideOut 0.3s ease-in forwards"
        setTimeout(() => toast.remove(), 300)
      }
    }, duration)
  }

  /**
   * Get appropriate icon for toast type
   */
  getToastIcon(type) {
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }
    return icons[type] || icons.info
  }

  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @param {function} onConfirm - Callback for confirmation
   * @param {function} onCancel - Callback for cancellation
   */
  showConfirmation(message, onConfirm, onCancel = null) {
    const content = `
          <div class="confirmation-dialog">
              <p>${message}</p>
          </div>
      `

    const footer = `
          <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
          <button class="btn btn-danger" id="confirm-btn">Confirm</button>
      `

    this.showModal("Confirm Action", content, { footer })

    // Setup button events
    document.getElementById("confirm-btn")?.addEventListener("click", () => {
      this.hideModal()
      if (onConfirm) onConfirm()
    })

    document.getElementById("cancel-btn")?.addEventListener("click", () => {
      this.hideModal()
      if (onCancel) onCancel()
    })
  }

  /**
   * Scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /**
   * Create form validation UI
   * @param {HTMLFormElement} form - Form element
   * @param {object} rules - Validation rules
   */
  setupFormValidation(form, rules) {
    if (!form) return

    const validateField = (field, rule) => {
      const value = field.value.trim()
      const errorElement = field.parentElement.querySelector(".form-error")

      let isValid = true
      let errorMessage = ""

      // Required validation
      if (rule.required && !value) {
        isValid = false
        errorMessage = `${rule.label || field.name} is required`
      }
      // Email validation
      else if (rule.email && value && !this.isValidEmail(value)) {
        isValid = false
        errorMessage = "Please enter a valid email address"
      }
      // Min length validation
      else if (rule.minLength && value.length < rule.minLength) {
        isValid = false
        errorMessage = `${rule.label || field.name} must be at least ${rule.minLength} characters`
      }
      // Custom validation
      else if (rule.custom && !rule.custom(value)) {
        isValid = false
        errorMessage = rule.customMessage || "Invalid value"
      }

      // Update UI
      if (errorElement) {
        errorElement.textContent = errorMessage
      }

      field.classList.toggle("error", !isValid)
      return isValid
    }

    // Add real-time validation
    Object.keys(rules).forEach((fieldName) => {
      const field = form.querySelector(`[name="${fieldName}"]`)
      if (field) {
        field.addEventListener("blur", () => validateField(field, rules[fieldName]))
        field.addEventListener("input", () => {
          // Clear error on input
          field.classList.remove("error")
          const errorElement = field.parentElement.querySelector(".form-error")
          if (errorElement) errorElement.textContent = ""
        })
      }
    })

    // Validate on submit
    form.addEventListener("submit", (e) => {
      let isFormValid = true

      Object.keys(rules).forEach((fieldName) => {
        const field = form.querySelector(`[name="${fieldName}"]`)
        if (field && !validateField(field, rules[fieldName])) {
          isFormValid = false
        }
      })

      if (!isFormValid) {
        e.preventDefault()
        this.showToast("Please fix the errors in the form", "error")
      }
    })
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Create loading button state
   * @param {HTMLButtonElement} button - Button element
   * @param {boolean} loading - Loading state
   */
  setButtonLoading(button, loading) {
    if (!button) return

    if (loading) {
      button.disabled = true
      button.dataset.originalText = button.innerHTML
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
    } else {
      button.disabled = false
      button.innerHTML = button.dataset.originalText || button.innerHTML
    }
  }

  /**
   * Animate element entrance
   * @param {HTMLElement} element - Element to animate
   * @param {string} animation - Animation type
   */
  animateIn(element, animation = "fadeIn") {
    if (!element) return

    element.style.opacity = "0"
    element.style.transform = "translateY(20px)"

    requestAnimationFrame(() => {
      element.style.transition = "all 0.3s ease-out"
      element.style.opacity = "1"
      element.style.transform = "translateY(0)"
    })
  }

  /**
   * Create empty state UI
   * @param {string} icon - Icon class
   * @param {string} title - Empty state title
   * @param {string} description - Empty state description
   * @param {string} actionHtml - Optional action HTML
   */
  createEmptyState(icon, title, description, actionHtml = "") {
    return `
          <div class="empty-state">
              <div class="empty-state-icon">
                  <i class="${icon}"></i>
              </div>
              <h3 class="empty-state-title">${title}</h3>
              <p class="empty-state-description">${description}</p>
              ${actionHtml ? `<div class="empty-state-actions">${actionHtml}</div>` : ""}
          </div>
      `
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {object} options - Formatting options
   */
  formatDate(date, options = {}) {
    const dateObj = new Date(date)
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }

    return dateObj.toLocaleDateString("en-US", defaultOptions)
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   */
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  /**
   * Debounce function for search inputs
   * @param {function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Add CSS for additional UI components
const additionalStyles = `
  .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: var(--spacing-8);
  }

  .auth-card {
      width: 100%;
      max-width: 400px;
  }

  .admin-badge {
      background: var(--warning-color);
      color: var(--white);
      font-size: var(--font-size-xs);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-sm);
      margin-left: var(--spacing-2);
  }

  .nav-user {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
  }

  .nav-username {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-weight: 600;
      color: var(--gray-700);
  }

  .section-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: var(--spacing-6);
      text-align: center;
  }

  .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-8);
      flex-wrap: wrap;
      gap: var(--spacing-4);
  }

  .page-title {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--gray-800);
  }

  .search-filters {
      display: flex;
      gap: var(--spacing-3);
      align-items: center;
  }

  .empty-state {
      text-align: center;
      padding: var(--spacing-16);
      color: var(--gray-500);
  }

  .empty-state-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-4);
      opacity: 0.5;
  }

  .empty-state-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      margin-bottom: var(--spacing-2);
      color: var(--gray-700);
  }

  .empty-state-description {
      margin-bottom: var(--spacing-6);
  }

  .error-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      text-align: center;
  }

  .error-code {
      font-size: 6rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: var(--spacing-4);
  }

  .error-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: var(--spacing-4);
  }

  .error-description {
      color: var(--gray-600);
      margin-bottom: var(--spacing-8);
      max-width: 500px;
  }

  .toast-close {
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: var(--spacing-1);
      margin-left: auto;
  }

  .toast-close:hover {
      color: var(--gray-600);
  }

  @keyframes slideOut {
      from {
          transform: translateX(0);
          opacity: 1;
      }
      to {
          transform: translateX(100%);
          opacity: 0;
      }
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .confirmation-dialog {
      text-align: center;
      padding: var(--spacing-4);
  }

  .confirmation-dialog p {
      font-size: var(--font-size-lg);
      color: var(--gray-700);
      margin-bottom: var(--spacing-6);
  }

  /* New styles for Event Detail Page */
  .event-detail-page {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-8) 0;
  }

  .event-detail-card {
    border: none; /* Remove default card border */
    box-shadow: var(--shadow-lg);
  }

  .event-detail-card .card-header {
    background: var(--gray-50);
    padding: var(--spacing-8);
    border-bottom: 1px solid var(--gray-200);
  }

  .event-detail-card .card-body {
    padding: var(--spacing-8);
  }

  .event-detail-card .card-footer {
    padding: var(--spacing-8);
    background: var(--gray-50);
  }

  /* Profile Page Styles */
  .profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-8) 0;
  }

  .profile-card {
    border: none;
    box-shadow: var(--shadow-lg);
  }

  .profile-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-6);
  }

  .profile-info-grid .info-item {
    background: var(--gray-50);
    padding: var(--spacing-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
  }

  .profile-info-grid .info-item label {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin-bottom: var(--spacing-1);
  }

  .profile-info-grid .info-item p {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--gray-800);
  }

  .profile-actions {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-8);
  }

  /* My Events Page Styles */
  .my-events-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-8) 0;
  }

  @media (max-width: 768px) {
      .page-header {
          flex-direction: column;
          align-items: stretch;
      }

      .search-filters {
          flex-direction: column;
      }

      .auth-container {
          padding: var(--spacing-4);
      }

      .error-code {
          font-size: 4rem;
      }

      .event-detail-page, .profile-page, .my-events-page {
        padding: var(--spacing-4) 0;
      }
  }
`

// Inject additional styles
const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
