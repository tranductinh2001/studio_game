// Conversation Controller & State Machine
// Quản lý 7 trạng thái hội thoại, cơ chế chống ngắt quãng (Incomplete Utterance) và ngắt lời (Barge-in)

import { speechSynth } from '../speechSynthesis.js';
import { speechRec } from '../speechRecognition.js';
import { aiService } from '../aiService.js';
import { conversationMemory } from './ConversationMemory.js';
import { intentClassifier, INTENTS } from './IntentClassifier.js';
import { BOT_CONFIG, normalizeTextForSpeech } from './VoiceAssistantConfig.js';

export const AGENT_STATES = {
  IDLE: 'IDLE',                   // Chờ bắt đầu phiên
  LISTENING: 'LISTENING',         // Đang lắng nghe học sinh nói
  WAITING: 'WAITING',             // Đang chờ học sinh nói tiếp (câu bị ngắt quãng)
  PROCESSING: 'PROCESSING',       // Đang phân tích nội dung và ý định
  THINKING: 'THINKING',           // Đang suy nghĩ câu trả lời (AI reasoning)
  SPEAKING: 'SPEAKING',           // Đang phát giọng nói (TTS)
  INTERRUPTED: 'INTERRUPTED'      // Học sinh ngắt lời bot
};

export class ConversationController {
  constructor() {
    this.state = AGENT_STATES.IDLE;
    this.memory = conversationMemory;
    this.classifier = intentClassifier;
    this.config = BOT_CONFIG;

    // Bộ nhớ đệm cho câu nói ngắt quãng & timers
    this.pendingFragment = '';
    this.waitingTimer = null;
    this.acousticCooldownTimer = null;
    this.bargeInTimer = null;
    this.isSessionActive = false;
    this.lastSpokenText = '';

    // Callbacks đăng ký từ React UI
    this.onStateChange = null;
    this.onSubtitleChange = null;
    this.onEmotionChange = null;

    // Mặc định gọi aiService với đầy đủ context sư phạm
    this.aiQueryHandler = async (message, memory) => {
      const history = memory ? memory.getHistoryForAPI() : [];
      const context = memory && typeof memory.getFullContextForAI === 'function' 
        ? memory.getFullContextForAI() 
        : {
            activeTopic: memory ? memory.getActiveTopic() : null,
            firstTopic: memory ? memory.getFirstTopic() : null,
            studentName: memory ? memory.getStudentName() : null,
            lastAssistantReply: memory ? memory.getLastAssistantReply() : null
          };
      return await aiService.sendMessage(message, history, context);
    };
  }

  setState(newState) {
    if (this.state === newState) return;
    console.log(`[ConversationController] State change: ${this.state} -> ${newState}`);
    this.state = newState;
    if (newState !== AGENT_STATES.INTERRUPTED && this.bargeInTimer) {
      clearTimeout(this.bargeInTimer);
      this.bargeInTimer = null;
    }
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(newState);
    }
  }

  setEmotion(emotion) {
    if (typeof this.onEmotionChange === 'function') {
      this.onEmotionChange(emotion);
    }
  }

  setSubtitle(speaker, text, interim = '') {
    if (typeof this.onSubtitleChange === 'function') {
      this.onSubtitleChange(speaker, text, interim);
    }
  }

  // Khởi động phiên trò chuyện mới (cách ly hoàn toàn giữa các học sinh/tiết học)
  startSession(initialGreeting = true) {
    this.isSessionActive = true;
    this.memory.startNewSession();
    this.pendingFragment = '';
    if (this.waitingTimer) clearTimeout(this.waitingTimer);
    if (this.bargeInTimer) clearTimeout(this.bargeInTimer);
    if (this.acousticCooldownTimer) clearTimeout(this.acousticCooldownTimer);

    speechRec.startContinuous();

    if (initialGreeting) {
      const greetingDisplay = this.config.welcomeGreeting;
      const greetingSpeech = this.config.welcomeGreetingSpeech;
      this.memory.addMessage('assistant', greetingDisplay, {
        stage: 'STAGE_1_HOOK',
        question: 'Các bạn có thường sử dụng Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?'
      });
      this.speak(greetingDisplay, 'GREETING', greetingSpeech);
    } else {
      this.transitionToListening();
    }
  }

  // Kết thúc phiên trò chuyện
  stopSession() {
    this.isSessionActive = false;
    this.pendingFragment = '';
    if (this.waitingTimer) clearTimeout(this.waitingTimer);
    if (this.bargeInTimer) clearTimeout(this.bargeInTimer);
    if (this.acousticCooldownTimer) clearTimeout(this.acousticCooldownTimer);

    speechSynth.stop();
    speechRec.stopContinuous();

    this.setState(AGENT_STATES.IDLE);
    this.setEmotion('IDLE');
    this.setSubtitle(this.config.displayName, 'Phiên trò chuyện đã kết thúc. Nhấn BẮT ĐẦU TRÒ CHUYỆN để gặp lại Mark!');
  }

  // Chuyển sang trạng thái lắng nghe có bảo vệ echo
  transitionToListening() {
    if (!this.isSessionActive) {
      this.setState(AGENT_STATES.IDLE);
      return;
    }

    this.setState(AGENT_STATES.LISTENING);
    this.setEmotion('LISTENING');
    this.setSubtitle('HỌC SINH', `${this.config.displayName} đang lắng nghe bạn... Hãy nói đi nào!`);
    speechRec.unmute();
  }

  // Xử lý khi phát hiện học sinh ngắt lời (Barge-in) trong khi bot đang nói
  handleBargeIn(shouldScheduleListening = true) {
    if (this.acousticCooldownTimer) {
      clearTimeout(this.acousticCooldownTimer);
      this.acousticCooldownTimer = null;
    }
    if (this.bargeInTimer) {
      clearTimeout(this.bargeInTimer);
      this.bargeInTimer = null;
    }

    if (this.state === AGENT_STATES.SPEAKING) {
      console.log('[ConversationController] BARGE-IN DETECTED: Học sinh ngắt lời bot');
      speechSynth.stop();
      this.setState(AGENT_STATES.INTERRUPTED);
      this.setEmotion('LISTENING');
      this.setSubtitle('HỌC SINH', 'Đang ngắt lời và lắng nghe bạn...');

      if (shouldScheduleListening) {
        this.bargeInTimer = setTimeout(() => {
          if (this.isSessionActive && this.state === AGENT_STATES.INTERRUPTED) {
            this.transitionToListening();
          }
        }, 250);
      }
    }
  }

  // Nhận kết quả văn bản tạm thời (Interim) từ SpeechRecognition
  handleInterimSpeech(interimText) {
    if (this.acousticCooldownTimer) {
      clearTimeout(this.acousticCooldownTimer);
      this.acousticCooldownTimer = null;
    }

    // Nếu bot đang nói mà học sinh bắt đầu nói -> Kích hoạt Barge-in
    if (this.state === AGENT_STATES.SPEAKING && interimText && interimText.trim().length > 1) {
      this.handleBargeIn();
      return;
    }

    if (this.state === AGENT_STATES.LISTENING || this.state === AGENT_STATES.WAITING) {
      const displayText = this.pendingFragment 
        ? `${this.pendingFragment} ${interimText}` 
        : interimText;
      this.setSubtitle('HỌC SINH', `"${displayText}"`, interimText);
    }
  }

  // Nhận câu nói hoàn tất (Final transcript) từ SpeechRecognition
  async handleFinalSpeech(transcript) {
    if (!transcript || !transcript.trim()) return;

    if (this.acousticCooldownTimer) {
      clearTimeout(this.acousticCooldownTimer);
      this.acousticCooldownTimer = null;
    }
    if (this.bargeInTimer) {
      clearTimeout(this.bargeInTimer);
      this.bargeInTimer = null;
    }

    // Nếu bot đang nói -> xử lý ngắt lời nhưng không tự nhảy về listening vì chuẩn bị xử lý câu nói
    if (this.state === AGENT_STATES.SPEAKING) {
      this.handleBargeIn(false);
    }

    const currentPhrase = transcript.trim();

    // 1. Kiểm tra câu ngắt quãng: Nếu học sinh dừng giữa câu (VD: "Mark ơi, cho mình hỏi về...")
    const fullCandidate = this.pendingFragment 
      ? `${this.pendingFragment} ${currentPhrase}` 
      : currentPhrase;

    const isIncomplete = this.classifier.isIncompleteUtterance(fullCandidate);

    if (isIncomplete && !this.pendingFragment) {
      console.log('[ConversationController] Phát hiện câu nói ngắt quãng:', fullCandidate);
      this.pendingFragment = fullCandidate;
      this.setState(AGENT_STATES.WAITING);
      this.setSubtitle('HỌC SINH', `"${this.pendingFragment}..."`);

      // Cho học sinh 1.8 giây để nói tiếp
      if (this.waitingTimer) clearTimeout(this.waitingTimer);
      this.waitingTimer = setTimeout(() => {
        if (this.state === AGENT_STATES.WAITING && this.pendingFragment) {
          const stitched = this.pendingFragment;
          this.pendingFragment = '';
          this.processCompleteUtterance(stitched);
        }
      }, this.config.incompleteWaitMs || 1800);
      return;
    }

    // Nếu đang trong trạng thái chờ và học sinh nói thêm phần còn lại
    if (this.pendingFragment) {
      if (this.waitingTimer) clearTimeout(this.waitingTimer);
      const combined = `${this.pendingFragment} ${currentPhrase}`.trim();
      this.pendingFragment = '';
      this.processCompleteUtterance(combined);
      return;
    }

    // Câu nói hoàn chỉnh độc lập
    this.processCompleteUtterance(currentPhrase);
  }

  // Xử lý câu nói hoàn chỉnh của học sinh
  async processCompleteUtterance(fullUtterance) {
    if (!fullUtterance || !fullUtterance.trim()) return;

    if (this.acousticCooldownTimer) {
      clearTimeout(this.acousticCooldownTimer);
      this.acousticCooldownTimer = null;
    }

    const trimmed = fullUtterance.trim();
    console.log('[ConversationController] Xử lý câu nói hoàn chỉnh:', trimmed);

    this.setState(AGENT_STATES.PROCESSING);
    this.setEmotion('THINKING');
    this.setSubtitle('HỌC SINH', `"${trimmed}"`);

    // Tạm ngắt mic để chống echo
    speechRec.mute();

    // 1. Phân tích ý định & giải quyết tham chiếu
    const analysis = this.classifier.classify(trimmed, this.memory);
    const reference = this.memory.resolveReference(trimmed);

    // 2. Lưu câu hỏi/trả lời học sinh vào bộ nhớ ngữ cảnh kèm intent
    this.memory.addMessage('user', trimmed, {
      intent: analysis.intent,
      stage: this.memory.getConversationStage()
    });

    console.log('[ConversationController] Intent:', analysis.intent, 'Reference:', reference);

    // 3. Xử lý các ý định hội thoại trực tiếp đặc thù
    if (analysis.intent === INTENTS.REQUEST_REPEAT) {
      const lastReply = this.memory.getLastAssistantReply();
      if (lastReply) {
        this.speak(`Mình xin nhắc lại nhé: ${lastReply}`, 'SPEAKING');
      } else {
        this.speak('Bạn vừa bảo mình nói lại điều gì nè? Bạn hãy hỏi lại để mình trả lời nhé!', 'ENCOURAGING');
      }
      return;
    }

    if (analysis.intent === INTENTS.REQUEST_SHORTEN) {
      const lastReply = this.memory.getLastAssistantReply();
      if (lastReply) {
        const shortened = this.shortenReply(lastReply);
        this.speak(`Nói ngắn gọn là: ${shortened}`, 'HAPPY');
      } else {
        this.speak('Được rồi, từ giờ mình sẽ trả lời thật ngắn gọn và súc tích nhé!', 'HAPPY');
      }
      return;
    }

    if (analysis.intent === INTENTS.NEGATION) {
      this.speak('Ồ, xin lỗi bạn nhé! Vậy ý của bạn là gì, bạn có thể nói rõ hơn một chút để Mark hỗ trợ không?', 'ENCOURAGING');
      return;
    }

    if (analysis.intent === INTENTS.THANKS) {
      const studentName = this.memory.getStudentName();
      const thanksReply = studentName 
        ? `Không có gì đâu bạn ${studentName}! Được đồng hành học tập cùng bạn là niềm vui của Mark mà!` 
        : 'Không có gì đâu bạn nhé! Đồng hành học tập cùng bạn là niềm vui của Mark mà!';
      this.speak(thanksReply, 'HAPPY');
      return;
    }

    if (analysis.intent === INTENTS.GOODBYE) {
      this.speak('Tạm biệt bạn nhé! Chúc bạn học thật tốt môn Tin học và khám phá thêm nhiều điều kỳ thú trên Internet!', 'GOODBYE');
      return;
    }

    if (analysis.intent === INTENTS.UNCLEAR && !this.memory.getActiveTopic()) {
      this.speak('Bạn đang muốn hỏi Mark về Mạng thông tin toàn cầu, website hay một chủ đề nào khác vậy nè?', 'ENCOURAGING');
      return;
    }

    // 4. Chuyển sang THINKING và gọi AI Service
    this.setState(AGENT_STATES.THINKING);

    try {
      let aiResult = null;
      if (typeof this.aiQueryHandler === 'function') {
        aiResult = await this.aiQueryHandler(trimmed, this.memory);
      }

      const replyText = aiResult?.reply || 'Mark đã nghe câu hỏi của bạn! Bạn hãy hỏi thêm về World Wide Web, website hoặc trình duyệt nhé!';
      const replyEmotion = aiResult?.emotion || 'SPEAKING';
      const resolvedTopic = aiResult?.topic || reference.topic || this.memory.getActiveTopic();
      const resolvedStage = aiResult?.stage || this.memory.getConversationStage();
      const resolvedQuestion = aiResult?.question || null;

      // Lưu câu trả lời bot vào bộ nhớ kèm tiến trình sư phạm
      this.memory.addMessage('assistant', replyText, {
        topic: resolvedTopic,
        stage: resolvedStage,
        question: resolvedQuestion
      });

      if (aiResult?.stage) {
        this.memory.setConversationStage(aiResult.stage);
      }
      if (aiResult?.question) {
        this.memory.lastAiQuestion = aiResult.question;
      }

      this.speak(replyText, replyEmotion);
    } catch (err) {
      console.error('[ConversationController] Error calling AI service:', err);
      this.speak('Mark đang suy nghĩ một chút! Bạn hãy hỏi lại về Mạng thông tin toàn cầu hoặc trình duyệt web nhé!', 'ENCOURAGING');
    }
  }

  // Phát âm thanh giọng nói và đồng bộ phụ đề
  speak(text, targetEmotion = 'SPEAKING', speechTextOverride = null) {
    if (!text || !text.trim()) return;

    this.lastSpokenText = text;
    this.setState(AGENT_STATES.SPEAKING);
    this.setEmotion(targetEmotion);
    this.setSubtitle(this.config.displayName, text);

    // Chuẩn hóa văn bản phát âm: Đảm bảo "Mark" đọc là "Mác", không đánh vần M-A-R-K
    const textToSpeak = speechTextOverride || normalizeTextForSpeech(text);

    speechSynth.speak(textToSpeak, () => {
      // Khi đọc xong, áp dụng khoảng lặng triệt tiêu tiếng vang phòng học (800ms)
      if (this.acousticCooldownTimer) clearTimeout(this.acousticCooldownTimer);
      this.acousticCooldownTimer = setTimeout(() => {
        if (this.isSessionActive) {
          this.transitionToListening();
        } else {
          this.setState(AGENT_STATES.IDLE);
          this.setEmotion('IDLE');
        }
      }, this.config.acousticCooldownMs || 800);
    });
  }

  getLastSpokenText() {
    return this.lastSpokenText || this.memory.getLastAssistantReply() || '';
  }

  // Trợ giúp rút gọn câu trả lời trước đó
  shortenReply(text) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length <= 1) return text;
    return sentences[0] + '.';
  }
}

export const conversationController = new ConversationController();
