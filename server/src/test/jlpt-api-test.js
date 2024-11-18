"use strict";
async function testJLPTApi() {
    const BASE_URL = 'https://jlpt-vocab-api.vercel.app/api';
    console.log('开始测试 JLPT API...');
    // 测试更多常用词
    const testWords = ['おはよう', 'こんにちは', '学校', '勉強'];
    for (const word of testWords) {
        try {
            console.log(`\n测试: 获取单词 "${word}" 的信息`);
            const response = await fetch(`${BASE_URL}/words?word=${encodeURIComponent(word)}`);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('结果:', data);
        }
        catch (error) {
            console.error(`测试 "${word}" 失败:`, error);
        }
    }
    // 测试所有JLPT等级
    for (let level = 5; level >= 1; level--) {
        try {
            console.log(`\n测试: 获取 N${level} 级词汇（前5个）`);
            const response = await fetch(`${BASE_URL}/words?level=${level}&limit=5`);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('结果:', data);
        }
        catch (error) {
            console.error(`测试 N${level} 失败:`, error);
        }
    }
}
// 运行测试
testJLPTApi().then(() => {
    console.log('\n测试完成');
}).catch(error => {
    console.error('测试过程出错:', error);
});
