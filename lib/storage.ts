// In-memory storage to replace database functionality

// Types (previously defined in schema.ts)
export const DEFAULT_USER_ID = 'user-1';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  visibility: 'public' | 'private';
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool' | 'data' | 'function';
  createdAt: Date;
}

export type DBMessage = Message;

export interface Vote {
  id: string;
  userId: string;
  messageId: string;
  chatId: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Suggestion {
  id: string;
  documentId: string;
  suggestedText: string;
  startPos: number;
  endPos: number;
  createdAt: Date;
  originalText?: string;
}

// In-memory storage
const storage = {
  chats: new Map<string, Chat>(),
  messages: new Map<string, Message[]>(),
  votes: new Map<string, Vote[]>(),
  documents: new Map<string, Document>(),
  suggestions: new Map<string, Suggestion[]>(),
  users: new Map<string, { id: string; email: string; }>()
};

// Storage functions (previously in queries.ts)
export async function getUserByEmail(email: string) {
  const users = Array.from(storage.users.values()).filter(user => user.email === email);
  return users.length ? users : [];
}

export async function createUser({ email }: { email: string }) {
  const id = `user-${Date.now()}`;
  const user = { id, email };
  storage.users.set(id, user);
  return user;
}

export async function deleteChatById(id: string) {
  // Delete messages and votes
  storage.messages.delete(id);
  storage.votes.delete(id);
  
  // Delete chat
  const result = storage.chats.delete(id);
  return result;
}

export async function getChatsByUserId(userId: string, limit: number = 30) {
  const chats = Array.from(storage.chats.values())
    .filter(chat => chat.userId === userId)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    .slice(0, limit);
    
  return chats;
}

export async function getChatById(id: string) {
  const chat = storage.chats.get(id);
  return chat ? [chat] : [];
}

export async function saveMessages(messages: Message[]) {
  for (const message of messages) {
    const chatMessages = storage.messages.get(message.chatId) || [];
    chatMessages.push(message);
    storage.messages.set(message.chatId, chatMessages);
    
    // Update chat's lastMessageAt
    const chat = storage.chats.get(message.chatId);
    if (chat) {
      chat.lastMessageAt = message.createdAt;
      storage.chats.set(message.chatId, chat);
    }
  }
  return messages;
}

export async function getMessagesByChatId(chatId: string) {
  return storage.messages.get(chatId) || [];
}

export async function voteMessage({ chatId, messageId, userId }: { chatId: string, messageId: string, userId: string }) {
  const votes = storage.votes.get(chatId) || [];
  const existingVoteIndex = votes.findIndex(vote => vote.messageId === messageId && vote.userId === userId);
  
  if (existingVoteIndex !== -1) {
    // Remove existing vote
    votes.splice(existingVoteIndex, 1);
    storage.votes.set(chatId, votes);
    return;
  }
  
  // Add new vote
  const newVote: Vote = {
    id: `vote-${Date.now()}`,
    userId,
    messageId,
    chatId,
    createdAt: new Date()
  };
  
  votes.push(newVote);
  storage.votes.set(chatId, votes);
  return newVote;
}

export async function getVotesByChatId(id: string) {
  return storage.votes.get(id) || [];
}

export async function saveDocument({ id, userId, title, content, type }: { id: string, userId: string, title: string, content: string, type: string }) {
  const now = new Date();
  const document: Document = {
    id,
    userId,
    title,
    content,
    type,
    createdAt: now,
    updatedAt: now
  };
  
  storage.documents.set(id, document);
  return document;
}

export async function getDocumentsByUserId(userId: string) {
  return Array.from(storage.documents.values())
    .filter(doc => doc.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getDocumentById(id: string) {
  const document = storage.documents.get(id);
  return document ? [document] : [];
}

export async function deleteDocumentsById(ids: string[]) {
  let success = true;
  for (const id of ids) {
    success = storage.documents.delete(id) && success;
    // Also delete associated suggestions
    storage.suggestions.delete(id);
  }
  return success;
}

export async function saveSuggestions(suggestions: Omit<Suggestion, 'createdAt'>[]) {
  const now = new Date();
  const newSuggestions = suggestions.map(s => ({
    ...s,
    createdAt: now
  }));
  
  for (const suggestion of newSuggestions) {
    const documentSuggestions = storage.suggestions.get(suggestion.documentId) || [];
    documentSuggestions.push(suggestion);
    storage.suggestions.set(suggestion.documentId, documentSuggestions);
  }
  
  return newSuggestions;
}

export async function getSuggestionsByDocumentId(documentId: string) {
  return storage.suggestions.get(documentId) || [];
}

export async function getMessageById(id: string) {
  for (const messages of storage.messages.values()) {
    const message = messages.find(m => m.id === id);
    if (message) return [message];
  }
  return [];
}

export async function deleteMessagesAfterTimestamp(chatId: string, timestamp: Date) {
  const messages = storage.messages.get(chatId) || [];
  const filteredMessages = messages.filter(m => m.createdAt.getTime() <= timestamp.getTime());
  storage.messages.set(chatId, filteredMessages);
  return filteredMessages;
}

export async function updateChatVisibility(chatId: string, visibility: 'public' | 'private') {
  const chat = storage.chats.get(chatId);
  if (chat) {
    chat.visibility = visibility;
    storage.chats.set(chatId, chat);
    return true;
  }
  return false;
}

// Function to create a chat - needed but wasn't in the queries search results
export async function createChat({ id, userId, title }: { id: string, userId: string, title: string }) {
  const now = new Date();
  const chat: Chat = {
    id,
    userId,
    title,
    createdAt: now,
    lastMessageAt: now,
    visibility: 'private'
  };
  
  storage.chats.set(id, chat);
  return chat;
} 