interface TestCase {
  text: string;
  expect: {
    pronunciation: {
      total: number;
      accuracy: number;
      fluency: number;
      completeness: number;
    };
    grammar: {
      total: number;
      structure: number;
      predicate: number;
      particles: number;
      wordOrder: number;
    };
  };
}

const testCases: TestCase[] = [
  {
    text: '私は学生です',  // 基本句型
    expect: {
      pronunciation: {
        total: 85,       // 期望发音总分
        accuracy: 85,    // 发音准确度
        fluency: 90,     // 流畅度
        completeness: 95 // 完整性
      },
      grammar: {
        total: 85,       // 期望语法总分
        structure: 35,   // 结构分
        predicate: 20,   // 谓语分
        particles: 20,   // 助词分
        wordOrder: 10    // 语序分
      }
    }
  },
  {
    text: '今日は天気がいいですね',  // 天气句型
    expect: {
      pronunciation: {
        total: 90,
        accuracy: 88,
        fluency: 92,
        completeness: 95
      },
      grammar: {
        total: 90,
        structure: 35,
        predicate: 25,
        particles: 20,
        wordOrder: 10
      }
    }
  },
  {
    text: '図書館で本を読んでいます',  // 进行时
    expect: {
      pronunciation: {
        total: 85,
        accuracy: 85,
        fluency: 85,
        completeness: 90
      },
      grammar: {
        total: 95,
        structure: 35,
        predicate: 25,
        particles: 25,
        wordOrder: 10
      }
    }
  },
  {
    text: '私は本読む',  // 缺少助词「を」
    expect: {
      pronunciation: {
        total: 90,       // 发音优秀
        accuracy: 92,    // 音素准确
        fluency: 88,     // 流畅度高
        completeness: 95 // 完整性好
      },
      grammar: {
        total: 40,       // 语法不及格
        structure: 15,   // 只有主题标记
        predicate: 15,   // 谓语存在但缺少必要助词
        particles: 5,    // 助词使用不完整
        wordOrder: 5     // 基本语序勉强可以
      }
    }
  },
  {
    text: '学生です私',  // 语序完全错误
    expect: {
      pronunciation: {
        total: 95,
        accuracy: 95,
        fluency: 95,
        completeness: 95
      },
      grammar: {
        total: 30,
        structure: 10,   // 结构混乱
        predicate: 15,   // 谓语位置错误
        particles: 0,    // 缺少必要助词
        wordOrder: 5     // 语序错误
      }
    }
  },
  {
    text: '本が食べます',  // 语义错误（书不能吃）但语法形式正确
    expect: {
      pronunciation: {
        total: 92,
        accuracy: 90,
        fluency: 94,
        completeness: 95
      },
      grammar: {
        total: 70,       // 形式上基本正确
        structure: 25,   // 主语+谓语结构存在
        predicate: 25,   // 谓语形式正确
        particles: 15,   // 助词使用正确
        wordOrder: 5     // 语序正确
      }
    }
  },
  {
    text: '私は学生だですよ',  // 敬体简体混用
    expect: {
      pronunciation: {
        total: 88,
        accuracy: 90,
        fluency: 85,
        completeness: 90
      },
      grammar: {
        total: 50,
        structure: 20,   // 基本结构存在
        predicate: 10,   // 谓语形式错误
        particles: 15,   // 助词使用正确
        wordOrder: 5     // 语序基本正确
      }
    }
  }
];

// 运行测试
async function runTests() {
  for (const test of testCases) {
    console.log(`\n测试句子: ${test.text}`);
    console.log('期望得分:', {
      pronunciation: test.expect.pronunciation,
      grammar: test.expect.grammar
    });

    // 获取实际得分
    const result = await fetch('http://localhost:3001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: test.text })
    }).then(res => res.json());

    // 显示得分对比
    console.log('实际得分:', {
      pronunciation: {
        total: result.pronunciationScore,
        accuracy: result.accuracyScore,
        fluency: result.fluencyScore,
        completeness: result.completenessScore
      },
      grammar: {
        total: result.grammarScore,
        structure: result.subScores.structure,
        predicate: result.subScores.predicate,
        particles: result.subScores.particles,
        wordOrder: result.subScores.wordOrder
      }
    });

    // 显示得分差异
    console.log('得分差异:', {
      pronunciation: {
        total: result.pronunciationScore - test.expect.pronunciation.total,
        accuracy: result.accuracyScore - test.expect.pronunciation.accuracy,
        fluency: result.fluencyScore - test.expect.pronunciation.fluency,
        completeness: result.completenessScore - test.expect.pronunciation.completeness
      },
      grammar: {
        total: result.grammarScore - test.expect.grammar.total,
        structure: result.subScores.structure - test.expect.grammar.structure,
        predicate: result.subScores.predicate - test.expect.grammar.predicate,
        particles: result.subScores.particles - test.expect.grammar.particles,
        wordOrder: result.subScores.wordOrder - test.expect.grammar.wordOrder
      }
    });

    // 显示评价详情
    console.log('评价详情:', result.details);
  }
}

runTests().catch(console.error); 