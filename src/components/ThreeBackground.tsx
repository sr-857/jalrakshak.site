"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";

function WaterWaves() {
  const meshRef = useRef<THREE.Mesh>(null);
  const secondaryMeshRef = useRef<THREE.Mesh>(null);
  
  const { geometry, material, geometry2, material2 } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 100, 100);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
      side: THREE.DoubleSide,
      shininess: 100
    });

    const geo2 = new THREE.PlaneGeometry(50, 50, 50, 50);
    const mat2 = new THREE.MeshPhongMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.05,
      wireframe: false,
      side: THREE.DoubleSide
    });
    
    return { geometry: geo, material: mat, geometry2: geo2, material2: mat2 };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      const pos = meshRef.current.geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = Math.sin(x * 0.3 + time * 0.4) * 0.8 + 
                  Math.cos(y * 0.2 + time * 0.6) * 0.5 +
                  Math.sin((x + y) * 0.1 + time * 0.8) * 0.2;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
    }

    if (secondaryMeshRef.current) {
      const pos2 = secondaryMeshRef.current.geometry.getAttribute("position");
      for (let i = 0; i < pos2.count; i++) {
        const x = pos2.getX(i);
        const y = pos2.getY(i);
        const z = Math.sin(x * 0.2 + time * 0.3) * 0.4 + 
                  Math.cos(y * 0.1 + time * 0.4) * 0.3;
        pos2.setZ(i, z);
      }
      pos2.needsUpdate = true;
    }
  });

  return (
    <>
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        material={material} 
        rotation={[-Math.PI / 2.2, 0, 0]}
        position={[0, -5, -5]}
      />
      <mesh 
        ref={secondaryMeshRef} 
        geometry={geometry2} 
        material={material2} 
        rotation={[-Math.PI / 2.2, 0, 0]}
        position={[0, -5.1, -5]}
      />
    </>
  );
}

export default function ThreeBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fogColor = resolvedTheme === "dark" ? "#020617" : "#f8fafc";
  const lightColor = resolvedTheme === "dark" ? "#1d4ed8" : "#2563eb";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={resolvedTheme === "dark" ? 0.3 : 0.8} />
        <spotLight position={[0, 20, 10]} intensity={resolvedTheme === "dark" ? 3 : 2} color={lightColor} />
        <WaterWaves />
        <fog attach="fog" args={[fogColor, 10, 30]} />
      </Canvas>
    </div>
  );
}
