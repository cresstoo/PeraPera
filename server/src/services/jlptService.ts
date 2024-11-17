interface JLPTWord {
  word: string;
  meaning: string;
  furigana: string;
  romaji: string;
  level: number;
}

interface JLPTResponse {
  total: number;
  offset: number;
  limit: number;
  words: JLPTWord[];
}

export class JLPTService {
  private static BASE_URL = 'https://jlpt-vocab-api.vercel.app/api';
  private static cache: Map<string, JLPTWord> = new Map();

  // 获取单词信息（带缓存）
  static async getWordInfo(word: string): Promise<JLPTWord | null> {
    // 先检查缓存
    if (this.cache.has(word)) {
      return this.cache.get(word) || null;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/words?word=${encodeURIComponent(word)}`);
      if (!response.ok) return null;
      const data: JLPTResponse = await response.json();
      
      // 缓存结果
      if (data.words[0]) {
        this.cache.set(word, data.words[0]);
      }
      
      return data.words[0] || null;
    } catch (error) {
      console.error('获取JLPT单词信息失败:', error);
      return null;
    }
  }

  // 分析句子中词汇的JLPT等级分布
  static async analyzeSentenceLevel(words: string[]): Promise<{
    averageLevel: number;
    distribution: Record<number, number>;
    details: Array<{
      word: string;
      level: number | null;
      meaning?: string;
      furigana?: string;
    }>;
  }> {
    const wordDetails = await Promise.all(
      words.map(async word => {
        const info = await this.getWordInfo(word);
        return {
          word,
          level: info?.level || null,
          meaning: info?.meaning,
          furigana: info?.furigana
        };
      })
    );

    // 计算等级分布
    const distribution = wordDetails.reduce((acc, detail) => {
      if (detail.level) {
        acc[detail.level] = (acc[detail.level] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // 计算平均等级
    const validLevels = wordDetails
      .map(w => w.level)
      .filter((level): level is number => level !== null);
    
    const averageLevel = validLevels.length > 0
      ? validLevels.reduce((sum, level) => sum + level, 0) / validLevels.length
      : 0;

    return {
      averageLevel,
      distribution,
      details: wordDetails
    };
  }

  // 预加载常用词汇
  static async preloadCommonWords(): Promise<void> {
    try {
      // 预加载 N5 和 N4 的常用词
      for (const level of [5, 4]) {
        const response = await fetch(`${this.BASE_URL}/words/all?level=${level}`);
        if (!response.ok) continue;
        const data: JLPTResponse = await response.json();
        
        // 缓存所有词汇
        data.words.forEach(word => {
          this.cache.set(word.word, word);
        });
      }
      
      console.log('预加载JLPT常用词完成');
    } catch (error) {
      console.error('预加载JLPT词汇失败:', error);
    }
  }
} 