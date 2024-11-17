interface CorpusEntry {
  pattern: string;     // 语法模式
  examples: string[];  // 示例句子
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  frequency: number;   // 使用频率
}

export const japaneseCorpus: CorpusEntry[] = [
  {
    pattern: '[名詞]は[名詞]です',
    examples: [
      '私は学生です',
      '彼は先生です'
    ],
    level: 'N5',
    frequency: 100
  },
  // ... 更多语料
]; 