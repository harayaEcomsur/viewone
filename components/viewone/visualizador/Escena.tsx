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
const COLOR_MURO_INTERIOR = "#ebe8e3";
const COLOR_METAL = "#b9bec4";
const COLOR_OSCURO = "#232a33";

export default function Escena(props: EscenaProps) {
  const { producto, anchoCm, altoCm, noche, escalaHumana } = props;
  const w = anchoCm / 100;
  const h = altoCm / 100;
  const layout = useMemo(() => calcularLayout(producto, w, h), [producto, w, h]);
  const anchoSombra = Math.max(layout.xMax - layout.xMin, 4);

  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.05, far: 400, position: [3, 2, 6] }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => props.onCanvas?.(gl.domElement)}
    >
      <Fondo noche={noche} />
      <Entorno intensidad={noche ? 0.06 : 0.85} />
      <ambientLight intensity={noche ? 0.05 : 0.25} />
      {!noche && <directionalLight position={[4, 8 + layout.yMax, 6]} intensity={1.1} />}
      {/* La caja de luz se ilumina sola; el resto lleva un foco exterior. */}
      {noche && producto !== "cajaLuz" && (
        <Foco
          desde={[(layout.xMin + layout.xMax) / 2, layout.yMax + 2.5, 4 + layout.yMax * 0.3]}
          hacia={[(layout.xMin + layout.xMax) / 2, (layout.yMin + layout.yMax) / 2, 0]}
          intensidad={25 * Math.max(1, layout.yMax / 3)}
        />
      )}

      <Producto3D {...props} w={w} h={h} layout={layout} />
      {escalaHumana && <Persona x={layout.personaX} z={layout.personaZ} noche={noche} />}

      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={noche ? "#141c28" : "#e4e7eb"} roughness={1} />
      </mesh>
      <ContactShadows
        key={`${producto}-${anchoCm}-${altoCm}-${escalaHumana}`}
        position={[(layout.xMin + layout.xMax) / 2, 0.002, 0]}
        scale={anchoSombra * 2.2}
        opacity={noche ? 0.25 : 0.45}
        blur={2.4}
        far={Math.max(layout.yMax, 2)}
        resolution={512}
        frames={1}
      />

      <Encuadre layout={layout} escalaHumana={escalaHumana} />
    </Canvas>
  );
}

// ---------- layout: dónde queda cada cosa según producto y medida ----------

interface Layout {
  /** Caja a encuadrar (m): el soporte, sin el muro de contexto. */
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Altura del borde inferior del área impresa. */
  base: number;
  personaX: number;
  personaZ: number;
  /** Altura relativa de la cámara (vinilo de piso se mira desde arriba). */
  elevacion: number;
  conPuerta: boolean;
}

function calcularLayout(producto: ProductoId, w: number, h: number): Layout {
  const centrado = (ancho: number, alto: number, base: number, personaZ: number, extra: Partial<Layout> = {}): Layout => ({
    xMin: -ancho / 2,
    xMax: ancho / 2,
    yMin: 0,
    yMax: alto,
    base,
    personaX: ancho / 2 + 0.6,
    personaZ,
    elevacion: 0.12,
    conPuerta: false,
    ...extra,
  });
  switch (producto) {
    case "pendon":
      return centrado(w + 0.1, h + 0.1, 0.1, 0.3);
    case "totem":
      return centrado(w + 0.12, h + 0.15, 0.15, 0.5);
    case "backing":
      return centrado(w + 0.1, h + 0.1, 0.06, 0.6);
    case "vidriera":
      return centrado(w + 0.12, h + 0.16, 0.1, 0.6);
    case "senalPoste": {
      // Placa en bandera, a 2 m de altura libre: no estorba al que camina.
      const base = 2.0;
      return { ...centrado(w + 0.2, base + h + 0.15, base, 0.5), xMin: -0.15, xMax: w + 0.1, personaX: w + 0.7 };
    }
    case "placaMuro": {
      // Centro a 1,5 m (altura de lectura) si cabe; si no, desde 30 cm.
      const base = h <= 1.6 ? 1.5 - h / 2 : 0.3;
      return { ...centrado(Math.max(w, 0.6) + 0.4, base + h + 0.2, base, 0.5), yMin: Math.max(0, base - 0.6) };
    }
    case "graficaMuro":
      return centrado(w + 0.4, h + 0.3, 0, 0.8);
    case "vinilPiso":
      // yMax hace de "profundidad" para que la distancia de cámara alcance.
      return { ...centrado(w + 0.4, Math.max(h, 1) * 0.9, 0, 0, { elevacion: 0.85 }), personaX: w / 2 + 0.5 };
    case "furgon":
      return { ...centrado(5.3, 2.5, 0.7, 1.9), personaX: 3.2 };
    case "cierre":
      return centrado(w + 0.2, h + 0.15, 0.05, 0.8);
    case "corporeo": {
      const base = h <= 1.2 ? 2.2 : 0.6;
      return { ...centrado(Math.max(w, 1) + 0.4, base + h + 0.4, base, 0.7), yMin: Math.max(0, base - 1.2) };
    }
    case "carretero": {
      const base = 6;
      return { ...centrado(w + 0.4, base + h + 0.3, base, 2), elevacion: 0.05 };
    }
    case "fachada":
    case "cajaLuz": {
      // Un letrero de fachada normalmente va sobre el acceso: si cabe, se
      // monta a 2,4 m con una puerta debajo (da la escala sin pensar).
      const sobreAcceso = h <= 2.4;
      const base = sobreAcceso ? 2.4 : 0.4;
      const ancho = Math.max(w, sobreAcceso ? 1.8 : 0) + 0.2;
      return { ...centrado(ancho, base + h + 0.2, base, 0.7), conPuerta: sobreAcceso };
    }
  }
}

// ---------- producto ----------

function Producto3D({ producto, w, h, layout, cara, noche, acabado }: EscenaProps & { w: number; h: number; layout: Layout }) {
  const textura = useMemo(() => {
    const t = new THREE.CanvasTexture(cara);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [cara]);
  useEffect(() => () => textura.dispose(), [textura]);

  const conAlfa = producto === "vidriera" || producto === "corporeo";
  const material = (
    <meshPhysicalMaterial
      map={textura}
      roughness={acabado === "brillante" ? 0.2 : 0.85}
      clearcoat={acabado === "brillante" ? 0.6 : 0}
      transparent={conAlfa}
      alphaTest={conAlfa ? 0.02 : 0}
    />
  );
  const metal = <meshStandardMaterial color={COLOR_METAL} metalness={0.8} roughness={0.32} />;
  const oscuro = <meshStandardMaterial color={COLOR_OSCURO} metalness={0.5} roughness={0.45} />;

  switch (producto) {
    case "pendon":
      return (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[w + 0.06, 0.1, 0.24]} />
            {metal}
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 - 0.06), 0.008, 0]}>
              <boxGeometry args={[0.04, 0.016, 0.38]} />
              {oscuro}
            </mesh>
          ))}
          <mesh position={[0, 0.1 + h / 2, -0.05]}>
            <cylinderGeometry args={[0.009, 0.009, h, 12]} />
            {metal}
          </mesh>
          <mesh position={[0, 0.1 + h, 0.006]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.013, 0.013, w + 0.02, 16]} />
            {metal}
          </mesh>
          <Cara w={w} h={h} pos={[0, 0.1 + h / 2, 0]}>{material}</Cara>
          <Dorso w={w} h={h} pos={[0, 0.1 + h / 2, -0.001]} />
        </group>
      );

    case "backing": {
      const marco = 0.04;
      const cy = 0.06 + h / 2;
      return (
        <group>
          <Marco w={w} h={h} cy={cy} grosor={marco} profundidad={0.05} z={0} />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 - 0.1), 0.01, 0]}>
              <boxGeometry args={[0.06, 0.02, 0.6]} />
              {metal}
            </mesh>
          ))}
          <Cara w={w} h={h} pos={[0, cy, 0.026]}>{material}</Cara>
          <Dorso w={w} h={h} pos={[0, cy, -0.026]} />
        </group>
      );
    }

    case "totem":
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[w + 0.12, 0.12, 0.44]} />
            <meshStandardMaterial color="#9aa0a6" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.15 + h / 2, 0]}>
            <boxGeometry args={[w + 0.06, h + 0.06, 0.3]} />
            {oscuro}
          </mesh>
          {[1, -1].map((s) => (
            <Cara key={s} w={w} h={h} pos={[0, 0.15 + h / 2, s * 0.1505]} rotY={s === 1 ? 0 : Math.PI}>
              {material}
            </Cara>
          ))}
        </group>
      );

    case "senalPoste": {
      const cy = layout.base + h / 2;
      const altoPoste = layout.base + h + 0.15;
      return (
        <group>
          <mesh position={[-0.05, altoPoste / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.045, altoPoste, 20]} />
            {oscuro}
          </mesh>
          {[cy + h / 2 - 0.04, cy - h / 2 + 0.04].map((y) => (
            <mesh key={y} position={[0.02, y, 0]}>
              <boxGeometry args={[0.1, 0.03, 0.03]} />
              {oscuro}
            </mesh>
          ))}
          <mesh position={[0.05 + w / 2, cy, 0]}>
            <boxGeometry args={[w, h, 0.02]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
          </mesh>
          {[1, -1].map((s) => (
            <Cara key={s} w={w} h={h} pos={[0.05 + w / 2, cy, s * 0.0106]} rotY={s === 1 ? 0 : Math.PI}>
              {material}
            </Cara>
          ))}
        </group>
      );
    }

    case "placaMuro": {
      const cy = layout.base + h / 2;
      const sep = 0.02;
      const esp = 0.006;
      return (
        <group>
          <Muro ancho={Math.max(w + 6, 8)} alto={Math.max(layout.base + h + 1.5, 3)} color={COLOR_MURO_INTERIOR} />
          {[
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ].map(([sx, sy]) => (
            <mesh key={`${sx}${sy}`} position={[sx * (w / 2 - 0.03), cy + sy * (h / 2 - 0.03), sep / 2]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.009, 0.009, sep, 12]} />
              {metal}
            </mesh>
          ))}
          <mesh position={[0, cy, sep + esp / 2]}>
            <boxGeometry args={[w, h, esp]} />
            <meshStandardMaterial color="#f4f4f4" roughness={0.3} transparent opacity={0.9} />
          </mesh>
          <Cara w={w} h={h} pos={[0, cy, sep + esp + 0.0005]}>{material}</Cara>
        </group>
      );
    }

    case "graficaMuro":
      return (
        <group>
          <Muro ancho={Math.max(w + 6, 10)} alto={Math.max(h + 1, 3.2)} color={COLOR_MURO_INTERIOR} />
          {/* Muro lateral: deja claro que es un interior, no una fachada. */}
          <mesh position={[-w / 2 - 1.2, Math.max(h + 1, 3.2) / 2, 2]} rotation-y={Math.PI / 2}>
            <planeGeometry args={[4, Math.max(h + 1, 3.2)]} />
            <meshStandardMaterial color="#e2ded8" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.05, 0.006]}>
            <boxGeometry args={[Math.max(w + 6, 10), 0.1, 0.012]} />
            <meshStandardMaterial color="#cfcac2" roughness={0.8} />
          </mesh>
          <Cara w={w} h={h} pos={[0, h / 2, 0.0015]}>{material}</Cara>
        </group>
      );

    case "vinilPiso":
      return (
        <group>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]}>
            <planeGeometry args={[w, h]} />
            {material}
          </mesh>
        </group>
      );

    case "furgon":
      return <Furgon textura={textura} material={material} />;

    case "cierre": {
      const cy = 0.05 + h / 2;
      const tramos = Math.max(1, Math.round(w / 2.4));
      const paso = w / tramos;
      return (
        <group>
          {Array.from({ length: tramos + 1 }, (_, i) => (
            <mesh key={i} position={[-w / 2 + i * paso, (h + 0.15) / 2, -0.06]}>
              <boxGeometry args={[0.08, h + 0.15, 0.08]} />
              {oscuro}
            </mesh>
          ))}
          <mesh position={[0, cy, -0.012]}>
            <boxGeometry args={[w, h, 0.02]} />
            <meshStandardMaterial color="#c9ccd0" roughness={0.7} />
          </mesh>
          <Cara w={w} h={h} pos={[0, cy, 0.0005]}>{material}</Cara>
        </group>
      );
    }

    case "corporeo":
      return <Corporeo cara={cara} textura={textura} w={w} h={h} base={layout.base} acabado={acabado} />;

    case "carretero": {
      const base = layout.base;
      const cy = base + h / 2;
      return (
        <group>
          <mesh position={[0, (base + 0.3) / 2, -0.55]}>
            <cylinderGeometry args={[0.3, 0.38, base + 0.3, 24]} />
            <meshStandardMaterial color="#8d939a" metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0, cy, -0.2]}>
            <boxGeometry args={[w + 0.2, h + 0.2, 0.3]} />
            {oscuro}
          </mesh>
          {/* pasarela de mantención */}
          <mesh position={[0, base - 0.18, 0.25]}>
            <boxGeometry args={[w, 0.05, 0.7]} />
            <meshStandardMaterial color="#6f757c" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0, base + 0.3, 0.58]}>
            <boxGeometry args={[w, 0.03, 0.03]} />
            {metal}
          </mesh>
          <Cara w={w} h={h} pos={[0, cy, -0.049]}>{material}</Cara>
        </group>
      );
    }

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
          <Marco w={w} h={h} cy={cy} grosor={perfil} profundidad={0.08} z={-0.02} zocalo={y0} />
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
          <Cara w={w} h={h} pos={[0, cy, 0.002]}>{material}</Cara>
        </group>
      );
    }

    case "fachada":
    case "cajaLuz": {
      const luz = producto === "cajaLuz";
      const prof = luz ? 0.14 : 0.03;
      const separacion = luz ? 0 : 0.025;
      const cy = layout.base + h / 2;
      const zCara = separacion + prof + 0.0006;
      return (
        <group>
          <Muro ancho={Math.max(w + 10, 14)} alto={Math.max(layout.base + h + 3, 6)} color={COLOR_MURO} />
          {layout.conPuerta && <Puerta />}
          <mesh position={[0, cy, separacion + prof / 2]}>
            <boxGeometry args={[w, h, prof]} />
            <meshStandardMaterial color={luz ? COLOR_OSCURO : "#ececec"} metalness={luz ? 0.5 : 0.1} roughness={0.45} />
          </mesh>
          <Cara w={w} h={h} pos={[0, cy, zCara]}>
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
          </Cara>
          {luz && noche && (
            // Resplandor que la caja proyecta sobre el muro y el piso.
            <pointLight position={[0, cy, 0.6]} intensity={2 + w * h * 3} distance={6} decay={1.8} color="#fff4e2" />
          )}
        </group>
      );
    }
  }
}

function Cara({
  w,
  h,
  pos,
  rotY = 0,
  children,
}: {
  w: number;
  h: number;
  pos: [number, number, number];
  rotY?: number;
  children: React.ReactNode;
}) {
  return (
    <mesh position={pos} rotation-y={rotY}>
      <planeGeometry args={[w, h]} />
      {children}
    </mesh>
  );
}

function Dorso({ w, h, pos }: { w: number; h: number; pos: [number, number, number] }) {
  return (
    <mesh position={pos} rotation-y={Math.PI}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color="#f2f2f2" roughness={0.9} />
    </mesh>
  );
}

function Muro({ ancho, alto, color }: { ancho: number; alto: number; color: string }) {
  return (
    <mesh position={[0, alto / 2, -0.15]}>
      <boxGeometry args={[ancho, alto, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

// Marco perimetral de aluminio (backing, vidriera). `zocalo` reemplaza el
// perfil inferior por uno más alto (base de vitrina).
function Marco({
  w,
  h,
  cy,
  grosor,
  profundidad,
  z,
  zocalo,
}: {
  w: number;
  h: number;
  cy: number;
  grosor: number;
  profundidad: number;
  z: number;
  zocalo?: number;
}) {
  const mat = <meshStandardMaterial color={COLOR_OSCURO} metalness={0.6} roughness={0.4} />;
  const abajo = zocalo ?? grosor;
  return (
    <group>
      <mesh position={[0, cy - h / 2 - abajo / 2, z]}>
        <boxGeometry args={[w + 2 * grosor, abajo, profundidad]} />
        {mat}
      </mesh>
      <mesh position={[0, cy + h / 2 + grosor / 2, z]}>
        <boxGeometry args={[w + 2 * grosor, grosor, profundidad]} />
        {mat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 + grosor / 2), cy, z]}>
          <boxGeometry args={[grosor, h, profundidad]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
}

// Furgón tipo utilitario mediano (~5,3 m), armado con cajas: el diseño va en
// ambos costados del área de carga (3,0 × 1,6 m). Suficiente para ubicar la
// gráfica; un modelo real de una marca sería un .glb aparte.
function Furgon({ material }: { textura: THREE.Texture; material: React.ReactNode }) {
  const blanco = <meshStandardMaterial color="#f5f6f7" metalness={0.3} roughness={0.35} />;
  const vidrio = <meshStandardMaterial color="#1f2a35" metalness={0.6} roughness={0.12} />;
  const negro = <meshStandardMaterial color="#1b1e22" roughness={0.8} />;
  const ancho = 1.96;
  return (
    <group position={[-0.2, 0, 0]}>
      {/* carga */}
      <mesh position={[-1.0, 1.45, 0]}>
        <boxGeometry args={[3.2, 2.0, ancho]} />
        {blanco}
      </mesh>
      {/* cabina y capó */}
      <mesh position={[1.3, 1.2, 0]}>
        <boxGeometry args={[1.4, 1.5, ancho]} />
        {blanco}
      </mesh>
      <mesh position={[2.25, 0.82, 0]}>
        <boxGeometry args={[0.6, 0.74, ancho - 0.04]} />
        {blanco}
      </mesh>
      {/* parabrisas: inclinado hacia atrás, apoyado en el frente de la cabina */}
      <mesh position={[2.06, 1.52, 0]} rotation-z={0.42}>
        <boxGeometry args={[0.02, 0.86, ancho - 0.12]} />
        {vidrio}
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[1.35, 1.6, s * (ancho / 2 + 0.001)]} rotation-y={s === 1 ? 0 : Math.PI}>
          <planeGeometry args={[1.0, 0.5]} />
          {vidrio}
        </mesh>
      ))}
      {/* parachoques */}
      <mesh position={[2.57, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.22, ancho]} />
        {negro}
      </mesh>
      <mesh position={[-2.62, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.22, ancho]} />
        {negro}
      </mesh>
      {/* ruedas */}
      {[-1.75, 1.75].flatMap((x) =>
        [1, -1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.36, s * (ancho / 2 - 0.08)]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.36, 0.36, 0.24, 28]} />
            {negro}
          </mesh>
        ))
      )}
      {/* gráfica en ambos costados del área de carga */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-1.0, 1.5, s * (ancho / 2 + 0.002)]} rotation-y={s === 1 ? 0 : Math.PI}>
          <planeGeometry args={[3.0, 1.6]} />
          {material}
        </mesh>
      ))}
    </group>
  );
}

// Letras corpóreas: el volumen se arma apilando la silueta del diseño en
// capas (alphaTest recorta el contorno), con la cara a color adelante. Es
// mucho más liviano que extruir un vector y sirve para cualquier PNG.
function Corporeo({
  cara,
  textura,
  w,
  h,
  base,
  acabado,
}: {
  cara: HTMLCanvasElement;
  textura: THREE.Texture;
  w: number;
  h: number;
  base: number;
  acabado: Acabado;
}) {
  const silueta = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = cara.width;
    c.height = cara.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(cara, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#9aa1a9";
    ctx.fillRect(0, 0, c.width, c.height);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [cara]);
  useEffect(() => () => silueta.dispose(), [silueta]);

  const cy = base + h / 2;
  const separacion = 0.03;
  const profundidad = Math.min(0.08, Math.max(0.03, h * 0.08));
  const capas = 14;
  return (
    <group>
      <Muro ancho={Math.max(w + 10, 14)} alto={Math.max(base + h + 3, 6)} color={COLOR_MURO} />
      {/* sombra falsa sobre el muro: da la separación sin activar sombras reales */}
      <mesh position={[0.02, cy - 0.03, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={silueta} color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {Array.from({ length: capas }, (_, i) => (
        <mesh key={i} position={[0, cy, separacion + (profundidad * i) / capas]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={silueta} alphaTest={0.5} side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, cy, separacion + profundidad + 0.0005]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          map={textura}
          alphaTest={0.5}
          roughness={acabado === "brillante" ? 0.2 : 0.6}
          clearcoat={acabado === "brillante" ? 0.8 : 0}
        />
      </mesh>
    </group>
  );
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
      <spotLight ref={luz} position={desde} angle={0.6} penumbra={0.7} intensity={intensidad} distance={60} decay={1.6} />
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

// Encuadra el soporte completo (y la persona, si se muestra) cada vez que
// cambia producto o medida: un letrero carretero de 12 m y una placa de
// 30 cm se ven enteros sin tocar nada.
function Encuadre({ layout, escalaHumana }: { layout: Layout; escalaHumana: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update(): void } | null;

  const xMin = layout.xMin;
  const xMax = escalaHumana ? Math.max(layout.xMax, layout.personaX + 0.3) : layout.xMax;
  const yMin = escalaHumana ? 0 : layout.yMin;
  const yMax = escalaHumana ? Math.max(layout.yMax, 1.85) : layout.yMax;
  const cx = (xMin + xMax) / 2;
  // Vista desde arriba (vinilo de piso): se apunta cerca del piso y se aleja
  // más, para que la persona de referencia no quede cortada.
  const desdeArriba = layout.elevacion > 0.5;
  const cy = desdeArriba ? (escalaHumana ? 0.6 : 0) : (yMin + yMax) / 2;

  const distancia = useMemo(() => {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    return Math.max((yMax - yMin) / 2 / t, (xMax - xMin) / 2 / (t * aspect)) * (desdeArriba ? 1.5 : 1.2) + 0.5;
  }, [camera.fov, size.width, size.height, xMin, xMax, yMin, yMax, desdeArriba]);

  useEffect(() => {
    camera.position.set(cx + distancia * 0.32, cy + distancia * layout.elevacion + 0.2, distancia);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(cx, cy, 0);
      controls.update();
    }
  }, [camera, controls, distancia, cx, cy, layout.elevacion]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      minDistance={0.3}
      maxDistance={distancia * 3}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={0.05}
    />
  );
}
