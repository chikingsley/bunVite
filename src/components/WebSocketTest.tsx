import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { store } from "@/utils/store-config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/utils";

export function WebSocketTest() {
  const { getToken } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [storeData, setStoreData] = useState({
    users: {},
    sessions: {},
    messages: {}
  });

  // Add debug listeners for store changes
  useEffect(() => {
    // Log initial store state
    console.log('Initial store state:', {
      users: store.getTable('users'),
      sessions: store.getTable('sessions'),
      messages: store.getTable('messages')
    });

    // Add table listeners
    const userListener = store.addTableListener('users', () => {
      console.log('Users table changed:', store.getTable('users'));
      updateStoreData();
    });

    const sessionListener = store.addTableListener('sessions', () => {
      console.log('Sessions table changed:', store.getTable('sessions'));
      updateStoreData();
    });

    const messageListener = store.addTableListener('messages', () => {
      console.log('Messages table changed:', store.getTable('messages'));
      updateStoreData();
    });

    function updateStoreData() {
      const users = store.getTable('users');
      const sessions = store.getTable('sessions');
      const messages = store.getTable('messages');
      
      setStoreData({
        users: users || {},
        sessions: sessions || {},
        messages: messages || {}
      });
    }

    return () => {
      store.delListener(userListener);
      store.delListener(sessionListener);
      store.delListener(messageListener);
    };
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;

    const connect = async () => {
      const token = await getToken();
      if (!token) return;

      socket = new WebSocket(`ws://localhost:3001/chat?token=${token}`);
      setWs(socket);

      socket.onopen = () => {
        console.log("Connected!");
        setIsConnected(true);
      };
      socket.onclose = () => {
        console.log("Disconnected!");
        setIsConnected(false);
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
      };
    };

    connect();

    return () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [getToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws?.readyState === WebSocket.OPEN && message.trim()) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        content: message,
        role: 'user'
      }));
      setMessage("");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div 
          className={cn(
            "size-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a test message..."
          className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
        />
        <Button type="submit">Send</Button>
      </form>

      <h2 className="text-lg font-bold mb-2">Store Data:</h2>
      <pre className="bg-gray-800 p-4 rounded">
        {JSON.stringify(storeData, null, 2)}
      </pre>
    </div>
  );
} 