import express from 'express';
import { verifyRecitation } from '../services/openai.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/verify
 * Verify transcription against original Quran text
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { transcription, originalText, surahNumber, verseRange } = req.body;

    if (!transcription || !originalText) {
      return res.status(400).json({ 
        error: 'Missing required fields: transcription and originalText' 
      });
    }

    console.log(`✅ Verifying recitation for Surah ${surahNumber}, verses ${verseRange?.start}-${verseRange?.end}`);

    const result = await verifyRecitation(transcription, originalText, {
      surahNumber,
      verseRange,
    });

    res.json({
      success: true,
      verification: result,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/verify/quick
 * Quick accuracy check without detailed word-by-word analysis
 */
router.post('/quick', requireAuth, async (req, res) => {
  try {
    const { transcription, originalText } = req.body;

    if (!transcription || !originalText) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Simple Levenshtein-based accuracy check
    const accuracy = calculateSimilarity(
      normalizeArabic(transcription),
      normalizeArabic(originalText)
    );

    res.json({
      success: true,
      accuracy: Math.round(accuracy * 100),
      isCorrect: accuracy >= 0.85,
    });
  } catch (error) {
    console.error('Quick verification error:', error);
    res.status(500).json({ error: 'Quick verification failed' });
  }
});

// Helper functions
function normalizeArabic(text) {
  return text
    .replace(/[\u064B-\u0652]/g, '') // Remove tashkeel (diacritics)
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export default router;
