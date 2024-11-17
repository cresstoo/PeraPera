import { useState, useCallback, useRef, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { useSpeech } from '../contexts/SpeechContext';

interface MecabWord {
  surface: string;
  pos: string;
  reading: string;
  baseform: string;
}

interface MecabAnalysisResult {
  words: MecabWord[];
  grammarScore: number;
}

interface AzureWord {
  Word: string;
  Offset: number;
  Duration: number;
  ErrorType?: string;
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
}

export function useSpeechRecognition() {
  const { setAudioBlob } = useSpeech();
  const { setRealtimeText, setAssessmentResult, setIsProcessing } = useSpeech();
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTextRef = useRef<string>('');

  const startRealtimeRecognition = useCallback(async (targetText?: string) => {
    try {
      // 开始新录音前清理旧数据
      setAudioBlob(null);
      audioChunksRef.current = [];
      accumulatedTextRef.current = '';

      console.log('[Speech] 开始录音', { targetText });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('[Speech] 收到音频数据:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[Speech] 录音数据已保存, 块数:', audioChunksRef.current.length);
        if (audioChunksRef.current.length > 0) {
          const recordedBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm'
          });
          console.log('[Speech] 录音文件已生成', { 
            size: recordedBlob.size, 
            type: recordedBlob.type,
            chunks: audioChunksRef.current.length
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
      
      speechConfig.speechRecognitionLanguage = 'ja-JP';
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;
      
      // 设置识别选项，减少智能纠偏
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceResponse_PostProcessingOption,
        'NoAudioProcessing'  // 禁用音频后处理
      );

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // 设置发音评估配置
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        '',  // 初始时不设置引用文本
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true  // 启用误读计算
      );

      // 识别事件处理
      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          if (e.result.text) {
            // 累加新识别的文本
            accumulatedTextRef.current += e.result.text + ' ';
            setRealtimeText({
              text: accumulatedTextRef.current.trim()
            });

            const jsonResult = e.result.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult
            );
            const response = JSON.parse(jsonResult);
            
            if (response.NBest?.[0]) {
              const confidence = response.NBest[0].Confidence;
              const words = response.NBest[0].Words as AzureWord[] || [];
              
              // 获取所有评分
              const scores = [
                response.NBest[0].AccuracyScore || confidence * 100,
                response.NBest[0].FluencyScore || confidence * 100,
                response.NBest[0].CompletenessScore || confidence * 100
              ];

              // 按照分数从低到高排序
              scores.sort((a, b) => a - b);

              // 计算发音总分 - 使用官方建议的权重
              const pronunciationScore = Math.round(
                scores[0] * 0.6 +  // 最低分权重 60%
                scores[1] * 0.4    // 次低分权重 40%
              );

              // 修复 fullTextFluency 和 fullTextCompleteness 未定义的问题
              const fullTextFluency = response.NBest[0].FluencyScore || confidence * 100;
              const fullTextCompleteness = response.NBest[0].CompletenessScore || confidence * 100;

              try {
                const mecabResult = await fetch('http://localhost:3001/analyze', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: accumulatedTextRef.current.trim() })
                }).then(res => res.json()) as MecabAnalysisResult;

                // 单词评估
                const wordAssessments = mecabResult.words.map((word: MecabWord) => {
                  const azureWord = words.find(w => w.Word === word.surface);
                  const wordAccuracy = azureWord?.AccuracyScore || confidence * 100;
                  const weightedAccuracy = word.pos.includes('助詞') || word.surface.match(/[、。？！]/) 
                    ? wordAccuracy * 0.8 
                    : wordAccuracy;

                  return {
                    word: word.surface,
                    accuracyScore: Math.round(weightedAccuracy),
                    fluencyScore: Math.round(fullTextFluency),
                    completenessScore: Math.round(fullTextCompleteness),
                    errorType: (azureWord?.ErrorType || 'None') as 'None' | 'Omission' | 'Insertion' | 'Mispronunciation' | 'UnexpectedBreak' | 'MissingBreak' | 'Monotone',
                    isCorrect: weightedAccuracy >= 60 && !azureWord?.ErrorType,
                    isComplete: true,
                    grammarInfo: {
                      pos: word.pos,
                      reading: word.reading,
                      baseform: word.baseform
                    }
                  };
                });

                // 获取评价建议
                const getAssessmentComment = (
                  pronunciationScore: number,
                  grammarScore: number,
                  accuracyScore: number,
                  fluencyScore: number
                ): string[] => {
                  const comments: string[] = [];

                  // 发音评价
                  if (pronunciationScore >= 90) {
                    comments.push('发音非常标准，接近母语者水平');
                  } else if (pronunciationScore >= 80) {
                    comments.push('发音清晰准确，有少量瑕疵');
                  } else if (pronunciationScore >= 70) {
                    comments.push('发音基本准确，需要继续改进');
                  } else if (pronunciationScore >= 60) {
                    comments.push('发音达到及格水平，但需要加强练习');
                  } else {
                    comments.push('发音有明显问题，建议多听多练');
                  }

                  // 准确度评价
                  if (accuracyScore < 60) {
                    comments.push('音素发音不够准确，建议注意单音节的发音');
                  } else if (accuracyScore < 80) {
                    comments.push('部分音素发音需要改进，特别是长音和促音');
                  }

                  // 流畅度评价
                  if (fluencyScore < 60) {
                    comments.push('语言不够流畅，停顿过多或不自然');
                  } else if (fluencyScore < 80) {
                    comments.push('语速和停顿需要调整，注意语句的连贯性');
                  }

                  // 语法评价 - 修改这部分
                  if (grammarScore === 0) {
                    comments.push('未能识别有效的语法结构，请完整说出句子');
                  } else if (grammarScore < 30) {
                    comments.push('语法错误严重，建议从基础句型开始练习');
                  } else if (grammarScore < 60) {
                    comments.push('语法有多处错误，需要注意基本句式和助词使用');
                  } else if (grammarScore < 70) {
                    comments.push('语法基本可以理解，但需要改进句式结构');
                  } else if (grammarScore < 80) {
                    comments.push('语法使用中规中矩，建议尝试更丰富的表达');
                  } else if (grammarScore < 90) {
                    comments.push('语法运用较好，可以尝试更复杂的句式');
                  } else {
                    comments.push('语法运用准确，句式丰富自然');
                  }

                  // 综合建议
                  const totalScore = (pronunciationScore * 0.7 + grammarScore * 0.3);
                  if (totalScore >= 90) {
                    comments.push('总体表现优秀，可以尝试更高级的日语对话');
                  } else if (totalScore >= 80) {
                    comments.push('总体表现良好，继续保持练习');
                  } else if (totalScore >= 70) {
                    comments.push('总体表现尚可，需要在薄弱环节多加练习');
                  } else if (totalScore >= 60) {
                    comments.push('总体表现及格，建议加强基础训练');
                  } else {
                    comments.push('总体表现不佳，建议从基础开始系统学习');
                  }

                  return comments;
                };

                // 在 setAssessmentResult 之前添加评价
                const comments = getAssessmentComment(
                  pronunciationScore,
                  mecabResult.grammarScore,
                  response.NBest[0].AccuracyScore || confidence * 100,
                  response.NBest[0].FluencyScore || confidence * 100
                );

                setAssessmentResult({
                  text: accumulatedTextRef.current,
                  words: wordAssessments,
                  totalScore: Math.round(
                    pronunciationScore * 0.7 +
                    mecabResult.grammarScore * 0.3
                  ),
                  pronunciationScore,
                  accuracyScore: Math.round(response.NBest[0].AccuracyScore || confidence * 100),
                  fluencyScore: Math.round(response.NBest[0].FluencyScore || confidence * 100),
                  completenessScore: Math.round(response.NBest[0].CompletenessScore || confidence * 100),
                  grammarScore: mecabResult.grammarScore,
                  isComplete: true,
                  expectedText: targetText || '',
                  comments  // 添加评价建议
                });

                // 添加详细日志
                console.log('[Speech] 分数计算:', {
                  scores: scores,
                  lowest: scores[0],
                  secondLowest: scores[1],
                  pronunciationScore: pronunciationScore,
                  formula: '0.6 * lowest + 0.4 * secondLowest'
                });

              } catch (error) {
                console.log('[Speech] 分词失:', error);
              }
            }
          }
        }
      };

      // 4. 开始识别
      console.log('[Speech] 开始识别...');
      await recognizer.startContinuousRecognitionAsync();

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
            await new Promise<void>((resolve, reject) => {
              recognizerRef.current?.stopContinuousRecognitionAsync(
                () => {
                  console.log('[Speech] 识别停止成功');
                  recognizerRef.current?.close();
                  recognizerRef.current = null;
                  setIsProcessing(false);
                  resolve();
                },
                (err) => {
                  console.log('[Speech] 识别停止失败:', err);
                  setIsProcessing(false);
                  reject(err);
                }
              );
            });
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