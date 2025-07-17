/**
 * Advanced Authentication Manager
 * Handles user authentication, session management, and role-based access
 */
export class AuthManager {
  constructor() {
    this.currentUser = null
    this.authCallbacks = []
    this.sessionKey = "eventhub_session"
    this.apiBaseUrl = "http://localhost:3001"
  }

  /**
   * Initialize authentication manager
   * Restore session from localStorage if available
   */
  async init() {
    try {
      // Attempt to restore session from localStorage
      const savedSession = localStorage.getItem(this.sessionKey)
      if (savedSession) {
        const sessionData = JSON.parse(savedSession)

        // Validate session (check if user still exists and session is valid)
        if (await this.validateSession(sessionData)) {
          this.currentUser = sessionData.user
          console.log("✅ Session restored for user:", this.currentUser.username)
        } else {
          // Invalid session, clear it
          console.log("❌ Invalid session, clearing...")
          this.clearSession()
          this.currentUser = null
        }
      } else {
        this.currentUser = null
      }

      // Always notify auth state change, even if null
      this.notifyAuthStateChange(this.currentUser)
    } catch (error) {
      console.error("Error initializing auth manager:", error)
      this.clearSession()
      this.currentUser = null
      // Still notify even on error
      this.notifyAuthStateChange(null)
    }
  }

  /**
   * User login with advanced validation
   * @param {string} identifier - Username or email
   * @param {string} password - User password
   */
  async login(identifier, password) {
    // Input validation
    if (!identifier || !password) {
      throw new Error("Username/email and password are required")
    }

    try {
      // Fetch users from API
      const response = await fetch(`${this.apiBaseUrl}/users`)
      if (!response.ok) {
        throw new Error("Failed to connect to authentication server")
      }

      const users = await response.json()

      // Find user by username or email
      const user = users.find((u) => (u.username === identifier || u.email === identifier) && u.password === password)

      if (!user) {
        throw new Error("Invalid username/email or password")
      }

      // Create session
      const sessionData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      // Save session
      this.saveSession(sessionData)
      this.currentUser = sessionData.user

      // Notify auth state change
      this.notifyAuthStateChange(this.currentUser)

      return this.currentUser
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  /**
   * User registration with comprehensive validation
   * @param {object} userData - User registration data
   */
  async register(userData) {
    // Validate required fields
    const requiredFields = ["firstName", "lastName", "username", "email", "password"]
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`)
      }
    }

    // Validate email format
    if (!this.isValidEmail(userData.email)) {
      throw new Error("Please enter a valid email address")
    }

    // Validate password strength
    if (!this.isValidPassword(userData.password)) {
      throw new Error("Password must be at least 6 characters long")
    }

    try {
      // Check if username or email already exists
      const existingUsers = await fetch(`${this.apiBaseUrl}/users`).then((r) => r.json())

      const usernameExists = existingUsers.some((u) => u.username === userData.username)
      const emailExists = existingUsers.some((u) => u.email === userData.email)

      if (usernameExists) {
        throw new Error("Username already exists")
      }

      if (emailExists) {
        throw new Error("Email already exists")
      }

      // Create new user object
      const newUser = {
        id: Date.now(), // Simple ID generation
        username: userData.username,
        email: userData.email,
        password: userData.password, // IMPORTANT: In a production environment, passwords MUST be hashed (e.g., using bcrypt) before storing.
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "user", // Default role
        createdAt: new Date().toISOString(),
      }

      // Save user to database
      const response = await fetch(`${this.apiBaseUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        throw new Error("Failed to create user account")
      }

      const createdUser = await response.json()

      // Automatically log in the user after registration
      await this.login(userData.username, userData.password)

      return createdUser
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  /**
   * User logout
   * Clears session and notifies state change
   */
  async logout() {
    try {
      this.clearSession()
      this.currentUser = null
      this.notifyAuthStateChange(null)

      // Clear any cached data
      sessionStorage.clear()

      return true
    } catch (error) {
      console.error("Logout error:", error)
      throw new Error("Failed to logout")
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole("admin")
  }

  /**
   * Validate session data
   * @param {object} sessionData - Session data to validate
   */
  async validateSession(sessionData) {
    try {
      // Check if session has expired
      if (new Date() > new Date(sessionData.expiresAt)) {
        console.log("Session expired")
        return false
      }

      // Verify user still exists in database
      const response = await fetch(`${this.apiBaseUrl}/users/${sessionData.user.id}`)
      if (response.ok) {
        return true
      } else {
        console.log("User no longer exists in database")
        return false
      }
    } catch (error) {
      console.error("Session validation error:", error)
      // On network error, assume session is still valid to avoid logging out users unnecessarily
      // In a real application, you might want more robust error handling or re-authentication
      return true
    }
  }

  /**
   * Save session to localStorage
   * @param {object} sessionData - Session data to save
   */
  saveSession(sessionData) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey)
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  /**
   * Add callback for authentication state changes
   * @param {function} callback - Callback function
   */
  onAuthStateChange(callback) {
    this.authCallbacks.push(callback)
  }

  /**
   * Notify all callbacks of authentication state change
   * @param {object} user - Current user or null
   */
  notifyAuthStateChange(user) {
    this.authCallbacks.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error("Auth callback error:", error)
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
   * Validate password strength
   * @param {string} password - Password to validate
   */
  isValidPassword(password) {
    return password && password.length >= 6
  }

  /**
   * Update user profile
   * @param {object} updateData - Data to update
   */
  async updateProfile(updateData) {
    if (!this.currentUser) {
      throw new Error("User not authenticated")
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/users/${this.currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()

      // Update current user and session
      this.currentUser = { ...this.currentUser, ...updatedUser }
      const sessionData = JSON.parse(localStorage.getItem(this.sessionKey))
      sessionData.user = this.currentUser
      this.saveSession(sessionData)

      this.notifyAuthStateChange(this.currentUser)

      return updatedUser
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    }
  }
}
