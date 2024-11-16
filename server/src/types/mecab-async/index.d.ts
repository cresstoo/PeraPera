declare module 'mecab-async' {
  type MecabFeatures = [
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

  interface MecabWord {
    surface: string;    // 表层形式
    feature: string;    // 特征字符串
    pos: string;        // 词性
    pos1: string;       // 词性细分类1
    pos2: string;       // 词性细分类2
    pos3: string;       // 词性细分类3
    conjugation: string;// 活用形式
    baseform: string;   // 基本形
    reading: string;    // 读音
  }

  interface Analysis {
    topic: boolean;          // 主题（は）
    subject: boolean;        // 主语（が）
    verbEnding: boolean;     // 动词结尾
    adjectiveEnding: boolean;// 形容词结尾
    verbConjugation: boolean;// 动词活用
    period: boolean;         // 句点
  }

  interface AnalyzeResult {
    isValid: boolean;
    grammarScore: number;
    details: string[];
    words: MecabWord[];
    analysis: Analysis;
  }

  class MeCab {
    parse(text: string, callback: (error: Error | null, result: MecabFeatures[]) => void): void;
    parseSync(text: string): MecabFeatures[];
    wakachi(text: string, callback: (error: Error | null, result: string[]) => void): void;
    wakachiSync(text: string): string[];
  }

  export = MeCab;
} 