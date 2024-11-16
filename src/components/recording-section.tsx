import { RecordButton } from "./ui/record-button"
import { useState, useEffect } from "react"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"
import { useSpeech } from "../contexts/SpeechContext"

const RECORDING_TIMEOUT = 30000 // 30秒录音限制

export function RecordingSection({ targetText }: { targetText?: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const { startRealtimeRecognition } = useSpeechRecognition()
  const { isProcessing } = useSpeech()
  const [stopRecognition, setStopRecognition] = useState<(() => void) | null>(
    null
  )
  const [timeLeft, setTimeLeft] = useState(RECORDING_TIMEOUT / 1000)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording) {
      setTimeLeft(RECORDING_TIMEOUT / 1000)
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording])

  const handleStartRecording = async () => {
    try {
      setIsRecording(true)
      const stopFn = await startRealtimeRecognition(targetText)
      setStopRecognition(() => stopFn)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("无法访问麦克风，请确保已授予权限。")
      setIsRecording(false)
    }
  }

  const handleStopRecording = () => {
    if (stopRecognition) {
      stopRecognition()
      setStopRecognition(null)
    }
    setIsRecording(false)
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording()
    } else {
      handleStartRecording()
    }
  }

  useEffect(() => {
    if (!isProcessing && isRecording) {
      setIsRecording(false)
      setStopRecognition(null)
    }
  }, [isProcessing])

  return (
    <div className="flex flex-col items-center gap-4">
      <RecordButton
        isRecording={isRecording}
        onClick={handleToggleRecording}
        disabled={isProcessing}
      />

      {isRecording && (
        <p className="text-sm text-destructive">剩余时间: {timeLeft}秒</p>
      )}

      <p
        className={`text-sm text-muted-foreground transition-opacity ${
          isProcessing ? "opacity-0" : "opacity-100"
        }`}
      >
        {isRecording ? "点击停止" : "点击开始说话"}
      </p>

      {isProcessing && (
        <p className="text-sm text-muted-foreground">正在处理...</p>
      )}
    </div>
  )
} 