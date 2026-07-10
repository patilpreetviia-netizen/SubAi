import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 2500;
const ACCENT = "#D97736";
const ACCENT_ALT = "#f59e0b";

export function WebGLBackground() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 30;

    // Primary particle field
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    const spread = 45;
    const color1 = new THREE.Color(ACCENT);
    const color2 = new THREE.Color(ACCENT_ALT);
    const color3 = new THREE.Color("#ffffff");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * spread;

      positions[i3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.6;
      positions[i3 + 2] = Math.cos(phi) * r * 0.5;

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      sizes[i] = 0.3 + Math.random() * 2;

      velocities[i3] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

      const c = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Secondary smaller particle field
    const material2 = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.06,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos2[i3] = (Math.random() - 0.5) * spread * 2;
      pos2[i3 + 1] = (Math.random() - 0.5) * spread * 1.5;
      pos2[i3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    geo2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
    const particles2 = new THREE.Points(geo2, material2);
    scene.add(particles2);

    // Floating orb
    const orbGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.08,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(5, -3, -15);
    scene.add(orb);

    const orbMat2 = new THREE.MeshBasicMaterial({
      color: ACCENT_ALT,
      transparent: true,
      opacity: 0.05,
    });
    const orb2 = new THREE.Mesh(orbGeo, orbMat2);
    orb2.scale.set(2, 2, 2);
    orb2.position.set(-8, 6, -20);
    scene.add(orb2);

    // Connection lines
    const linePositions = [];
    for (let i = 0; i < 80; i++) {
      const i3 = i * 3;
      linePositions.push(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.6,
        (Math.random() - 0.5) * 20,
      );
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.04,
    });
    const lineGroup = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineGroup);

    const handleMouse = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("resize", handleResize);

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const mx = mouseRef.current.x * 0.3;
      const my = mouseRef.current.y * 0.3;

      const pos = particles.geometry.attributes.position.array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const breathe = Math.sin(elapsed * 0.2 + i * 0.008) * 0.4;
        const waveX = Math.sin(elapsed * 0.15 + basePositions[i3 + 1] * 0.1) * 0.3;
        const waveY = Math.cos(elapsed * 0.12 + basePositions[i3] * 0.1) * 0.3;

        pos[i3] = basePositions[i3] + mx * 0.6 + breathe * 0.2 + waveX;
        pos[i3 + 1] =
          basePositions[i3 + 1] + my * 0.6 + Math.sin(elapsed * 0.18 + i * 0.012) * 0.3 + waveY;
        pos[i3 + 2] = basePositions[i3 + 2] + Math.sin(elapsed * 0.08 + i * 0.005) * 0.2;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      const opacity = 0.35 + Math.sin(elapsed * 0.15) * 0.15;
      material.opacity = opacity;
      material2.opacity = 0.15 + Math.sin(elapsed * 0.12 + 1) * 0.1;

      particles.rotation.y = Math.sin(elapsed * 0.04) * 0.08;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.02;
      particles2.rotation.y = Math.sin(elapsed * 0.025 + 1) * 0.12;
      particles2.rotation.x = Math.sin(elapsed * 0.015) * 0.03;

      orb.position.x = 5 + Math.sin(elapsed * 0.2) * 3;
      orb.position.y = -3 + Math.cos(elapsed * 0.25) * 2;
      orbMat.opacity = 0.06 + Math.sin(elapsed * 0.3) * 0.03;

      orb2.position.x = -8 + Math.sin(elapsed * 0.15 + 1) * 4;
      orb2.position.y = 6 + Math.cos(elapsed * 0.18) * 3;
      orbMat2.opacity = 0.04 + Math.sin(elapsed * 0.22) * 0.02;

      lineGroup.rotation.y = Math.sin(elapsed * 0.02) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}
