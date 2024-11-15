import 'dart:convert';

class WordAssessment {
  final String word;
  final double accuracyScore;
  final double errorType;
  final List<PhonemeAssessment> phonemes;

  WordAssessment({
    required this.word,
    required this.accuracyScore,
    required this.errorType,
    required this.phonemes,
  });

  Map<String, dynamic> toJson() => {
    'word': word,
    'accuracyScore': accuracyScore,
    'errorType': errorType,
    'phonemes': phonemes.map((p) => p.toJson()).toList(),
  };
}

class PhonemeAssessment {
  final String phoneme;
  final double accuracyScore;

  PhonemeAssessment({
    required this.phoneme,
    required this.accuracyScore,
  });

  Map<String, dynamic> toJson() => {
    'phoneme': phoneme,
    'accuracyScore': accuracyScore,
  };
}

class PronunciationAssessmentResult {
  final String text;
  final double accuracyScore;
  final double fluencyScore;
  final double completenessScore;
  final double pronunciationScore;
  final List<WordAssessment> words;

  PronunciationAssessmentResult({
    required this.text,
    required this.accuracyScore,
    required this.fluencyScore,
    required this.completenessScore,
    required this.pronunciationScore,
    required this.words,
  });

  Map<String, dynamic> toJson() => {
    'text': text,
    'accuracyScore': accuracyScore,
    'fluencyScore': fluencyScore,
    'completenessScore': completenessScore,
    'pronunciationScore': pronunciationScore,
    'words': words.map((w) => w.toJson()).toList(),
  };

  String toJsonString() => jsonEncode(toJson());
}