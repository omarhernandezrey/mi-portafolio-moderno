"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextOptions {
  language?: string;
  onResult?: (text: string) => void;
  onEnd?: () => void;
  silenceTimeout?: number;
}

// Interfaces para Web Speech API
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export default function useSpeechToText({
  language = 'es-CO',
  onResult,
  onEnd,
  silenceTimeout = 4000
}: UseSpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  // @ts-expect-error: Web Speech API types not standard in all environments
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // @ts-expect-error: webkit prefix
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (onEnd) onEnd();
    }
  }, [isListening, onEnd]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (onResult) onResult(currentTranscript);

        // Reset silence timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          stopListening();
        }, silenceTimeout);
      };

      recognitionRef.current.onerror = (event: Event) => {
        // @ts-expect-error: error property exists on SpeechRecognitionErrorEvent
        console.error('Speech recognition error', event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };
    }
  }, [isListening, onResult, onEnd, stopListening, silenceTimeout]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening
  };
}
