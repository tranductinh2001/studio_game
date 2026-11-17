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
import CardGenerator from './components/CardGenerator/CardGenerator';
import MobileController from './components/Mobile/MobileController';

import { speechSynth } from './services/speechSynthesis';
import { speechRec } from './services/speechRecognition';
import { aiService } from './services/aiService';
import { classroomService } from './services/classroomService';
import { detectAppEnv, buildRoomJoinUrl } from './config/environment';
import conversationScripts from './data/conversationScripts.json';
import QRCode from 'qrcode';
import { 
  Maximize2, Minimize2, Globe, Bot, Image as ImageIcon, 
  BarChart3, Sparkles, Printer, Smartphone, QrCode, X, Copy, Check, Wifi, ExternalLink, BookOpen 
} from 'lucide-react';

export default function App() {
  // Navigation Tab: 'lesson-slide' | 'webby-agent' | 'group-work' | 'qr-assessment' | 'bitone-quiz' | 'card-generator' | 'mobile-controller'
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

  // Real-time Agent State: 'IDLE' | 'GREETING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'
  const [agentState, setAgentState] = useState('IDLE');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [micError, setMicError] = useState(null);

  // Avatar & Speech animation states
  const [emotion, setEmotion] = useState('IDLE');
  const [mouthValue, setMouthValue] = useState(0);
  const [speechRate, setSpeechRate] = useState(0.95);

  // Subtitle & Conversation Memory states
  const [currentSpeaker, setCurrentSpeaker] = useState('WEBBY');
  const [subtitleText, setSubtitleText] = useState(
    'Nhấn nút BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC để gặp gỡ Đại sứ WEBBY!'
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

  // Webby speaks text with subtitles, lip-sync, and auto-transition when done
  const speakAsWebby = useCallback(
    (text, targetEmotion = 'SPEAKING', onFinish = null) => {
      // 1. Immediately mute speech recognition so Webby's voice is never captured by microphone
      speechRec.mute();

      setLastWebbySpeech(text);
      lastWebbySpeechRef.current = text;
      setCurrentSpeaker('WEBBY');
      setSubtitleText(text);
      setInterimText('');
      setEmotion(targetEmotion);
      setAgentState('SPEAKING');

      setConversationHistory((prev) => [...prev.slice(-8), { sender: 'webby', text }]);

      speechSynth.speak(text, () => {
        // Record timestamp when Webby stops speaking
        speechEndedTimeRef.current = Date.now();

        if (onFinish) {
          onFinish();
          isProcessingQueryRef.current = false;
        } else if (isSessionActiveRef.current) {
          // Acoustic cooldown window: 800ms to allow physical room echo to completely dissipate
          setTimeout(() => {
            isProcessingQueryRef.current = false;
            if (isSessionActiveRef.current && agentStateRef.current !== 'PAUSED') {
              setAgentState('LISTENING');
              setEmotion('LISTENING');
              setCurrentSpeaker('HỌC SINH');
              setSubtitleText('WEBBY đang lắng nghe bạn... Hãy nói đi nào!');
              speechRec.unmute();
            }
          }, 800);
        } else {
          isProcessingQueryRef.current = false;
          setAgentState('IDLE');
          setEmotion('IDLE');
        }
      });
    },
    []
  );

  // Handle student spoken or typed input
  const handleStudentQuery = useCallback(
    async (studentText, isManual = false) => {
      if (!studentText || !studentText.trim()) return;

      const trimmed = studentText.trim();
      const lower = trimmed.toLowerCase();

      // Guard 1: Mutex lock - already answering a query
      if (isProcessingQueryRef.current) {
        console.log('[handleStudentQuery] Blocked: Already processing a query');
        return;
      }

      // Guard 2: Agent is currently speaking or processing (unless manual override)
      if (!isManual && (agentStateRef.current === 'SPEAKING' || agentStateRef.current === 'PROCESSING')) {
        console.log('[handleStudentQuery] Blocked: Agent is currently speaking/processing');
        return;
      }

      // Guard 3: Acoustic cooldown window (800ms after Webby stops speaking)
      const timeSinceSpeech = Date.now() - speechEndedTimeRef.current;
      if (!isManual && speechEndedTimeRef.current > 0 && timeSinceSpeech < 800) {
        console.log(`[handleStudentQuery] Blocked: Within 800ms acoustic cooldown window (${timeSinceSpeech}ms)`);
        return;
      }

      // Guard 4: Anti-echo filter - verify student input is not echoing Webby's own voice
      if (!isManual && lastWebbySpeechRef.current) {
        const lastWebbyLower = lastWebbySpeechRef.current.toLowerCase();
        if (lastWebbyLower.includes(lower) && lower.length > 6) {
          console.log('[handleStudentQuery] Blocked: Self-echo detected from speaker:', trimmed);
          return;
        }
      }

      // Acquire mutex lock
      isProcessingQueryRef.current = true;

      setCurrentSpeaker('HỌC SINH');
      setSubtitleText(`"${trimmed}"`);
      setInterimText('');
      setAgentState('PROCESSING');
      setEmotion('THINKING');

      speechRec.mute();

      setConversationHistory((prev) => [...prev.slice(-8), { sender: 'user', text: trimmed }]);
      setRoundCount((prev) => prev + 1);

      try {
        const response = await aiService.sendMessage(trimmed, conversationHistory);
        speakAsWebby(response.reply, response.emotion || 'SPEAKING');
      } catch (err) {
        console.error('Error generating AI response:', err);
        speakAsWebby(
          'Thầy cô và các bạn hãy hỏi mình thêm về World Wide Web, siêu liên kết hoặc trình duyệt web nhé! Mình đã sẵn sàng rồi đây!',
          'HAPPY'
        );
      }
    },
    [conversationHistory, speakAsWebby]
  );

  // Bind speech recognition callbacks
  useEffect(() => {
    const handleResult = (finalTranscript) => {
      if (!finalTranscript) return;
      console.log('[App] Speech Recognition Result:', finalTranscript);
      if (agentStateRef.current === 'SPEAKING' || agentStateRef.current === 'PROCESSING' || !isSessionActiveRef.current) {
        console.log('[App] Ignored speech while Webby is speaking/processing or session inactive');
        return;
      }
      handleStudentQuery(finalTranscript);
    };

    const handleInterim = (interimTranscript) => {
      if (agentStateRef.current === 'LISTENING') {
        setInterimText(interimTranscript);
      }
    };

    const handleError = (error) => {
      if (error === 'not-allowed' || error === 'service-not-allowed') {
        setMicError('Trình duyệt chưa cho phép truy cập Micro. Hãy nhấp vào biểu tượng 🔒 hoặc 🎙️ trên thanh địa chỉ để Cấp quyền!');
      } else if (error !== 'no-speech' && error !== 'aborted') {
        console.warn('Speech recognition notice:', error);
      }
    };

    // Assign direct callback properties (Do NOT double-bind with subscribe)
    speechRec.onResult = handleResult;
    speechRec.onInterim = handleInterim;
    speechRec.onError = handleError;

    return () => {
      speechRec.onResult = null;
      speechRec.onInterim = null;
      speechRec.onError = null;
    };
  }, [handleStudentQuery]);

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

  // Start continuous conversation session
  const handleStartSession = async () => {
    setMicError(null);
    if (speechRec.requestMicPermission) {
      await speechRec.requestMicPermission();
    }

    setIsSessionActive(true);
    setRoundCount(0);
    setConversationHistory([]);
    isProcessingQueryRef.current = false;
    speechEndedTimeRef.current = 0;

    // Enable continuous listening mode so safeStart() knows agent wants to listen
    speechRec.startContinuous();

    const greetingText =
      'Xin chào các bạn học sinh lớp 6! Mình là WEBBY, đại sứ Mạng thông tin toàn cầu! Hôm nay mình rất vui được đồng hành cùng các bạn khám phá thế giới Internet kỳ thú! Các bạn đã sẵn sàng chưa nào?';

    speakAsWebby(greetingText, 'GREETING');
  };

  // Directly activate microphone listening without waiting for greeting
  const handleDirectListen = async () => {
    setMicError(null);
    if (speechRec.requestMicPermission) {
      await speechRec.requestMicPermission();
    }

    setIsSessionActive(true);
    isProcessingQueryRef.current = false;
    speechEndedTimeRef.current = 0;
    speechSynth.stop();
    setAgentState('LISTENING');
    setEmotion('LISTENING');
    setCurrentSpeaker('HỌC SINH');
    setSubtitleText('WEBBY đang lắng nghe bạn... Hãy nói hoặc chọn câu hỏi gợi ý!');
    setInterimText('');
    speechRec.unmute();
    speechRec.startContinuous();
  };

  // Stop session
  const handleStopSession = () => {
    setIsSessionActive(false);
    isProcessingQueryRef.current = false;
    speechEndedTimeRef.current = 0;
    speechSynth.stop();
    speechRec.stopContinuous();
    setAgentState('IDLE');
    setEmotion('IDLE');
    setCurrentSpeaker('WEBBY');
    setSubtitleText('Phiên trò chuyện đã kết thúc. Nhấn BẮT ĐẦU TRÒ CHUYỆN để gặp lại WEBBY!');
    setInterimText('');
  };

  // Pause listening
  const handlePauseListening = () => {
    setAgentState('PAUSED');
    isProcessingQueryRef.current = false;
    speechRec.mute();
    speechSynth.stop();
  };

  // Resume listening
  const handleResumeListening = () => {
    setAgentState('LISTENING');
    setEmotion('LISTENING');
    setCurrentSpeaker('HỌC SINH');
    setSubtitleText('WEBBY đang lắng nghe bạn... Hãy nói đi nào!');
    speechRec.unmute();
    speechRec.startContinuous();
  };

  // Replay speech
  const handleReplaySpeech = () => {
    if (lastWebbySpeech) {
      speakAsWebby(lastWebbySpeech, emotion);
    }
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
      speakAsWebby(step.webbyResponse, step.emotion || 'SPEAKING');
    }
  };

  // Teacher FAQ clicked
  const handleSelectFaqQuestion = (faqItem) => {
    setCurrentSpeaker('HỌC SINH');
    setSubtitleText(`"${faqItem.question}"`);

    setTimeout(() => {
      speakAsWebby(`${faqItem.answer} ${faqItem.followup}`, 'SPEAKING');
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
            onClick={() => setCurrentTab('webby-agent')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'webby-agent'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Webby AI</span>
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
            <span className="hidden sm:inline">BitOne AI Soạn Đề</span>
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
                onManualSubmit={handleStudentQuery}
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

        {/* TAB 4: BITONE AI QUESTION GENERATOR */}
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
