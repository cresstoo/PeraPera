// 错误检测测试用例
const errorTests = [
  {
    text: '私が学生は',  // 助词重复
    expect: {
      error: 'particle_conflict',
      score: { particles: 0 }
    }
  },
  {
    text: '本読みます',  // 缺少助词
    expect: {
      error: 'missing_particle',
      score: { particles: 5 }  // 部分得分
    }
  }
]; 