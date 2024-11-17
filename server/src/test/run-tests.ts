import { GrammarService } from '../services/grammarService';
import MeCab from 'mecab-async';

const mecab = new MeCab();

async function runTest(testCase: any) {
  return new Promise((resolve, reject) => {
    mecab.parse(testCase.text, (err, result) => {
      if (err) reject(err);
      
      const analysis = GrammarService.analyzeGrammar(result);
      const score = GrammarService.calculateScore(result, analysis);
      
      resolve({
        text: testCase.text,
        expected: testCase.expect,
        actual: {
          analysis,
          score
        }
      });
    });
  });
}

async function runAllTests() {
  // 运行所有测试用例
  const allTests = [
    ...basicSentenceTests,
    ...modifierTests,
    ...styleTests,
    ...complexTests,
    ...errorTests
  ];

  for (const test of allTests) {
    const result = await runTest(test);
    console.log('测试结果:', result);
  }
} 