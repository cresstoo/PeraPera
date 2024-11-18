"use strict";
// 基本句型测试用例
const basicSentenceTests = [
    {
        text: '私は学生です',
        expect: {
            structure: true,
            style: 'polite',
            particles: ['は'],
            scores: {
                total: 85,
                structure: 35,
                predicate: 20,
                particles: 20,
                wordOrder: 10 // 语序分（基本语序正确）
            }
        }
    },
    {
        text: '本を読みます',
        expect: {
            object: true,
            particles: ['を'],
            predicate: 'verb',
            scores: {
                total: 90,
                structure: 35,
                predicate: 25,
                particles: 20,
                wordOrder: 10 // 语序分（基本语序正确）
            }
        }
    },
    {
        text: '猫が魚を食べる',
        expect: {
            subject: true,
            object: true,
            style: 'plain',
            scores: {
                total: 95,
                structure: 35,
                predicate: 25,
                particles: 25,
                wordOrder: 10 // 语序分（基本语序正确）
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
