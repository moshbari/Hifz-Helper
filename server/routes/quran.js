import express from 'express';

const router = express.Router();

// Surah metadata (all 114 surahs)
const SURAHS = [
  { number: 1, name: 'Al-Fatiha', nameAr: 'الفاتحة', versesCount: 7, revelationType: 'Meccan' },
  { number: 2, name: 'Al-Baqarah', nameAr: 'البقرة', versesCount: 286, revelationType: 'Medinan' },
  { number: 3, name: 'Aal-E-Imran', nameAr: 'آل عمران', versesCount: 200, revelationType: 'Medinan' },
  { number: 4, name: 'An-Nisa', nameAr: 'النساء', versesCount: 176, revelationType: 'Medinan' },
  { number: 5, name: 'Al-Maidah', nameAr: 'المائدة', versesCount: 120, revelationType: 'Medinan' },
  { number: 6, name: 'Al-Anam', nameAr: 'الأنعام', versesCount: 165, revelationType: 'Meccan' },
  { number: 7, name: 'Al-Araf', nameAr: 'الأعراف', versesCount: 206, revelationType: 'Meccan' },
  { number: 8, name: 'Al-Anfal', nameAr: 'الأنفال', versesCount: 75, revelationType: 'Medinan' },
  { number: 9, name: 'At-Tawbah', nameAr: 'التوبة', versesCount: 129, revelationType: 'Medinan' },
  { number: 10, name: 'Yunus', nameAr: 'يونس', versesCount: 109, revelationType: 'Meccan' },
  { number: 11, name: 'Hud', nameAr: 'هود', versesCount: 123, revelationType: 'Meccan' },
  { number: 12, name: 'Yusuf', nameAr: 'يوسف', versesCount: 111, revelationType: 'Meccan' },
  { number: 13, name: 'Ar-Rad', nameAr: 'الرعد', versesCount: 43, revelationType: 'Medinan' },
  { number: 14, name: 'Ibrahim', nameAr: 'إبراهيم', versesCount: 52, revelationType: 'Meccan' },
  { number: 15, name: 'Al-Hijr', nameAr: 'الحجر', versesCount: 99, revelationType: 'Meccan' },
  { number: 16, name: 'An-Nahl', nameAr: 'النحل', versesCount: 128, revelationType: 'Meccan' },
  { number: 17, name: 'Al-Isra', nameAr: 'الإسراء', versesCount: 111, revelationType: 'Meccan' },
  { number: 18, name: 'Al-Kahf', nameAr: 'الكهف', versesCount: 110, revelationType: 'Meccan' },
  { number: 19, name: 'Maryam', nameAr: 'مريم', versesCount: 98, revelationType: 'Meccan' },
  { number: 20, name: 'Ta-Ha', nameAr: 'طه', versesCount: 135, revelationType: 'Meccan' },
  { number: 21, name: 'Al-Anbiya', nameAr: 'الأنبياء', versesCount: 112, revelationType: 'Meccan' },
  { number: 22, name: 'Al-Hajj', nameAr: 'الحج', versesCount: 78, revelationType: 'Medinan' },
  { number: 23, name: 'Al-Muminun', nameAr: 'المؤمنون', versesCount: 118, revelationType: 'Meccan' },
  { number: 24, name: 'An-Nur', nameAr: 'النور', versesCount: 64, revelationType: 'Medinan' },
  { number: 25, name: 'Al-Furqan', nameAr: 'الفرقان', versesCount: 77, revelationType: 'Meccan' },
  { number: 26, name: 'Ash-Shuara', nameAr: 'الشعراء', versesCount: 227, revelationType: 'Meccan' },
  { number: 27, name: 'An-Naml', nameAr: 'النمل', versesCount: 93, revelationType: 'Meccan' },
  { number: 28, name: 'Al-Qasas', nameAr: 'القصص', versesCount: 88, revelationType: 'Meccan' },
  { number: 29, name: 'Al-Ankabut', nameAr: 'العنكبوت', versesCount: 69, revelationType: 'Meccan' },
  { number: 30, name: 'Ar-Rum', nameAr: 'الروم', versesCount: 60, revelationType: 'Meccan' },
  { number: 31, name: 'Luqman', nameAr: 'لقمان', versesCount: 34, revelationType: 'Meccan' },
  { number: 32, name: 'As-Sajdah', nameAr: 'السجدة', versesCount: 30, revelationType: 'Meccan' },
  { number: 33, name: 'Al-Ahzab', nameAr: 'الأحزاب', versesCount: 73, revelationType: 'Medinan' },
  { number: 34, name: 'Saba', nameAr: 'سبأ', versesCount: 54, revelationType: 'Meccan' },
  { number: 35, name: 'Fatir', nameAr: 'فاطر', versesCount: 45, revelationType: 'Meccan' },
  { number: 36, name: 'Ya-Sin', nameAr: 'يس', versesCount: 83, revelationType: 'Meccan' },
  { number: 37, name: 'As-Saffat', nameAr: 'الصافات', versesCount: 182, revelationType: 'Meccan' },
  { number: 38, name: 'Sad', nameAr: 'ص', versesCount: 88, revelationType: 'Meccan' },
  { number: 39, name: 'Az-Zumar', nameAr: 'الزمر', versesCount: 75, revelationType: 'Meccan' },
  { number: 40, name: 'Ghafir', nameAr: 'غافر', versesCount: 85, revelationType: 'Meccan' },
  { number: 41, name: 'Fussilat', nameAr: 'فصلت', versesCount: 54, revelationType: 'Meccan' },
  { number: 42, name: 'Ash-Shura', nameAr: 'الشورى', versesCount: 53, revelationType: 'Meccan' },
  { number: 43, name: 'Az-Zukhruf', nameAr: 'الزخرف', versesCount: 89, revelationType: 'Meccan' },
  { number: 44, name: 'Ad-Dukhan', nameAr: 'الدخان', versesCount: 59, revelationType: 'Meccan' },
  { number: 45, name: 'Al-Jathiyah', nameAr: 'الجاثية', versesCount: 37, revelationType: 'Meccan' },
  { number: 46, name: 'Al-Ahqaf', nameAr: 'الأحقاف', versesCount: 35, revelationType: 'Meccan' },
  { number: 47, name: 'Muhammad', nameAr: 'محمد', versesCount: 38, revelationType: 'Medinan' },
  { number: 48, name: 'Al-Fath', nameAr: 'الفتح', versesCount: 29, revelationType: 'Medinan' },
  { number: 49, name: 'Al-Hujurat', nameAr: 'الحجرات', versesCount: 18, revelationType: 'Medinan' },
  { number: 50, name: 'Qaf', nameAr: 'ق', versesCount: 45, revelationType: 'Meccan' },
  { number: 51, name: 'Adh-Dhariyat', nameAr: 'الذاريات', versesCount: 60, revelationType: 'Meccan' },
  { number: 52, name: 'At-Tur', nameAr: 'الطور', versesCount: 49, revelationType: 'Meccan' },
  { number: 53, name: 'An-Najm', nameAr: 'النجم', versesCount: 62, revelationType: 'Meccan' },
  { number: 54, name: 'Al-Qamar', nameAr: 'القمر', versesCount: 55, revelationType: 'Meccan' },
  { number: 55, name: 'Ar-Rahman', nameAr: 'الرحمن', versesCount: 78, revelationType: 'Medinan' },
  { number: 56, name: 'Al-Waqiah', nameAr: 'الواقعة', versesCount: 96, revelationType: 'Meccan' },
  { number: 57, name: 'Al-Hadid', nameAr: 'الحديد', versesCount: 29, revelationType: 'Medinan' },
  { number: 58, name: 'Al-Mujadila', nameAr: 'المجادلة', versesCount: 22, revelationType: 'Medinan' },
  { number: 59, name: 'Al-Hashr', nameAr: 'الحشر', versesCount: 24, revelationType: 'Medinan' },
  { number: 60, name: 'Al-Mumtahanah', nameAr: 'الممتحنة', versesCount: 13, revelationType: 'Medinan' },
  { number: 61, name: 'As-Saff', nameAr: 'الصف', versesCount: 14, revelationType: 'Medinan' },
  { number: 62, name: 'Al-Jumuah', nameAr: 'الجمعة', versesCount: 11, revelationType: 'Medinan' },
  { number: 63, name: 'Al-Munafiqun', nameAr: 'المنافقون', versesCount: 11, revelationType: 'Medinan' },
  { number: 64, name: 'At-Taghabun', nameAr: 'التغابن', versesCount: 18, revelationType: 'Medinan' },
  { number: 65, name: 'At-Talaq', nameAr: 'الطلاق', versesCount: 12, revelationType: 'Medinan' },
  { number: 66, name: 'At-Tahrim', nameAr: 'التحريم', versesCount: 12, revelationType: 'Medinan' },
  { number: 67, name: 'Al-Mulk', nameAr: 'الملك', versesCount: 30, revelationType: 'Meccan' },
  { number: 68, name: 'Al-Qalam', nameAr: 'القلم', versesCount: 52, revelationType: 'Meccan' },
  { number: 69, name: 'Al-Haqqah', nameAr: 'الحاقة', versesCount: 52, revelationType: 'Meccan' },
  { number: 70, name: 'Al-Maarij', nameAr: 'المعارج', versesCount: 44, revelationType: 'Meccan' },
  { number: 71, name: 'Nuh', nameAr: 'نوح', versesCount: 28, revelationType: 'Meccan' },
  { number: 72, name: 'Al-Jinn', nameAr: 'الجن', versesCount: 28, revelationType: 'Meccan' },
  { number: 73, name: 'Al-Muzzammil', nameAr: 'المزمل', versesCount: 20, revelationType: 'Meccan' },
  { number: 74, name: 'Al-Muddaththir', nameAr: 'المدثر', versesCount: 56, revelationType: 'Meccan' },
  { number: 75, name: 'Al-Qiyamah', nameAr: 'القيامة', versesCount: 40, revelationType: 'Meccan' },
  { number: 76, name: 'Al-Insan', nameAr: 'الإنسان', versesCount: 31, revelationType: 'Medinan' },
  { number: 77, name: 'Al-Mursalat', nameAr: 'المرسلات', versesCount: 50, revelationType: 'Meccan' },
  { number: 78, name: 'An-Naba', nameAr: 'النبأ', versesCount: 40, revelationType: 'Meccan' },
  { number: 79, name: 'An-Naziat', nameAr: 'النازعات', versesCount: 46, revelationType: 'Meccan' },
  { number: 80, name: 'Abasa', nameAr: 'عبس', versesCount: 42, revelationType: 'Meccan' },
  { number: 81, name: 'At-Takwir', nameAr: 'التكوير', versesCount: 29, revelationType: 'Meccan' },
  { number: 82, name: 'Al-Infitar', nameAr: 'الانفطار', versesCount: 19, revelationType: 'Meccan' },
  { number: 83, name: 'Al-Mutaffifin', nameAr: 'المطففين', versesCount: 36, revelationType: 'Meccan' },
  { number: 84, name: 'Al-Inshiqaq', nameAr: 'الانشقاق', versesCount: 25, revelationType: 'Meccan' },
  { number: 85, name: 'Al-Buruj', nameAr: 'البروج', versesCount: 22, revelationType: 'Meccan' },
  { number: 86, name: 'At-Tariq', nameAr: 'الطارق', versesCount: 17, revelationType: 'Meccan' },
  { number: 87, name: 'Al-Ala', nameAr: 'الأعلى', versesCount: 19, revelationType: 'Meccan' },
  { number: 88, name: 'Al-Ghashiyah', nameAr: 'الغاشية', versesCount: 26, revelationType: 'Meccan' },
  { number: 89, name: 'Al-Fajr', nameAr: 'الفجر', versesCount: 30, revelationType: 'Meccan' },
  { number: 90, name: 'Al-Balad', nameAr: 'البلد', versesCount: 20, revelationType: 'Meccan' },
  { number: 91, name: 'Ash-Shams', nameAr: 'الشمس', versesCount: 15, revelationType: 'Meccan' },
  { number: 92, name: 'Al-Layl', nameAr: 'الليل', versesCount: 21, revelationType: 'Meccan' },
  { number: 93, name: 'Ad-Duha', nameAr: 'الضحى', versesCount: 11, revelationType: 'Meccan' },
  { number: 94, name: 'Ash-Sharh', nameAr: 'الشرح', versesCount: 8, revelationType: 'Meccan' },
  { number: 95, name: 'At-Tin', nameAr: 'التين', versesCount: 8, revelationType: 'Meccan' },
  { number: 96, name: 'Al-Alaq', nameAr: 'العلق', versesCount: 19, revelationType: 'Meccan' },
  { number: 97, name: 'Al-Qadr', nameAr: 'القدر', versesCount: 5, revelationType: 'Meccan' },
  { number: 98, name: 'Al-Bayyinah', nameAr: 'البينة', versesCount: 8, revelationType: 'Medinan' },
  { number: 99, name: 'Az-Zalzalah', nameAr: 'الزلزلة', versesCount: 8, revelationType: 'Medinan' },
  { number: 100, name: 'Al-Adiyat', nameAr: 'العاديات', versesCount: 11, revelationType: 'Meccan' },
  { number: 101, name: 'Al-Qariah', nameAr: 'القارعة', versesCount: 11, revelationType: 'Meccan' },
  { number: 102, name: 'At-Takathur', nameAr: 'التكاثر', versesCount: 8, revelationType: 'Meccan' },
  { number: 103, name: 'Al-Asr', nameAr: 'العصر', versesCount: 3, revelationType: 'Meccan' },
  { number: 104, name: 'Al-Humazah', nameAr: 'الهمزة', versesCount: 9, revelationType: 'Meccan' },
  { number: 105, name: 'Al-Fil', nameAr: 'الفيل', versesCount: 5, revelationType: 'Meccan' },
  { number: 106, name: 'Quraysh', nameAr: 'قريش', versesCount: 4, revelationType: 'Meccan' },
  { number: 107, name: 'Al-Maun', nameAr: 'الماعون', versesCount: 7, revelationType: 'Meccan' },
  { number: 108, name: 'Al-Kawthar', nameAr: 'الكوثر', versesCount: 3, revelationType: 'Meccan' },
  { number: 109, name: 'Al-Kafirun', nameAr: 'الكافرون', versesCount: 6, revelationType: 'Meccan' },
  { number: 110, name: 'An-Nasr', nameAr: 'النصر', versesCount: 3, revelationType: 'Medinan' },
  { number: 111, name: 'Al-Masad', nameAr: 'المسد', versesCount: 5, revelationType: 'Meccan' },
  { number: 112, name: 'Al-Ikhlas', nameAr: 'الإخلاص', versesCount: 4, revelationType: 'Meccan' },
  { number: 113, name: 'Al-Falaq', nameAr: 'الفلق', versesCount: 5, revelationType: 'Meccan' },
  { number: 114, name: 'An-Nas', nameAr: 'الناس', versesCount: 6, revelationType: 'Meccan' },
];

// Juz data
const JUZ = [
  { number: 1, name: 'Alif Lam Mim', nameAr: 'آلم', startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141 },
  { number: 2, name: 'Sayaqul', nameAr: 'سيقول', startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252 },
  { number: 3, name: 'Tilka ar-Rusul', nameAr: 'تلك الرسل', startSurah: 2, startVerse: 253, endSurah: 3, endVerse: 92 },
  { number: 4, name: 'Lan Tana Lu', nameAr: 'لن تنالوا', startSurah: 3, startVerse: 93, endSurah: 4, endVerse: 23 },
  { number: 5, name: 'Wal Muhsanat', nameAr: 'والمحصنات', startSurah: 4, startVerse: 24, endSurah: 4, endVerse: 147 },
  { number: 6, name: 'La Yuhibbullah', nameAr: 'لا يحب الله', startSurah: 4, startVerse: 148, endSurah: 5, endVerse: 81 },
  { number: 7, name: 'Wa Idha Samiu', nameAr: 'وإذا سمعوا', startSurah: 5, startVerse: 82, endSurah: 6, endVerse: 110 },
  { number: 8, name: 'Wa Lau Annana', nameAr: 'ولو أننا', startSurah: 6, startVerse: 111, endSurah: 7, endVerse: 87 },
  { number: 9, name: 'Qal al-Mala', nameAr: 'قال الملأ', startSurah: 7, startVerse: 88, endSurah: 8, endVerse: 40 },
  { number: 10, name: 'Wa Alamu', nameAr: 'واعلموا', startSurah: 8, startVerse: 41, endSurah: 9, endVerse: 92 },
  { number: 11, name: 'Yatadhirun', nameAr: 'يعتذرون', startSurah: 9, startVerse: 93, endSurah: 11, endVerse: 5 },
  { number: 12, name: 'Wa Ma Min Dabbah', nameAr: 'وما من دابة', startSurah: 11, startVerse: 6, endSurah: 12, endVerse: 52 },
  { number: 13, name: 'Wa Ma Ubarriu', nameAr: 'وما أبرئ', startSurah: 12, startVerse: 53, endSurah: 14, endVerse: 52 },
  { number: 14, name: 'Rubama', nameAr: 'ربما', startSurah: 15, startVerse: 1, endSurah: 16, endVerse: 128 },
  { number: 15, name: 'Subhana Alladhi', nameAr: 'سبحان الذي', startSurah: 17, startVerse: 1, endSurah: 18, endVerse: 74 },
  { number: 16, name: 'Qal Alam', nameAr: 'قال ألم', startSurah: 18, startVerse: 75, endSurah: 20, endVerse: 135 },
  { number: 17, name: 'Iqtaraba', nameAr: 'اقترب', startSurah: 21, startVerse: 1, endSurah: 22, endVerse: 78 },
  { number: 18, name: 'Qad Aflaha', nameAr: 'قد أفلح', startSurah: 23, startVerse: 1, endSurah: 25, endVerse: 20 },
  { number: 19, name: 'Wa Qal Alladhina', nameAr: 'وقال الذين', startSurah: 25, startVerse: 21, endSurah: 27, endVerse: 55 },
  { number: 20, name: 'Amman Khalaqa', nameAr: 'أمن خلق', startSurah: 27, startVerse: 56, endSurah: 29, endVerse: 45 },
  { number: 21, name: 'Utlu Ma Uhiya', nameAr: 'اتل ما أوحي', startSurah: 29, startVerse: 46, endSurah: 33, endVerse: 30 },
  { number: 22, name: 'Wa Man Yaqnut', nameAr: 'ومن يقنت', startSurah: 33, startVerse: 31, endSurah: 36, endVerse: 27 },
  { number: 23, name: 'Wa Mali', nameAr: 'وما لي', startSurah: 36, startVerse: 28, endSurah: 39, endVerse: 31 },
  { number: 24, name: 'Fa Man Azlamu', nameAr: 'فمن أظلم', startSurah: 39, startVerse: 32, endSurah: 41, endVerse: 46 },
  { number: 25, name: 'Ilayhi Yuraddu', nameAr: 'إليه يرد', startSurah: 41, startVerse: 47, endSurah: 45, endVerse: 37 },
  { number: 26, name: 'Ha Mim', nameAr: 'حم', startSurah: 46, startVerse: 1, endSurah: 51, endVerse: 30 },
  { number: 27, name: 'Qala Fa Ma Khatbukum', nameAr: 'قال فما خطبكم', startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29 },
  { number: 28, name: 'Qad Sami Allah', nameAr: 'قد سمع الله', startSurah: 58, startVerse: 1, endSurah: 66, endVerse: 12 },
  { number: 29, name: 'Tabaraka Alladhi', nameAr: 'تبارك الذي', startSurah: 67, startVerse: 1, endSurah: 77, endVerse: 50 },
  { number: 30, name: 'Amma', nameAr: 'عم', startSurah: 78, startVerse: 1, endSurah: 114, endVerse: 6 },
];

/**
 * GET /api/quran/surahs
 * Get list of all surahs
 */
router.get('/surahs', (req, res) => {
  res.json({ surahs: SURAHS });
});

/**
 * GET /api/quran/surahs/:number
 * Get surah metadata
 */
router.get('/surahs/:number', (req, res) => {
  const surahNumber = parseInt(req.params.number);
  const surah = SURAHS.find(s => s.number === surahNumber);
  
  if (!surah) {
    return res.status(404).json({ error: 'Surah not found' });
  }
  
  res.json({ surah });
});

/**
 * GET /api/quran/surahs/:number/verses
 * Get verses for a surah (fetches from external API)
 */
router.get('/surahs/:number/verses', async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.number);
    const { start, end } = req.query;
    
    // Fetch from Al-Quran Cloud API
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
    const data = await response.json();
    
    if (data.code !== 200) {
      return res.status(404).json({ error: 'Surah not found' });
    }
    
    let verses = data.data.ayahs.map(ayah => ({
      number: ayah.numberInSurah,
      text: ayah.text,
      audioUrl: ayah.audio,
    }));
    
    // Filter by range if provided
    if (start && end) {
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      verses = verses.filter(v => v.number >= startNum && v.number <= endNum);
    }
    
    res.json({
      surah: surahNumber,
      verses,
      combinedText: verses.map(v => v.text).join(' ۝ '),
    });
  } catch (error) {
    console.error('Error fetching verses:', error);
    res.status(500).json({ error: 'Failed to fetch verses' });
  }
});

/**
 * GET /api/quran/juz
 * Get list of all juz
 */
router.get('/juz', (req, res) => {
  res.json({ juz: JUZ });
});

/**
 * GET /api/quran/juz/:number
 * Get juz details
 */
router.get('/juz/:number', (req, res) => {
  const juzNumber = parseInt(req.params.number);
  const juz = JUZ.find(j => j.number === juzNumber);
  
  if (!juz) {
    return res.status(404).json({ error: 'Juz not found' });
  }
  
  res.json({ juz });
});

/**
 * GET /api/quran/search
 * Search surahs by name
 */
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({ results: [] });
  }
  
  const query = q.toLowerCase();
  const results = SURAHS.filter(s => 
    s.name.toLowerCase().includes(query) ||
    s.nameAr.includes(q) ||
    s.number.toString() === q
  );
  
  res.json({ results });
});

export default router;
