// Add these functions to your existing client/src/services/api.js file

// ============================================
// AUDIO API - Add to your api.js
// ============================================

export const audioApi = {
  /**
   * Upload audio recording to R2 storage
   * @param {Blob} audioBlob - The audio blob from recording
   * @param {string} attemptId - Optional attempt ID to associate with
   * @returns {Promise<{key: string}>}
   */
  async uploadAudio(audioBlob, attemptId = null) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    if (attemptId) {
      formData.append('attemptId', attemptId);
    }

    const response = await fetch(`${API_BASE}/audio/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload audio');
    }

    return response.json();
  },

  /**
   * Get signed URL for audio playback
   * @param {string} key - The R2 storage key
   * @returns {Promise<{url: string}>}
   */
  async getAudioUrl(key) {
    const response = await fetch(`${API_BASE}/audio/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get audio URL');
    }

    return response.json();
  },

  /**
   * Delete audio recording
   * @param {string} key - The R2 storage key
   */
  async deleteAudio(key) {
    const response = await fetch(`${API_BASE}/audio/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete audio');
    }

    return response.json();
  },
};
