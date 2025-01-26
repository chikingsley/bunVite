import { useVoice } from "@humeai/voice-react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function StartCall() {
  const { status, connect } = useVoice();

  return (
    <AnimatePresence initial={false}>
      {status.value !== "connected" && (
        <motion.div
          data-component="start-call-overlay"
          className="fixed inset-0 p-4 flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            data-component="start-call-button"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            transition={{ 
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
          >
            <Button
              className="z-50 flex items-center gap-1.5"
              onClick={() => {
                connect()
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {});
              }}
            >
              <span>
                <Phone
                  className="size-4 opacity-50"
                  strokeWidth={2}
                  stroke="currentColor"
                />
              </span>
              <span>Start Call</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
