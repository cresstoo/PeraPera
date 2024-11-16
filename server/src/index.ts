import express, { Request, Response } from 'express';
import cors from 'cors';
import MeCab from 'mecab-async';

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
}

app.post('/analyze', async (req: Request, res: Response<AnalyzeResponse>) => {
  const { text } = req.body;
  
  mecab.parse(text, (err, result) => {
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

    // 语法分析
    const analysis = {
      topic: words.some((word, i) => 
        (word.pos === '名詞' || word.pos === '代名詞') && 
        words[i + 1]?.surface === 'は'
      ),
      subject: words.some((word, i) => 
        (word.pos === '名詞' || word.pos === '代名詞') && 
        words[i + 1]?.surface === 'が'
      ),
      verbEnding: (() => {
        const lastContentWord = words.filter(w => w.pos !== '記号')[words.length - 1];
        return lastContentWord && (
          lastContentWord.pos === '動詞' ||
          (lastContentWord.pos === '助動詞' && ['です', 'ます'].includes(lastContentWord.surface))
        );
      })(),
      verbConjugation: words.some(word => 
        word.pos === '動詞' && 
        ['連用形', '未然形', '連体形'].includes(word.conjugation || '')
      ),
      period: words[words.length - 1]?.surface === '。'
    };

    // 计算语法得分
    const scores = {
      structure: (analysis.topic || analysis.subject) ? 40 : 0,  // 主题/主语
      predicate: analysis.verbEnding ? 60 : 0  // 谓语
    };

    const grammarScore = Object.values(scores).reduce((a, b) => a + b, 0);

    res.json({
      isValid: grammarScore >= 60,
      grammarScore,
      details: words.map(word => `${word.surface}: ${word.feature}`),
      words,
      analysis
    });
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 