import type { MecabFeatures, GrammarAnalysis, GrammarScore } from '../types';

export class GrammarService {
  public static analyzeGrammar(words: MecabFeatures[]): GrammarAnalysis {
    // 去掉句号
    const contentWords = words.filter(w => w[1] !== '記号');
    
    // 分析结构
    const structure = {
      hasSubject: contentWords.some((w, i) => 
        w[1] === '名詞' && 
        i + 1 < contentWords.length && 
        contentWords[i + 1][0] === 'は'
      ),
      hasTopic: contentWords.some(w => w[0] === 'は'),
      hasObject: contentWords.some(w => w[0] === 'を'),
      hasIndirectObject: contentWords.some(w => w[0] === 'に'),
      hasPredicate: contentWords.some(w => 
        w[1] === '動詞' || 
        w[1] === '助動詞' || 
        w[1] === '形容詞' || 
        w[1] === '形容動詞'
      ),
      hasModifier: contentWords.some(w => 
        w[1] === '形容詞' || 
        w[1] === '副詞'
      )
    };

    // 分析谓语
    const predicate = {
      type: contentWords.some(w => w[1] === '動詞') ? 'verb' as const :
            contentWords.some(w => w[1] === '形容詞') ? 'adjective' as const :
            contentWords.some(w => w[1] === '助動詞') ? 'copula' as const : 
            null,
      form: {
        tense: contentWords.some(w => w[5]?.includes('過去')) ? 'past' as const : 'present' as const,
        polarity: contentWords.some(w => w[0].includes('ない')) ? 'negative' as const : 'positive' as const,
        style: contentWords.some(w => ['です', 'ます'].includes(w[0])) ? 'polite' as const : 'plain' as const,
        aspect: null
      }
    };

    return {
      structure,
      predicate,
      particles: {
        topic: contentWords.filter(w => w[0] === 'は').map(w => w[0]),
        subject: contentWords.filter(w => w[0] === 'が').map(w => w[0]),
        object: contentWords.filter(w => w[0] === 'を').map(w => w[0]),
        indirect: contentWords.filter(w => w[0] === 'に').map(w => w[0]),
        direction: contentWords.filter(w => w[0] === 'へ').map(w => w[0]),
        other: contentWords.filter(w => w[1] === '助詞' && !['は', 'が', 'を', 'に', 'へ'].includes(w[0])).map(w => w[0])
      },
      wordOrder: {
        isValid: true,
        errors: []
      }
    };
  }

  public static calculateScore(
    words: MecabFeatures[], 
    analysis: GrammarAnalysis
  ): GrammarScore {
    // 去掉句号
    const contentWords = words.filter(w => w[1] !== '記号');
    
    console.log('计算分数，词组:', contentWords.map(w => ({
      surface: w[0],
      pos: w[1],
      pos1: w[2]
    })));

    // 1. 检查感叹词
    if (contentWords.length === 1 && contentWords[0][1] === '感動詞') {
      console.log('检测到感叹词');
      return {
        total: 100,
        structure: 35,
        predicate: 25,
        particles: 20,
        wordOrder: 10,
        details: ['感叹词表达完整']
      };
    }

    // 2. 检查简单句型（名词/形容动词 + です）
    if (contentWords.length === 2 && 
        (contentWords[0][1] === '名詞' || contentWords[0][2] === '形容動詞語幹') &&
        contentWords[1][1] === '助動詞') {
      console.log('检测到简单句型');
      return {
        total: 100,
        structure: 35,
        predicate: 25,
        particles: 20,
        wordOrder: 10,
        details: ['简单句型完整']
      };
    }

    // 3. 检查基本句型
    const hasSubject = contentWords.some((w, i) => 
      w[1] === '名詞' && 
      i + 1 < contentWords.length && 
      contentWords[i + 1][0] === 'は'
    );

    const hasPredicate = contentWords.some(w => 
      w[1] === '動詞' || 
      w[1] === '助動詞'
    );

    const hasParticles = contentWords.some(w => w[1] === '助詞');

    console.log('句型分析:', {
      hasSubject,
      hasPredicate,
      hasParticles
    });

    // 4. 计算得分
    const score = {
      structure: hasSubject ? 35 : 15,
      predicate: hasPredicate ? 25 : 0,
      particles: hasParticles ? 20 : 0,
      wordOrder: 10
    };

    const total = score.structure + score.predicate + score.particles + score.wordOrder;

    // 5. 生成评价详情
    const details = [];
    if (hasSubject) details.push('主语结构完整');
    if (hasPredicate) details.push('谓语使用正确');
    if (hasParticles) details.push('助词使用恰当');
    details.push('基本语序正确');

    return {
      total,
      ...score,
      details
    };
  }
} 