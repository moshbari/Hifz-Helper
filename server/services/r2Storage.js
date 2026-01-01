// server/services/r2Storage.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'hifz-recordings';

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload audio file to R2
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Filename to store as
 * @param {string} contentType - MIME type (e.g., 'audio/webm')
 * @returns {Promise<{key: string, url: string}>}
 */
export async function uploadAudio(audioBuffer, filename, contentType = 'audio/webm') {
  const key = `recordings/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: audioBuffer,
    ContentType: contentType,
    Metadata: {
      'uploaded-at': new Date().toISOString(),
      'expires-after': '7-days',
    },
  });

  await r2Client.send(command);
  
  return {
    key,
    url: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`,
  };
}

/**
 * Get a signed URL for accessing audio (valid for 1 hour)
 * @param {string} key - The storage key
 * @returns {Promise<string>} Signed URL
 */
export async function getAudioUrl(key) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  // URL valid for 1 hour
  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return signedUrl;
}

/**
 * Delete audio file from R2
 * @param {string} key - The storage key
 */
export async function deleteAudio(key) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Clean up recordings older than 7 days
 * Run this as a scheduled job (e.g., daily via cron)
 */
export async function cleanupOldRecordings() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const listCommand = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: 'recordings/',
  });

  const response = await r2Client.send(listCommand);
  const deletedKeys = [];

  if (response.Contents) {
    for (const object of response.Contents) {
      if (object.LastModified < sevenDaysAgo) {
        await deleteAudio(object.Key);
        deletedKeys.push(object.Key);
      }
    }
  }

  console.log(`Cleaned up ${deletedKeys.length} old recordings`);
  return deletedKeys;
}

export default {
  uploadAudio,
  getAudioUrl,
  deleteAudio,
  cleanupOldRecordings,
};
