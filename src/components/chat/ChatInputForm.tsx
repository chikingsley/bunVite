"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat/chat-input";
import { MagnetizeButton } from "@/components/chat/magnetize-button";
import { ArrowRight, Mic, Paperclip } from "lucide-react";
import { cn } from "@/utils";

// Add proper types for Web Speech API
declare global {
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
    interpretation: unknown;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
    onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface ChatInputFormProps {
  onSubmit?: (text: string) => void;
  onStartCall?: () => void;
}

export function ChatInputForm({ onSubmit, onStartCall }: ChatInputFormProps) {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsListening(false);
  };

  const handleMicClick = async () => {
    if (isListening) {
      stopRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setIsListening(true);

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.onerror = () => {
        stopRecognition();
      };

      recognition.onend = () => {
        stopRecognition();
      };
      
      recognition.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      stopRecognition();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = transcript || inputValue;
    if (text.trim() && onSubmit) {
      onSubmit(text);
      setTranscript("");
      setInputValue("");
    }
  };

  return (
    <div className="flex w-full max-w-3xl">
      <form 
        className="relative w-full rounded-lg border bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring p-4"
        onSubmit={handleSubmit}
      >
        <ChatInput
          value={transcript || inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message or use your microphone..."
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
        />

        <div className="flex items-center p-3 pt-0">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled
            className="hover:bg-muted text-muted-foreground"
          >
            <Paperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleMicClick}
            className={cn(
              "hover:bg-muted",
              isListening && "text-red-500 animate-pulse"
            )}
          >
            <Mic className="size-4" />
            <span className="sr-only">Use Microphone</span>
          </Button>

          <MagnetizeButton 
            className="ml-auto gap-1.5"
            onClick={onStartCall}
            type="button"
          >
            Start Call
            <ArrowRight className="size-3.5" />
          </MagnetizeButton>
        </div>
      </form>
    </div>
  );
}