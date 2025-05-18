/**
 * Message format middleware for API integration
 * 
 * This middleware intercepts messages from the API and ensures they are in the correct format
 * for the UI components to render them properly.
 */

/**
 * Formats a message to ensure it has proper content and parts
 * @param {Object} message - The message object to format
 * @returns {Object} - The formatted message
 */
export function formatMessage(message) {
  // Clone the message to avoid mutating the original
  const formattedMessage = { ...message };
  
  // If message has no parts array, create it
  if (!formattedMessage.parts || !Array.isArray(formattedMessage.parts)) {
    formattedMessage.parts = [];
  }
  
  // If the message has content but no text part, add one
  if (formattedMessage.content && !formattedMessage.parts.some(part => part.type === 'text')) {
    formattedMessage.parts.push({
      type: 'text',
      text: formattedMessage.content
    });
  }
  
  // If message has a step-start part but no content, try to extract content from API response
  if (formattedMessage.parts.some(part => part.type === 'step-start') && !formattedMessage.content) {
    // First try to get content from the API response if available
    if (formattedMessage.apiResponse && formattedMessage.apiResponse.choices && 
        formattedMessage.apiResponse.choices.length > 0 && 
        formattedMessage.apiResponse.choices[0].message) {
      formattedMessage.content = formattedMessage.apiResponse.choices[0].message.content;
      
      // If we found content, add it as a text part
      if (formattedMessage.content) {
        formattedMessage.parts.push({
          type: 'text',
          text: formattedMessage.content
        });
      }
    }
    
    // If no content found in API response, provide a helpful message
    if (!formattedMessage.content) {
      formattedMessage.content = "I'm ready to assist you. What can I help with today?";
      formattedMessage.parts.push({
        type: 'text',
        text: formattedMessage.content
      });
      console.log("Fixed empty step-start message with helpful content");
    }
  }
  
  // If message still has no content and no text part, add a helpful message
  // This ensures the UI always has something meaningful to display
  if (!formattedMessage.content && !formattedMessage.parts.some(part => part.type === 'text')) {
    formattedMessage.content = "I'm ready to assist you. What can I help with today?";
    formattedMessage.parts.push({
      type: 'text',
      text: formattedMessage.content
    });
    console.log("Added helpful content to empty message");
  }
  
  return formattedMessage;
}

/**
 * Middleware that ensures all messages have proper format
 * @param {Array} messages - Array of messages to format
 * @returns {Array} - Formatted messages
 */
export function ensureMessageFormat(messages) {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(message => formatMessage(message));
}

/**
 * Creates a standard format message for OpenAI
 * @param {Object} message - Original message to format
 * @returns {Object} - Formatted message for the API
 */
export function formatMessageForAPI(message) {
  // Create a copy to avoid modifying the original
  const formatted = { ...message };
  
  // API expects role and content
  return {
    role: formatted.role,
    content: formatted.content || (formatted.parts?.find(p => p.type === 'text')?.text || '')
  };
}

/**
 * Formats a set of messages for the API
 * @param {Array} messages - Array of messages to format
 * @returns {Array} - Formatted messages for the API
 */
export function formatMessagesForAPI(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.map(formatMessageForAPI);
}

// Keep these for backward compatibility
export const formatMessageForTogetherAI = formatMessageForAPI;
export const formatMessagesForTogetherAI = formatMessagesForAPI; 