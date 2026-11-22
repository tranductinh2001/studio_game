// Service for Text-to-Speech in Vietnamese with audio phoneme synchronization, pronunciation normalization and Chrome keep-alive
import { normalizeTextForSpeech } from './voiceAssistant/VoiceAssistantConfig.js';

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
    this.activeUtterance = null; // Prevent Chrome V8 garbage-collection bug
    this.speechWatchdog = null;
    this.keepAliveInterval = null;

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
    const viVoice = voices.find(
      (v) =>
        v.lang.includes('vi') ||
        v.lang.includes('VI') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('hoaimy')
    );
    if (viVoice) {
      this.selectedVoice = viVoice;
      console.log('[SpeechSynthesis] Selected Vietnamese Voice:', viVoice.name, viVoice.lang);
    }
  }

  // Subscribe to speech state changes (isSpeaking, mouthOpenRatio)
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

  // Speak a text string in Vietnamese with Chrome keep-alive & watchdog
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

    // Normalize text for natural Vietnamese pronunciation (e.g. Mark -> Mác, not spelled M-A-R-K)
    const cleanText = normalizeTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.activeUtterance = utterance; // Keep reference to prevent Chrome garbage-collection bug

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'vi-VN';
    utterance.rate = this.speechRate;
    utterance.pitch = this.pitch;

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

      // Safe SpeechSynthesis Watcher: Only resume if browser engine got unexpectedly paused
      // NEVER call pause() + resume() periodically as that restarts audio playback on Windows!
      if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (this.synth && this.synth.paused && this.isSpeaking) {
          try {
            this.synth.resume();
          } catch (e) {
            // Ignore
          }
        }
      }, 3000);
    };

    utterance.onend = () => {
      finishSpeech('end');
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis] error event:', e);
      finishSpeech('error');
    };

    utterance.onboundary = (e) => {
      this.notify({ type: 'boundary', charIndex: e.charIndex });
    };

    // Watchdog safety timer: Vietnamese speech averages 12-15 chars/sec
    // Allow generous limit + 4s padding so agent is never stuck in SPEAKING mode
    const maxDurationMs = Math.max(3500, Math.ceil((cleanText.length / 8) * 1000) + 4000);
    this.speechWatchdog = setTimeout(() => {
      if (this.isSpeaking) {
        console.warn(`[SpeechSynthesis] Watchdog triggered after ${maxDurationMs}ms - freeing agent to listen.`);
        finishSpeech('end');
      }
    }, maxDurationMs);

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Error starting speech synthesis:', err);
      finishSpeech('error');
    }
  }

  // Realistic mouth phoneme oscillation during speech
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
      } catch (e) {
        // Ignore
      }
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.activeUtterance = null;
    this.stopMouthSimulation();
    this.notify({ type: 'stop' });
  }

  // Barge-in immediate interruption when student speaks over bot
  interrupt() {
    this.stop();
    this.notify({ type: 'interrupted' });
  }

  setRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(1.5, rate));
  }
}

export const speechSynth = new SpeechSynthesisService();
