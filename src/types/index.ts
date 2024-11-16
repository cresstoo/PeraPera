export interface PracticeSentence {
  id: string;
  text: string;
  level: 'easy' | 'medium' | 'hard';
  translation?: string;
}

export const PRACTICE_SENTENCES: PracticeSentence[] = [
  {
    id: '1',
    text: 'こんにちは',
    level: 'easy',
    translation: '你好'
  },
  {
    id: '2',
    text: 'はじめまして、よろしくお願いします',
    level: 'easy',
    translation: '初次见面，请多关照'
  },
  {
    id: '3',
    text: '今日は天気がとてもいいですね',
    level: 'medium',
    translation: '今天天气真好啊'
  },
  {
    id: '4',
    text: '日本語の勉強を頑張っています',
    level: 'medium',
    translation: '我在努力学习日语'
  },
  {
    id: '5',
    text: '将来は日本で仕事をしたいと思っています',
    level: 'hard',
    translation: '我想将来在日本工作'
  }
]; 