declare module 'mecab-async' {
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

  class MeCab {
    constructor();
    parse(text: string, callback: (error: Error | null, result: MecabFeatures[]) => void): void;
    parseSync(text: string): MecabFeatures[];
    wakachi(text: string, callback: (error: Error | null, result: string[]) => void): void;
    wakachiSync(text: string): string[];
  }

  export = MeCab;
} 