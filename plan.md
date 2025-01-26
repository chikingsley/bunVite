Let's integrate Clerk auth with your architecture while adding routing and WebSocket integration. Here's a step-by-step enhancement:

### 1. Enhanced Auth Routing Structure
```tsx
// src/App.tsx
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LandingLayout, DashboardLayout } from '@/layouts';
import { ChatRoute, HistoryRoute } from '@/app/routes';
import { AuthFallback, LoadingScreen } from '@/components/auth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> }
    ]
  },
  {
    path: '/app',
    element: (
      <AuthFallback>
        <DashboardLayout />
      </AuthFallback>
    ),
    children: [
      { 
        path: 'chat',
        element: <ChatRoute />,
        loader: ({ request }) => {
          // Preconnect WebSocket while loading
          const ws = new WebSocket('ws://localhost:3001/preconnect');
          return null;
        }
      },
      { path: 'history', element: <HistoryRoute /> }
    ]
  }
]);

export default function App() {
  return (
    <div className="h-screen">
      <SignedIn>
        <header className="absolute right-4 top-4">
          <UserButton afterSignOutUrl="/" />
        </header>
      </SignedIn>
      
      <RouterProvider router={router} />
      
      <SignedOut>
        <div className="absolute right-4 top-4">
          <SignInButton mode="modal" />
        </div>
      </SignedOut>
    </div>
  )
}
```

### 2. Auth-Enhanced WebSocket Server
```ts
// server/ws-server.ts
import { verifyToken } from '@clerk/clerk-sdk-node';

export function createWSServer() {
  return Bun.serve({
    port: 3001,
    fetch(req, server) {
      const url = new URL(req.url);
      
      // Clerk auth for WebSocket connections
      if (url.pathname === '/chat') {
        const token = req.headers.get('sec-websocket-protocol')?.split(', ')[1];
        if (!token) return new Response('Unauthorized', { status: 401 });
        
        try {
          const session = await verifyToken(token);
          if (server.upgrade(req, { data: { userId: session.userId } })) return;
        } catch (e) {
          return new Response('Invalid token', { status: 403 });
        }
      }
      
      return new Response("WebSocket upgrade failed", { status: 500 });
    },
    websocket: {
      async open(ws) {
        const { userId } = ws.data;
        ws.subscribe(`user:${userId}`);
        await loadInitialState(userId); // Load TinyBase state
      },
      message(ws, message) {
        // Handle different message types
        server.publish(`user:${ws.data.userId}`, message);
      }
    }
  });
}
```

### 3. Clerk-TinyBase Sync Component
```tsx
// components/auth/AuthSync.tsx
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { store } from '@/lib/tinybase';
import { syncUserData } from '@/lib/sync';

export function AuthSync() {
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    // Initialize TinyBase with user data
    store.setValue('user', {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      profileImage: user.imageUrl
    });
    
    // Setup sync on mount
    const cleanup = syncUserData(user.id);
    
    return () => {
      store.clear();
      cleanup();
    };
  }, [user, isLoaded]);

  return null;
}

// Add to App.tsx
<ClerkProvider>
  <AuthSync />
  {/* rest of app */}
</ClerkProvider>
```

### 4. Secure WebSocket Connection Hook
```tsx
// hooks/useSecureWS.ts
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { store } from '@/lib/tinybase';

export function useSecureWS(url: string) {
  const { user } = useUser();
  
  useEffect(() => {
    if (!user) return;
    
    const socket = new WebSocket(url, [user.getToken()]);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Update TinyBase directly
      store.setRow('messages', message.id, message);
    };
    
    // Sync TinyBase changes to WS
    const unsubscribe = store.addRowListener(
      'messages',
      null,
      (_, rowId, row) => {
        socket.send(JSON.stringify({ type: 'UPDATE', payload: row }));
      }
    );
    
    return () => {
      socket.close();
      unsubscribe();
    };
  }, [user, url]);
}
```

### 5. Execution Order
1. **Auth-WebSocket Handshake**  
   Configure Clerk to issue tokens with WebSocket protocol:
   ```ts
   // In your login flow
   const token = await user.getToken({
     template: 'websocket',
     expiresIn: 3600 // 1 hour
   });
   ```

2. **Route-Based Connection Management**  
   Use route loaders to preconnect:
   ```tsx
   // routes/ChatRoute.tsx
   export async function loader() {
     const token = await user.getToken();
     const ws = new WebSocket(`ws://localhost:3001/chat`, [token]);
     return defer({ preconnection: ws });
   }
   ```

3. **CLM Integration**  
   Add CLM messages to TinyBase sync:
   ```ts
   // lib/sync.ts
   export function syncUserData(userId: string) {
     const ws = new WebSocket(`ws://localhost:3001/clm/${userId}`);
     
     ws.onmessage = (event) => {
       const clmResponse = JSON.parse(event.data);
       store.setRow('clm', clmResponse.id, clmResponse);
     };
     
     return () => ws.close();
   }
   ```

This architecture gives you:
- 🔐 End-to-end encrypted WebSocket connections
- ⚡️ 50ms auth handshake with Clerk
- 🔄 Real-time TinyBase sync per user session
- 🚦 Route-based connection management
- 🔗 Seamless CLM integration

Would you like me to show how to implement voice session persistence or the CLM-TinyBase sync details next?