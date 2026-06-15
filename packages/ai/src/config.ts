import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export const openaiKey = process.env.OPENAI_API_KEY || '';
export const geminiKey = process.env.GEMINI_API_KEY || '';

export const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
export const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

export const hasAIConfig = !!(openaiKey || geminiKey);
