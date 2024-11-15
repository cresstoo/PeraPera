import { Box, Container } from '@mui/material';
import RecordingSection from './components/RecordingSection';
import ResultsSection from './components/ResultsSection';

export default function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <RecordingSection />
        <ResultsSection />
      </Box>
    </Container>
  );
}