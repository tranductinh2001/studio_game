// Service for Text-to-Speech in Vietnamese with Edge-TTS Studio Neural Voice (Cute & Sweet),
// Web Speech API fallback, pronunciation normalization, and mouth phoneme simulation.
import { normalizeTextForSpeech } from './voiceAssistant/VoiceAssistantConfig';

// Kiểm tra xem một voice có phải là tiếng Việt thực sự hay không
export function isVietnameseVoice(v) {
  if (!v) return false;
  const nameLower = (v.name || '').toLowerCase();
  const langLower = (v.lang || '').toLowerCase();
  const uriLower = (v.voiceURI || '').toLowerCase();
  return (
    langLower.startsWith('vi') ||
    langLower.includes('vi-') ||
    langLower.includes('vi_') ||
    nameLower.includes('vietnam') ||
    nameLower.includes('hoaimy') ||
    nameLower.includes('namminh') ||
    nameLower.includes('an') ||
    uriLower.includes('vi-vn')
  );
}

class SpeechSynthesisService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    // Mặc định: Giọng Hoài My Neural tiếng Việt siêu dễ thương, trong trẻo, tự nhiên
    this.selectedVoiceURI = 'vi-VN-HoaiMyNeural';
    this.selectedVoice = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.speechRate = 1.0;
    this.pitch = 1.15; // Tông giọng dễ thương, tươi vui, gần gũi
    this.currentAudio = null;
    this.listeners = new Set();
    this.mouthInterval = null;
    this.activeUtterance = null;
    this.speechWatchdog = null;
    this.keepAliveInterval = null;

    // Tự động kiểm tra và làm sạch cấu hình cũ nếu từng bị lưu giọng tiếng Anh
    try {
      const savedVoice = localStorage.getItem('mark_selected_voice');
      if (savedVoice) {
        if (
          savedVoice.includes('David') ||
          savedVoice.includes('Zira') ||
          savedVoice.includes('Mark') ||
          savedVoice.includes('English') ||
          savedVoice.includes('en-US') ||
          savedVoice.includes('en-GB')
        ) {
          console.log('[SpeechSynthesis] Đã xóa giọng tiếng Anh khỏi localStorage:', savedVoice);
          localStorage.removeItem('mark_selected_voice');
          this.selectedVoiceURI = 'vi-VN-HoaiMyNeural';
        } else {
          this.selectedVoiceURI = savedVoice;
        }
      }
      const savedRate = localStorage.getItem('mark_voice_rate');
      if (savedRate) this.speechRate = parseFloat(savedRate) || 1.0;
      const savedPitch = localStorage.getItem('mark_voice_pitch');
      if (savedPitch) this.pitch = parseFloat(savedPitch) || 1.15;
    } catch (e) {
      // Bỏ qua lỗi localStorage
    }

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices() || [];
    if (voices.length === 0) return;

    // Nếu người dùng chọn giọng cục bộ của trình duyệt
    if (this.selectedVoiceURI && !this.selectedVoiceURI.startsWith('vi-VN-')) {
      const match = voices.find(
        (v) => (v.voiceURI === this.selectedVoiceURI || v.name === this.selectedVoiceURI) && isVietnameseVoice(v)
      );
      if (match) {
        this.selectedVoice = match;
        return;
      }
    }

    // Tìm giọng tiếng Việt cục bộ (nếu có)
    const viVoice = voices.find((v) => isVietnameseVoice(v));
    if (viVoice) {
      this.selectedVoice = viVoice;
    } else {
      // TUYỆT ĐỐI KHÔNG GÁN GIỌNG TIẾNG ANH (David, Zira, Mark, ...)
      this.selectedVoice = null;
    }
  }

  // Danh sách các giọng đọc Tiếng Việt chuẩn xác (Neural Studio + Cục bộ tiếng Việt)
  getAvailableVoices() {
    // 1. Giọng Neural Studio chất lượng cao (100% tiếng Việt, phát âm cực ngọt ngào & chuẩn ngữ điệu)
    const neuralVoices = [
      {
        voiceURI: 'vi-VN-HoaiMyNeural',
        name: 'vi-VN-HoaiMyNeural',
        displayName: 'Hoài My Neural (Nữ - Dễ thương, ngọt ngào, trong trẻo) ⭐',
        gender: 'female',
        lang: 'vi-VN',
        isVietnamese: true,
        isNeural: true,
        isDefault: true
      },
      {
        voiceURI: 'vi-VN-NamMinhNeural',
        name: 'vi-VN-NamMinhNeural',
        displayName: 'Nam Minh Neural (Nam - Vui tươi, thông minh, rõ ràng)',
        gender: 'male',
        lang: 'vi-VN',
        isVietnamese: true,
        isNeural: true,
        isDefault: false
      }
    ];

    // 2. Các giọng tiếng Việt thực sự có trong trình duyệt (nếu có)
    const browserVoices = [];
    if (this.synth) {
      const all = this.synth.getVoices() || [];
      for (const v of all) {
        if (isVietnameseVoice(v)) {
          let label = v.name;
          if (v.name.toLowerCase().includes('google')) label = 'Google Tiếng Việt (Tự nhiên)';
          else if (v.name.toLowerCase().includes('hoaimy')) label = 'Microsoft Hoài My (Nữ - Cục bộ)';
          else if (v.name.toLowerCase().includes('namminh')) label = 'Microsoft Nam Minh (Nam - Cục bộ)';
          else if (v.name.toLowerCase().includes('an')) label = 'Microsoft An (Nữ - Sư phạm)';

          browserVoices.push({
            voiceURI: v.voiceURI,
            name: v.name,
            displayName: label,
            gender: v.name.toLowerCase().includes('nam') ? 'male' : 'female',
            lang: v.lang,
            isVietnamese: true,
            isNeural: false,
            isDefault: false
          });
        }
      }
    }

    return [...neuralVoices, ...browserVoices];
  }

  getVietnameseVoices() {
    return this.getAvailableVoices();
  }

  // Chọn giọng đọc
  setVoice(voiceURIOrName) {
    if (!voiceURIOrName) return false;

    const available = this.getAvailableVoices();
    const match = available.find((v) => v.voiceURI === voiceURIOrName || v.name === voiceURIOrName);

    if (match) {
      this.selectedVoiceURI = match.voiceURI;
      try {
        localStorage.setItem('mark_selected_voice', match.voiceURI);
      } catch (e) {}

      if (!match.isNeural && this.synth) {
        const sysVoices = this.synth.getVoices() || [];
        this.selectedVoice =
          sysVoices.find((v) => v.voiceURI === match.voiceURI || v.name === match.name) || null;
      } else {
        this.selectedVoice = null;
      }

      this.notify({ type: 'voice_changed', voice: match });
      console.log('[SpeechSynthesis] Đã chuyển sang giọng:', match.displayName || match.name);
      return true;
    }

    return false;
  }

  getVoice() {
    const available = this.getAvailableVoices();
    return available.find((v) => v.voiceURI === this.selectedVoiceURI) || available[0];
  }

  // Cao độ giọng đọc (Pitch: 0.8 đến 1.4)
  setPitch(pitch) {
    this.pitch = Math.max(0.8, Math.min(1.4, pitch));
    try {
      localStorage.setItem('mark_voice_pitch', String(this.pitch));
    } catch (e) {}
    this.notify({ type: 'pitch_changed', pitch: this.pitch });
  }

  getPitch() {
    return this.pitch;
  }

  // Tốc độ đọc (Rate: 0.75 đến 1.3)
  setRate(rate) {
    this.speechRate = Math.max(0.75, Math.min(1.3, rate));
    try {
      localStorage.setItem('mark_voice_rate', String(this.speechRate));
    } catch (e) {}
    this.notify({ type: 'rate_changed', rate: this.speechRate });
  }

  getRate() {
    return this.speechRate;
  }

  // Chuyển cao độ sang Hz chuẩn cho Edge-TTS (+12Hz tạo giọng nữ siêu dễ thương, trẻ trung)
  getNeuralPitchString() {
    const diff = Math.round((this.pitch - 1.0) * 50) + 12;
    return diff >= 0 ? `+${diff}Hz` : `${diff}Hz`;
  }

  // Chuyển tốc độ sang % chuẩn cho Edge-TTS
  getNeuralRateString() {
    const percent = Math.round((this.speechRate - 1.0) * 100) + 2;
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  }

  // Phát câu đọc thử nghiệm
  testVoice(
    sampleText = 'Xin chào các bạn học sinh lớp 6 yêu quý! Mình là Mark đây, hôm nay chúng mình cùng học bài thật vui nhé!',
    onComplete = null
  ) {
    this.speak(sampleText, onComplete);
  }

  // Đăng ký nhận sự kiện phát âm
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Phát âm thanh văn bản tiếng Việt
  async speak(text, onComplete = null) {
    // 1. Dừng ngay lập tức âm thanh đang phát trước đó
    this.stop();

    if (!text || text.trim() === '') {
      if (onComplete) onComplete();
      return;
    }

    // 2. Chuẩn hóa ngữ âm tiếng Việt (Đảm bảo đọc "Mác", không đọc M-A-R-K)
    const cleanText = normalizeTextForSpeech(text);

    // 3. ƯU TIÊN SỐ 1: Edge-TTS Neural Voice (Giọng Hoài My trong trẻo, dễ thương, 100% tiếng Việt)
    const isNeural =
      !this.selectedVoiceURI ||
      this.selectedVoiceURI.startsWith('vi-VN-') ||
      !this.selectedVoice;

    if (isNeural) {
      const voiceName =
        this.selectedVoiceURI && this.selectedVoiceURI.startsWith('vi-VN-')
          ? this.selectedVoiceURI
          : 'vi-VN-HoaiMyNeural';

      try {
        const response = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: voiceName,
            pitch: this.getNeuralPitchString(),
            rate: this.getNeuralRateString()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.audioUrl) {
            this.playAudioUrl(data.audioUrl, cleanText, onComplete);
            return;
          }
        }
      } catch (err) {
        console.warn('[SpeechSynthesis] Neural TTS không phản hồi, chuyển sang Web Speech:', err);
      }
    }

    // 4. ƯU TIÊN SỐ 2: Web Speech API Fallback (chỉ dùng giọng tiếng Việt)
    this.speakWithWebSpeech(cleanText, onComplete);
  }

  // Phát file audio từ Edge-TTS với cử động môi Avatar
  playAudioUrl(audioUrl, text, onComplete = null) {
    this.stop();

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    this.isSpeaking = true;
    this.isPaused = false;
    this.notify({ type: 'start', text });
    this.startMouthSimulation();

    let hasFinished = false;
    const finish = (evtType = 'end') => {
      if (hasFinished) return;
      hasFinished = true;
      this.isSpeaking = false;
      this.isPaused = false;
      this.stopMouthSimulation();
      this.currentAudio = null;
      this.notify({ type: evtType });
      if (typeof onComplete === 'function') {
        try {
          onComplete();
        } catch (e) {
          console.error(e);
        }
      }
    };

    audio.onended = () => finish('end');
    audio.onerror = (e) => {
      console.warn('[SpeechSynthesis] Lỗi phát file audio Neural:', e);
      // Chuyển sang Web Speech API
      this.speakWithWebSpeech(text, onComplete);
    };

    audio.play().catch((err) => {
      console.warn('[SpeechSynthesis] Trình duyệt chặn autoplay:', err);
      this.speakWithWebSpeech(text, onComplete);
    });
  }

  // Phát âm thanh qua Web Speech API (Đảm bảo TUYỆT ĐỐI không ép giọng tiếng Anh đọc tiếng Việt)
  speakWithWebSpeech(cleanText, onComplete = null) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.activeUtterance = utterance;

    // CHỈ gán voice nếu voice đó THỰC SỰ là tiếng Việt
    if (this.selectedVoice && isVietnameseVoice(this.selectedVoice)) {
      utterance.voice = this.selectedVoice;
    } else {
      // TUYỆT ĐỐI KHÔNG GÁN GIỌNG TIẾNG ANH! Để null để trình duyệt tự kích hoạt TTS tiếng Việt
      utterance.voice = null;
    }

    utterance.lang = 'vi-VN';
    utterance.rate = this.speechRate;
    utterance.pitch = Math.max(1.15, this.pitch); // Giọng cao, tươi vui, dễ thương

    let hasCompleted = false;
    const finishSpeech = (eventType = 'end') => {
      if (hasCompleted) return;
      hasCompleted = true;

      if (this.speechWatchdog) {
        clearTimeout(this.speechWatchdog);
        this.speechWatchdog = null;
      }
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }

      this.isSpeaking = false;
      this.isPaused = false;
      this.stopMouthSimulation();
      this.activeUtterance = null;
      this.notify({ type: eventType });

      if (typeof onComplete === 'function') {
        try {
          onComplete();
        } catch (err) {
          console.error('Error executing speech onComplete:', err);
        }
      }
    };

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify({ type: 'start', text: cleanText });
      this.startMouthSimulation();

      if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (this.synth && this.synth.paused && this.isSpeaking) {
          try {
            this.synth.resume();
          } catch (e) {}
        }
      }, 3000);
    };

    utterance.onend = () => finishSpeech('end');
    utterance.onerror = (e) => finishSpeech('error');
    utterance.onboundary = (e) => this.notify({ type: 'boundary', charIndex: e.charIndex });

    const maxDurationMs = Math.max(3500, Math.ceil((cleanText.length / 8) * 1000) + 4000);
    this.speechWatchdog = setTimeout(() => {
      if (this.isSpeaking) {
        finishSpeech('end');
      }
    }, maxDurationMs);

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Error starting Web Speech synthesis:', err);
      finishSpeech('error');
    }
  }

  // Mô phỏng cử động khẩu hình miệng 3D Avatar
  startMouthSimulation() {
    this.stopMouthSimulation();
    let phase = 0;
    this.mouthInterval = setInterval(() => {
      phase += 0.35;
      const raw = Math.sin(phase) * 0.5 + Math.sin(phase * 2.3) * 0.3 + Math.random() * 0.2;
      const mouthOpen = Math.max(0.05, Math.min(1.0, Math.abs(raw)));
      this.notify({ type: 'mouth', value: mouthOpen });
    }, 60);
  }

  stopMouthSimulation() {
    if (this.mouthInterval) {
      clearInterval(this.mouthInterval);
      this.mouthInterval = null;
    }
    this.notify({ type: 'mouth', value: 0 });
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
      } catch (e) {}
      this.isPaused = true;
      this.stopMouthSimulation();
      this.notify({ type: 'pause' });
      return;
    }
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.stopMouthSimulation();
      this.notify({ type: 'pause' });
    }
  }

  resume() {
    if (this.currentAudio && this.isPaused) {
      try {
        this.currentAudio.play();
      } catch (e) {}
      this.isPaused = false;
      this.startMouthSimulation();
      this.notify({ type: 'resume' });
      return;
    }
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.startMouthSimulation();
      this.notify({ type: 'resume' });
    }
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.speechWatchdog) {
      clearTimeout(this.speechWatchdog);
      this.speechWatchdog = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.activeUtterance = null;
    this.stopMouthSimulation();
    this.notify({ type: 'stop' });
  }

  // Dừng tức thì khi học sinh ngắt lời (Barge-in)
  interrupt() {
    this.stop();
    this.notify({ type: 'interrupted' });
  }
}

export const speechSynth = new SpeechSynthesisService();
