import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  Shuffle, UserCheck, Sparkles, Trophy, RotateCcw,
  HelpCircle, CheckCircle, Users, Star, Award, Filter, ToggleLeft, ToggleRight
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, createHolographicTexture, disposeThreeScene } from '../services/threeHelpers';

export default function LuckyCardShuffleGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  const isIndividualMode = settings.mode === 'individual';
  const allParticipants = isIndividualMode ? students : teams;

  // Filter and anti-duplicate states
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [calledIds, setCalledIds] = useState([]);
  const [preventDuplicate, setPreventDuplicate] = useState(true);

  // Filtered pool
  const activePool = allParticipants.filter(p => {
    if (preventDuplicate && calledIds.includes(p.id)) return false;
    if (selectedTeamFilter !== 'ALL' && isIndividualMode) {
      return p.teamId === selectedTeamFilter;
    }
    return true;
  });

  // States: 'IDLE' | 'SHUFFLING' | 'REVEALED'
  const [gameState, setGameState] = useState('IDLE');
  const [luckyWinner, setLuckyWinner] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    cardMeshes: [],
    animFrame: null,
    isShuffling: false,
    shuffleStartTime: 0,
    targetWinner: null,
    chosenCardIndex: 2
  });

  // Shortcut 1-9
  useEffect(() => {
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          secretControl.targetTeamId = target.id;
          secretControl.mode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, secretControl]);

  // -------------------------------------------------------------
  // BUILD CARD FRONT CANVAS TEXTURE
  // -------------------------------------------------------------
  const createCardFrontTexture = (participant) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Luxurious Dark Card Background
    const grad = ctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Golden Card Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 16;
    ctx.strokeRect(12, 12, 488, 744);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, 460, 716);

    // Top Header Badge
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ TIN HỌC 6 - BÀI 6 ⭐', 256, 75);

    // Large Avatar Disc in center
    ctx.beginPath();
    ctx.arc(256, 280, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Avatar Emoji / Icon
    ctx.font = '130px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(participant?.avatar || participant?.icon || '🎓', 256, 285);

    // Full Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px sans-serif';
    ctx.textBaseline = 'alphabetic';
    const name = (participant?.name || 'HỌC SINH').toUpperCase();
    ctx.fillText(name.length > 15 ? name.substring(0, 14) + '..' : name, 256, 500);

    // Team / Class Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(participant?.code ? `Mã: ${participant.code} • Lớp 6A` : 'THCS ĐẮK TRÔI', 256, 555);

    // Bottom Ribbon
    ctx.fillStyle = '#f59e0b';
    ctx.roundRect(64, 620, 384, 64, 16);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('NGƯỜI MAY MẮN NHẤT', 256, 662);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // -------------------------------------------------------------
  // BUILD PROCEDURAL 3D CARD
  // -------------------------------------------------------------
  const buildCard3D = (frontTex, backTex, slotIdx) => {
    const cardGeo = new THREE.BoxGeometry(3.2, 4.8, 0.08);

    const sideMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.3, metalness: 0.1 });
    const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.3, metalness: 0.3 });

    const materials = [
      sideMat, sideMat, sideMat, sideMat,
      frontMat, // Front (+Z)
      backMat   // Back (-Z)
    ];

    const mesh = new THREE.Mesh(cardGeo, materials);
    mesh.castShadow = true;

    // Arrange 5 cards across table
    const posX = (slotIdx - 2) * 4.2;
    mesh.position.set(posX, 0, 0);
    // Face down initially (rotated 180 on Y so back faces camera)
    mesh.rotation.y = Math.PI;

    return {
      mesh: mesh,
      slotIdx: slotIdx,
      baseX: posX,
      isFlipped: false
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS CASINO STAGE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);
    threeRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    // Lighting
    setupCinematicLighting(scene, {
      ambientColor: 0x1e1b4b,
      ambientIntensity: 1.8,
      keyColor: 0xffffff,
      keyIntensity: 2.8,
      fillColor: 0x38bdf8,
      fillIntensity: 1.5,
      rimColor: 0xf59e0b,
      rimIntensity: 1.8
    });

    // 1. Velvet Table Surface
    const tableGeo = new THREE.PlaneGeometry(35, 20);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.z = -1.5;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // 2. Build 5 3D Cards
    const holographicBack = createHolographicTexture();
    const dummyFront = createCardFrontTexture({ name: 'LUCKY STUDENT', icon: '⭐' });

    const cardObjects = [];
    for (let i = 0; i < 5; i++) {
      const card = buildCard3D(dummyFront, holographicBack, i);
      scene.add(card.mesh);
      cardObjects.push(card);
    }
    threeRef.current.cardMeshes = cardObjects;

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Card shuffle animation
      if (threeRef.current.isShuffling) {
        const elapsed = performance.now() - threeRef.current.shuffleStartTime;
        const totalDuration = 3200; // ms
        const t = Math.min(elapsed / totalDuration, 1.0);

        cardObjects.forEach((c, idx) => {
          if (t < 0.4) {
            // Phase 1: Gather into central stack
            const p1 = t / 0.4;
            c.mesh.position.x = c.baseX * (1 - p1);
            c.mesh.position.y = Math.sin(p1 * Math.PI) * 1.5;
            c.mesh.position.z = idx * 0.15;
            c.mesh.rotation.z = Math.sin(time * 12 + idx) * 0.2;
          } else if (t < 0.8) {
            // Phase 2: Riffle orbit card swap
            const p2 = (t - 0.4) / 0.4;
            const orbitAngle = p2 * Math.PI * 4 + (idx * Math.PI * 2) / 5;
            c.mesh.position.x = Math.cos(orbitAngle) * 3.5;
            c.mesh.position.y = Math.sin(orbitAngle) * 2.2;
            c.mesh.position.z = Math.sin(time * 10 + idx) * 1.0;
            c.mesh.rotation.z = orbitAngle;
          } else {
            // Phase 3: Fan out back to positions
            const p3 = (t - 0.8) / 0.2;
            c.mesh.position.x = c.baseX * p3;
            c.mesh.position.y = 0;
            c.mesh.position.z = 0;
            c.mesh.rotation.z = 0;
          }
        });

        if (t >= 1.0) {
          threeRef.current.isShuffling = false;
          handleRevealWinner();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animFrame) cancelAnimationFrame(threeRef.current.animFrame);
      disposeThreeScene(scene, renderer);
    };
  }, []);

  // -------------------------------------------------------------
  // SHUFFLE & FLIP REVEAL
  // -------------------------------------------------------------
  const startShuffle = () => {
    if (gameState === 'SHUFFLING' || activePool.length === 0) return;

    setGameState('SHUFFLING');
    setLuckyWinner(null);
    setShowChallengeModal(false);

    // Determine lucky winner based on secretControl
    let chosenWinner = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      chosenWinner = activePool.find(p => p.id === targetId) || activePool[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      chosenWinner = activePool.find(p => p.id === targetId) || activePool[0];
    } else {
      const randIdx = Math.floor(Math.random() * activePool.length);
      chosenWinner = activePool[randIdx];
    }

    threeRef.current.targetWinner = chosenWinner;

    // Reset card rotations to face down
    threeRef.current.cardMeshes.forEach((c) => {
      c.mesh.rotation.y = Math.PI;
      c.mesh.position.z = 0;
    });

    threeRef.current.shuffleStartTime = performance.now();
    threeRef.current.isShuffling = true;

    // Rapid shuffle ticking sound
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      gameAudio.playPop();
      if (tickCount > 12) clearInterval(tickInterval);
    }, 220);
  };

  const handleRevealWinner = () => {
    const winner = threeRef.current.targetWinner;
    const centerCard = threeRef.current.cardMeshes[2]; // Middle card

    // Update texture of the center card with real winner data
    const realFrontTex = createCardFrontTexture(winner);
    centerCard.mesh.material[4].map = realFrontTex;
    centerCard.mesh.material[4].needsUpdate = true;

    // 3D Flip Card Animation
    const startTime = performance.now();
    const duration = 1000;

    const flipAnim = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);

      // Rotate from Math.PI (180 back) to 0 (0 front)
      centerCard.mesh.rotation.y = Math.PI * (1 - t);
      // Elevate towards camera
      centerCard.mesh.position.z = Math.sin(t * Math.PI) * 2.5 + t * 1.5;
      const scale = 1.0 + t * 0.35;
      centerCard.mesh.scale.set(scale, scale, scale);

      if (t < 1.0) {
        requestAnimationFrame(flipAnim);
      } else {
        setLuckyWinner(winner);
        setGameState('REVEALED');
        gameAudio.playFanfare();

        confetti({
          particleCount: 150,
          spread: 95,
          origin: { y: 0.6 }
        });

        if (preventDuplicate && winner) {
          setCalledIds(prev => [...prev, winner.id]);
        }

        if (onRecordResult) {
          onRecordResult({
            gameId: 'game-06-lucky-shuffle',
            gameName: 'Ai Là Người May Mắn?',
            winner: winner,
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    requestAnimationFrame(flipAnim);
  };

  const resetAllCards = () => {
    setGameState('IDLE');
    setLuckyWinner(null);
    threeRef.current.cardMeshes.forEach((c) => {
      c.mesh.rotation.y = Math.PI;
      c.mesh.position.set(c.baseX, 0, 0);
      c.mesh.scale.set(1, 1, 1);
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-xl shadow-sky-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🎴
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                3D CARD REVEAL ARENA
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                {activePool.length} Đối tượng sẵn sàng
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-indigo-100 to-amber-300">
              AI LÀ NGƯỜI MAY MẮN?
            </h1>
          </div>
        </div>

        {/* Filter Controls & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Prevent duplicate toggle */}
          <button
            onClick={() => setPreventDuplicate(!preventDuplicate)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              preventDuplicate ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Bật/Tắt chống gọi trùng học sinh"
          >
            {preventDuplicate ? <ToggleRight className="w-4 h-4 text-sky-400" /> : <ToggleLeft className="w-4 h-4" />}
            <span>Chống gọi trùng</span>
          </button>

          {/* Reset called list */}
          {calledIds.length > 0 && (
            <button
              onClick={() => setCalledIds([])}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Reset ({calledIds.length})
            </button>
          )}

          {/* Shuffle Button */}
          {gameState !== 'SHUFFLING' && (
            <button
              onClick={startShuffle}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 hover:from-sky-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              XÁO BÀI & CHỌN
            </button>
          )}

          <button
            onClick={resetAllCards}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Winner Reveal Modal */}
      {gameState === 'REVEALED' && luckyWinner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40 mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-5xl">
                {luckyWinner.avatar || luckyWinner.icon || '🎓'}
              </div>
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              🎉 THẺ BÀI MAY MẮN NHẤT 🎉
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {luckyWinner.name}
            </h3>

            {luckyWinner.code && (
              <p className="text-sm font-semibold text-sky-300 mt-1">
                Mã số: {luckyWinner.code} • Lớp 6A THCS Đắk Trôi
              </p>
            )}

            <div className="my-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Nhiệm vụ</div>
                <div className="text-lg font-black text-yellow-300">Lên Bảng 🌟</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Khảo sát</div>
                <div className="text-lg font-black text-emerald-400">Trả Lời Câu Hỏi</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const randomQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                  setCurrentQuestion(randomQ);
                  setShowChallengeModal(true);
                  gameAudio.playBell();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                Thử Thách Bài 6
              </button>
              <button
                onClick={startShuffle}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <Shuffle className="w-4 h-4" />
                Xáo Lượt Tiếp Theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-indigo-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Dành Cho {luckyWinner?.name}
                </h4>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-base font-bold text-slate-100 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((opt, i) => {
                const optLetter = String.fromCharCode(65 + i);
                const isCorrect = i === currentQuestion.correctAnswer;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-xs font-black flex items-center justify-center">
                      {optLetter}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
              >
                Đã Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
