"use strict";
// 语体一致性测试用例
const styleTests = [
    {
        text: '私は学生です。元気です。',
        expect: {
            style: 'polite',
            consistent: true
        }
    },
    {
        text: '私は学生です。元気だ。',
        expect: {
            style: 'mixed',
            consistent: false,
            error: '敬体和简体不应混用'
        }
    }
];
