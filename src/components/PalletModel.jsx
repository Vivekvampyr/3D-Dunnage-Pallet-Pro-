import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// 3D Hotspot component
function Hotspot({ position, title, desc, active, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.15;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  const isVisible = hovered || active;

  return (
    <group position={position}>
      {/* Outer Pulse */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.06, 0.08, 16]} />
        <meshBasicMaterial color="#e8732a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Center Core */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={isVisible ? "#f58a3e" : "#e8732a"} />
      </mesh>

      {/* HTML Projector Callout */}
      <Html distanceFactor={4} center pointerEvents="none">
        <div className={`hotspot-label ${isVisible ? 'visible' : ''}`} style={{
          background: 'rgba(13, 13, 13, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1.5px solid var(--color-orange)',
          color: 'var(--color-white)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(232, 115, 42, 0.25)',
          fontFamily: 'var(--font-heading)',
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: 'translate3d(15px, -50%, 0)',
          minWidth: '220px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <h4 style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: 'var(--color-orange)',
            letterSpacing: '0.04em'
          }}>{title}</h4>
          <p style={{
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: '1.3',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'normal'
          }}>{desc}</p>
        </div>
      </Html>
    </group>
  );
}

// Procedural 3D Dunnage Pallet geometry
function PalletGeometry() {
  const groupRef = useRef();

  useFrame((state) => {
    // Very subtle floating animation if not dragging
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.04;
    }
  });

  // Material definitions
  const plasticMat = new THREE.MeshStandardMaterial({
    color: '#1e1e1e',
    roughness: 0.65,
    metalness: 0.2,
  });

  const orangeRibMat = new THREE.MeshStandardMaterial({
    color: '#e8732a',
    roughness: 0.4,
    metalness: 0.15,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#888888',
    roughness: 0.25,
    metalness: 0.85,
  });

  // Build blocks, slats, and rods
  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* 1. TOP DECK SLATS (5 parallel grids) */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((zPos, idx) => (
        <group key={`slat-${idx}`} position={[0, 0.12, zPos]}>
          <mesh castShadow receiveShadow material={plasticMat}>
            <boxGeometry args={[2.0, 0.025, 0.26]} />
          </mesh>
          {/* Orange anti-slip surface ridges on the slats */}
          <mesh position={[0, 0.013, 0]} material={orangeRibMat}>
            <boxGeometry args={[1.9, 0.005, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* 2. BOTTOM RUNNER SKIDS (3 longitudinal runner slats) */}
      {[-0.75, 0, 0.75].map((zPos, idx) => (
        <mesh key={`runner-${idx}`} position={[0, -0.12, zPos]} castShadow receiveShadow material={plasticMat}>
          <boxGeometry args={[2.0, 0.025, 0.22]} />
        </mesh>
      ))}

      {/* 3. SUPPORT SPACER BLOCKS (3x3 grid connecting top and bottom) */}
      {[-0.8, 0, 0.8].map((xPos) => 
        [-0.75, 0, 0.75].map((zPos) => (
          <mesh 
            key={`block-${xPos}-${zPos}`} 
            position={[xPos, 0, zPos]} 
            castShadow 
            receiveShadow 
            material={plasticMat}
          >
            <boxGeometry args={[0.24, 0.21, 0.22]} />
          </mesh>
        ))
      )}

      {/* 4. STEEL REINFORCEMENT RODS (cylinders running through spacer channels) */}
      {[-0.4, 0.4].map((zPos, idx) => (
        <mesh 
          key={`rod-${idx}`} 
          position={[0, 0, zPos]} 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow 
          material={steelMat}
        >
          <cylinderGeometry args={[0.03, 0.03, 1.8, 12]} />
        </mesh>
      ))}

      {/* 5. BRAND EMBOSS DETAILED PLATE (Orange accents on sides) */}
      <mesh position={[0.99, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={orangeRibMat}>
        <boxGeometry args={[0.3, 0.08, 0.04]} />
      </mesh>
      <mesh position={[-0.99, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={orangeRibMat}>
        <boxGeometry args={[0.3, 0.08, 0.04]} />
      </mesh>
    </group>
  );
}

export default function PalletModel() {
  const [activeHotspot, setActiveHotspot] = useState(null);

  const hotspots = [
    {
      id: 'grip',
      position: [0.3, 0.16, 0.4],
      title: 'Anti-Slip Grip',
      desc: 'High friction polymer ridges lock loads in place and prevent slide slippage during transport.',
    },
    {
      id: 'core',
      position: [0.0, 0.02, 0.4],
      title: 'Steel Reinforced Core',
      desc: 'Dual internal galvanized steel bars eliminate deflection and sagging under full dynamic load.',
    },
    {
      id: 'block',
      position: [0.8, 0.0, 0.75],
      title: 'High-Impact Blocks',
      desc: 'Heavy wall structural spacer blocks absorb shock collisions from forklift blades.',
    },
    {
      id: 'entry',
      position: [0.5, -0.06, 0.0],
      title: '4-Way Entry Fork Channels',
      desc: 'Chamfered runner entrances facilitate easy entry for both automated guided vehicles (AGVs) and manual forklifts.',
    }
  ];

  const toggleHotspot = (id) => {
    setActiveHotspot(activeHotspot === id ? null : id);
  };

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 45 }} dpr={[1, 1.5]} shadows>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} />
        <directionalLight position={[0, 8, 5]} intensity={1.0} castShadow />

        {/* 3D Scene Geometry */}
        <group position={[0, 0, 0]}>
          <PalletGeometry />
          
          {/* Render Hotspots */}
          {hotspots.map((hs) => (
            <Hotspot
              key={hs.id}
              position={hs.position}
              title={hs.title}
              desc={hs.desc}
              active={activeHotspot === hs.id}
              onToggle={() => toggleHotspot(hs.id)}
            />
          ))}
        </group>

        {/* Controls */}
        <OrbitControls 
          enableZoom={false} 
          minDistance={1.8} 
          maxDistance={5.0}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={activeHotspot === null} // Stop auto-rotate when examining a hotspot
          autoRotateSpeed={0.6}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
