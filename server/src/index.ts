import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import MeCab = require('mecab-async');
import { GrammarService } from './services/grammarService';
import type { MecabFeatures, GrammarAnalysis, GrammarScore } from './types';
import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { UploadedFile } from 'express-fileupload';

const app = express();
const mecab = new MeCab();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

interface AnalyzeResponse {
  isValid: boolean;
  grammarScore: number;
  details: string[];
  words: MecabFeatures[];
  analysis: {
    topic: boolean;
    subject: boolean;
    verbEnding: boolean;
    verbConjugation: boolean;
    period: boolean;
  };
  subScores?: {
    structure: number;
    predicate: number;
    particles: number;
    wordOrder: number;
    styleConsistency?: number;
  };
  errors?: {
    modifierErrors?: string[];
    particleErrors?: string[];
    styleErrors?: string[];
  };
}

interface TranscribeRequest extends Request {
  files?: {
    audio?: UploadedFile;
  };
}

app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('[Server] 分析文本:', text);
    
    const result = await promisify(mecab.parse.bind(mecab))(text) as MecabFeatures[];
    console.log('[Server] MeCab分析结果:', result);
    
    // 先进行语法分析
    const grammarAnalysis = GrammarService.analyzeGrammar(result);
    console.log('[Server] 语法分析结果:', grammarAnalysis);
    
    // 然后计算分数
    const scores = GrammarService.calculateScore(result, grammarAnalysis);
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
  } catch (error: any) {
    console.error('[Server] 分析错误:', error);
    res.status(500).json({ 
      isValid: false, 
      error: error.message || '未知错误'
    });
  }
});

const handleTranscribe: RequestHandler = async (req, res) => {
  try {
    const audioFile = req.files?.audio as UploadedFile | undefined;
    if (!audioFile) {
      return res.status(400).json({ error: '没有收到音频文件' });
    }

    // 保存音频文件
    const tempPath = `/tmp/audio-${Date.now()}.webm`;
    await audioFile.mv(tempPath);

    // 调用 Whisper 进行识别
    const whisper = spawn('whisper', [
      tempPath,
      '--language', 'ja',
      '--model', 'small',  // 使用小模型以提高速度
      '--output_format', 'json'
    ]);

    let output = '';
    whisper.stdout.on('data', (data) => {
      output += data;
    });

    await new Promise((resolve, reject) => {
      whisper.on('close', (code) => {
        if (code === 0) resolve(code);
        else reject(new Error(`Whisper 识别失败: ${code}`));
      });
    });

    // 清理临时文件
    fs.unlinkSync(tempPath);

    // 解析结果
    const result = JSON.parse(output);
    res.json({
      text: result.text,
      segments: result.segments
    });

  } catch (error) {
    console.error('语音识别失败:', error);
    res.status(500).json({ error: '语音识别失败' });
  }
};

app.post('/transcribe', handleTranscribe);

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 