import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface SemiCircleProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  defaultComment?: {
    short: string;
    detail: string;
  };
}

export default function SemiCircle({
  value = 75,
  size = 240,
  strokeWidth = 10,
  color,
  defaultComment
}: SemiCircleProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const semiCircumference = circumference;
  const strokeDashoffset = ((100 - progress) / 100) * circumference;

  const getColorByScore = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 60) return '#FFB800';
    return '#F44336';
  };

  const displayColor = color || getColorByScore(value);

  const getShortComment = (score: number) => {
    if (score >= 90) return '非常棒！';
    if (score >= 70) return '还不错';
    return '需要加强';
  };

  const getDetailComment = (score: number) => {
    if (score >= 90) return '发音标准，语法流畅';
    if (score >= 70) return '语法正确，发音需要加强';
    return '建议多加练习基础发音';
  };

  const BACKGROUND_COLOR = '#EDF2F7';

  return (
    <Box sx={{ 
      p: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 0,
      mt: -10
    }}>
      <Box sx={{ 
        width: size, 
        height: size, 
        position: 'relative',
        margin: '0 auto',
        overflow: 'visible'
      }}>
        <svg 
          width={size} 
          height={size/2} 
          style={{ 
            overflow: 'visible',
            transform: 'translateY(-60px)'
          }}
        >
          <g transform={`translate(0,${size/2})`}>
            <path
              d={`
                M ${strokeWidth/2}, ${size/2}
                A ${radius},${radius} 0 0 1 ${size - strokeWidth/2}, ${size/2}
              `}
              fill="none"
              stroke={BACKGROUND_COLOR}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d={`
                M ${strokeWidth/2}, ${size/2}
                A ${radius},${radius} 0 0 1 ${size - strokeWidth/2}, ${size/2}
              `}
              fill="none"
              stroke={displayColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                transformOrigin: 'center'
              }}
            />
          </g>
        </svg>
        
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          textAlign: 'center',
          bgcolor: BACKGROUND_COLOR,
          borderRadius: '50%',
          width: 70,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#1A1A1A',
              fontWeight: 700,
              lineHeight: 1,
              fontSize: '1.25rem'
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        mt: -2
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: value === 0 ? 'text.secondary' : displayColor,
          }}
        >
          {value === 0 && defaultComment ? defaultComment.short : getShortComment(progress)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {value === 0 && defaultComment ? defaultComment.detail : getDetailComment(progress)}
        </Typography>
      </Box>
    </Box>
  );
} 