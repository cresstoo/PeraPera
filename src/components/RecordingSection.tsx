import React from 'react';
import { Box } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeech } from '../contexts/SpeechContext';
import { RecordButton } from './ui/record-button';

const RECORDING_TIMEOUT = 30;

export default function RecordingSection({ targetText }: { targetText?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RECORDING_TIMEOUT);
  const { startRealtimeRecognition, audioBlob } = useSpeechRecognition();
  const { isProcessing } = useSpeech();
  const stopFnRef = useRef<(() => Promise<void>) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 倒计时效果
  useEffect(() => {
    if (isRecording) {
      setTimeLeft(RECORDING_TIMEOUT);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleClick();  // 自动停止录音
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (stopFnRef.current) {
        stopFnRef.current().catch(console.error);
      }
    };
  }, []);

  const handleClick = async () => {
    try {
      console.log('点击录音按钮, 当前状态:', isRecording);
      if (isRecording && stopFnRef.current) {
        console.log('停止录音');
        await stopFnRef.current();
        stopFnRef.current = null;
        setIsRecording(false);
      } else {
        console.log('开始录音');
        const stopFn = await startRealtimeRecognition(targetText);
        stopFnRef.current = stopFn;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('录音操作失败:', error);
      stopFnRef.current = null;
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <RecordButton
        isRecording={isRecording}
        timeLeft={timeLeft}
        onClick={handleClick}
      />
    </Box>
  );
} 