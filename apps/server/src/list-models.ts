import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const response = await ai.models.list();
    console.log('Available models response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
