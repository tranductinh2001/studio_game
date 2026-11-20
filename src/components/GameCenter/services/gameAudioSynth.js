// =========================================================================
// WEB AUDIO API SYNTHESIZER FOR GAME CENTER (100% OFFLINE, ZERO EXTERNAL ASSETS)
// Provides referee whistles, boat horns, water splashes, wheel ticks, 
// mystery pops, victory fanfares, and procedural ambient BGM.
// =========================================================================

class GameAudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmOscs = [];
    this.bgmGain = null;
    this.isBgmRunning = false;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.warn);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isBgmRunning) {
      this.stopAmbientBGM();
    }
  }

  setMute(muted) {
    this.setMuted(muted);
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // 1. Còi xuất phát trọng tài (Referee Start Whistle)
  playWhistle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [2400, 2750].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Tremolo effect
        const tremolo = this.ctx.createOscillator();
        const tremoloGain = this.ctx.createGain();
        tremolo.frequency.setValueAtTime(35, now);
        tremoloGain.gain.setValueAtTime(150, now);
        tremolo.connect(tremoloGain);
        tremoloGain.connect(osc.frequency);
        tremolo.start(now);
        tremolo.stop(now + 0.6);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch (e) {
      console.warn("Whistle error:", e);
    }
  }

  // 2. Còi tàu thuyền xuất phát & về đích (Boat Horn Blast)
  playHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [185, 233, 277].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 1.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12 - idx * 0.02, now + 0.1);
        gain.gain.setValueAtTime(0.12 - idx * 0.02, now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch (e) {
      console.warn("Horn error:", e);
    }
  }

  // 3. Tiếng té nước / sóng vỗ (Water Splash & Waves)
  playSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.35);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.35);
    } catch (e) {
      console.warn("Splash error:", e);
    }
  }

  // 4. Tiếng bứt tốc / Turbo Boost (Riser swoosh)
  playBoost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("Boost error:", e);
    }
  }

  // 5. Tiếng quay vòng quay / lật thẻ (Wheel Tick)
  playTick(pitchMod = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950 * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(400 * pitchMod, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn("Tick error:", e);
    }
  }

  // 6. Tiếng mở hộp quà phép thuật (Box Pop & Sparkle)
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Low pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // Shimmer chimes
      [1046, 1318, 1567, 2093].forEach((f, idx) => {
        const chime = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(f, now + 0.05 + idx * 0.06);
        cGain.gain.setValueAtTime(0.1, now + 0.05 + idx * 0.06);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.06);
        chime.connect(cGain);
        cGain.connect(this.ctx.destination);
        chime.start(now + 0.05 + idx * 0.06);
        chime.stop(now + 0.35 + idx * 0.06);
      });
    } catch (e) {
      console.warn("Pop error:", e);
    }
  }

  // 7. Khúc nhạc chiến thắng rực rỡ (Glorious Victory Fanfare)
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // C Major Arpeggio: C4, E4, G4, C5, E5, G5, High C6 chord
      const notes = [
        { f: 523.25, t: 0.00, d: 0.18 },  // C5
        { f: 659.25, t: 0.15, d: 0.18 },  // E5
        { f: 783.99, t: 0.30, d: 0.18 },  // G5
        { f: 1046.50, t: 0.45, d: 0.55 }, // C6
        { f: 1318.51, t: 0.70, d: 0.20 }, // E6
        { f: 1567.98, t: 0.88, d: 0.80 }, // G6 final
      ];

      notes.forEach((note) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.01, now + note.t);
        gain.gain.linearRampToValueAtTime(0.22, now + note.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
      });
    } catch (e) {
      console.warn("Fanfare error:", e);
    }
  }

  // 8. Tiếng chuông đúng / thông báo (Crystal Bell Ding)
  playBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn("Bell error:", e);
    }
  }

  // 9. Tiếng còi buzzer sai nhẹ nhàng (Gentle Buzzer)
  playBuzzer() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Buzzer error:", e);
    }
  }

  // 10. Nhạc nền Gameshow hồi hộp (Procedural Ambient Gameshow Beat)
  startAmbientBGM() {
    if (this.isMuted || this.isBgmRunning) return;
    this.init();
    if (!this.ctx) return;
    try {
      this.isBgmRunning = true;
      let step = 0;
      const bassNotes = [110, 110, 130.8, 146.8]; // A2, A2, C3, D3

      this.bgmTimer = setInterval(() => {
        if (!this.isBgmRunning || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Bass heartbeat
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], now);
        bassGain.gain.setValueAtTime(0.06, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.35);

        // Hi-hat tick
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'triangle';
        tickOsc.frequency.setValueAtTime(1800 + (step % 2) * 400, now);
        tickGain.gain.setValueAtTime(0.03, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        tickOsc.connect(tickGain);
        tickGain.connect(this.ctx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.05);

        step++;
      }, 450);
    } catch (e) {
      console.warn("BGM error:", e);
    }
  }

  stopAmbientBGM() {
    this.isBgmRunning = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const gameAudio = new GameAudioSynth();
