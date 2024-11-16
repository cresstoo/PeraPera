import { Box } from '@mui/material';
import SemiCircleTest from './SemiCircleTest';

export default function SemiCircleTestPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ 
        display: 'flex',
        gap: 4,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <SemiCircleTest value={95} />
        <SemiCircleTest value={75} />
        <SemiCircleTest value={45} />
      </Box>
    </Box>
  );
} 