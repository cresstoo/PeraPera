import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export class AzureSpeechService {
  private speechConfig: SpeechSDK.SpeechConfig;

  constructor() {
    this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_SPEECH_KEY!,
      import.meta.env.VITE_AZURE_SPEECH_REGION!
    );
    this.speechConfig.speechRecognitionLanguage = 'ja-JP';
  }

  async assessPronunciation(audioFile: Blob): Promise<SpeechSDK.PronunciationAssessmentResult> {
    // 实现发音评估逻辑
    throw new Error('Not implemented');
  }
} 