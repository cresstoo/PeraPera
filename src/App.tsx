import { Routes, Route } from 'react-router-dom'
import { SpeechProvider } from './contexts/SpeechContext'
import HomePage from './components/HomePage'
import GuidedPractice from './components/GuidedPractice'
import FreePractice from './components/FreePractice'
import SemiCircleTestPage from './components/test/SemiCircleTestPage'

export default function App() {
  return (
    <SpeechProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guided" element={<GuidedPractice />} />
        <Route path="/free" element={<FreePractice />} />
        <Route path="/test" element={<SemiCircleTestPage />} />
      </Routes>
    </SpeechProvider>
  )
}