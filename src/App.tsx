// src/App.tsx

import { RootLayout } from "@/components/layout/RootLayout"
import Chat from "@/components/hume/Chat"
import { StoreTest } from "@/components/StoreTest"

export default function App() {
  return (
    <RootLayout>
      <div className="space-y-8">
        <StoreTest />
        <Chat />
      </div>
    </RootLayout>
  )
}