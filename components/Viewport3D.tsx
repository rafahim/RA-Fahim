'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// A regular icosahedron: 12 vertices, 20 triangular faces. Chosen over a
// cube/sphere because its facets read unmistakably as "3D render subject"
// at a glance, like the default-object thumbnails inside Blender/C4D.
const PHI = (1 + Math.sqrt(5)) / 2;
const RAW_VERTICES: Vec3[] = [
  { x: -1, y: PHI, z: 0 },
  { x: 1, y: PHI, z: 0 },
  { x: -1, y: -PHI, z: 0 },
  { x: 1, y: -PHI, z: 0 },
  { x: 0, y: -1, z: PHI },
  { x: 0, y: 1, z: PHI },
  { x: 0, y: -1, z: -PHI },
  { x: 0, y: 1, z: -PHI },
  { x: PHI, y: 0, z: -1 },
  { x: PHI, y: 0, z: 1 },
  { x: -PHI, y: 0, z: -1 },
  { x: -PHI, y: 0, z: 1 },
];

const FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

// Normalize so every vertex sits on the unit sphere.
const VERTICES: Vec3[] = RAW_VERTICES.map((v) => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
});

function rotateX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}
function rotateY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

interface Viewport3DProps {
  size?: number;
  className?: string;
}

/**
 * A small, dependency-free "live viewport" widget: an icosahedron drawn
 * with plain canvas 2D (no three.js needed for one rotating primitive).
 * It idles on a slow auto-spin, steers toward the cursor while the
 * pointer is nearby, and switches from wireframe to a flat-shaded
 * render on hover -- the same wireframe-to-render toggle a 3D artist
 * sees when switching viewport shading modes.
 */
export default function Viewport3D({ size = 220, className = '' }: Viewport3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const targetRef = useRef({ rx: 0.6, ry: 0.4 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let rotY = 0.4;
    let rotX = 0.6;
    let raf = 0;
    const scale = size * 0.34;
    const center = size / 2;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      targetRef.current = { rx: 0.6 + ny * 0.9, ry: 0.4 + nx * 1.1 };
    };
    const handleEnter = () => {
      hoverRef.current = true;
    };
    const handleLeave = () => {
      hoverRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    wrapper.addEventListener('pointerenter', handleEnter);
    wrapper.addEventListener('pointerleave', handleLeave);

    function draw() {
      if (!ctx) return;
      const idleSpin = prefersReducedMotion ? 0 : 0.0016;
      rotY += (targetRef.current.ry - rotY) * 0.04 + idleSpin;
      rotX += (targetRef.current.rx - rotX) * 0.04;

      ctx.clearRect(0, 0, size, size);

      const projected = VERTICES.map((v) => {
        const r = rotateY(rotateX(v, rotX), rotY);
        return { x: r.x, y: r.y, z: r.z, sx: center + r.x * scale, sy: center + r.y * scale };
      });

      const facesWithDepth = FACES.map((face) => {
        const [a, b, c] = face;
        const avgZ = (projected[a].z + projected[b].z + projected[c].z) / 3;
        return { face, avgZ };
      }).sort((f1, f2) => f1.avgZ - f2.avgZ);

      const isShaded = hoverRef.current;

      for (const { face, avgZ } of facesWithDepth) {
        const [a, b, c] = face;
        const pa = projected[a];
        const pb = projected[b];
        const pc = projected[c];

        // Simple "facing camera" light term from the average depth,
        // remapped to 0..1 -- cheap flat-shading, not real lighting,
        // but reads convincingly as a render preview at this size.
        const light = (avgZ + 1) / 2;

        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.lineTo(pc.sx, pc.sy);
        ctx.closePath();

        if (isShaded) {
          const amber = 138 + light * 100;
          ctx.fillStyle = `rgba(255, ${Math.round(amber)}, ${Math.round(61 + light * 60)}, ${0.18 + light * 0.55})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 200, 150, ${0.15 + light * 0.35})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(243, 241, 234, ${0.14 + light * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', handlePointerMove);
      wrapper.removeEventListener('pointerenter', handleEnter);
      wrapper.removeEventListener('pointerleave', handleLeave);
    };
  }, [size, prefersReducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
