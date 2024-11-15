import { Box, Typography, Paper, LinearProgress } from '@mui/material';

export default function ResultsSection() {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        评测结果
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          准确度评分
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={0} 
          sx={{ mt: 1 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        等待录音...
      </Typography>
    </Paper>
  );
} 