import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlobeScene from './components/Globe/GlobeScene';
import WebbyAvatar from './components/Avatar/WebbyAvatar';
import SubtitleDisplay from './components/Subtitle/SubtitleDisplay';
import VoiceControlBar from './components/VoiceControl/VoiceControlBar';
import TeacherPanel from './components/TeacherPanel/TeacherPanel';
import IntroBanner from './components/IntroBanner/IntroBanner';

// New Classroom Modules
import LessonSlidePresentation from './components/Presentation/LessonSlidePresentation';
import GroupWorkDisplay from './components/GroupWork/GroupWorkDisplay';
import AssessmentDisplay from './components/Assessment/AssessmentDisplay';
import BitOneQuestionGenerator from './components/BitOneQuiz/BitOneQuestionGenerator';
import BitOneVoiceStudio from './components/BitOneVoiceStudio/BitOneVoiceStudio';
import CardGenerator from './components/CardGenerator/CardGenerator';
import MobileController from './components/Mobile/MobileController';
import GameCenter from './components/GameCenter/GameCenter';

import { speechSynth } from './services/speechSynthesis';
import { speechRec } from './services/speechRecognition';
import { aiService } from './services/aiService';
import { classroomService } from './services/classroomService';
import { conversationController } from './services/voiceAssistant/ConversationController';
import { conversationMemory } from './services/voiceAssistant/ConversationMemory';
import { BOT_CONFIG } from './services/voiceAssistant/VoiceAssistantConfig';
import { detectAppEnv, buildRoomJoinUrl } from './config/environment';
import conversationScripts from './data/conversationScripts.json';
import QRCode from 'qrcode';
import { 
  Maximize2, Minimize2, Globe, Bot, Image as ImageIcon, 
  BarChart3, Sparkles, Printer, Smartphone, QrCode, X, Copy, Check, Wifi, ExternalLink, BookOpen, Gamepad2 
} from 'lucide-react';

export default function App() {
  // Navigation Tab: 'lesson-slide' | 'game-center' | 'webby-agent' | 'group-work' | 'qr-assessment' | 'bitone-quiz' | 'card-generator' | 'mobile-controller'
  const [currentTab, setCurrentTab] = useState('lesson-slide');
  const [assessmentSelectedQuestion, setAssessmentSelectedQuestion] = useState(null);

  // Phone Connect Modal state
  const [showPhoneConnectModal, setShowPhoneConnectModal] = useState(false);
  const [phoneConnectMode, setPhoneConnectMode] = useState('cloud'); // 'cloud' | 'lan'
  const [cloudQr, setCloudQr] = useState('');
  const [lanQr, setLanQr] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');
  const [lanUrl, setLanUrl] = useState('');
  const [phoneConnectQr, setPhoneConnectQr] = useState('');
  const [mobileConnectUrl, setMobileConnectUrl] = useState('');
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState('');

  // Real-time Agent State: 'IDLE' | 'GREETING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'
  const [agentState, setAgentState] = useState('IDLE');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [micError, setMicError] = useState(null);

  // Avatar & Speech animation states
  const [emotion, setEmotion] = useState('IDLE');
  const [mouthValue, setMouthValue] = useState(0);
  const [speechRate, setSpeechRate] = useState(0.95);

  // Subtitle & Conversation Memory states
  const [currentSpeaker, setCurrentSpeaker] = useState('MARK');
  const [subtitleText, setSubtitleText] = useState(
    'Nhấn nút BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC để gặp gỡ Trợ lý Mark!'
  );
  const [interimText, setInterimText] = useState('');
  const [lastWebbySpeech, setLastWebbySpeech] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [roundCount, setRoundCount] = useState(0);

  // System & UI states
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [currentScriptStep, setCurrentScriptStep] = useState(1);
  const [isWarpSpeed, setIsWarpSpeed] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active room code
  const roomCode = 'WB-601';

  // Refs for tracking active session in callbacks without stale closures
  const isSessionActiveRef = useRef(isSessionActive);
  isSessionActiveRef.current = isSessionActive;

  const agentStateRef = useRef(agentState);
  agentStateRef.current = agentState;

  // Anti-loop, Anti-echo & Mutex Lock Refs
  const isProcessingQueryRef = useRef(false);
  const speechEndedTimeRef = useRef(0);
  const lastWebbySpeechRef = useRef('');
  lastWebbySpeechRef.current = lastWebbySpeech;

  // Check Backend status on mount
  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setHasGeminiKey(status.hasApiKey);
      if (!status.isBackendOnline || !status.hasApiKey) {
        setIsOfflineMode(true);
      }
    });

    // Check URL parameters for direct mobile view (?mode=mobile) or direct tab (?tab=...)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'mobile' || window.location.pathname === '/mobile') {
      setCurrentTab('mobile-controller');
    } else if (urlParams.get('tab')) {
      setCurrentTab(urlParams.get('tab'));
    }

    // Generate both Cloud (Vercel) and LAN (Wi-Fi) URLs and standard ISO QR codes
    const updateMobileConnectUrls = async () => {
      // 1. Cloud Vercel Join URL (Always accessible from any phone 4G/5G/Wi-Fi worldwide)
      const cloudBase = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1'))
        ? window.location.origin
        : 'https://studio-game.vercel.app';
      const cUrl = `${cloudBase}/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
      setCloudUrl(cUrl);
      setMobileConnectUrl(cUrl);

      try {
        const cQr = await QRCode.toDataURL(cUrl, {
          width: 320,
          margin: 4,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M'
        });
        setCloudQr(cQr);
        setPhoneConnectQr(cQr);
      } catch (e) {
        console.warn('Error generating cloud QR:', e);
      }

      // 2. LAN Wi-Fi Join URL (For offline local school intranet)
      try {
        const netInfo = await classroomService.getNetworkInfo();
        const lUrl = buildRoomJoinUrl(roomCode, netInfo?.lanIp);
        setLanUrl(lUrl);

        const lQr = await QRCode.toDataURL(lUrl, {
          width: 320,
          margin: 4,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M'
        });
        setLanQr(lQr);
      } catch (err) {
        console.warn('Network info fallback for LAN QR:', err);
        const fallbackLanUrl = `http://localhost:5173/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
        setLanUrl(fallbackLanUrl);
        QRCode.toDataURL(fallbackLanUrl, {
          width: 320,
          margin: 4,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M'
        }).then(setLanQr).catch(console.warn);
      }
    };

    updateMobileConnectUrls();
  }, []);

  const handleCopyMobileLink = () => {
    const activeUrl = phoneConnectMode === 'cloud' ? (cloudUrl || mobileConnectUrl) : (lanUrl || mobileConnectUrl);
    if (navigator.clipboard && activeUrl) {
      navigator.clipboard.writeText(activeUrl);
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 2500);
    }
  };

  // Subscribe to Classroom Realtime Cloud & Local Events (Detect phone connection, chime test)
  useEffect(() => {
    const unsubscribe = classroomService.subscribeToRoom(roomCode, (event) => {
      if (event.type === 'DEVICE_JOINED') {
        setIsPhoneConnected(true);
        const name = event.payload?.userAgent?.includes('iPhone') ? 'iPhone Giáo viên' : 'Điện thoại Giáo viên';
        setConnectedDeviceName(name);

        // Celebratory melodic audio chime on connection
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
          });
        } catch (e) {
          // ignore
        }
      } else if (event.type === 'CHIME_TEST') {
        // Teacher pressed "Test Chime" on smartphone
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
          // ignore
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Subscribe to SpeechSynthesis events (mouth visemes, start, end)
  useEffect(() => {
    const unsubscribe = speechSynth.subscribe((event) => {
      if (event.type === 'start') {
        // Speech started
      } else if (event.type === 'end' || event.type === 'stop') {
        setMouthValue(0);
      } else if (event.type === 'mouth') {
        setMouthValue(event.value);
      }
    });

    return () => unsubscribe();
  }, []);

  // Connect ConversationController callbacks with React state
  useEffect(() => {
    conversationController.onStateChange = (state) => {
      setAgentState(state);
      agentStateRef.current = state;
    };
    conversationController.onEmotionChange = (emo) => {
      setEmotion(emo);
    };
    conversationController.onSubtitleChange = (speaker, text, interim = '') => {
      setCurrentSpeaker(speaker);
      setSubtitleText(text);
      setInterimText(interim);
    };
    conversationController.aiQueryHandler = async (message, memory) => {
      const history = memory.getHistoryForAPI();
      const context = {
        activeTopic: memory.getActiveTopic(),
        firstTopic: memory.getFirstTopic(),
        studentName: memory.getStudentName(),
        lastAssistantReply: memory.getLastAssistantReply()
      };
      return await aiService.sendMessage(message, history, context);
    };
  }, []);

  // Bind speech recognition callbacks
  useEffect(() => {
    const handleResult = (finalTranscript) => {
      if (!finalTranscript) return;
      console.log('[App] Speech Recognition Result:', finalTranscript);
      conversationController.handleFinalSpeech(finalTranscript);
    };

    const handleInterim = (interimTranscript) => {
      conversationController.handleInterimSpeech(interimTranscript);
    };

    const handleBargeIn = () => {
      console.log('[App] Speech Recognition Barge-In Event');
      conversationController.handleBargeIn();
    };

    const handleError = (error) => {
      if (error === 'not-allowed' || error === 'service-not-allowed') {
        setMicError('Trình duyệt chưa cho phép truy cập Micro. Hãy nhấp vào biểu tượng 🔒 hoặc 🎙️ trên thanh địa chỉ để Cấp quyền!');
      } else if (error !== 'no-speech' && error !== 'aborted') {
        console.warn('Speech recognition notice:', error);
      }
    };

    speechRec.onResult = handleResult;
    speechRec.onInterim = handleInterim;
    speechRec.onBargeIn = handleBargeIn;
    speechRec.onError = handleError;

    return () => {
      speechRec.onResult = null;
      speechRec.onInterim = null;
      speechRec.onBargeIn = null;
      speechRec.onError = null;
    };
  }, []);

  // Request mic permission manually
  const handleRequestMicPermission = async () => {
    if (speechRec.requestMicPermission) {
      const ok = await speechRec.requestMicPermission();
      if (ok) {
        setMicError(null);
        speechRec.startContinuous();
      }
    }
  };

  // Start continuous conversation session with Mark AI
  const handleStartSession = async () => {
    setMicError(null);
    if (speechRec.requestMicPermission) {
      await speechRec.requestMicPermission();
    }
    setIsSessionActive(true);
    conversationController.startSession(true);
  };

  // Directly activate microphone listening without waiting for greeting
  const handleDirectListen = async () => {
    setMicError(null);
    if (speechRec.requestMicPermission) {
      await speechRec.requestMicPermission();
    }
    setIsSessionActive(true);
    conversationController.startSession(false);
  };

  // Stop session
  const handleStopSession = () => {
    setIsSessionActive(false);
    conversationController.stopSession();
  };

  // Pause listening
  const handlePauseListening = () => {
    speechSynth.pause();
    speechRec.mute();
    conversationController.setState('PAUSED');
  };

  // Resume listening
  const handleResumeListening = () => {
    conversationController.transitionToListening();
  };

  // Replay last speech
  const handleReplaySpeech = () => {
    const last = conversationMemory.getLastAssistantReply();
    if (last) {
      conversationController.speak(last, emotion);
    }
  };

  // Manual question submit (typing or sample chip)
  const handleManualSubmit = (text) => {
    if (!text || !text.trim()) return;
    conversationController.processCompleteUtterance(text.trim());
  };

  // Execute teacher scripted scenarios
  const handleExecuteScriptStep = (stepNumber) => {
    setCurrentScriptStep(stepNumber);
    const step = conversationScripts.scripts.find((s) => s.step === stepNumber);
    if (!step) return;

    if (step.action === 'transitionLesson') {
      handleTriggerTransitionLesson();
      return;
    }

    if (step.webbyResponse) {
      conversationController.speak(step.webbyResponse, step.emotion || 'SPEAKING');
    }
  };

  // Teacher FAQ clicked
  const handleSelectFaqQuestion = (faqItem) => {
    setCurrentSpeaker('HỌC SINH');
    setSubtitleText(`"${faqItem.question}"`);

    setTimeout(() => {
      conversationController.speak(`${faqItem.answer} ${faqItem.followup}`, 'SPEAKING');
    }, 600);
  };

  // Trigger grand lesson transition banner
  const handleTriggerTransitionLesson = () => {
    setIsWarpSpeed(true);
    speakAsWebby(
      'Thế giới Mạng thông tin toàn cầu còn vô vàn điều kỳ diệu! Chúng ta hãy cùng thầy cô bước vào Bài 6: Mạng thông tin toàn cầu ngay bây giờ nhé!',
      'HAPPY',
      () => {
        setShowIntroBanner(true);
        setTimeout(() => setIsWarpSpeed(false), 2000);
      }
    );
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard shortcut F2 for Teacher Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsTeacherPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dedicated Fullscreen Mobile Experience (When opening on smartphone via QR code: /?mode=mobile)
  if (currentTab === 'mobile-controller') {
    return (
      <main className="w-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans text-white flex flex-col select-none">
        <MobileController 
          roomCode={roomCode} 
          onExitMobile={() => setCurrentTab('lesson-slide')} 
        />
      </main>
    );
  }

  return (
    <main className="relative w-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans text-white flex flex-col justify-between select-none">
      {/* 1. BACKGROUND: 3D Procedural Globe Scene */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GlobeScene
          agentState={agentState}
          isWarpSpeed={isWarpSpeed}
          particleDensity="normal"
        />
      </div>

      {/* 2. TOP HEADER & MAIN NAVIGATION TABS */}
      <header className="relative z-30 flex flex-wrap items-center justify-between px-3 sm:px-6 py-2 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent shrink-0 gap-2 border-b border-slate-800/60">
        {/* Branding & Lesson Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-base sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-white font-['Orbitron',sans-serif]">
                WEBBY CLASSROOM
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase">
                Tin học 6
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden lg:block">
              Bài 6: Mạng thông tin toàn cầu • THCS Đắk Trôi
            </p>
          </div>
        </div>

        {/* 6 Main Mode Navigation Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setCurrentTab('lesson-slide')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              currentTab === 'lesson-slide'
                ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-slate-950 shadow-md shadow-cyan-500/40 ring-1 ring-cyan-300'
                : 'text-cyan-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Slide Bài 6</span>
          </button>

          <button
            onClick={() => setCurrentTab('game-center')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              currentTab === 'game-center'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/40 ring-1 ring-amber-300'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Đấu Trường Trò Chơi Thử Thách Bài 6 (8 Games)"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Đấu Trường Game</span>
          </button>

          <button
            onClick={() => setCurrentTab('webby-agent')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'webby-agent'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark AI</span>
          </button>

          <button
            onClick={() => setCurrentTab('group-work')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'group-work'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bài Nhóm A3/A4</span>
          </button>

          <button
            onClick={() => setCurrentTab('qr-assessment')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'qr-assessment'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đánh giá QR</span>
          </button>

          <button
            onClick={() => setCurrentTab('bitone-quiz')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'bitone-quiz'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trắc nghiệm AI</span>
          </button>

          <button
            onClick={() => setCurrentTab('card-generator')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'card-generator'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In Thẻ QR</span>
          </button>

          <button
            onClick={() => setCurrentTab('mobile-controller')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'mobile-controller'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </nav>

        {/* Fullscreen & Quick Tools */}
        <div className="flex items-center gap-2">
          {isPhoneConnected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline">ĐT: Đã kết nối</span>
            </div>
          )}

          <button
            onClick={() => setShowPhoneConnectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
            title="Mở mã QR kết nối điện thoại giáo viên"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kết nối ĐT</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-md"
            title="Bật/Tắt Toàn màn hình trình chiếu"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. DYNAMIC BODY ROUTING ACCORDING TO CURRENT TAB */}
      <section className="relative z-20 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* TAB 0: INTERACTIVE LESSON PRESENTATION (BÀI 6 - MẠNG THÔNG TIN TOÀN CẦU) */}
        {currentTab === 'lesson-slide' && (
          <LessonSlidePresentation onSwitchTab={(tab) => setCurrentTab(tab)} />
        )}

        {/* TAB: INTERACTIVE GAME CENTER (8 EDUCATIONAL GAMESHOWS) */}
        {currentTab === 'game-center' && (
          <GameCenter onSwitchTab={(tab) => setCurrentTab(tab)} />
        )}

        {/* TAB 1: ORIGINAL 3D WEBBY AI AGENT */}
        {currentTab === 'webby-agent' && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Center Avatar View */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden px-2 py-1">
              <WebbyAvatar
                emotion={emotion}
                mouthValue={mouthValue}
                isListening={agentState === 'LISTENING'}
                isSpeaking={agentState === 'SPEAKING'}
              />
            </div>

            {/* Bottom Interactivity: Subtitles & Voice Controls */}
            <footer className="pb-3 sm:pb-5 pt-1 space-y-2 sm:space-y-3 shrink-0">
              <SubtitleDisplay
                currentSpeaker={currentSpeaker}
                text={subtitleText}
                interimText={interimText}
                isSpeaking={agentState === 'SPEAKING'}
                isListening={agentState === 'LISTENING'}
              />

              <VoiceControlBar
                isSessionActive={isSessionActive}
                agentState={agentState}
                micError={micError}
                onRequestMicPermission={handleRequestMicPermission}
                onStartSession={handleStartSession}
                onStopSession={handleStopSession}
                onPauseListening={handlePauseListening}
                onResumeListening={handleResumeListening}
                onDirectListen={handleDirectListen}
                onReplaySpeech={handleReplaySpeech}
                onManualSubmit={handleManualSubmit}
              />
            </footer>

            {/* Collapsible Teacher Panel for Webby Agent (Hotkey F2) */}
            <TeacherPanel
              isOpen={isTeacherPanelOpen}
              onToggleOpen={() => setIsTeacherPanelOpen(!isTeacherPanelOpen)}
              isSessionActive={isSessionActive}
              agentState={agentState}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
              onPauseListening={handlePauseListening}
              onResumeListening={handleResumeListening}
              onReplay={handleReplaySpeech}
              onExecuteScriptStep={handleExecuteScriptStep}
              onSelectFaqQuestion={handleSelectFaqQuestion}
              onTriggerTransitionLesson={handleTriggerTransitionLesson}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
              hasGeminiKey={hasGeminiKey}
              speechRate={speechRate}
              onChangeSpeechRate={(rate) => {
                setSpeechRate(rate);
                speechSynth.setRate(rate);
              }}
              currentScriptStep={currentScriptStep}
              onEmotionOverride={(em) => setEmotion(em)}
            />
          </div>
        )}

        {/* TAB 2: GROUP WORK DISPLAY (A3/A4 PAPER POSTERS) */}
        {currentTab === 'group-work' && (
          <GroupWorkDisplay roomCode={roomCode} />
        )}

        {/* TAB 3: SMART QR PAPER ASSESSMENT & LIVE ANALYTICS */}
        {currentTab === 'qr-assessment' && (
          <AssessmentDisplay 
            roomCode={roomCode} 
            currentQuestion={assessmentSelectedQuestion} 
            onOpenPhoneConnect={() => setShowPhoneConnectModal(true)}
          />
        )}

        {/* TAB 4: BITONE QUESTION GENERATOR */}
        {currentTab === 'bitone-quiz' && (
          <BitOneQuestionGenerator 
            onSelectQuestionForAssessment={(q) => {
              setAssessmentSelectedQuestion(q);
              setCurrentTab('qr-assessment');
            }}
          />
        )}

        {/* TAB 5: STUDENT ROSTER & PRINTABLE QR CARDS */}
        {currentTab === 'card-generator' && (
          <CardGenerator 
            roomCode={roomCode}
            onSwitchToAssessment={(classId) => {
              setCurrentTab('qr-assessment');
            }}
          />
        )}

        {/* TAB 6: MOBILE COMPANION SCANNER & CONTROLLER */}
        {currentTab === 'mobile-controller' && (
          <MobileController roomCode={roomCode} />
        )}
      </section>

      {/* 4. GRAND LESSON TRANSITION BANNER ("BÀI 6: MẠNG THÔNG TIN TOÀN CẦU") */}
      {showIntroBanner && <IntroBanner onClose={() => setShowIntroBanner(false)} />}

      {/* 5. PHONE CONNECT MODAL (QUÉT MÃ QR ĐỂ KẾT NỐI ĐIỆN THOẠI) */}
      {showPhoneConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative space-y-4 animate-scaleUp">
            {/* Close button */}
            <button
              onClick={() => setShowPhoneConnectModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
                <Smartphone className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-white">
                KẾT NỐI ĐIỆN THOẠI GIÁO VIÊN
              </h3>
              <p className="text-xs text-slate-400">
                Dùng camera điện thoại (hoặc Zalo/Google Lens) quét mã QR bên dưới
              </p>
            </div>

            {/* Connection Success Alert Banner when phone has scanned & connected */}
            {isPhoneConnected && (
              <div className="bg-emerald-950/90 border-2 border-emerald-400 p-4 rounded-2xl text-center space-y-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-bounce">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>🎉 ĐÃ KẾT NỐI {connectedDeviceName.toUpperCase() || 'ĐIỆN THOẠI'} THÀNH CÔNG!</span>
                </div>
                <p className="text-xs text-slate-200">
                  Điện thoại đã sẵn sàng quét mã QR học sinh và chụp ảnh bài nhóm lên máy chiếu!
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowPhoneConnectModal(false);
                      setCurrentTab('qr-assessment');
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30 transition-all"
                  >
                    Bắt đầu Đánh giá QR
                  </button>
                  <button
                    onClick={() => setShowPhoneConnectModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Mode Switcher Tabs: Cloud Vercel vs LAN Wi-Fi */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPhoneConnectMode('cloud')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  phoneConnectMode === 'cloud'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>1. Vercel Cloud (4G/Wi-Fi)</span>
              </button>
              <button
                type="button"
                onClick={() => setPhoneConnectMode('lan')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  phoneConnectMode === 'lan'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>2. Mạng LAN Wi-Fi</span>
              </button>
            </div>

            {/* High Contrast Standard ISO QR Code Container with 4-module quiet zone */}
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-2xl mx-auto border-4 border-slate-200">
              {(phoneConnectMode === 'cloud' ? (cloudQr || phoneConnectQr) : (lanQr || phoneConnectQr)) ? (
                <img
                  src={phoneConnectMode === 'cloud' ? (cloudQr || phoneConnectQr) : (lanQr || phoneConnectQr)}
                  alt="QR Code kết nối điện thoại"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-500 text-xs font-semibold">
                  Đang tạo mã QR...
                </div>
              )}
            </div>

            {/* Direct URL with Copy button */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-cyan-300 truncate text-[11px]">
                {phoneConnectMode === 'cloud' ? (cloudUrl || mobileConnectUrl) : (lanUrl || mobileConnectUrl)}
              </span>
              <button
                onClick={handleCopyMobileLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold shrink-0 transition-all"
              >
                {hasCopiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Sao chép link
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Button on this Device */}
            <button
              onClick={() => {
                setShowPhoneConnectModal(false);
                setCurrentTab('mobile-controller');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 BẬT NGAY GIAO DIỆN ĐIỀU KHIỂN TRÊN MÁY NÀY ĐỂ TRẢI NGHIỆM</span>
            </button>

            {/* Mode Specific Guide notes */}
            <div className="text-[11px] text-slate-400 text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              {phoneConnectMode === 'cloud' ? (
                <>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Globe className="w-3.5 h-3.5" />
                    Chế độ Vercel Cloud (Khuyên dùng khi có 4G/Internet):
                  </div>
                  <p>• Điện thoại quét mã bằng <b>Camera điện thoại / Zalo / Google Lens</b> từ bất kỳ mạng nào (4G, 5G hoặc Wi-Fi trường).</p>
                  <p>• Dữ liệu đồng bộ tức thì với màn hình máy chiếu qua hệ thống Cloud.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Wifi className="w-3.5 h-3.5" />
                    Chế độ Mạng LAN Wi-Fi Nội Bộ (Không cần Internet):
                  </div>
                  <p>• Điện thoại và máy tính cần kết nối chung một mạng Wi-Fi của trường (hoặc phát Wi-Fi từ điện thoại cho máy tính bắt).</p>
                </>
              )}
              <p>• Tính năng chính: <span className="text-emerald-300 font-semibold">Quét thẻ học sinh 0.1s</span> và <span className="text-cyan-300 font-semibold">Chụp ảnh bài làm nhóm (A3/A4)</span>.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
