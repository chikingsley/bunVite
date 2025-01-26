import { Server } from "bun";
import { handleWebhook } from "./clerk-webhooks";

// Routes configuration for our Bun server
// This sets up API endpoints and their handlers
export function setupRoutes(server: Server) {
  return {
    async fetch(req: Request) {
      const url = new URL(req.url);
      
      // Health check endpoint
      if (url.pathname === '/health' && req.method === 'GET') {
        return new Response(JSON.stringify({ 
          status: 'ok',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle Clerk webhooks
      if (url.pathname === '/api/webhooks' && req.method === 'POST') {
        return handleWebhook(req);
      }

      // Handle Hume CLM completions (SSE)
      if (url.pathname === '/chat/completions' && req.method === 'POST') {
        // TODO: Implement Hume CLM handler
        // This will be a Server-Sent Events endpoint
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue('Not implemented yet');
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }

      // Handle 404s
      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  };
} 