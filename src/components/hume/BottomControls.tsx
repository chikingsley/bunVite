import { useVoice } from "@humeai/voice-react"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"

import { ChatInputForm } from "@/components/chat/ChatInputForm"
import Controls from "./Controls"

export function BottomControls() {
  const { status, connect, disconnect } = useVoice()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  
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
    <div className="fixed bottom-0 left-0 w-full p-4 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-background/0">
      <AnimatePresence mode="wait" initial={false}>
        {showControls ? (
          <motion.div
            layoutId="control-box"
            data-component="controls-container"
            className="w-full max-w-sm"
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
            className="w-full max-w-3xl"
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
  )
} 