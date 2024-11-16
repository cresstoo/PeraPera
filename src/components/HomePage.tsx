import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import MicIcon from '@mui/icons-material/Mic';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            PeraPera
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            日本語発音評価アプリ
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/guided')}
            sx={{ py: 2 }}
          >
            跟读练习
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<MicIcon />}
            onClick={() => navigate('/free')}
            sx={{ py: 2 }}
          >
            自由练习
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 