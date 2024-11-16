const API_URL = 'http://localhost:3001';

export class MecabService {
  static async analyzeSentence(text: string): Promise<{
    isValid: boolean;
    grammarScore: number;
    details: string[];
  }> {
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MeCab分析错误:', error);
      return {
        isValid: true,
        grammarScore: 70,
        details: [`基本分析: ${text}`]
      };
    }
  }
} 