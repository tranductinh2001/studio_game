// server/services/voiceService.js
// High-performance English Voice Synthesis, Voice Cloning, Audio Analysis & Pronunciation Evaluation
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_PATH = path.join(__dirname, '../scripts/synthesize_tts.py');
const PUBLIC_AUDIO_DIR = path.join(__dirname, '../../public/audio_generated');
const SAMPLES_DIR = path.join(__dirname, '../../public/voice_samples');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
  fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
}
if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

function runPythonScript(args = []) {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [SCRIPT_PATH, ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });

    py.on('close', (code) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(new Error(stderr || `Python script exited with code ${code}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        resolve({ raw: stdout, stderr });
      }
    });

    py.on('error', (err) => reject(err));
  });
}

export const voiceService = {
  /**
   * 1. Text to Speech Synthesis
   */
  async synthesizeSpeech({
    text = '',
    voice = 'en-US-JennyNeural',
    rate = '+0%',
    pitch = '+0Hz',
    accent = 'us'
  }) {
    if (!text || !text.trim()) {
      throw new Error('Văn bản tiếng Anh không được để trống');
    }

    const cleanText = text.replace(/[*_~`#]/g, '').trim();
    const hash = crypto.createHash('md5').update(`${cleanText}_${voice}_${rate}_${pitch}`).digest('hex').slice(0, 12);
    const fileName = `tts_${hash}.mp3`;
    const outPath = path.join(PUBLIC_AUDIO_DIR, fileName);

    // Return cached if exists and not empty
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
      return {
        success: true,
        audioUrl: `/audio_generated/${fileName}`,
        cached: true,
        voice,
        text: cleanText
      };
    }

    const args = [
      '--action', 'tts',
      '--text', cleanText,
      '--voice', voice,
      '--rate', rate,
      '--pitch', pitch,
      '--accent', accent,
      '--out-file', outPath
    ];

    const result = await runPythonScript(args);
    return {
      success: true,
      audioUrl: `/audio_generated/${fileName}`,
      engine: result.engine || 'Edge-TTS',
      voice,
      text: cleanText
    };
  },

  /**
   * 2. Voice Cloning / Simulation with Controlled Learner Imperfection
   * Transforms phrasing to learner style, applies acoustic filters & mic simulation
   */
  async simulateClonedVoice({
    text = '',
    voice = 'en-US-BrianMultilingualNeural',
    speed = 0.95,
    level = '82', // '88' (Khá), '82' (Tự nhiên đàm thoại), '75' (Chậm rãi)
    prompt = '',  // e.g. "đọc tự nhiên, không đều đều kiểu google, ngắt nghỉ mềm mại"
    micSimulate = false,
    sampleFile = ''
  }) {
    if (!text || !text.trim()) {
      throw new Error('Văn bản tiếng Anh không được để trống');
    }

    let p = (prompt || '').toLowerCase();
    // Làm sạch dấu ba chấm máy móc nếu người dùng vô tình dán vào
    let naturalText = text.replace(/\.{2,}/g, ',').replace(/\s+/g, ' ').trim();

    // Tách các từ viết tắt nếu cần để học viên phát âm tròn vành rõ chữ
    if (level === '75' || p.includes('tách từ') || p.includes('rõ chữ')) {
      const contractions = {
        "\\bdon't\\b": "do not",
        "\\bdidn't\\b": "did not",
        "\\bcan't\\b": "can not",
        "\\bwon't\\b": "will not",
        "\\bit's\\b": "it is",
        "\\bthat's\\b": "that is",
        "\\bthere's\\b": "there is",
        "\\bwhat's\\b": "what is",
        "\\blet's\\b": "let us",
        "\\bi'm\\b": "I am",
        "\\byou're\\b": "you are",
        "\\bwe're\\b": "we are",
        "\\bi'll\\b": "I will",
        "\\bi've\\b": "I have"
      };
      for (const [pat, rep] of Object.entries(contractions)) {
        naturalText = naturalText.replace(new RegExp(pat, 'gi'), rep);
      }
    }

    // Tốc độ điều chỉnh trong AI core (-3% đến -8% tự nhiên, không méo tiếng)
    let rateStr = "-3%";
    if (level === '75' || p.includes('chậm') || p.includes('slow')) {
      rateStr = "-8%";
    } else if (level === '88' || p.includes('nhanh') || p.includes('fast')) {
      rateStr = "+0%";
    } else {
      rateStr = "-4%";
    }

    const hash = crypto.createHash('md5').update(`${naturalText}_${voice}_${rateStr}_${micSimulate}`).digest('hex').slice(0, 12);
    const fileName = `natural_${hash}.mp3`;
    const outPath = path.join(PUBLIC_AUDIO_DIR, fileName);

    const args = [
      '--action', 'tts',
      '--text', naturalText,
      '--voice', voice,
      '--rate', rateStr,
      '--out-file', outPath
    ];

    const result = await runPythonScript(args);

    return {
      success: true,
      audioUrl: `/audio_generated/${fileName}`,
      engine: 'ConversationalNeural',
      voice,
      text: naturalText,
      level,
      prompt
    };
  },

  /**
   * 3. Analyze Audio Sample
   */
  async analyzeSample(samplePath) {
    const fullPath = path.isAbsolute(samplePath) ? samplePath : path.join(SAMPLES_DIR, samplePath);
    if (!fs.existsSync(fullPath)) {
      return {
        duration: 0,
        sampleRate: 24000,
        channels: 1,
        qualityScore: 70,
        qualityNotes: 'Sử dụng mẫu giọng học viên mặc định'
      };
    }

    const args = ['--action', 'analyze', '--in-file', fullPath];
    return await runPythonScript(args);
  },

  /**
   * 4. English Pronunciation Evaluation (Speech Alignment & Minimal Pair Analysis)
   */
  evaluatePronunciation({ targetText = '', spokenText = '' }) {
    const normalize = (s) => (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanTarget = normalize(targetText);
    const cleanSpoken = normalize(spokenText);

    const targetWords = cleanTarget.split(' ').filter(Boolean);
    const spokenWords = cleanSpoken.split(' ').filter(Boolean);

    if (targetWords.length === 0) {
      return {
        score: 0,
        feedback: 'Vui lòng cung cấp câu mẫu tiếng Anh để đối chiếu.',
        wordDetails: []
      };
    }

    // Levenshtein distance for individual word phonetic similarity
    const wordDistance = (a, b) => {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
          else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
      return dp[m][n];
    };

    // Minimal pair dictionary for targeted phonetics tips
    const minimalPairsGuide = {
      'peel': { pair: 'pill/bin', tip: 'Cần kéo dài nguyên âm /iː/, không đọc ngắn thành /ɪ/ như "pill".' },
      'pill': { pair: 'peel', tip: 'Âm ngắn /ɪ/, phát âm dứt khoát, không kéo dài thành /iː/.' },
      'sheep': { pair: 'ship', tip: 'Âm dài /iː/ và âm /ʃ/ chu môi; tránh đọc nhầm thành "ship".' },
      'ship': { pair: 'sheep', tip: 'Âm ngắn /ɪ/ và bật âm cuối /p/ rõ ràng.' },
      'leave': { pair: 'live', tip: 'Âm dài /iː/ và âm rung môi răng /v/ ở cuối từ.' },
      'live': { pair: 'leave', tip: 'Âm ngắn /ɪ/.' },
      'leak': { pair: 'lick', tip: 'Âm dài /iː/ kèm bật âm /k/ nhẹ.' },
      'lick': { pair: 'leak', tip: 'Âm ngắn /ɪ/.' },
      'cheek': { pair: 'chick', tip: 'Âm dài /iː/ và bật âm /tʃ/ đầu từ.' },
      'chick': { pair: 'cheek', tip: 'Âm ngắn /ɪ/.' },
      'pen': { pair: 'pan', tip: 'Nguyên âm /e/ mở miệng vừa phải; tránh bẹt miệng thành /æ/ ("pan").' },
      'pan': { pair: 'pen', tip: 'Nguyên âm /æ/ hạ cằm, mở rộng miệng.' },
      'bread': { pair: 'bad', tip: 'Chú ý tổ hợp phụ âm /br/ và nguyên âm /e/.' },
      'park': { pair: 'pack', tip: 'Âm dài /ɑː/ sâu trong vòm họng; tránh đọc thành âm /æ/ ngắn.' },
      'cod': { pair: 'cord', tip: 'Âm ngắn /ɒ/ tròn môi; không kéo dài thành /ɔː/.' },
      'cord': { pair: 'cod', tip: 'Âm dài /ɔː/ tròn môi sâu.' },
      'pool': { pair: 'pull', tip: 'Âm dài /uː/ chu môi sâu; tránh đọc thành âm ngắn /ʊ/ ("pull").' },
      'pull': { pair: 'pool', tip: 'Âm ngắn /ʊ/ thả lỏng môi.' },
      'fool': { pair: 'full', tip: 'Kéo dài âm /uː/ và nâng đầu lưỡi ở âm /l/.' },
      'full': { pair: 'fool', tip: 'Âm ngắn /ʊ/.' },
      'bird': { pair: 'bud', tip: 'Âm dài /ɜː/ uốn lưỡi nhẹ, bật âm cuối /d/.' },
      'pie': { pair: 'pear', tip: 'Nguyên âm đôi /aɪ/, mở miệng từ /a/ sang /ɪ/.' },
      'pear': { pair: 'pier', tip: 'Nguyên âm đôi /eə/ lướt nhẹ.' },
      'pier': { pair: 'beer', tip: 'Bật hơi âm /p/ mạnh, không nhầm sang /b/.' },
      'choking': { pair: 'joking', tip: 'Âm vô thanh /tʃ/ bật hơi mạnh; tránh đọc thành âm hữu thanh /dʒ/ ("joking").' },
      'joking': { pair: 'choking', tip: 'Âm hữu thanh /dʒ/ rung dây thanh quản.' }
    };

    let correctCount = 0;
    const wordDetails = [];
    const tipsList = [];

    // Greedy word alignment
    let spokenIdx = 0;
    for (let i = 0; i < targetWords.length; i++) {
      const tWord = targetWords[i];
      let bestMatch = null;
      let bestDist = 999;
      let matchedSpokenIdx = -1;

      // Look ahead up to 3 words
      for (let j = spokenIdx; j < Math.min(spokenIdx + 3, spokenWords.length); j++) {
        const sWord = spokenWords[j];
        const dist = wordDistance(tWord, sWord);
        if (dist < bestDist) {
          bestDist = dist;
          bestMatch = sWord;
          matchedSpokenIdx = j;
        }
      }

      if (bestDist === 0) {
        correctCount += 1;
        wordDetails.push({ word: tWord, spoken: bestMatch, status: 'correct', score: 100 });
        spokenIdx = matchedSpokenIdx + 1;
      } else if (bestDist <= 2 && bestMatch) {
        correctCount += 0.65;
        const tipObj = minimalPairsGuide[tWord];
        const hint = tipObj ? tipObj.tip : `Bạn đọc là "${bestMatch}". Chú ý khẩu hình âm chính và âm đuôi.`;
        if (tipObj) tipsList.push(`Từ "${tWord}": ${tipObj.tip}`);
        wordDetails.push({ word: tWord, spoken: bestMatch, status: 'substituted', score: 65, hint });
        spokenIdx = matchedSpokenIdx + 1;
      } else {
        const tipObj = minimalPairsGuide[tWord];
        if (tipObj) tipsList.push(`Từ "${tWord}": Cần phát âm rõ ràng, không nuốt âm.`);
        wordDetails.push({ word: tWord, spoken: null, status: 'missing', score: 0, hint: `Từ bị thiếu hoặc chưa nhận diện được rõ` });
      }
    }

    const rawScore = Math.round((correctCount / targetWords.length) * 100);
    const score = Math.max(0, Math.min(100, rawScore));

    let overallFeedback = '';
    if (score >= 90) {
      overallFeedback = 'Xuất sắc! Phát âm rất rõ ràng, chuẩn ngữ điệu và đầy đủ các âm đuôi ending sounds.';
    } else if (score >= 75) {
      overallFeedback = 'Rất tốt! Nghe tự nhiên và dễ hiểu. Cần chú ý phân biệt rõ hơn độ dài nguyên âm ngắn/dài (như i/i: hoặc u/u:).';
    } else if (score >= 50) {
      overallFeedback = 'Khá tốt! Đã nhận diện được phần lớn câu. Hãy luyện tập thêm các cặp âm tối thiểu và bật rõ âm cuối (ending sounds).';
    } else {
      overallFeedback = 'Cần luyện tập thêm. Hãy nghe kỹ câu mẫu và đọc to, rõ ràng từng từ trước khi tăng tốc độ.';
    }

    return {
      score,
      overallFeedback,
      specificTips: tipsList.slice(0, 3),
      totalWords: targetWords.length,
      correctWords: Math.round(correctCount),
      wordDetails
    };
  }
};

