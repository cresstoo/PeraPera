"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mecab_async_1 = __importDefault(require("mecab-async"));
const util_1 = require("util");
const grammarService_1 = require("../services/grammarService");
const mecab = new mecab_async_1.default();
async function testGrammar() {
    const testCases = [
        'すみません。',
        '大丈夫です。',
        '私は学生です。'
    ];
    for (const text of testCases) {
        try {
            console.log('\n=== 测试文本:', text, ' ===');
            const result = await (0, util_1.promisify)(mecab.parse.bind(mecab))(text);
            console.log('MeCab 分析结果:', result);
            const grammarAnalysis = grammarService_1.GrammarService.analyzeGrammar(result);
            console.log('语法分析结果:', grammarAnalysis);
            const scores = grammarService_1.GrammarService.calculateScore(result, grammarAnalysis);
            console.log('评分结果:', scores);
        }
        catch (error) {
            console.error('测试失败:', error);
        }
    }
}
// 运行测试
testGrammar();
