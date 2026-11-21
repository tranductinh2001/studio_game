import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Compass, Trophy, Play, RotateCcw, CheckCircle, 
  HelpCircle, ChevronRight, Key, Sparkles, ShieldCheck, Lock, Unlock
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

const MAZE_GATES = [
  { id: 0, title: "Xuất Phát", desc: "Cửa vào Mê Cung" },
  { id: 1, title: "Chặng 1", desc: "Khái niệm WWW" },
  { id: 2, title: "Chặng 2", desc: "Siêu Liên Kết" },
  { id: 3, title: "Chặng 3", desc: "Website & URL" },
  { id: 4, title: "Chặng 4", desc: "Trình Duyệt Web" },
  { id: 5, title: "ĐÍCH", desc: "Cúp Vô Địch Tri Thức" }
];

export default function KnowledgeMazeGame({
  teams = [],
  students = [],
  secretControl = {},
  settings = {},
  onRecordResult,
  onOpenTeacherPanel
}) {
  const containerRef = useRef(null);

  const [teamSteps, setTeamSteps] = useState(() => teams.map(t => ({ id: t.id, step: 0 })));
  const [winner, setWinner] = useState(null);
  const [activeQuestionTeam, setActiveQuestionTeam] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    teamPawns: [],
    gateDoors: [],
    animFrame: null
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
  // BUILD 3D TEAM PAWN
  // -------------------------------------------------------------
  const buildPawn = (team, laneZ) => {
    const pawnGroup = new THREE.Group();

    // 1. Pawn Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.9, 1.2, 0.6, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.3;
    baseMesh.castShadow = true;
    pawnGroup.add(baseMesh);

    // 2. Team Color Torus Ring
    const ringGeo = new THREE.TorusGeometry(1.0, 0.18, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.color || '#3b82f6'),
      metalness: 0.3,
      roughness: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.35;
    pawnGroup.add(ringMesh);

    // 3. Pawn Body Column
    const colGeo = new THREE.CylinderGeometry(0.55, 0.75, 1.6, 20);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const colMesh = new THREE.Mesh(colGeo, colMat);
    colMesh.position.y = 1.4;
    colMesh.castShadow = true;
    pawnGroup.add(colMesh);

    // 4. Floating Rotating Gem / Crown on top
    const gemGeo = new THREE.OctahedronGeometry(0.7, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.color || '#3b82f6'),
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(team.color || '#3b82f6'),
      emissiveIntensity: 0.4
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.y = 2.8;
    pawnGroup.add(gemMesh);

    // 5. Team Number Tag
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 128;
    tagCanvas.height = 128;
    const tCtx = tagCanvas.getContext('2d');
    tCtx.fillStyle = team.color || '#3b82f6';
    tCtx.beginPath();
    tCtx.arc(64, 64, 56, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.fillStyle = '#ffffff';
    tCtx.font = 'bold 64px sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(String(team.number), 64, 66);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const tagMat = new THREE.MeshBasicMaterial({ map: tagTex, transparent: true });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0, 4.0, 0);
    pawnGroup.add(tagMesh);

    // Position at checkpoint 0 (X = -35)
    pawnGroup.position.set(-35, 0, laneZ);

    return {
      group: pawnGroup,
      team: team,
      laneZ: laneZ,
      gemMesh: gemMesh,
      currentStep: 0,
      targetX: -35,
      isMoving: false
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS ISOMETRIC MAZE SCENE
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
    // Isometric angle (elevated side-3/4 view)
    camera.position.set(-20, 36, 44);
    camera.lookAt(0, 0, 0);
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
      ambientColor: 0x064e3b,
      ambientIntensity: 1.6,
      keyColor: 0xfef08a,
      keyIntensity: 2.8,
      fillColor: 0x10b981,
      fillIntensity: 1.4,
      rimColor: 0x38bdf8,
      rimIntensity: 1.6
    });

    // 1. Stone Maze Floor Grid
    const floorGeo = new THREE.BoxGeometry(90, 0.8, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.4;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. Build 5 Checkpoint Gates along X (-35 to +35)
    // Step positions: 0: -35, 1: -21, 2: -7, 3: +7, 4: +21, 5: +35
    const gatePositions = [-21, -7, 7, 21];
    const gateDoors = [];

    const wallPillarGeo = new THREE.CylinderGeometry(0.6, 0.7, 8, 16);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const beamGeo = new THREE.BoxGeometry(1.2, 1.2, 46);

    gatePositions.forEach((gx, idx) => {
      const gGroup = new THREE.Group();

      const p1 = new THREE.Mesh(wallPillarGeo, wallMat);
      p1.position.set(gx, 4, -22);
      gGroup.add(p1);

      const p2 = new THREE.Mesh(wallPillarGeo, wallMat);
      p2.position.set(gx, 4, 22);
      gGroup.add(p2);

      const beam = new THREE.Mesh(beamGeo, wallMat);
      beam.position.set(gx, 7.5, 0);
      gGroup.add(beam);

      // Gate Neon Arch Light
      const gateLight = new THREE.PointLight(0x10b981, 1.5, 18);
      gateLight.position.set(gx, 6, 0);
      gGroup.add(gateLight);

      scene.add(gGroup);
      gateDoors.push({ group: gGroup, light: gateLight, x: gx });
    });
    threeRef.current.gateDoors = gateDoors;

    // 3. Golden Trophy at Gate 5 (+35)
    const trophyGroup = new THREE.Group();
    const tBaseGeo = new THREE.CylinderGeometry(2.0, 2.4, 2.0, 32);
    const tBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const tBase = new THREE.Mesh(tBaseGeo, tBaseMat);
    tBase.position.set(35, 1.0, 0);
    trophyGroup.add(tBase);

    const cupGeo = new THREE.CylinderGeometry(2.2, 1.0, 3.2, 24);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.4
    });
    const cupMesh = new THREE.Mesh(cupGeo, cupMat);
    cupMesh.position.set(35, 3.6, 0);
    trophyGroup.add(cupMesh);

    scene.add(trophyGroup);

    // 4. Build Team Pawns
    const count = teams.length;
    const spacing = Math.min(38 / Math.max(count, 1), 7);
    const startZ = -((count - 1) * spacing) / 2;

    const pawnObjects = teams.map((team, idx) => {
      const laneZ = startZ + idx * spacing;
      const pawn = buildPawn(team, laneZ);
      scene.add(pawn.group);
      return pawn;
    });
    threeRef.current.teamPawns = pawnObjects;

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

      // Spin pawn gems & trophy
      pawnObjects.forEach((p) => {
        if (p.gemMesh) {
          p.gemMesh.rotation.y = time * 2.5;
          p.gemMesh.rotation.x = Math.sin(time * 3) * 0.2;
        }

        // Smooth movement interpolation
        if (Math.abs(p.group.position.x - p.targetX) > 0.1) {
          p.group.position.x += (p.targetX - p.group.position.x) * 0.12;
          // Hop bounce
          p.group.position.y = Math.sin((p.group.position.x - p.targetX) * 0.5) * 1.2;
        } else {
          p.group.position.x = p.targetX;
          p.group.position.y = 0;
        }
      });

      cupMesh.rotation.y = time * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animFrame) cancelAnimationFrame(threeRef.current.animFrame);
      disposeThreeScene(scene, renderer);
    };
  }, [teams]);

  // -------------------------------------------------------------
  // ADVANCE PAWN STEP
  // -------------------------------------------------------------
  const advanceTeamPawn = (teamId, forceWin = false) => {
    if (winner) return;

    gameAudio.playBoost();

    const pawn = threeRef.current.teamPawns.find(p => p.team.id === teamId);
    if (!pawn) return;

    const nextStep = forceWin ? 5 : Math.min(pawn.currentStep + 1, 5);
    pawn.currentStep = nextStep;

    // Step positions: 0: -35, 1: -21, 2: -7, 3: +7, 4: +21, 5: +35
    const stepCoords = [-35, -21, -7, 7, 21, 35];
    pawn.targetX = stepCoords[nextStep];

    setTeamSteps(prev => prev.map(item => item.id === teamId ? { ...item, step: nextStep } : item));

    // Check victory
    if (nextStep >= 5 && !winner) {
      const winningTeam = teams.find(t => t.id === teamId);
      handleVictory(winningTeam);
    }
  };

  const handleOpenQuestion = (team) => {
    setActiveQuestionTeam(team);
    const randQ = LESSON_6_QUESTIONS[Math.floor(Math.random() * LESSON_6_QUESTIONS.length)];
    setCurrentQuestion(randQ);
    setShowQuestionModal(true);
    gameAudio.playBell();
  };

  const handleAnswerSubmit = (isCorrect) => {
    setShowQuestionModal(false);
    if (isCorrect && activeQuestionTeam) {
      advanceTeamPawn(activeQuestionTeam.id);
    } else {
      gameAudio.playBuzzer();
    }
  };

  const handleVictory = (winTeam) => {
    setWinner(winTeam);
    gameAudio.playFanfare();

    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 }
    });

    if (onRecordResult) {
      onRecordResult({
        gameId: 'game-07-knowledge-maze',
        gameName: 'Mê Cung Tri Thức',
        winner: winTeam,
        timestamp: new Date().toISOString()
      });
    }
  };

  const resetMaze = () => {
    setWinner(null);
    setShowQuestionModal(false);
    threeRef.current.teamPawns.forEach((p) => {
      p.currentStep = 0;
      p.targetX = -35;
      p.group.position.x = -35;
    });
    setTeamSteps(teams.map(t => ({ id: t.id, step: 0 })));
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🧭
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                3D ISOMETRIC LABYRINTH
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                5 Cổng Tri Thức • Chìa Khóa Vạn Năng
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-300">
              MÊ CUNG TRI THỨC
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetMaze}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới Mê Cung
          </button>
        </div>
      </div>

      {/* Team Control Cards at Bottom */}
      <div className="relative z-10 w-full p-4 flex items-center justify-center gap-3 flex-wrap bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        {teams.map((team) => {
          const stepInfo = teamSteps.find(s => s.id === team.id) || { step: 0 };
          return (
            <div
              key={team.id}
              className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex items-center gap-3 shadow-xl"
            >
              <span 
                className="w-7 h-7 rounded-xl text-xs font-black text-white flex items-center justify-center shadow"
                style={{ backgroundColor: team.color }}
              >
                {team.number}
              </span>
              <div>
                <div className="text-xs font-black text-slate-200">{team.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Cổng {stepInfo.step}/5</div>
              </div>

              <button
                onClick={() => handleOpenQuestion(team)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 ml-2"
              >
                <Key className="w-3 h-3" />
                Mở Cổng
              </button>
            </div>
          );
        })}
      </div>

      {/* Victory Celebration Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-900 border-2 border-emerald-400 p-8 shadow-2xl shadow-emerald-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-300 p-1 shadow-xl shadow-emerald-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🏆
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 tracking-wider">
              QUÁN QUÂN THOÁT KHỎI MÊ CUNG
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {winner.name}
            </h3>
            <p className="text-sm font-semibold text-emerald-300 mt-1">
              Đã mở khóa toàn bộ 5 cánh cổng tri thức Bài 6 xuất sắc nhất!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Thành tích</div>
                <div className="text-lg font-black text-emerald-300">Vô Địch 🥇</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400 font-medium">Điểm thi đua</div>
                <div className="text-lg font-black text-yellow-300">+10 Điểm ⭐</div>
              </div>
            </div>

            <button
              onClick={resetMaze}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              Chơi Lượt Tiếp Theo
            </button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  {activeQuestionTeam?.name || 'THỬ THÁCH'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Trả lời đúng để mở cổng tiến bước
                </h4>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
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
                  <button
                    key={i}
                    onClick={() => handleAnswerSubmit(isCorrect)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-emerald-500 bg-slate-800/40 hover:bg-emerald-500/10 flex items-center gap-3 transition-all group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-xs font-black flex items-center justify-center text-slate-300">
                      {optLetter}
                    </span>
                    <span className="text-sm text-slate-200 group-hover:text-white font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
