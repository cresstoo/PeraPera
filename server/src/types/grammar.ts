// 语法分析结果接口
export interface GrammarAnalysis {
  // 结构分析
  structure: {
    hasSubject: boolean;
    hasTopic: boolean;
    hasObject: boolean;
    hasIndirectObject: boolean;
    hasPredicate: boolean;
    hasModifier: boolean;
  };
  // 谓语分析
  predicate: {
    type: 'verb' | 'adjective' | 'copula' | null;
    form: {
      tense: 'present' | 'past' | null;
      polarity: 'positive' | 'negative';
      style: 'plain' | 'polite' | null;
      aspect: 'simple' | 'progressive' | 'perfect' | null;
    };
  };
  // 助词分析
  particles: {
    topic: string[];
    subject: string[];
    object: string[];
    indirect: string[];
    direction: string[];
    other: string[];
  };
  // 语序分析
  wordOrder: {
    isValid: boolean;
    errors: string[];
  };
}

// 语法评分结果
export interface GrammarScore {
  total: number;       // 总分
  structure: number;   // 结构分
  predicate: number;   // 谓语分
  particles: number;   // 助词分
  wordOrder: number;   // 语序分
  details: string[];   // 评价详情
} 