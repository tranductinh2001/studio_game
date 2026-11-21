import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Gift, Sparkles, Trophy, RotateCcw, HelpCircle, 
  CheckCircle, ArrowRight, Star, Award, Zap
} from 'lucide-react';
import { gameAudio } from '../services/gameAudioSynth';
import { LESSON_6_QUESTIONS } from '../../../data/lesson6Questions';
import { setupCinematicLighting, disposeThreeScene } from '../services/threeHelpers';

const REWARD_SURPRISES = [
  { text: "+10 Điểm vinh quang cho đội!", badge: "🎁 Điểm Thưởng", icon: "⭐" },
  { text: "Nhận tràng pháo tay giòn giã từ cả lớp!", badge: "👏 Cổ Vũ", icon: "🎉" },
  { text: "Đặc quyền chọn câu hỏi tiếp theo!", badge: "👑 Quyền Ưu Tiên", icon: "👑" },
  { text: "Cơ hội nhân đôi điểm số nếu trả lời đúng!", badge: "⚡ Nhân Đôi Điểm", icon: "🚀" },
  { text: "Huy hiệu Ngôi Sao Tin Học 6!", badge: "🌟 Danh Hiệu Vàng", icon: "🏅" },
  { text: "Bảo bối miễn trừ 1 lần trả lời sai!", badge: "🛡️ Khiên Bảo Vệ", icon: "🛡️" }
];

export default function MysteryBoxesGame({
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

  const [openedBoxIds, setOpenedBoxIds] = useState([]);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [activeReward, setActiveReward] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(LESSON_6_QUESTIONS[0]);

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    boxObjects: [],
    animFrame: null,
    openingBoxId: null,
    openingStartTime: 0
  });

  // Shortcut 1-9 to pick winner
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
  // BUILD PROCEDURAL 3D GIFT BOX
  // -------------------------------------------------------------
  const buildGiftBox = (id, colorHex, posX, posZ) => {
    const group = new THREE.Group();

    // 1. Box Base (Satin textured Cube)
    const baseGeo = new THREE.BoxGeometry(2.4, 2.0, 2.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 1.0;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Golden Cross Ribbon on Base
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8
    });
    const r1Geo = new THREE.BoxGeometry(2.44, 2.02, 0.45);
    const r1Mesh = new THREE.Mesh(r1Geo, ribbonMat);
    r1Mesh.position.y = 1.0;
    group.add(r1Mesh);

    const r2Geo = new THREE.BoxGeometry(0.45, 2.02, 2.44);
    const r2Mesh = new THREE.Mesh(r2Geo, ribbonMat);
    r2Mesh.position.y = 1.0;
    group.add(r2Mesh);

    // 2. Separate Animated Lid Group
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 2.0, 0); // Pivot at top of box

    const lidGeo = new THREE.BoxGeometry(2.6, 0.45, 2.6);
    const lidMesh = new THREE.Mesh(lidGeo, baseMat);
    lidMesh.position.y = 0.22;
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Golden Bow on top of Lid
    const bowGeo = new THREE.TorusGeometry(0.55, 0.15, 12, 24);
    const bow1 = new THREE.Mesh(bowGeo, ribbonMat);
    bow1.position.set(0, 0.65, 0);
    bow1.rotation.x = Math.PI / 4;
    lidGroup.add(bow1);

    const bow2 = new THREE.Mesh(bowGeo, ribbonMat);
    bow2.position.set(0, 0.65, 0);
    bow2.rotation.x = -Math.PI / 4;
    lidGroup.add(bow2);

    group.add(lidGroup);

    // 3. Interior Glowing Light
    const glowLight = new THREE.PointLight(0xfef08a, 0, 8);
    glowLight.position.set(0, 1.2, 0);
    group.add(glowLight);

    // 4. Emerging 3D Trophy / Star inside the box
    const starGeo = new THREE.OctahedronGeometry(0.8, 1);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.set(0, 1.0, 0);
    starMesh.scale.set(0.01, 0.01, 0.01); // Initially hidden inside
    group.add(starMesh);

    // 5. 3D Floating Number Plate
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 128;
    tagCanvas.height = 128;
    const tCtx = tagCanvas.getContext('2d');
    tCtx.fillStyle = '#0f172a';
    tCtx.beginPath();
    tCtx.arc(64, 64, 58, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.strokeStyle = '#f59e0b';
    tCtx.lineWidth = 8;
    tCtx.beginPath();
    tCtx.arc(64, 64, 58, 0, Math.PI * 2);
    tCtx.stroke();
    tCtx.fillStyle = '#fef08a';
    tCtx.font = 'bold 64px sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(String(id), 64, 66);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const tagMat = new THREE.MeshBasicMaterial({ map: tagTex, transparent: true });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0, 1.0, 1.28);
    group.add(tagMesh);

    group.position.set(posX, 0, posZ);

    return {
      id: id,
      group: group,
      baseMesh: baseMesh,
      lidGroup: lidGroup,
      glowLight: glowLight,
      starMesh: starMesh,
      isOpened: false,
      reward: REWARD_SURPRISES[(id - 1) % REWARD_SURPRISES.length]
    };
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS PODIUM SCENE
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
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 1.5, 0);
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
      keyColor: 0xfef08a,
      keyIntensity: 3.2,
      fillColor: 0xa855f7,
      fillIntensity: 1.5,
      rimColor: 0x38bdf8,
      rimIntensity: 1.8
    });

    // 1. Luxurious Velvet Stage Podium
    const podiumGeo = new THREE.CylinderGeometry(15, 16, 1.5, 48);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.6,
      metalness: 0.3
    });
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    podiumMesh.position.y = -0.75;
    podiumMesh.receiveShadow = true;
    scene.add(podiumMesh);

    // Golden Rim on Stage
    const pRimGeo = new THREE.TorusGeometry(15.1, 0.25, 16, 48);
    const pRimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const pRimMesh = new THREE.Mesh(pRimGeo, pRimMat);
    pRimMesh.rotation.x = Math.PI / 2;
    pRimMesh.position.y = 0;
    scene.add(pRimMesh);

    // 2. Build 6 to 8 Gift Boxes on Stage
    const boxColors = [
      '#dc2626', // Red
      '#2563eb', // Blue
      '#16a34a', // Green
      '#9333ea', // Purple
      '#ea580c', // Orange
      '#0891b2', // Cyan
      '#db2777', // Pink
      '#ca8a04'  // Amber
    ];

    const count = 6;
    const boxRadius = 8.5;
    const boxes = [];

    for (let i = 0; i < count; i++) {
      // Semi-circle arrangement facing camera
      const angle = (Math.PI / (count - 1)) * i;
      const x = -Math.cos(angle) * boxRadius;
      const z = -Math.sin(angle) * 3.5 + 2.0;
      const box = buildGiftBox(i + 1, boxColors[i], x, z);
      box.group.rotation.y = angle - Math.PI / 2;
      scene.add(box.group);
      boxes.push(box);
    }
    threeRef.current.boxObjects = boxes;

    // Raycaster Click Handler on 3D Boxes
    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      threeRef.current.raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = threeRef.current.raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find which box was clicked
        let clickedBox = null;
        for (const hit of intersects) {
          clickedBox = boxes.find(b => b.group === hit.object.parent || b.group === hit.object.parent?.parent);
          if (clickedBox) break;
        }

        if (clickedBox && !clickedBox.isOpened) {
          triggerOpenBox(clickedBox);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop with opening animation
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.animFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate opening box
      if (threeRef.current.openingBoxId) {
        const targetBox = boxes.find(b => b.id === threeRef.current.openingBoxId);
        if (targetBox) {
          const elapsed = performance.now() - threeRef.current.openingStartTime;
          const t = Math.min(elapsed / 1200, 1.0);

          // Lid flies up and tilts back
          targetBox.lidGroup.position.y = 2.0 + t * 4.0;
          targetBox.lidGroup.position.z = -t * 2.5;
          targetBox.lidGroup.rotation.x = -t * Math.PI * 0.7;

          // Interior glow flares
          targetBox.glowLight.intensity = t * 6.0;

          // Star rises and rotates
          targetBox.starMesh.position.y = 1.0 + t * 3.5;
          const scale = Math.min(t * 1.6, 1.4);
          targetBox.starMesh.scale.set(scale, scale, scale);
          targetBox.starMesh.rotation.y = time * 3.0;

          if (t >= 1.0) {
            threeRef.current.openingBoxId = null;
          }
        }
      }

      // Gentle floating animation for opened stars
      boxes.forEach((b) => {
        if (b.isOpened) {
          b.starMesh.rotation.y = time * 2.0;
          b.starMesh.position.y = 4.5 + Math.sin(time * 3 + b.id) * 0.2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (threeRef.current.animFrame) cancelAnimationFrame(threeRef.current.animFrame);
      disposeThreeScene(scene, renderer);
    };
  }, []);

  // -------------------------------------------------------------
  // OPEN BOX LOGIC & REVEAL WINNER
  // -------------------------------------------------------------
  const triggerOpenBox = (box) => {
    if (box.isOpened) return;

    box.isOpened = true;
    threeRef.current.openingBoxId = box.id;
    threeRef.current.openingStartTime = performance.now();
    setOpenedBoxIds(prev => [...prev, box.id]);
    setActiveReward(box.reward);

    gameAudio.playPop();

    // Determine target winner based on secretControl
    let chosen = null;
    const mode = secretControl?.mode || 'fair_random';
    const targetId = isIndividualMode ? secretControl?.targetStudentId : secretControl?.targetTeamId;

    if (mode === 'teacher_rigged' && targetId) {
      chosen = participants.find(p => p.id === targetId) || participants[0];
    } else if (mode === 'weighted_random' && targetId && Math.random() < 0.8) {
      chosen = participants.find(p => p.id === targetId) || participants[0];
    } else {
      const randIdx = Math.floor(Math.random() * participants.length);
      chosen = participants[randIdx];
    }

    setTimeout(() => {
      setSelectedWinner(chosen);
      gameAudio.playFanfare();

      confetti({
        particleCount: 140,
        spread: 95,
        origin: { y: 0.6 }
      });

      if (onRecordResult) {
        onRecordResult({
          gameId: 'game-04-mystery-box',
          gameName: 'Hộp Quà Bí Ẩn',
          winner: chosen,
          reward: box.reward.text,
          timestamp: new Date().toISOString()
        });
      }
    }, 600);
  };

  const resetAllBoxes = () => {
    setOpenedBoxIds([]);
    setSelectedWinner(null);
    setActiveReward(null);
    setShowChallengeModal(false);

    threeRef.current.boxObjects.forEach((b) => {
      b.isOpened = false;
      b.lidGroup.position.set(0, 2.0, 0);
      b.lidGroup.rotation.set(0, 0, 0);
      b.glowLight.intensity = 0;
      b.starMesh.position.set(0, 1.0, 0);
      b.starMesh.scale.set(0.01, 0.01, 0.01);
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top HUD */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 p-0.5 shadow-xl shadow-rose-500/30">
            <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center text-2xl">
              🎁
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                3D MYSTERY PODIUM
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                Chạm trực tiếp vào hộp 3D để mở quà
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-amber-300">
              HỘP QUÀ BÍ ẨN
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetAllBoxes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
            title="Đóng toàn bộ hộp và làm mới sân khấu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm Mới Hộp Quà
          </button>
        </div>
      </div>

      {/* Helper Prompt at Bottom */}
      {!selectedWinner && (
        <div className="relative z-10 w-full p-4 flex items-center justify-center pointer-events-none">
          <div className="px-5 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-center text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Nhấp chuột trực tiếp vào một <b>Hộp Quà 3D</b> trên sân khấu để khám phá bí ẩn!</span>
          </div>
        </div>
      )}

      {/* Winner Reveal Modal */}
      {selectedWinner && activeReward && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-rose-950/30 to-slate-900 border-2 border-yellow-400 p-8 shadow-2xl shadow-yellow-500/20 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-xl shadow-yellow-500/40">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
                🎁
              </div>
            </div>

            <span className="inline-block mt-4 px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 tracking-wider">
              {isIndividualMode ? 'HỌC SINH MAY MẮN' : 'NHÓM MAY MẮN'}
            </span>

            <h3 className="text-3xl font-black text-white mt-2">
              {selectedWinner.name}
            </h3>

            {/* Surprise Gift Text */}
            <div className="my-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center gap-3">
              <div className="text-3xl">{activeReward.icon}</div>
              <div className="text-left">
                <div className="text-xs uppercase font-bold text-rose-400">{activeReward.badge}</div>
                <div className="text-base font-bold text-slate-100">{activeReward.text}</div>
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
                onClick={() => setSelectedWinner(null)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-95"
              >
                Mở Hộp Khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Question Modal */}
      {showChallengeModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-rose-500/50 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs">
                  {currentQuestion.id || 'CÂU HỎI'}
                </span>
                <h4 className="text-base font-bold text-white">
                  Thử Thách Kiến Thức Dành Cho {selectedWinner?.name}
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
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
