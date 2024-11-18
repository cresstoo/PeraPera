import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useSpeech } from '../contexts/SpeechContext';
import SemiCircle from './ui/SemiCircle';
import { minchoFont } from '../theme';

// 获取颜色函数
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#4caf50';  // 绿色 - 优秀
  if (score >= 80) return '#8bc34a';  // 黄绿色 - 良好
  if (score >= 60) return '#ff9800';  // 黄色 - 及格
  return '#f44336';  // 红色 - 不及格
};

// 添加错误样式函数
const getErrorStyle = (errorType: string, accuracyScore: number) => {
  // 根据错误类型和分数返回不同的样式
  if (accuracyScore >= 90) {
    return { color: '#4caf50' };  // 绿色 - 优秀
  }
  if (accuracyScore >= 80) {
    return { color: '#8bc34a' };  // 黄绿色 - 良好
  }
  if (accuracyScore >= 60) {
    return { color: '#ff9800' };  // 橙色 - 及格
  }
  
  // 根据错误类型设置不同的颜色
  switch (errorType) {
    case 'Mispronunciation':
      return { color: '#f44336' };  // 红色 - 发音错误
    case 'Omission':
      return { color: '#e91e63' };  // 粉色 - 遗漏
    case 'Insertion':
      return { color: '#9c27b0' };  // 紫色 - 多余
    default:
      return { color: '#f44336' };  // 红色 - 默认错误
  }
};

// 获取颜色和评语函数
const getScoreLevel = (score: number): {
  color: string;
  comment: string;
} => {
  if (score >= 90) return {
    color: '#4caf50',  // 绿色 - 优秀
    comment: '优秀'
  };
  if (score >= 80) return {
    color: '#8bc34a',  // 黄绿色 - 良好
    comment: '良好'
  };
  if (score >= 60) return {
    color: '#ff9800',  // 黄色 - 及格
    comment: '及格'
  };
  return {
    color: '#f44336',  // 红色 - 不及格
    comment: '需要加强'
  };
};

// 评价建议区域组件
const AssessmentDetails = ({ details }: { details: string[] }) => (
  <Box sx={{ mt: -1, mb: 2, pl: 2 }}>
    <Typography 
      component="div" 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        borderLeft: '2px solid',
        borderColor: 'primary.main',
        pl: 1,
        py: 0.5,
        fontSize: '0.875rem'
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

// 修改进度条组件
const ScoreProgress = ({ label, value, maxValue = 100, details }: { 
  label: string; 
  value: number;
  maxValue?: number;
  details?: string[];
}) => {
  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round((value / maxValue) * 100)}%`}
        </Typography>
      </Box>
      <Box sx={{
        width: '100%',
        height: 6,
        backgroundColor: '#EDF2F7',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 1
      }}>
        <Box
          sx={{
            width: `${(value / maxValue) * 100}%`,
            height: '100%',
            backgroundColor: getScoreColor(value),
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </Box>
      {details && details.length > 0 && (
        <Box sx={{ mt: 1, pl: 2 }}>
          <Typography 
            component="div" 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              borderLeft: '2px solid',
              borderColor: 'primary.main',
              pl: 1,
              py: 0.5,
              fontSize: '0.875rem'
            }}
          >
            {details.map((detail, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>
                • {detail}
              </Box>
            ))}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// 单词评估组件
const WordAssessment = ({ word, accuracyScore, errorType }: { 
  word: string; 
  accuracyScore: number;
  errorType: string;
}) => {
  // 标点符号检查
  if (word && typeof word === 'string' && word.match(/[、。？！]/)) {
    return (
      <span style={{ 
        fontFamily: minchoFont,
        color: '#000000',
        margin: '0 4px',
        display: 'inline-block'
      }}>
        {word}
      </span>
    );
  }

  return (
    <span style={{ 
      display: 'inline-block',
      margin: '0 6px',
      fontWeight: 600,
      fontFamily: minchoFont,
      fontSize: '1.1rem',
      letterSpacing: '0.03em',
      color: getScoreColor(accuracyScore),
      textDecoration: 'underline',
      textDecorationColor: '#000000',
      textDecorationThickness: '1px',
      textUnderlineOffset: '0.1em',
      textDecorationSkipInk: 'none',
      lineHeight: '1.8'
    }}>
      {word}
    </span>
  );
};

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

  // 监音频播放结束
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

          {/* 录音文本区域 */}
          <Box sx={{ flex: 1 }}>
            {assessmentResult && assessmentResult.text ? (
              <div style={{ lineHeight: '1.8' }}>
                {assessmentResult.words.map((word, index) => (
                  <WordAssessment
                    key={index}
                    word={word.word}
                    accuracyScore={word.accuracyScore}
                    errorType={word.errorType}
                  />
                ))}
              </div>
            ) : realtimeText && realtimeText.text ? (
              <Typography color="text.secondary" sx={{ 
                fontFamily: minchoFont,
                fontSize: '1.1rem',
                lineHeight: 1.8
              }}>
                {realtimeText.text}
              </Typography>
            ) : (
              <Typography color="text.secondary" sx={{ 
                fontFamily: minchoFont,
                fontSize: '1.1rem'
              }}>
                等待录音...
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
              short: `${assessmentResult ? Math.round(assessmentResult.totalScore) : 0}分`,
              detail: assessmentResult ? 
                getScoreLevel(assessmentResult.totalScore).comment : 
                '等待评价...'
            }}
            color={assessmentResult ? 
              getScoreLevel(assessmentResult.totalScore).color : 
              '#f44336'
            }
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
            value={assessmentResult?.pronunciationScore || 0}
            maxValue={100}
            details={assessmentResult?.comments?.filter(comment => 
              comment.includes('发音') ||
              comment.includes('语速') ||
              comment.includes('流畅')
            )}
          />

          {/* 语法准确率 */}
          <ScoreProgress 
            label="语法准确率" 
            value={assessmentResult?.grammarScore || 0}
            maxValue={100}
            details={assessmentResult?.comments?.filter(comment => 
              comment.includes('句型') ||
              comment.includes('语法')
            )}
          />
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