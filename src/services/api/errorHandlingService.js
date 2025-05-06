/**
 * Error handling service for consistent API error management
 * Provides utilities for handling different types of API errors
 */

/**
 * Categorizes API errors based on type and response
 * @param {Error} error - The error object from API call
 * @returns {Object} Categorized error with type and message
 */
export const categorizeError = (error) => {
  // Check if it's an Axios error with a response
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle different HTTP status codes
    switch (status) {
      case 400:
        return {
          type: 'BAD_REQUEST',
          message: 'Invalid request. Please check your inputs.',
          details: data?.message || 'Bad request error'
        };
      case 401:
        return {
          type: 'UNAUTHORIZED',
          message: 'Authentication required. Please try again later.',
          details: data?.message || 'Unauthorized error'
        };
      case 403:
        return {
          type: 'FORBIDDEN',
          message: 'You don\'t have permission to access this resource.',
          details: data?.message || 'Forbidden error'
        };
      case 404:
        return {
          type: 'NOT_FOUND',
          message: 'The requested resource was not found.',
          details: data?.message || 'Resource not found'
        };
      case 429:
        return {
          type: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: data?.message || 'Rate limit exceeded'
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'SERVER_ERROR',
          message: 'Server error. Please try again later.',
          details: data?.message || `Server error (${status})`
        };
      default:
        return {
          type: 'API_ERROR',
          message: `API error with status code: ${status}`,
          details: data?.message || 'Unknown API error'
        };
    }
  }
  
  // Network errors (no response received)
  if (error.request) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: error.message || 'Network error'
    };
  }
  
  // CORS errors often manifest as network errors with specific messages
  if (error.message && error.message.includes('CORS')) {
    return {
      type: 'CORS_ERROR',
      message: 'Cross-Origin Request Blocked. You may need to enable CORS in your browser.',
      details: 'This application requires the Allow CORS extension to be installed and enabled.',
      resolution: 'Please install the Allow CORS extension from Chrome Web Store: https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf'
    };
  }
  
  // General errors
  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    details: error.message || 'Unknown error'
  };
};

/**
 * Log errors to console (in production, this would send to a monitoring service)
 * @param {Object} error - The error object
 */
export const logError = (error) => {
  // In production, this would send the error to a monitoring service
  console.error('API Error:', {
    message: error.message,
    type: error.type || 'UNCATEGORIZED',
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get a user-friendly error message based on the error type
 * @param {Object} error - The categorized error object
 * @returns {String} User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  if (!error) {
    return 'An unknown error occurred. Please try again later.';
  }
  
  // Return the message from the categorized error
  return error.message || 'An unexpected error occurred. Please try again later.';
};

export default {
  categorizeError,
  logError,
  getUserFriendlyMessage,
};