import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface PracticeSentence {
  id: string;
  text: string;
  level: string;
}

const PRACTICE_SENTENCES: PracticeSentence[] = [
  { id: '1', text: 'こんにちは', level: '初級' },
  { id: '2', text: 'はじめまして、よろしくお願いします', level: '初級' },
  { id: '3', text: '今日は天気がとてもいいですね', level: '中級' },
  { id: '4', text: '日本語の勉強を頑張っています', level: '中級' },
];

interface Props {
  selectedSentence: string;
  onSentenceChange: (sentence: string) => void;
  disabled?: boolean;
}

export default function PracticeSentenceSelector({ 
  selectedSentence, 
  onSentenceChange,
  disabled = false
}: Props) {
  const handleChange = (event: SelectChangeEvent) => {
    const sentence = PRACTICE_SENTENCES.find(s => s.id === event.target.value)?.text || '';
    onSentenceChange(sentence);
  };

  return (
    <Box sx={{ minWidth: 200, mb: 3 }}>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="practice-sentence-label">练习句子</InputLabel>
        <Select
          labelId="practice-sentence-label"
          value={PRACTICE_SENTENCES.find(s => s.text === selectedSentence)?.id || ''}
          label="练习句子"
          onChange={handleChange}
        >
          {PRACTICE_SENTENCES.map((sentence) => (
            <MenuItem key={sentence.id} value={sentence.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{sentence.text}</span>
                <span style={{ color: 'text.secondary', marginLeft: 2 }}>
                  {sentence.level}
                </span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 