import express, { Request, Response } from 'express';
import cors from 'cors';
import MeCab = require('mecab-async');
import { GrammarService } from './services/grammarService';
import type { MecabFeatures, GrammarAnalysis, GrammarScore } from './types';

const app = express();
const mecab = new MeCab();

app.use(cors());
app.use(express.json());

interface MecabWord {
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

interface AnalyzeResponse {
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
  subScores?: {
    structure: number;
    predicate: number;
    particles: number;
    wordOrder: number;
    styleConsistency?: number;
  };
  errors?: {
    modifierErrors?: string[];
    particleErrors?: string[];
    styleErrors?: string[];
  };
}

app.post('/analyze', async (req: Request, res: Response<AnalyzeResponse>) => {
  const { text } = req.body;
  
  mecab.parse(text, (err: Error | null, result: MecabFeatures[]) => {
    if (err) {
      res.status(500).json({
        isValid: false,
        grammarScore: 0,
        details: [err.message],
        words: [],
        analysis: {
          topic: false,
          subject: false,
          verbEnding: false,
          verbConjugation: false,
          period: false
        }
      });
      return;
    }

    // 使用 MecabWord 映射
    const words = result.map(([surface, pos, pos1, pos2, pos3, conj1, conj2, baseform, reading]) => ({
      surface,
      feature: [pos, pos1, pos2, pos3, conj1, conj2].filter(x => x !== '*').join(','),
      pos,
      pos1,
      pos2,
      pos3,
      conjugation: conj1,
      baseform: baseform === '*' ? surface : baseform,
      reading: reading === '*' ? surface : reading
    }));

    // 使用 GrammarService 进行分析和评分
    const grammarAnalysis = GrammarService.analyzeGrammar(result);
    const grammarScore = GrammarService.calculateScore(result, grammarAnalysis);

    // 转换为 API 响应格式
    const response: AnalyzeResponse = {
      isValid: grammarScore.total >= 60,
      grammarScore: grammarScore.total,
      details: [
        ...grammarScore.details,
        ...words.map(word => `${word.surface}: ${word.feature}`)
      ],
      words,
      analysis: {
        topic: grammarAnalysis.structure.hasTopic,
        subject: grammarAnalysis.structure.hasSubject,
        verbEnding: grammarAnalysis.predicate.type !== null,
        verbConjugation: grammarAnalysis.predicate.form.tense !== null,
        period: grammarAnalysis.wordOrder.isValid
      },
      // 添加子项分数
      subScores: {
        structure: grammarScore.structure,
        predicate: grammarScore.predicate,
        particles: grammarScore.particles,
        wordOrder: grammarScore.wordOrder,
        styleConsistency: grammarScore.subScores?.styleConsistency
      },
      // 添加错误信息
      errors: grammarScore.errors
    };

    res.json(response);
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 