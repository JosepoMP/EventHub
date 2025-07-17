/**
 * Advanced SPA Router with Protected Routes and Role-based Access
 * Handles client-side routing with authentication and authorization
 */
export class Router {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.authManager = null

    // Bind methods to maintain context
    this.handlePopState = this.handlePopState.bind(this)
    this.handleLinkClick = this.handleLinkClick.bind(this)
  }

  /**
   * Add a route to the router
   * @param {string} path - Route path (supports parameters like :id)
   * @param {function} handler - Route handler function
   * @param {boolean} requiresAuth - Whether route requires authentication
   * @param {string} requiredRole - Required user role for access
   */
  addRoute(path, handler, requiresAuth = false, requiredRole = null) {
    // Convert path with parameters to regex pattern
    const paramNames = []
    const regexPath = path
      .replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1)) // Remove the ':'
        return "([^/]+)"
      })
      .replace(/\*/g, ".*") // Handle wildcard routes

    this.routes.set(path, {
      pattern: new RegExp(`^${regexPath}$`),
      handler,
      paramNames,
      requiresAuth,
      requiredRole,
      originalPath: path,
    })
  }

  /**
   * Start the router
   * Sets up event listeners and handles initial route
   */
  start() {
    // Listen for browser back/forward navigation
    window.addEventListener("popstate", this.handlePopState)

    // Listen for link clicks to handle SPA navigation
    document.addEventListener("click", this.handleLinkClick)

    // Handle initial route
    this.handleRoute()
  }

  /**
   * Navigate to a specific route
   * @param {string} path - Path to navigate to
   * @param {boolean} replace - Whether to replace current history entry
   */
  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, "", `#${path}`)
    } else {
      history.pushState(null, "", `#${path}`)
    }
    this.handleRoute()
  }

  /**
   * Refresh the current route
   */
  refresh() {
    this.handleRoute()
  }

  /**
   * Handle browser navigation events
   */
  handlePopState() {
    this.handleRoute()
  }

  /**
   * Handle link clicks for SPA navigation
   */
  handleLinkClick(event) {
    const link = event.target.closest("[data-route]")
    if (!link) return

    event.preventDefault()
    const route = link.getAttribute("data-route")
    this.navigate(route)
  }

  /**
   * Handle the current route
   */
  async handleRoute() {
    const path = this.getCurrentPath()
    const route = this.findMatchingRoute(path)

    if (!route) {
      // Handle 404 - route not found
      const notFoundRoute = this.routes.get("*")
      if (notFoundRoute) {
        await notFoundRoute.handler()
      }
      return
    }

    // Check authentication requirements
    if (route.requiresAuth && !this.isAuthenticated()) {
      this.navigate("/login")
      return
    }

    // Check role requirements
    if (route.requiredRole && !this.hasRequiredRole(route.requiredRole)) {
      this.showAccessDenied()
      return
    }

    // Extract parameters from the path
    const params = this.extractParams(path, route)

    // Store current route
    this.currentRoute = { path, route, params }

    // Ensure navigation is always updated regardless of route
    const app = window.app
    if (app && app.auth) {
      app.updateNavigation(app.auth.getCurrentUser())
    }

    try {
      // Execute route handler
      await route.handler(params)
    } catch (error) {
      console.error("Route handler error:", error)
      this.handleRouteError(error)
    }
  }

  /**
   * Get the current path from URL hash
   */
  getCurrentPath() {
    const hash = window.location.hash
    return hash ? hash.slice(1) : "/" // Remove the '#'
  }

  /**
   * Find matching route for the given path
   */
  findMatchingRoute(path) {
    for (const [routePath, route] of this.routes) {
      if (routePath === "*") continue // Skip wildcard for now

      const match = path.match(route.pattern)
      if (match) {
        return route
      }
    }
    return null
  }

  /**
   * Extract parameters from the matched route
   */
  extractParams(path, route) {
    const match = path.match(route.pattern)
    const params = {}

    if (match && route.paramNames.length > 0) {
      route.paramNames.forEach((paramName, index) => {
        params[paramName] = match[index + 1]
      })
    }

    return params
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    // Get auth manager from global app instance
    const app = window.app
    return app && app.auth && app.auth.getCurrentUser() !== null
  }

  /**
   * Check if user has required role
   */
  hasRequiredRole(requiredRole) {
    const app = window.app
    if (!app || !app.auth) return false

    const user = app.auth.getCurrentUser()
    return user && user.role === requiredRole
  }

  /**
   * Show access denied message
   */
  showAccessDenied() {
    const content = `
            <div class="error-page">
                <div class="error-content">
                    <h1 class="error-code">403</h1>
                    <h2 class="error-title">Access Denied</h2>
                    <p class="error-description">
                        You don't have permission to access this page.
                    </p>
                    <a href="#/" class="btn btn-primary" data-route="/">
                        <i class="fas fa-home"></i>
                        Go Home
                    </a>
                </div>
            </div>
        `

    const app = window.app
    if (app && app.ui) {
      app.ui.renderContent(content)
    }
  }

  /**
   * Handle route errors
   */
  handleRouteError(error) {
    console.error("Route error:", error)

    const content = `
            <div class="error-page">
                <div class="error-content">
                    <h1 class="error-code">500</h1>
                    <h2 class="error-title">Something went wrong</h2>
                    <p class="error-description">
                        An error occurred while loading this page.
                    </p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-refresh"></i>
                        Reload Page
                    </button>
                </div>
            </div>
        `

    const app = window.app
    if (app && app.ui) {
      app.ui.renderContent(content)
      app.ui.showToast("An error occurred while loading the page", "error")
    }
  }

  /**
   * Get current route information
   */
  getCurrentRoute() {
    return this.currentRoute
  }

  /**
   * Check if a specific route is currently active
   */
  isRouteActive(path) {
    return this.getCurrentPath() === path
  }
}
