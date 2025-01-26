import { setupRoutes } from './routes';
import { handleWebSocket, wsConfig } from './ws-server';

// Initialize server
const server = Bun.serve({
  port: 3001,
  websocket: wsConfig,
  fetch(req: Request) {
    // Handle WebSocket upgrade requests
    if (req.headers.get("upgrade") === "websocket") {
      return handleWebSocket(this, req);
    }
    // Handle HTTP requests
    return setupRoutes(this).fetch(req);
  }
});

console.log(`Server listening on port ${server.port} (HTTP + WebSocket)`); 