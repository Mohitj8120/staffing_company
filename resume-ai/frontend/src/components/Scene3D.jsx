import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Detect mobile/tablet or low-end screen size
const isMobile = typeof window !== 'undefined' && (
  window.innerWidth <= 768 ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
);

function InteractiveParticles() {
  const ref = useRef();
  const { mouse, viewport } = useThree();
  
  const [positions, colors] = useMemo(() => {
    // Significantly reduce particle count for buttery-smooth performance
    const count = isMobile ? 800 : 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color1 = new THREE.Color("#8a2be2");
    const color2 = new THREE.Color("#00f2fe");
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 8 + (Math.random() * 4);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      tempColor.lerpColors(color1, color2, Math.random());
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = time * 0.03;
      ref.current.rotation.x = time * 0.01;
      
      if (!isMobile) {
        const targetX = (mouse.x * viewport.width) / 60;
        const targetY = (mouse.y * viewport.height) / 60;
        
        ref.current.rotation.y += (targetX - ref.current.rotation.y) * 0.03;
        ref.current.rotation.x += (-targetY - ref.current.rotation.x) * 0.03;
      }
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={isMobile ? 0.08 : 0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time / 5) * 0.5;
      meshRef.current.rotation.y = Math.sin(time / 3) * 0.5;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={isMobile ? 0.5 : 1.0}>
      <mesh ref={meshRef}>
        {/* Reduce segments: lower poly count is faster and gives a cooler matrix/digital aesthetic */}
        <torusKnotGeometry args={isMobile ? [1.2, 0.25, 48, 8] : [1.8, 0.35, 96, 16]} />
        <meshStandardMaterial 
          color="#00f2fe"
          emissive="#8a2be2"
          emissiveIntensity={1.2}
          roughness={0.4}
          metalness={0.8}
          transparent
          opacity={0.25}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 45 }} 
        // Cap dpr at 1.5 on high-res monitors. 2.0+ is a massive GPU bottleneck with zero visual difference
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 10, 25]} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00f2fe" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#8a2be2" />
        
        {/* Lower star count to prevent vertex overhead */}
        <Stars radius={80} depth={40} count={isMobile ? 800 : 2500} factor={3} saturation={0} fade speed={0.8} />
        
        <InteractiveParticles />
        <FloatingGeometry />

        {/* Removed heavy DepthOfField (blur calculations on every frame are absolute performance killers) */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={isMobile ? 1.0 : 1.8} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
