interface JLPTWord {
  word: string;        // 单词
  reading: string;     // 读音
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';  // JLPT等级
  pos: string;         // 词性
  frequency?: number;  // 使用频率
}

// 基础词汇数据
export const jlptVocabulary: JLPTWord[] = [
  {
    word: 'おはよう',
    reading: 'おはよう',
    level: 'N5',
    pos: '挨拶',
    frequency: 100
  },
  // ... 更多词汇
]; 