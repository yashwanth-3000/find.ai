// Basic schema definitions for the database

// Types for artifacts
export type ArtifactType = 'document' | 'image' | 'code' | 'custom';

export interface Artifact {
  id: string;
  chatId: string;
  type: ArtifactType;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document type
export interface Document {
  id: string;
  title: string;
  content: string;
  kind: 'code' | 'text' | 'image' | 'sheet';
  userId?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

// Vote type for message voting
export interface Vote {
  id: string;
  chatId: string;
  messageId: string;
  userId?: string;
  vote: 'up' | 'down';
  createdAt: Date;
}

// Chat type for conversation history
export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Suggestion type for code suggestions
export interface Suggestion {
  id: string;
  documentId: string;
  suggestedText: string;
  startPos: number;
  endPos: number;
  createdAt: Date;
  originalText?: string;
} 