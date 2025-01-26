import type { ServerWebSocket, WebSocketHandler, Server } from "bun";
import { verifyToken } from "@clerk/backend";
import { createSession, addMessage, initializePersistence } from "@/utils/store-config";

interface WebSocketData {
  userId: string;
  sessionId: string;
  configId?: string;
}

// Map to store user connections
const connections = new Map<string, Set<ServerWebSocket<WebSocketData>>>();

// Initialize store
let storeInitialized = false;
async function ensureStoreInitialized() {
  if (!storeInitialized) {
    await initializePersistence();
    storeInitialized = true;
  }
}

// WebSocket configuration
export const wsConfig: WebSocketHandler<WebSocketData> = {
  async message(ws, message) {
    const { userId, sessionId } = ws.data;
    
    try {
      // Ensure store is initialized
      await ensureStoreInitialized();
      
      // Add message to store
      const messageData = JSON.parse(String(message));
      if (messageData.type === 'chat_message') {
        console.log('Adding message to store:', { sessionId, content: messageData.content, role: messageData.role });
        const messageId = addMessage(sessionId, messageData.content, messageData.role);
        console.log('Message added with ID:', messageId);
        
        // Send confirmation back to sender
        ws.send(JSON.stringify({
          type: 'message_added',
          data: {
            messageId,
            sessionId,
            content: messageData.content,
            role: messageData.role
          }
        }));
      }
      
      // Send to other connections
      const userConnections = connections.get(userId);
      if (userConnections) {
        for (const conn of userConnections) {
          if (conn !== ws) {
            conn.send(message);
          }
        }
      }
    } catch (err) {
      console.error('Error handling message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  },

  open(ws) {
    const { userId } = ws.data;
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId)?.add(ws);
    console.log(`Client connected: ${userId}`);
  },

  close(ws) {
    const { userId } = ws.data;
    const userConnections = connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        connections.delete(userId);
      }
    }
    console.log(`Client disconnected: ${userId}`);
  }
};

export async function handleWebSocket(server: Server, req: Request): Promise<Response | undefined> {
  const url = new URL(req.url);
  console.log(`Incoming request to ${url.pathname}`);
  
  // Initialize store if needed
  await ensureStoreInitialized();
  
  // Handle WebSocket upgrade for chat
  if (url.pathname === '/chat') {
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response('Missing token', { status: 400 });
    }

    try {
      // Verify token with Clerk
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!session) {
        console.error('Invalid token');
        return new Response('Invalid token', { status: 403 });
      }

      const userId = session.sub;
      console.log(`Creating session for user ${userId}`);

      // Create a new chat session
      const sessionId = createSession(userId);
      console.log(`Created chat session: ${sessionId}`);

      // Get optional config ID
      const configId = url.searchParams.get('config_id') || undefined;

      const success = server.upgrade(req, {
        data: {
          userId,
          sessionId,
          configId
        }
      });

      return success
        ? undefined
        : new Response('WebSocket upgrade failed', { status: 500 });
    } catch (err) {
      console.error('Error during upgrade:', err);
      return new Response('Invalid token', { status: 403 });
    }
  }

  return new Response('Not found', { status: 404 });
} 