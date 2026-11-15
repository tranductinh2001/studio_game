// Advanced Vietnamese Speech Recognition Service with Continuous Listening & Silence Detection
class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.shouldBeListening = false; // Persistent agent listening flag
    this.isMuted = false;           // Echo suppression while Webby is speaking
    this.listeners = new Set();
    this.isSupported = false;

    // Silence detection & debounce timers
    this.silenceTimer = null;
    this.silenceThresholdMs = 1000; // 1 second of silence marks end of sentence
    this.accumulatedTranscript = '';
    this.lastDispatchedTranscript = '';
    this.lastDispatchTime = 0;
    this.restartDebounceTimer = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'vi-VN';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.isSupported = true;

        this.setupHandlers();
      }
    }
  }

  setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.notify({ type: 'start' });
    };

    this.recognition.onresult = (event) => {
      if (this.isMuted) return; // Muted while Webby speaks to prevent echo

      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          currentFinal += text;
        } else {
          currentInterim += text;
        }
      }

      const activeText = (currentFinal || currentInterim).trim();
      if (!activeText) return;

      this.accumulatedTranscript = activeText;

      // Broadcast live interim results for the UI
      this.notify({
        type: 'result',
        final: '',
        interim: activeText,
        isFinal: false
      });

      // Clear existing silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
      }

      // If browser already marked isFinal, or after silence threshold
      if (currentFinal) {
        this.handleCompleteUtterance(currentFinal.trim());
      } else {
        // Set silence timeout to finalize sentence when student pauses
        this.silenceTimer = setTimeout(() => {
          if (this.accumulatedTranscript && this.accumulatedTranscript.length >= 2) {
            this.handleCompleteUtterance(this.accumulatedTranscript.trim());
          }
        }, this.silenceThresholdMs);
      }
    };

    this.recognition.onerror = (event) => {
      // Ignore common non-fatal events like 'no-speech'
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('SpeechRecognition notice:', event.error);
      }
      this.notify({ type: 'error', error: event.error });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.notify({ type: 'end' });

      // Continuous Watchdog: If agent is still supposed to listen and not muted, auto-restart
      if (this.shouldBeListening && !this.isMuted) {
        if (this.restartDebounceTimer) clearTimeout(this.restartDebounceTimer);
        this.restartDebounceTimer = setTimeout(() => {
          if (this.shouldBeListening && !this.isMuted && !this.isListening) {
            this.safeStart();
          }
        }, 300);
      }
    };
  }

  handleCompleteUtterance(transcript) {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    const clean = transcript.trim();
    const now = Date.now();

    // Prevent duplicate dispatches of the same phrase within 2.5 seconds
    if (!clean || (clean === this.lastDispatchedTranscript && now - this.lastDispatchTime < 2500)) {
      return;
    }

    this.lastDispatchedTranscript = clean;
    this.lastDispatchTime = now;
    this.accumulatedTranscript = '';

    this.notify({
      type: 'result',
      final: clean,
      interim: '',
      isFinal: true
    });
  }

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

  // Start continuous listening session
  startContinuous() {
    this.shouldBeListening = true;
    this.isMuted = false;
    this.accumulatedTranscript = '';
    this.safeStart();
  }

  // Stop session completely (Teacher ends session)
  stopContinuous() {
    this.shouldBeListening = false;
    this.isMuted = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.restartDebounceTimer) clearTimeout(this.restartDebounceTimer);
    this.safeStop();
  }

  // Temporarily mute/pause listening (e.g. while Webby is speaking)
  mute() {
    this.isMuted = true;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.safeStop();
  }

  // Unmute/resume listening after Webby finishes speaking
  unmute() {
    this.isMuted = false;
    if (this.shouldBeListening) {
      this.safeStart();
    }
  }

  safeStart() {
    if (!this.recognition) return;
    try {
      if (!this.isListening) {
        this.recognition.start();
      }
    } catch (err) {
      // If already started or aborting, will recover via onend
      if (err.name !== 'InvalidStateError') {
        console.warn('Recognition start warning:', err.message);
      }
    }
  }

  safeStop() {
    if (!this.recognition) return;
    try {
      if (this.isListening) {
        this.recognition.stop();
      }
    } catch (err) {
      // Ignore
    }
  }

  // Compatibility helper
  start() {
    this.startContinuous();
  }

  stop() {
    this.stopContinuous();
  }
}

export const speechRec = new SpeechRecognitionService();
