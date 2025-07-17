/**
 * Advanced API Service
 * Handles all API communications with comprehensive error handling and data validation
 */
export class ApiService {
  constructor() {
    this.baseUrl = "http://localhost:3001"
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  /**
   * Generic API request method with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Handle different response types
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error)
      throw new Error(`Failed to ${options.method || "GET"} ${endpoint}: ${error.message}`)
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" })
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  // Event-related API methods

  /**
   * Get all events with optional filtering
   * @param {object} filters - Optional filters
   */
  async getEvents(filters = {}) {
    let endpoint = "/events"
    const params = new URLSearchParams()

    // Add filters as query parameters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.get(endpoint)
  }

  /**
   * Get single event by ID
   * @param {number} id - Event ID
   */
  async getEvent(id) {
    return this.get(`/events/${id}`)
  }

  /**
   * Create new event
   * @param {object} eventData - Event data
   */
  async createEvent(eventData) {
    // Validate required fields
    const requiredFields = ["title", "description", "date", "time", "location", "capacity"]
    for (const field of requiredFields) {
      if (!eventData[field]) {
        throw new Error(`${field} is required`)
      }
    }

    // Set default values
    const event = {
      ...eventData,
      id: Date.now(),
      registeredCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      imageUrl: eventData.imageUrl || "/placeholder.svg?height=300&width=400",
    }

    return this.post("/events", event)
  }

  /**
   * Update event
   * @param {number} id - Event ID
   * @param {object} updateData - Data to update
   */
  async updateEvent(id, updateData) {
    return this.patch(`/events/${id}`, updateData)
  }

  /**
   * Delete event
   * @param {number} id - Event ID
   */
  async deleteEvent(id) {
    return this.delete(`/events/${id}`)
  }

  // User-related API methods

  /**
   * Get all users
   */
  async getUsers() {
    return this.get("/users")
  }

  /**
   * Get single user by ID
   * @param {number} id - User ID
   */
  async getUser(id) {
    return this.get(`/users/${id}`)
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {object} updateData - Data to update
   */
  async updateUser(id, updateData) {
    return this.patch(`/users/${id}`, updateData)
  }

  /**
   * Delete user
   * @param {number} id - User ID
   */
  async deleteUser(id) {
    return this.delete(`/users/${id}`)
  }

  // Registration-related API methods

  /**
   * Get all registrations
   */
  async getRegistrations() {
    return this.get("/registrations")
  }

  /**
   * Get registrations for a specific user
   * @param {number} userId - User ID
   */
  async getUserRegistrations(userId) {
    return this.get(`/registrations?userId=${userId}`)
  }

  /**
   * Get registrations for a specific event
   * @param {number} eventId - Event ID
   */
  async getEventRegistrations(eventId) {
    return this.get(`/registrations?eventId=${eventId}`)
  }

  /**
   * Register user for event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   */
  async registerForEvent(userId, eventId) {
    // Check if user is already registered
    const existingRegistrations = await this.get(`/registrations?userId=${userId}&eventId=${eventId}`)
    if (existingRegistrations.length > 0) {
      throw new Error("User is already registered for this event")
    }

    // Check event capacity
    const event = await this.getEvent(eventId)
    if (event.registeredCount >= event.capacity) {
      throw new Error("Event is full")
    }

    // Create registration
    const registration = {
      id: Date.now(),
      userId,
      eventId,
      registeredAt: new Date().toISOString(),
      status: "confirmed",
    }

    const newRegistration = await this.post("/registrations", registration)

    // Update event registered count
    await this.updateEvent(eventId, {
      registeredCount: event.registeredCount + 1,
    })

    return newRegistration
  }

  /**
   * Cancel event registration
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   */
  async cancelRegistration(userId, eventId) {
    // Find the registration
    const registrations = await this.get(`/registrations?userId=${userId}&eventId=${eventId}`)
    if (registrations.length === 0) {
      throw new Error("Registration not found")
    }

    const registration = registrations[0]

    // Delete registration
    await this.delete(`/registrations/${registration.id}`)

    // Update event registered count
    const event = await this.getEvent(eventId)
    await this.updateEvent(eventId, {
      registeredCount: Math.max(0, event.registeredCount - 1),
    })

    return { success: true }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [events, users, registrations] = await Promise.all([
        this.getEvents(),
        this.getUsers(),
        this.getRegistrations(),
      ])

      const activeEvents = events.filter((e) => e.status === "active")
      const upcomingEvents = events.filter((e) => new Date(e.date) > new Date())
      const totalRevenue = events.reduce((sum, event) => sum + event.price * event.registeredCount, 0)

      return {
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        upcomingEvents: upcomingEvents.length,
        totalUsers: users.length,
        totalRegistrations: registrations.length,
        totalRevenue,
        recentRegistrations: registrations
          .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
          .slice(0, 5),
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      throw error
    }
  }

  /**
   * Search events
   * @param {string} query - Search query
   * @param {object} filters - Additional filters
   */
  async searchEvents(query, filters = {}) {
    const events = await this.getEvents()

    return events.filter((event) => {
      // Text search
      const matchesQuery =
        !query ||
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase())

      // Category filter
      const matchesCategory = !filters.category || event.category === filters.category

      // Date range filter
      const matchesDateRange =
        !filters.dateFrom ||
        !filters.dateTo ||
        (new Date(event.date) >= new Date(filters.dateFrom) && new Date(event.date) <= new Date(filters.dateTo))

      // Price range filter
      const matchesPriceRange =
        (!filters.minPrice || event.price >= filters.minPrice) && (!filters.maxPrice || event.price <= filters.maxPrice)

      return matchesQuery && matchesCategory && matchesDateRange && matchesPriceRange
    })
  }
}
