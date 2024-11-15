import 'package:flutter/foundation.dart';
import 'package:azure_cognitiveservices_speech/azure_cognitiveservices_speech.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/pronunciation_result.dart';

class SpeechService extends ChangeNotifier {
  PronunciationAssessmentResult? _assessmentResult;
  bool _isRecording = false;

  PronunciationAssessmentResult? get assessmentResult => _assessmentResult;
  bool get isRecording => _isRecording;

  Future<void> startPronunciationAssessment(String audioFilePath) async {
    try {
      final speechConfig = SpeechConfig(
        subscription: dotenv.env['AZURE_SPEECH_KEY']!,
        region: dotenv.env['AZURE_SPEECH_REGION']!,
      );
      
      speechConfig.speechRecognitionLanguage = "ja-JP";
      final audioConfig = AudioConfig(filename: audioFilePath);
      
      final pronunciationAssessmentConfig = PronunciationAssessmentConfig(
        referenceText: "",
        gradingSystem: GradingSystem.HundredMark,
        granularity: Granularity.Phoneme,
        enableMiscue: true
      );

      final speechRecognizer = SpeechRecognizer(
        speechConfig: speechConfig,
        audioConfig: audioConfig
      );

      await pronunciationAssessmentConfig.applyTo(speechRecognizer);

      final result = await speechRecognizer.recognizeOnceAsync();
      
      if (result.result.reason == ResultReason.RecognizedSpeech) {
        final pronunciationResult = await PronunciationAssessmentResult.fromResult(result);
        
        // Extract detailed assessment data
        List<WordAssessment> words = [];
        final detailedResult = await pronunciationResult.detailedResult;
        
        if (detailedResult != null) {
          for (var word in detailedResult.words) {
            List<PhonemeAssessment> phonemes = [];
            
            for (var phoneme in word.phonemes) {
              phonemes.add(PhonemeAssessment(
                phoneme: phoneme.phoneme,
                accuracyScore: phoneme.accuracyScore,
              ));
            }

            words.add(WordAssessment(
              word: word.word,
              accuracyScore: word.accuracyScore,
              errorType: word.errorType,
              phonemes: phonemes,
            ));
          }
        }

        _assessmentResult = PronunciationAssessmentResult(
          text: result.result.text,
          accuracyScore: pronunciationResult.accuracyScore,
          fluencyScore: pronunciationResult.fluencyScore,
          completenessScore: pronunciationResult.completenessScore,
          pronunciationScore: pronunciationResult.pronunciationScore,
          words: words,
        );
        
        // Save result to JSON file
        await _saveAssessmentResult();
        
        notifyListeners();
      }

      await speechRecognizer.dispose();
    } catch (e) {
      debugPrint('Error during pronunciation assessment: $e');
    }
  }

  Future<void> _saveAssessmentResult() async {
    if (_assessmentResult != null) {
      try {
        final directory = await getApplicationDocumentsDirectory();
        final file = File('${directory.path}/pronunciation_results.json');
        
        // Read existing results
        List<Map<String, dynamic>> results = [];
        if (await file.exists()) {
          final content = await file.readAsString();
          results = List<Map<String, dynamic>>.from(jsonDecode(content));
        }
        
        // Add new result with timestamp
        results.add({
          'timestamp': DateTime.now().toIso8601String(),
          'assessment': _assessmentResult!.toJson(),
        });
        
        // Save updated results
        await file.writeAsString(jsonEncode(results));
      } catch (e) {
        debugPrint('Error saving assessment result: $e');
      }
    }
  }

  void setRecording(bool isRecording) {
    _isRecording = isRecording;
    notifyListeners();
  }
}