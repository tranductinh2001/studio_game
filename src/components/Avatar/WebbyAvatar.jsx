import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WebbyAvatar({
  emotion = 'IDLE',
  mouthValue = 0,
  isListening = false,
  isSpeaking = false,
  size = 'large'
}) {
  const mountRef = useRef(null);
  const avatarRigRef = useRef(null);
  const [currentEmotionLabel, setCurrentEmotionLabel] = useState('Đang sẵn sàng');

  // Map emotion to Vietnamese description badge
  useEffect(() => {
    const labels = {
      IDLE: 'Đang sẵn sàng',
      GREETING: 'Đang chào các bạn',
      LISTENING: 'Đang lắng nghe học sinh...',
      THINKING: 'Đang suy nghĩ...',
      SPEAKING: 'Đang trả lời',
      HAPPY: 'Rất vui và khen ngợi!',
      ENCOURAGING: 'Đang động viên bạn',
      GOODBYE: 'Tạm biệt & Dẫn vào bài học'
    };
    setCurrentEmotionLabel(labels[emotion] || labels.IDLE);
  }, [emotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f2fe, 3.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4facfe, 1.8);
    fillLight.position.set(-3, 1, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00d2ff, 2.5);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // 3. AVATAR MAIN GROUP
    const avatar = new THREE.Group();
    avatar.position.y = -0.2;
    scene.add(avatar);

    // MATERIALS
    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf0f6fc,
      roughness: 0.25,
      metalness: 0.1,
    });

    const navyAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.4,
      metalness: 0.6,
    });

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
    });

    // A. HEAD GROUP
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.95;
    avatar.add(headGroup);

    // Head outer shell (smooth rounded helmet)
    const headGeo = new THREE.SphereGeometry(0.85, 48, 48);
    headGeo.scale(1.15, 1.0, 1.05);
    const headMesh = new THREE.Mesh(headGeo, whiteChassisMat);
    headGroup.add(headMesh);

    // OLED Face Visor (curved dark screen for eyes/mouth)
    const visorGeo = new THREE.SphereGeometry(0.86, 36, 36);
    visorGeo.scale(1.08, 0.92, 0.98);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x050c18,
      roughness: 0.1,
      metalness: 0.85,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0, 0.12);
    headGroup.add(visorMesh);

    // B. ANIMATED FACE (CANVAS TEXTURE ON VISOR)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 256;
    const faceCtx = faceCanvas.getContext('2d');
    const faceTexture = new THREE.CanvasTexture(faceCanvas);

    const facePlaneGeo = new THREE.PlaneGeometry(1.4, 0.7);
    const facePlaneMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false,
    });
    const facePlane = new THREE.Mesh(facePlaneGeo, facePlaneMat);
    facePlane.position.set(0, 0.05, 0.98);
    headGroup.add(facePlane);

    // C. ANTENNAS & WI-FI RINGS (Ambassador of the Web)
    const antennaStemGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.45, 16);
    const antennaStem = new THREE.Mesh(antennaStemGeo, navyAccentMat);
    antennaStem.position.set(0, 0.95, 0);
    headGroup.add(antennaStem);

    const antennaBallGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const antennaBall = new THREE.Mesh(antennaBallGeo, cyanGlowMat);
    antennaBall.position.set(0, 1.18, 0);
    headGroup.add(antennaBall);

    // Pulsing Wi-Fi Hologram rings on antenna
    const wifiRingGeo = new THREE.TorusGeometry(0.25, 0.02, 16, 32);
    const wifiRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.7,
    });
    const wifiRing = new THREE.Mesh(wifiRingGeo, wifiRingMat);
    wifiRing.rotation.x = Math.PI / 2;
    wifiRing.position.set(0, 1.25, 0);
    headGroup.add(wifiRing);

    // Cute Cyber Headphones / Ear pods
    const earGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24);
    earGeo.rotateZ(Math.PI / 2);
    const leftEar = new THREE.Mesh(earGeo, navyAccentMat);
    leftEar.position.set(-1.0, 0, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, navyAccentMat);
    rightEar.position.set(1.0, 0, 0);
    headGroup.add(rightEar);

    const earGlowGeo = new THREE.RingGeometry(0.1, 0.18, 24);
    earGlowGeo.rotateY(Math.PI / 2);
    const leftEarGlow = new THREE.Mesh(earGlowGeo, cyanGlowMat);
    leftEarGlow.position.set(-1.1, 0, 0);
    headGroup.add(leftEarGlow);

    const rightEarGlow = new THREE.Mesh(earGlowGeo, cyanGlowMat);
    rightEarGlow.position.set(1.1, 0, 0);
    headGroup.add(rightEarGlow);

    // D. TORSO (Futuristic floating body)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = -0.15;
    avatar.add(torsoGroup);

    const chestGeo = new THREE.ConeGeometry(0.65, 0.95, 32);
    chestGeo.rotateX(Math.PI);
    const chestMesh = new THREE.Mesh(chestGeo, whiteChassisMat);
    torsoGroup.add(chestMesh);

    // Holographic Core (Rotating Mini-World in chest)
    const miniCoreGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const miniCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
    });
    const miniGlobeCore = new THREE.Mesh(miniCoreGeo, miniCoreMat);
    miniGlobeCore.position.set(0, 0.1, 0.35);
    torsoGroup.add(miniGlobeCore);

    // Anti-gravity Thruster Rings below torso
    const thrusterRingGeo1 = new THREE.TorusGeometry(0.48, 0.03, 16, 32);
    thrusterRingGeo1.rotateX(Math.PI / 2);
    const thrusterRing1 = new THREE.Mesh(thrusterRingGeo1, cyanGlowMat);
    thrusterRing1.position.y = -0.65;
    torsoGroup.add(thrusterRing1);

    const thrusterRingGeo2 = new THREE.TorusGeometry(0.32, 0.025, 16, 32);
    thrusterRingGeo2.rotateX(Math.PI / 2);
    const thrusterRing2 = new THREE.Mesh(thrusterRingGeo2, cyanGlowMat);
    thrusterRing2.position.y = -0.8;
    torsoGroup.add(thrusterRing2);

    // E. FLOATING ARTICULATED HANDS
    const handGeo = new THREE.SphereGeometry(0.18, 24, 24);
    handGeo.scale(1.2, 0.9, 0.9);

    const leftHand = new THREE.Mesh(handGeo, whiteChassisMat);
    leftHand.position.set(-0.85, 0, 0.2);
    avatar.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, whiteChassisMat);
    rightHand.position.set(0.85, 0, 0.2);
    avatar.add(rightHand);

    // F. CELEBRATION STAR / SPARKLE PARTICLES FOR HAPPY STATE
    const sparkleCount = 40;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePositions[i] = (Math.random() - 0.5) * 3;
      sparklePositions[i + 1] = Math.random() * 2.5;
      sparklePositions[i + 2] = (Math.random() - 0.5) * 2;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffdd44,
      size: 0.15,
      transparent: true,
      opacity: 0,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    avatar.add(sparkles);

    // STORE RIG REFERENCES
    avatarRigRef.current = {
      avatar,
      headGroup,
      torsoGroup,
      miniGlobeCore,
      wifiRing,
      thrusterRing1,
      thrusterRing2,
      leftHand,
      rightHand,
      sparkles,
      sparkleMat,
      faceCtx,
      faceCanvas,
      faceTexture,
    };

    // ANIMATION LOOP
    let animId;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    // Helper: Draw facial expressions on canvas texture
    function updateFace(emotion, mouthAmt, isBlink) {
      faceCtx.clearRect(0, 0, 512, 256);

      faceCtx.fillStyle = '#00f2fe';
      faceCtx.strokeStyle = '#00f2fe';
      faceCtx.shadowColor = '#00f2fe';
      faceCtx.shadowBlur = 18;
      faceCtx.lineWidth = 14;
      faceCtx.lineCap = 'round';

      // Left eye center: (160, 110), Right eye center: (352, 110)
      const leftX = 160;
      const rightX = 352;
      const eyeY = 110;

      if (isBlink) {
        // Blinking lines
        faceCtx.beginPath();
        faceCtx.moveTo(leftX - 35, eyeY);
        faceCtx.lineTo(leftX + 35, eyeY);
        faceCtx.moveTo(rightX - 35, eyeY);
        faceCtx.lineTo(rightX + 35, eyeY);
        faceCtx.stroke();
      } else if (emotion === 'HAPPY') {
        // Joyful inverted U-curve eyes (^ ^)
        faceCtx.beginPath();
        faceCtx.arc(leftX, eyeY + 15, 36, Math.PI * 1.1, Math.PI * 1.9, false);
        faceCtx.stroke();

        faceCtx.beginPath();
        faceCtx.arc(rightX, eyeY + 15, 36, Math.PI * 1.1, Math.PI * 1.9, false);
        faceCtx.stroke();
      } else if (emotion === 'LISTENING') {
        // Attentive wide curious eyes
        faceCtx.beginPath();
        faceCtx.arc(leftX, eyeY, 38, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.beginPath();
        faceCtx.arc(rightX, eyeY, 38, 0, Math.PI * 2);
        faceCtx.fill();

        // White reflection highlights
        faceCtx.fillStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(leftX + 12, eyeY - 12, 10, 0, Math.PI * 2);
        faceCtx.arc(rightX + 12, eyeY - 12, 10, 0, Math.PI * 2);
        faceCtx.fill();
        faceCtx.fillStyle = '#00f2fe';
      } else if (emotion === 'THINKING') {
        // Eyes looking up towards top-right
        faceCtx.beginPath();
        faceCtx.ellipse(leftX + 10, eyeY - 15, 30, 36, 0.2, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.beginPath();
        faceCtx.ellipse(rightX + 10, eyeY - 15, 30, 36, 0.2, 0, Math.PI * 2);
        faceCtx.fill();
      } else {
        // Standard friendly eyes
        faceCtx.beginPath();
        faceCtx.arc(leftX, eyeY, 32, 0, Math.PI * 2);
        faceCtx.arc(rightX, eyeY, 32, 0, Math.PI * 2);
        faceCtx.fill();

        // Cute highlight reflection
        faceCtx.fillStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(leftX + 10, eyeY - 10, 8, 0, Math.PI * 2);
        faceCtx.arc(rightX + 10, eyeY - 10, 8, 0, Math.PI * 2);
        faceCtx.fill();
        faceCtx.fillStyle = '#00f2fe';
      }

      // MOUTH RENDERING
      const mouthY = 185;
      const mouthCenter = 256;

      if (mouthAmt > 0.05) {
        // Synchronized speaking mouth opening
        const openH = 10 + mouthAmt * 32;
        faceCtx.fillStyle = '#00f2fe';
        faceCtx.beginPath();
        faceCtx.ellipse(mouthCenter, mouthY, 28, openH, 0, 0, Math.PI * 2);
        faceCtx.fill();
      } else if (emotion === 'HAPPY' || emotion === 'GREETING') {
        // Big smile
        faceCtx.beginPath();
        faceCtx.arc(mouthCenter, mouthY - 15, 38, 0.2 * Math.PI, 0.8 * Math.PI, false);
        faceCtx.stroke();
      } else if (emotion === 'THINKING') {
        // Thoughtful small o-mouth
        faceCtx.beginPath();
        faceCtx.ellipse(mouthCenter + 8, mouthY, 14, 10, 0, 0, Math.PI * 2);
        faceCtx.stroke();
      } else {
        // Friendly subtle smile
        faceCtx.beginPath();
        faceCtx.arc(mouthCenter, mouthY - 10, 26, 0.2 * Math.PI, 0.8 * Math.PI, false);
        faceCtx.stroke();
      }

      faceTexture.needsUpdate = true;
    }

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Blinking controller
      blinkTimer += 0.016;
      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.7) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      const rig = avatarRigRef.current;
      if (!rig) return;

      // 1. BASE IDLE FLOATING (Hover breathing)
      const hoverY = Math.sin(elapsed * 2.2) * 0.08;
      rig.avatar.position.y = -0.2 + hoverY;

      // Rotate mini chest globe & thruster rings
      rig.miniGlobeCore.rotation.y += 0.02;
      rig.miniGlobeCore.rotation.x = 0.2;
      rig.wifiRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.15);
      rig.thrusterRing1.rotation.z += 0.03;
      rig.thrusterRing2.rotation.z -= 0.04;

      // 2. STATE MACHINE RIGGING ANIMATIONS
      const currentEmotion = emotion;

      if (currentEmotion === 'GREETING' || currentEmotion === 'GOODBYE') {
        // Wave right hand enthusiastically
        rig.rightHand.position.set(0.95, 1.1 + Math.sin(elapsed * 8) * 0.1, 0.4);
        rig.rightHand.rotation.z = Math.sin(elapsed * 8) * 0.5;
        // Left hand rests comfortably
        rig.leftHand.position.set(-0.85, -0.05, 0.2);
        rig.headGroup.rotation.z = Math.sin(elapsed * 2) * 0.05;
        rig.headGroup.rotation.y = 0;
        rig.sparkleMat.opacity = 0;
      } else if (currentEmotion === 'LISTENING') {
        // Tilt head sideways with curiosity, hands calm
        rig.headGroup.rotation.z = 0.18;
        rig.headGroup.rotation.x = -0.05;
        rig.headGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.08;
        rig.leftHand.position.set(-0.75, 0.1, 0.3);
        rig.rightHand.position.set(0.75, 0.1, 0.3);
        rig.sparkleMat.opacity = 0;
      } else if (currentEmotion === 'THINKING') {
        // Right hand to chin, head slightly looking up
        rig.headGroup.rotation.x = -0.15;
        rig.headGroup.rotation.y = 0.12;
        rig.headGroup.rotation.z = 0.05;
        rig.rightHand.position.set(0.45, 0.55, 0.55);
        rig.leftHand.position.set(-0.6, -0.1, 0.3);
        rig.sparkleMat.opacity = 0;
      } else if (currentEmotion === 'SPEAKING') {
        // Expressive gesticulating hands synced with speech cadence
        const speechWave = Math.sin(elapsed * 5) * 0.12;
        rig.headGroup.rotation.y = Math.sin(elapsed * 1.8) * 0.08;
        rig.headGroup.rotation.x = Math.sin(elapsed * 2.5) * 0.05;
        rig.headGroup.rotation.z = 0;
        rig.leftHand.position.set(-0.85 + speechWave, 0.1 + speechWave, 0.4);
        rig.rightHand.position.set(0.85 - speechWave, 0.15 - speechWave, 0.4);
        rig.sparkleMat.opacity = 0;
      } else if (currentEmotion === 'HAPPY') {
        // Cheer bounce: hands up in the air, joyous sparkling
        const jumpY = Math.abs(Math.sin(elapsed * 5)) * 0.22;
        rig.avatar.position.y = -0.2 + jumpY;
        rig.headGroup.rotation.x = -0.08;
        rig.leftHand.position.set(-0.8, 1.05 + Math.sin(elapsed * 6) * 0.08, 0.3);
        rig.rightHand.position.set(0.8, 1.05 + Math.cos(elapsed * 6) * 0.08, 0.3);
        rig.sparkleMat.opacity = 0.85;
        rig.sparkles.rotation.y += 0.03;
      } else if (currentEmotion === 'ENCOURAGING') {
        // Affirmative head nod, right hand thumbs-up forward
        const nod = Math.sin(elapsed * 4) * 0.08;
        rig.headGroup.rotation.x = nod;
        rig.headGroup.rotation.y = 0;
        rig.headGroup.rotation.z = 0;
        rig.rightHand.position.set(0.65, 0.2, 0.65);
        rig.leftHand.position.set(-0.8, -0.05, 0.2);
        rig.sparkleMat.opacity = 0;
      } else {
        // IDLE
        rig.headGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.1;
        rig.headGroup.rotation.x = Math.sin(elapsed * 0.6) * 0.04;
        rig.headGroup.rotation.z = 0;
        rig.leftHand.position.set(-0.85, 0 + hoverY * 0.5, 0.2);
        rig.rightHand.position.set(0.85, 0 + hoverY * 0.5, 0.2);
        rig.sparkleMat.opacity = 0;
      }

      // Update face texture
      updateFace(currentEmotion, mouthValue, isBlinking);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [emotion, mouthValue]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Dynamic Sound Wave Aura when listening or speaking */}
      {(isListening || isSpeaking) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full border border-cyan-400/40 animate-ping opacity-75" />
          <div className="absolute w-80 h-80 rounded-full border border-blue-500/30 animate-pulse opacity-60" />
        </div>
      )}

      {/* 3D Webby Canvas Container (Responsive to screen height to prevent viewport overflow) */}
      <div
        ref={mountRef}
        className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] max-h-[38vh] max-w-[85vw] relative z-10 filter drop-shadow-[0_10px_25px_rgba(0,242,254,0.35)]"
      />

      {/* State Badge beneath Webby */}
      <div className="mt-[-15px] sm:mt-[-20px] z-20 flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 shadow-lg text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>WEBBY: {currentEmotionLabel}</span>
      </div>
    </div>
  );
}

