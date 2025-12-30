const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email, password, name, role = 'student') =>
    apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  getMe: () => apiFetch('/auth/me'),
};

// Transcription API
export const transcribeApi = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Transcription failed' }));
      throw new Error(error.error || 'Transcription failed');
    }

    return response.json();
  },
};

// Verification API
export const verifyApi = {
  verify: (transcription, originalText, surahNumber, verseRange) =>
    apiFetch('/verify', {
      method: 'POST',
      body: JSON.stringify({ transcription, originalText, surahNumber, verseRange }),
    }),

  quickVerify: (transcription, originalText) =>
    apiFetch('/verify/quick', {
      method: 'POST',
      body: JSON.stringify({ transcription, originalText }),
    }),
};

// Quran API
export const quranApi = {
  getSurahs: () => apiFetch('/quran/surahs'),

  getSurah: (number) => apiFetch(`/quran/surahs/${number}`),

  getVerses: (surahNumber, start, end) => {
    let url = `/quran/surahs/${surahNumber}/verses`;
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    return apiFetch(url);
  },

  getJuz: () => apiFetch('/quran/juz'),

  searchSurahs: (query) => apiFetch(`/quran/search?q=${encodeURIComponent(query)}`),
};

// Attempts API
export const attemptsApi = {
  getAttempts: (limit = 20, offset = 0, surah = null) => {
    let url = `/attempts?limit=${limit}&offset=${offset}`;
    if (surah) url += `&surah=${surah}`;
    return apiFetch(url);
  },

  saveAttempt: (attempt) =>
    apiFetch('/attempts', {
      method: 'POST',
      body: JSON.stringify(attempt),
    }),

  getAttempt: (id) => apiFetch(`/attempts/${id}`),

  deleteAttempt: (id) =>
    apiFetch(`/attempts/${id}`, { method: 'DELETE' }),

  getStats: () => apiFetch('/attempts/stats/summary'),
};

export default {
  auth: authApi,
  transcribe: transcribeApi,
  verify: verifyApi,
  quran: quranApi,
  attempts: attemptsApi,
};
