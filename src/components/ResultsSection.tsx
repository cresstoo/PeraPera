import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useSpeech } from '../contexts/SpeechContext';
import SemiCircle from './ui/SemiCircle';
import { minchoFont } from '../theme';

// 获取颜色函数
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50';  // 绿色
  if (score >= 60) return '#ff9800';  // 黄色
  return '#f44336';  // 红色
};

// 进度条组件
const ScoreProgress = ({ label, value, maxValue = 100 }: { 
  label: string; 
  value: number;
  maxValue?: number;
}) => {
  // 计算百分比（用于进度条显示）
  const percentage = (value / maxValue) * 100;

  return (
    <Box sx={{ mb: 3, width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label === '总分' ? 
            `${value.toFixed(0)}分` :  // 总分显示为"xx分"
            `${percentage.toFixed(1)}%`  // 其他显示为百分比
          }
        </Typography>
      </Box>
      <Box sx={{
        width: '100%',
        height: 6,
        backgroundColor: '#EDF2F7',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getScoreColor(percentage),
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </Box>
    </Box>
  );
};

// 单词评估组件
const WordAssessment = ({ word, accuracyScore, errorType }: { 
  word: string; 
  accuracyScore: number;
  errorType: string;
}) => {
  // 获取错误类型的颜色和提示
  const getErrorStyle = (errorType: string) => {
    switch(errorType) {
      case 'Mispronunciation':
        return { color: '#f44336', tooltip: '发音不准确' };
      case 'Omission':
        return { color: '#f44336', tooltip: '遗漏' };
      case 'Insertion':
        return { color: '#ff9800', tooltip: '多余插入' };
      case 'UnexpectedBreak':
        return { color: '#ff9800', tooltip: '不当停顿' };
      case 'MissingBreak':
        return { color: '#ff9800', tooltip: '缺少停顿' };
      case 'Monotone':
        return { color: '#ff9800', tooltip: '语调单调' };
      default:
        return { 
          color: getScoreColor(accuracyScore),
          tooltip: ''
        };
    }
  };

  // 标点符号不需要样式
  if (word.match(/[、。？！]/)) {
    return <span style={{ fontFamily: minchoFont }}>{word}</span>;
  }

  const errorStyle = getErrorStyle(errorType);

  return (
    <Box
      component="span"
      title={errorStyle.tooltip}
      sx={{
        display: 'inline-block',
        mx: 0.5,
        position: 'relative',
        fontWeight: 500,
        fontFamily: minchoFont,
        fontSize: '1.1rem',
        letterSpacing: '0.03em',
        color: errorStyle.color,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 1,
          borderBottom: '1px solid',
          borderColor: 'text.primary'
        }
      }}
    >
      {word}
    </Box>
  );
};

// 评价建议区域组件
const AssessmentDetails = ({ details }: { details: string[] }) => (
  <Box sx={{ 
    mt: -1,  // 向上移动
    mb: 2, 
    pl: 2 
  }}>
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        borderLeft: '2px solid',
        borderColor: 'primary.main',
        pl: 1,
        py: 0.5
      }}
    >
      {details.map((detail, index) => (
        <Box key={index} sx={{ mb: 0.5 }}>
          • {detail}
        </Box>
      ))}
    </Typography>
  </Box>
);

export default function ResultsSection() {
  const { realtimeText, assessmentResult, audioBlob } = useSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // 当组件卸载时清理 URL
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // 当 audioBlob 变化时更新音频源
  useEffect(() => {
    console.log('音频数据变化:', {
      hasBlob: !!audioBlob,
      blobSize: audioBlob?.size,
      blobType: audioBlob?.type
    });

    if (audioBlob) {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();  // 确保加载新的音频
      }
    }
  }, [audioBlob]);

  // 监听音频播放结束
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('音频播放结束');
      setIsPlaying(false);
      audio.currentTime = 0;
    };

    const handleError = (e: Event) => {
      console.error('音频播放错误:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayRecording = () => {
    console.log('点击播放按钮', {
      hasBlob: !!audioBlob,
      hasAudioRef: !!audioRef.current,
      isPlaying,
      audioUrl: audioUrlRef.current
    });

    if (!audioRef.current || !audioBlob) {
      console.log('缺少必要的音频数据或元素');
      return;
    }

    if (isPlaying) {
      console.log('暂停播放');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('开始播放');
      audioRef.current.play()
        .then(() => {
          console.log('播放成功');
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('播放失败:', error);
          setIsPlaying(false);
        });
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      p: 0.5
    }}>
      {/* 发音区域 */}
      <Box sx={{ p: 0.5 }}>
        <Box sx={{ 
          p: 1,
          bgcolor: '#EDF2F7',
          borderRadius: 1,
          minHeight: '3em',
          lineHeight: '2em',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <audio ref={audioRef} />
          <IconButton onClick={handlePlayRecording}>
            {isPlaying ? (
              // 暂停图标
              <Box sx={{
                width: 12,
                height: 16,
                display: 'flex',
                gap: 1
              }}>
                <Box sx={{
                  width: 4,
                  height: '100%',
                  bgcolor: '#666',
                  borderRadius: 0.5
                }} />
                <Box sx={{
                  width: 4,
                  height: '100%',
                  bgcolor: '#666',
                  borderRadius: 0.5
                }} />
              </Box>
            ) : (
              // 播放三角形
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '8px 0 8px 12px',
                  borderColor: 'transparent transparent transparent #666',
                  opacity: audioBlob ? 1 : 0.5
                }}
              />
            )}
          </IconButton>

          {/* 录音文本 */}
          <Box sx={{ flex: 1 }}>
            {assessmentResult ? (
              <Box>
                {assessmentResult.words.map((word, index) => (
                  <WordAssessment
                    key={index}
                    word={word.word}
                    accuracyScore={word.accuracyScore}
                    errorType={word.errorType}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ 
                fontFamily: minchoFont,
                fontSize: '1.1rem'
              }}>
                {realtimeText?.text || '等待录音...'}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* 口语得分区域 */}
      <Box sx={{ p: 0.5, mt: 1 }}>
        <Typography variant="h6" align="center" sx={{ mb: 6 }}>
          口语得分
        </Typography>

        {/* 半环和评语区域 */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2,
          mt: 2
        }}>
          <SemiCircle 
            value={assessmentResult ? assessmentResult.totalScore : 0}
            size={220}
            defaultComment={{
              short: '等待评价',
              detail: '等待评价...'
            }}
          />
        </Box>

        {/* 进度条区域 */}
        <Box sx={{ 
          maxWidth: 400, 
          margin: '0 auto',
          mt: 3
        }}>
          {/* 发音准确率 */}
          <ScoreProgress 
            label="发音准确率" 
            value={assessmentResult ? assessmentResult.pronunciationScore : 0}
            maxValue={100}
          />
          {assessmentResult?.comments && (
            <AssessmentDetails 
              details={assessmentResult.comments.filter(comment => 
                comment.includes('发音') || 
                comment.includes('音素') || 
                comment.includes('语速') ||
                comment.includes('流畅')
              )}
            />
          )}

          {/* 语法准确率 */}
          <ScoreProgress 
            label="语法准确率" 
            value={assessmentResult ? assessmentResult.grammarScore : 0}
            maxValue={100}
          />
          {assessmentResult?.comments && (
            <AssessmentDetails 
              details={assessmentResult.comments.filter(comment => 
                comment.includes('语法') || 
                comment.includes('句式') || 
                comment.includes('助词') ||
                comment.includes('语序')
              )}
            />
          )}
        </Box>
      </Box>

      {/* 音频元素 */}
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }}
        controls  // 添加这个属性用于调试
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('音频播放错误:', e);
          setIsPlaying(false);
        }}
      />
    </Box>
  );
} 