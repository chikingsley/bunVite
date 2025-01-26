import { Server, ServerWebSocket } from "bun";

// Types for WebSocket messages
type MessageType = 
  | 'chat_message' 
  | 'audio_input'
  | 'assistant_input'
  | 'assistant_end'
  | 'session_settings'
  | 'error';

interface WebSocketMessage {
  type: MessageType;
  data: unknown;
  custom_session_id?: string;
}

interface WebSocketData {
  userId: string;
  sessionId: string;
  configId?: string;
}

// Active connections store
const connections = new Map<string, ServerWebSocket<WebSocketData>>();

export function createWSServer(port: number = 3001) {
  const server = Bun.serve<WebSocketData>({
    port,

    fetch(req: Request, server: Server) {
      const url = new URL(req.url);
      console.log(`Incoming request to ${url.pathname}`);
      
      // Handle WebSocket upgrade for chat
      if (url.pathname === '/chat') {
        // Get auth token from URL params
        const token = url.searchParams.get('token');
        console.log('Auth token:', token);
        
        if (!token) {
          console.log('No token provided');
          return new Response('Unauthorized', { status: 401 });
        }

        try {
          // TODO: Verify token
          const userId = 'temp-user-id'; // Will be from token verification
          const sessionId = crypto.randomUUID();
          console.log(`Creating session for user ${userId}`);

          // Get optional config ID
          const configId = url.searchParams.get('config_id') || undefined;

          const success = server.upgrade(req, {
            data: { 
              userId,
              sessionId,
              configId
            },
            headers: {
              'Set-Cookie': `sessionId=${sessionId}` 
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
    },

    websocket: {
      // Enable compression for better performance
      perMessageDeflate: true,
      
      // Configure reasonable limits
      maxPayloadLength: 16 * 1024 * 1024, // 16MB
      idleTimeout: 120, // 2 minutes

      open(ws: ServerWebSocket<WebSocketData>) {
        // Store connection
        connections.set(ws.data.sessionId, ws);
        
        // Subscribe to user-specific channel
        ws.subscribe(`user:${ws.data.userId}`);
        
        // Send initial session metadata
        ws.send(JSON.stringify({
          type: 'chat_metadata',
          chat_id: ws.data.sessionId,
          chat_group_id: ws.data.userId // Using userId as group for now
        }));
      },

      message(ws: ServerWebSocket<WebSocketData>, message: string | ArrayBuffer | Uint8Array) {
        try {
          const msg = JSON.parse(String(message)) as WebSocketMessage;
          
          switch (msg.type) {
            case 'chat_message':
              // Handle chat messages
              server.publish(
                `user:${ws.data.userId}`,
                JSON.stringify({
                  type: 'chat_message',
                  data: msg.data,
                  custom_session_id: ws.data.sessionId
                })
              );
              break;

            case 'audio_input':
              // Handle audio input - will integrate with Hume
              break;

            case 'session_settings':
              // Handle session settings updates
              break;

            default:
              console.warn('Unknown message type:', msg.type);
          }
        } catch (err) {
          console.error('Error processing message:', err);
          ws.send(JSON.stringify({
            type: 'error',
            data: 'Invalid message format'
          }));
        }
      },

      close(ws: ServerWebSocket<WebSocketData>) {
        // Clean up connection
        connections.delete(ws.data.sessionId);
        ws.unsubscribe(`user:${ws.data.userId}`);
      },

      drain(ws: ServerWebSocket<WebSocketData>) {
        // Handle backpressure
        console.log('WebSocket backpressure:', ws.data.sessionId);
      }
    }
  });

  console.log(`WebSocket server listening on port ${port}`);
  return server;
}

// Actually create and start the server
createWSServer(); 