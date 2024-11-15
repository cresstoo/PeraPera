import 'package:flutter/material.dart';
import '../models/pronunciation_result.dart';

class WordAssessmentCard extends StatelessWidget {
  final WordAssessment assessment;

  const WordAssessmentCard({
    super.key,
    required this.assessment,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ExpansionTile(
        title: Text(
          assessment.word,
          style: TextStyle(
            color: _getScoreColor(assessment.accuracyScore),
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(
          '正確性スコア: ${assessment.accuracyScore.toStringAsFixed(1)}',
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '音素レベル評価:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: assessment.phonemes.map((phoneme) {
                    return Chip(
                      label: Text(phoneme.phoneme),
                      backgroundColor: _getScoreColor(phoneme.accuracyScore).withOpacity(0.1),
                      avatar: CircleAvatar(
                        backgroundColor: _getScoreColor(phoneme.accuracyScore),
                        child: Text(
                          phoneme.accuracyScore.toStringAsFixed(0),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }
}