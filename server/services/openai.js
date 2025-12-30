import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio using OpenAI Whisper
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<{text: string, language: string}>}
 */
export async function transcribeAudio(audioFilePath) {
  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
      language: 'ar', // Arabic
      response_format: 'verbose_json',
    });

    return {
      text: response.text,
      language: response.language,
      duration: response.duration,
      segments: response.segments || [],
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Verify recitation against Quran text using Claude
 * Note: This uses OpenAI for now, but you can swap to Anthropic Claude
 * @param {string} transcription - The transcribed text
 * @param {string} originalText - The original Quran text
 * @param {object} options - Additional options
 * @returns {Promise<object>} Verification result
 */
export async function verifyRecitation(transcription, originalText, options = {}) {
  try {
    const prompt = `You are an expert Quran recitation verifier. Compare the student's recitation against the original Quranic text.

ORIGINAL QURAN TEXT:
${originalText}

STUDENT'S RECITATION (transcribed):
${transcription}

Analyze the recitation and provide a detailed JSON response with this exact structure:
{
  "overallAccuracy": <number 0-100>,
  "isCorrect": <boolean>,
  "wordByWord": [
    {
      "original": "<original word>",
      "recited": "<what student said or null if missed>",
      "status": "correct" | "incorrect" | "missed" | "extra",
      "position": <word position number>
    }
  ],
  "errors": [
    {
      "type": "substitution" | "omission" | "addition" | "pronunciation",
      "position": <position>,
      "original": "<what should have been said>",
      "recited": "<what was actually said>",
      "suggestion": "<helpful correction tip>"
    }
  ],
  "summary": "<brief summary of performance>",
  "encouragement": "<positive, encouraging message in English>"
}

Be lenient with minor pronunciation variations that don't change meaning. Focus on significant errors.
Respond ONLY with valid JSON, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a Quran recitation verification assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error(`Verification failed: ${error.message}`);
  }
}
