import { Button } from "@/components/ui/button"
import { store } from "@/utils/store-config"
import { useStoreSync } from "@/hooks/use-store-sync"
import { useState } from "react"

export function StoreTest() {
  const syncStatus = useStoreSync()
  const [messageCount, setMessageCount] = useState(0)

  const addTestMessage = () => {
    const messageId = crypto.randomUUID()
    store.setRow('messages', messageId, {
      id: messageId,
      content: `Test message ${messageCount + 1}`,
      role: 'user',
      timestamp: Date.now()
    })
    setMessageCount(prev => prev + 1)
  }

  const addTestSession = () => {
    const sessionId = crypto.randomUUID()
    store.setRow('sessions', sessionId, {
      id: sessionId,
      timestamp: Date.now()
    })
  }

  // Get current data
  const messages = store.getTable('messages')
  const sessions = store.getTable('sessions')

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Store Test</h2>
        <div className="space-x-2">
          <Button onClick={addTestMessage}>Add Test Message</Button>
          <Button onClick={addTestSession}>Add Test Session</Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Last synced: {syncStatus.lastSynced?.toLocaleTimeString() || 'Never'}
          {syncStatus.isLoading && ' (Loading...)'}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Current Store Data:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Messages</h4>
            <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[400px] text-xs text-black">
              {JSON.stringify(messages, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Sessions</h4>
            <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[400px] text-xs text-black">
              {JSON.stringify(sessions, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 