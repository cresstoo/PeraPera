// 修饰语位置测试用例
const modifierTests = [
  {
    text: '大きい犬',  // 形容词修饰
    expect: {
      modifier: true,
      modifierType: 'adjective',
      position: 'correct'
    }
  },
  {
    text: 'とても早く走ります',  // 副词修饰
    expect: {
      modifier: true,
      modifierType: 'adverb',
      position: 'correct'
    }
  },
  {
    text: '犬大きい',  // 错误的修饰语位置
    expect: {
      modifier: true,
      position: 'incorrect',
      error: '形容词位置不当'
    }
  }
]; 