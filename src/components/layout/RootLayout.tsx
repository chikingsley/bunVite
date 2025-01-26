import { ClerkProvider } from "@clerk/clerk-react"
import { VoiceProvider } from "@humeai/voice-react"
import { BrowserRouter } from "react-router-dom"
import { useEffect, useState } from "react"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { getHumeAccessToken } from "@/utils/getHumeAccessToken"

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  useEffect(() => {
    if (!PUBLISHABLE_KEY) {
      setError("Missing Clerk Publishable Key")
      return
    }

    const initializeTokens = async () => {
      try {
        const token = await getHumeAccessToken()
        if (!token) {
          setError("No access token available")
          return
        }
        setAccessToken(token)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize")
      }
    }

    initializeTokens()
  }, [PUBLISHABLE_KEY])

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>
  }

  if (!accessToken) {
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