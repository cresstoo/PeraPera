import MeCab from 'mecab-async';
import { promisify } from 'util';
import { GrammarService } from '../services/grammarService';

const mecab = new MeCab();

async function testGrammar() {
  const testCases = [
    'すみません。',
    '大丈夫です。',
    '私は学生です。',
    '私は図書館で本を読んでいます。',
    '友達に手紙を書いてあげました。',
    '昨日公園を散歩していた時、雨が降り始めました。',
    'この本は私が先週買ったものです。'
  ];

  for (const text of testCases) {
    try {
      console.log('\n=== 测试文本:', text, ' ===');
      
      const result = await promisify(mecab.parse.bind(mecab))(text);
      console.log('MeCab 分析结果:', result);
      
      const grammarAnalysis = GrammarService.analyzeGrammar(result);
      console.log('语法分析结果:', grammarAnalysis);
      
      const scores = GrammarService.calculateScore(result, grammarAnalysis);
      console.log('评分结果:', scores);
    } catch (error) {
      console.error('测试失败:', error);
    }
  }
}

// 运行测试
testGrammar(); 