import axios from 'axios';
import * as cheerio from 'cheerio';

export class JEVService {
  private static BASE_URL = 'https://jreadability.net/jev/';

  static async searchWord(word: string): Promise<{
    meaning: string;
    reading: string;
    examples: string[];
    collocations: string[];
  } | null> {
    try {
      const response = await axios.get(this.BASE_URL, {
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

    } catch (error) {
      console.error('JEV查询失败:', error);
      return null;
    }
  }
} 