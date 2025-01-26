import { ClerkProvider } from "@clerk/clerk-react"
import { VoiceProvider } from "@humeai/voice-react"
import { BrowserRouter } from "react-router-dom"
import { useEffect, useState } from "react"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { getHumeAccessToken } from "@/utils/getHumeAccessToken"
import { WebSocketTest } from "@/components/WebSocketTest"
import { initializePersistence } from "@/utils/store-config"

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storeInitialized, setStoreInitialized] = useState(false)
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  useEffect(() => {
    if (!PUBLISHABLE_KEY) {
      setError("Missing Clerk Publishable Key")
      return
    }

    const initialize = async () => {
      try {
        // Initialize Hume token
        const token = await getHumeAccessToken()
        if (!token) {
          setError("No access token available")
          return
        }
        setAccessToken(token)

        // Initialize store
        await initializePersistence()
        setStoreInitialized(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize")
      }
    }

    initialize()
  }, [PUBLISHABLE_KEY])

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>
  }

  if (!accessToken || !storeInitialized) {
    return <div className="p-4">Initializing...</div>
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <VoiceProvider
            auth={{ type: "accessToken", value: accessToken }}
            onMessage={() => {
              // Message handling can be added here
            }}
          >
            <div className="flex h-screen flex-col">
              <div className="flex flex-1 overflow-hidden">
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <main className="flex-1 relative overflow-auto">
                      <WebSocketTest />
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              </div>
            </div>
          </VoiceProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ClerkProvider>
  )
} 