// 直接在这里定义 MecabFeatures
export type MecabFeatures = [
  surface: string,    // 表层形式
  pos: string,       // 词性
  pos1: string,      // 词性细分类1
  pos2: string,      // 词性细分类2
  pos3: string,      // 词性细分类3
  conj1: string,     // 活用类型
  conj2: string,     // 活用形式
  baseform: string,  // 基本形
  reading: string,   // 读音
  pronunciation: string  // 发音
];

// JLPT API 相关类型
export interface JLPTWord {
  word: string;
  meaning: string;
  furigana: string;
  romaji: string;
  level: number;
}

export interface JLPTResponse {
  total: number;
  offset: number;
  limit: number;
  words: JLPTWord[];
}

// MeCab 分析结果类型
export interface MecabWord {
  surface: string;
  pos: string;
  pos1: string;
  pos2: string;
  pos3: string;
  conj1: string;
  conj2: string;
  baseform: string;
  reading: string;
  pronunciation: string;
}

export interface MecabAnalysisResult {
  words: MecabWord[];
  grammarScore: number;
}

// 语法分析相关类型
export interface GrammarAnalysis {
  structure: {
    hasSubject: boolean;
    hasTopic: boolean;
    hasObject: boolean;
    hasIndirectObject: boolean;
    hasPredicate: boolean;
    hasModifier: boolean;
  };
  predicate: {
    type: 'verb' | 'adjective' | 'copula' | null;
    form: {
      tense: 'present' | 'past' | null;
      polarity: 'positive' | 'negative';
      style: 'plain' | 'polite' | null;
      aspect: 'simple' | 'progressive' | 'perfect' | null;
    };
  };
  particles: {
    topic: string[];
    subject: string[];
    object: string[];
    indirect: string[];
    direction: string[];
    other: string[];
  };
  wordOrder: {
    isValid: boolean;
    errors: string[];
  };
}

export interface GrammarScore {
  total: number;
  structure: number;
  predicate: number;
  particles: number;
  wordOrder: number;
  details: string[];
  subScores?: {
    modifierPosition?: number;
    particleMatching?: number;
    styleConsistency?: number;
  };
  errors?: {
    modifierErrors?: string[];
    particleErrors?: string[];
    styleErrors?: string[];
  };
}
  