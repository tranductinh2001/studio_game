import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlobeScene from './components/Globe/GlobeScene';
import WebbyAvatar from './components/Avatar/WebbyAvatar';
import SubtitleDisplay from './components/Subtitle/SubtitleDisplay';
import VoiceControlBar from './components/VoiceControl/VoiceControlBar';
import TeacherPanel from './components/TeacherPanel/TeacherPanel';
import IntroBanner from './components/IntroBanner/IntroBanner';

// New Classroom Modules
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
  BarChart3, Sparkles, Printer, Smartphone, QrCode, X, Copy, Check, Wifi, ExternalLink 
} from 'lucide-react';

export default function App() {
  // Navigation Tab: 'webby-agent' | 'group-work' | 'qr-assessment' | 'bitone-quiz' | 'card-generator' | 'mobile-controller'
  const [currentTab, setCurrentTab] = useState('webby-agent');
  const [assessmentSelectedQuestion, setAssessmentSelectedQuestion] = useState(null);

  // Phone Connect Modal state
  const [showPhoneConnectModal, setShowPhoneConnectModal] = useState(false);
  const [phoneConnectQr, setPhoneConnectQr] = useState('');
  const [mobileConnectUrl, setMobileConnectUrl] = useState('');
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  // Real-time Agent State: 'IDLE' | 'GREETING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'PAUSED'
  const [agentState, setAgentState] = useState('IDLE');
  const [isSessionActive, setIsSessionActive] = useState(false);

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

  // Check Backend status on mount
  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setHasGeminiKey(status.hasApiKey);
      if (!status.isBackendOnline || !status.hasApiKey) {
        setIsOfflineMode(true);
      }
    });

    // Check URL parameters for direct mobile view (?mode=mobile)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'mobile' || window.location.pathname === '/mobile') {
      setCurrentTab('mobile-controller');
    }

    // Determine correct environment URL & dynamic LAN IP for room join
    const updateMobileConnectUrl = async () => {
      try {
        const netInfo = await classroomService.getNetworkInfo();
        const joinUrl = buildRoomJoinUrl(roomCode, netInfo?.lanIp);
        setMobileConnectUrl(joinUrl);

        const qrData = await QRCode.toDataURL(joinUrl, {
          width: 280,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        });
        setPhoneConnectQr(qrData);
      } catch (err) {
        console.warn('Network info fallback for QR:', err);
        const fallbackUrl = buildRoomJoinUrl(roomCode);
        setMobileConnectUrl(fallbackUrl);
        QRCode.toDataURL(fallbackUrl, {
          width: 280,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        }).then(setPhoneConnectQr).catch(console.warn);
      }
    };

    updateMobileConnectUrl();
  }, []);

  const handleCopyMobileLink = () => {
    if (navigator.clipboard && mobileConnectUrl) {
      navigator.clipboard.writeText(mobileConnectUrl);
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
      speechRec.mute();

      setLastWebbySpeech(text);
      setCurrentSpeaker('WEBBY');
      setSubtitleText(text);
      setInterimText('');
      setEmotion(targetEmotion);
      setAgentState('SPEAKING');

      setConversationHistory((prev) => [...prev.slice(-8), { sender: 'webby', text }]);

      speechSynth.speak(text, () => {
        if (onFinish) {
          onFinish();
        } else if (isSessionActiveRef.current) {
          setTimeout(() => {
            if (isSessionActiveRef.current && agentStateRef.current !== 'PAUSED') {
              setAgentState('LISTENING');
              setEmotion('LISTENING');
              setCurrentSpeaker('HỌC SINH');
              setSubtitleText('WEBBY đang lắng nghe bạn... Hãy nói đi nào!');
              speechRec.unmute();
            }
          }, 350);
        } else {
          setAgentState('IDLE');
          setEmotion('IDLE');
        }
      });
    },
    []
  );

  // Handle student spoken or typed input
  const handleStudentQuery = useCallback(
    async (studentText) => {
      if (!studentText || !studentText.trim()) return;

      const trimmed = studentText.trim();
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
          'Đó là một câu hỏi rất hay! Nhưng mình hơi bối rối một chút. Bạn có thể hỏi lại về trang web hay Internet được không?',
          'THINKING'
        );
      }
    },
    [conversationHistory, speakAsWebby]
  );

  // Bind speech recognition callbacks
  useEffect(() => {
    speechRec.onResult = (finalTranscript) => {
      if (agentStateRef.current === 'SPEAKING' || !isSessionActiveRef.current) {
        return;
      }
      handleStudentQuery(finalTranscript);
    };

    speechRec.onInterim = (interimTranscript) => {
      if (agentStateRef.current === 'LISTENING') {
        setInterimText(interimTranscript);
      }
    };

    speechRec.onError = (error) => {
      if (error !== 'no-speech') {
        console.warn('Speech recognition notice:', error);
      }
    };
  }, [handleStudentQuery]);

  // Start continuous conversation session
  const handleStartSession = () => {
    setIsSessionActive(true);
    setRoundCount(0);
    setConversationHistory([]);

    const greetingText =
      'Xin chào các bạn học sinh lớp 6! Mình là WEBBY, đại sứ Mạng thông tin toàn cầu! Hôm nay mình rất vui được đồng hành cùng các bạn khám phá thế giới Internet kỳ thú! Các bạn đã sẵn sàng chưa nào?';

    speakAsWebby(greetingText, 'GREETING');
  };

  // Stop session
  const handleStopSession = () => {
    setIsSessionActive(false);
    speechSynth.stop();
    speechRec.stop();
    setAgentState('IDLE');
    setEmotion('IDLE');
    setCurrentSpeaker('WEBBY');
    setSubtitleText('Phiên trò chuyện đã kết thúc. Nhấn BẮT ĐẦU TRÒ CHUYỆN để gặp lại WEBBY!');
    setInterimText('');
  };

  // Pause listening
  const handlePauseListening = () => {
    setAgentState('PAUSED');
    speechRec.stop();
    speechSynth.stop();
  };

  // Resume listening
  const handleResumeListening = () => {
    setAgentState('LISTENING');
    setEmotion('LISTENING');
    setCurrentSpeaker('HỌC SINH');
    setSubtitleText('WEBBY đang lắng nghe bạn... Hãy nói đi nào!');
    speechRec.start();
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

        {/* 5 Main Mode Navigation Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
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
                onStartSession={handleStartSession}
                onStopSession={handleStopSession}
                onPauseListening={handlePauseListening}
                onResumeListening={handleResumeListening}
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
                Dùng camera điện thoại quét mã QR bên dưới để mở giao diện điều khiển
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl inline-block border-4 border-cyan-400 shadow-xl mx-auto">
              {phoneConnectQr ? (
                <img
                  src={phoneConnectQr}
                  alt="QR Code kết nối điện thoại"
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Đang tạo mã QR...
                </div>
              )}
            </div>

            {/* Direct URL with Copy button */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-cyan-300 truncate text-[11px]">
                {mobileConnectUrl}
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
                    Sao chép
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Environment & Wi-Fi Guide notes */}
            <div className="text-[11px] text-slate-400 text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Wifi className="w-3.5 h-3.5" />
                Môi trường kết nối: {detectAppEnv() === 'production' ? (
                  <span className="text-emerald-400 font-semibold">Vercel Cloud (Online 4G/Wi-Fi)</span>
                ) : (
                  <span className="text-amber-300 font-semibold">Mạng LAN Wi-Fi Nội Bộ</span>
                )}
              </div>
              {detectAppEnv() === 'production' ? (
                <p>• Điện thoại có thể quét mã từ bất kỳ đâu (4G hoặc Wi-Fi) để đồng bộ trực tiếp với màn hình máy chiếu.</p>
              ) : (
                <p>• Điện thoại và máy tính cần kết nối chung mạng Wi-Fi (hoặc phát Wi-Fi từ điện thoại sang máy tính).</p>
              )}
              <p>• Dùng điện thoại để: <span className="text-emerald-300 font-semibold">Quét thẻ QR học sinh</span> và <span className="text-cyan-300 font-semibold">Chụp ảnh bài làm nhóm (A3/A4)</span>.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
