import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
  attribute float aSize;
  attribute float aRandom;
  uniform float uTime;
  uniform float uBreathPhase;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vRandom = aRandom;
    vec3 pos = position;

    float breath = sin(uTime * 0.2 + aRandom * 6.28) * 0.15;
    pos += breath;

    pos.x += uMouse.x * 0.08 * (1.0 + aRandom * 0.5);
    pos.y += uMouse.y * 0.08 * (1.0 + aRandom * 0.5);

    float dist = length(pos.xy);
    vAlpha = smoothstep(2.5, 0.2, dist) * (0.3 + sin(uTime * 0.3 + aRandom * 10.0) * 0.15);

    vec4 mvPosition = vec4(pos, 1.0);
    gl_Position = mvPosition;
    gl_PointSize = aSize * (1.0 + breath * 0.3) * 2.0;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float uTime;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorTertiary;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float glow = exp(-d * 4.0) * 0.8;
    float core = smoothstep(0.5, 0.0, d);

    vec3 color = mix(uColorPrimary, uColorTertiary, vRandom * 0.4 + sin(uTime * 0.15 + vRandom * 6.28) * 0.2);

    float alpha = (glow + core * 0.5) * vAlpha;
    gl_FragColor = vec4(color, alpha);
  }
`;

const GRID_SIZE = 80;
const TOTAL_PARTICLES = GRID_SIZE * GRID_SIZE;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WebGLBackground() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const frustum = 3;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
      frustum, -frustum,
      -10, 10
    );
    camera.position.z = 5;

    const positions = new Float32Array(TOTAL_PARTICLES * 3);
    const sizes = new Float32Array(TOTAL_PARTICLES);
    const randoms = new Float32Array(TOTAL_PARTICLES);

    const spacing = 6.0 / GRID_SIZE;
    const offsetX = -(GRID_SIZE * spacing) / 2;
    const offsetY = -(GRID_SIZE * spacing) / 2;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = (i * GRID_SIZE + j) * 3;
        const jitterX = (Math.random() - 0.5) * spacing * 0.3;
        const jitterY = (Math.random() - 0.5) * spacing * 0.3;
        positions[idx] = offsetX + j * spacing + jitterX;
        positions[idx + 1] = offsetY + i * spacing + jitterY;
        positions[idx + 2] = 0;

        const particleIdx = i * GRID_SIZE + j;
        sizes[particleIdx] = 1.5 + Math.random() * 2.5;
        randoms[particleIdx] = Math.random();
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uBreathPhase: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorPrimary: { value: new THREE.Color("#D97736") },
        uColorTertiary: { value: new THREE.Color("#FF9A4D") },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handleMouse = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      const a = window.innerWidth / window.innerHeight;
      camera.left = -frustum * a;
      camera.right = frustum * a;
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

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      material.uniforms.uTime.value = elapsed;
      material.uniforms.uBreathPhase.value = Math.sin(elapsed * 0.2);
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      particles.rotation.z = Math.sin(elapsed * 0.02) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(217,119,6,0.06) 0%, transparent 70%)",
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
