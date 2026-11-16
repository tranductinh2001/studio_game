// Advanced Vietnamese Speech Recognition Service with Continuous Listening & Silence Detection
class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.shouldBeListening = false; // Persistent agent listening flag
    this.isMuted = false;           // Echo suppression while Webby is speaking
    this.listeners = new Set();
    this.isSupported = false;
    this.hasPermissionError = false;

    // Direct callback handlers that can be assigned directly by React components
    this.onResult = null;
    this.onInterim = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;

    // Silence detection & debounce timers
    this.silenceTimer = null;
    this.silenceThresholdMs = 1200; // 1.2s silence marks end of sentence for 6th graders
    this.accumulatedTranscript = '';
    this.lastDispatchedTranscript = '';
    this.lastDispatchTime = 0;
    this.restartDebounceTimer = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.lang = 'vi-VN';
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
          this.isSupported = true;

          this.setupHandlers();
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
          this.isSupported = false;
        }
      }
    }
  }

  // Request browser microphone permission explicitly via getUserMedia
  async requestMicPermission() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so SpeechRecognition has full microphone access
        stream.getTracks().forEach((track) => track.stop());
        this.hasPermissionError = false;
        return true;
      } catch (err) {
        console.warn('Microphone permission request failed:', err);
        this.hasPermissionError = true;
        this.notify({ type: 'permission-denied', error: err.name || 'not-allowed' });
        return false;
      }
    }
    return true;
  }

  setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.hasPermissionError = false;
      console.log('[SpeechRecognition] Micro started listening (vi-VN)...');
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
      // Permission denied or device blocked
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.hasPermissionError = true;
        console.warn('[SpeechRecognition] Microphone access not allowed:', event.error);
        this.notify({ type: 'error', error: 'not-allowed' });
        this.notify({ type: 'permission-denied', error: event.error });
        return;
      }

      // Ignore common non-fatal events like 'no-speech' or 'aborted'
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[SpeechRecognition] notice:', event.error);
      }
      this.notify({ type: 'error', error: event.error });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.notify({ type: 'end' });

      // Continuous Watchdog: If agent is still supposed to listen, not muted, and not blocked by permission
      if (this.shouldBeListening && !this.isMuted && !this.hasPermissionError) {
        if (this.restartDebounceTimer) clearTimeout(this.restartDebounceTimer);
        this.restartDebounceTimer = setTimeout(() => {
          if (this.shouldBeListening && !this.isMuted && !this.isListening && !this.hasPermissionError) {
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

    // Prevent duplicate dispatches of the same phrase within 3.5 seconds
    if (!clean || clean.length < 2 || (clean === this.lastDispatchedTranscript && now - this.lastDispatchTime < 3500)) {
      return;
    }

    this.lastDispatchedTranscript = clean;
    this.lastDispatchTime = now;
    this.accumulatedTranscript = '';

    console.log('[SpeechRecognition] Utterance Recognized:', clean);

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
    let handledByProperty = false;

    // 1. Invoke direct callback properties (onResult, onInterim, onError, onStart, onEnd)
    try {
      if (event.type === 'result') {
        if (event.isFinal && typeof this.onResult === 'function') {
          this.onResult(event.final);
          handledByProperty = true;
        } else if (!event.isFinal && typeof this.onInterim === 'function') {
          this.onInterim(event.interim);
          handledByProperty = true;
        }
      } else if (event.type === 'error' && typeof this.onError === 'function') {
        this.onError(event.error);
        handledByProperty = true;
      } else if (event.type === 'permission-denied' && typeof this.onError === 'function') {
        this.onError('not-allowed');
        handledByProperty = true;
      } else if (event.type === 'start' && typeof this.onStart === 'function') {
        this.onStart();
      } else if (event.type === 'end' && typeof this.onEnd === 'function') {
        this.onEnd();
      }
    } catch (e) {
      console.error('Error executing speechRec direct callback:', e);
    }

    // 2. Broadcast to subscribed listeners ONLY if not already dispatched to property callback
    // (Prevents double triggering / repeating responses in UI)
    if (!handledByProperty) {
      this.listeners.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  // Start continuous listening session
  startContinuous() {
    this.shouldBeListening = true;
    this.isMuted = false;
    this.hasPermissionError = false;
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
    this.accumulatedTranscript = '';
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.safeStop();
  }

  // Unmute/resume listening after Webby finishes speaking
  unmute() {
    this.isMuted = false;
    this.accumulatedTranscript = '';
    this.shouldBeListening = true; // Ensure persistent state is enabled
    this.safeStart();
  }

  safeStart() {
    if (!this.recognition || this.isMuted) return;
    if (this.hasPermissionError) {
      console.warn('Microphone permission blocked. Please grant access in browser settings.');
      return;
    }
    try {
      if (!this.isListening) {
        this.recognition.start();
      }
    } catch (err) {
      // If already started, mark isListening
      if (err.name === 'InvalidStateError') {
        this.isListening = true;
      } else {
        console.warn('Recognition start warning:', err.message);
      }
    }
  }

  safeStop() {
    if (!this.recognition) return;
    try {
      // abort() immediately discards buffer and halts capture, preventing echo
      this.recognition.abort();
      this.isListening = false;
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
