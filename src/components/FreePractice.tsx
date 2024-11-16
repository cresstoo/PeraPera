import { Container, Typography, Box } from '@mui/material';
import RecordingSection from './RecordingSection';
import ResultsSection from './ResultsSection';

export default function FreePractice() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            自由练习
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            可以自由录制一句30秒以内的日语，系统会对你的发音进行评分。
          </Typography>
        </Box>

        <RecordingSection />
        <ResultsSection />
      </Box>
    </Container>
  );
} 