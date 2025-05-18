import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  LanguageModelV1,
  LanguageModelV1Middleware
} from 'ai';
import { createOpenAI, OpenAIProviderSettings } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Check if OpenAI API key is available
const hasOpenAIKey = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.length > 0;

// Custom image model implementation for DALL-E
export const dalleImageModel = {
  generate: async (prompt: string) => {
    console.log('Using DALL-E image model:', prompt);
    
    if (!hasOpenAIKey) {
      console.log('No OpenAI API key available, using placeholder image');
      return {
        base64: '', // Empty base64 for placeholder
        url: `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`,
      };
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        base64: '', // DALL-E provides URL, not base64
        url: data.data[0].url,
      };
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      return {
        base64: '', // Empty base64 for placeholder
        url: `https://placehold.co/600x400?text=Error:+${encodeURIComponent(prompt)}`,
      };
    }
  }
};

// Default OpenAI model IDs
const chatModelId = 'gpt-4o';
const reasoningModelId = 'gpt-4o';

// Create the base provider
export const myProvider = isTestEnvironment || !hasOpenAIKey
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': wrapLanguageModel({
          model: createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: chatModelId
          } as OpenAIProviderSettings).chat(chatModelId),
          middleware: [],
        }),
        'chat-model-reasoning': wrapLanguageModel({
          model: createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: reasoningModelId
          } as OpenAIProviderSettings).chat(reasoningModelId),
          middleware: [extractReasoningMiddleware({ tagName: 'think' })],
        }),
        'title-model': wrapLanguageModel({
          model: createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: chatModelId
          } as OpenAIProviderSettings).chat(chatModelId),
          middleware: [],
        }),
        'artifact-model': wrapLanguageModel({
          model: createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: chatModelId
          } as OpenAIProviderSettings).chat(chatModelId),
          middleware: [],
        }),
      },
    });

// Add custom image model method
(myProvider as any).imageModel = (modelId: string) => {
  console.log(`Requesting image model: ${modelId}`);
  return dalleImageModel;
};
