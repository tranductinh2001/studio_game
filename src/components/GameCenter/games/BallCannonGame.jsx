import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Crosshair, Trophy, Play, RotateCcw, Sparkles, 
  HelpCircle, CheckCircle, Target, Award, Zap
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

export default function BallCannonGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  const isIndividualMode = settings.mode === 'individual';
  const participants = isIndividualMode ? students : teams;

  // States: 'IDLE' | 'FIRING' | 'HIT'
  const [gameState, setGameState] = useState('IDLE');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    cannonGroup: null,
    barrelMesh: null,
    targetRings: [],
    ballMesh: null,
    animFrame: null,
    isFiring: false,
    fireStartTime: 0,
    trajectory: null,
    chosenWinner: null
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
  // BUILD 3D TARGET RING
  // -------------------------------------------------------------
  const buildTargetRing = (participant, posX, posY, posZ) => {
    const ringGroup = new THREE.Group();

    // 1. Outer Torus Ring
    const torusGeo = new THREE.TorusGeometry(1.6, 0.22, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(participant.color || '#38bdf8'),
      metalness: 0.8,
      roughness: 0.2
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.castShadow = true;
    ringGroup.add(torusMesh);

    // 2. Concentric Bullseye Disc
    const discGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 24);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    ringGroup.add(discMesh);

    // 3. Target Label Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = participant.color || '#38bdf8';
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = participant.color || '#38bdf8';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(participant.number || '🎯'), 128, 130);

    const tex = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.08;
    ringGroup.add(labelMesh);

    // 4. Name Tag Banner Below
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const nCtx = nameCanvas.getContext('2d');
    nCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    nCtx.roundRect(4, 4, 248, 56, 12);
    nCtx.fill();
    nCtx.strokeStyle = participant.color || '#38bdf8';
    nCtx.lineWidth = 4;
    nCtx.roundRect(4, 4, 248, 56, 12);
    nCtx.stroke();
    nCtx.fillStyle = '#ffffff';
    nCtx.font = 'bold 26px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText((participant.shortName || participant.name).toUpperCase(), 128, 33);

    const nameTex = new THREE.CanvasTexture(nameCanvas);
    const nameGeo = new THREE.PlaneGeometry(2.8, 0.7);
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, side: THREE.DoubleSide });
    const nameMesh = new THREE.Mesh(nameGeo, nameMat);
    nameMesh.position.set(0, -2.4, 0);
    ringGroup.add(nameMesh);

    ringGroup.position.set(posX, posY, posZ);

    return {
      group: ringGroup,
      participant: participant,
      basePos: new THREE.Vector3(posX, posY, posZ),
      wobbleOffset: Math.random() * Math.PI * 2
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS SHOOTING ARENA
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(-8, 12, 34);
    camera.lookAt(8, 6, 0);
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
      ambientColor: 0x0f172a,
      ambientIntensity: 1.8,
      keyColor: 0x38bdf8,
      keyIntensity: 3.0,
      fillColor: 0x3b82f6,
      fillIntensity: 1.5,
      rimColor: 0xf59e0b,
      rimIntensity: 1.8
    });

    // 1. Stadium Floor Grid
    const floorGeo = new THREE.BoxGeometry(60, 1.0, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. 3D Cannon at Bottom-Left (-18, 1.5, 8)
    const cannonGroup = new THREE.Group();

    // Carriage Base & Wheels
    const carriageGeo = new THREE.BoxGeometry(3.2, 1.2, 2.0);
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const carriage = new THREE.Mesh(carriageGeo, carriageMat);
    carriage.position.y = 0.6;
    cannonGroup.add(carriage);

    const wheelGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.4, 20);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });

    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(-1.0, 0.6, 1.2);
    cannonGroup.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.position.set(1.0, 0.6, 1.2);
    cannonGroup.add(w2);
    const w3 = new THREE.Mesh(wheelGeo, wheelMat);
    w3.position.set(-1.0, 0.6, -1.2);
    cannonGroup.add(w3);
    const w4 = new THREE.Mesh(wheelGeo, wheelMat);
    w4.position.set(1.0, 0.6, -1.2);
    cannonGroup.add(w4);

    // Cannon Barrel (Rotated 45 degrees pointing at +X and +Y)
    const barrelGeo = new THREE.CylinderGeometry(0.65, 0.85, 5.2, 24);
    barrelGeo.rotateZ(-Math.PI / 4); // 45 deg elevation
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15
    });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(1.0, 2.2, 0);
    cannonGroup.add(barrel);
    threeRef.current.barrelMesh = barrel;

    cannonGroup.position.set(-18, 0, 8);
    scene.add(cannonGroup);
    threeRef.current.cannonGroup = cannonGroup;

    // 3. Glowing Energy Cannonball (Initially hidden inside barrel)
    const ballGeo = new THREE.SphereGeometry(0.65, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      metalness: 0.2
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.visible = false;
    scene.add(ballMesh);
    threeRef.current.ballMesh = ballMesh;

    // 4. Build Floating Target Rings in Stadium
    const count = participants.length;
    const targetObjects = [];
    const cols = Math.min(count, 4);
    const rows = Math.ceil(count / cols);

    participants.forEach((p, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const targetX = 6 + col * 6.5;
      const targetY = 4 + (rows - 1 - row) * 5.2;
      const targetZ = -8 + (col % 2) * 2;

      const tObj = buildTargetRing(p, targetX, targetY, targetZ);
      scene.add(tObj.group);
      targetObjects.push(tObj);
    });
    threeRef.current.targetRings = targetObjects;

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

      // Gentle floating animation of target rings
      targetObjects.forEach((t) => {
        t.group.position.y = t.basePos.y + Math.sin(time * 2.5 + t.wobbleOffset) * 0.25;
        t.group.rotation.y = Math.sin(time * 1.5 + t.wobbleOffset) * 0.08;
      });

      // Animate Cannonball along 3D Parabola
      if (threeRef.current.isFiring && threeRef.current.trajectory) {
        const { start, target, apexHeight, duration } = threeRef.current.trajectory;
        const elapsed = performance.now() - threeRef.current.fireStartTime;
        const t = Math.min(elapsed / duration, 1.0);

        // Parabolic arc equation
        const x = start.x + (target.x - start.x) * t;
        const z = start.z + (target.z - start.z) * t;
        const arcY = 4 * apexHeight * t * (1 - t);
        const y = start.y + (target.y - start.y) * t + arcY;

        ballMesh.position.set(x, y, z);
        ballMesh.rotation.x = time * 12;

        if (t >= 1.0) {
          threeRef.current.isFiring = false;
          ballMesh.visible = false;
          handleBallHitTarget();
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
  }, [participants]);

  // -------------------------------------------------------------
  // FIRE BALL CANNON
  // -------------------------------------------------------------
  const fireCannon = () => {
    if (gameState === 'FIRING') return;

    setGameState('FIRING');
    setSelectedWinner(null);
    gameAudio.playPop();

    // 1. Determine Target based on secretControl
    let chosenWinner = null;
    let targetObj = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      targetObj = threeRef.current.targetRings.find(t => t.participant.id === targetId) || threeRef.current.targetRings[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      targetObj = threeRef.current.targetRings.find(t => t.participant.id === targetId) || threeRef.current.targetRings[0];
    } else {
      const randIdx = Math.floor(Math.random() * threeRef.current.targetRings.length);
      targetObj = threeRef.current.targetRings[randIdx];
    }

    chosenWinner = targetObj.participant;
    threeRef.current.chosenWinner = chosenWinner;

    // 2. Setup 3D Ballistic Trajectory
    const startPos = new THREE.Vector3(-15.5, 4.0, 8.0); // Muzzle position
    const targetPos = targetObj.group.position.clone();

    threeRef.current.trajectory = {
      start: startPos,
      target: targetPos,
      apexHeight: 8.5,
      duration: 1400 // ms
    };

    threeRef.current.ballMesh.visible = true;
    threeRef.current.ballMesh.position.copy(startPos);
    threeRef.current.fireStartTime = performance.now();
    threeRef.current.isFiring = true;

    // Cannon recoil animation
    if (threeRef.current.barrelMesh) {
      threeRef.current.barrelMesh.position.x = 0.4;
      setTimeout(() => {
        if (threeRef.current.barrelMesh) threeRef.current.barrelMesh.position.x = 1.0;
      }, 150);
    }
  };

  const handleBallHitTarget = () => {
    setGameState('HIT');
    const winner = threeRef.current.chosenWinner;
    setSelectedWinner(winner);

    gameAudio.playWhistle();
    gameAudio.playFanfare();

    confetti({
      particleCount: 150,
      spread: 95,
      origin: { y: 0.55 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-08-ball-cannon',
        gameName: 'Bắn Bóng Trúng Đích',
        winner: winner,
        timestamp: new Date().toISOString()
      });
    }
  };

  const resetGame = () => {
    setGameState('IDLE');
    setSelectedWinner(null);
    threeRef.current.isFiring = false;
    if (threeRef.current.ballMesh) threeRef.current.ballMesh.visible = false;
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
              🎯
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                3D BALLISTIC ARENA
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                Pháo Thần Công • Quỹ Đạo Parabol 45°
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-100 to-amber-300">
              BẮN BÓNG TRÚNG ĐÍCH
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {gameState === 'IDLE' && (
            <button
              onClick={fireCannon}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-amber-400 hover:from-sky-400 hover:to-amber-300 text-white font-black text-sm shadow-xl shadow-sky-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Target className="w-4 h-4" />
              KHAI HỎA BẮN BÓNG
            </button>
          )}

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Victory Hit Modal */}
      {gameState === 'HIT' && selectedWinner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-sky-950/40 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🎯
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              TRÚNG HỒNG TÂM XUẤT SẮC
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {selectedWinner.name}
            </h3>
            <p className="text-sm font-semibold text-sky-300 mt-1">
              Quả bóng năng lượng đã bay theo quỹ đạo parabol và bắn trúng mục tiêu!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Độ chính xác</div>
                <div className="text-lg font-black text-sky-300">100% Tuyệt Đối</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thưởng thi đua</div>
                <div className="text-lg font-black text-yellow-300">+10 Điểm ⭐</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const randQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
                  setCurrentQuestion(randQ);
                  setShowChallengeModal(true);
                  gameAudio.playBell();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                Thử Thách Bài 6
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Bắn Lượt Khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-sky-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs">
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
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all"
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
