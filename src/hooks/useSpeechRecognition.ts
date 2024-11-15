import { useState, useCallback, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_SPEECH_KEY = 'b448c0f493ce4e789f19852239396723';
const AZURE_SPEECH_REGION = 'japaneast';

export function useSpeechRecognition() {
  const [transcription, setTranscription] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        AZURE_SPEECH_KEY,
        AZURE_SPEECH_REGION
      );
      speechConfig.speechRecognitionLanguage = 'ja-JP';

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      const pronunciationAssessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(
        '',
        SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
        true
      );

      await pronunciationAssessmentConfig.applyTo(recognizer);

      recognizer.recognizing = (s, e) => {
        if (e.result.text) {
          setTranscription(e.result.text);
        }
      };

      recognizer.recognized = async (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setTranscription(e.result.text);
          try {
            const pronunciationResult = await SpeechSDK.PronunciationAssessmentResult.fromResult(e.result);
            setPronunciationScore(pronunciationResult.pronunciationScore);
          } catch (error) {
            console.error('Error getting pronunciation result:', error);
          }
        }
      };

      await recognizer.startContinuousRecognitionAsync();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (recognizerRef.current) {
      try {
        await recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.dispose();
        recognizerRef.current = null;
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  }, []);

  return {
    transcription,
    pronunciationScore,
    startRecording,
    stopRecording,
  };
}