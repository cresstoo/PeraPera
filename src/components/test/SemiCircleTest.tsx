import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

interface SemiCircleTestProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function SemiCircleTest({
  value = 75,
  size = 240,
  strokeWidth = 10,
  color
}: SemiCircleTestProps) {
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
  const strokeDashoffset = semiCircumference - (progress / 100) * semiCircumference;

  const getColorByScore = (score: number) => {
    if (score >= 90) return '#4CAF50';  // 绿色
    if (score >= 60) return '#FFB800';  // 黄色
    return '#F44336';  // 红色
  };

  const displayColor = color || getColorByScore(value);

  // 获取简短评语
  const getShortComment = (score: number) => {
    if (score >= 90) return '非常棒！';
    if (score >= 70) return '还不错';
    return '需要加强';
  };

  // 获取详细评语
  const getDetailComment = (score: number) => {
    if (score >= 90) return '发音标准，语法流畅';
    if (score >= 70) return '语法正确，发音需要加强';
    return '建议多加练习基础发音';
  };

  return (
    <Box sx={{ 
      p: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 0
    }}>
      {/* 半环和分数容器 */}
      <Box sx={{ 
        width: size, 
        height: size, 
        position: 'relative',
        margin: '0 auto',
        overflow: 'visible'
      }}>
        <svg 
          width={size} 
          height={size} 
          style={{ overflow: 'visible' }}
        >
          <g transform={`translate(0,${size/2})`}>
            {/* 背景圆弧 */}
            <path
              d={`
                M ${strokeWidth/2}, 0
                A ${radius},${radius} 0 1 1 ${size - strokeWidth/2}, 0
              `}
              fill="none"
              stroke="#F5F7FA"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* 进度圆弧 */}
            <path
              d={`
                M ${strokeWidth/2}, 0
                A ${radius},${radius} 0 1 1 ${size - strokeWidth/2}, 0
              `}
              fill="none"
              stroke={displayColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={semiCircumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />
          </g>
        </svg>
        
        {/* 分数显示 */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          textAlign: 'center',
          bgcolor: '#F5F7FA',
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

      {/* 评语容器 */}
      <Box sx={{
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        mt: -14
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: displayColor,
          }}
        >
          {getShortComment(progress)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {getDetailComment(progress)}
        </Typography>
      </Box>
    </Box>
  );
} 