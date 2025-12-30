import express from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage for development without Supabase
const memoryStore = new Map();

/**
 * GET /api/attempts
 * Get user's attempt history
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, surah } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase
        .from('hifz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (surah) {
        query = query.eq('surah_number', parseInt(surah));
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return res.json({ attempts: data, total: count });
    }

    // Development: use in-memory store
    const userAttempts = memoryStore.get(userId) || [];
    let filtered = userAttempts;
    
    if (surah) {
      filtered = userAttempts.filter(a => a.surah_number === parseInt(surah));
    }

    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({ attempts: paginated, total: filtered.length });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

/**
 * POST /api/attempts
 * Save a new attempt
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      surahNumber,
      surahName,
      verseStart,
      verseEnd,
      transcription,
      originalText,
      accuracy,
      wordResults,
      errors,
      duration,
      status,
    } = req.body;

    const attempt = {
      user_id: userId,
      surah_number: surahNumber,
      surah_name: surahName,
      verse_start: verseStart,
      verse_end: verseEnd,
      transcription,
      original_text: originalText,
      accuracy,
      word_results: wordResults,
      errors,
      duration,
      status: status || (accuracy >= 85 ? 'passed' : 'needs_review'),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hifz_attempts')
        .insert(attempt)
        .select()
        .single();

      if (error) throw error;

      return res.json({ success: true, attempt: data });
    }

    // Development: use in-memory store
    attempt.id = Date.now().toString();
    const userAttempts = memoryStore.get(userId) || [];
    userAttempts.unshift(attempt);
    memoryStore.set(userId, userAttempts);

    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Error saving attempt:', error);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
});

/**
 * GET /api/attempts/:id
 * Get specific attempt details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const attemptId = req.params.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hifz_attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      return res.json({ attempt: data });
    }

    // Development: use in-memory store
    const userAttempts = memoryStore.get(userId) || [];
    const attempt = userAttempts.find(a => a.id === attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json({ attempt });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

/**
 * DELETE /api/attempts/:id
 * Delete an attempt
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const attemptId = req.params.id;

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('hifz_attempts')
        .delete()
        .eq('id', attemptId)
        .eq('user_id', userId);

      if (error) throw error;

      return res.json({ success: true });
    }

    // Development: use in-memory store
    const userAttempts = memoryStore.get(userId) || [];
    const filtered = userAttempts.filter(a => a.id !== attemptId);
    memoryStore.set(userId, filtered);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting attempt:', error);
    res.status(500).json({ error: 'Failed to delete attempt' });
  }
});

/**
 * GET /api/attempts/stats/summary
 * Get user's overall statistics
 */
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hifz_attempts')
        .select('accuracy, status, surah_number, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = calculateStats(data);
      return res.json({ stats });
    }

    // Development: use in-memory store
    const userAttempts = memoryStore.get(userId) || [];
    const stats = calculateStats(userAttempts);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to calculate statistics
function calculateStats(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageAccuracy: 0,
      passedCount: 0,
      needsReviewCount: 0,
      uniqueSurahs: 0,
      streakDays: 0,
      lastPractice: null,
    };
  }

  const totalAttempts = attempts.length;
  const averageAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts
  );
  const passedCount = attempts.filter(a => a.status === 'passed').length;
  const needsReviewCount = attempts.filter(a => a.status === 'needs_review').length;
  const uniqueSurahs = new Set(attempts.map(a => a.surah_number)).size;
  
  // Calculate streak
  const sortedDates = [...new Set(
    attempts.map(a => new Date(a.created_at).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a));
  
  let streakDays = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    streakDays = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const prev = new Date(sortedDates[i - 1]);
      const diffDays = Math.round((prev - current) / 86400000);
      
      if (diffDays === 1) {
        streakDays++;
      } else {
        break;
      }
    }
  }

  return {
    totalAttempts,
    averageAccuracy,
    passedCount,
    needsReviewCount,
    uniqueSurahs,
    streakDays,
    lastPractice: attempts[0]?.created_at || null,
  };
}

export default router;
