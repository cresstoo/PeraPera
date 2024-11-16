import express from 'express';
import cors from 'cors';
import MeCab from 'mecab-async';

const app = express();
const mecab = new MeCab();

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    mecab.parse(text, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const words = result.map(([surface, pos, pos1, pos2, pos3, conj1, conj2, baseform, reading]) => ({
          surface,
          feature: [pos, pos1, pos2, pos3, conj1, conj2].filter(x => x !== '*').join(','),
          pos,
          pos1,
          baseform: baseform === '*' ? surface : baseform,
          reading: reading === '*' ? surface : reading
        }));

        // 分析语法结构
        const hasVerb = words.some(word => word.pos === '動詞');
        const hasEndParticle = words.some(word => 
          word.pos === '助詞' && word.pos1 === '終助詞'
        );
        const lastWord = words[words.length - 1];
        const hasValidEnding = lastWord && (
          lastWord.pos === '動詞' || 
          lastWord.pos === '助動詞' ||
          lastWord.pos === '助詞'
        );

        // 计算语法得分
        const grammarScore = [
          hasVerb ? 30 : 0,
          hasEndParticle ? 20 : 0,
          hasValidEnding ? 50 : 0
        ].reduce((a, b) => a + b, 0);

        res.json({
          isValid: grammarScore >= 60,
          grammarScore,
          details: words.map(word => `${word.surface}: ${word.feature}`),
          words
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('MeCab服务运行在 http://localhost:3001');
}); 