"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JEVService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class JEVService {
    static async searchWord(word) {
        try {
            const response = await axios_1.default.get(this.BASE_URL, {
                params: { keyword: word }
            });
            const $ = cheerio.load(response.data);
            // 解析页面内容
            const meaning = $('.word-meaning').first().text().trim();
            const reading = $('.word-reading').first().text().trim();
            // 获取例句
            const examples = $('.example-sentence')
                .map((_, el) => $(el).text().trim())
                .get()
                .filter(text => text.length > 0);
            // 获取搭配
            const collocations = $('.collocation')
                .map((_, el) => $(el).text().trim())
                .get()
                .filter(text => text.length > 0);
            // 确保至少有基本信息
            if (!meaning && !reading) {
                console.log('未找到单词信息:', word);
                return null;
            }
            return {
                meaning,
                reading,
                examples,
                collocations
            };
        }
        catch (error) {
            console.error('JEV查询失败:', error);
            return null;
        }
    }
}
exports.JEVService = JEVService;
JEVService.BASE_URL = 'https://jreadability.net/jev/';
