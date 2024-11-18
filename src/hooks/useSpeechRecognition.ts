import { useState, useCallback, useRef, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { useSpeech } from '../contexts/SpeechContext';

interface MecabWord {
  0: string;  // surface
  1: string;  // pos
  2: string;  // pos1
  3: string;  // pos2
  4: string;  // pos3
  5: string;  // conj1
  6: string;  // conj2
  7: string;  // baseform
  8: string;  // reading
  9: string;  // pronunciation
}

interface MecabAnalysisResult {
  isValid: boolean;
  grammarScore: number;
  details: string[];
  words: MecabWord[];
  analysis: {
    topic: boolean;
    subject: boolean;
    verbEnding: boolean;
    verbConjugation: boolean;
    period: boolean;
  };
  subScores: {
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

interface AzureWord {
  Word: string;
  Offset: number;
  Duration: number;
  ErrorType?: string;
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
  Phonemes?: Array<{
    Text: string;
    Duration: number;
    Offset: number;
  }>;
}

interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: string;
  isCorrect: boolean;
  isComplete: boolean;
  grammarInfo: {
    pos: string;
    reading: string;
    baseform: string;
  };
}

// 定义重要词的词性列表
const IMPORTANT_POS = [
  '名詞',        // 名词
  '動詞',        // 动词
  '形容詞',      // 形容词（い形容词）
  '形容動詞',    // 形容动词（な形容词）
  '副詞',        // 副词
  '連体詞'       // 连体词
];

// 权重定义
const WEIGHTS = {
  pronunciation: 0.7,  // 发音占70%
  grammar: 0.3        // 语法占30%
};

// 在文件顶部添加新的评分权重常量
const WORD_WEIGHTS = {
  名詞: 1.2,      // 名词权重更高
  動詞: 1.3,      // 动词最重要
  形容詞: 1.1,    // 形容词次之
  助詞: 0.8,      // 助词权重较低
  助動詞: 0.8,    // 助动词权重较低
  副詞: 1.0,      // 副词保持标准权重
  接続詞: 0.9     // 连接词稍低
};

export function useSpeechRecognition() {
  const { setAudioBlob } = useSpeech();
  const { setRealtimeText, setAssessmentResult, setIsProcessing } = useSpeech();
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTextRef = useRef<string>('');

  const [scoreComparison, setScoreComparison] = useState<{
    custom: {
      total: number;
      accuracy: number;
      fluency: number;
      completeness: number;
    };
    azure: {
      pronScore: number;
      accuracyScore: number;
      fluencyScore: number;
      completenessScore: number;
    };
  } | null>(null);

  const startRealtimeRecognition = useCallback(async (targetText?: string) => {
    try {
      // 开始新录音前清理旧数据
      setAudioBlob(null);
      audioChunksRef.current = [];
      accumulatedTextRef.current = '';

      console.log('[Speech] 开始录音', { targetText });
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,         // 单声道
          sampleRate: 16000,       // 16kHz 采样率
          sampleSize: 16,          // 16位
          echoCancellation: false, // 禁用回声消除
          noiseSuppression: false, // 禁用噪声抑制
          autoGainControl: false   // 禁用自动增益
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const recordedBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm'
          });
          console.log('[Speech] 录音完成', { 
            size: recordedBlob.size, 
            type: recordedBlob.type
          });
          setAudioBlob(recordedBlob);
        } else {
          console.error('[Speech] 没有收集到音频数据');
        }
      };

      mediaRecorder.start(100);
      console.log('[Speech] 录音开始');

      // 2. 设置语音识别
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        import.meta.env.VITE_AZURE_SPEECH_KEY,
        import.meta.env.VITE_AZURE_SPEECH_REGION
      );

      // 基本配置
      speechConfig.speechRecognitionLanguage = 'ja-JP';
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;

      // 创建发音评估配置
      const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
        "",  // 未脚本化评估不需要参考文本
        sdk.PronunciationAssessmentGradingSystem.HundredMark,  // 百分制评分
        sdk.PronunciationAssessmentGranularity.Word,  // 单词级别评估
        true  // 启用误读计算
      );

      // 设置识别选项
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // 应用发音评估配置
      pronunciationAssessmentConfig.applyTo(recognizer);

      // 生成整体评价建议
      const generateComments = (
        pronunciationScore: number, 
        fluencyScore: number,
        wordScores: WordAssessment[]
      ): string[] => {
        const comments: string[] = [];

        // 发音准确度评价
        if (pronunciationScore >= 90) {
          comments.push('发音非常准确，音素清晰');
        } else if (pronunciationScore >= 70) {
          comments.push('发音基本准确，个别音素需要改进');
        } else {
          comments.push('发音需要加强练习，注意音素的准确性');
        }

        // 语速和流畅度评价
        if (fluencyScore >= 90) {
          comments.push('语速适中，表达流畅自然');
        } else if (fluencyScore >= 70) {
          comments.push('语速和停顿基本合理，可以更加流畅');
        } else {
          comments.push('需要提高语速的连贯性和流畅度');
        }

        // 整体表现评价
        const errorCount = wordScores.filter(w => w.accuracyScore < 60).length;
        if (errorCount === 0) {
          comments.push('整体表现优秀，继续保持');
        } else if (errorCount <= 2) {
          comments.push('整体表现良好，个别单词需要注意');
        } else {
          comments.push('建议多加练习，提高整体准确度');
        }

        return comments;
      };

      // 识别结果处理
      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          if (e.result.text) {
            try {
              // 获取当前识别的文本
              const currentText = e.result.text.trim();
              
              // 先更新累积文本
              accumulatedTextRef.current = accumulatedTextRef.current 
                ? accumulatedTextRef.current + ' ' + currentText 
                : currentText;

              // 设置实时文本
              setRealtimeText({ text: accumulatedTextRef.current });
              
              // 获取当前识别结果的 JSON
              const jsonResult = e.result.properties.getProperty(
                sdk.PropertyId.SpeechServiceResponse_JsonResult
              );
              const response = JSON.parse(jsonResult);
              
              // 使用累积的文本进行分析
              const mecabResult = await fetch('http://localhost:3001/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: accumulatedTextRef.current })  // 使用累积的文本
              }).then(res => res.json());

              // 处理当前识别结果
              if (response.NBest?.[0]) {
                const pronunciationAssessment = response.NBest[0].PronunciationAssessment;
                const words = response.NBest[0].Words || [];

                // 获取 Azure 的基础评分
                const azureScores = {
                  pronScore: pronunciationAssessment.PronScore,
                  accuracyScore: pronunciationAssessment.AccuracyScore,
                  fluencyScore: pronunciationAssessment.FluencyScore,
                  completenessScore: pronunciationAssessment.CompletenessScore
                };

                // 计算每个单词的得分
                const wordScores = mecabResult.words.map((word: MecabWord) => {
                  const surface = word[0];
                  const pos = word[1];
                  const reading = word[8];

                  const azureWord = words.find((w: AzureWord) => {
                    return w.Word === surface || 
                           w.Word.includes(surface) || 
                           surface.includes(w.Word);
                  });

                  let wordScore = 0;
                  if (azureWord) {
                    // 基础分数
                    wordScore = azureWord.AccuracyScore 
                      ? Math.round(azureWord.AccuracyScore * 100)
                      : Math.round(azureScores.accuracyScore * 100);

                    // 应用词性权重
                    const weight = WORD_WEIGHTS[pos as keyof typeof WORD_WEIGHTS] || 1.0;
                    wordScore = Math.min(100, Math.round(wordScore * weight));

                    // 特殊规则保持不变
                    if (surface.match(/[、。？！]/)) {
                      wordScore = 100;
                    }
                    else if (['助詞', '助動詞'].includes(pos)) {
                      wordScore = Math.max(wordScore, 85);
                    }
                    else if (pos === '名詞' && word[2] === '外来語') {
                      wordScore = Math.min(100, Math.round(wordScore * 1.1));
                    }
                  }

                  return {
                    word: surface,
                    accuracyScore: wordScore,
                    errorType: azureWord?.ErrorType || 'Missing',
                    isCorrect: wordScore >= 60,
                    isComplete: true,
                    grammarInfo: {
                      pos,
                      reading,
                      baseform: word[7]
                    }
                  };
                });

                // 计算发音得分（满分70分）
                const pronunciationScore = Math.round(
                  azureScores.pronScore * WEIGHTS.pronunciation
                );

                // 计算语法得分（满分30分）
                const grammarScore = Math.round(
                  mecabResult.grammarScore * WEIGHTS.grammar
                );

                // 计算最终总分（直接相加，满分100分）
                const finalScore = pronunciationScore + grammarScore;

                // 设置评估结果
                setAssessmentResult({
                  text: accumulatedTextRef.current,
                  words: wordScores,
                  totalScore: finalScore,  // 最终总分（发音70% + 语法30%）
                  pronunciationScore: azureScores.pronScore,  // 原始发音分（满分100）
                  accuracyScore: azureScores.accuracyScore,   // 原始准确度
                  fluencyScore: azureScores.fluencyScore,     // 原始流畅度
                  completenessScore: azureScores.completenessScore,  // 原始完整度
                  grammarScore: mecabResult.grammarScore,     // 原始语法分
                  isComplete: true,
                  expectedText: '',
                  comments: [
                    ...generateComments(azureScores.pronScore, azureScores.fluencyScore, wordScores),  // 使用原始分数生成评价
                    ...mecabResult.details
                  ]
                });

                // 保存对比结果
                setScoreComparison({
                  custom: {
                    total: finalScore,
                    accuracy: azureScores.accuracyScore,
                    fluency: azureScores.fluencyScore,
                    completeness: azureScores.completenessScore
                  },
                  azure: azureScores
                });

                // 打印对比结果
                console.log('[Score Comparison]', {
                  text: accumulatedTextRef.current,
                  pronunciation: {
                    azure: {
                      total: azureScores.pronScore,      // 原始发音总分（满分100）
                      accuracy: azureScores.accuracyScore,
                      fluency: azureScores.fluencyScore,
                      completeness: azureScores.completenessScore
                    },
                    custom: {
                      total: azureScores.pronScore,      // 保持原始分数
                      accuracy: azureScores.accuracyScore,
                      fluency: azureScores.fluencyScore,
                      completeness: azureScores.completenessScore
                    }
                  },
                  grammar: {
                    total: mecabResult.grammarScore,     // 原始语法分（满分100）
                    subScores: mecabResult.subScores,
                    details: mecabResult.details
                  },
                  finalScore  // 最终总分（发音70% + 语法30%）
                });
              }
            } catch (error) {
              console.error('分析失败:', error);
            }
          }
        }
      };

      // 4. 开始识别
      console.log('[Speech] 开始识别...');
      recognizer.startContinuousRecognitionAsync();

      // 保存 recognizer 实例
      recognizerRef.current = recognizer;

      // 5. 返回停止函数
      return async () => {
        try {
          console.log('[Speech] 执行停止函数');
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('[Speech] 音轨已停止:', track.kind);
          });

          if (recognizerRef.current) {
            // 使用正确的停止方法
            recognizerRef.current.stopContinuousRecognitionAsync(
              () => {
                console.log('[Speech] 识别停止成功');
                recognizerRef.current = null;
                setIsProcessing(false);
              },
              (err) => {
                console.error('[Speech] 识别停止失败:', err);
                setIsProcessing(false);
              }
            );
          }
        } catch (error) {
          console.error('[Speech] 停止过程出错:', error);
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('录音失败:', error);
      setIsProcessing(false);
      throw error;
    }
  }, [setRealtimeText, setAssessmentResult, setIsProcessing]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setAudioBlob(null);
      audioChunksRef.current = [];
    };
  }, []);

  return {
    startRealtimeRecognition,
  };
}

// 计算两个片假名字符串的差异程度（0-1之间，0表示完全相同，1表示完全不同）
const calculateDiffRatio = (str1: string, str2: string): number => {
  // 将片假名字符串转换为音素数组
  const phonemes1 = str1.match(/[ァ-ヴー]/g) || [];
  const phonemes2 = str2.match(/[ァ-ヴー]/g) || [];
  
  // 计算编辑距离
  const distance = levenshteinDistance(phonemes1, phonemes2);
  
  // 计算差异比例
  const maxLength = Math.max(phonemes1.length, phonemes2.length);
  return maxLength === 0 ? 1 : distance / maxLength;
};

// 计算编辑距离
const levenshteinDistance = (arr1: string[], arr2: string[]): number => {
  const matrix = Array(arr1.length + 1).fill(null).map(() => 
    Array(arr2.length + 1).fill(null)
  );

  for (let i = 0; i <= arr1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= arr2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= arr1.length; i++) {
    for (let j = 1; j <= arr2.length; j++) {
      const cost = arr1[i - 1] === arr2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 删除
        matrix[i][j - 1] + 1,      // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }

  return matrix[arr1.length][arr2.length];
};