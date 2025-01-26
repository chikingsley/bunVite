import { Button } from "./ui/button";
import { useAppStore } from "./providers/StoreProvider";
import { useState, useEffect } from "react";

export function StoreTest() {
  const store = useAppStore();
  const [_, setVersion] = useState(0);

  useEffect(() => {
    // Add listener for store changes
    const listenerId = store.addTablesListener(() => {
      setVersion(v => v + 1);
    });

    // Cleanup listener on unmount
    return () => {
      store.delListener(listenerId);
    };
  }, [store]);

  const addTestUser = () => {
    const userId = crypto.randomUUID();
    store.setRow('users', userId, {
      id: userId,
      email: `test${Date.now()}@example.com`,
      name: `Test User ${Date.now()}`
    });
  };

  const addTestMessage = () => {
    const messageId = crypto.randomUUID();
    store.setRow('messages', messageId, {
      id: messageId,
      content: `Test message ${Date.now()}`,
      timestamp: Date.now(),
      userId: Object.keys(store.getTable('users'))[0] || 'unknown'
    });
  };

  // Get current data
  const users = store.getTable('users');
  const messages = store.getTable('messages');

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Store Test</h2>
        <div className="space-x-2">
          <Button onClick={addTestUser}>Add Test User</Button>
          <Button onClick={addTestMessage}>Add Test Message</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Current Store Data:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Users</h4>
            <pre className="p-4 bg-white text-black rounded-lg overflow-auto max-h-[400px] border">
              {JSON.stringify(users, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Messages</h4>
            <pre className="p-4 bg-white text-black rounded-lg overflow-auto max-h-[400px] border">
              {JSON.stringify(messages, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 