import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, shaderMaterial } from '@react-three/drei';
import { AlertTriangle, Info, Shield, Clock, FastForward } from 'lucide-react';
import * as THREE from 'three';

// --- ESTILOS CSS INCRUSTADOS ---
const styles = `
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: #000000;
    overflow: hidden;
  }

  .app-container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
`;

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
      vec3 vNormel = normalize(normalMatrix * viewVector);
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

// 2. Shader del Sol (Plasma Animado)
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

// --- DATOS DEL PYTHON (INTEGRADOS) ---
const dataDelPython = {
  "Nombre": "109P/Swift-Tuttle",
  "Diametro": 26.0,
  "MOID": 0.000892,
  "Semieje_a": 26.09,
  "Excentricidad_e": 0.9632,
  "Inclinacion_i": 113.45,
  "Nodo_Asc_om": 139.38,
  "Arg_Perihelio_w": 152.98,
  "Anomalia_Med_ma": 7.63,
  "Epoca": 2450000.5
};

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

// --- COMPONENTES 3D ---

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

function RealisticEarth({ speedMultiplier }) {
  const earthRadiusScale = 5;
  const earthRef = useRef();
  const angleRef = useRef(0); // Acumulador de ángulo propio

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
    // Velocidad base de la tierra: 0.5
    const baseSpeed = 0.5;

    // Acumulamos el ángulo usando el delta time para evitar saltos al cambiar el slider
    angleRef.current += delta * baseSpeed * speedMultiplier;

    const x = Math.cos(angleRef.current) * earthRadiusScale;
    const z = Math.sin(angleRef.current) * earthRadiusScale;

    if (earthRef.current) {
      earthRef.current.position.x = x;
      earthRef.current.position.z = z;
      // Rotación del planeta sobre sí mismo
      earthRef.current.rotation.y += 0.005;
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
          <div className="bg-blue-900/80 text-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-500 pointer-events-none select-none backdrop-blur-sm">
            Tierra
          </div>
        </Html>
      </group>
    </>
  );
}

function AsteroidOrbit({ data, speedMultiplier }) {
  const points = useMemo(() =>
    getOrbitPoints(data.Semieje_a, data.Excentricidad_e, data.Inclinacion_i, data.Nodo_Asc_om, data.Arg_Perihelio_w),
    [data]
  );

  const asteroidRef = useRef();
  const progressRef = useRef(0); // Acumulador de progreso de 0 a 1

  useFrame((_, delta) => {
    // Velocidad base del asteroide: 0.05
    const baseSpeed = 0.05;

    // Incrementar progreso
    progressRef.current = (progressRef.current + delta * baseSpeed * speedMultiplier) % 1;

    const idx = Math.floor(progressRef.current * points.length);
    const p1 = points[idx] || points[0];

    if (p1 && asteroidRef.current) {
      asteroidRef.current.position.set(p1[0], p1[1], p1[2]);
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.02;
    }
  });

  return (
    <>
      <Line
        points={points}
        color="#ff4757"
        lineWidth={1}
        opacity={0.6}
        transparent
      />

      <mesh ref={asteroidRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
        <Html distanceFactor={30}>
          <div className="bg-red-600/80 text-white px-2 py-1 rounded text-xs font-bold border border-red-400 whitespace-nowrap pointer-events-none select-none flex items-center gap-1 backdrop-blur-md">
            <AlertTriangle size={12} />
            {data.Nombre}
          </div>
        </Html>
      </mesh>
    </>
  );
}

export default function App() {
  const data = dataDelPython;
  const [speed, setSpeed] = useState(1); // 1 es la velocidad normal

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        {/* PARTE IZQUIERDA: DATOS */}
        <div className="sidebar">
          <div className="header">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-red-500" size={24} />
              <h1>Alerta de Impacto</h1>
            </div>
            <h2>Parámetros Orbitales</h2>
          </div>

          <div className="datos-content">
            <div className="data-row">
              <span className="text-gray-400">Objeto:</span>
              <span className="text-white font-bold">{data.Nombre}</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Diámetro:</span>
              <span className="text-yellow-400 font-bold">{data.Diametro} km</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">MOID:</span>
              <span className="text-red-400 font-bold">{data.MOID} AU</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Semieje (a):</span>
              <span>{data.Semieje_a} AU</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Excentricidad:</span>
              <span>{data.Excentricidad_e}</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Inclinación:</span>
              <span>{data.Inclinacion_i}°</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Nodo Asc.:</span>
              <span>{data.Nodo_Asc_om}°</span>
            </div>
            <div className="data-row">
              <span className="text-gray-400">Arg. Perihelio:</span>
              <span>{data.Arg_Perihelio_w}°</span>
            </div>
            <div className="control-panel">
               <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                 <div className="flex items-center gap-1">
                   <Clock size={14}/> Velocidad de Tiempo
                 </div>
                 <span className="text-yellow-400 font-mono">x{speed.toFixed(1)}</span>
               </div>
               <div className="slider-container">
                 <span className="text-xs text-gray-500">0</span>
                 <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.1" 
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="slider"
                 />
                 <FastForward size={14} className="text-gray-500"/>
               </div>
            </div>
          </div>
        </div>

        <div className="simulation-container">
          <Canvas camera={{ position: [0, 60, 120], fov: 45 }} dpr={[1, 2]}>
            <color attach="background" args={['#000005']} />

            <ambientLight intensity={0.05} />
            <StarField />

            <RealisticSun />
            <RealisticEarth speedMultiplier={speed} />
            <AsteroidOrbit data={data} speedMultiplier={speed} />

            <OrbitControls minDistance={5} maxDistance={500} />
            <gridHelper args={[200, 50, 0x222222, 0x111111]} position={[0, -2, 0]} />
          </Canvas>
        </div>
      </div>
    </>
  );
}