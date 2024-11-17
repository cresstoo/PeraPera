import React from 'react';
import { Box, IconButton } from '@mui/material';

interface RecordButtonProps {
  isRecording: boolean;
  timeLeft: number;
  onClick: () => void;
}

export function RecordButton({ isRecording, timeLeft, onClick }: RecordButtonProps) {
  // 计算进度
  const progress = (timeLeft / 30) * 100;  // 30秒固定值
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - progress) / 100) * circumference;

  return (
    <Box sx={{ 
      position: 'relative',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
    }}>
      {/* 倒计时圆环 */}
      <svg
        width="120"
        height="120"
        style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
          opacity: isRecording ? 1 : 0
        }}
      >
        {/* 背景圆环 */}
        <circle
          cx="60"
          cy="60"
          r={55}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* 进度圆环 */}
        <circle
          cx="60"
          cy="60"
          r={55}
          fill="none"
          stroke="#673AB7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear',
            transformOrigin: 'center'
          }}
        />
      </svg>

      {/* 录音按钮 */}
      <IconButton
        onClick={onClick}
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
    </Box>
  );
} 