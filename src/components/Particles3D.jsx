import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Seeded pseudo-random generator to satisfy React purity rule
function seededRandom(seed) {
  let h = seed;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function ParticleField({ count = 60 }) {
  const pointsRef = useRef();

  // Create random coordinates for particles
  const positions = useMemo(() => {
    const random = seededRandom(1);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (random() - 0.5) * 12; // X
      pos[i * 3 + 1] = (random() - 0.5) * 12; // Y
      pos[i * 3 + 2] = (random() - 0.5) * 12; // Z
    }
    return pos;
  }, [count]);

  // Subtle velocity offsets for each particle
  const velocities = useMemo(() => {
    const random = seededRandom(2);
    const v = [];
    for (let i = 0; i < count; i++) {
      v.push({
        x: (random() - 0.5) * 0.004,
        y: (random() - 0.5) * 0.003 - 0.002, // slightly drift downwards like dust
        z: (random() - 0.5) * 0.004,
      });
    }
    return v;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const array = geo.attributes.position.array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Apply drift
      array[idx] += velocities[i].x;
      array[idx + 1] += velocities[i].y + Math.sin(time * 0.5 + i) * 0.0005; // subtle weave
      array[idx + 2] += velocities[i].z;

      // Boundary wraps
      if (array[idx] > 6) array[idx] = -6;
      if (array[idx] < -6) array[idx] = 6;
      if (array[idx + 1] > 6) array[idx + 1] = -6;
      if (array[idx + 1] < -6) array[idx + 1] = 6;
      if (array[idx + 2] > 6) array[idx + 2] = -6;
      if (array[idx + 2] < -6) array[idx + 2] = 6;
    }

    geo.attributes.position.needsUpdate = true;

    // Slow rotation based on mouse coordinates
    const mx = state.pointer.x * 0.15;
    const my = state.pointer.y * 0.15;
    pointsRef.current.rotation.y = mx + time * 0.015;
    pointsRef.current.rotation.x = my + time * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#e8732a"
        size={0.065}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Particles3D({ count = 60 }) {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <ParticleField count={count} />
      </Canvas>
    </div>
  );
}
