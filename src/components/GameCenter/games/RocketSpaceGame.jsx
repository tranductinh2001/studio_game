import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Rocket, Play, Pause, RotateCcw, Trophy, Zap, Sparkles, 
  HelpCircle, CheckCircle, Flame, ShieldAlert, Award
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

export default function RocketSpaceGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  // States: 'IDLE' | 'COUNTDOWN' | 'FLYING' | 'PAUSED' | 'FINISHED'
  const [gameState, setGameState] = useState('IDLE');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    rockets: [],
    starfield: null,
    earthMesh: null,
    stationMesh: null,
    animFrame: null,
    startTime: 0,
    pausedTime: 0,
    isPaused: false,
    duration: 24000,
    targetWinnerId: null,
    controlMode: 'fair_random',
    isFinished: false
  });

  // Sync settings & secretControl
  useEffect(() => {
    threeRef.current.controlMode = secretControl?.mode || 'fair_random';
    threeRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    threeRef.current.duration = (settings.roundDuration || 24) * 1000 / (settings.gameSpeed || 1.0);
  }, [secretControl, settings, teams]);

  // Keyboard shortcut 1-9 to silently pick winner on the fly
  useEffect(() => {
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        const target = teams[num - 1];
        if (target) {
          threeRef.current.targetWinnerId = target.id;
          threeRef.current.controlMode = 'teacher_rigged';
          gameAudio.playTick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams]);

  // -------------------------------------------------------------
  // BUILD PROCEDURAL 3D ROCKET MESH
  // -------------------------------------------------------------
  const buildRocketMesh = (team, laneY) => {
    const rocketGroup = new THREE.Group();

    // 1. Rocket Body Cylinder (Metallic Titanium)
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.8, 3.8, 20);
    bodyGeo.rotateZ(-Math.PI / 2); // Point towards +X
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.2
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    rocketGroup.add(bodyMesh);

    // 2. Aerodynamic Nosecone (Team Color)
    const noseGeo = new THREE.ConeGeometry(0.7, 1.6, 20);
    noseGeo.rotateZ(-Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.color || '#3b82f6'),
      metalness: 0.5,
      roughness: 0.2
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.x = 2.7;
    rocketGroup.add(noseMesh);

    // 3. Rocket Engine Nozzle (Exhaust bell at rear -X)
    const bellGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.8, 16);
    bellGeo.rotateZ(-Math.PI / 2);
    const bellMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.x = -2.2;
    rocketGroup.add(bellMesh);

    // 4. Stabilizer Tail Fins (4 Fins)
    const finGeo = new THREE.BoxGeometry(1.2, 1.8, 0.12);
    const finMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(team.color || '#3b82f6'), roughness: 0.3 });

    const fin1 = new THREE.Mesh(finGeo, finMat);
    fin1.position.set(-1.4, 0, 0);
    rocketGroup.add(fin1);

    const fin2 = new THREE.Mesh(finGeo, finMat);
    fin2.position.set(-1.4, 0, 0);
    fin2.rotation.x = Math.PI / 2;
    rocketGroup.add(fin2);

    // 5. Cabin Window Porthole
    const windowGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16);
    windowGeo.rotateX(Math.PI / 2);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0.6, 0.4, 0.62);
    rocketGroup.add(windowMesh);

    // 6. Thruster Flame Cone
    const flameGeo = new THREE.ConeGeometry(0.55, 2.8, 16);
    flameGeo.rotateZ(Math.PI / 2); // Points behind (-X)
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(-3.8, 0, 0);
    rocketGroup.add(flameMesh);

    // 7. Team Name Plate
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 256;
    tagCanvas.height = 64;
    const tCtx = tagCanvas.getContext('2d');
    tCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    tCtx.roundRect(4, 4, 248, 56, 12);
    tCtx.fill();
    tCtx.strokeStyle = team.color || '#a855f7';
    tCtx.lineWidth = 4;
    tCtx.roundRect(4, 4, 248, 56, 12);
    tCtx.stroke();
    tCtx.fillStyle = '#ffffff';
    tCtx.font = 'bold 26px sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(`[${team.number}] ${team.name.toUpperCase()}`, 128, 33);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagGeo = new THREE.PlaneGeometry(3.6, 0.9);
    const tagMat = new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, side: THREE.DoubleSide });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0, 1.8, 0);
    rocketGroup.add(tagMesh);

    rocketGroup.position.set(-45, laneY, 0);
    rocketGroup.scale.set(0.9, 0.9, 0.9);

    return {
      group: rocketGroup,
      team: team,
      laneY: laneY,
      flameMesh: flameMesh,
      progress: 0,
      currentX: -45,
      speedNoise: Math.random() * 0.35 + 0.85,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS SPACE SCENE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-52, 14, 38);
    threeRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    // Cosmic Lighting
    setupCinematicLighting(scene, {
      ambientColor: 0x1e1b4b,
      ambientIntensity: 1.5,
      keyColor: 0x38bdf8,
      keyIntensity: 2.8,
      fillColor: 0xa855f7,
      fillIntensity: 1.5,
      rimColor: 0xf59e0b,
      rimIntensity: 1.8
    });

    // 1. Particle Starfield Background (1500 stars)
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 250;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.85 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
    threeRef.current.starfield = starfield;

    // 2. Planet Earth at Start (-45, 0, -18)
    const earthGeo = new THREE.SphereGeometry(12, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.2
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(-65, -8, -18);
    scene.add(earthMesh);
    threeRef.current.earthMesh = earthMesh;

    // 3. Planet Mars / Cosmic Destination at Finish (+50, 0, -12)
    const marsGeo = new THREE.SphereGeometry(10, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.7,
      metalness: 0.1,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.25
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.position.set(65, 5, -12);
    scene.add(marsMesh);
    threeRef.current.stationMesh = marsMesh;

    // 4. Finish Space Gate Portal at X = 45
    const ringGeo = new THREE.TorusGeometry(16, 0.6, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.4
    });
    const gateRing = new THREE.Mesh(ringGeo, ringMat);
    gateRing.position.set(45, 0, 0);
    gateRing.rotation.y = Math.PI / 2;
    scene.add(gateRing);

    // Build Rockets according to teams
    const count = teams.length;
    const spacing = Math.min(28 / Math.max(count, 1), 5.5);
    const startY = ((count - 1) * spacing) / 2;

    const rocketObjects = teams.map((team, idx) => {
      const laneY = startY - idx * spacing;
      const rObj = buildRocketMesh(team, laneY);
      scene.add(rObj.group);
      return rObj;
    });
    threeRef.current.rockets = rocketObjects;

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotate planets
      if (earthMesh) earthMesh.rotation.y = time * 0.05;
      if (marsMesh) marsMesh.rotation.y = time * 0.08;
      if (gateRing) gateRing.rotation.z = time * 0.2;

      // Animate Rockets
      const { rockets, startTime, duration, targetWinnerId, controlMode, isPaused, isFinished } = threeRef.current;
      const activeState = gameState;

      if ((activeState === 'FLYING' || activeState === 'FINISHED') && !isPaused && startTime > 0) {
        const elapsed = performance.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1.0);
        const isNearEnd = progressRatio > 0.8;

        let leadingProgress = 0;
        let leadRocket = null;

        rockets.forEach((r) => {
          let p = progressRatio * r.speedNoise;
          const wobble = Math.sin(time * 3 + r.wobbleOffset) * 0.03;
          p = Math.max(0, p + wobble);

          if (isNearEnd) {
            if (r.team.id === targetWinnerId && controlMode !== 'fair_random') {
              p = Math.max(p, progressRatio + 0.08);
            } else if (r.team.id !== targetWinnerId && controlMode === 'teacher_rigged') {
              p = Math.min(p, 0.94);
            }
          }

          p = Math.min(Math.max(p, 0), 1.0);
          r.progress = p;

          const rX = -45 + p * 90;
          r.currentX = rX;
          r.group.position.x = rX;

          // Gentle flight turbulence & thruster flicker
          r.group.position.y = r.laneY + Math.sin(time * 4 + r.wobbleOffset) * 0.25;
          r.group.rotation.x = Math.sin(time * 3 + r.wobbleOffset) * 0.08;

          if (r.flameMesh) {
            const pulse = 1.0 + Math.sin(time * 24 + r.wobbleOffset) * 0.4;
            r.flameMesh.scale.set(pulse, pulse, pulse);
          }

          if (p > leadingProgress) {
            leadingProgress = p;
            leadRocket = r;
          }
        });

        // Dynamic Camera Tracking
        if (leadRocket && !isFinished) {
          camera.position.x = leadRocket.group.position.x - 22;
          camera.position.y = leadRocket.group.position.y + 6;
          camera.position.z = 24;
          camera.lookAt(leadRocket.group.position.x + 8, leadRocket.group.position.y, 0);
        }

        if (progressRatio >= 1.0 && !isFinished) {
          threeRef.current.isFinished = true;
          handleFinishFlight();
        }
      } else {
        // Idle hover
        rockets.forEach((r) => {
          r.group.position.y = r.laneY + Math.sin(time * 2 + r.wobbleOffset) * 0.15;
          if (r.flameMesh) r.flameMesh.scale.set(0.2, 0.2, 0.2);
        });

        camera.position.set(-52, 14, 38);
        camera.lookAt(-18, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animFrame) cancelAnimationFrame(threeRef.current.animFrame);
      disposeThreeScene(scene, renderer);
    };
  }, [teams]);

  // Controls
  const resetFlight = () => {
    gameAudio.stopAmbientBGM();
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);

    threeRef.current.startTime = 0;
    threeRef.current.isPaused = false;
    threeRef.current.isFinished = false;

    threeRef.current.rockets.forEach((r) => {
      r.progress = 0;
      r.currentX = -45;
      r.group.position.x = -45;
    });

    if (threeRef.current.camera) {
      threeRef.current.camera.position.set(-52, 14, 38);
      threeRef.current.camera.lookAt(-18, 0, 0);
    }
  };

  const startCountdown = () => {
    if (gameState === 'COUNTDOWN' || gameState === 'FLYING') return;
    resetFlight();
    setGameState('COUNTDOWN');
    setCountdown(3);
    gameAudio.playTick();

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        gameAudio.playTick();
      } else {
        clearInterval(interval);
        setGameState('FLYING');
        launchFlight();
      }
    }, 900);
  };

  const launchFlight = () => {
    gameAudio.playBoost();
    gameAudio.playAmbientBGM('cosmic');
    threeRef.current.startTime = performance.now();
    threeRef.current.isFinished = false;
  };

  const handleFinishFlight = () => {
    gameAudio.stopAmbientBGM();
    gameAudio.playFanfare();
    setGameState('FINISHED');

    const sorted = [...threeRef.current.rockets].sort((a, b) => b.progress - a.progress);
    const winTeam = sorted[0].team;
    setWinner(winTeam);
    setRankings(sorted.map(r => r.team));

    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-05-rocket-space',
        gameName: 'Tên Lửa Chinh Phục Vũ Trụ',
        winner: winTeam,
        rankings: sorted.map(r => r.team),
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-xl shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40">
                3D COSMIC SPRINT
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                {teams.length} Phi Thuyền Vũ Trụ • Tốc Độ Ánh Sáng
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-100 to-cyan-300">
              TÊN LỬA CHINH PHỤC VŨ TRỤ
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {gameState === 'IDLE' && (
            <button
              onClick={startCountdown}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              PHÓNG PHI THUYỀN
            </button>
          )}

          <button
            onClick={resetFlight}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Countdown Modal */}
      {gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="text-center">
            <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 animate-ping">
              {countdown}
            </span>
            <p className="text-xl font-black text-white mt-4 tracking-widest uppercase drop-shadow">
              Kích hoạt động cơ phản lực...
            </p>
          </div>
        </div>
      )}

      {/* Bottom Standing Badges */}
      <div className="relative z-10 w-full p-4 flex items-center justify-center gap-3 flex-wrap bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        {teams.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center gap-2 shadow-lg"
          >
            <span 
              className="w-6 h-6 rounded-lg text-xs font-black text-white flex items-center justify-center shadow"
              style={{ backgroundColor: t.color }}
            >
              {t.number}
            </span>
            <span className="text-xs font-bold text-slate-200">{t.name}</span>
          </div>
        ))}
      </div>

      {/* Victory Celebration Modal */}
      {gameState === 'FINISHED' && winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🚀
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              CHIẾN HẠM VÔ ĐỊCH NGÂN HÀ
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-purple-300 mt-1">
              Đã vượt qua cổng không gian và đáp xuống căn cứ đầu tiên!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thành tích</div>
                <div className="text-lg font-black text-yellow-300">Vô Địch 🥇</div>
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
                onClick={resetFlight}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Đua Lượt Mới
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
                  Thử Thách Mạng Toàn Cầu Cho {winner?.name}
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
