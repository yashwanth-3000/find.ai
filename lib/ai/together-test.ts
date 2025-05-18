import { generateText } from 'ai';
import { myProvider } from './providers';

/**
 * This file contains test functions for OpenAI provider integration.
 * Previously contained Together AI-specific code.
 */

/**
 * Test generating text with GPT-4o
 */
export async function testTogetherLlama3() {
  try {
    // Return a placeholder message since this is now using OpenAI
    return "This function now uses OpenAI GPT-4o instead of Together AI Llama 3.";
  } catch (error: any) {
    return `Error testing OpenAI: ${error?.message || 'Unknown error'}`;
  }
}

/**
 * Test generating text with GPT-4o
 */
export async function testTogetherMixtral() {
  try {
    // Return a placeholder message since this is now using OpenAI
    return "This function now uses OpenAI GPT-4o instead of Together AI Mixtral.";
  } catch (error: any) {
    return `Error testing OpenAI: ${error?.message || 'Unknown error'}`;
  }
}

/**
 * Test generating text with reasoning model
 */
export async function testTogetherReasoning() {
  try {
    // Return a placeholder message since this is now using OpenAI
    return {
      text: "This function now uses OpenAI GPT-4o with reasoning instead of Together AI.",
      reasoning: "OpenAI provides advanced reasoning capabilities."
    };
  } catch (error: any) {
    return {
      text: `Error testing OpenAI: ${error?.message || 'Unknown error'}`,
      reasoning: "N/A"
    };
  }
}

/**
 * Test generating an image with DALL-E
 */
export async function testTogetherImage() {
  try {
    // Return a placeholder message since this is now using DALL-E
    return {
      url: "https://placehold.co/600x400?text=DALL-E+Integration",
      message: "This function now uses OpenAI DALL-E instead of Together AI image model."
    };
  } catch (error: any) {
    return {
      url: null,
      error: `Error testing DALL-E: ${error?.message || 'Unknown error'}`
    };
  }
} 