// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// API endpoints
export const API_ENDPOINTS = {
  CHASSIS: '/chassis',
  BODIES: '/bodies',
  SESSIONS: '/configurations/sessions',
  SESSION_SELECTIONS: (sessionId) => `/configurations/sessions/${sessionId}/selections`,
  PRICING: (sessionId) => `/pricing/sessions/${sessionId}`,
  QUOTES: '/quotes',
  QUOTE_PDF: (quoteId) => `/quotes/${quoteId}/pdf`
}
