import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Play, RotateCcw, Trophy, Sparkles, HelpCircle, 
  CheckCircle, Users, User, ArrowRight, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

export default function LuckyWheelGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  const isIndividualMode = settings.mode === 'individual';
  const rawParticipants = isIndividualMode ? students : teams;

  // Elimination filter state
  const [eliminatedIds, setEliminatedIds] = useState([]);
  const [allowElimination, setAllowElimination] = useState(false);

  // Active participants after elimination filter
  const activeParticipants = rawParticipants.filter(p => !eliminatedIds.includes(p.id));

  // States: 'IDLE' | 'SPINNING' | 'STOPPED'
  const [gameState, setGameState] = useState('IDLE');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    wheelGroup: null,
    needleMesh: null,
    animFrame: null,
    isSpinning: false,
    startAngle: 0,
    targetAngle: 0,
    spinStartTime: 0,
    spinDuration: 6000,
    targetWinner: null,
    lastTickIndex: -1
  });

  // Keyboard shortcut 1-9
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
  // BUILD 3D WHEEL TEXTURE ON CANVAS
  // -------------------------------------------------------------
  const generateWheelTexture = (participantsList) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const center = 512;
    const radius = 500;
    const count = Math.max(participantsList.length, 1);
    const sliceAngle = (Math.PI * 2) / count;

    ctx.clearRect(0, 0, 1024, 1024);

    participantsList.forEach((item, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      // Draw slice wedge
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || (i % 2 === 0 ? '#3b82f6' : '#0284c7');
      ctx.fill();

      // Divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      if (count <= 12) {
        ctx.font = 'bold 36px sans-serif';
        const label = item.number ? `ĐỘI ${item.number} • ${item.shortName || item.name}` : item.name;
        ctx.fillText(label.length > 14 ? label.substring(0, 13) + '..' : label, radius - 45, 0);
      } else {
        ctx.font = 'bold 24px sans-serif';
        const label = item.name;
        ctx.fillText(label.length > 10 ? label.substring(0, 9) + '..' : label, radius - 40, 0);
      }
      ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS 3D SCENE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 26);
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
      ambientColor: 0x1e293b,
      ambientIntensity: 1.8,
      keyColor: 0xffffff,
      keyIntensity: 2.8,
      fillColor: 0x38bdf8,
      fillIntensity: 1.4,
      rimColor: 0xf59e0b,
      rimIntensity: 2.0
    });

    // 1. Wheel Group
    const wheelGroup = new THREE.Group();

    // 3D Wheel Body Cylinder
    const wheelRadius = 8.5;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.65, 64);
    wheelGeo.rotateX(Math.PI / 2);

    const wheelTex = generateWheelTexture(activeParticipants);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 }), // Side
      new THREE.MeshStandardMaterial({ map: wheelTex, roughness: 0.4, metalness: 0.1 }),   // Front face
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8 })                  // Back
    ];
    const wheelMesh = new THREE.Mesh(wheelGeo, materials);
    wheelMesh.castShadow = true;
    wheelGroup.add(wheelMesh);

    // 3D Metallic Chrome Outer Ring
    const rimGeo = new THREE.TorusGeometry(wheelRadius + 0.1, 0.4, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rimMesh);

    // 3D Metallic Pegs along outer edge
    const pegGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12);
    pegGeo.rotateX(Math.PI / 2);
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });

    const pCount = Math.max(activeParticipants.length, 1);
    const stepAngle = (Math.PI * 2) / pCount;
    for (let i = 0; i < pCount; i++) {
      const angle = i * stepAngle;
      const peg = new THREE.Mesh(pegGeo, pegMat);
      peg.position.set(Math.cos(angle) * wheelRadius, Math.sin(angle) * wheelRadius, 0.35);
      wheelGroup.add(peg);
    }

    // 3D Center Hub Dome (Golden with star)
    const hubGeo = new THREE.SphereGeometry(1.6, 32, 16);
    hubGeo.scale(1, 1, 0.5);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.position.z = 0.35;
    wheelGroup.add(hubMesh);

    scene.add(wheelGroup);
    threeRef.current.wheelGroup = wheelGroup;

    // 2. Physical Needle / Flapper at 12 o'clock (pointing down)
    const needleGroup = new THREE.Group();
    const needleShape = new THREE.Shape();
    needleShape.moveTo(-0.4, 0);
    needleShape.lineTo(0.4, 0);
    needleShape.lineTo(0, -1.8);
    needleShape.closePath();

    const needleExtrude = new THREE.ExtrudeGeometry(needleShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05 });
    needleExtrude.center();
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.4,
      roughness: 0.2
    });
    const needleMesh = new THREE.Mesh(needleExtrude, needleMat);
    needleGroup.add(needleMesh);
    needleGroup.position.set(0, wheelRadius + 0.8, 0.7);

    scene.add(needleGroup);
    threeRef.current.needleMesh = needleGroup;

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);

      if (threeRef.current.isSpinning) {
        const elapsed = performance.now() - threeRef.current.spinStartTime;
        const duration = threeRef.current.spinDuration;
        const t = Math.min(elapsed / duration, 1.0);

        // Quintic Ease-Out curve for authentic mechanical deceleration
        const easeOut = 1 - Math.pow(1 - t, 4);
        const currentRot = threeRef.current.startAngle + (threeRef.current.targetAngle - threeRef.current.startAngle) * easeOut;
        wheelGroup.rotation.z = currentRot;

        // Needle deflection when passing pegs
        const normAngle = ((currentRot % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
        const pegIndex = Math.floor((normAngle / (Math.PI * 2)) * pCount);
        if (pegIndex !== threeRef.current.lastTickIndex) {
          threeRef.current.lastTickIndex = pegIndex;
          gameAudio.playTick();
          needleGroup.rotation.z = 0.35 * (1 - t * 0.7);
        } else {
          needleGroup.rotation.z *= 0.85; // Spring back
        }

        if (t >= 1.0) {
          threeRef.current.isSpinning = false;
          handleSpinFinished();
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
  }, [activeParticipants]);

  // -------------------------------------------------------------
  // SPIN LOGIC WITH GUARANTEED MATHEMATICAL ALIGNMENT
  // -------------------------------------------------------------
  const startSpin = () => {
    if (gameState === 'SPINNING' || activeParticipants.length === 0) return;

    setGameState('SPINNING');
    setSelectedWinner(null);
    setShowChallengeModal(false);

    // 1. Determine Target Winner based on Secret Control
    let chosenWinner = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      chosenWinner = activeParticipants.find(p => p.id === targetId) || activeParticipants[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      chosenWinner = activeParticipants.find(p => p.id === targetId) || activeParticipants[0];
    } else {
      const randIdx = Math.floor(Math.random() * activeParticipants.length);
      chosenWinner = activeParticipants[randIdx];
    }

    threeRef.current.targetWinner = chosenWinner;

    // 2. Compute exact rotation angle so top needle (12 o'clock / +Y) points to chosen slice
    const winnerIdx = activeParticipants.findIndex(p => p.id === chosenWinner.id);
    const count = activeParticipants.length;
    const sliceAngle = (Math.PI * 2) / count;

    // Center of winner's slice on the wheel (in radians relative to initial orientation)
    // Slice i is drawn from i * sliceAngle to (i+1) * sliceAngle (offset by -PI/2)
    // When wheel rotates by +Z, it rotates counterclockwise.
    // Top needle is at +PI/2.
    const sliceCenterAngle = winnerIdx * sliceAngle + sliceAngle / 2;
    // Target rotation: multiple full 360 spins (5 to 7 turns) + offset to align sliceCenter to 12 o'clock
    const fullSpins = 6 * Math.PI * 2;
    const currentRot = threeRef.current.wheelGroup ? threeRef.current.wheelGroup.rotation.z : 0;
    const finalRot = currentRot + fullSpins + (Math.PI * 2 - (sliceCenterAngle % (Math.PI * 2)));

    threeRef.current.startAngle = currentRot;
    threeRef.current.targetAngle = finalRot;
    threeRef.current.spinStartTime = performance.now();
    threeRef.current.spinDuration = 6000;
    threeRef.current.isSpinning = true;
  };

  const handleSpinFinished = () => {
    setGameState('STOPPED');
    const win = threeRef.current.targetWinner;
    setSelectedWinner(win);
    gameAudio.playFanfare();

    confetti({
      particleCount: 150,
      spread: 95,
      origin: { y: 0.6 }
    });

    if (allowElimination && win) {
      setEliminatedIds(prev => [...prev, win.id]);
    }

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-03-lucky-wheel',
        gameName: 'Vòng Quay May Mắn',
        winner: win,
        timestamp: new Date().toISOString()
      });
    }
  };

  const resetWheel = () => {
    setGameState('IDLE');
    setSelectedWinner(null);
    setShowChallengeModal(false);
  };

  const handleResetEliminated = () => {
    setEliminatedIds([]);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🎡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40">
                3D WHEEL OF FORTUNE
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                {activeParticipants.length} Ô Quay • Tích Tắc Vật Lý
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-100 to-amber-300">
              VÒNG QUAY MAY MẮN
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Elimination Toggle */}
          <button
            onClick={() => setAllowElimination(!allowElimination)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              allowElimination 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                : 'bg-slate-900/80 border-slate-700/80 text-slate-400'
            }`}
            title="Tự động loại bỏ người đã trúng thưởng để không gọi trùng"
          >
            {allowElimination ? <ToggleRight className="w-4 h-4 text-rose-400" /> : <ToggleLeft className="w-4 h-4" />}
            <span>Loại bỏ người đã chọn</span>
          </button>

          {eliminatedIds.length > 0 && (
            <button
              onClick={handleResetEliminated}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Phục hồi ({eliminatedIds.length})
            </button>
          )}

          {/* Spin Button */}
          {gameState !== 'SPINNING' && (
            <button
              onClick={startSpin}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 hover:from-purple-500 hover:to-amber-300 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              QUAY NGAY
            </button>
          )}

          <button
            onClick={resetWheel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Winner Reveal Modal */}
      {gameState === 'STOPPED' && selectedWinner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🎡
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              KIM QUAY DỪNG LẠI CHUẨN XÁC TẠI
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {selectedWinner.name}
            </h3>

            {selectedWinner.shortName && (
              <p className="text-sm font-semibold text-purple-300 mt-1">
                {selectedWinner.shortName}
              </p>
            )}

            <div className="my-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">May mắn</div>
                <div className="text-lg font-black text-yellow-300">Xuất Sắc 🌟</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Điểm thi đua</div>
                <div className="text-lg font-black text-emerald-400">+10 Điểm ⭐</div>
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
                onClick={startSpin}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Quay Tiếp Lượt Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-purple-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Dành Cho {selectedWinner?.name}
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
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isCorrect 
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
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
