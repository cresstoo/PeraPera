// 语法分析结果接口
export interface GrammarAnalysis {
  // 句子结构分析
  structure: {
    hasSubject: boolean;     // 主语
    hasTopic: boolean;       // 主题（は）
    hasObject: boolean;      // 宾语（を）
    hasIndirectObject: boolean; // 间接宾语（に）
    hasPredicate: boolean;   // 谓语
    hasModifier: boolean;    // 修饰语
  };

  // 谓语分析
  predicate: {
    type: 'verb' | 'adjective' | 'copula' | null;  // 谓语类型
    form: {
      tense: 'present' | 'past' | null;     // 时态
      polarity: 'positive' | 'negative';     // 肯定/否定
      style: 'plain' | 'polite' | null;      // 简体/敬体
      aspect: 'simple' | 'progressive' | 'perfect' | null; // 体
    };
  };

  // 助词使用分析
  particles: {
    topic: string[];      // は、も
    subject: string[];    // が
    object: string[];     // を
    indirect: string[];   // に、へ
    direction: string[];  // から、まで
    other: string[];     // で、と等
  };

  // 语序分析
  wordOrder: {
    isValid: boolean;     // 语序是否正确
    errors: string[];     // 语序错误描述
  };
}

// 语法评分结果
export interface GrammarScore {
  total: number;          // 总分
  structure: number;      // 结构分
  predicate: number;      // 谓语分
  particles: number;      // 助词分
  wordOrder: number;      // 语序分
  details: string[];      // 详细评分说明
} 