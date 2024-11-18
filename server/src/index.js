"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const MeCab = require("mecab-async");
const grammarService_1 = require("./services/grammarService");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const app = (0, express_1.default)();
const mecab = new MeCab();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)());
app.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        console.log('[Server] 分析文本:', text);
        const result = await (0, util_1.promisify)(mecab.parse.bind(mecab))(text);
        console.log('[Server] MeCab分析结果:', result);
        // 先进行语法分析
        const grammarAnalysis = grammarService_1.GrammarService.analyzeGrammar(result);
        console.log('[Server] 语法分析结果:', grammarAnalysis);
        // 然后计算分数
        const scores = grammarService_1.GrammarService.calculateScore(result, grammarAnalysis);
        console.log('[Server] 评分结果:', scores);
        res.json({
            isValid: true,
            words: result,
            grammarScore: scores.total,
            details: scores.details,
            analysis: grammarAnalysis,
            subScores: {
                structure: scores.structure,
                predicate: scores.predicate,
                particles: scores.particles,
                wordOrder: scores.wordOrder
            }
        });
    }
    catch (error) {
        console.error('[Server] 分析错误:', error);
        res.status(500).json({
            isValid: false,
            error: error.message || '未知错误'
        });
    }
});
const handleTranscribe = async (req, res) => {
    var _a;
    try {
        const audioFile = (_a = req.files) === null || _a === void 0 ? void 0 : _a.audio;
        if (!audioFile) {
            return res.status(400).json({ error: '没有收到音频文件' });
        }
        // 保存音频文件
        const tempPath = `/tmp/audio-${Date.now()}.webm`;
        await audioFile.mv(tempPath);
        // 调用 Whisper 进行识别
        const whisper = (0, child_process_1.spawn)('whisper', [
            tempPath,
            '--language', 'ja',
            '--model', 'small',
            '--output_format', 'json'
        ]);
        let output = '';
        whisper.stdout.on('data', (data) => {
            output += data;
        });
        await new Promise((resolve, reject) => {
            whisper.on('close', (code) => {
                if (code === 0)
                    resolve(code);
                else
                    reject(new Error(`Whisper 识别失败: ${code}`));
            });
        });
        // 清理临时文件
        fs_1.default.unlinkSync(tempPath);
        // 解析结果
        const result = JSON.parse(output);
        res.json({
            text: result.text,
            segments: result.segments
        });
    }
    catch (error) {
        console.error('语音识别失败:', error);
        res.status(500).json({ error: '语音识别失败' });
    }
};
app.post('/transcribe', handleTranscribe);
app.listen(3001, () => {
    console.log('Server running on port 3001');
});
