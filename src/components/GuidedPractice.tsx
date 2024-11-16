import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PRACTICE_SENTENCES } from '../types';
import RecordingSection from './RecordingSection';
import ResultsSection from './ResultsSection';

const levelColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error'
} as const;

export default function GuidedPractice() {
  const navigate = useNavigate();
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">跟读练习</Typography>
          </Box>

          {!selectedSentence ? (
            <List>
              {PRACTICE_SENTENCES.map((sentence) => (
                <ListItem
                  key={sentence.id}
                  button
                  onClick={() => setSelectedSentence(sentence.text)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1 
                  }}
                >
                  <ListItemText
                    primary={sentence.text}
                    secondary={sentence.translation}
                  />
                  <Chip
                    label={sentence.level}
                    color={levelColors[sentence.level]}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              >
                {selectedSentence}
              </Typography>
              <RecordingSection targetText={selectedSentence} />
              <ResultsSection />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 