// server/routes/audio.js
import express from 'express';
import multer from 'multer';
import { uploadAudio, getAudioUrl, deleteAudio, cleanupOldRecordings } from '../services/r2Storage.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
});

/**
 * POST /api/audio/upload
 * Upload audio recording to R2
 */
router.post('/upload', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { attemptId } = req.body;
    const userId = req.user.id;
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${attemptId || timestamp}_${timestamp}.webm`;

    const result = await uploadAudio(req.file.buffer, filename, req.file.mimetype);

    res.json({
      success: true,
      key: result.key,
      message: 'Audio uploaded successfully',
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

/**
 * GET /api/audio/:key
 * Get signed URL for audio playback
 */
router.get('/:key(*)', authenticateToken, async (req, res) => {
  try {
    const key = req.params.key;
    
    if (!key) {
      return res.status(400).json({ error: 'Audio key required' });
    }

    const signedUrl = await getAudioUrl(key);
    
    res.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error('Get audio URL error:', error);
    res.status(500).json({ error: 'Failed to get audio URL' });
  }
});

/**
 * DELETE /api/audio/:key
 * Delete audio recording
 */
router.delete('/:key(*)', authenticateToken, async (req, res) => {
  try {
    const key = req.params.key;
    
    await deleteAudio(key);
    
    res.json({
      success: true,
      message: 'Audio deleted successfully',
    });
  } catch (error) {
    console.error('Delete audio error:', error);
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

/**
 * POST /api/audio/cleanup
 * Manually trigger cleanup of old recordings (admin only)
 * In production, run this as a scheduled cron job
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Optional: Add admin check here
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const deletedKeys = await cleanupOldRecordings();
    
    res.json({
      success: true,
      deletedCount: deletedKeys.length,
      deletedKeys,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup old recordings' });
  }
});

export default router;
