"use strict";
const testCases = [
    {
        text: '私は学生です',
        expect: {
            pronunciation: {
                total: 85,
                accuracy: 85,
                fluency: 90,
                completeness: 95 // 完整性
            },
            grammar: {
                total: 85,
                structure: 35,
                predicate: 20,
                particles: 20,
                wordOrder: 10 // 语序分
            }
        }
    },
    {
        text: '今日は天気がいいですね',
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
        text: '図書館で本を読んでいます',
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
        text: '私は本読む',
        expect: {
            pronunciation: {
                total: 90,
                accuracy: 92,
                fluency: 88,
                completeness: 95 // 完整性好
            },
            grammar: {
                total: 40,
                structure: 15,
                predicate: 15,
                particles: 5,
                wordOrder: 5 // 基本语序勉强可以
            }
        }
    },
    {
        text: '学生です私',
        expect: {
            pronunciation: {
                total: 95,
                accuracy: 95,
                fluency: 95,
                completeness: 95
            },
            grammar: {
                total: 30,
                structure: 10,
                predicate: 15,
                particles: 0,
                wordOrder: 5 // 语序错误
            }
        }
    },
    {
        text: '本が食べます',
        expect: {
            pronunciation: {
                total: 92,
                accuracy: 90,
                fluency: 94,
                completeness: 95
            },
            grammar: {
                total: 70,
                structure: 25,
                predicate: 25,
                particles: 15,
                wordOrder: 5 // 语序正确
            }
        }
    },
    {
        text: '私は学生だですよ',
        expect: {
            pronunciation: {
                total: 88,
                accuracy: 90,
                fluency: 85,
                completeness: 90
            },
            grammar: {
                total: 50,
                structure: 20,
                predicate: 10,
                particles: 15,
                wordOrder: 5 // 语序基本正确
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
