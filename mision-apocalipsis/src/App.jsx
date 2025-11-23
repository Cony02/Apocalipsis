import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { AlertTriangle, Info, Shield, Clock, FastForward, Target, Rocket, Play, ChevronLeft } from 'lucide-react';
import * as THREE from 'three';

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

  /* PANTALLA DE BIENVENIDA */
  .landing-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #000; /* Fondo de respaldo */
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  /* Estilos para el video de fondo */
  .video-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  /* Capa oscura sobre el video para mejorar legibilidad */
  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Oscurece el video un 50% */
    z-index: 1;
  }

  .landing-content {
    position: relative;
    z-index: 2; /* Asegura que el contenido esté sobre el video */
    display: flex;
    flex-direction: column;
    align-items: center;
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

  /* ESTILOS DEL SIMULADOR */
  .app-container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
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

function Missile({ targetPosition, onImpact, isLaunched, asteroidRef }) {
  const missileRef = useRef();
  const startPosition = useMemo(() => [0, 0, 0], []);
  const impactDetected = useRef(false);
  const trailPoints = useRef([]);

  useFrame((_, delta) => {
    if (!isLaunched || !missileRef.current || impactDetected.current) return;

    const missile = missileRef.current;
    const currentPos = missile.position.clone();
    const target = new THREE.Vector3(...targetPosition);
    
    const direction = new THREE.Vector3()
      .subVectors(target, currentPos)
      .normalize();
    
    const speed = 80;
    missile.position.add(direction.multiplyScalar(speed * delta));
    
    if (direction.length() > 0) {
      missile.lookAt(missile.position.clone().add(direction));
    }
    
    trailPoints.current.push({
      position: currentPos.clone(),
      life: 1.0
    });
    
    trailPoints.current = trailPoints.current.filter(point => {
      point.life -= delta * 3;
      return point.life > 0;
    });
    
    if (asteroidRef.current) {
      const asteroidPos = new THREE.Vector3();
      asteroidRef.current.getWorldPosition(asteroidPos);
      
      const distance = currentPos.distanceTo(asteroidPos);
      
      if (distance < 4) {
        impactDetected.current = true;
        onImpact();
        setTimeout(() => { if (missileRef.current) missileRef.current.visible = false; }, 100);
      }
    }
    
    if (currentPos.length() > 300) {
      impactDetected.current = true;
      setTimeout(() => { if (missileRef.current) missileRef.current.visible = false; }, 100);
    }
  });

  React.useEffect(() => {
    if (isLaunched) {
      impactDetected.current = false;
      trailPoints.current = [];
      if (missileRef.current) {
        missileRef.current.visible = true;
        missileRef.current.position.set(...startPosition);
      }
    }
  }, [isLaunched, startPosition]);

  return (
    <>
      {isLaunched && (
        <group ref={missileRef} position={startPosition}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#ff4757" emissive="#ff0000" />
          </mesh>
          <pointLight color="#ff6b81" intensity={3} distance={15} decay={2} />
          {trailPoints.current.map((point, index) => (
            <mesh key={index} position={point.position}>
              <sphereGeometry args={[0.02 + point.life * 0.05, 4]} />
              <meshBasicMaterial color="#ffd700" transparent opacity={point.life * 0.8} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}

function AsteroidOrbit({ data, speedMultiplier, isDeflected, onAsteroidUpdate, asteroidRef, onDistanceUpdate }) {
  const points = useMemo(() =>
    getOrbitPoints(data.Semieje_a, data.Excentricidad_e, data.Inclinacion_i, data.Nodo_Asc_om, data.Arg_Perihelio_w),
    [data]
  );

  const internalAsteroidRef = useRef();
  const progressRef = useRef(0);
  const deflectionProgress = useRef(0);

  const actualRef = asteroidRef || internalAsteroidRef;

  useFrame((_, delta) => {
    const baseSpeed = 0.05;
    progressRef.current = (progressRef.current + delta * baseSpeed * speedMultiplier) % 1;

    const idx = Math.floor(progressRef.current * points.length);
    const originalPos = points[idx] || points[0];

    if (originalPos && actualRef.current) {
      let finalPos = [...originalPos];
      
      if (isDeflected) {
        deflectionProgress.current = Math.min(deflectionProgress.current + delta * 0.5, 1);
        finalPos[0] += deflectionProgress.current * 15;
        finalPos[1] += deflectionProgress.current * 8;
        finalPos[2] += deflectionProgress.current * 5;
      } else {
        deflectionProgress.current = 0;
      }
      
      actualRef.current.position.set(...finalPos);
      actualRef.current.rotation.x += 0.01;
      actualRef.current.rotation.y += 0.02;

      if (onAsteroidUpdate) onAsteroidUpdate(finalPos);

      const distanceFromCenter = Math.sqrt(finalPos[0] ** 2 + finalPos[1] ** 2 + finalPos[2] ** 2);
      if (onDistanceUpdate) onDistanceUpdate(distanceFromCenter);
    }
  });

  const asteroidColor = isDeflected ? "#2ed573" : "#888888";
  const labelBg = isDeflected ? 'rgba(46, 213, 115, 0.8)' : 'rgba(255, 71, 87, 0.8)';
  const labelBorder = isDeflected ? '#2ed573' : '#ff4757';

  return (
    <>
      <Line points={points} color="#ff4757" lineWidth={1} opacity={0.4} transparent />
      {isDeflected && (
        <Line
          points={points.map((point, index) => {
            const progress = index / points.length;
            const deflectionAmount = progress * deflectionProgress.current * 15;
            return [point[0] + deflectionAmount, point[1] + deflectionAmount * 0.8, point[2] + deflectionAmount * 0.5];
          })}
          color="#2ed573" lineWidth={2} opacity={0.8} transparent
        />
      )}
      <mesh ref={actualRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={asteroidColor} roughness={0.8} metalness={0.2} emissive={isDeflected ? new THREE.Color(0x2ed573).multiplyScalar(0.3) : new THREE.Color(0x000000)} />
        <Html distanceFactor={30}>
          <div style={{
            backgroundColor: labelBg,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: `1px solid ${labelBorder}`,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease'
          }}>
            <AlertTriangle size={12} />
            {data.Nombre} {isDeflected && '✓'}
          </div>
        </Html>
      </mesh>
    </>
  );
}

// --- COMPONENTE DE SIMULACIÓN (Empaqueta todo lo anterior) ---
function Simulation({ onBack }) {
  const data = dataDelPython;
  const [speed, setSpeed] = useState(1);
  const [isDeflected, setIsDeflected] = useState(false);
  const [missileLaunched, setMissileLaunched] = useState(false);
  const [asteroidPosition, setAsteroidPosition] = useState([50, 0, 0]);
  const [missionStatus, setMissionStatus] = useState('ready');
  const [asteroidDistance, setAsteroidDistance] = useState(100);
  const [earthPosition, setEarthPosition] = useState([5, 0, 0]);
  const [autoLaunchArmed, setAutoLaunchArmed] = useState(false);
  const asteroidRef = useRef();

  const calculateDistanceToEarth = (asteroidPos) => {
    const earthPos = new THREE.Vector3(...earthPosition);
    const asteroidVec = new THREE.Vector3(...asteroidPos);
    return earthPos.distanceTo(asteroidVec);
  };

  const currentDistance = useMemo(() => {
    return calculateDistanceToEarth(asteroidPosition);
  }, [asteroidPosition, earthPosition]);

  const isAsteroidClose = currentDistance < 25;

  useEffect(() => {
    if (autoLaunchArmed && isAsteroidClose && missionStatus === 'armed' && !missileLaunched) {
      setMissileLaunched(true);
      setMissionStatus('launched');
      setTimeout(() => {
        if (missionStatus === 'launched') {
          setMissileLaunched(false);
          setMissionStatus('ready');
          setAutoLaunchArmed(false);
        }
      }, 5000);
    }
  }, [autoLaunchArmed, isAsteroidClose, missionStatus, missileLaunched]);

  const handleArmMissile = () => {
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

  const handleMissileImpact = () => {
    setMissileLaunched(false);
    setIsDeflected(true);
    setMissionStatus('success');
    setAutoLaunchArmed(false);
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
    switch (missionStatus) {
      case 'armed':
        return isAsteroidClose ? 
          <div className="auto-launch-info"> OBJETIVO EN RANGO - LANZANDO MISIL...</div> : 
          <div className="waiting-for-target"> ESPERANDO QUE EL ASTEROIDE SE ACERQUE...</div>;
      case 'launched':
        return <div className="auto-launch-info"> MISIL EN CAMINO HACIA EL OBJETIVO</div>;
      case 'success':
        return <div className="success-message">✓ MISIÓN EXITOSA - ASTEROIDE DESVIADO</div>;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <button className="back-button" onClick={onBack}>
            <ChevronLeft size={14} /> Volver al Inicio
        </button>
        <div className="header" style={{marginTop: '30px'}}>
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
              disabled={missionStatus === 'launched' || missionStatus === 'armed'}
              style={{ opacity: (missionStatus === 'launched' || missionStatus === 'armed') ? 0.7 : 1 }}
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
                <Clock size={14}/> Velocidad de Tiempo
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
              <FastForward size={14} style={{ color: '#666' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* SCENE 3D */}
      <div className="simulation-container">
        <Canvas camera={{ position: [0, 60, 120], fov: 45 }}>
          <color attach="background" args={['#000005']} />
          <ambientLight intensity={0.05} />
          <StarField />
          <RealisticSun />
          <RealisticEarth speedMultiplier={speed} onPositionUpdate={setEarthPosition} />
          <AsteroidOrbit 
            data={data} 
            speedMultiplier={speed}
            isDeflected={isDeflected}
            onAsteroidUpdate={setAsteroidPosition}
            onDistanceUpdate={setAsteroidDistance}
            asteroidRef={asteroidRef}
          />
          <Missile 
            targetPosition={asteroidPosition}
            onImpact={handleMissileImpact}
            isLaunched={missileLaunched}
            asteroidRef={asteroidRef}
          />
          <OrbitControls minDistance={5} maxDistance={500} />
          <gridHelper args={[200, 50, 0x222222, 0x111111]} position={[0, -2, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

// --- PANTALLA DE BIENVENIDA ---
function LandingPage({ onStart }) {
  return (
    <div className="landing-container">
      {/* VIDEO DE FONDO */}
      <video 
        className="video-bg" 
        autoPlay 
        loop 
        playsInline
        src='./videobackground.mp4' 
      />
      <div className="video-overlay"></div>
      
      <div className="landing-content">
        <h1 className="app-title">Misión Apocalipsis</h1>
        <p className="app-description text-size-xl">
          <strong>Cosmo Coders</strong><br/>
          Equipo 5
        </p>
        <button className="btn-simulacion" onClick={onStart}>
          <Play size={24} fill="white" />
          Iniciar Simulación
        </button>
      </div>
    </div>
  )
}

// --- COMPONENTE PRINCIPAL QUE GESTIONA LAS VISTAS ---
export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <style>{styles}</style>
      {started ? (
        <Simulation onBack={() => setStarted(false)} />
      ) : (
        <LandingPage onStart={() => setStarted(true)} />
      )}
    </>
  );
}