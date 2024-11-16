export interface MecabWord {
  surface: string;
  feature: string;
  pos: string;
  pos1: string;
  pos2: string;
  pos3: string;
  conjugation: string;
  baseform: string;
  reading: string;
}

export interface MecabAnalysisResult {
  isValid: boolean;
  grammarScore: number;
  details: string[];
  words: MecabWord[];
  analysis: {
    topic: boolean;
    subject: boolean;
    verbEnding: boolean;
    verbConjugation: boolean;
    period: boolean;
  };
} 