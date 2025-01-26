import { ComponentRef, useEffect, useRef } from "react";
import { useVoice } from "@humeai/voice-react";
import Messages from "./Messages";
import { BottomControls } from "@/components/hume/BottomControls";

export default function Chat() {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const { messages } = useVoice();

  useEffect(() => {
    if (timeout.current) {
      window.clearTimeout(timeout.current);
    }

    timeout.current = window.setTimeout(() => {
      if (ref.current) {
        const scrollHeight = ref.current.scrollHeight;
        ref.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }, 200);

    return () => {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }
    };
  }, [messages]);

  return (
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden min-h-[500px]">
      <Messages ref={ref} />
      <BottomControls />
    </div>
  );
}
