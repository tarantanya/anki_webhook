import { GoogleGenAI } from "@google/genai";


export default class Gemini {
  constructor() {
    this._ai = new GoogleGenAI({ apiKey: "AIzaSyCdi3gJ3BK_KKaS2di1NW35CJflUySdTB4" });
  }

  async checkSentence(sentence) {
    try {
      const res =  await this._ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Ты учитель английского, я студент с уровнем A2. У меня есть 3 слова и мне нужно сделать с ними простое предложение. Я пишу предложения на английском, а ты исправляй если я сделала ошибку: ${sentence}`,
      });
      console.log(res);
      if (res.text) {
        return res.text;
      }
      else {
        console.log("Ошибка в ответе Gemini:", res);
        return `Ошибка в ответе Gemini: ${res}`;
      }
    } catch (error) {
      console.error("Ошибка gemini:", error);
      return `Ошибка Gemini: ${error}`;
    }
  }
}