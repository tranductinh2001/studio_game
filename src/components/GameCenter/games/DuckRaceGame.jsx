import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Sparkles, HelpCircle, 
  CheckCircle, ArrowRight, Camera
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

export default function DuckRaceGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  // States: 'IDLE' | 'COUNTDOWN' | 'RACING' | 'PAUSED' | 'FINISHED'
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
    ducks: [],
    waterGeo: null,
    animFrame: null,
    startTime: 0,
    pausedTime: 0,
    isPaused: false,
    duration: 22000,
    targetWinnerId: null,
    controlMode: 'fair_random',
    isFinished: false
  });

  // Sync settings & secretControl
  useEffect(() => {
    threeRef.current.controlMode = secretControl?.mode || 'fair_random';
    threeRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    threeRef.current.duration = (settings.roundDuration || 22) * 1000 / (settings.gameSpeed || 1.0);
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
  // BUILD PROCEDURAL 3D DUCK MODEL
  // -------------------------------------------------------------
  const buildDuckMesh = (team, laneZ) => {
    const duckGroup = new THREE.Group();

    // 1. Duck Body (Cute Yellow Ellipsoid)
    const bodyGeo = new THREE.SphereGeometry(1.3, 24, 24);
    bodyGeo.scale(1.25, 0.9, 0.95);
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
      metalness: 0.1
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, yellowMat);
    bodyMesh.castShadow = true;
    duckGroup.add(bodyMesh);

    // 2. Duck Head & Neck
    const headGeo = new THREE.SphereGeometry(0.75, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, yellowMat);
    headMesh.position.set(1.0, 1.1, 0);
    headMesh.castShadow = true;
    duckGroup.add(headMesh);

    // 3. Duck Beak / Bill (Bright Orange)
    const billGeo = new THREE.BoxGeometry(0.7, 0.22, 0.55);
    const billMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const billMesh = new THREE.Mesh(billGeo, billMat);
    billMesh.position.set(1.8, 1.05, 0);
    duckGroup.add(billMesh);

    // 4. Cute Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(1.35, 1.35, 0.45);
    duckGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(1.35, 1.35, -0.45);
    duckGroup.add(rightEye);

    // 5. Flapping Wings (Left & Right)
    const wingGeo = new THREE.BoxGeometry(1.2, 0.15, 0.7);
    wingGeo.center();

    const leftWing = new THREE.Mesh(wingGeo, yellowMat);
    leftWing.position.set(0.1, 0.4, 1.05);
    duckGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, yellowMat);
    rightWing.position.set(0.1, 0.4, -1.05);
    duckGroup.add(rightWing);

    // 6. Team-Colored Life Ring / Vest around the Duck
    const vestGeo = new THREE.TorusGeometry(1.1, 0.22, 16, 24);
    const vestMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.color || '#3b82f6'),
      roughness: 0.3,
      metalness: 0.2
    });
    const vestMesh = new THREE.Mesh(vestGeo, vestMat);
    vestMesh.rotation.x = Math.PI / 2;
    vestMesh.position.set(-0.1, -0.1, 0);
    duckGroup.add(vestMesh);

    // 7. Team Number Badge on back
    const badgeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(-0.3, 0.9, 0);
    duckGroup.add(badgeMesh);

    // 8. 3D Floating Name Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 256;
    bannerCanvas.height = 64;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    bCtx.roundRect(4, 4, 248, 56, 12);
    bCtx.fill();
    bCtx.strokeStyle = team.color || '#f59e0b';
    bCtx.lineWidth = 4;
    bCtx.roundRect(4, 4, 248, 56, 12);
    bCtx.stroke();
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 26px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(team.name.toUpperCase(), 128, 33);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerGeo = new THREE.PlaneGeometry(3.2, 0.8);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true, side: THREE.DoubleSide });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 2.6, 0);
    duckGroup.add(bannerMesh);

    // Initial position
    duckGroup.position.set(-42, 0.3, laneZ);

    return {
      group: duckGroup,
      team: team,
      laneZ: laneZ,
      leftWing: leftWing,
      rightWing: rightWing,
      progress: 0,
      currentX: -42,
      speedNoise: Math.random() * 0.35 + 0.85,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS RIVER SCENE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0284c7, 0.008);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(-48, 26, 34);
    threeRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    // Lighting
    setupCinematicLighting(scene, {
      ambientColor: 0x064e3b,
      ambientIntensity: 1.6,
      keyColor: 0xfef08a,
      keyIntensity: 2.8,
      fillColor: 0x38bdf8,
      fillIntensity: 1.4,
      rimColor: 0xf59e0b,
      rimIntensity: 1.6
    });

    // River Water Plane
    const waterGeo = new THREE.PlaneGeometry(150, 80, 60, 40);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.92
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    threeRef.current.waterGeo = waterGeo;

    // Green Riverbanks (Top & Bottom borders)
    const bankGeo = new THREE.BoxGeometry(150, 4, 18);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });

    const northBank = new THREE.Mesh(bankGeo, bankMat);
    northBank.position.set(0, 1.2, -42);
    scene.add(northBank);

    const southBank = new THREE.Mesh(bankGeo, bankMat);
    southBank.position.set(0, 1.2, 42);
    scene.add(southBank);

    // Stylized Pine Trees along riverbanks
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const foliageGeo = new THREE.ConeGeometry(2.0, 4.5, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    for (let x = -60; x <= 60; x += 20) {
      // North tree
      const t1 = new THREE.Group();
      const trunk1 = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk1.position.y = 1.25;
      const fol1 = new THREE.Mesh(foliageGeo, foliageMat);
      fol1.position.y = 4.0;
      t1.add(trunk1, fol1);
      t1.position.set(x + (Math.random() - 0.5) * 5, 2.0, -42);
      scene.add(t1);

      // South tree
      const t2 = new THREE.Group();
      const trunk2 = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk2.position.y = 1.25;
      const fol2 = new THREE.Mesh(foliageGeo, foliageMat);
      fol2.position.y = 4.0;
      t2.add(trunk2, fol2);
      t2.position.set(x + (Math.random() - 0.5) * 5, 2.0, 42);
      scene.add(t2);
    }

    // Wooden Finish Bridge at X = 40
    const bridgeGroup = new THREE.Group();
    const bridgePlankGeo = new THREE.BoxGeometry(3.5, 0.8, 68);
    const bridgePlankMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    const bridgePlank = new THREE.Mesh(bridgePlankGeo, bridgePlankMat);
    bridgePlank.position.set(40, 5.0, 0);
    bridgeGroup.add(bridgePlank);

    // Finish Banner
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 128;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#b45309';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#fef08a';
    bCtx.font = '900 48px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText('🦆 ĐÍCH ĐUA VỊT 🦆', 256, 64);

    const bTex = new THREE.CanvasTexture(bCanvas);
    const bBannerGeo = new THREE.PlaneGeometry(18, 4.5);
    const bBannerMat = new THREE.MeshBasicMaterial({ map: bTex, side: THREE.DoubleSide });
    const bBannerMesh = new THREE.Mesh(bBannerGeo, bBannerMat);
    bBannerMesh.position.set(40, 7.8, 0);
    bBannerMesh.rotation.y = Math.PI / 2;
    bridgeGroup.add(bBannerMesh);

    scene.add(bridgeGroup);

    // Build Ducks according to teams
    const count = teams.length;
    const spacing = Math.min(48 / Math.max(count, 1), 9);
    const startZ = -((count - 1) * spacing) / 2;

    const duckObjects = teams.map((team, idx) => {
      const laneZ = startZ + idx * spacing;
      const dObj = buildDuckMesh(team, laneZ);
      scene.add(dObj.group);
      return dObj;
    });
    threeRef.current.ducks = duckObjects;

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // ANIMATION LOOP
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Ripple waves on water
      if (waterGeo) {
        const vPos = waterGeo.attributes.position;
        for (let i = 0; i < vPos.count; i++) {
          const u = vPos.getX(i);
          const v = vPos.getZ(i);
          const ripple = Math.sin(u * 0.2 + time * 3.0) * Math.cos(v * 0.25 + time * 2.2) * 0.35;
          vPos.setY(i, ripple);
        }
        waterGeo.computeVertexNormals();
        vPos.needsUpdate = true;
      }

      // Animate Ducks
      const { ducks, startTime, duration, targetWinnerId, controlMode, isPaused, isFinished } = threeRef.current;
      const activeState = gameState;

      if ((activeState === 'RACING' || activeState === 'FINISHED') && !isPaused && startTime > 0) {
        const elapsed = performance.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1.0);
        const isNearEnd = progressRatio > 0.8;

        let leadingProgress = 0;
        let leadDuck = null;

        ducks.forEach((d) => {
          let p = progressRatio * d.speedNoise;
          const wobble = Math.sin(time * 3 + d.wobbleOffset) * 0.03;
          p = Math.max(0, p + wobble);

          if (isNearEnd) {
            if (d.team.id === targetWinnerId && controlMode !== 'fair_random') {
              p = Math.max(p, progressRatio + 0.08);
            } else if (d.team.id !== targetWinnerId && controlMode === 'teacher_rigged') {
              p = Math.min(p, 0.94);
            }
          }

          p = Math.min(Math.max(p, 0), 1.0);
          d.progress = p;

          const duckX = -42 + p * 82;
          d.currentX = duckX;
          d.group.position.x = duckX;

          // Cute Waddling & Wing Flapping Animation
          d.group.position.y = 0.3 + Math.sin(time * 6 + d.wobbleOffset) * 0.15;
          d.group.rotation.y = Math.sin(time * 5 + d.wobbleOffset) * 0.08; // Head shake
          d.group.rotation.z = Math.cos(time * 6 + d.wobbleOffset) * 0.06; // Waddling roll

          if (d.leftWing && d.rightWing) {
            const wingFlap = Math.sin(time * 14 + d.wobbleOffset) * 0.35;
            d.leftWing.rotation.z = wingFlap;
            d.rightWing.rotation.z = -wingFlap;
          }

          if (p > leadingProgress) {
            leadingProgress = p;
            leadDuck = d;
          }
        });

        // Dynamic Camera tracking
        if (leadDuck && !isFinished) {
          camera.position.x = leadDuck.group.position.x - 20;
          camera.position.z = leadDuck.group.position.z + 24;
          camera.position.y = 16;
          camera.lookAt(leadDuck.group.position.x + 6, 1.5, leadDuck.group.position.z);
        }

        if (progressRatio >= 1.0 && !isFinished) {
          threeRef.current.isFinished = true;
          handleFinishRace();
        }
      } else {
        // Idle gentle floating
        ducks.forEach((d) => {
          d.group.position.y = 0.3 + Math.sin(time * 2.5 + d.wobbleOffset) * 0.08;
          d.group.rotation.y = Math.sin(time * 1.5 + d.wobbleOffset) * 0.04;
        });

        camera.position.set(-48, 26, 34);
        camera.lookAt(-15, 1, 0);
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

  // Race controls
  const resetRace = () => {
    gameAudio.stopAmbientBGM();
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);

    threeRef.current.startTime = 0;
    threeRef.current.isPaused = false;
    threeRef.current.isFinished = false;

    threeRef.current.ducks.forEach((d) => {
      d.progress = 0;
      d.currentX = -42;
      d.group.position.x = -42;
    });

    if (threeRef.current.camera) {
      threeRef.current.camera.position.set(-48, 26, 34);
      threeRef.current.camera.lookAt(-15, 1, 0);
    }
  };

  const startCountdown = () => {
    if (gameState === 'COUNTDOWN' || gameState === 'RACING') return;
    resetRace();
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
        setGameState('RACING');
        launchRace();
      }
    }, 900);
  };

  const launchRace = () => {
    gameAudio.playWhistle();
    gameAudio.playAmbientBGM('playful');
    threeRef.current.startTime = performance.now();
    threeRef.current.isFinished = false;
  };

  const handleFinishRace = () => {
    gameAudio.stopAmbientBGM();
    gameAudio.playFanfare();
    setGameState('FINISHED');

    const sortedDucks = [...threeRef.current.ducks].sort((a, b) => b.progress - a.progress);
    const winTeam = sortedDucks[0].team;
    setWinner(winTeam);
    setRankings(sortedDucks.map(d => d.team));

    confetti({
      particleCount: 150,
      spread: 95,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-02-duck-race',
        gameName: 'Đua Vịt Vượt Sông',
        winner: winTeam,
        rankings: sortedDucks.map(d => d.team),
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-xl shadow-yellow-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🦆
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
                3D RIVER SPRINT
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                {teams.length} Vịt Đua • Đáng Yêu
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-300">
              ĐUA VỊT VƯỢT SÔNG
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {gameState === 'IDLE' && (
            <button
              onClick={startCountdown}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              XUẤT PHÁT ĐUA
            </button>
          )}

          <button
            onClick={resetRace}
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
            <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 animate-ping">
              {countdown}
            </span>
            <p className="text-xl font-black text-white mt-4 tracking-widest uppercase drop-shadow">
              Dàn vịt vào vị trí bơi...
            </p>
          </div>
        </div>
      )}

      {/* Bottom Duck Standing Badges */}
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
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-yellow-950/30 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🦆
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              VỊT VÀNG SIÊU ĐẲNG VỀ ĐÍCH
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-yellow-300 mt-1">
              Chú vịt đáng yêu đã bơi chèo chân qua cầu gỗ đầu tiên!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-yellow-950/30 border border-yellow-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thành tích</div>
                <div className="text-lg font-black text-yellow-300">Quán Quân 🥇</div>
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
                onClick={resetRace}
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
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-yellow-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Dành Cho {winner?.name}
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
                className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all"
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
