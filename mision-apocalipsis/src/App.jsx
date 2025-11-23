import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { AlertTriangle, Info, Shield, Clock, FastForward, Target, Rocket, Play, ChevronLeft, ChevronDown, Code, Globe, Cpu, Layers } from 'lucide-react';
import * as THREE from 'three';

// Safety fallback: avoids ReferenceError if a component accidentally references asteroidRef
const GLOBAL_ASTEROID_REF = React.createRef();

// --- ESTILOS CSS ---
const styles = `
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: #000000;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* --- PANTALLA DE BIENVENIDA (ESTRUCTURA SCROLLABLE) --- */
  .landing-wrapper {
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    scroll-behavior: smooth;
    position: relative;
    background-color: transparent;
  }

  .video-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .video-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .landing-hero {
    position: relative;
    min-height: 100vh; 
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2;
    padding-bottom: 60px;
  }

  .landing-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: white;
    padding: 20px;
  }

  .app-title {
    font-size: 4rem;
    margin-bottom: 1rem;
    background: #a55eea;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
    letter-spacing: -2px;
    text-transform: uppercase;
    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  .app-description {
    font-size: 1.2rem;
    color: #e0e0e0;
    max-width: 600px;
    margin-bottom: 3rem;
    line-height: 1.6;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  .btn-simulacion {
    padding: 15px 40px;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 20px rgba(142, 68, 173, 0.4);
  }

  .btn-simulacion:hover {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, #9b59b6 0%, #be2edd 100%);
    box-shadow: 0 15px 30px rgba(142, 68, 173, 0.6);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 20px;
    animation: bounce 2s infinite;
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9rem;
    color: #dfe4ea;
    cursor: pointer;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
    40% {transform: translateY(-10px);}
    60% {transform: translateY(-5px);}
  }

  .doc-section {
    position: relative;
    min-height: 100vh;
    background-color: #0a0a0a;
    z-index: 2;
    padding: 80px 20px;
    color: #ecf0f1;
    border-top: 1px solid #333;
    box-shadow: 0 -20px 50px rgba(0,0,0,0.8);
  }

  .doc-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .doc-title {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    text-align: center;
    background: linear-gradient(90deg, #fff, #a4b0be);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }

  .doc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .doc-card {
    background: #1e1e1e;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #333;
    transition: transform 0.3s ease;
  }

  .doc-card:hover {
    transform: translateY(-5px);
    border-color: #8e44ad;
  }

  .card-icon {
    color: #8e44ad;
    margin-bottom: 15px;
  }

  .card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: white;
  }

  .card-text {
    font-size: 0.95rem;
    color: #bdc3c7;
    line-height: 1.6;
  }

  .tech-stack {
    margin-top: 60px;
    text-align: center;
    padding: 40px;
    background: #151515;
    border-radius: 12px;
  }

  .tech-badges {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .badge {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-family: monospace;
    border: 1px solid #34495e;
  }

  .app-container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .back-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    transition: background 0.3s;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .sidebar {
    width: 320px;
    min-width: 320px;
    background-color: #1a1a1a;
    color: white;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #333;
    z-index: 10;
    overflow-y: auto;
    position: relative;
  }

  .header {
    padding: 20px;
    border-bottom: 1px solid #333;
    background: #111;
  }
  
  .header h1 {
    font-size: 1.5rem;
    color: #ff4757;
    margin: 0 0 5px 0;
    font-weight: 700;
  }
  
  .header h2 {
    font-size: 1rem;
    color: #a4b0be;
    margin: 0;
    font-weight: 400;
  }

  .datos-content {
    padding: 20px;
    flex: 1;
  }

  .control-panel {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #2f3542;
    border-radius: 8px;
    border: 1px solid #404b5a;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .slider {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: #576574;
    border-radius: 2px;
    outline: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ff4757;
    cursor: pointer;
    transition: background .15s ease-in-out;
  }
  
  .slider::-webkit-slider-thumb:hover {
    background: #ff6b81;
  }

  .data-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #2f3542;
    font-size: 0.9rem;
  }

  .data-row:last-child {
    border-bottom: none;
  }

  .simulation-container {
    flex: 1;
    position: relative;
    background-color: #000005;
  }

  .mission-control {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border: 1px solid #4a90e2;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
  }

  .mission-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #fff;
  }

  .mission-button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .mission-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  }

  .mission-button:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .trajectory-info {
    margin-top: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .success-message {
    color: #2ed573;
    font-weight: 600;
    margin-top: 10px;
    text-align: center;
  }
  
  .auto-launch-info {
    color: #4ecdc4;
    font-size: 0.8rem;
    text-align: center;
    margin-top: 8px;
    font-weight: 600;
  }

  .waiting-for-target {
    color: #ffa502;
    font-size: 0.8rem;
    text-align: center;
    margin-top: 8px;
    font-weight: 600;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  .view-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.7);
    padding: 8px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .view-button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .view-button-3d {
    background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
    color: white;
  }

  .view-button-2d {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
  }

  .view-button-active {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }

  .view-button:not(.view-button-active):hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  .waiting-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    background: rgba(0,0,0,0.7);
    color: #ffdca3;
    padding: 14px 20px;
    border-radius: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    text-align: center;
    font-size: 14px;
  }
`;

// --- SHADERS AVANZADOS ---
const AtmosphereMaterial = {
  uniforms: {
    c: { type: "f", value: 1.0 },
    p: { type: "f", value: 3.0 },
    glowColor: { type: "c", value: new THREE.Color(0x3399ff) },
    viewVector: { type: "v3", value: new THREE.Vector3() }
  },
  vertexShader: `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4(glow, 1.0);
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
};

const SunMaterial = {
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color('#ffaa00') },
    color2: { value: new THREE.Color('#ff4500') }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;

    float noise(vec3 p) {
      return sin(p.x * 10.0 + time) * sin(p.y * 10.0 + time) * sin(p.z * 10.0 + time);
    }

    void main() {
      float n = noise(vPosition + time * 0.2);
      vec3 finalColor = mix(color1, color2, n * 0.5 + 0.5);
      float brightness = 1.2;
      gl_FragColor = vec4(finalColor * brightness, 1.0);
    }
  `
};

// --- DATOS DEL ASTEROIDE ---
const dataDelPython = {
  "Nombre": "4179 Toutatis (1989 AC)",
  "Diametro": 5.4,            
  "MOID": 0.00651,            
  "Semieje_a": 2.543,         
  "Excentricidad_e": 0.6247,  
  "Inclinacion_i": 0.45,      
  "Nodo_Asc_om": 125.37,
  "Arg_Perihelio_w": 277.86,
  "Anomalia_Med_ma": 76.89,
  "Epoca": 2461000.5
};

// Datos originales (trayectoria de colisión)
const dataOriginal = dataDelPython;

// Datos "Post-Impacto" (trayectoria segura)
const dataDeflectedOrbit = {
  ...dataOriginal,
  Inclinacion_i: dataOriginal.Inclinacion_i + 8.0,
  Nodo_Asc_om: dataOriginal.Nodo_Asc_om - 5.0,
  Semieje_a: dataOriginal.Semieje_a + 0.2
};

// --- FUNCIONES DE ORBITA ---
const getOrbitPoints = (a, e, i_deg, om_deg, w_deg, steps = 300) => {
  const sm_a = parseFloat(a);
  const ecc = parseFloat(e);
  const i = (parseFloat(i_deg) * Math.PI) / 180;
  const om = (parseFloat(om_deg) * Math.PI) / 180;
  const w = (parseFloat(w_deg) * Math.PI) / 180;

  const points = [];
  for (let angle = 0; angle <= 360; angle += (360 / steps)) {
    const M = (angle * Math.PI) / 180;
    let E = M;
    for (let j = 0; j < 8; j++) {
      E = M + ecc * Math.sin(E);
    }
    const P = sm_a * (Math.cos(E) - ecc);
    const Q = sm_a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
    const x = P * (Math.cos(w) * Math.cos(om) - Math.sin(w) * Math.sin(om) * Math.cos(i)) -
      Q * (Math.sin(w) * Math.cos(om) + Math.cos(w) * Math.sin(om) * Math.cos(i));
    const y = P * (Math.cos(w) * Math.sin(om) + Math.sin(w) * Math.cos(om) * Math.cos(i)) -
      Q * (Math.sin(w) * Math.sin(om) - Math.cos(w) * Math.cos(om) * Math.cos(i));
    const z = P * (Math.sin(w) * Math.sin(i)) +
      Q * (Math.cos(w) * Math.sin(i));
    const SCALE = 5;
    points.push([x * SCALE, z * SCALE, y * SCALE]);
  }
  return points;
};

// --- COMPONENTES 3D (Simulador) ---

function StarField({ count = 3000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      p[i] = (Math.random() - 0.5) * 800;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.6} color="#ffffff" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function RealisticSun() {
  const mesh = useRef();
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <group>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          args={[SunMaterial]}
        />
      </mesh>
      <pointLight distance={300} intensity={2.5} color="#fff0d0" decay={1} />
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function RealisticEarth({ speedMultiplier, onPositionUpdate }) {
  const earthRadiusScale = 5;
  const earthRef = useRef();
  const angleRef = useRef(0);

  const orbitPoints = useMemo(() => {
    const points = [];
    const steps = 128;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      points.push([
        Math.cos(angle) * earthRadiusScale,
        0,
        Math.sin(angle) * earthRadiusScale
      ]);
    }
    return points;
  }, [earthRadiusScale]);

  useFrame((_, delta) => {
    const baseSpeed = 0.5;
    angleRef.current += delta * baseSpeed * speedMultiplier;

    const x = Math.cos(angleRef.current) * earthRadiusScale;
    const z = Math.sin(angleRef.current) * earthRadiusScale;

    if (earthRef.current) {
      earthRef.current.position.x = x;
      earthRef.current.position.z = z;
      earthRef.current.rotation.y += 0.005;

      if (onPositionUpdate) {
        onPositionUpdate([x, 0, z]);
      }
    }
  });

  return (
    <>
      <Line
        points={orbitPoints}
        color="white"
        opacity={0.15}
        transparent
        lineWidth={1}
      />

      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[0.3, 64, 64]} />
          <meshPhongMaterial
            color="#1e4e8c"
            emissive="#000011"
            specular="#111111"
            shininess={20}
          />
        </mesh>
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[0.3, 64, 64]} />
          <shaderMaterial
            attach="material"
            args={[AtmosphereMaterial]}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            transparent
          />
        </mesh>
        <Html distanceFactor={20} position={[0, 0.5, 0]}>
          <div style={{
            backgroundColor: 'rgba(30, 78, 140, 0.8)',
            color: '#e0f2ff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            border: '1px solid #4a90e2',
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(4px)'
          }}>
            Tierra
          </div>
        </Html>
      </group>
    </>
  );
}

// Usamos React.memo para evitar que el misil se re-renderice
const Missile = React.memo(({ targetPosition, onDetonation, isLaunched, asteroidRef, earthPosition }) => {
  const missileRef = useRef();
  const detonated = useRef(false);
  const hasLaunched = useRef(false);

  useFrame((state, delta) => {
    if (!isLaunched || !missileRef.current || detonated.current) return;

    const missile = missileRef.current;
    
    // Obtener posición actual del objetivo (Asteroide)
    const asteroidPos = new THREE.Vector3();
    if (asteroidRef && asteroidRef.current) {
      asteroidRef.current.getWorldPosition(asteroidPos);
    } else {
      asteroidPos.set(...targetPosition);
    }

    // --- FASE DE LANZAMIENTO (Solo corre 1 vez) ---
    if (!hasLaunched.current) {
      // Si earthPosition viene como array [x,y,z] o Vector3, lo manejamos
      const earthPosVec = Array.isArray(earthPosition)
        ? new THREE.Vector3(...earthPosition)
        : new THREE.Vector3(0, 0, 0);

      // Vector de dirección Tierra -> Asteroide
      const directionToTarget = new THREE.Vector3().subVectors(asteroidPos, earthPosVec).normalize();

      // SPAWN: Salir ya desde la atmósfera (radio 0.3 + offset)
      const SPAWN_OFFSET = 1.0;
      const spawnPos = earthPosVec.clone().add(directionToTarget.multiplyScalar(SPAWN_OFFSET));

      missile.position.copy(spawnPos);
      missile.lookAt(asteroidPos);

      missile.visible = true; // Hacemos visible el misil ahora
      hasLaunched.current = true;
      return;
    }

    // --- FASE DE VUELO ---
    const currentPos = missile.position.clone();
    const direction = new THREE.Vector3().subVectors(asteroidPos, currentPos).normalize();
    const distanceToTarget = currentPos.distanceTo(asteroidPos);

    // Detonación por proximidad
    if (distanceToTarget < 1.5) {
      detonated.current = true;
      missile.visible = false;
      if (onDetonation) onDetonation(currentPos);
    } else {
      // Movimiento guiado
      const speed = 45;
      missile.position.add(direction.multiplyScalar(speed * delta));
      missile.lookAt(asteroidPos);
    }
  });

  // Resetear flags si la simulación se reinicia externamente
  useEffect(() => {
    if (!isLaunched) {
      hasLaunched.current = false;
      detonated.current = false;
      if (missileRef.current) missileRef.current.visible = false;
    }
  }, [isLaunched]);

  // Render inicial invisible (se hace visible en el useFrame)
  if (!isLaunched) return null;

  return (
    <group ref={missileRef} visible={false}>
      {/* Cuerpo del misil */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#dfe6e9" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Aletas */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.3, 0.02, 0.1]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
      <mesh position={[0, 0, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.3, 0.02, 0.1]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
      {/* Motor (Luz y forma) */}
      <mesh position={[0, 0, 0.35]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff7675" />
      </mesh>
      <pointLight position={[0, 0, 0.4]} color="orange" intensity={2} distance={3} decay={2} />
    </group>
  );
});

function Explosion({ position, onComplete }) {
  const mesh = useRef();

  useFrame((_, delta) => {
    if (mesh.current) {
      // Expansión rápida
      mesh.current.scale.x += delta * 15;
      mesh.current.scale.y += delta * 15;
      mesh.current.scale.z += delta * 15;

      // Desvanecimiento
      mesh.current.material.opacity -= delta * 1.5;

      if (mesh.current.material.opacity <= 0) {
        onComplete();
      }
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="#ffaa00" transparent opacity={1} />
      <pointLight color="#ff5500" intensity={10} distance={20} />
    </mesh>
  );
}

function AsteroidOrbit({ speedMultiplier, isDeflected, onAsteroidUpdate, asteroidRef, onDistanceUpdate }) {
  // 1. Calculamos la órbita ORIGINAL (Roja/Peligro)
  const pointsOriginal = useMemo(() =>
    getOrbitPoints(dataOriginal.Semieje_a, dataOriginal.Excentricidad_e, dataOriginal.Inclinacion_i, dataOriginal.Nodo_Asc_om, dataOriginal.Arg_Perihelio_w),
    []
  );

  // 2. Calculamos la órbita DESVIADA (Verde/Segura)
  const pointsDeflected = useMemo(() =>
    getOrbitPoints(dataDeflectedOrbit.Semieje_a, dataDeflectedOrbit.Excentricidad_e, dataDeflectedOrbit.Inclinacion_i, dataDeflectedOrbit.Nodo_Asc_om, dataDeflectedOrbit.Arg_Perihelio_w),
    []
  );

  const internalAsteroidRef = useRef();
  const progressRef = useRef(0);
  const blendFactor = useRef(0);

  const actualRef = asteroidRef || internalAsteroidRef;

  useFrame((_, delta) => {
    const baseSpeed = 0.05;
    progressRef.current = (progressRef.current + delta * baseSpeed * speedMultiplier) % 1;
    const idx = Math.floor(progressRef.current * pointsOriginal.length);

    // Obtener puntos de ambas órbitas para interpolar
    const posA = pointsOriginal[idx] || pointsOriginal[0];
    const posB = pointsDeflected[idx] || pointsDeflected[0];

    if (posA && posB && actualRef.current) {
      const vecA = new THREE.Vector3(...posA);
      const vecB = new THREE.Vector3(...posB);

      if (isDeflected) {
        // Transición suave (Lerp)
        blendFactor.current = Math.min(blendFactor.current + delta * 0.5, 1);
      } else {
        blendFactor.current = 0;
      }

      // Interpolación suave entre órbita A y B
      const finalPosVec = new THREE.Vector3().lerpVectors(vecA, vecB, blendFactor.current);

      actualRef.current.position.copy(finalPosVec);
      actualRef.current.rotation.x += 0.01;
      actualRef.current.rotation.y += 0.02;

      // Throttle para updates de React
      if (Math.random() > 0.8) {
        if (onAsteroidUpdate) onAsteroidUpdate([finalPosVec.x, finalPosVec.y, finalPosVec.z]);
        if (onDistanceUpdate) onDistanceUpdate(finalPosVec.length());
      }
    }
  });

  const asteroidColor = isDeflected ? "#2ed573" : "#888888";

  return (
    <>
      <Line points={pointsOriginal} color="#ff4757" lineWidth={1} opacity={0.3} transparent />
      {isDeflected && (
        <Line points={pointsDeflected} color="#2ed573" lineWidth={1} opacity={0.6} transparent />
      )}
      <mesh ref={actualRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={asteroidColor} roughness={0.8} metalness={0.2} emissive={isDeflected ? new THREE.Color(0x2ed573).multiplyScalar(0.3) : new THREE.Color(0x000000)} />
        <Html distanceFactor={30}>
          <div style={{
            backgroundColor: isDeflected ? 'rgba(46, 213, 115, 0.8)' : 'rgba(255, 71, 87, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: `1px solid ${isDeflected ? '#2ed573' : '#ff4757'}`,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease'
          }}>
            <AlertTriangle size={12} />
            {dataOriginal.Nombre} {isDeflected && '✓'}
          </div>
        </Html>
      </mesh>
    </>
  );
}

// --- COMPONENTE DE SIMULACIÓN ---
function Simulation({ onBack, currentView, onViewChange, simulationStarted }) {
  const data = dataDelPython; // Necesario para la UI lateral
  const asteroidRef = useRef();

  const [speed, setSpeed] = useState(1);
  const [isDeflected, setIsDeflected] = useState(false);
  const [missileLaunched, setMissileLaunched] = useState(false);
  const [asteroidPosition, setAsteroidPosition] = useState([50, 0, 0]);
  const [missionStatus, setMissionStatus] = useState('ready');
  const [asteroidDistance, setAsteroidDistance] = useState(100);
  const [earthPosition, setEarthPosition] = useState([5, 0, 0]);
  const [autoLaunchArmed, setAutoLaunchArmed] = useState(false);
  const [explosionPos, setExplosionPos] = useState(null);
  const [launchPending, setLaunchPending] = useState(false);

  // Constantes de distancia para auto-lanzamiento
  const LAUNCH_THRESHOLD = 30; 
  const LAUNCH_RENDER_DISTANCE = 8; 

  const calculateDistanceToEarth = (asteroidPos) => {
    const earthPos = new THREE.Vector3(...earthPosition);
    const asteroidVec = new THREE.Vector3(...asteroidPos);
    return earthPos.distanceTo(asteroidVec);
  };

  const currentDistance = useMemo(() => {
    return calculateDistanceToEarth(asteroidPosition);
  }, [asteroidPosition, earthPosition]);

  useEffect(() => {
    // Lógica de "Pendiente" (aviso visual)
    if (autoLaunchArmed && currentDistance < LAUNCH_THRESHOLD && missionStatus === 'armed' && !missileLaunched) {
      setLaunchPending(true);
    }

    // Lógica de Lanzamiento Automático
    if (
      autoLaunchArmed &&
      missionStatus === 'armed' &&
      currentDistance < LAUNCH_RENDER_DISTANCE &&
      !missileLaunched
    ) {
      setMissileLaunched(true);
      setMissionStatus('launched');
      setLaunchPending(false);
    }
  }, [autoLaunchArmed, currentDistance, missionStatus, missileLaunched, launchPending]);

  const handleArmMissile = () => {
    if (!simulationStarted) return;
    if (missionStatus === 'ready') {
      setMissionStatus('armed');
      setAutoLaunchArmed(true);
    } else if (missionStatus === 'success') {
      setIsDeflected(false);
      setMissileLaunched(false);
      setMissionStatus('ready');
      setAutoLaunchArmed(false);
    }
  };

  const handleDetonation = (position) => {
    setMissileLaunched(false);
    setExplosionPos(position);
    setTimeout(() => {
      setIsDeflected(true);
      setMissionStatus('success');
      setAutoLaunchArmed(false);
    }, 200);
  };

  const getButtonText = () => {
    switch (missionStatus) {
      case 'ready': return 'ARMAR SISTEMA DE AUTO-LANZAMIENTO';
      case 'armed': return 'SISTEMA ARMADO - ESPERANDO OBJETIVO';
      case 'launched': return 'MISIL EN CAMINO...';
      case 'success': return 'REINICIAR SIMULACIÓN';
      default: return 'ARMAR SISTEMA';
    }
  };

  const getStatusMessage = () => {
    if (missionStatus === 'armed') {
      if (launchPending) return <div className="auto-launch-info">OBJETIVO EN RANGO - PREPARANDO LANZAMIENTO...</div>;
      return <div className="waiting-for-target">ESPERANDO QUE EL ASTEROIDE SE ACERQUE...</div>;
    }
    if (missionStatus === 'launched') return <div className="auto-launch-info">MISIL EN CAMINO HACIA EL OBJETIVO</div>;
    if (missionStatus === 'success') return <div className="success-message">✓ MISIÓN EXITOSA - ASTEROIDE DESVIADO</div>;
    return null;
  };

  return (
    <div className="app-container">

      {/* BOTONES DE CAMBIO DE VISTA */}
      <div className="view-toggle">
        <button
          className={`view-button view-button-3d ${currentView === '3D' ? 'view-button-active' : ''}`}
          onClick={() => onViewChange('3D')}
        >
          🌌 3D
        </button>
        <button
          className={`view-button view-button-2d ${currentView === '2D' ? 'view-button-active' : ''}`}
          onClick={() => onViewChange('2D')}
        >
          📊 2D
        </button>
      </div>

      {/* SIDEBAR */}
      <div className="sidebar">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={14} /> Volver al Inicio
        </button>
        <div className="header" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Shield style={{ color: '#ff4757' }} size={24} />
            <h1>Alerta de Impacto</h1>
          </div>
          <h2>Parámetros Orbitales</h2>
        </div>

        <div className="datos-content">
          <div className="data-row">
            <span style={{ color: '#a4b0be' }}>Objeto:</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{data.Nombre}</span>
          </div>
          <div className="data-row">
            <span style={{ color: '#a4b0be' }}>Diámetro:</span>
            <span style={{ color: '#ffa502', fontWeight: 'bold' }}>{data.Diametro} km</span>
          </div>
          <div className="data-row">
            <span style={{ color: '#a4b0be' }}>MOID:</span>
            <span style={{ color: '#ff4757', fontWeight: 'bold' }}>{data.MOID} AU</span>
          </div>

          <div className="mission-control">
            <div className="mission-title">
              <Target size={20} />
              Sistema de Defensa
            </div>

            <div style={{ marginBottom: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
              <div style={{ color: '#a4b0be', marginBottom: '4px' }}>
                Distancia a la Tierra: <strong>{currentDistance.toFixed(1)}</strong> unidades
              </div>
              <div style={{ color: '#a4b0be' }}>
                Rango de lanzamiento: <strong>25</strong> unidades
              </div>
            </div>

            {getStatusMessage()}

            <button
              className="mission-button"
              onClick={handleArmMissile}
              disabled={missionStatus === 'launched' || missionStatus === 'armed' || !simulationStarted}
              style={{ opacity: (missionStatus === 'launched' || missionStatus === 'armed' || !simulationStarted) ? 0.7 : 1 }}
            >
              <Rocket size={16} />
              {getButtonText()}
            </button>
            <div className="trajectory-info">
              <div><strong>Estado:</strong> {isDeflected ? 'DESVIADO' : missionStatus === 'armed' ? 'ARMADO' : 'LISTO'}</div>
              <div><strong>Auto-lanzamiento:</strong> {autoLaunchArmed ? 'ACTIVADO' : 'DESACTIVADO'}</div>
            </div>
          </div>

          <div className="control-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#a4b0be', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Velocidad de Tiempo
              </div>
              <span style={{ color: '#ffa502', fontFamily: 'monospace' }}>x{speed.toFixed(1)}</span>
            </div>
            <div className="slider-container">
              <span style={{ fontSize: '12px', color: '#666' }}>0</span>
              <input
                type="range" min="0" max="5" step="0.1" value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="slider"
              />
              <FastForward size={14} style={{ color: '#666' }} />
            </div>
          </div>
        </div>
      </div>

      {/* SCENE 3D */}
      <div className="simulation-container">
        {missionStatus === 'armed' && !missileLaunched && (
          <div className="waiting-overlay">
            {launchPending ? 'OBJETIVO EN RANGO - PREPARANDO LANZAMIENTO...' : 'ESPERANDO QUE EL ASTEROIDE ENTRE EN RANGO PARA LANZAR...'}
          </div>
        )}
        <Canvas camera={{ position: [0, 60, 120], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <ambientLight intensity={0.05} />
          <StarField />
          <RealisticSun />
          <RealisticEarth speedMultiplier={speed} onPositionUpdate={setEarthPosition} />
          <AsteroidOrbit
            speedMultiplier={speed}
            isDeflected={isDeflected}
            onAsteroidUpdate={setAsteroidPosition}
            onDistanceUpdate={setAsteroidDistance}
            asteroidRef={asteroidRef}
          />

          {missileLaunched && (
            <Missile
              targetPosition={asteroidPosition}
              onDetonation={handleDetonation}
              isLaunched={missileLaunched}
              asteroidRef={asteroidRef}
              earthPosition={earthPosition}
            />
          )}

          {explosionPos && (
            <Explosion
              position={explosionPos}
              onComplete={() => setExplosionPos(null)}
            />
          )}

          <OrbitControls minDistance={5} maxDistance={500} />
          <gridHelper args={[200, 50, 0x222222, 0x111111]} position={[0, -2, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

// --- COMPONENTE DE SIMULACIÓN 2D ---
function Simulation2D({ onBack, currentView, onViewChange, simulationStarted }) {
  const [speed, setSpeed] = useState(1);
  const [isDeflected, setIsDeflected] = useState(false);
  const [missileLaunched, setMissileLaunched] = useState(false);
  const [missionStatus, setMissionStatus] = useState('ready');
  const [autoLaunchArmed, setAutoLaunchArmed] = useState(false);

  const LAUNCH_THRESHOLD_2D = 150;

  const canvasRef = useRef();
  const animationRef = useRef();
  const earthPosRef = useRef({ x: 400, y: 300 });
  const asteroidPosRef = useRef({ x: 100, y: 100 });
  const missilePosRef = useRef({ x: 400, y: 300 });
  const progressRef = useRef(0);

  const [displayDistance, setDisplayDistance] = useState(100);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const ctx = canvas.getContext('2d');

    const renderLoop = () => {
      ctx.fillStyle = '#000005';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawStars(ctx);
      drawOrbits(ctx);

      const time = Date.now() * 0.001 * speed;
      earthPosRef.current.x = 400 + Math.cos(time * 0.5) * 120;
      earthPosRef.current.y = 300 + Math.sin(time * 0.5) * 120;

      progressRef.current += 0.0005 * speed;
      const angle = progressRef.current * Math.PI * 2;
      const a = 280;
      const b = 180;
      const centerX = 400 - 80;
      const asteroidX = centerX + Math.cos(angle) * a;
      const asteroidY = 300 + Math.sin(angle) * b;

      if (isDeflected) {
        asteroidPosRef.current.x = asteroidX + 60;
        asteroidPosRef.current.y = asteroidY - 40;
      } else {
        asteroidPosRef.current.x = asteroidX;
        asteroidPosRef.current.y = asteroidY;
      }

      if (missileLaunched) {
        const dx = asteroidPosRef.current.x - missilePosRef.current.x;
        const dy = asteroidPosRef.current.y - missilePosRef.current.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        if (distToTarget < 20) {
          handleMissileImpact();
        } else {
          const velocity = 3 * speed;
          missilePosRef.current.x += (dx / distToTarget) * velocity;
          missilePosRef.current.y += (dy / distToTarget) * velocity;
        }
      } else {
        missilePosRef.current.x = earthPosRef.current.x;
        missilePosRef.current.y = earthPosRef.current.y;
      }

      drawEarth(ctx, earthPosRef.current.x, earthPosRef.current.y);
      drawAsteroid(ctx, asteroidPosRef.current.x, asteroidPosRef.current.y, isDeflected);

      if (missileLaunched) {
        drawMissile(ctx, missilePosRef.current.x, missilePosRef.current.y);
      }

      drawInfo(ctx);

      const distEarthAsteroid = Math.sqrt(
        Math.pow(asteroidPosRef.current.x - earthPosRef.current.x, 2) +
        Math.pow(asteroidPosRef.current.y - earthPosRef.current.y, 2)
      );

      frameCountRef.current++;
      if (frameCountRef.current > 10) {
        setDisplayDistance(distEarthAsteroid);
        frameCountRef.current = 0;
      }

      if (autoLaunchArmed && missionStatus === 'armed' && !missileLaunched && distEarthAsteroid < LAUNCH_THRESHOLD_2D) {
        setMissileLaunched(true);
        setMissionStatus('launched');
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [speed, isDeflected, missileLaunched, missionStatus, autoLaunchArmed]);

  const handleMissileImpact = () => {
    setMissileLaunched(false);
    setIsDeflected(true);
    setMissionStatus('success');
    setAutoLaunchArmed(false);
  };

  const handleArmToggle = () => {
    if (missionStatus === 'ready') {
      setMissionStatus('armed');
      setAutoLaunchArmed(true);
    } else if (missionStatus === 'success') {
      setMissionStatus('ready');
      setIsDeflected(false);
      setMissileLaunched(false);
      setAutoLaunchArmed(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000005' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="view-toggle">
        <button
          className={`view-button view-button-3d ${currentView === '3D' ? 'view-button-active' : ''}`}
          onClick={() => onViewChange('3D')}
        >
          🌌 3D
        </button>
        <button
          className={`view-button view-button-2d ${currentView === '2D' ? 'view-button-active' : ''}`}
          onClick={() => onViewChange('2D')}
        >
          📊 2D
        </button>
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '10px',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '8px' }}>
            <Shield style={{ color: '#ff4757' }} size={24} />
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>Vista Táctica 2D</h1>
          </div>
          <button
            className="back-button"
            onClick={onBack}
            style={{ pointerEvents: 'auto', marginLeft: 'auto' }}
          >
            <ChevronLeft size={14} /> Volver al Inicio
          </button>
        </div>
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          width: '280px',
          background: 'rgba(20, 20, 20, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #333',
          pointerEvents: 'auto'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#a4b0be' }}>
            Distancia Tierra-Obj: <strong style={{ color: displayDistance < 150 ? '#ff4757' : 'white' }}>{displayDistance.toFixed(1)} km</strong>
          </div>
          <div style={{
            padding: '10px',
            background: missionStatus === 'success' ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 71, 87, 0.1)',
            borderRadius: '6px',
            border: missionStatus === 'success' ? '1px solid #2ed573' : '1px solid #ff4757',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold', color: missionStatus === 'success' ? '#2ed573' : '#ff4757', marginBottom: '5px' }}>
              ESTADO: {missionStatus.toUpperCase()}
            </div>
            {missionStatus === 'armed' && <div className="waiting-for-target">RADAR ACTIVO</div>}
          </div>
          <button
            className="mission-button"
            onClick={handleArmToggle}
            disabled={missionStatus === 'launched'}
            style={{ opacity: missionStatus === 'launched' ? 0.5 : 1 }}
          >
            <Rocket size={16} />
            {missionStatus === 'success' ? 'REINICIAR SISTEMA' : (missionStatus === 'armed' ? 'DESARMAR' : 'ARMAR INTERCEPTOR')}
          </button>
          <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a4b0be', fontSize: '0.8rem', marginBottom: '5px' }}>
              <Clock size={12} /> Velocidad Simulación (x{speed})
            </div>
            <input
              type="range" min="0" max="5" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="slider"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PANTALLA DE BIENVENIDA ---
function LandingPage({ onStart }) {
  const scrollToDocs = () => {
    document.getElementById('tech-docs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-wrapper">
      <video
        className="video-bg"
        autoPlay
        loop
        playsInline
        src='./videobackground.mp4'
        muted
      />
      <div className="video-overlay"></div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="landing-hero">
        <div className="landing-content">
          <h1 className="app-title">Misión Apocalipsis</h1>
          <p className="app-description text-size-xl">
            <strong>Cosmo Coders</strong><br />
            Equipo 5
          </p>
          <button className="btn-simulacion" onClick={onStart}>
            <Play size={24} fill="white" />
            Iniciar Simulación
          </button>

          <div style={{
            marginTop: '2rem',
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#dfe4ea' }}>
              <strong>Sistema de Defensa Planetaria</strong><br />
              Simula el desvío de asteroides potencialmente peligrosos usando tecnología de impacto cinético.
              Podrás cambiar entre vista 3D inmersiva y 2D analítica desde el simulador.
            </p>
          </div>
        </div>

        <div className="scroll-indicator" onClick={scrollToDocs}>
          <span>Documentación</span>
          <ChevronDown size={24} />
        </div>
      </div>

      {/*DOCUMENTACIÓN TÉCNICA */}
      <div id="tech-docs" className="doc-section">
        <div className="doc-container">
          <h2 className="doc-title">Documentación Técnica</h2>

          <div className="doc-grid">
            <div className="doc-card">
              <Code size={32} className="card-icon" />
              <div className="card-title">Arquitectura Frontend</div>
              <p className="card-text">
                Desarrollado como una Single Page Application (SPA) utilizando <strong>React 18</strong>. La gestión de estados complejos se maneja mediante hooks personalizados (useState, useEffect, useRef) para garantizar un rendimiento óptimo en la renderización 3D.
              </p>
            </div>

            <div className="doc-card">
              <Globe size={32} className="card-icon" />
              <div className="card-title">Motor 3D & Física</div>
              <p className="card-text">
                Implementado sobre <strong>Three.js</strong> via <strong>React Three Fiber</strong>. El motor orbital calcula posiciones en tiempo real basándose en los Elementos Keplerianos (semieje mayor, excentricidad, inclinación, etc.) para una precisión astronómica.
              </p>
            </div>

            <div className="doc-card">
              <Cpu size={32} className="card-icon" />
              <div className="card-title">Shaders GLSL</div>
              <p className="card-text">
                Utilizamos <strong>Shaders GLSL</strong> personalizados para el renderizado del Sol (efecto de plasma procedural) y la atmósfera terrestre (dispersión de luz y efecto Fresnel), superando las limitaciones de los materiales estándar de WebGL.
              </p>
            </div>

            <div className="doc-card">
              <Layers size={32} className="card-icon" />
              <div className="card-title">Sistema de Defensa</div>
              <p className="card-text">
                Algoritmos de detección de colisiones y cálculo vectorial para la intercepción de misiles. El sistema evalúa la trayectoria del asteroide y dispara contramedidas cinéticas calculadas para desviar la órbita sin fragmentar el objeto.
              </p>
            </div>
          </div>

          <div className="tech-stack">
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Stack Tecnológico</h3>
            <div className="tech-badges">
              <span className="badge">React</span>
              <span className="badge">Three.js</span>
              <span className="badge">React Three Fiber</span>
              <span className="badge">Drei</span>
              <span className="badge">Lucide Icons</span>
              <span className="badge">GLSL Shaders</span>
              <span className="badge">Vector Math</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- APP PRINCIPAL ---
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [simulationView, setSimulationView] = useState('3D');
  const [simulationStarted, setSimulationStarted] = useState(false);

  useEffect(() => {
    if (currentView.startsWith('simulation')) {
      if (simulationView === '3D' && currentView !== 'simulation3D') {
        setCurrentView('simulation3D');
      } else if (simulationView === '2D' && currentView !== 'simulation2D') {
        setCurrentView('simulation2D');
      }
    }
  }, [simulationView, currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'simulation3D':
        return (
          <Simulation
            onBack={() => {
              setCurrentView('landing');
              setSimulationStarted(false);
            }}
            currentView={simulationView}
            onViewChange={setSimulationView}
            simulationStarted={simulationStarted}
          />
        );
      case 'simulation2D':
        return (
          <Simulation2D
            onBack={() => {
              setCurrentView('landing');
              setSimulationStarted(false);
            }}
            currentView={simulationView}
            onViewChange={setSimulationView}
            simulationStarted={simulationStarted}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage
            onStart={() => {
              setCurrentView('simulation3D');
              setSimulationView('3D');
              setSimulationStarted(true);
            }}
          />
        );
    }
  };

  // Error boundary to avoid a blank screen on runtime errors and allow a graceful reset
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error('ErrorBoundary caught:', error, info);
      this.setState({ info });
    }
    render() {
      if (!this.state.hasError) return this.props.children;
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', color: '#fff', zIndex: 9999, padding: 20, textAlign: 'center'
        }}>
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ marginTop: 0 }}>Se produjo un error en la simulación</h2>
            <p>Por favor, vuelve a la pantalla principal o revisa la consola para más detalles.</p>
            <pre style={{ textAlign: 'left', maxHeight: 200, overflow: 'auto', background: '#111', padding: 10, borderRadius: 6 }}>
              {this.state.error && this.state.error.toString()}
              {this.state.info && '\n' + (this.state.info.componentStack || '')}
            </pre>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => { this.setState({ hasError: false, error: null, info: null }); if (this.props.onReset) this.props.onReset(); }} style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <style>{styles}</style>
      <ErrorBoundary onReset={() => { setCurrentView('landing'); setSimulationView('3D'); }}>
        {renderView()}
      </ErrorBoundary>
    </>
  );
}

export default App;

// --- FUNCIONES AUXILIARES DE DIBUJO 2D ---
const drawStars = (ctx) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
};

const drawOrbits = (ctx) => {
  const cx = 400;
  const cy = 300;
  ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 120, 120, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 71, 87, 0.2)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(cx - 80, cy, 280, 180, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffaa00';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ffaa00';
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
};

const drawEarth = (ctx, x, y) => {
  ctx.fillStyle = '#1e4e8c';
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a90e2';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('Tierra', x - 15, y - 15);
};

const drawAsteroid = (ctx, x, y, isDeflected) => {
  ctx.fillStyle = isDeflected ? '#2ed573' : '#a4b0be';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  if (!isDeflected) {
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

const drawMissile = (ctx, x, y) => {
  ctx.fillStyle = '#ffa502';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 165, 2, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 5, y - 5);
  ctx.stroke();
};

const drawInfo = (ctx) => {
  // Vacío, solo para evitar crash.
};