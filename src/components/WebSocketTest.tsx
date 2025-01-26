import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { store } from "@/utils/store-config";

export function WebSocketTest() {
  const { getToken } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connect = async () => {
      const token = await getToken();
      if (!token) return;

      const socket = new WebSocket(`ws://localhost:3001/chat?token=${token}`);
      setWs(socket);

      socket.onopen = () => console.log("Connected!");
      socket.onclose = () => console.log("Disconnected!");
      socket.onmessage = (event) => console.log("Message:", event.data);
    };

    connect();
    return () => ws?.close();
  }, [getToken]);

  // Debug view of store data
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Store Data:</h2>
      <pre className="bg-gray-800 p-4 rounded">
        {JSON.stringify({
          users: store.getTable('users'),
          sessions: store.getTable('sessions'),
          messages: store.getTable('messages'),
        }, null, 2)}
      </pre>
    </div>
  );
} 