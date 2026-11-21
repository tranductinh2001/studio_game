import * as THREE from 'three';

/**
 * Procedural texture generators and 3D utility helpers for Game Center
 * 100% Offline, ultra-fast, zero external file dependencies
 */

// 1. Create a dynamic Team Texture with Team Name, Number, and Color
export function createTeamCanvasTexture(team, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, team?.color || '#2563eb');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Border highlight
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 500, 244);

  // Inner subtle pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 512; i += 32) {
    ctx.fillRect(i, 0, 16, 256);
  }

  // Team Number Badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(80, 128, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = team?.color || '#2563eb';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(team?.number || '1'), 80, 130);

  // Team Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const name = (team?.name || 'ĐỘI THI').toUpperCase();
  ctx.fillText(name.length > 12 ? name.substring(0, 11) + '..' : name, 160, 110);

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(options.subtitle || 'TIN HỌC 6 • THCS ĐẮK TRÔI', 160, 160);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 2. Procedural Water Ripples / Normal Texture
export function createWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#0284c7');
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(128, 128, 20 + i * 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// 3. Procedural Metallic / Wood Planks Texture
export function createWoodPlankTexture(primaryColor = '#78350f', secondaryColor = '#451a03') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = secondaryColor;
  for (let y = 0; y < 256; y += 32) {
    ctx.fillRect(0, y, 256, 4);
    for (let x = (y % 64); x < 256; x += 64) {
      ctx.fillRect(x, y, 3, 32);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 4. Procedural Holographic Foil Texture for Cards / Prizes
export function createHolographicTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.2, '#ec4899');
  grad.addColorStop(0.4, '#a855f7');
  grad.addColorStop(0.6, '#3b82f6');
  grad.addColorStop(0.8, '#10b981');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = -256; i < 512; i += 24) {
    ctx.fillRect(i, 0, 6, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 5. Standard Cinematic Studio Lighting Rig
export function setupCinematicLighting(scene, options = {}) {
  // Soft Ambient
  const ambientLight = new THREE.AmbientLight(options.ambientColor || 0x1e293b, options.ambientIntensity ?? 1.8);
  scene.add(ambientLight);

  // Key Light (Warm Sunlight or Bright Arena Spotlight)
  const keyLight = new THREE.DirectionalLight(options.keyColor || 0xffffff, options.keyIntensity ?? 2.8);
  keyLight.position.set(20, 35, 25);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 150;
  scene.add(keyLight);

  // Fill Light (Cool Cyan/Navy Fill)
  const fillLight = new THREE.DirectionalLight(options.fillColor || 0x38bdf8, options.fillIntensity ?? 1.2);
  fillLight.position.set(-20, 15, -15);
  scene.add(fillLight);

  // Rim Light (Vibrant Edge Light from behind for 3D silhouette pop)
  const rimLight = new THREE.DirectionalLight(options.rimColor || 0xf59e0b, options.rimIntensity ?? 1.5);
  rimLight.position.set(0, -10, -30);
  scene.add(rimLight);

  return { ambientLight, keyLight, fillLight, rimLight };
}

// 6. Particle Emitter System (Splashes, Sparks, Smoke)
export function createParticleGroup(count = 60, color = 0xffffff, size = 0.3) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    velocities.push({
      x: (Math.random() - 0.5) * 0.1,
      y: Math.random() * 0.15 + 0.05,
      z: (Math.random() - 0.5) * 0.1,
      life: Math.random()
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: color,
    size: size,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  return { points, geometry, material, velocities, count };
}

// 7. Clean Memory Disposal Helper
export function disposeThreeScene(scene, renderer) {
  if (!scene) return;
  scene.traverse((object) => {
    if (!object.isMesh && !object.isPoints) return;
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        object.material.dispose();
      }
    }
  });

  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement.parentNode.lastChild);
    renderer.dispose();
  }
}

