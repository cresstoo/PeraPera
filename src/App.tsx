import { Routes, Route } from 'react-router-dom'
import { SpeechProvider } from './contexts/SpeechContext'
import HomePage from './components/HomePage'
import GuidedPractice from './components/GuidedPractice'
import FreePractice from './components/FreePractice'
import { Box, ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8F9FA',
        overflow: 'hidden'
      }}>
        <SpeechProvider>
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/guided" element={<GuidedPractice />} />
              <Route path="/free" element={<FreePractice />} />
            </Routes>
          </Box>
        </SpeechProvider>
      </Box>
    </ThemeProvider>
  )
}