"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ── Seeded random ─────────────────────────────────────────────────────── */
const lcg = (seed: number) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) | 0; return (s >>> 0) / 4294967296; };
};

/* ── QR canvas texture ─────────────────────────────────────────────────── */
function createQRTexture(): THREE.CanvasTexture {
  const S = 10;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 21 * S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* finder patterns */
  const corners: [number, number][] = [[0, 0], [14, 0], [0, 14]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = "#3B82F6"; ctx.fillRect(cx * S, cy * S, 7 * S, 7 * S);
    ctx.fillStyle = "#000";    ctx.fillRect((cx + 1) * S, (cy + 1) * S, 5 * S, 5 * S);
    ctx.fillStyle = "#60A5FA"; ctx.fillRect((cx + 2) * S, (cy + 2) * S, 3 * S, 3 * S);
  });

  /* data modules */
  const rand = lcg(42);
  ctx.fillStyle = "#3B82F6";
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const inFinder =
        (r < 9 && c < 9) || (r < 9 && c > 11) || (r > 11 && c < 9);
      if (inFinder) continue;
      if (rand() > 0.48) ctx.fillRect(c * S, r * S, S, S);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ── Hotel windows ─────────────────────────────────────────────────────── */
function HotelWindows() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 80;

  useEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    const rand = lcg(777);

    const pts: [number, number, number][] = [];
    /* main tower — front & back faces */
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 4; col++) {
        const x = -0.7 + col * 0.47;
        const y = 1.1 + row * 1.1;
        pts.push([x, y, 1.02], [x, y, -1.02]);
      }
    }
    /* wing fronts */
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const y = 0.8 + row * 1.05;
        pts.push([-1.8 + col * 0.45 - 0.2, y, 0.81], [2.1 - col * 0.45, y, 0.81]);
      }
    }

    pts.slice(0, COUNT).forEach((p, i) => {
      m.makeTranslation(p[0], p[1], p[2]);
      ref.current.setMatrixAt(i, m);
      const lit = rand() > 0.25;
      color.set(lit ? (rand() > 0.5 ? "#60A5FA" : "#BAE6FD") : "#1E3A5F");
      ref.current.setColorAt(i, color);
    });

    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[0.16, 0.22]} />
      <meshStandardMaterial emissive="#3B82F6" emissiveIntensity={1.8} />
    </instancedMesh>
  );
}

/* ── Hotel building ────────────────────────────────────────────────────── */
function Hotel() {
  const matProps = { metalness: 0.92, roughness: 0.08 };
  return (
    <group>
      {/* podium */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3.6, 0.3, 2.8]} />
        <meshStandardMaterial color="#0D1E3E" {...matProps} />
      </mesh>
      {/* main tower */}
      <mesh position={[0, 5.3, 0]}>
        <boxGeometry args={[2, 10, 2]} />
        <meshStandardMaterial color="#0A1931" {...matProps} />
      </mesh>
      {/* left wing */}
      <mesh position={[-1.8, 2.6, 0]}>
        <boxGeometry args={[1.4, 5, 1.5]} />
        <meshStandardMaterial color="#0B1D3C" {...matProps} />
      </mesh>
      {/* right wing */}
      <mesh position={[1.8, 2.6, 0]}>
        <boxGeometry args={[1.4, 5, 1.5]} />
        <meshStandardMaterial color="#0B1D3C" {...matProps} />
      </mesh>
      {/* roof crown */}
      <mesh position={[0, 10.45, 0]}>
        <boxGeometry args={[1.6, 0.5, 1.6]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#3B82F6"
          emissiveIntensity={0.6}
          {...matProps}
        />
      </mesh>
      {/* antenna */}
      <mesh position={[0, 11.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
        <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={1} />
      </mesh>
      <HotelWindows />
    </group>
  );
}

/* ── Smartphone ────────────────────────────────────────────────────────── */
function Phone() {
  const UI_LINES: [number, number, number, string][] = [
    [0, 0.54, 0.38, "#FFFFFF"],  // headline
    [0, 0.33, 0.55, "#A1A1AA"],  // sub
    [-0.08, 0.12, 0.28, "#60A5FA"], // label
    [0.06, -0.08, 0.42, "#A1A1AA"],
    [0, -0.3, 0.55, "#A1A1AA"],
    [0, -0.52, 0.35, "#10B981"], // confirm
  ];

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.7}>
      <group position={[4.6, 4.2, 1.8]} rotation={[0.05, -0.38, 0.04]}>
        {/* body */}
        <mesh>
          <boxGeometry args={[0.88, 1.8, 0.1]} />
          <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* screen */}
        <mesh position={[0, 0, 0.058]}>
          <planeGeometry args={[0.72, 1.55]} />
          <meshStandardMaterial
            color="#050816"
            emissive="#1E40AF"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* UI lines */}
        {UI_LINES.map(([x, y, w, col], i) => (
          <mesh key={i} position={[x, y, 0.059]}>
            <planeGeometry args={[w, 0.042]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={2} />
          </mesh>
        ))}
        {/* check badge */}
        <mesh position={[0, -0.3, 0.06]}>
          <circleGeometry args={[0.09, 32]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── QR hologram ───────────────────────────────────────────────────────── */
function QRHologram() {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const border = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const texture = useMemo(() => createQRTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(t * 0.28) * 0.18;
      mesh.current.material.opacity = 0.6 + Math.sin(t * 1.6) * 0.22;
    }
    if (border.current) {
      border.current.material.opacity = 0.25 + Math.sin(t * 1.6 + 0.5) * 0.15;
    }
  });

  return (
    <group position={[2.4, 1.6, 3.6]} rotation={[0.08, -0.25, 0]}>
      {/* glow border */}
      <mesh ref={border}>
        <planeGeometry args={[1.85, 1.85]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
      </mesh>
      {/* QR face */}
      <mesh ref={mesh} position={[0, 0, 0.005]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={texture} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Scan beam ─────────────────────────────────────────────────────────── */
function ScanBeam() {
  const beam = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);

  useFrame(({ clock }) => {
    if (!beam.current) return;
    const t = (clock.elapsedTime * 0.45) % 1;
    beam.current.position.y = 2.4 - t * 1.6;
    beam.current.material.opacity = 0.7 - Math.abs(t - 0.5) * 1.1;
  });

  return (
    <mesh ref={beam} position={[2.4, 2.4, 3.62]}>
      <planeGeometry args={[1.6, 0.06]} />
      <meshBasicMaterial color="#60A5FA" transparent opacity={0.5} />
    </mesh>
  );
}

/* ── Camera rig ────────────────────────────────────────────────────────── */
const mouse = { x: 0, y: 0 };

export function registerMouseListener() {
  if (typeof window === "undefined") return;
  const h = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("mousemove", h, { passive: true });
}

function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(7, 5.2, 12.5), []);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    target.set(
      7 + Math.sin(t * 0.06) * 0.5 + mouse.x * 0.35,
      5.2 + Math.cos(t * 0.045) * 0.4 - mouse.y * 0.2,
      12.5 + Math.cos(t * 0.08) * 0.6,
    );
    state.camera.position.lerp(vec.copy(target), 0.025);
    state.camera.lookAt(0.5, 3.8, 0);
  });

  return null;
}

/* ── Scene contents ────────────────────────────────────────────────────── */
function SceneContents() {
  return (
    <>
      <fog attach="fog" args={["#050816", 20, 38]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 12, 5]} intensity={1.4} color="#ffffff" />
      <pointLight position={[3, 9, 4]} intensity={6} color="#3B82F6" distance={22} />
      <pointLight position={[-4, 3, -4]} intensity={3} color="#1D4ED8" distance={16} />
      <pointLight position={[5, 2, 6]} intensity={2} color="#60A5FA" distance={12} />
      <pointLight position={[0, 11.5, 0]} intensity={4} color="#93C5FD" distance={6} />

      <Hotel />
      <Phone />
      <QRHologram />
      <ScanBeam />

      <Sparkles
        count={140}
        scale={22}
        size={1.8}
        speed={0.35}
        opacity={0.45}
        color="#3B82F6"
      />

      <CameraRig />
    </>
  );
}

/* ── Exported canvas ───────────────────────────────────────────────────── */
export default function HeroScene() {
  useEffect(() => { registerMouseListener(); }, []);

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [7, 5.2, 12.5], fov: 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
    </Canvas>
  );
}
