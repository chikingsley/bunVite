import { useVoice } from "@humeai/voice-react"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useIsTablet } from "@/hooks/use-mobile"
import { ChatInputForm } from "@/components/chat/ChatInputForm"
import Controls from "./Controls"

export function BottomControls() {
  const { status, connect, disconnect } = useVoice()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const isTablet = useIsTablet()
  
  const handleStartCall = async () => {
    setIsTransitioning(true)
    try {
      await connect()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsTransitioning(false)
    }
  }

  const handleEndCall = async () => {
    setIsTransitioning(true)
    try {
      await disconnect()
    } catch (error) {
      console.error('Disconnect failed:', error)
    } finally {
      setIsTransitioning(false)
    }
  }
  
  // Use isTransitioning to show optimistic UI updates
  const showControls = status.value === "connected" || isTransitioning
  
  return (
    <div className="fixed bottom-0 right-0 w-full flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-background/0">
      {isTablet && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 bottom-4 z-50"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0">
            {/* We'll need to import and add the Sidebar component here */}
          </SheetContent>
        </Sheet>
      )}
      <div className={`w-full p-4 ${!isTablet ? "pl-[250px]" : ""}`}>
        <div className="w-full max-w-[900px] mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            {showControls ? (
              <motion.div
                layoutId="control-box"
                data-component="controls-container"
                className="w-full max-w-sm mx-auto"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  layout: { duration: 0.2 }
                }}
              >
                <Controls onEndCall={handleEndCall} />
              </motion.div>
            ) : (
              <motion.div
                layoutId="control-box"
                data-component="chat-input-container"
                className="w-full"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  layout: { duration: 0.2 }
                }}
              >
                <ChatInputForm onStartCall={handleStartCall} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 