"use strict";
// 复杂句型测试用例
const complexTests = [
    {
        text: '私は図書館で本を読んでいます',
        expect: {
            particles: ['は', 'で', 'を'],
            aspect: 'progressive',
            style: 'polite'
        }
    },
    {
        text: '友達に手紙を書いてあげました',
        expect: {
            particles: ['に', 'を'],
            tense: 'past',
            benefactive: true
        }
    }
];
