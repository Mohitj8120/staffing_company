import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Detect mobile at module level
const isMobile = typeof window !== 'undefined' && (
  window.innerWidth <= 768 ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
);

function InteractiveParticles() {
  const ref = useRef();
  const { mouse, viewport } = useThree();
  
  const [positions, colors] = useMemo(() => {
    // Reduce particles on mobile for performance
    const count = isMobile ? 1500 : 4000;
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
      ref.current.rotation.y = time * 0.05;
      ref.current.rotation.x = time * 0.02;
      
      // Skip mouse interaction on mobile (no mouse)
      if (!isMobile) {
        const targetX = (mouse.x * viewport.width) / 50;
        const targetY = (mouse.y * viewport.height) / 50;
        
        ref.current.rotation.y += (targetX - ref.current.rotation.y) * 0.05;
        ref.current.rotation.x += (-targetY - ref.current.rotation.x) * 0.05;
      }
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={isMobile ? 0.1 : 0.08}
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
      meshRef.current.rotation.x = Math.sin(time / 4);
      meshRef.current.rotation.y = Math.sin(time / 2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={isMobile ? 0.8 : 1.5} floatIntensity={isMobile ? 1 : 2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={isMobile ? [1.5, 0.3, 128, 16] : [2, 0.4, 256, 32]} />
        <meshPhysicalMaterial 
          color="#00f2fe"
          emissive="#004d40"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={1}
          clearcoat={1}
          transparent
          opacity={0.15}
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
        dpr={isMobile ? [1, 1] : [1, 2]}
        // Reduce pixel ratio on mobile
      >
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 10, 30]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00f2fe" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#8a2be2" />
        
        <Stars radius={100} depth={50} count={isMobile ? 2000 : 5000} factor={4} saturation={0} fade speed={1} />
        
        <InteractiveParticles />
        <FloatingGeometry />

        {/* Only apply heavy post-processing on desktop */}
        {isMobile ? (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.3} mipmapBlur intensity={1.0} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        ) : (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={2.0} />
            <DepthOfField focusDistance={0} focalLength={0.03} bokehScale={3} height={480} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
