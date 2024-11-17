// 基本句型测试用例
const basicSentenceTests = [
  {
    text: '私は学生です',  // 最基本的「は」句型
    expect: {
      structure: true,    // 应该检测到主题和谓语
      style: 'polite',    // 敬体
      particles: ['は'],  // 基本助词
      scores: {
        total: 85,        // 期望总分
        structure: 35,    // 结构分（主题+谓语完整）
        predicate: 20,    // 谓语分（简单谓语）
        particles: 20,    // 助词分（基本助词使用正确）
        wordOrder: 10     // 语序分（基本语序正确）
      }
    }
  },
  {
    text: '本を読みます',  // 基本的「を」句型
    expect: {
      object: true,      // 应该检测到宾语
      particles: ['を'],  // 宾语助词
      predicate: 'verb', // 动词谓语
      scores: {
        total: 90,       // 期望总分
        structure: 35,   // 结构分（宾语+谓语完整）
        predicate: 25,   // 谓语分（动词谓语）
        particles: 20,   // 助词分（宾语助词使用正确）
        wordOrder: 10    // 语序分（基本语序正确）
      }
    }
  },
  {
    text: '猫が魚を食べる',  // 「が」+「を」句型
    expect: {
      subject: true,     // 主语
      object: true,      // 宾语
      style: 'plain',    // 简体
      scores: {
        total: 95,       // 期望总分
        structure: 35,   // 结构分（主语+宾语+谓语完整）
        predicate: 25,   // 谓语分（动词谓语）
        particles: 25,   // 助词分（主语+宾语助词使用正确）
        wordOrder: 10    // 语序分（基本语序正确）
      }
    }
  }
];

// 运行测试并显示对比结果
async function runGrammarTests() {
  for (const test of basicSentenceTests) {
    console.log(`\n测试句子: ${test.text}`);
    console.log('期望得分:', test.expect.scores);
    
    // 获取实际得分
    const result = await fetch('http://localhost:3001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: test.text })
    }).then(res => res.json());

    console.log('实际得分:', {
      total: result.grammarScore,
      structure: result.subScores.structure,
      predicate: result.subScores.predicate,
      particles: result.subScores.particles,
      wordOrder: result.subScores.wordOrder
    });

    // 显示得分差异
    console.log('得分差异:', {
      total: result.grammarScore - test.expect.scores.total,
      structure: result.subScores.structure - test.expect.scores.structure,
      predicate: result.subScores.predicate - test.expect.scores.predicate,
      particles: result.subScores.particles - test.expect.scores.particles,
      wordOrder: result.subScores.wordOrder - test.expect.scores.wordOrder
    });

    // 显示评价详情
    console.log('评价详情:', result.details);
  }
}

// 运行测试
runGrammarTests().catch(console.error);