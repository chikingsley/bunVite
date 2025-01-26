import { createStore } from 'tinybase';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { createPostgresPersister } from 'tinybase/persisters/persister-postgres';
import { createClient } from '@supabase/supabase-js';
import type { UserData, SessionData, MessageData } from './hume-types';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create the store
export const store = createStore()
  .setTables({
    users: {},
    sessions: {},
    messages: {},
  });

// Initialize persisters
export async function initializePersistence() {
  try {
    // Local-first with IndexedDB
    const localPersister = createIndexedDbPersister(store, 'mindpattern');
    await localPersister.startAutoLoad([{
      users: {},
      sessions: {},
      messages: {}
    }, {}]);
    await localPersister.startAutoSave();
    console.log('IndexedDB persister initialized');

    // Supabase sync
    const remotePersister = await createPostgresPersister(store, {
      connectionString: supabaseUrl,
      password: supabaseKey,
      schema: 'public',
      tablePrefix: '',
      transformers: {
        users: {
          toDb: (row: Record<string, string | number | boolean>) => ({
            id: row.id,
            config_id: row.configId,
            email: row.email,
            system_prompt: row.systemPrompt,
            first_name: row.firstName,
            last_name: row.lastName
          }),
          fromDb: (row: Record<string, string | number | boolean | null>) => ({
            id: String(row.id),
            configId: row.config_id ? String(row.config_id) : undefined,
            email: row.email ? String(row.email) : undefined,
            systemPrompt: row.system_prompt ? String(row.system_prompt) : undefined,
            firstName: row.first_name ? String(row.first_name) : undefined,
            lastName: row.last_name ? String(row.last_name) : undefined
          })
        },
        sessions: {
          toDb: (row: Record<string, string | number | boolean>) => ({
            id: row.id,
            user_id: row.userId,
            timestamp: row.timestamp
          }),
          fromDb: (row: Record<string, string | number | boolean | null>) => ({
            id: String(row.id),
            userId: String(row.user_id),
            timestamp: Number(row.timestamp)
          })
        },
        messages: {
          toDb: (row: Record<string, string | number | boolean>) => ({
            id: row.id,
            session_id: row.sessionId,
            role: row.role,
            content: row.content,
            timestamp: row.timestamp,
            metadata: row.metadata ? JSON.stringify(row.metadata) : null
          }),
          fromDb: (row: Record<string, string | number | boolean | null>) => ({
            id: String(row.id),
            sessionId: String(row.session_id),
            role: String(row.role),
            content: String(row.content),
            timestamp: Number(row.timestamp),
            metadata: row.metadata ? JSON.parse(String(row.metadata)) : undefined
          })
        }
      }
    });
    await remotePersister.startAutoSave();
    console.log('Postgres persister initialized');

    return { localPersister, remotePersister };
  } catch (err) {
    console.error('Failed to initialize persisters:', err);
    throw err;
  }
}

// Type-safe accessors (reusing from store.ts)
export function getUser(userId: string): UserData | undefined {
  const row = store.getTable('users')?.[userId];
  return row ? {
    id: String(row.id),
    configId: row.configId ? String(row.configId) : undefined,
    email: row.email ? String(row.email) : undefined,
    systemPrompt: row.systemPrompt ? String(row.systemPrompt) : undefined,
    firstName: row.firstName ? String(row.firstName) : undefined,
    lastName: row.lastName ? String(row.lastName) : undefined,
    sessions: {},
  } : undefined;
}

export function getSession(sessionId: string): SessionData | undefined {
  const row = store.getTable('sessions')?.[sessionId];
  return row ? {
    id: String(row.id),
    userId: String(row.userId),
    timestamp: Number(row.timestamp),
    messages: {},
  } : undefined;
}

export function getMessage(messageId: string): MessageData | undefined {
  const row = store.getTable('messages')?.[messageId];
  return row ? {
    id: String(row.id),
    sessionId: String(row.sessionId),
    role: row.role as MessageData['role'],
    content: String(row.content),
    timestamp: Number(row.timestamp),
    metadata: row.metadata ? JSON.parse(String(row.metadata)) : undefined,
  } : undefined;
}

// Operations
export function createUser(userData: Omit<UserData, 'sessions'>) {
  const row: Record<string, string | number | boolean> = {
    id: userData.id,
  };
  
  if (userData.configId) row.configId = userData.configId;
  if (userData.email) row.email = userData.email;
  if (userData.systemPrompt) row.systemPrompt = userData.systemPrompt;
  if (userData.firstName) row.firstName = userData.firstName;
  if (userData.lastName) row.lastName = userData.lastName;
  
  store.setRow('users', userData.id, row);
}

export function deleteUser(userId: string) {
  store.delRow('users', userId);
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID();
  store.setRow('sessions', sessionId, {
    id: sessionId,
    userId,
    timestamp: Date.now(),
  });
  return sessionId;
}

export function addMessage(sessionId: string, content: string, role: MessageData['role']) {
  const messageId = crypto.randomUUID();
  store.setRow('messages', messageId, {
    id: messageId,
    sessionId,
    role,
    content,
    timestamp: Date.now(),
  });
  return messageId;
} 