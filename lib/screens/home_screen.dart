import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../services/speech_service.dart';
import '../widgets/word_assessment_card.dart';
import 'dart:io';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _audioRecorder = Record();
  String? _recordingPath;

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final directory = await getTemporaryDirectory();
        _recordingPath = '${directory.path}/audio_record.wav';
        
        await _audioRecorder.start(
          path: _recordingPath,
          encoder: AudioEncoder.wav,
          samplingRate: 16000,
        );
        
        context.read<SpeechService>().setRecording(true);
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _stopRecording() async {
    try {
      await _audioRecorder.stop();
      context.read<SpeechService>().setRecording(false);
      
      if (_recordingPath != null) {
        await context.read<SpeechService>().startPronunciationAssessment(_recordingPath!);
      }
    } catch (e) {
      debugPrint('Error stopping recording: $e');
    }
  }

  Widget _buildScoreCard(String title, double score, String description) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              score.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 24,
                color: _getScoreColor(score),
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('日本語発音評価'),
      ),
      body: Consumer<SpeechService>(
        builder: (context, speechService, child) {
          final result = speechService.assessmentResult;
          
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  Text(
                    '認識されたテキスト:',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        result?.text ?? '(まだ録音されていません)',
                        style: const TextStyle(fontSize: 18),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                  if (result != null) ...[
                    const SizedBox(height: 24),
                    Text(
                      '総合評価:',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      childAspectRatio: 1.2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      children: [
                        _buildScoreCard(
                          '総合スコア',
                          result.pronunciationScore,
                          '全体的な発音の評価',
                        ),
                        _buildScoreCard(
                          '正確性',
                          result.accuracyScore,
                          '発音の正確さ',
                        ),
                        _buildScoreCard(
                          '流暢性',
                          result.fluencyScore,
                          '発話の自然さと滑らかさ',
                        ),
                        _buildScoreCard(
                          '完整性',
                          result.completenessScore,
                          '正確に発音された単語の割合',
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      '単語別評価:',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    ...result.words.map((word) => WordAssessmentCard(
                      assessment: word,
                    )),
                  ],
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: speechService.isRecording ? _stopRecording : _startRecording,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: speechService.isRecording ? Colors.red : Colors.blue,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(speechService.isRecording ? Icons.stop : Icons.mic),
                        const SizedBox(width: 8),
                        Text(
                          speechService.isRecording ? '録音停止' : '録音開始',
                          style: const TextStyle(fontSize: 20),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    super.dispose();
  }
}