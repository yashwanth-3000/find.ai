/**
 * OpenAI response formatter
 * 
 * This module previously contained Together AI formatting code.
 * Now it provides placeholder functions for OpenAI integration.
 */

/**
 * Placeholder function - no longer used
 * 
 * @param {Object} response - The API response
 * @returns {Object} The unmodified response
 */
export function formatTogetherResponse(response) {
  // Simply return the original response
  return response;
}

/**
 * Creates a basic pass-through middleware
 * 
 * @returns {Function} Middleware function
 */
export function createTogetherMiddleware() {
  return async (req, { fetch }) => {
    // Simple pass-through middleware
    return await fetch(req);
  };
}

// Export a placeholder middleware instance
export const togetherMiddleware = createTogetherMiddleware(); 