import { JLPTService } from './jlptService';
import type { MecabFeatures } from '../types';

const mapLevelToString = (level: number | null): string => {
  if (level === null) return 'Unknown';
  switch(level) {
    case 1: return 'N1';
    case 2: return 'N2';
    case 3: return 'N3';
    case 4: return 'N4';
    case 5: return 'N5';
    default: return 'Unknown';
  }
};

export class VocabularyService {
  static async evaluateLevel(words: MecabFeatures[]): Promise<{
    level: string;
    complexity: number;
    details: string[];
    jlptAnalysis?: {
      averageLevel: number;
      distribution: Record<number, number>;
      details: Array<{
        word: string;
        level: number | null;
      }>;
    };
  }> {
    // 提取基本形式的单词
    const baseWords = words.map(word => word[7]); // baseform

    // 获取 JLPT 分析
    const jlptAnalysis = await JLPTService.analyzeSentenceLevel(baseWords);

    // 计算词汇水平
    const levelCounts = {
      'N5': 0, 'N4': 0, 'N3': 0, 'N2': 0, 'N1': 0, 'Unknown': 0
    };
    jlptAnalysis.details.forEach(word => {
      levelCounts[mapLevelToString(word.level) as keyof typeof levelCounts]++;
    });

    // 计算词汇复杂度得分
    const calculateComplexityScore = (levelCounts: Record<string, number>, totalWords: number): number => {
      const weights = {
        'N1': 100,
        'N2': 80,
        'N3': 60,
        'N4': 40,
        'N5': 20,
        'Unknown': 10
      };

      let weightedSum = 0;
      for (const [level, count] of Object.entries(levelCounts)) {
        weightedSum += weights[level as keyof typeof weights] * count;
      }

      return Math.min(100, weightedSum / totalWords);
    };

    const totalWords = Object.values(levelCounts).reduce((a, b) => a + b, 0);
    const complexity = calculateComplexityScore(levelCounts, totalWords);

    return {
      level: Object.entries(levelCounts)
        .sort(([,a], [,b]) => b - a)[0][0],
      complexity: Math.min(100, complexity / words.length),
      details: [
        `包含 N1:${levelCounts.N1}, N2:${levelCounts.N2}, N3:${levelCounts.N3}, N4:${levelCounts.N4}, N5:${levelCounts.N5} 词汇`,
        `平均JLPT等级: N${jlptAnalysis.averageLevel.toFixed(1)}`
      ],
      jlptAnalysis
    };
  }
} 