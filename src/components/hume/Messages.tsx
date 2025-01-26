import { cn } from "@/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentRef, forwardRef, useMemo } from "react";
import React from "react";
import { isEqual } from "lodash-es";

// Get the messages type from useVoice hook
type VoiceMessage = ReturnType<typeof useVoice>['messages'][number];

// Update MemoizedMessage with forwardRef
const MemoizedMessage = React.memo(
  forwardRef<HTMLDivElement, { msg: VoiceMessage; index: number }>(
    ({ msg, index }, ref) => {
      if (!(msg.type === "user_message" || msg.type === "assistant_message")) {
        return null;
      }

      return (
        <motion.div
          ref={ref}
          key={`${msg.type}-${index}`}
          className={cn(
            "w-[80%]",
            "bg-card",
            "border border-border rounded",
            "text-card-foreground",
            msg.type === "user_message" ? "ml-auto" : ""
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
        >
          <div className={"text-xs capitalize font-medium leading-none opacity-50 pt-4 px-3"}>
            {msg.message.role}
          </div>
          <div className={"pb-3 px-3"}>{msg.message.content}</div>
          <Expressions values={msg.models.prosody?.scores} />
        </motion.div>
      );
    }
  ),
  (prev, next) => isEqual(prev.msg, next.msg) && prev.index === next.index
);

// Type casting for display name
(MemoizedMessage as unknown as { displayName: string }).displayName = "MemoizedMessage";

// Main component remains the same
const Messages = forwardRef<ComponentRef<typeof motion.div>, Record<never, never>>(
  function Messages(_, ref) {
    const { messages } = useVoice();

    const memoizedMessages = useMemo(
      () => messages.map((msg, index) => ({ msg, index })),
      [messages]
    );

    return (
      <motion.div
        layoutScroll
        className={"grow rounded-md overflow-auto p-4"}
        ref={ref}
      >
        <motion.div
          data-component="messages"
          className={"max-w-2xl mx-auto w-full flex flex-col gap-4 pb-24"}
        >
          <AnimatePresence mode={"popLayout"}>
            {memoizedMessages.map(({ msg, index }) => (
              <MemoizedMessage key={`${msg.type}-${index}`} msg={msg} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }
);

export default Messages;