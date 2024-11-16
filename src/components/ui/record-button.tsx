import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Mic, Square } from "lucide-react"

interface RecordButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isRecording?: boolean
}

const RecordButton = React.forwardRef<HTMLButtonElement, RecordButtonProps>(
  ({ className, isRecording, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full",
          isRecording && "animate-pulse-record",
          className
        )}
        {...props}
      >
        {isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    )
  }
)
RecordButton.displayName = "RecordButton"

export { RecordButton } 