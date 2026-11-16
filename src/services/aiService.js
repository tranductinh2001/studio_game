import lessonData from '../data/lessonKnowledge.json';
import { matchCurriculumResponse, CURRICULUM_INTENTS } from '../data/curriculumIntents.js';

const getBaseApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:') {
      return 'http://127.0.0.1:3001/api';
    }
    // In browser, use same-origin relative /api which Vite proxies seamlessly without cross-origin/PNA blocks
    return '/api';
  }
  return 'http://127.0.0.1:3001/api';
};

class AIService {
  constructor() {
    this.apiUrl = `${getBaseApiUrl()}/chat`;
    this.statusUrl = `${getBaseApiUrl()}/status`;
    this.onlineStatus = {
      isBackendOnline: false,
      hasApiKey: false,
      model: 'unknown'
    };
    this.checkStatus();
  }

  async checkStatus() {
    try {
      const res = await fetch(this.statusUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.onlineStatus = {
          isBackendOnline: true,
          hasApiKey: data.hasApiKey || data.hasBitOneKey,
          model: data.model || 'bitone-curriculum'
        };
        return this.onlineStatus;
      }
    } catch (e) {
      console.warn('Backend not detected, running in full client-side offline mode.');
      this.onlineStatus = {
        isBackendOnline: false,
        hasApiKey: false,
        model: 'client-offline'
      };
    }
    return this.onlineStatus;
  }

  // Generate intelligent client-side reply using semantic intent matching
  generateClientOfflineReply(message, history = []) {
    const matched = matchCurriculumResponse(
      message,
      lessonData ? lessonData.faq : [],
      lessonData ? lessonData.topics : []
    );
    return {
      reply: matched.text,
      emotion: matched.emotion || 'SPEAKING',
      mode: matched.source || 'client-offline'
    };
  }

  // Core send query method (with server call & instant fallback)
  async sendQuery(message, history = []) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply && data.reply.trim()) {
          return {
            reply: data.reply.trim(),
            emotion: data.emotion || 'SPEAKING',
            mode: data.mode || 'backend',
            provider: data.provider
          };
        }
      }
    } catch (err) {
      console.warn('Backend request failed or offline, using instant client-side intelligence:', err.message);
    }

    // Guaranteed instant client-side intelligence fallback
    return this.generateClientOfflineReply(message, history);
  }

  // Dual-name alias: Guarantees App.jsx and other components never throw TypeError
  async sendMessage(message, history = []) {
    return this.sendQuery(message, history);
  }
}

export const aiService = new AIService();
export { CURRICULUM_INTENTS };
