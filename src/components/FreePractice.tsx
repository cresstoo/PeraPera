import { Container, Box } from '@mui/material';
import RecordingSection from './RecordingSection';
import ResultsSection from './ResultsSection';

export default function FreePractice() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <RecordingSection />
        <ResultsSection />
      </Box>
    </Container>
  );
} 