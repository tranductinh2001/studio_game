import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, Trophy, Award, Zap, Flag, 
  Volume2, VolumeX, Sparkles, HelpCircle, ArrowRight, CheckCircle, Eye, Camera
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { createTeamCanvasTexture, setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

export default function BoatRaceGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  // Game state: 'IDLE' | 'COUNTDOWN' | 'RACING' | 'PAUSED' | 'FINISHED'
  const [gameState, setGameState] = useState('IDLE');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);
  const [cameraMode, setCameraMode] = useState('CINEMATIC'); // 'CINEMATIC' | 'TV_BROADCAST' | 'CHASE'

  // Internal 3D References
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    boats: [],
    waterMesh: null,
    waterGeo: null,
    particles: [],
    finishArch: null,
    animFrame: null,
    startTime: 0,
    pausedTime: 0,
    isPaused: false,
    duration: 25000,
    targetWinnerId: null,
    controlMode: 'fair_random',
    isFinished: false
  });

  // Track progress of boats for UI display
  const [livePositions, setLivePositions] = useState([]);

  // Sync settings and secret controls
  useEffect(() => {
    threeRef.current.controlMode = secretControl?.mode || 'fair_random';
    threeRef.current.targetWinnerId = secretControl?.targetTeamId || teams[0]?.id;
    threeRef.current.duration = (settings.roundDuration || 25) * 1000 / (settings.gameSpeed || 1.0);
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
  // BUILD PROCEDURAL 3D BOAT MODEL
  // -------------------------------------------------------------
  const buildBoatMesh = (team, laneZ) => {
    const boatGroup = new THREE.Group();

    // 1. Sleek 3D Hull (Curved bottom, sharp bow, flat stern)
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-3.5, 0.6);
    hullShape.lineTo(3.5, 0.8);
    hullShape.lineTo(4.8, 1.4); // Sharp bow
    hullShape.lineTo(3.5, -0.6);
    hullShape.lineTo(-3.5, -0.6);
    hullShape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.2,
      bevelSegments: 3
    };

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeo.center();

    // Team paint material
    const hullMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.color || '#2563eb'),
      roughness: 0.3,
      metalness: 0.2
    });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    hullMesh.rotation.x = Math.PI / 2;
    hullMesh.castShadow = true;
    boatGroup.add(hullMesh);

    // 2. Teak Wood Deck Top
    const deckGeo = new THREE.BoxGeometry(7.2, 0.2, 1.6);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = 0.55;
    boatGroup.add(deckMesh);

    // 3. Cabin / Cockpit
    const cabinGeo = new THREE.BoxGeometry(2.4, 0.8, 1.2);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.5
    });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(-0.8, 1.0, 0);
    boatGroup.add(cabinMesh);

    // 4. Tall Main Mast
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.2, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    mastMesh.position.set(0.6, 3.1, 0);
    boatGroup.add(mastMesh);

    // 5. Billowing 3D Sail with Team Canvas Texture
    const sailTexture = createTeamCanvasTexture(team, { subtitle: `THUYỀN SỐ ${team.number}` });
    const sailGeo = new THREE.PlaneGeometry(3.6, 4.2, 8, 8);
    // Add billow curvature to sail vertices
    const pos = sailGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const curve = Math.sin((u + 1.8) / 3.6 * Math.PI) * 0.45;
      pos.setZ(i, curve);
    }
    sailGeo.computeVertexNormals();

    const sailMat = new THREE.MeshStandardMaterial({
      map: sailTexture,
      side: THREE.DoubleSide,
      roughness: 0.5,
      metalness: 0.1
    });
    const sailMesh = new THREE.Mesh(sailGeo, sailMat);
    sailMesh.position.set(2.4, 3.2, 0.1);
    sailMesh.rotation.y = -Math.PI / 18;
    boatGroup.add(sailMesh);

    // 6. Floating 3D Name Banner over the boat
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 256;
    bannerCanvas.height = 64;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    bCtx.roundRect(4, 4, 248, 56, 12);
    bCtx.fill();
    bCtx.strokeStyle = team.color || '#38bdf8';
    bCtx.lineWidth = 4;
    bCtx.roundRect(4, 4, 248, 56, 12);
    bCtx.stroke();
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 26px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(team.name.toUpperCase(), 128, 33);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerGeo = new THREE.PlaneGeometry(3.6, 0.9);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true, side: THREE.DoubleSide });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 6.4, 0);
    boatGroup.add(bannerMesh);

    // Initial position on water
    boatGroup.position.set(-45, 0.4, laneZ);
    boatGroup.scale.set(0.85, 0.85, 0.85);

    return {
      group: boatGroup,
      team: team,
      laneZ: laneZ,
      progress: 0, // 0.0 to 1.0
      currentX: -45,
      speedNoise: Math.random() * 0.35 + 0.85,
      wobbleOffset: Math.random() * Math.PI * 2,
      sailMesh: sailMesh
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS SCENE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x0284c7, 0.009);
    threeRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(-52, 28, 38);
    threeRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    // 2. Cinematic Lighting
    setupCinematicLighting(scene, {
      ambientColor: 0x075985,
      ambientIntensity: 1.5,
      keyColor: 0xffedd5,
      keyIntensity: 3.0,
      fillColor: 0x38bdf8,
      fillIntensity: 1.4,
      rimColor: 0xf59e0b,
      rimIntensity: 1.8
    });

    // 3. Dynamic Ocean Water Mesh
    const waterGeo = new THREE.PlaneGeometry(160, 110, 80, 55);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    threeRef.current.waterMesh = waterMesh;
    threeRef.current.waterGeo = waterGeo;

    // 4. Start Line Buoys & Flags at X = -45
    const buoyGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    for (let z = -35; z <= 35; z += 14) {
      const buoy = new THREE.Mesh(buoyGeo, buoyMat);
      buoy.position.set(-45, 0.3, z);
      scene.add(buoy);
    }

    // 5. Grand Finish Line Arch at X = +45
    const archGroup = new THREE.Group();
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.0, 18, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 });

    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(45, 9, -38);
    archGroup.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, pillarMat);
    p2.position.set(45, 9, 38);
    archGroup.add(p2);

    const crossbarGeo = new THREE.BoxGeometry(2.0, 2.5, 76);
    const crossbarMesh = new THREE.Mesh(crossbarGeo, pillarMat);
    crossbarMesh.position.set(45, 17, 0);
    archGroup.add(crossbarMesh);

    // Finish Banner Text
    const finishCanvas = document.createElement('canvas');
    finishCanvas.width = 512;
    finishCanvas.height = 128;
    const fCtx = finishCanvas.getContext('2d');
    fCtx.fillStyle = '#0f172a';
    fCtx.fillRect(0, 0, 512, 128);
    fCtx.strokeStyle = '#f59e0b';
    fCtx.lineWidth = 8;
    fCtx.strokeRect(4, 4, 504, 120);
    fCtx.fillStyle = '#fef08a';
    fCtx.font = '900 52px sans-serif';
    fCtx.textAlign = 'center';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('🏁 VẠCH ĐÍCH - FINISH 🏁', 256, 64);

    const fTex = new THREE.CanvasTexture(finishCanvas);
    const fBannerGeo = new THREE.PlaneGeometry(24, 6);
    const fBannerMat = new THREE.MeshBasicMaterial({ map: fTex, side: THREE.DoubleSide });
    const fBannerMesh = new THREE.Mesh(fBannerGeo, fBannerMat);
    fBannerMesh.position.set(45, 13.5, 0);
    fBannerMesh.rotation.y = Math.PI / 2;
    archGroup.add(fBannerMesh);

    scene.add(archGroup);
    threeRef.current.finishArch = archGroup;

    // 6. Build Boats according to teams
    const boatCount = teams.length;
    const laneSpacing = Math.min(60 / Math.max(boatCount, 1), 10);
    const startZ = -((boatCount - 1) * laneSpacing) / 2;

    const boatObjects = teams.map((team, idx) => {
      const laneZ = startZ + idx * laneSpacing;
      const bObj = buildBoatMesh(team, laneZ);
      scene.add(bObj.group);
      return bObj;
    });
    threeRef.current.boats = boatObjects;

    // Window resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // RENDER & ANIMATION LOOP
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Dynamic Gerstner-like Ocean Wave Motion
      if (waterGeo) {
        const vPos = waterGeo.attributes.position;
        for (let i = 0; i < vPos.count; i++) {
          const u = vPos.getX(i);
          const v = vPos.getZ(i);
          const waveHeight = Math.sin(u * 0.12 + time * 2.8) * Math.cos(v * 0.18 + time * 2.0) * 0.75 +
                             Math.sin((u + v) * 0.08 + time * 1.5) * 0.45;
          vPos.setY(i, waveHeight);
        }
        waterGeo.computeVertexNormals();
        vPos.needsUpdate = true;
      }

      // Animate Boats
      const { boats, startTime, duration, targetWinnerId, controlMode, isPaused, isFinished } = threeRef.current;
      const activeState = gameState;

      if ((activeState === 'RACING' || activeState === 'FINISHED') && !isPaused && startTime > 0) {
        const elapsed = performance.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1.0);
        const isNearEnd = progressRatio > 0.78;

        let leadingProgress = 0;
        let leadBoat = null;

        boats.forEach((b) => {
          // Calculate natural progress curve
          let p = progressRatio * b.speedNoise;
          const wobble = Math.sin(time * 3 + b.wobbleOffset) * 0.035;
          p = Math.max(0, p + wobble);

          // Rigging physics near finish
          if (isNearEnd) {
            if (b.team.id === targetWinnerId && controlMode !== 'fair_random') {
              p = Math.max(p, progressRatio + 0.08); // Rigged winner shoots ahead
            } else if (b.team.id !== targetWinnerId && controlMode === 'teacher_rigged') {
              p = Math.min(p, 0.94); // Hold competitors back from winning
            }
          }

          p = Math.min(Math.max(p, 0), 1.0);
          b.progress = p;

          // Compute 3D coordinate along X (-45 to +45)
          const boatX = -45 + p * 90;
          b.currentX = boatX;

          // Water level at boat location
          const waveY = Math.sin(boatX * 0.12 + time * 2.8) * Math.cos(b.laneZ * 0.18 + time * 2.0) * 0.75;
          b.group.position.x = boatX;
          b.group.position.y = 0.4 + waveY;

          // Pitch and roll according to waves
          b.group.rotation.z = Math.sin(time * 4 + b.wobbleOffset) * 0.08; // pitch
          b.group.rotation.x = Math.cos(time * 3 + b.wobbleOffset) * 0.06; // roll

          // Sail billow flutter
          if (b.sailMesh) {
            b.sailMesh.rotation.y = -Math.PI / 18 + Math.sin(time * 6 + b.wobbleOffset) * 0.04;
          }

          if (p > leadingProgress) {
            leadingProgress = p;
            leadBoat = b;
          }
        });

        // Dynamic Camera Tracking
        if (leadBoat && !isFinished) {
          if (cameraMode === 'CINEMATIC') {
            camera.position.x = leadBoat.group.position.x - 24;
            camera.position.z = leadBoat.group.position.z + 28;
            camera.position.y = 18;
            camera.lookAt(leadBoat.group.position.x + 8, 2, leadBoat.group.position.z);
          } else if (cameraMode === 'TV_BROADCAST') {
            camera.position.set(0, 32, 45);
            camera.lookAt(leadBoat.group.position.x, 2, 0);
          } else if (cameraMode === 'CHASE') {
            camera.position.set(leadBoat.group.position.x - 16, 6, leadBoat.group.position.z);
            camera.lookAt(leadBoat.group.position.x + 20, 3, leadBoat.group.position.z);
          }
        }

        // Check for finish
        if (progressRatio >= 1.0 && !isFinished) {
          threeRef.current.isFinished = true;
          handleFinishRace();
        }
      } else {
        // Idle gentle bobbing on water
        boats.forEach((b) => {
          const waveY = Math.sin(-45 * 0.12 + time * 2.8) * Math.cos(b.laneZ * 0.18 + time * 2.0) * 0.75;
          b.group.position.y = 0.4 + waveY;
          b.group.rotation.z = Math.sin(time * 2 + b.wobbleOffset) * 0.04;
        });

        if (cameraMode === 'CINEMATIC') {
          camera.position.set(-52, 28, 38);
          camera.lookAt(-20, 2, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animFrame) cancelAnimationFrame(threeRef.current.animFrame);
      disposeThreeScene(scene, renderer);
    };
  }, [teams]);

  // -------------------------------------------------------------
  // RACE CONTROLS: START, PAUSE, RESET
  // -------------------------------------------------------------
  const resetRace = () => {
    gameAudio.stopAmbientBGM();
    setGameState('IDLE');
    setWinner(null);
    setRankings([]);
    setShowChallengeModal(false);

    threeRef.current.startTime = 0;
    threeRef.current.isPaused = false;
    threeRef.current.isFinished = false;

    threeRef.current.boats.forEach((b) => {
      b.progress = 0;
      b.currentX = -45;
      b.group.position.x = -45;
    });

    if (threeRef.current.camera) {
      threeRef.current.camera.position.set(-52, 28, 38);
      threeRef.current.camera.lookAt(-20, 2, 0);
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
    gameAudio.playHorn();
    gameAudio.playAmbientBGM('ocean');
    threeRef.current.startTime = performance.now();
    threeRef.current.isFinished = false;
  };

  const togglePause = () => {
    if (gameState === 'RACING') {
      threeRef.current.isPaused = true;
      threeRef.current.pausedTime = performance.now();
      setGameState('PAUSED');
      gameAudio.playTick();
    } else if (gameState === 'PAUSED') {
      const pauseDuration = performance.now() - threeRef.current.pausedTime;
      threeRef.current.startTime += pauseDuration;
      threeRef.current.isPaused = false;
      setGameState('RACING');
      gameAudio.playTick();
    }
  };

  const handleFinishRace = () => {
    gameAudio.stopAmbientBGM();
    gameAudio.playFanfare();
    setGameState('FINISHED');

    const sortedBoats = [...threeRef.current.boats].sort((a, b) => b.progress - a.progress);
    const winTeam = sortedBoats[0].team;
    setWinner(winTeam);
    setRankings(sortedBoats.map(b => b.team));

    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-01-boat-race',
        gameName: 'Đua Thuyền Vượt Sóng',
        winner: winTeam,
        rankings: sortedBoats.map(b => b.team),
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD Overlay (Clean 16:9 Glass Header) */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              ⛵
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                3D OCEAN ARENA
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                {teams.length} Đội Đua • Tin Học 6
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-300">
              ĐUA THUYỀN VƯỢT SÓNG
            </h1>
          </div>
        </div>

        {/* Action Controls & Camera Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Camera View Switcher */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
            <button
              onClick={() => setCameraMode('CINEMATIC')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${cameraMode === 'CINEMATIC' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              title="Góc nhìn điện ảnh bám theo thuyền"
            >
              Phối Cảnh
            </button>
            <button
              onClick={() => setCameraMode('TV_BROADCAST')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${cameraMode === 'TV_BROADCAST' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              title="Góc nhìn truyền hình tổng thể toàn đường đua"
            >
              Truyền Hình
            </button>
            <button
              onClick={() => setCameraMode('CHASE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${cameraMode === 'CHASE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              title="Góc nhìn đuôi thuyền"
            >
              Đuôi Thuyền
            </button>
          </div>

          {/* Start Button */}
          {gameState === 'IDLE' && (
            <button
              onClick={startCountdown}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              BẮT ĐẦU ĐUA
            </button>
          )}

          {/* Pause / Resume */}
          {(gameState === 'RACING' || gameState === 'PAUSED') && (
            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-lg transition-all"
            >
              {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{gameState === 'PAUSED' ? 'Tiếp Tục' : 'Tạm Dừng'}</span>
            </button>
          )}

          {/* Reset Race */}
          <button
            onClick={resetRace}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
            title="Đặt lại đường đua về vạch xuất phát"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Countdown 3D Modal */}
      {gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="text-center">
            <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 animate-ping">
              {countdown}
            </span>
            <p className="text-xl font-black text-white mt-4 tracking-widest uppercase drop-shadow">
              Các thuyền sẵn sàng lướt sóng...
            </p>
          </div>
        </div>
      )}

      {/* Bottom Live Team Standing Pills (Overlay at bottom) */}
      <div className="relative z-10 w-full p-4 flex items-center justify-center gap-3 flex-wrap bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        {teams.map((t, idx) => (
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
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🏆
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              QUÁN QUÂN VƯỢT SÓNG ĐẠI DƯƠNG
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-cyan-300 mt-1">
              Chiến thuyền đã bứt phá ngoạn mục và cán đích đầu tiên!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-around">
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
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-cyan-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Kiến Thức Mạng Toàn Cầu
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
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all"
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
