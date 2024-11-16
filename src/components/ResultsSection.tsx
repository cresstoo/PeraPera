import { Box, Typography, Paper } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useSpeech } from '../contexts/SpeechContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// 进度条组件
const ScoreProgress = ({ label, value }: { label: string; value: number }) => (
  <Box sx={{ mb: 3, width: '100%' }}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      mb: 1
    }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#4285F4', fontWeight: 500 }}>
        {value.toFixed(1)}%
      </Typography>
    </Box>
    <Box sx={{
      width: '100%',
      height: 6,
      backgroundColor: '#F5F5F5',
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <Box
        sx={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: value >= 90 ? '#673AB7' : '#4285F4',
          transition: 'width 0.5s ease-in-out'
        }}
      />
    </Box>
  </Box>
);

// 获取评语
const getScoreComment = (score: number) => {
  if (score >= 90) return { title: '完美', detail: '发音和语法都很标准' };
  if (score >= 70) return { title: '还需加强', detail: '建议多加练习发音和语法' };
  return { title: '需要加油', detail: '建议多加练习发音和语法' };
};

// 半环形进度组件
const SemiCircleScore = ({ value }: { value: number }) => {
  const comment = getScoreComment(value);
  const radius = 80;  // 半径
  const strokeWidth = 10;  // 线条宽度
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI;  // 半圆周长
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ 
      textAlign: 'center',
      position: 'relative',
      width: radius * 2,
      height: radius + 60,
      margin: '0 auto'
    }}>
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-180deg)' }}
      >
        {/* 背景圆弧 */}
        <circle
          stroke="#F5F5F5"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ 
            strokeDashoffset: circumference / 2,
            transition: 'stroke-dashoffset 0.3s ease'
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* 进度圆弧 */}
        <circle
          stroke="#4285F4"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ 
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.3s ease'
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      {/* 分数和评语 */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#4285F4',
            fontWeight: 'bold',
            lineHeight: 1
          }}
        >
          {Math.round(value)}%
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ mt: 1 }}
        >
          {comment.title}
        </Typography>
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {comment.detail}
      </Typography>
    </Box>
  );
};

// 单词评估组件
const WordAssessment = ({ word, accuracyScore, isCorrect }: { 
  word: string; 
  accuracyScore: number;
  isCorrect: boolean;
}) => {
  // 标点符号不需要样式
  if (word.match(/[、。？！]/)) {
    return <span>{word}</span>;
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        mx: 1,
        borderBottom: 1,
        borderColor: 'text.primary',
        color: accuracyScore >= 90 ? 'success.main' : 
               accuracyScore >= 80 ? 'warning.main' : 
               'error.main'
      }}
    >
      {word}
    </Box>
  );
};

export default function ResultsSection() {
  const { realtimeText, assessmentResult } = useSpeech();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 发音区域 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          你的发音
        </Typography>
        <Box sx={{ 
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          minHeight: '3em',
          lineHeight: '2em'
        }}>
          {assessmentResult ? (
            <Box>
              {assessmentResult.words.map((word, index) => (
                <WordAssessment
                  key={index}
                  word={word.word}
                  accuracyScore={word.accuracyScore}
                  isCorrect={word.isCorrect}
                />
              ))}
            </Box>
          ) : (
            <Typography>
              {realtimeText?.text || '等待录音...'}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* 评分区域 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          口语得分
        </Typography>
        {assessmentResult ? (
          <Box>
            {/* 半环形进度 */}
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <Box sx={{
                position: 'relative',
                width: '100%',
                paddingBottom: '50%',
                background: '#F5F5F5',
                borderRadius: '200px 200px 0 0',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: '#4285F4',
                  transformOrigin: '50% 100%',
                  transform: `rotate(${assessmentResult.totalScore * 1.8}deg)`,
                  transition: 'transform 0.5s ease-in-out'
                }
              }} />
              
              {/* 分数和评语 */}
              <Box sx={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <Typography 
                  variant="h3" 
                  sx={{ color: '#4285F4', fontWeight: 'bold' }}
                >
                  {assessmentResult.totalScore.toFixed(0)}%
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {assessmentResult.totalScore >= 90 ? '完美' :
                   assessmentResult.totalScore >= 70 ? '还需加强' :
                   '需要加油'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  建议多加练习发音和语法
                </Typography>
              </Box>
            </Box>

            {/* 进度条 */}
            <Box sx={{ maxWidth: 400, margin: '40px auto 0' }}>
              <ScoreProgress 
                label="发音准确率" 
                value={assessmentResult.pronunciationScore} 
              />
              <ScoreProgress 
                label="语法准确率" 
                value={assessmentResult.grammarScore} 
              />
            </Box>
          </Box>
        ) : (
          <Typography align="center" color="text.secondary">
            等待评分...
          </Typography>
        )}
      </Paper>
    </Box>
  );
} 