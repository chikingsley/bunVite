import { useState } from 'react';
import { useWebSocket } from '../hooks/use-websocket';

export function WebSocketTest() {
  const [message, setMessage] = useState('');
  
  const { isConnected, error, sendMessage } = useWebSocket({
    url: 'ws://localhost:3001/chat',
    token: 'test-token', // We'll need to replace this with a real token
    onMessage: (msg) => {
      console.log('Received:', msg);
    },
    onError: (err) => {
      console.error('WebSocket error:', err);
    },
    onClose: () => {
      console.log('WebSocket closed');
    }
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessage('chat_message', { text: message });
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        {error && <div className="text-red-500">Error: {error.type}</div>}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 rounded"
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
} 