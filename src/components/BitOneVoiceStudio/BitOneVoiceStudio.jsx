import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2, Mic, MicOff, Play, Pause, RotateCcw,
  Download, Upload, CheckCircle2, AlertTriangle, Copy, Check,
  Sparkles, Sliders, User, FileAudio, ArrowRight,
  BookOpen, Layers, RefreshCw, Music, Award, HelpCircle, ShieldCheck
} from 'lucide-react';
import BitOneQuestionGenerator from '../BitOneQuiz/BitOneQuestionGenerator';

// Complete Scripts for 5 LACB Audios
const ASSIGNMENTS_DATA = {
  1: {
    title: 'Audio 1: Cặp âm /iː/ - /ɪ/ & /e/ - /æ/',
    pairs: 'peel /iː/ vs pill /ɪ/ • leave vs live • leak vs lick • pen vs pan • sheep vs ship',
    speaker1: `Hey Brad! Are you ready to leave? Did you peel the apples and put the peel in the bin? Oh no, stop it leaking! Do not just let the dog lick it! Take a pin or a peg to fix it. Wait, do we need bread or jam? Got it. Should I bring a pen to write down the bill, or maybe a cheque? Okay. By the way, where are we going to live during the trip? Near the sheep or near the big ship? Awesome! Ring the bell, mark an X on the map, and let us go!`,
    speaker2: `Yes, I did. But look at the sink, it is starting to leak! Fixed! Now, what about the food? Should I pack this tin of beans? Both! Put the bread in a pan, and throw out that old bean in the bin. Just bring a pen. Oh, and do not forget to send a message to the men at the farm. Near the field. We can see the cute little chicks with yellow cheeks, a little pig, and maybe even a sheep.`,
    both: `Speaker 1: Hey Brad! Are you ready to leave? Did you peel the apples and put the peel in the bin?\nSpeaker 2: Yes, I did. But look at the sink, it is starting to leak!\nSpeaker 1: Oh no, stop it leaking! Do not just let the dog lick it! Take a pin or a peg to fix it.\nSpeaker 2: Fixed! Now, what about the food? Should I pack this tin of beans?\nSpeaker 1: Wait, do we need bread or jam?\nSpeaker 2: Both! Put the bread in a pan, and throw out that old bean in the bin.\nSpeaker 1: Got it. Should I bring a pen to write down the bill, or maybe a cheque?\nSpeaker 2: Just bring a pen. Oh, and do not forget to send a message to the men at the farm.\nSpeaker 1: Okay. By the way, where are we going to live during the trip? Near the sheep or near the big ship?\nSpeaker 2: Near the field. We can see the cute little chicks with yellow cheeks, a little pig, and maybe even a sheep.\nSpeaker 1: Awesome! Ring the bell, mark an X on the map, and let us go!`
  },
  2: {
    title: 'Audio 2: Cặp âm /ɑː/ - /ʌ/ & /ɒ/ - /ɔː/',
    pairs: 'park /ɑː/ vs truck /ʌ/ • barn vs hut • cod /ɒ/ vs cord /ɔː/ • cap vs cup',
    speaker1: `Hey Dawn! Are you ready to pack for the trip? Remember to park the truck near the old barn, not near the small hut. Calm down, Dawn. Keep the cat in its cot, and come check the food. We have a fresh bun, some fried carp, and a fresh cod. Put it in a sack, then tie it with a cord. Oh, watch out for that nasty bug on the cart! Here is your hat and your favorite cap. Drink a cup of water, turn off the tap, and put a top on the pot.`,
    speaker2: `Got it, Don! Is there a ban on bringing animals? My cat wants to chase a fox in the park. Great! Put the cod and carp in a pot, and bring some forks. Should I put the bun into a sack or a box? Ouch! It bit my ankle! My uncle told me to be careful. Where is my hat? It is hot weather outside. Done! I also sent a fax to your uncle. Now, let us carry in these heavy sacks. My heart is beating fast, but I am ready for some outdoor sport!`,
    both: `Speaker 1 (Don): Hey Dawn! Are you ready to pack for the trip? Remember to park the truck near the old barn, not near the small hut.\nSpeaker 2 (Dawn): Got it, Don! Is there a ban on bringing animals? My cat wants to chase a fox in the park.\nSpeaker 1 (Don): Calm down, Dawn. Keep the cat in its cot, and come check the food. We have a fresh bun, some fried carp, and a fresh cod.\nSpeaker 2 (Dawn): Great! Put the cod and carp in a pot, and bring some forks. Should I put the bun into a sack or a box?\nSpeaker 1 (Don): Put it in a sack, then tie it with a cord. Oh, watch out for that nasty bug on the cart!\nSpeaker 2 (Dawn): Ouch! It bit my ankle! My uncle told me to be careful. Where is my hat? It is hot weather outside.\nSpeaker 1 (Don): Here is your hat and your favorite cap. Drink a cup of water, turn off the tap, and put a top on the pot.\nSpeaker 2 (Dawn): Done! I also sent a fax to your uncle. Now, let us carry in these heavy sacks. My heart is beating fast, but I am ready for some outdoor sport!`
  },
  3: {
    title: 'Audio 3: Cặp âm /uː/ - /ʊ/ & /ɜː/ - /ə/',
    pairs: 'pool /uː/ vs pull /ʊ/ • fool vs full • bird /ɜː/ vs bud /ə/ • worker vs walker',
    speaker1: `Hey Luke! Look at the garden! It is 4 o'clock and we still need to pot this plant and put it near the fern. Do not be lazy! Pull the hose near the pool. Be careful not to step on that worm near the rock or a rook might eat it. It is a bird. The bird cooed nicely. It would stay if you did not scare it. By the way, who wooed that girl sitting by the beach? Right. Help me take this box of books inside. Make sure to lock the door so no one will look inside. Haha! Taking a walk with a fast walker like you is fun, even if you are a slow worker. Eat a bun and let us go!`,
    speaker2: `I could help, but I am full! That warm soup with the cod was delicious. I am no fool to work on a full stomach. Okay, okay. Wait, look at the bed of flowers. Is that a bud or a colorful bird? That is my sister. She is wearing a fur coat because of the cold west wind. But today is the worst wind ever. It made a gull fly away. Do not worry, I will not turn the wrong way. The sign says "turn", not "ten". Let us hurry or the sun will burn us.`,
    both: `Speaker 1: Hey Luke! Look at the garden! It is 4 o'clock and we still need to pot this plant and put it near the fern.\nSpeaker 2 (Luke): I could help, but I am full! That warm soup with the cod was delicious. I am no fool to work on a full stomach.\nSpeaker 1: Do not be lazy! Pull the hose near the pool. Be careful not to step on that worm near the rock or a rook might eat it.\nSpeaker 2 (Luke): Okay, okay. Wait, look at the bed of flowers. Is that a bud or a colorful bird?\nSpeaker 1: It is a bird. The bird cooed nicely. It would stay if you did not scare it. By the way, who wooed that girl sitting by the beach?\nSpeaker 2 (Luke): That is my sister. She is wearing a fur coat because of the cold west wind. But today is the worst wind ever. It made a gull fly away.\nSpeaker 1: Right. Help me take this box of books inside. Make sure to lock the door so no one will look inside.\nSpeaker 2 (Luke): Do not worry, I will not turn the wrong way. The sign says "turn", not "ten". Let us hurry or the sun will burn us.\nSpeaker 1: Haha! Taking a walk with a fast walker like you is fun, even if you are a slow worker. Eat a bun and let us go!`
  },
  4: {
    title: 'Audio 4: Nguyên âm đôi Diphthongs (/aɪ/, /eə/, /ɪə/, /əʊ/)',
    pairs: 'pie /aɪ/ • pear /eə/ • pier /ɪə/ • beer /ɪə/ • bowl /əʊ/ • coin /ɔɪ/',
    speaker1: `Hey Jane! Take a look at the boat! Did you put the fresh pie and the pear into the bowl? Do not worry. Ouch! A sharp bone in this chicken hit my brow. I am fine. Look, there is a big cow standing in the shade near the wooden chairs. What an odd age we live in. Nice! Let us sit by the pier, drink a cold beer, and take a taste of the pie. Wow, I see a golden coin on that board! Should I bow down to pick it up? Do not worry, I will not lose a single tear. Pass me that paper to wrap the food, and let us ride my bike home after this.`,
    speaker2: `Yes, Roy, but wait! Do not drop that hot oil! It can boil quickly and cause a terrible pain. Oh, let me check. Keep your eye open. Thank goodness, it did not hit your ear or your beard. Haha! Take a note of this: I woke up early to buy this toy kite for my nephew. Check its height when it flies! Good idea. The ocean air is so fresh! Watch that wooden board float near the pier. Be careful, or you will tear your new coat! Do not grouse if you drop your phone into the water. Great! Look, that fluffy bear toy on the boat has funny hair. Let us go, Joe is waiting for us.`,
    both: `Speaker 1 (Roy): Hey Jane! Take a look at the boat! Did you put the fresh pie and the pear into the bowl?\nSpeaker 2 (Jane): Yes, Roy, but wait! Do not drop that hot oil! It can boil quickly and cause a terrible pain.\nSpeaker 1 (Roy): Do not worry. Ouch! A sharp bone in this chicken hit my brow.\nSpeaker 2 (Jane): Oh, let me check. Keep your eye open. Thank goodness, it did not hit your ear or your beard.\nSpeaker 1 (Roy): I am fine. Look, there is a big cow standing in the shade near the wooden chairs. What an odd age we live in.\nSpeaker 2 (Jane): Haha! Take a note of this: I woke up early to buy this toy kite for my nephew. Check its height when it flies!\nSpeaker 1 (Roy): Nice! Let us sit by the pier, drink a cold beer, and take a taste of the pie.\nSpeaker 2 (Jane): Good idea. The ocean air is so fresh! Watch that wooden board float near the pier.\nSpeaker 1 (Roy): Wow, I see a golden coin on that board! Should I bow down to pick it up?\nSpeaker 2 (Jane): Be careful, or you will tear your new coat! Do not grouse if you drop your phone into the water.\nSpeaker 1 (Roy): Do not worry, I will not lose a single tear. Pass me that paper to wrap the food, and let us ride my bike home after this.\nSpeaker 2 (Jane): Great! Look, that fluffy bear toy on the boat has funny hair. Let us go, Joe is waiting for us.`
  },
  5: {
    title: 'Audio 5: Các cặp phụ âm /p/-/b/, /t/-/d/, /tʃ/-/dʒ/, /ʃ/-/ʒ/',
    pairs: 'choking /tʃ/ vs joking /dʒ/ • cheap vs Jeep • measure /ʒ/ vs shoe /ʃ/',
    speaker1: `Hey Poppy! Did you get a pen to write your age and name on this card? Are you choking or joking? Wow, look at the collision outside the shoe shop! An ambulance is taking a casualty to the hospital. Got it. Let us sip some tea first. Did you pack the pear and the little bear toy into the bin? Okay. I need to measure my feet for new casual shoes. Occasionally, I get a foot massage after a long walk. Wow! Should I sew a letter H or a C on my jacket?`,
    speaker2: `Yes, Ben, but wait! Look at Sue! She is trying to push that cheap green Jeep near the pub. Oh no, I hope everyone is safe. By the way, Bobby asked us to ship this large box of cherries to Jerry's house. No, I put them in a bag. Throw out that old pin and that ash from the barbecue. Do not drop your cap inside the cab. Good idea. Show me your shoe size. Look at that larch tree on the ridges. The mountain is full of natural riches. Write H. Now, help me catch that cute pup. Puss! Come here, little doggy!`,
    both: `Speaker 1 (Ben): Hey Poppy! Did you get a pen to write your age and name on this card?\nSpeaker 2 (Poppy): Yes, Ben, but wait! Look at Sue! She is trying to push that cheap green Jeep near the pub.\nSpeaker 1 (Ben): Are you choking or joking? Wow, look at the collision outside the shoe shop! An ambulance is taking a casualty to the hospital.\nSpeaker 2 (Poppy): Oh no, I hope everyone is safe. By the way, Bobby asked us to ship this large box of cherries to Jerry's house.\nSpeaker 1 (Ben): Got it. Let us sip some tea first. Did you pack the pear and the little bear toy into the bin?\nSpeaker 2 (Poppy): No, I put them in a bag. Throw out that old pin and that ash from the barbecue. Do not drop your cap inside the cab.\nSpeaker 1 (Ben): Okay. I need to measure my feet for new casual shoes. Occasionally, I get a foot massage after a long walk.\nSpeaker 2 (Poppy): Good idea. Show me your shoe size. Look at that larch tree on the ridges. The mountain is full of natural riches.\nSpeaker 1 (Ben): Wow! Should I sew a letter H or a C on my jacket?\nSpeaker 2 (Poppy): Write H. Now, help me catch that cute pup. Puss! Come here, little doggy!`
  }
};

export default function BitOneVoiceStudio({ onSelectQuestionForAssessment }) {
  // Navigation tabs: 'assignment' (main) | 'tts' | 'stt' | 'quiz'
  const [activeTab, setActiveTab] = useState('assignment');

  // ==========================================
  // STATE: 1. TẠO BÀI NỘP 5 AUDIO (CORE FEATURE)
  // ==========================================
  const [selectedAudioNum, setSelectedAudioNum] = useState(1);
  const [selectedSpeaker, setSelectedSpeaker] = useState('speaker1');
  const [selectedVoice, setSelectedVoice] = useState('en-US-BrianMultilingualNeural');
  const [customImperfectionPrompt, setCustomImperfectionPrompt] = useState('Đọc tự nhiên, đàm thoại sinh động, không đều đều kiểu robot');
  const [learnerLevel, setLearnerLevel] = useState('82'); // '88', '82', '75'
  const [assignmentScriptText, setAssignmentScriptText] = useState(ASSIGNMENTS_DATA[1].speaker1);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('/audio_generated/Audio_1_Spk1_Brian_TuNhien.mp3');
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  
  // Voice sample & ref audio
  const [refSampleUrl, setRefSampleUrl] = useState('/voice_samples/default_learner_voice.wav');
  const [sampleAnalysis, setSampleAnalysis] = useState(null);

  // Update text and audio when changing Audio number or Speaker
  useEffect(() => {
    const data = ASSIGNMENTS_DATA[selectedAudioNum];
    if (data) {
      setAssignmentScriptText(data[selectedSpeaker] || data.speaker1);
      const speakerSuffix = selectedSpeaker === 'speaker2' ? 'Speaker_2' : 'Speaker_1';
      setGeneratedAudioUrl(`/audio_generated/Bai_Nop_Audio_${selectedAudioNum}_${speakerSuffix}.mp3`);
    }
  }, [selectedAudioNum, selectedSpeaker]);

  // Load sample analysis on mount
  useEffect(() => {
    fetch('/api/voice/analyze-sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleFile: 'default_learner_voice.wav' })
    })
      .then(r => r.json())
      .then(d => setSampleAnalysis(d))
      .catch(e => console.warn(e));
  }, []);

  // Handler: Generate Custom Audio with Conversational Neural Voices
  const handleGenerateCustomAssignment = async () => {
    setIsGeneratingAssignment(true);
    setAssignmentError('');
    try {
      const res = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: assignmentScriptText,
          voice: selectedVoice,
          level: learnerLevel,
          prompt: customImperfectionPrompt,
          speed: learnerLevel === '75' ? 0.85 : (learnerLevel === '88' ? 0.98 : 0.94),
          micSimulate: false
        })
      });

      const d = await res.json();
      if (d.success && d.audioUrl) {
        setGeneratedAudioUrl(d.audioUrl + `?t=${Date.now()}`);
      } else {
        setAssignmentError(d.error || 'Lỗi khi tạo âm thanh');
      }
    } catch (err) {
      setAssignmentError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsGeneratingAssignment(false);
    }
  };

  // ==========================================
  // STATE: 2. TTS TỰ DO
  // ==========================================
  const [freeTtsText, setFreeTtsText] = useState('Hey Brad, did you peel the apples and put the peel in the bin?');
  const [freeTtsVoice, setFreeTtsVoice] = useState('en-US-JennyNeural');
  const [freeTtsSpeed, setFreeTtsSpeed] = useState(0.9);
  const [freeTtsAudioUrl, setFreeTtsAudioUrl] = useState('');
  const [isFreeTtsLoading, setIsFreeTtsLoading] = useState(false);

  const handleGenerateFreeTts = async () => {
    if (!freeTtsText.trim()) return;
    setIsFreeTtsLoading(true);
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: freeTtsText,
          voice: freeTtsVoice,
          rate: `${freeTtsSpeed >= 1 ? '+' : ''}${Math.round((freeTtsSpeed - 1) * 100)}%`,
          pitch: '+0Hz',
          accent: freeTtsVoice.includes('GB') ? 'uk' : 'us'
        })
      });
      const d = await res.json();
      if (d.success && d.audioUrl) {
        setFreeTtsAudioUrl(d.audioUrl + `?t=${Date.now()}`);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsFreeTtsLoading(false);
    }
  };

  // ==========================================
  // STATE: 3. STT THU ÂM TRỰC TIẾP
  // ==========================================
  const [isRecordingStt, setIsRecordingStt] = useState(false);
  const [sttTranscript, setSttTranscript] = useState('');
  const [sttCopied, setSttCopied] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        }
        if (final) setSttTranscript(prev => (prev ? prev + ' ' : '') + final.trim());
      };
      rec.onerror = () => setIsRecordingStt(false);
      rec.onend = () => setIsRecordingStt(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleStt = () => {
    if (!recognitionRef.current) return alert('Trình duyệt chưa hỗ trợ Speech Recognition API');
    if (isRecordingStt) {
      recognitionRef.current.stop();
      setIsRecordingStt(false);
    } else {
      setSttTranscript('');
      recognitionRef.current.start();
      setIsRecordingStt(true);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto min-h-screen">
      {/* Studio Header - Sleek & Compact */}
      <div className="max-w-6xl mx-auto mb-5">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Bit1 Studio • VB2 LACB
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mô Hình Hội Thoại Siêu Thực (Không Robot Google)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Bit1 Voice Studio – Trình Tạo Giọng Đọc Tiếng Anh Tự Nhiên
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Tạo file MP3 bài tập Audio 1 → 5 với chất giọng đối thoại sinh động, lên bổng xuống trầm tự nhiên, xoá bỏ hoàn toàn cảm giác máy móc của Google Dịch.
              </p>
            </div>

            {/* Neural Engine Badge */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs backdrop-blur-md shrink-0">
              <div className="text-slate-400 text-[11px]">Công nghệ giọng đọc:</div>
              <div className="text-emerald-400 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Conversational Neural (Brian / Ava / Ryan)
              </div>
            </div>
          </div>

          {/* Clean Main Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
            {[
              { id: 'assignment', label: '🎯 1. Tạo Bài Nộp 5 Audio (Fake Giọng Học Viên)', highlight: true },
              { id: 'tts', label: '🗣️ 2. Text to Speech Tự Do', highlight: false },
              { id: 'stt', label: '🎙️ 3. Thu Âm & Nhận Diện Giọng (STT)', highlight: false },
              { id: 'quiz', label: '📝 4. Soạn Đề Tin Học (Cũ)', highlight: false }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                    : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ======================================================== */}
        {/* TAB 1: CORE FEATURE - TẠO BÀI NỘP 5 AUDIO */}
        {/* ======================================================== */}
        {activeTab === 'assignment' && (
          <div className="space-y-5">
            {/* 1. Chọn Audio 1 -> 5 Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedAudioNum(num)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedAudioNum === num
                      ? 'bg-gradient-to-br from-indigo-900/70 to-purple-900/70 border-indigo-500 shadow-md shadow-indigo-500/20 text-white ring-1 ring-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-indigo-400">Audio {num}</span>
                    {selectedAudioNum === num && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-xs font-bold line-clamp-1 mt-0.5">
                    {ASSIGNMENTS_DATA[num].title.split(':')[1] || ASSIGNMENTS_DATA[num].title}
                  </div>
                </button>
              ))}
            </div>

            {/* 2. Main Studio Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2/3): Controls & Prompt-driven Imperfection */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  {/* Select Speaker Role */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="text-xs font-bold text-slate-300">
                      Vai đọc trong bài tập:
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'speaker1', label: 'Speaker 1 (Khuyên dùng)' },
                        { id: 'speaker2', label: 'Speaker 2' },
                        { id: 'both', label: 'Cả 2 vai (Đối thoại)' }
                      ].map(role => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedSpeaker(role.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedSpeaker === role.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Natural Conversational Voice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      Giọng AI hội thoại tự nhiên:
                    </div>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                    >
                      <option value="en-US-BrianMultilingualNeural">Brian (US Nam - Rất tự nhiên, ấm áp, đàm thoại mượt mà)</option>
                      <option value="en-US-AvaMultilingualNeural">Ava (US Nữ - Trong trẻo, biểu cảm tự nhiên như người thật)</option>
                      <option value="en-GB-RyanNeural">Ryan (UK Nam - Chuẩn giọng Anh BBC thanh lịch)</option>
                      <option value="en-US-EmmaNeural">Emma (US Nữ - Nhẹ nhàng, tự nhiên)</option>
                      <option value="en-US-ChristopherNeural">Christopher (US Nam - Thân thiện, đời thường)</option>
                    </select>
                  </div>

                  {/* Controlled Imperfection / Learner Naturalness Level */}
                  <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        Mức độ phát âm học viên (Tránh đọc quá chuẩn như Tây):
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {learnerLevel === '88' ? '88% (Khá chuẩn)' : (learnerLevel === '82' ? '82% (Tự nhiên nhất • Khuyên dùng)' : '75% (Học viên mới)')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '88', label: '88% - Học viên Khá', desc: 'Nhịp đều, rõ chữ' },
                        { id: '82', label: '82% - Tự Nhiên VN', desc: 'Nhịp phẳng, chuẩn bài nộp' },
                        { id: '75', label: '75% - Mới Luyện', desc: 'Đọc chậm, hơi ngập ngừng' }
                      ].map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => {
                            setLearnerLevel(lvl.id);
                            if (lvl.id === '82') setCustomImperfectionPrompt('Đọc hơi chậm một chút, ngắt nghỉ tự nhiên, không nuốt âm Tây');
                            else if (lvl.id === '75') setCustomImperfectionPrompt('Đọc chậm từng từ, hơi ngập ngừng, phát âm phẳng');
                            else setCustomImperfectionPrompt('Đọc thong thả rõ ràng, ngắt nghỉ chuẩn, không lướt âm');
                          }}
                          className={`p-2.5 rounded-lg text-left border transition-all ${
                            learnerLevel === lvl.id
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{lvl.label}</div>
                          <div className="text-[10px] opacity-75">{lvl.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Prompt Input */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Nhập Prompt điều chỉnh độ sai / phong cách đọc theo ý bạn:</span>
                      </div>
                      <input
                        type="text"
                        value={customImperfectionPrompt}
                        onChange={(e) => setCustomImperfectionPrompt(e.target.value)}
                        placeholder="Ví dụ: đọc chậm, hơi ngập ngừng ở đầu câu, đọc rõ từng từ không nối âm..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                      {/* Quick Prompt Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Đọc chậm, không lướt âm',
                          'Hơi ngập ngừng nhẹ ở dấu phẩy',
                          'Phát âm rõ từng từ kiểu Việt Nam',
                          'Tách từ viết tắt, không nối âm Tây'
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCustomImperfectionPrompt(chip)}
                            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 px-2 py-0.5 rounded-md transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Script Text Display / Edit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-slate-300">Văn bản bài đọc (Đã chèn ngắt nhịp học viên):</span>
                      <span className="text-[11px] text-indigo-400">{ASSIGNMENTS_DATA[selectedAudioNum].pairs}</span>
                    </div>
                    <textarea
                      value={assignmentScriptText}
                      onChange={(e) => setAssignmentScriptText(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleGenerateCustomAssignment}
                    disabled={isGeneratingAssignment || !assignmentScriptText.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all"
                  >
                    {isGeneratingAssignment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang áp dụng Prompt & mô phỏng chất giọng học viên...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Sinh Giọng Bài Nộp Theo Prompt Này (.MP3)
                      </>
                    )}
                  </button>

                  {assignmentError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {assignmentError}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (1/3): Player & Submissions */}
              <div className="space-y-4">
                {/* Result Audio Player Card */}
                <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Music className="w-4 h-4" />
                      File Bài Nộp Của Bạn:
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Sẵn Sàng Nộp
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs text-slate-300 font-bold truncate">
                      File âm thanh hiện tại:
                    </div>
                    
                    <audio
                      key={generatedAudioUrl}
                      src={generatedAudioUrl}
                      controls
                      className="w-full"
                    />

                    <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                      <div>• Mô hình AI: <span className="text-emerald-400 font-bold">Conversational Neural</span></div>
                      <div>• Ngữ điệu: <span className="text-amber-300">Biểu cảm tự nhiên, không đều đều kiểu Google</span></div>
                    </div>
                  </div>

                  <a
                    href={generatedAudioUrl}
                    download={`Bai_Nop_Audio_${selectedAudioNum}_${selectedSpeaker}.mp3`}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Tải File MP3 Nộp Cho Giảng Viên
                  </a>
                </div>

                {/* Quick Listen Natural Voices Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Nghe thử nhanh các giọng đối thoại tự nhiên:
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Brian (Nam US - Tự nhiên, ấm)', url: '/audio_generated/Audio_1_Spk1_Brian_TuNhien.mp3' },
                      { name: 'Ava (Nữ US - Trẻ trung, tự nhiên)', url: '/audio_generated/Audio_1_Spk1_Ava_NuTuNhien.mp3' },
                      { name: 'Ryan (Nam UK - Chuẩn BBC)', url: '/audio_generated/Audio_1_Spk1_Ryan_GiongAnh.mp3' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] font-bold text-indigo-300 mb-1">{item.name}</div>
                        <audio src={item.url} controls className="w-full max-h-7" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Bấm nghe thử để thấy rõ sự khác biệt: ngữ điệu sống động, không còn âm hưởng máy móc của Google Dịch!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TEXT TO SPEECH (FREE TTS) */}
        {/* ======================================================== */}
        {activeTab === 'tts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <label className="text-xs font-bold text-slate-300 block">Nhập câu tiếng Anh tự do:</label>
                <textarea
                  value={freeTtsText}
                  onChange={(e) => setFreeTtsText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Giọng đọc:</label>
                    <select
                      value={freeTtsVoice}
                      onChange={(e) => setFreeTtsVoice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="en-US-JennyNeural">Jenny (US Nữ - Tự nhiên)</option>
                      <option value="en-US-GuyNeural">Guy (US Nam - Trầm chuẩn)</option>
                      <option value="en-GB-RyanNeural">Ryan (UK Nam - Chuẩn BBC)</option>
                      <option value="en-GB-SoniaNeural">Sonia (UK Nữ - Thanh lịch)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tốc độ ({freeTtsSpeed}x):</label>
                    <input
                      type="range"
                      min="0.75"
                      max="1.25"
                      step="0.05"
                      value={freeTtsSpeed}
                      onChange={(e) => setFreeTtsSpeed(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 mt-2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateFreeTts}
                  disabled={isFreeTtsLoading || !freeTtsText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isFreeTtsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  Sinh Giọng Đọc Ngay
                </button>
              </div>
            </div>

            <div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Kết quả phát âm:</h3>
                {freeTtsAudioUrl ? (
                  <div className="space-y-3">
                    <audio src={freeTtsAudioUrl} controls className="w-full" />
                    <a
                      href={freeTtsAudioUrl}
                      download="TTS_Free_Output.mp3"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải file MP3
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Bấm "Sinh Giọng Đọc Ngay" để nghe thử tại đây.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: STT THU ÂM NHẬN DIỆN */}
        {/* ======================================================== */}
        {activeTab === 'stt' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-base font-bold text-white">Thu âm kiểm tra phát âm tiếng Anh trực tiếp</h2>
              <p className="text-xs text-slate-400">Nói tiếng Anh vào micro, hệ thống sẽ nhận diện và chuyển thành văn bản tức thì.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <button
                onClick={toggleStt}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecordingStt
                    ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-500/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isRecordingStt ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {isRecordingStt ? 'Đang lắng nghe... Nói tiếng Anh ngay bây giờ' : 'Bấm micro để bắt đầu nói'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[90px] text-xs text-slate-200">
              {sttTranscript || <span className="text-slate-600 italic">Văn bản bạn nói sẽ hiển thị tại đây...</span>}
            </div>

            {sttTranscript && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sttTranscript);
                  setSttCopied(true);
                  setTimeout(() => setSttCopied(false), 2000);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mx-auto"
              >
                {sttCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {sttCopied ? 'Đã sao chép!' : 'Sao chép văn bản'}
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SOẠN ĐỀ TIN HỌC (PRESERVED) */}
        {/* ======================================================== */}
        {activeTab === 'quiz' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <BitOneQuestionGenerator
              onSelectQuestionForAssessment={onSelectQuestionForAssessment}
            />
          </div>
        )}
      </div>
    </div>
  );
}
