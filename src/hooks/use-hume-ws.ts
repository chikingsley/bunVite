import { useEffect, useRef, useState } from 'react';
import { store } from '@/utils/store-config';

type HumeWSStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useHumeWS(configId: string) {
  const [status, setStatus] = useState<HumeWSStatus>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = async () => {
    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      setStatus('connecting');
      
      // Create WebSocket connection with config and API key
      const wsUrl = new URL('wss://api.hume.ai/v0/evi/chat');
      wsUrl.searchParams.set('config_id', configId);
      wsUrl.searchParams.set('api_key', import.meta.env.VITE_HUME_API_KEY);
      
      console.log('Connecting with URL:', wsUrl.toString());
      console.log('Using config ID:', configId);
      
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected with config ID:', configId);
        setStatus('connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        
        // Handle different message types
        switch (message.type) {
          case 'chat_metadata':
            console.log('Storing chat session with ID:', message.chat_id);
            store.setRow('sessions', message.chat_id, {
              id: message.chat_id,
              groupId: message.chat_group_id,
              timestamp: Date.now()
            });
            break;

          case 'user_message':
            if (!message.interim) {
              console.log('Storing user message:', message.message.content);
              store.setRow('messages', crypto.randomUUID(), {
                content: message.message.content,
                role: 'user',
                sessionId: message.chat_id,
                timestamp: Date.now()
              });
            }
            break;

          case 'assistant_message':
            console.log('Storing assistant message:', message.message.content);
            store.setRow('messages', crypto.randomUUID(), {
              content: message.message.content,
              role: 'assistant',
              sessionId: message.chat_id,
              timestamp: Date.now(),
              expressions: message.models.prosody?.scores
            });
            break;

          case 'error':
            console.error('WebSocket error message:', message);
            setStatus('error');
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        setStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket closed for config ID:', configId);
        setStatus('idle');
        wsRef.current = null;
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setStatus('idle');
  };

  // Cleanup on unmount or configId change
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [configId]);

  return {
    status,
    connect,
    disconnect,
    sendMessage: (text: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'user_input',
          text
        }));
      } else {
        console.warn('WebSocket not connected, attempting to reconnect...');
        // Attempt to reconnect and then send the message
        connect().then(() => {
          // Wait a bit for the connection to establish
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'user_input',
                text
              }));
            }
          }, 1000);
        });
      }
    }
  };
} 