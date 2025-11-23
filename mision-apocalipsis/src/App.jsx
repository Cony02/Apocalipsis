import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { AlertTriangle, Database, Info, Disc, Shield, Zap } from 'lucide-react';
import * as THREE from 'three';
import './App.css';


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

// --- MOTOR DE FÍSICA ORBITAL ---
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

    // Escala 5
    const SCALE = 5;
    points.push([x * SCALE, z * SCALE, y * SCALE]);
  }
  return points;
};

// --- COMPONENTES 3D ---

// Campo de estrellas manual (Más estable que <Stars /> de drei)
function StarField({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      p[i] = (Math.random() - 0.5) * 600; // Espacio amplio
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
      <pointsMaterial size={0.5} color="white" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function Sun() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial emissive="#ffcc00" emissiveIntensity={2} color="orange" />
      <pointLight distance={200} intensity={1.5} color="white" />
    </mesh>
  );
}

function Earth() {
  const earthRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;
    earthRef.current.position.x = Math.cos(t) * 5;
    earthRef.current.position.z = Math.sin(t) * 5;
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#2e86de" />
      <Html distanceFactor={20}>
        <div className="bg-blue-900/80 text-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-500 pointer-events-none select-none">
          Tierra
        </div>
      </Html>
    </mesh>
  );
}

function AsteroidOrbit({ data }) {
  const points = useMemo(() =>
    getOrbitPoints(data.Semieje_a, data.Excentricidad_e, data.Inclinacion_i, data.Nodo_Asc_om, data.Arg_Perihelio_w),
    [data]
  );

  const asteroidRef = useRef();

  useFrame(({ clock }) => {
    const speed = 0.05;
    const t = (clock.getElapsedTime() * speed) % 1;
    const idx = Math.floor(t * points.length);
    const p1 = points[idx] || points[0];

    if (p1) asteroidRef.current.position.set(p1[0], p1[1], p1[2]);
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
        <meshStandardMaterial color="#a4b0be" roughness={0.9} />
        <Html distanceFactor={30}>
          <div className="bg-red-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-red-400 whitespace-nowrap pointer-events-none select-none">
            ☄️ {data.Nombre}
          </div>
        </Html>
      </mesh>
    </>
  );
}

export default function App() {
  const [materialSeleccionado, setMaterial] = useState(null);
  const data = dataDelPython;

  const evaluarMaterial = (mat) => {
    setMaterial(mat);
  };

  return (
    <body className="app-container">
      <div className="datos">
        <div class="header">
          <h1>¡Alerta de Impacto!</h1>
          <h2>Parametros Orbitales</h2>
        </div>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-500">Objeto:</span>
            <span className="text-white font-bold">{data.Nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Diámetro:</span>
            <span className="text-yellow-400 font-bold text-sm">{data.Diametro} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MOID:</span>
            <span className="text-red-400 font-bold">{data.MOID} AU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Semieje (a):</span>
            <span>{data.Semieje_a} AU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Excentricidad:</span>
            <span>{data.Excentricidad_e}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Inclinación:</span>
            <span>{data.Inclinacion_i}°</span>
          </div>
        </div>
      </div>

      <div className="simulación">
        <Canvas camera={{ position: [0, 60, 120], fov: 50 }} dpr={[1, 2]}>
          <color attach="background" args={['#000005']} />

          {/* Componentes de escena */}
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#ffddaa" />
          <StarField />

          <Sun />
          <Earth />
          <AsteroidOrbit data={data} />

          <OrbitControls minDistance={5} maxDistance={500} />
          <gridHelper args={[200, 50, 0x222222, 0x111111]} position={[0, -2, 0]} />
        </Canvas>
      </div>
    </body>
  );
}