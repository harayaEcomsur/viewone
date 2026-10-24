"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ProductoId } from "./productos";

// Escena del visualizador. Todo en metros (las medidas llegan en cm).
// Iluminación sin HDR externo: RoomEnvironment se genera en el navegador, así
// la escena no depende de un CDN de mapas de entorno.

export type Acabado = "mate" | "brillante";

export interface EscenaProps {
  producto: ProductoId;
  anchoCm: number;
  altoCm: number;
  /** Cara impresa ya compuesta (ver componerCara). */
  cara: HTMLCanvasElement;
  noche: boolean;
  escalaHumana: boolean;
  acabado: Acabado;
  onCanvas?: (el: HTMLCanvasElement) => void;
}

const COLOR_MURO = "#d8d3cb";
const COLOR_METAL = "#b9bec4";
const COLOR_OSCURO = "#232a33";

export default function Escena(props: EscenaProps) {
  const { producto, anchoCm, altoCm, noche, escalaHumana } = props;
  const w = anchoCm / 100;
  const h = altoCm / 100;
  const layout = useMemo(() => calcularLayout(producto, w, h), [producto, w, h]);

  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.05, far: 200, position: [3, 2, 6] }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => props.onCanvas?.(gl.domElement)}
    >
      <Fondo noche={noche} />
      <Entorno intensidad={noche ? 0.06 : 0.85} />
      <ambientLight intensity={noche ? 0.05 : 0.25} />
      {!noche && <directionalLight position={[4, 8, 6]} intensity={1.1} />}
      {/* La caja de luz se ilumina sola; el resto lleva un foco exterior. */}
      {noche && producto !== "cajaLuz" && (
        <Foco desde={[0, layout.alto + 2.5, 4]} hacia={[0, layout.centroY, 0]} intensidad={25} />
      )}

      <Producto3D {...props} w={w} h={h} layout={layout} />
      {escalaHumana && <Persona x={layout.ancho / 2 + 0.6} z={layout.personaZ} noche={noche} />}

      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={noche ? "#141c28" : "#e4e7eb"} roughness={1} />
      </mesh>
      <ContactShadows
        key={`${producto}-${anchoCm}-${altoCm}-${escalaHumana}`}
        position={[0, 0.002, 0]}
        scale={Math.max(layout.ancho, 4) * 2.2}
        opacity={noche ? 0.25 : 0.45}
        blur={2.4}
        far={Math.max(layout.alto, 2)}
        resolution={512}
        frames={1}
      />

      <Encuadre layout={layout} escalaHumana={escalaHumana} />
    </Canvas>
  );
}

// ---------- layout: dónde queda cada cosa según producto y medida ----------

interface Layout {
  /** Ancho y alto de lo que hay que encuadrar (m). */
  ancho: number;
  alto: number;
  centroY: number;
  /** Altura del borde inferior del área impresa. */
  base: number;
  personaZ: number;
  conMuro: boolean;
  conPuerta: boolean;
}

function calcularLayout(producto: ProductoId, w: number, h: number): Layout {
  switch (producto) {
    case "pendon":
      return { ancho: w + 0.1, alto: h + 0.1, centroY: (h + 0.1) / 2, base: 0.1, personaZ: 0.3, conMuro: false, conPuerta: false };
    case "totem":
      return { ancho: w + 0.12, alto: h + 0.15, centroY: (h + 0.15) / 2, base: 0.15, personaZ: 0.5, conMuro: false, conPuerta: false };
    case "vidriera":
      return { ancho: w + 0.12, alto: h + 0.16, centroY: (h + 0.16) / 2, base: 0.1, personaZ: 0.6, conMuro: true, conPuerta: false };
    case "fachada":
    case "cajaLuz": {
      // Un letrero de fachada normalmente va sobre el acceso: si cabe, se
      // monta a 2,4 m con una puerta debajo (da la escala sin pensar).
      const sobreAcceso = h <= 2.4;
      const base = sobreAcceso ? 2.4 : 0.4;
      const ancho = Math.max(w, sobreAcceso ? 1.8 : 0) + 0.2;
      const alto = base + h + 0.2;
      return { ancho, alto, centroY: alto / 2, base, personaZ: 0.7, conMuro: true, conPuerta: sobreAcceso };
    }
  }
}

// ---------- producto ----------

function Producto3D({
  producto,
  w,
  h,
  layout,
  cara,
  noche,
  acabado,
}: EscenaProps & { w: number; h: number; layout: Layout }) {
  const textura = useMemo(() => {
    const t = new THREE.CanvasTexture(cara);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [cara]);
  useEffect(() => () => textura.dispose(), [textura]);

  const transparente = producto === "vidriera";
  const material = (
    <meshPhysicalMaterial
      map={textura}
      roughness={acabado === "brillante" ? 0.2 : 0.85}
      clearcoat={acabado === "brillante" ? 0.6 : 0}
      transparent={transparente}
      alphaTest={transparente ? 0.02 : 0}
      side={THREE.FrontSide}
    />
  );

  switch (producto) {
    case "pendon":
      return (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[w + 0.06, 0.1, 0.24]} />
            <meshStandardMaterial color={COLOR_METAL} metalness={0.8} roughness={0.35} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 - 0.06), 0.008, 0]}>
              <boxGeometry args={[0.04, 0.016, 0.38]} />
              <meshStandardMaterial color={COLOR_OSCURO} metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.1 + h / 2, -0.05]}>
            <cylinderGeometry args={[0.009, 0.009, h, 12]} />
            <meshStandardMaterial color={COLOR_METAL} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.1 + h, 0.006]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.013, 0.013, w + 0.02, 16]} />
            <meshStandardMaterial color={COLOR_METAL} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.1 + h / 2, 0]}>
            <planeGeometry args={[w, h]} />
            {material}
          </mesh>
          <mesh position={[0, 0.1 + h / 2, -0.001]} rotation-y={Math.PI}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.9} />
          </mesh>
        </group>
      );

    case "totem":
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[w + 0.12, 0.12, 0.44]} />
            <meshStandardMaterial color="#9aa0a6" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.15 + h / 2, 0]}>
            <boxGeometry args={[w + 0.06, h + 0.06, 0.3]} />
            <meshStandardMaterial color={COLOR_OSCURO} metalness={0.4} roughness={0.5} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, 0.15 + h / 2, s * 0.1505]} rotation-y={s === 1 ? 0 : Math.PI}>
              <planeGeometry args={[w, h]} />
              {material}
            </mesh>
          ))}
        </group>
      );

    case "vidriera": {
      const perfil = 0.06;
      const y0 = 0.1;
      const cy = y0 + h / 2;
      const muroAncho = Math.max(w + 10, 14);
      const muroAlto = Math.max(y0 + h + 3, 6);
      const lateral = (muroAncho - w - 2 * perfil) / 2;
      return (
        <group>
          {/* muro con el vano del vidrio */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 + perfil + lateral / 2), muroAlto / 2, -0.15]}>
              <boxGeometry args={[lateral, muroAlto, 0.3]} />
              <meshStandardMaterial color={COLOR_MURO} roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[0, (y0 + h + perfil + muroAlto) / 2, -0.15]}>
            <boxGeometry args={[w + 2 * perfil, muroAlto - (y0 + h + perfil), 0.3]} />
            <meshStandardMaterial color={COLOR_MURO} roughness={0.95} />
          </mesh>
          {/* marco de aluminio */}
          <mesh position={[0, y0 / 2, -0.02]}>
            <boxGeometry args={[w + 2 * perfil, y0, 0.08]} />
            <meshStandardMaterial color={COLOR_OSCURO} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, y0 + h + perfil / 2, -0.02]}>
            <boxGeometry args={[w + 2 * perfil, perfil, 0.08]} />
            <meshStandardMaterial color={COLOR_OSCURO} metalness={0.6} roughness={0.4} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 + perfil / 2), cy, -0.02]}>
              <boxGeometry args={[perfil, h, 0.08]} />
              <meshStandardMaterial color={COLOR_OSCURO} metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {/* interior del local: caja vista por dentro, oscura para dar contraste */}
          <mesh position={[0, cy, -0.8]}>
            <boxGeometry args={[w, h, 1.5]} />
            <meshStandardMaterial color="#3a414b" roughness={0.9} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, cy, -0.01]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#b9d0dd" transparent opacity={0.22} roughness={0.05} metalness={0.3} depthWrite={false} />
          </mesh>
          {/* el vinilo, pegado por fuera */}
          <mesh position={[0, cy, 0.002]}>
            <planeGeometry args={[w, h]} />
            {material}
          </mesh>
        </group>
      );
    }

    case "fachada":
    case "cajaLuz": {
      const luz = producto === "cajaLuz";
      const prof = luz ? 0.14 : 0.03;
      const separacion = luz ? 0 : 0.025;
      const cy = layout.base + h / 2;
      // Muro holgado: que sus bordes no entren al cuadro al girar la cámara.
      const muroAncho = Math.max(w + 10, 14);
      const muroAlto = Math.max(layout.base + h + 3, 6);
      const zCara = separacion + prof + 0.0006;
      return (
        <group>
          <mesh position={[0, muroAlto / 2, -0.15]}>
            <boxGeometry args={[muroAncho, muroAlto, 0.3]} />
            <meshStandardMaterial color={COLOR_MURO} roughness={0.95} />
          </mesh>
          {layout.conPuerta && <Puerta />}
          <mesh position={[0, cy, separacion + prof / 2]}>
            <boxGeometry args={[w, h, prof]} />
            <meshStandardMaterial color={luz ? COLOR_OSCURO : "#ececec"} metalness={luz ? 0.5 : 0.1} roughness={0.45} />
          </mesh>
          <mesh position={[0, cy, zCara]}>
            <planeGeometry args={[w, h]} />
            {luz ? (
              <meshStandardMaterial
                map={textura}
                emissiveMap={textura}
                emissive="#ffffff"
                emissiveIntensity={noche ? 1.6 : 0.12}
                roughness={0.6}
              />
            ) : (
              material
            )}
          </mesh>
          {luz && noche && (
            // Resplandor que la caja proyecta sobre el muro y el piso.
            <pointLight position={[0, cy, 0.6]} intensity={2 + w * h * 3} distance={6} decay={1.8} color="#fff4e2" />
          )}
        </group>
      );
    }
  }
}

function Puerta() {
  return (
    <group>
      <mesh position={[0, 1.1, 0.02]}>
        <boxGeometry args={[1.8, 2.2, 0.04]} />
        <meshStandardMaterial color={COLOR_OSCURO} metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.44, 1.1, 0.041]}>
          <planeGeometry args={[0.8, 2.06]} />
          <meshStandardMaterial color="#5f7685" roughness={0.08} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Silueta de 1,70 m: referencia de escala que no compite con el diseño.
function Persona({ x, z, noche }: { x: number; z: number; noche: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.73, 0]}>
        <capsuleGeometry args={[0.16, 1.14, 6, 16]} />
        <meshStandardMaterial color={noche ? "#4a5361" : "#9aa3ad"} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.59, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshStandardMaterial color={noche ? "#4a5361" : "#9aa3ad"} roughness={0.8} />
      </mesh>
      <Html position={[0, 1.8, 0]} center style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">1,70 m</span>
      </Html>
    </group>
  );
}

// ---------- entorno, fondo y cámara ----------

// Foco exterior típico de un letrero de noche. El target de un SpotLight
// tiene que estar en la escena para que three actualice su posición.
function Foco({ desde, hacia, intensidad }: { desde: [number, number, number]; hacia: [number, number, number]; intensidad: number }) {
  const luz = useRef<THREE.SpotLight>(null);
  const objetivo = useRef<THREE.Object3D>(null);
  useEffect(() => {
    if (luz.current && objetivo.current) luz.current.target = objetivo.current;
  }, []);
  return (
    <>
      <spotLight ref={luz} position={desde} angle={0.55} penumbra={0.7} intensity={intensidad} distance={20} decay={1.6} />
      <object3D ref={objetivo} position={hacia} />
    </>
  );
}

function Entorno({ intensidad }: { intensidad: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  useEffect(() => {
    scene.environmentIntensity = intensidad;
  }, [scene, intensidad]);
  return null;
}

function Fondo({ noche }: { noche: boolean }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = new THREE.Color(noche ? "#081220" : "#eef1f5");
  }, [scene, noche]);
  return null;
}

// Encuadra el soporte completo cada vez que cambia producto o medida, para
// que un letrero de 12 m y un pendón de 80 cm se vean enteros sin tocar nada.
function Encuadre({ layout, escalaHumana }: { layout: Layout; escalaHumana: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update(): void } | null;

  const anchoVista = layout.ancho + (escalaHumana ? 1.6 : 0);
  const centroX = escalaHumana ? 0.8 : 0;
  const distancia = useMemo(() => {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    return Math.max(layout.alto / 2 / t, anchoVista / 2 / (t * aspect)) * 1.25 + 0.5;
  }, [camera.fov, size.width, size.height, layout.alto, anchoVista]);

  useEffect(() => {
    camera.position.set(centroX + distancia * 0.32, layout.centroY + distancia * 0.12, distancia);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(centroX, layout.centroY, 0);
      controls.update();
    }
  }, [camera, controls, distancia, layout.centroY, centroX]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      minDistance={0.5}
      maxDistance={distancia * 3}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={0.15}
    />
  );
}
