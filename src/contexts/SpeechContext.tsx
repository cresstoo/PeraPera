import { createContext, useContext, useState } from 'react';

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: string;
  isCorrect: boolean;
  isComplete: boolean;
  grammarInfo: {
    pos: string;
    reading: string;
    baseform: string;
  };
}

export interface AssessmentResult {
  text: string;
  words: WordAssessment[];
  totalScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  grammarScore: number;
  isComplete: boolean;
  expectedText: string;
  comments: string[];
}

interface RealtimeText {
  text: string;
}

interface SpeechContextType {
  realtimeText: RealtimeText | null;
  setRealtimeText: (text: RealtimeText | null) => void;
  assessmentResult: AssessmentResult | null;
  setAssessmentResult: (result: AssessmentResult | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
}

const SpeechContext = createContext<SpeechContextType | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [realtimeText, setRealtimeText] = useState<RealtimeText | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  return (
    <SpeechContext.Provider
      value={{
        realtimeText,
        setRealtimeText,
        assessmentResult,
        setAssessmentResult,
        isProcessing,
        setIsProcessing,
        audioBlob,
        setAudioBlob,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
} 