// server/routes/audio.js
import express from 'express';
import multer from 'multer';
import { uploadAudio, getAudioUrl, deleteAudio, cleanupOldRecordings } from '../services/r2Storage.js';
import { requireAuth } from '../middleware/auth.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';

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
router.get('/:key(*)', requireAuth, async (req, res) => {
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
 * POST /api/audio/retranscribe
 * Re-transcribe audio from R2
 */
router.post('/retranscribe', requireAuth, async (req, res) => {
  try {
    const { audioKey } = req.body;
    
    if (!audioKey) {
      return res.status(400).json({ error: 'Audio key required' });
    }

    // Get the audio from R2
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'hifz-recordings',
      Key: audioKey,
    });

    const response = await r2Client.send(command);
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    // Send to OpenAI for transcription
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Create a File-like object for OpenAI
    const file = {
      buffer: audioBuffer,
      originalname: 'audio.webm',
      mimetype: 'audio/webm',
    };

    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'ar',
    });

    res.json({
      success: true,
      transcription: transcription.text,
    });
  } catch (error) {
    console.error('Re-transcribe error:', error);
    res.status(500).json({ error: 'Failed to re-transcribe audio' });
  }
});

/**
 * DELETE /api/audio/:key
 * Delete audio recording
 */
router.delete('/:key(*)', requireAuth, async (req, res) => {
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
 */
router.post('/cleanup', requireAuth, async (req, res) => {
  try {
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
