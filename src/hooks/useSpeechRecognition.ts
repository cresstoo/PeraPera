import { useCallback, useRef, useState } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { useSpeech } from '../contexts/SpeechContext';
import { MecabWord, MecabAnalysisResult } from '../types/mecab';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[Speech]', ...args);
  }
}

export const useSpeechRecognition = () => {
  const { setRealtimeText, setAssessmentResult, setIsProcessing } = useSpeech();
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRealtimeRecognition = useCallback(async (targetText?: string) => {
    log('开始录音', { targetText });
    setIsProcessing(true);
    chunksRef.current = [];
    
    try {
      // 1. 开始录音
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
        log('录音数据已保存');
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        log('录音文件已生成');
      };
      
      mediaRecorderRef.current.start();
      log('录音开始');

      // 2. 设置语音识别
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        import.meta.env.VITE_AZURE_SPEECH_KEY,
        import.meta.env.VITE_AZURE_SPEECH_REGION
      );
      
      speechConfig.speechRecognitionLanguage = 'ja-JP';
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;
      
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      recognizerRef.current = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // 添加日志以便调试
      console.log('Speech config:', {
        key: import.meta.env.VITE_AZURE_SPEECH_KEY?.slice(0, 5) + '...',
        region: import.meta.env.VITE_AZURE_SPEECH_REGION
      });

      // 3. 设置识别事件
      recognizerRef.current.recognizing = (s, e) => {
        if (e.result.text) {
          log('实时识别中:', e.result.text);
          setRealtimeText({
            text: e.result.text
          });
        }
      };

      recognizerRef.current.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          log('最终识别:', e.result.text);
          const jsonResult = e.result.properties.getProperty(
            sdk.PropertyId.SpeechServiceResponse_JsonResult
          );
          const response = JSON.parse(jsonResult);
          log('Azure识别详情:', response);

          if (response.NBest?.[0]) {
            const confidence = response.NBest[0].Confidence;
            
            try {
              // 调用后端进行分词
              const mecabResult = await fetch('http://localhost:3001/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: e.result.text })
              }).then(res => res.json()) as MecabAnalysisResult;

              // 使用分词结果
              const wordAssessments = mecabResult.words.map((word: MecabWord) => ({
                word: word.surface,
                accuracyScore: confidence * 100,
                errorType: 'None',
                isCorrect: true,
                isComplete: true,
                grammarInfo: {
                  pos: word.pos,
                  reading: word.reading,
                  baseform: word.baseform
                }
              }));

              setAssessmentResult({
                text: e.result.text,
                words: wordAssessments,
                totalScore: (confidence * 100 * 0.6 + mecabResult.grammarScore * 0.4),
                pronunciationScore: confidence * 100,
                grammarScore: mecabResult.grammarScore,
                isComplete: true,
                expectedText: targetText || ''
              });
            } catch (error) {
              log('分词失败:', error);
            }
          }
        }
      };

      // 4. 开始识别
      log('开始识别...');
      await recognizerRef.current.startContinuousRecognitionAsync();

      // 5. 返回停止函数
      return async () => {
        log('执行停止函数');
        try {
          // 停止录音
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach(track => {
              track.stop();
              log('音轨已停止:', track.kind);
            });
          }

          // 停止识别
          if (recognizerRef.current) {
            await new Promise<void>((resolve, reject) => {
              recognizerRef.current?.stopContinuousRecognitionAsync(
                () => {
                  log('识别停止成功');
                  recognizerRef.current?.close();
                  setIsProcessing(false);
                  resolve();
                },
                (err) => {
                  log('识别停止失败:', err);
                  setIsProcessing(false);
                  reject(err);
                }
              );
            });
          }
          log('停止流程完成');
        } catch (error) {
          log('停止过程出错:', error);
          setIsProcessing(false);
          throw error;
        }
      };
    } catch (error) {
      log('初始化错误:', error);
      setIsProcessing(false);
      throw error;
    }
  }, [setRealtimeText, setAssessmentResult, setIsProcessing]);

  return {
    startRealtimeRecognition,
    audioBlob
  };
};