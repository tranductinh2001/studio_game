// Service for Text-to-Speech in Vietnamese with audio phoneme synchronization
class SpeechSynthesisService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.speechRate = 0.95; // clear, gentle, suitable for grade 6 classroom
    this.pitch = 1.05; // slightly cheerful
    this.listeners = new Set();
    this.mouthInterval = null;

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural Vietnamese voices
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('hoaimy'));
    if (viVoice) {
      this.selectedVoice = viVoice;
      console.log('Selected Vietnamese Voice:', viVoice.name, viVoice.lang);
    } else {
      console.warn('No native Vietnamese voice found. Browser will attempt default or fallback.');
    }
  }

  // Subscribe to speech state changes (isSpeaking, mouthOpenRatio)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach(cb => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Speak a text string in Vietnamese
  speak(text, onComplete = null) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      if (onComplete) onComplete();
      return;
    }

    // Stop any ongoing speech
    this.stop();

    if (!text || text.trim() === '') {
      if (onComplete) onComplete();
      return;
    }

    const cleanText = text.replace(/[*_~`#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'vi-VN';
    utterance.rate = this.speechRate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify({ type: 'start', text: cleanText });
      this.startMouthSimulation();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.stopMouthSimulation();
      this.notify({ type: 'end' });
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      this.stopMouthSimulation();
      this.notify({ type: 'error', error: e });
      if (onComplete) onComplete();
    };

    // On boundary if supported (words)
    utterance.onboundary = (e) => {
      this.notify({ type: 'boundary', charIndex: e.charIndex });
    };

    this.synth.speak(utterance);
  }

  // Realistic mouth phoneme oscillation during speech
  startMouthSimulation() {
    this.stopMouthSimulation();
    let phase = 0;
    this.mouthInterval = setInterval(() => {
      phase += 0.35;
      // Combine multiple sine frequencies to simulate natural syllable cadence
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
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.stopMouthSimulation();
      this.notify({ type: 'pause' });
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.startMouthSimulation();
      this.notify({ type: 'resume' });
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.stopMouthSimulation();
    this.notify({ type: 'stop' });
  }

  setRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(1.5, rate));
  }
}

export const speechSynth = new SpeechSynthesisService();

