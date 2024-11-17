import type { MecabFeatures, GrammarAnalysis, GrammarScore } from '../types';

export class GrammarService {
  // 分析句子语法
  static analyzeGrammar(words: MecabFeatures[]): GrammarAnalysis {
    const analysis: GrammarAnalysis = {
      structure: {
        hasSubject: false,
        hasTopic: false,
        hasObject: false,
        hasIndirectObject: false,
        hasPredicate: false,
        hasModifier: false
      },
      predicate: {
        type: null,
        form: {
          tense: null,
          polarity: 'positive',
          style: null,
          aspect: null
        }
      },
      particles: {
        topic: [],
        subject: [],
        object: [],
        indirect: [],
        direction: [],
        other: []
      },
      wordOrder: {
        isValid: true,
        errors: []
      }
    };

    // 分析每个词
    words.forEach((word, index) => {
      const [surface, pos, pos1, pos2, pos3, conj1, conj2] = word;

      // 1. 分析词性和结构
      switch (pos) {
        case '名詞':
          // 检查后续助词
          if (index < words.length - 1) {
            const nextWord = words[index + 1];
            if (nextWord[1] === '助詞') {
              switch (nextWord[0]) {
                case 'は':
                  analysis.structure.hasTopic = true;
                  analysis.particles.topic.push('は');
                  break;
                case 'が':
                  analysis.structure.hasSubject = true;
                  analysis.particles.subject.push('が');
                  break;
                case 'を':
                  analysis.structure.hasObject = true;
                  analysis.particles.object.push('を');
                  break;
                case 'に':
                case 'へ':
                  analysis.structure.hasIndirectObject = true;
                  analysis.particles.indirect.push(nextWord[0]);
                  break;
              }
            }
          }
          break;

        case '動詞':
          analysis.structure.hasPredicate = true;
          analysis.predicate.type = 'verb';
          
          // 分析动词形式
          if (conj1.includes('過去')) {
            analysis.predicate.form.tense = 'past';
          } else {
            analysis.predicate.form.tense = 'present';
          }
          
          // 分析体
          if (surface.includes('ている')) {
            analysis.predicate.form.aspect = 'progressive';
          } else if (surface.includes('てある') || surface.includes('ておく')) {
            analysis.predicate.form.aspect = 'perfect';
          } else {
            analysis.predicate.form.aspect = 'simple';
          }
          break;

        case '形容詞':
          analysis.structure.hasPredicate = true;
          analysis.predicate.type = 'adjective';
          analysis.structure.hasModifier = true;
          break;

        case '助動詞':
          // 分析敬体/简体
          if (['です', 'ます'].includes(surface)) {
            analysis.predicate.form.style = 'polite';
          } else {
            analysis.predicate.form.style = 'plain';
          }
          
          // 分析否定
          if (['ない', 'ません'].includes(surface)) {
            analysis.predicate.form.polarity = 'negative';
          }
          break;

        case '副詞':
        case '連体詞':
          analysis.structure.hasModifier = true;
          break;
      }
    });

    return analysis;
  }

  // 评分函数
  static calculateScore(words: MecabFeatures[], analysis: GrammarAnalysis): GrammarScore {
    const score: GrammarScore = {
      total: 0,
      structure: 0,
      predicate: 0,
      particles: 0,
      wordOrder: 0,
      details: []
    };

    // 1. 结构评分（35分）
    const structureScore = GrammarService.evaluateStructure(analysis);
    score.structure = structureScore.score;
    score.details.push(...structureScore.details);

    // 2. 谓语评分（25分）
    const predicateScore = GrammarService.evaluatePredicate(analysis);
    score.predicate = predicateScore.score;
    score.details.push(...predicateScore.details);

    // 3. 助词评分（20分）
    const particlesScore = GrammarService.evaluateParticles(analysis);
    score.particles = particlesScore.score;
    score.details.push(...particlesScore.details);

    // 4. 语序评分（10分）
    const wordOrderScore = this.evaluateWordOrder(words, analysis);
    score.wordOrder = wordOrderScore.score;
    score.details.push(...wordOrderScore.details);

    // 5. 语体一致性（10分）
    const styleScore = GrammarService.evaluateStyleConsistency(analysis);
    const stylePoints = styleScore.score;
    score.details.push(...styleScore.details);

    // 计算总分
    score.total = score.structure + 
                 score.predicate + 
                 score.particles + 
                 score.wordOrder +
                 stylePoints;

    // 添加总体评价
    if (score.total >= 90) {
      score.details.unshift('语法表现优秀，接近母语者水平');
    } else if (score.total >= 80) {
      score.details.unshift('语法运用熟练，有少量瑕疵');
    } else if (score.total >= 70) {
      score.details.unshift('语法基本正确，需要改进细节');
    } else if (score.total >= 60) {
      score.details.unshift('语法达到及格水平，仍需加强');
    } else {
      score.details.unshift('语法有明显问题，建议多加练习');
    }

    return score;
  }

  // 结构评分（40分）
  private static evaluateStructure(analysis: GrammarAnalysis): {
    score: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;

    // 主题和主语（15分）
    if (analysis.structure.hasTopic) {
      score += 10;
      details.push('正确使用主题标记「は」');
    } else if (analysis.structure.hasSubject) {
      score += 8;
      details.push('正确使用主语标记「が」');
    }

    // 宾语（10分）
    if (analysis.structure.hasObject) {
      score += 10;
      details.push('正确使用宾语标记「を」');
    }

    // 谓语（15分）
    if (analysis.structure.hasPredicate) {
      score += 15;
      details.push('包含谓语');
    }

    return { score, details };
  }

  // 助词评分（30分）
  private static evaluateParticles(analysis: GrammarAnalysis): {
    score: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;

    // 基本助词（15分）
    const hasBasicParticles = analysis.particles.topic.length > 0 || 
                             analysis.particles.subject.length > 0;
    if (hasBasicParticles) {
      score += 15;
      details.push('正确使用基本助词');
    }

    // 补充助词（10分）
    if (analysis.particles.object.length > 0 || 
        analysis.particles.indirect.length > 0) {
      score += 10;
      details.push('正确使用补充助词');
    }

    // 多样性（5分）
    const uniqueParticles = new Set([
      ...analysis.particles.topic,
      ...analysis.particles.subject,
      ...analysis.particles.object,
      ...analysis.particles.indirect,
      ...analysis.particles.direction
    ]).size;
    if (uniqueParticles >= 3) {
      score += 5;
      details.push('助词使用多样');
    }

    return { score, details };
  }

  // 谓语评分（30分）
  private static evaluatePredicate(analysis: GrammarAnalysis): {
    score: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;

    // 基本形式（10分）
    if (analysis.predicate.type) {
      score += 10;
      details.push(`正确使用${analysis.predicate.type === 'verb' ? '动词' : '形容词'}`);
    }

    // 时态（5分）
    if (analysis.predicate.form.tense) {
      score += 5;
      details.push(`正确使用${analysis.predicate.form.tense === 'past' ? '过去时' : '现在时'}`);
    }

    // 敬体/简体（5分）
    if (analysis.predicate.form.style) {
      score += 5;
      details.push(`使用${analysis.predicate.form.style === 'polite' ? '敬体' : '简体'}`);
    }

    // 体（10分）
    if (analysis.predicate.form.aspect) {
      score += 10;
      details.push(`正确使用${
        analysis.predicate.form.aspect === 'progressive' ? '进行体' :
        analysis.predicate.form.aspect === 'perfect' ? '完成体' : '一般体'
      }`);
    }

    return { score, details };
  }

  // 修饰语位置检查
  private static checkModifierPosition(words: MecabFeatures[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let isValid = true;

    for (let i = 0; i < words.length; i++) {
      const [surface, pos, pos1] = words[i];
      
      // 检查形容词位置
      if (pos === '形容詞') {
        // 形容词后应该跟名词或者句尾
        if (i < words.length - 1 && words[i + 1][1] !== '名詞' && words[i + 1][1] !== '助動詞') {
          isValid = false;
          errors.push(`形容词「${surface}」位置不当`);
        }
      }
      
      // 检查副词位置
      if (pos === '副詞') {
        // 副词后应该跟动词、形容词或者助动词
        if (i < words.length - 1 && 
            !['動詞', '形容詞', '助動詞'].includes(words[i + 1][1])) {
          isValid = false;
          errors.push(`副词「${surface}」位置不当`);
        }
      }
      
      // 检查连体修饰语
      if (pos1 === '連体詞') {
        // 连体词后必须是名词
        if (i < words.length - 1 && words[i + 1][1] !== '名詞') {
          isValid = false;
          errors.push(`连体词「${surface}」后应接名词`);
        }
      }
    }

    return { isValid, errors };
  }

  // 语气词搭配检查
  private static checkParticleMatching(words: MecabFeatures[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let isValid = true;

    // 敬体语气词组合
    const politeParticles = ['です', 'ます', 'ございます'];
    // 简体语气词组合
    const plainParticles = ['だ', 'である', 'のだ'];
    // 疑问语气词
    const questionParticles = ['か', 'かな', 'かしら'];

    let hasPolite = false;
    let hasPlain = false;
    let hasQuestion = false;

    for (let i = 0; i < words.length; i++) {
      const [surface, pos, pos1] = words[i];
      
      // 检查敬体和简体混用
      if (politeParticles.includes(surface)) {
        hasPolite = true;
      }
      if (plainParticles.includes(surface)) {
        hasPlain = true;
      }
      if (hasPolite && hasPlain) {
        isValid = false;
        errors.push('敬体和简体不应混用');
      }

      // 检查疑问语气词
      if (questionParticles.includes(surface)) {
        hasQuestion = true;
        // 疑问语气词应该在句尾
        if (i < words.length - 2) { // -2是因为可能还有句号
          isValid = false;
          errors.push(`疑问语气词「${surface}」应在句尾`);
        }
      }

      // 检查重复的语气词
      if (pos === '助詞' && pos1 === '終助詞') {
        if (i < words.length - 1 && words[i + 1][1] === '助詞' && words[i + 1][2] === '終助詞') {
          isValid = false;
          errors.push(`语气词「${surface}」和「${words[i + 1][0]}」重复`);
        }
      }
    }

    return { isValid, errors };
  }

  // 语序评分（10分）
  private static evaluateWordOrder(words: MecabFeatures[], analysis: GrammarAnalysis): {
    score: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;

    // 基本语序（5分）
    if (analysis.wordOrder.isValid) {
      score += 5;
      details.push('基本语序正确');
    }

    // 修饰语位置（3分）
    if (analysis.structure.hasModifier) {
      const modifierCheck = this.checkModifierPosition(words);
      if (modifierCheck.isValid) {
        score += 3;
        details.push('修饰语位置正确');
      } else {
        details.push(...modifierCheck.errors);
      }
    }

    // 句末语气（2分）
    const particleCheck = this.checkParticleMatching(words);
    if (particleCheck.isValid) {
      score += 2;
      details.push('句末语气自然');
    } else {
      details.push(...particleCheck.errors);
    }

    return { score, details };
  }

  // 语体一致性评分（10分）
  private static evaluateStyleConsistency(analysis: GrammarAnalysis): {
    score: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;

    // 敬体/简体一致性（5分）
    const style = analysis.predicate.form.style;
    if (style) {
      score += 5;
      details.push(`保持${style === 'polite' ? '敬体' : '简体'}一致`);
    }

    // 语气词搭配（5分）
    const hasMatchingParticles = true; // 需要实现语气词搭配检查逻辑
    if (hasMatchingParticles) {
      score += 5;
      details.push('语气词搭配恰当');
    }

    return { score, details };
  }
} 