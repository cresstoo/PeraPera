import { Routes, Route } from 'react-router-dom'
import { SpeechProvider } from './contexts/SpeechContext'
import HomePage from './components/HomePage'
import GuidedPractice from './components/GuidedPractice'
import FreePractice from './components/FreePractice'

export default function App() {
  return (
    <SpeechProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guided" element={<GuidedPractice />} />
        <Route path="/free" element={<FreePractice />} />
      </Routes>
    </SpeechProvider>
  )
}