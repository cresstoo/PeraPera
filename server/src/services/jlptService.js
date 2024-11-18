"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JLPTService = void 0;
class JLPTService {
    // 获取单词信息（带缓存）
    static async getWordInfo(word) {
        // 先检查缓存
        if (this.cache.has(word)) {
            return this.cache.get(word) || null;
        }
        try {
            const response = await fetch(`${this.BASE_URL}/words?word=${encodeURIComponent(word)}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            // 缓存结果
            if (data.words[0]) {
                this.cache.set(word, data.words[0]);
            }
            return data.words[0] || null;
        }
        catch (error) {
            console.error('获取JLPT单词信息失败:', error);
            return null;
        }
    }
    // 分析句子中词汇的JLPT等级分布
    static async analyzeSentenceLevel(words) {
        const wordDetails = await Promise.all(words.map(async (word) => {
            const info = await this.getWordInfo(word);
            return {
                word,
                level: (info === null || info === void 0 ? void 0 : info.level) || null,
                meaning: info === null || info === void 0 ? void 0 : info.meaning,
                furigana: info === null || info === void 0 ? void 0 : info.furigana
            };
        }));
        // 计算等级分布
        const distribution = wordDetails.reduce((acc, detail) => {
            if (detail.level) {
                acc[detail.level] = (acc[detail.level] || 0) + 1;
            }
            return acc;
        }, {});
        // 计算平均等级
        const validLevels = wordDetails
            .map(w => w.level)
            .filter((level) => level !== null);
        const averageLevel = validLevels.length > 0
            ? validLevels.reduce((sum, level) => sum + level, 0) / validLevels.length
            : 0;
        return {
            averageLevel,
            distribution,
            details: wordDetails
        };
    }
    // 预加载常用词汇
    static async preloadCommonWords() {
        try {
            // 预加载 N5 和 N4 的常用词
            for (const level of [5, 4]) {
                const response = await fetch(`${this.BASE_URL}/words/all?level=${level}`);
                if (!response.ok)
                    continue;
                const data = await response.json();
                // 缓存所有词汇
                data.words.forEach(word => {
                    this.cache.set(word.word, word);
                });
            }
            console.log('预加载JLPT常用词完成');
        }
        catch (error) {
            console.error('预加载JLPT词汇失败:', error);
        }
    }
}
exports.JLPTService = JLPTService;
JLPTService.BASE_URL = 'https://jlpt-vocab-api.vercel.app/api';
JLPTService.cache = new Map();
