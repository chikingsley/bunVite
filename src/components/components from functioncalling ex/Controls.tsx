"use client";
import { useVoice } from "@humeai/voice-react";

export default function Controls() {
  const { connect, disconnect, status } = useVoice();

  const handleConnect = () => {
    try {
      void connect();
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <button
      disabled={status.value === "connecting"}
      onClick={status.value === "connected" ? handleDisconnect : handleConnect}
    >
      {status.value === "connected" ? "End Session" : "Start Session"}
    </button>
  );
}
