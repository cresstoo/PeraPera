"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammarService_1 = require("../services/grammarService");
const mecab_async_1 = __importDefault(require("mecab-async"));
const mecab = new mecab_async_1.default();
async function runTest(testCase) {
    return new Promise((resolve, reject) => {
        mecab.parse(testCase.text, (err, result) => {
            if (err)
                reject(err);
            const analysis = grammarService_1.GrammarService.analyzeGrammar(result);
            const score = grammarService_1.GrammarService.calculateScore(result, analysis);
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
