# Routing Structure

## Client-Side Routes

```
src/routes/
  ├── sign-in/
  │   └── [[...index]].tsx      # Clerk SignIn component
  ├── sign-up/
  │   └── [[...index]].tsx      # Clerk SignUp component
  └── sessions/                 # Chat sessions
      ├── [sessionId]/
      │   └── page.tsx          # Individual session view with chat
      └── page.tsx             # Sessions list/overview
```

## Server-Side Routes

```
src/server/
  ├── routes.ts                # Main route configuration
  ├── api/
  │   ├── auth/               # Auth-related endpoints
  │   │   └── webhooks.ts     # Clerk webhooks
  │   └── sessions/           # Session-related endpoints
  │       ├── ws.ts          # WebSocket handler
  │       └── [sessionId]/   # Session-specific endpoints
  │           └── messages.ts # Session messages
  └── middleware/
      └── auth.ts            # Authentication middleware
```

## URL Structure

- `/` - Home/landing
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/sessions` - List of all chat sessions
- `/sessions/[session-title]` - Individual chat session

Example URLs:
```
/sessions/chat-about-ai-ethics-123
/sessions/project-planning-456
```

## Environment Variables

```env
# Auth Routes
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/sessions
VITE_CLERK_AFTER_SIGN_UP_URL=/sessions

# API Routes
VITE_API_BASE_URL=/api
VITE_WS_URL=/api/sessions/ws
```

## Implementation Notes

1. **Session Management**:
   - Sessions stored in TinyBase with persistence
   - Each session has a unique ID and title
   - URLs use slugified session titles for readability
   - WebSocket connections scoped to specific sessions

2. **Authentication Flow**:
   - Sign in/up redirects to sessions list
   - Protected routes require authentication
   - WebSocket connections require auth token

3. **Data Flow**:
   - Local-first with TinyBase
   - Real-time updates via WebSocket
   - Session data synced with Supabase 