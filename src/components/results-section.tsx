import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { PlayCircle } from "lucide-react"
import { useRef } from "react"
import { useSpeech } from "../contexts/SpeechContext"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"

export function ResultsSection() {
  const { realtimeText, assessmentResult, isProcessing } = useSpeech()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { audioBlob } = useSpeechRecognition()

  const handlePlayRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
    }
  }

  if (isProcessing) {
    return (
      <Card className="p-6">
        <div className="h-24 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">正在评估发音...</p>
        </div>
      </Card>
    )
  }

  if (!realtimeText && !assessmentResult) {
    return (
      <Card className="p-6">
        <div className="h-24 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">等待录音...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">评测结果</h3>
          {audioBlob && (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayRecording}
              className="h-8 w-8"
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 其他评测结果内容 */}
      </div>
      <audio ref={audioRef} className="hidden" />
    </Card>
  )
} 