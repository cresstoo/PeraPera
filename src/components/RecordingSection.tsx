import { Box, Button, Typography } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { useState } from 'react';

export default function RecordingSection() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="h5" gutterBottom>
        录音测评
      </Typography>
      <Button 
        variant="contained"
        color={isRecording ? "error" : "primary"}
        startIcon={isRecording ? <Stop /> : <Mic />}
        onClick={() => setIsRecording(!isRecording)}
        sx={{ my: 2 }}
      >
        {isRecording ? '停止录音' : '开始录音'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        请说出要测评的日语句子
      </Typography>
    </Box>
  );
} 