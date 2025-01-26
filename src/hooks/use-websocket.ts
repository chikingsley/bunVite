import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data: unknown;
  custom_session_id?: string;
}

interface WebSocketHookOptions<T = WebSocketMessage> {
  url: string;
  token: string;
  onMessage?: (message: T) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  configId?: string;
}

export function useWebSocket<T = WebSocketMessage>({
  url,
  token,
  onMessage,
  onError,
  onClose,
  configId
}: WebSocketHookOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!token) return;

    // Add config_id and token to URL
    const wsUrl = new URL(url);
    wsUrl.searchParams.set('token', token);
    if (configId) {
      wsUrl.searchParams.set('config_id', configId);
    }

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl.toString());
    wsRef.current = ws;

    // Handle connection open
    ws.addEventListener('open', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    // Handle incoming messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        console.log('Received message:', data);
        onMessage?.(data);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    });

    // Handle errors
    ws.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      setError(event);
      onError?.(event);
    });

    // Handle connection close
    ws.addEventListener('close', () => {
      console.log('WebSocket closed');
      setIsConnected(false);
      onClose?.();

      // Attempt reconnection with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        console.log(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      } else {
        console.log('Max reconnection attempts reached');
      }
    });
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [url, token, configId]);

  // Function to send messages
  const sendMessage = (type: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data });
      console.log('Sending message:', message);
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return {
    isConnected,
    error,
    sendMessage
  };
} 