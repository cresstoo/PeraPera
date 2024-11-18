"use strict";
// 修饰语位置测试用例
const modifierTests = [
    {
        text: '大きい犬',
        expect: {
            modifier: true,
            modifierType: 'adjective',
            position: 'correct'
        }
    },
    {
        text: 'とても早く走ります',
        expect: {
            modifier: true,
            modifierType: 'adverb',
            position: 'correct'
        }
    },
    {
        text: '犬大きい',
        expect: {
            modifier: true,
            position: 'incorrect',
            error: '形容词位置不当'
        }
    }
];
