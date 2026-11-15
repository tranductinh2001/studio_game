import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobeScene({ isWarpSpeed = false }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x0a2540, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 2.5);
    dirLight1.position.set(10, 10, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4facfe, 1.2);
    dirLight2.position.set(-10, -5, 10);
    scene.add(dirLight2);

    // GLOBE GROUP
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. BASE SPHERE (Deep Oceanic Navy with glowing atmosphere)
    const globeRadius = 4.2;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x071b34,
      emissive: 0x020b18,
      shininess: 25,
      transparent: true,
      opacity: 0.95,
    });
    const globeSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeSphere);

    // 2. INNER GLOW / WIREFRAME GRID
    const wireframeGeo = new THREE.SphereGeometry(globeRadius * 1.002, 32, 32);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0088cc,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // 3. CONTINENTAL DOT MATRIX (Procedural high-tech continents)
    const dotCount = 1800;
    const dotGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(dotCount * 3);
    const colors = new Float32Array(dotCount * 3);

    for (let i = 0; i < dotCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      // Filter to simulate continental landmass shapes roughly
      const lat = (0.5 - phi / Math.PI) * 180;
      const lon = (theta % (2 * Math.PI)) - Math.PI;

      const r = globeRadius * 1.008;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Neon Cyan / Electric Blue gradient
      const c = new THREE.Color(Math.random() > 0.3 ? 0x00f2fe : 0x4facfe);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const continentPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(continentPoints);

    // 4. ATMOSPHERIC HALO SHADER/OUTER GLOW
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphere);

    // 5. INTERNET CONNECTION ARCS (Great Circle Beziers)
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    // Major global Internet exchange hubs (lat, lon): Hanoi, Tokyo, London, NY, Sydney, Singapore, Frankfurt, SF
    const hubs = [
      { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'New York', lat: 40.7128, lon: -74.006 },
      { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    ];

    function latLonToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const packets = [];

    // Connect hubs with glowing quadratic bezier arches
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        // Sample select pairs
        if ((i + j) % 2 === 0 || i === 0) {
          const v1 = latLonToVector3(hubs[i].lat, hubs[i].lon, globeRadius * 1.01);
          const v2 = latLonToVector3(hubs[j].lat, hubs[j].lon, globeRadius * 1.01);

          // Control point pulled outwards
          const mid = v1.clone().add(v2).multiplyScalar(0.5);
          const distance = v1.distanceTo(v2);
          const elevation = Math.min(2.2, distance * 0.45);
          const control = mid.normalize().multiplyScalar(globeRadius + elevation);

          const curve = new THREE.QuadraticBezierCurve3(v1, control, v2);
          const points = curve.getPoints(36);
          const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

          const curveMat = new THREE.LineBasicMaterial({
            color: i === 0 ? 0x00f2fe : 0x0077ff,
            transparent: true,
            opacity: i === 0 ? 0.65 : 0.35,
          });

          const line = new THREE.Line(curveGeo, curveMat);
          arcGroup.add(line);

          // Add pulsating light packet traveling on this curve
          const packetGeo = new THREE.SphereGeometry(0.06, 12, 12);
          const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const packetMesh = new THREE.Mesh(packetGeo, packetMat);
          arcGroup.add(packetMesh);

          packets.push({
            curve,
            mesh: packetMesh,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.005,
          });
        }
      }
    }

    // 6. ORBITING WEB NODES (WWW, HTML, Hyperlink, Browser, Satellite)
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeIcons = [
      { label: '🌐 WWW', color: 0x00f2fe, radius: 6.8, speed: 0.008, yOffset: 1.2 },
      { label: '🔗 Siêu Liên Kết', color: 0x10b981, radius: 6.2, speed: -0.006, yOffset: -1.5 },
      { label: '📄 Trang Web', color: 0x38bdf8, radius: 7.2, speed: 0.005, yOffset: 2.1 },
      { label: '🧭 Trình Duyệt', color: 0xf59e0b, radius: 6.5, speed: -0.009, yOffset: -0.8 },
      { label: '📡 Vệ Tinh', color: 0xa855f7, radius: 7.6, speed: 0.007, yOffset: 0.2 },
    ];

    const nodes = [];
    nodeIcons.forEach((info) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');

      // Rounded pill badge
      ctx.fillStyle = 'rgba(6, 18, 38, 0.85)';
      ctx.strokeStyle = `#${info.color.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 64, 30);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(info.label, 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.8, 0.55, 1);
      nodeGroup.add(sprite);

      nodes.push({
        sprite,
        radius: info.radius,
        speed: info.speed,
        angle: Math.random() * Math.PI * 2,
        yOffset: info.yOffset,
      });
    });

    // 7. BACKGROUND CYBER PARTICLES
    const particleCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 60;
      pPositions[i + 1] = (Math.random() - 0.5) * 40;
      pPositions[i + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x4facfe,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // MOUSE PARALLAX
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    // RESIZE LISTENER
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ANIMATION LOOP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotation speed based on warp mode
      const rotSpeed = isWarpSpeed ? 0.04 : 0.0025;
      globeGroup.rotation.y += rotSpeed;
      globeGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.08;

      // Gentle camera parallax
      camera.position.x += (targetX * 3 - camera.position.x) * 0.05;
      camera.position.y += (-targetY * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Animate internet data packets along curves
      packets.forEach((p) => {
        p.progress += p.speed * (isWarpSpeed ? 4 : 1);
        if (p.progress > 1) p.progress = 0;
        const pos = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pos);
      });

      // Animate orbiting web nodes
      nodes.forEach((n) => {
        n.angle += n.speed * (isWarpSpeed ? 3 : 1);
        n.sprite.position.x = Math.cos(n.angle) * n.radius;
        n.sprite.position.z = Math.sin(n.angle) * n.radius;
        n.sprite.position.y = n.yOffset + Math.sin(elapsed * 1.5 + n.angle) * 0.3;
      });

      // Subtle particle float
      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isWarpSpeed]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}

