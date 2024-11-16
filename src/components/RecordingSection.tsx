import { Box, IconButton, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeech } from '../contexts/SpeechContext';

const RECORDING_TIMEOUT = 30; // 30秒录音限制

export default function RecordingSection({ targetText }: { targetText?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RECORDING_TIMEOUT);
  const { startRealtimeRecognition } = useSpeechRecognition();
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
      if (isRecording && stopFnRef.current) {
        await stopFnRef.current();
        stopFnRef.current = null;
        setIsRecording(false);
      } else {
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
      <IconButton
        onClick={handleClick}
        disableRipple
        sx={{
          width: 80,
          height: 80,
          bgcolor: '#673AB7',
          borderRadius: '50%',
          '& .MuiTouchRipple-root': {
            display: 'none'
          },
          '&.MuiButtonBase-root': {
            bgcolor: '#673AB7'
          }
        }}
      >
        {isRecording ? (
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: '#FFFFFF',
              borderRadius: 1,
            }}
          />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path
              d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2Z M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
              fill="#FFFFFF"
            />
          </svg>
        )}
      </IconButton>

      {isRecording && (
        <Typography 
          variant="body2" 
          color="error" 
          sx={{ mt: 2 }}
        >
          剩余时间: {timeLeft}秒
        </Typography>
      )}
    </Box>
  );
} 