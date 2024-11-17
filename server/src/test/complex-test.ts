// 复杂句型测试用例
const complexTests = [
  {
    text: '私は図書館で本を読んでいます',  // 场所助词+进行时
    expect: {
      particles: ['は', 'で', 'を'],
      aspect: 'progressive',
      style: 'polite'
    }
  },
  {
    text: '友達に手紙を書いてあげました',  // 授受表现
    expect: {
      particles: ['に', 'を'],
      tense: 'past',
      benefactive: true
    }
  }
]; 