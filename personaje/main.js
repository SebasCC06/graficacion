import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==================================================
//                    ESCENA
// ==================================================

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x0f1420);

// Cámara
const camara = new THREE.PerspectiveCamera(
  50, innerWidth / innerHeight, 0.1, 100
);
camara.position.set(6, 6, 12);

// Renderizador
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(innerWidth, innerHeight);
document.body.appendChild(renderizador.domElement);

// Controles de cámara
const controles = new OrbitControls(camara, renderizador.domElement);
controles.target.set(0, 1.8, 0);

// Luces
escena.add(new THREE.AmbientLight(0xffffff, 0.8));

const luz = new THREE.DirectionalLight(0xffffff, 2);
luz.position.set(5, 10, 7);
escena.add(luz);

// Ejes y cuadrícula
escena.add(new THREE.AxesHelper(5));
escena.add(new THREE.GridHelper(20, 20, 0x55607a, 0x2a3348));

// ==================================================
//                 PANEL DE INFORMACIÓN
// ==================================================

const datos = {};
const panel = document.getElementById('panel');

// Guía de controles (aparece arriba en el panel)
datos['Mover'] = 'Flechas · Shift = correr · Espacio = saltar · Q/E = girar';
datos['Emotes'] = '1 Baile · 2 Amor · 3 Dormir · 4 Alegría · 5 Giro · 6 Oink';
datos['Transformar'] = 'Z/X = escala · A/D = sesgado X · W/S = sesgado Z · 0 = reiniciar forma';
datos['Perseguir'] = 'I = que lo corretee';
datos['Cámara'] = 'C = cambiar perspectiva · B = plaza de toros sí/no';
datos['Reiniciar'] = 'R';

function vec(v) {
  return `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
}

const animaciones = [];
const reloj = new THREE.Clock();

// ==================================================
//                    UTILIDADES
// ==================================================

// Crea un letrero de texto flotante
function crearEtiqueta(texto, color, ancho, alto) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 512;
  lienzo.height = 128;

  const ctx = lienzo.getContext('2d');
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(texto, 256, 64);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(lienzo),
      transparent: true
    })
  );
  sprite.scale.set(ancho, alto, 1);
  return sprite;
}

// Crea un símbolo suelto (corazón, nota, estrella...) para las partículas
function crearGlifo(texto, color) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 128;
  lienzo.height = 128;

  const ctx = lienzo.getContext('2d');
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(texto, 64, 68);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(lienzo),
      transparent: true,
      depthWrite: false
    })
  );
  sprite.scale.set(0.7, 0.7, 1);
  return sprite;
}

// Diferencia más corta entre dos ángulos (en radianes)
function difAngulo(desde, hasta) {
  return ((hasta - desde + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
}

// ==================================================
//                MATERIALES DEL CERDO
// ==================================================

const rosa = new THREE.MeshStandardMaterial({ color: 0xffa6c9 });
const rosaOscuro = new THREE.MeshStandardMaterial({ color: 0xff7eb0 });
const negro = new THREE.MeshStandardMaterial({ color: 0x111111 });
const blanco = new THREE.MeshStandardMaterial({ color: 0xffffff });

// ==================================================
//                   CERDITO
// ==================================================

const robot = new THREE.Group();
escena.add(robot);

// "forma": aquí se aplica la matriz de escalamiento + sesgado (shear) del cerdo
const forma = new THREE.Group();
forma.matrixAutoUpdate = false;
robot.add(forma);

const pivote = new THREE.Group();
pivote.position.y = 0.9;
forma.add(pivote);

const cerdo = new THREE.Group();
pivote.add(cerdo);

// Función para crear piezas
function pieza(geometria, material, x, y, z, padre = cerdo) {
  const malla = new THREE.Mesh(geometria, material);
  malla.position.set(x, y, z);
  padre.add(malla);
  return malla;
}

// Cuerpo
pieza(
  new THREE.SphereGeometry(0.9, 32, 24),
  rosa, 0, 0, 0
);

// Cabeza
const cabeza = pieza(
  new THREE.SphereGeometry(0.55, 24, 16),
  rosa, 0, 0.25, 0.85
);

// Hocico
const hocico = pieza(
  new THREE.CylinderGeometry(0.22, 0.22, 0.2, 20),
  rosaOscuro, 0, -0.05, 0.5, cabeza
);
hocico.rotation.x = Math.PI / 2;

// Fosas nasales
pieza(new THREE.SphereGeometry(0.04, 8, 8), negro, -0.08, -0.05, 0.61, cabeza);
pieza(new THREE.SphereGeometry(0.04, 8, 8), negro, 0.08, -0.05, 0.61, cabeza);

// Ojos
pieza(new THREE.SphereGeometry(0.09, 12, 12), blanco, -0.2, 0.17, 0.42, cabeza);
pieza(new THREE.SphereGeometry(0.09, 12, 12), blanco, 0.2, 0.17, 0.42, cabeza);

// Pupilas
pieza(new THREE.SphereGeometry(0.05, 12, 12), negro, -0.2, 0.17, 0.49, cabeza);
pieza(new THREE.SphereGeometry(0.05, 12, 12), negro, 0.2, 0.17, 0.49, cabeza);

// Orejas
const orejaIzq = pieza(
  new THREE.ConeGeometry(0.18, 0.3, 4),
  rosaOscuro, -0.3, 0.5, 0.05, cabeza
);
orejaIzq.rotation.z = 0.5;

const orejaDer = pieza(
  new THREE.ConeGeometry(0.18, 0.3, 4),
  rosaOscuro, 0.3, 0.5, 0.05, cabeza
);
orejaDer.rotation.z = -0.5;

// Patas: cada una tiene su pivote arriba (en la cadera) para poder caminar
function crearPata(x, z) {
  const pivotePata = new THREE.Group();
  pivotePata.position.set(x, -0.55, z);
  cerdo.add(pivotePata);

  const pata = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12),
    rosaOscuro
  );
  pata.position.y = -0.2;
  pivotePata.add(pata);

  return pivotePata;
}

const pataDelIzq = crearPata(-0.4, 0.4);
const pataDelDer = crearPata(0.4, 0.4);
const pataTrasIzq = crearPata(-0.4, -0.4);
const pataTrasDer = crearPata(0.4, -0.4);

// Cola
const cola = pieza(
  new THREE.TorusGeometry(0.1, 0.03, 8, 16, Math.PI * 1.5),
  rosaOscuro, 0, 0.1, -0.95
);

// Nombre flotante
const NOMBRE = 'Cuchito';
const etiqueta = crearEtiqueta(NOMBRE, '#ffffff', 2.5, 0.625);
etiqueta.position.set(0, 2.3, 0);
robot.add(etiqueta);

// Burbuja de "¡Oink!" (solo visible durante ese emote)
const burbuja = crearEtiqueta('¡OINK!', '#ffe066', 2.4, 0.6);
burbuja.position.set(0, 3.1, 0);
burbuja.visible = false;
robot.add(burbuja);

// ==================================================
//                 PERSONAS (FÁBRICA)
// ==================================================

const piel = new THREE.MeshStandardMaterial({ color: 0xffc18b });
const camisaBlanca = new THREE.MeshStandardMaterial({ color: 0xffffff });
const camisaRoja = new THREE.MeshStandardMaterial({ color: 0xd62828 });
const pantalonAzul = new THREE.MeshStandardMaterial({ color: 0x1e56c8 });
const pantalonGris = new THREE.MeshStandardMaterial({ color: 0x555b66 });
const zapatos = new THREE.MeshStandardMaterial({ color: 0x222222 });
const cabello = new THREE.MeshStandardMaterial({ color: 0x38251c });

// Brazo con pivote en el hombro (la mano queda en userData.mano)
function crearExtremidad(padre, x, y, material, radio = 0.09, largo = 0.65) {
  const pivoteBrazo = new THREE.Group();
  pivoteBrazo.position.set(x, y, 0);
  padre.add(pivoteBrazo);

  const brazo = new THREE.Mesh(
    new THREE.CylinderGeometry(radio, radio, largo, 12),
    material
  );
  brazo.position.y = -largo / 2;
  pivoteBrazo.add(brazo);

  const mano = new THREE.Mesh(
    new THREE.SphereGeometry(radio + 0.01, 12, 12),
    piel
  );
  mano.position.y = -(largo + 0.03);
  pivoteBrazo.add(mano);

  pivoteBrazo.userData.mano = mano;
  return pivoteBrazo;
}

// Pierna con pivote en la cadera
function crearPierna(padre, x, material, radio = 0.11) {
  const pivotePierna = new THREE.Group();
  pivotePierna.position.set(x, 0.85, 0);
  padre.add(pivotePierna);

  const pierna = new THREE.Mesh(
    new THREE.CylinderGeometry(radio, radio, 0.7, 12),
    material
  );
  pierna.position.y = -0.35;
  pivotePierna.add(pierna);

  const zapato = new THREE.Mesh(
    new THREE.BoxGeometry(radio * 2.1, 0.15, 0.35),
    zapatos
  );
  zapato.position.set(0, -0.72, 0.1);
  pivotePierna.add(zapato);

  return pivotePierna;
}

function crearPersona({
  camisa, pantalon, peinado, posicion, grosor = 1,
  peloMat = cabello, nombre = null, colorNombre = '#ffffff'
}) {
  const rCabeza = 0.25 * (1 + (grosor - 1) * 0.2);
  const grupo = new THREE.Group();
  grupo.position.copy(posicion);
  grupo.scale.setScalar(1.4);
  escena.add(grupo);

  // Cabeza
  const cabezaP = new THREE.Mesh(new THREE.SphereGeometry(rCabeza, 20, 16), piel);
  cabezaP.position.y = 1.85;
  grupo.add(cabezaP);

  if (peinado === 'largo') {
    // Cabello: parte de arriba
    const pelo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 12), peloMat);
    pelo.position.set(0, 1.9, -0.04);
    grupo.add(pelo);

    // Cabello largo: cortina por la espalda
    const peloLargo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), peloMat);
    peloLargo.scale.set(1, 2.6, 0.55);
    peloLargo.position.set(0, 1.55, -0.28);
    grupo.add(peloLargo);

    // Mechones a los lados de la cara
    [-0.23, 0.23].forEach((x) => {
      const mechon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), peloMat);
      mechon.scale.set(1, 2.8, 1);
      mechon.position.set(x, 1.62, -0.02);
      grupo.add(mechon);
    });
  } else {
    // Cabello corto, sin sombrero: casquete arriba y parte de atrás
    const casquete = new THREE.Mesh(
      new THREE.SphereGeometry(rCabeza * 1.08, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
      peloMat
    );
    casquete.position.set(0, 1.86, -0.02);
    grupo.add(casquete);

    const nuca = new THREE.Mesh(new THREE.SphereGeometry(rCabeza * 1.02, 20, 16), peloMat);
    nuca.position.set(0, 1.84, -0.07);
    grupo.add(nuca);
  }

  // Ojos
  [-0.09, 0.09].forEach((x) => {
    const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), negro);
    ojo.position.set(x * (rCabeza / 0.25), 1.88, rCabeza * 0.88);
    grupo.add(ojo);
  });

  // Cuerpo
  const g = grosor;

  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.55 * g, 0.75, 0.35 * g), camisa);
  cuerpo.position.y = 1.25;
  grupo.add(cuerpo);

  // Panza
  if (g > 1) {
    const panza = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 20), camisa);
    panza.scale.set(0.6 * g, 0.95, 0.6 * g);
    panza.position.set(0, 1.08, 0.1);
    grupo.add(panza);
  }

  // Extremidades más gruesas (y brazos más largos) según el grosor
  const radioBrazo = 0.09 * (1 + (g - 1) * 0.5);
  const largoBrazo = 0.65 * (1 + (g - 1) * 0.25);
  const xHombro = 0.275 * g + 0.075;
  const radioPierna = 0.11 + (g - 1) * 0.07;
  const xPierna = 0.17 * (1 + (g - 1) * 0.8);

  // Nombre flotante sobre la cabeza
  if (nombre) {
    const letrero = crearEtiqueta(nombre, colorNombre, 1.9, 0.475);
    letrero.position.set(0, 2.7, 0);
    grupo.add(letrero);
  }

  return {
    grupo,
    brazoIzq: crearExtremidad(grupo, -xHombro, 1.55, camisa, radioBrazo, largoBrazo),
    brazoDer: crearExtremidad(grupo, xHombro, 1.55, camisa, radioBrazo, largoBrazo),
    piernaIzq: crearPierna(grupo, -xPierna, pantalon, radioPierna),
    piernaDer: crearPierna(grupo, xPierna, pantalon, radioPierna)
  };
}

// Vaso que se pega a la mano derecha de alguien
function crearVaso(brazo) {
  const vaso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.065, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8b630 })
  );
  vaso.position.set(0, -0.75, 0.06);
  vaso.visible = false;
  brazo.add(vaso);
  return vaso;
}

// ==================================================
//            LA MUCHACHA Y EL COMPRADOR
// ==================================================

const POSICION_INICIAL_PERSONA = new THREE.Vector3(-4, 0, 2);
const POSICION_COMPRADOR = new THREE.Vector3(6, 0, -5);

// Nombres flotantes (cámbialos aquí)
const NOMBRE_MUCHACHA = 'Ingrid';
const NOMBRE_COMPRADOR = 'EL Wakal';

// Muchacha principal (la de blanco): la que persigue y atrapa a Chuleta
const muchacha = crearPersona({
  camisa: camisaBlanca,
  pantalon: pantalonAzul,
  peinado: 'largo',
  posicion: POSICION_INICIAL_PERSONA,
  nombre: NOMBRE_MUCHACHA,
  colorNombre: '#a8d8ff'
});
const persona = muchacha.grupo;
const { brazoIzq, brazoDer, piernaIzq, piernaDer } = muchacha;

// El orden YXZ hace que la caída sea hacia adelante, sin importar hacia dónde mire
persona.rotation.order = 'YXZ';

const vendedor = crearPersona({
  camisa: camisaRoja,
  pantalon: pantalonGris,
  peinado: 'corto',
  posicion: POSICION_COMPRADOR,
  grosor: 2.2, // mucho más gordo
  nombre: NOMBRE_COMPRADOR,
  colorNombre: '#ffd166'
});
const comprador = vendedor.grupo;
// Mira hacia el centro de la escena mientras espera
comprador.rotation.y = Math.atan2(-POSICION_COMPRADOR.x, -POSICION_COMPRADOR.z);

// Muchachas de fondo, cada una con colores distintos (la de blanco es solo la principal)
const EXTRAS = [
  { camisa: 0xf4c430, pantalon: 0x6b3fa0, pelo: 0x1a1a1a, pos: [-8, 0, -2] },   // amarilla
  { camisa: 0xe85d9a, pantalon: 0x2a2a2a, pelo: 0xd9a441, pos: [-1, 0, -7.5] }, // rosa
  { camisa: 0x8e44ad, pantalon: 0xc9b99a, pelo: 0x7a2e1b, pos: [3, 0, 6.5] },   // morada
  { camisa: 0x1abc9c, pantalon: 0x3b4a6b, pelo: 0x5a3825, pos: [8.5, 0, 2] }    // turquesa
];

const extras = EXTRAS.map((c) => {
  const m = crearPersona({
    camisa: new THREE.MeshStandardMaterial({ color: c.camisa }),
    pantalon: new THREE.MeshStandardMaterial({ color: c.pantalon }),
    peloMat: new THREE.MeshStandardMaterial({ color: c.pelo }),
    peinado: 'largo',
    posicion: new THREE.Vector3(...c.pos)
  });
  // Empiezan mirando hacia el centro de la escena
  m.grupo.rotation.y = Math.atan2(-c.pos[0], -c.pos[2]);

  // Letrero de enojo (solo se ve cuando la principal gana)
  m.enojo = crearEtiqueta('¡Grr!', '#ff4d4d', 1.3, 0.325);
  m.enojo.position.set(0, 2.6, 0);
  m.enojo.visible = false;
  m.grupo.add(m.enojo);
  m.tEnojo = 0;

  // Vaso para cuando se juntan a tomar
  m.vaso = crearVaso(m.brazoDer);

  return m;
});

// Billete de 300 pesos
const billete = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.02, 0.26),
  new THREE.MeshStandardMaterial({ color: 0x3aa655 })
);
billete.visible = false;
escena.add(billete);

// Letrero que aparece al recibir el pago
const etiquetaPago = crearEtiqueta('+$300 pesos', '#7dff9a', 3.2, 0.8);
etiquetaPago.visible = false;
escena.add(etiquetaPago);

// ==================================================
//             MESA, BEBIDAS Y VÓMITO
// ==================================================

const MESA = new THREE.Vector3(-6, 0, -6);
const RADIO_SILLA = 1.7;
const ALTURA_SENTADO = -0.69;

const matMadera = new THREE.MeshStandardMaterial({ color: 0x7a4b2a });

const mesa = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 24), matMadera);
mesa.position.set(MESA.x, 0.9, MESA.z);
escena.add(mesa);

const pataMesa = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12), matMadera);
pataMesa.position.set(MESA.x, 0.45, MESA.z);
escena.add(pataMesa);

// 5 lugares: 4 para las amigas (extras) y el 4 es de Ingrid
const SILLAS = [];
for (let i = 0; i < 5; i++) {
  const a = i * Math.PI * 2 / 5 + 0.6;
  const sx = MESA.x + Math.sin(a) * RADIO_SILLA;
  const sz = MESA.z + Math.cos(a) * RADIO_SILLA;

  SILLAS.push({
    pos: new THREE.Vector3(sx, 0, sz),
    giro: Math.atan2(-Math.sin(a), -Math.cos(a)), // mira hacia la mesa
    afuera: new THREE.Vector3(Math.sin(a), 0, Math.cos(a))
  });

  const banco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16), matMadera);
  banco.position.set(sx, 0.25, sz);
  escena.add(banco);
}

const vasoIngrid = crearVaso(brazoDer);

// Charco de vómito
const charco = new THREE.Mesh(
  new THREE.CircleGeometry(0.8, 24),
  new THREE.MeshStandardMaterial({ color: 0x9ccc3a })
);
charco.rotation.x = -Math.PI / 2;
charco.position.y = 0.02;
charco.scale.setScalar(0.01);
charco.visible = false;
escena.add(charco);

// Gotas de vómito
const vomitos = [];
const matVomito = new THREE.MeshStandardMaterial({ color: 0x9ccc3a });

function lanzarVomito() {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.07 + Math.random() * 0.05, 8, 8),
    matVomito
  );
  const fx = Math.sin(persona.rotation.y);
  const fz = Math.cos(persona.rotation.y);
  m.position.set(persona.position.x + fx * 1.6, 1.9, persona.position.z + fz * 1.6);
  escena.add(m);

  const v = 1.2 + Math.random();
  vomitos.push({
    m,
    vx: fx * v + (Math.random() - 0.5) * 0.4,
    vy: 0.5 + Math.random() * 0.8,
    vz: fz * v + (Math.random() - 0.5) * 0.4
  });
}

function actualizarVomitos(delta) {
  for (let i = vomitos.length - 1; i >= 0; i--) {
    const p = vomitos[i];
    p.vy -= 9 * delta;
    p.m.position.x += p.vx * delta;
    p.m.position.y += p.vy * delta;
    p.m.position.z += p.vz * delta;

    if (p.m.position.y <= 0.05) {
      escena.remove(p.m);
      p.m.geometry.dispose();
      vomitos.splice(i, 1);
    }
  }
}

// ==================================================
//            CAMIONETA Y PLAZA DE TOROS
// ==================================================

// ----- Camioneta -----
// Empieza MUY lejos, afuera de la plaza. Cuando Ingrid se cae entra de reversa
// por la Puerta Grande, y después se va por el mismo camino.
const RUTA_Z = 11;                                       // línea (z) por donde pasa la camioneta
const CARRO_INICIO = new THREE.Vector3(52, 0, RUTA_Z);   // dónde espera (más x = más lejos)
const CARRO_PARQUEO = new THREE.Vector3(0, 0, RUTA_Z);   // dónde se estaciona para recoger a Ingrid
const CARRO_GIRO = Math.PI / 2;                          // el frente mira hacia +X

const carro = new THREE.Group();
carro.position.copy(CARRO_INICIO);
carro.rotation.y = CARRO_GIRO;
escena.add(carro);

const matCarro = new THREE.MeshStandardMaterial({ color: 0x2b6cb0 });
const matCarroOscuro = new THREE.MeshStandardMaterial({ color: 0x1b1b1f });
const matVidrio = new THREE.MeshStandardMaterial({ color: 0x9fd3ff });
const matRin = new THREE.MeshStandardMaterial({ color: 0xcfcfcf });
const matFaro = new THREE.MeshStandardMaterial({
  color: 0xfff3a0, emissive: 0xfff3a0, emissiveIntensity: 0.6
});

function cajaCarro(w, h, d, x, y, z, mat = matCarro) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  carro.add(m);
  return m;
}

cajaCarro(2.0, 0.4, 7.0, 0, 0.6, 0);                    // chasis (el piso de la caja queda en y = 0.8)
cajaCarro(2.0, 1.0, 1.8, 0, 1.3, 1.0);                  // cabina
cajaCarro(1.7, 0.5, 0.06, 0, 1.45, 1.92, matVidrio);    // parabrisas
cajaCarro(0.1, 0.5, 3.4, -0.95, 1.05, -1.8);            // pared izquierda de la caja
cajaCarro(0.1, 0.5, 3.4, 0.95, 1.05, -1.8);             // pared derecha de la caja
cajaCarro(1.9, 0.5, 0.1, 0, 1.05, -0.15);               // pared delantera de la caja (atrás queda abierta)

[-0.7, 0.7].forEach((x) => {
  const faro = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matFaro);
  faro.position.set(x, 0.75, 3.5);
  carro.add(faro);
});

// Ruedas: cada una es un grupo para poder girarlas al avanzar
const ruedas = [];
[[-1.05, -2.3], [1.05, -2.3], [-1.05, 2.3], [1.05, 2.3]].forEach(([x, z]) => {
  const rueda = new THREE.Group();
  rueda.position.set(x, 0.45, z);

  const llanta = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 20), matCarroOscuro);
  llanta.rotation.z = Math.PI / 2;
  rueda.add(llanta);

  // Una barra clara en el rin para que se note que gira
  rueda.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.6), matRin));

  carro.add(rueda);
  ruedas.push(rueda);
});

const _punto = new THREE.Vector3();

// Convierte un punto de la camioneta (x = lateral, z = hacia el frente) a coordenadas del mundo
function puntoCarro(x, z, salida = _punto) {
  const c = Math.cos(carro.rotation.y);
  const s = Math.sin(carro.rotation.y);
  return salida.set(
    carro.position.x + x * c + z * s,
    0,
    carro.position.z - x * s + z * c
  );
}

// ----- Plaza de toros -----
const plaza = new THREE.Group();
escena.add(plaza);

const R_ARENA = 15;
const ANCHO_PUERTA = 5.4;                        // por aquí entra y sale la camioneta
const FILAS = 6;
const R_FONDO = R_ARENA + 1.8 + FILAS * 1.7;     // 27: borde de atrás de los tendidos
const R_FACHADA = R_FONDO + 0.05;

// Materiales de la plaza
const matPiedra = new THREE.MeshStandardMaterial({ color: 0xd8cbb0 });
const matPiedraOscura = new THREE.MeshStandardMaterial({ color: 0x9d8d73 });
const matMaderaClara = new THREE.MeshStandardMaterial({ color: 0x8a5a33 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x555a63 });
const matLuz = new THREE.MeshStandardMaterial({
  color: 0xfff3c4, emissive: 0xfff3c4, emissiveIntensity: 1
});

// Ángulo (medido desde +Z hacia +X) donde la ruta de la camioneta cruza un círculo de radio r
function anguloSalida(r) {
  return Math.atan2(Math.sqrt(r * r - RUTA_Z * RUTA_Z), RUTA_Z);
}

const A_PUERTA = anguloSalida(R_ARENA); // dirección de la puerta vista desde el centro

// ¿Este ángulo cae dentro del hueco de la puerta?
function cercaDePuerta(a, r, extra = 0.03) {
  return Math.abs(difAngulo(a, anguloSalida(r))) < (ANCHO_PUERTA / r) / 2 + extra;
}

// Recorre un círculo en n pasos (saltándose la puerta) y llama a hacer(ángulo, i)
function segmentosAnillo(r, n, saltarPuerta, hacer) {
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) * Math.PI * 2 / n;
    if (saltarPuerta && cercaDePuerta(a, r)) continue;
    hacer(a, i);
  }
}

// Punto en el borde del hueco de la puerta (signo = -1 / +1 para cada lado)
function puntoBorde(r, signo) {
  const a = anguloSalida(r) + signo * (ANCHO_PUERTA / r) / 2;
  return new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r);
}

// Pared circular (abierta arriba y abajo) con un hueco para la puerta
function paredConPuerta(r, alto, y, color) {
  const hueco = ANCHO_PUERTA / r;
  const malla = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, alto, 96, 1, true, anguloSalida(r) + hueco / 2, Math.PI * 2 - hueco),
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })
  );
  malla.position.y = y;
  plaza.add(malla);
  return malla;
}

// Piso/escalón en forma de anillo, también con hueco para la puerta
function anilloConPuerta(rIn, rOut, y, color) {
  const rm = (rIn + rOut) / 2;
  const hueco = ANCHO_PUERTA / rm;
  const malla = new THREE.Mesh(
    new THREE.RingGeometry(rIn, rOut, 96, 1, anguloSalida(rm) - Math.PI / 2 + hueco / 2, Math.PI * 2 - hueco),
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })
  );
  malla.rotation.x = -Math.PI / 2;
  malla.position.y = y;
  plaza.add(malla);
  return malla;
}

// Barandal hecho con segmentos (no cruza la puerta)
function barandal(r, y, n, mat, grosor = 0.1, alto = 0.1) {
  const geo = new THREE.BoxGeometry(grosor, alto, 2 * Math.PI * r / n + 0.05);
  segmentosAnillo(r, n, true, (a) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    m.rotation.y = a + Math.PI / 2;
    plaza.add(m);
  });
}

// Letrero con texto (que se ajusta al ancho)
function crearCartel(texto, fondo, color, ancho, alto) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 512;
  lienzo.height = Math.round(512 * alto / ancho);

  const ctx = lienzo.getContext('2d');
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, lienzo.width - 12, lienzo.height - 12);

  let px = 90;
  ctx.font = `bold ${px}px sans-serif`;
  while (ctx.measureText(texto).width > lienzo.width - 50 && px > 16) {
    px -= 4;
    ctx.font = `bold ${px}px sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(texto, lienzo.width / 2, lienzo.height / 2 + 4);

  return new THREE.Mesh(
    new THREE.PlaneGeometry(ancho, alto),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), side: THREE.DoubleSide })
  );
}

// ----- Suelo de fuera de la plaza -----
const sueloExterior = new THREE.Mesh(
  new THREE.CircleGeometry(80, 48),
  new THREE.MeshStandardMaterial({ color: 0x3a3a3f })
);
sueloExterior.rotation.x = -Math.PI / 2;
sueloExterior.position.y = -0.06;
plaza.add(sueloExterior);

// ----- Camino por donde entra/sale la camioneta -----
const camino = new THREE.Mesh(
  new THREE.PlaneGeometry(70, 5.4),
  new THREE.MeshStandardMaterial({ color: 0x4a4a50 })
);
camino.rotation.x = -Math.PI / 2;
camino.position.set(35, -0.04, RUTA_Z);
plaza.add(camino);

// Rayas del camino
const geoRaya = new THREE.BoxGeometry(1.4, 0.01, 0.14);
for (let x = 14; x < 68; x += 3.2) {
  const raya = new THREE.Mesh(geoRaya, new THREE.MeshStandardMaterial({ color: 0xf1e9c8 }));
  raya.position.set(x, -0.03, RUTA_Z);
  plaza.add(raya);
}

// ----- Ruedo de arena -----
const arena = new THREE.Mesh(
  new THREE.CircleGeometry(R_ARENA, 96),
  new THREE.MeshStandardMaterial({ color: 0xd9b77a })
);
arena.rotation.x = -Math.PI / 2;
arena.position.y = -0.03;
plaza.add(arena);

// Surcos de rastrillo en la arena
[3.2, 4.6, 8.6, 10.2, 11.8, 13.4].forEach((r) => {
  const surco = new THREE.Mesh(
    new THREE.RingGeometry(r, r + 0.07, 80),
    new THREE.MeshStandardMaterial({ color: 0xc4a05f })
  );
  surco.rotation.x = -Math.PI / 2;
  surco.position.y = -0.027;
  plaza.add(surco);
});

// Círculos pintados (el central y el de los tercios)
[[6.9, 7.1], [11.0, 11.14]].forEach(([a, b]) => {
  const aro = new THREE.Mesh(
    new THREE.RingGeometry(a, b, 96),
    new THREE.MeshStandardMaterial({ color: 0xf3e9cf, side: THREE.DoubleSide })
  );
  aro.rotation.x = -Math.PI / 2;
  aro.position.y = -0.02;
  plaza.add(aro);
});

// Cruz central
[0, Math.PI / 2].forEach((giro) => {
  const brazo = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.01, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xf3e9cf })
  );
  brazo.position.y = -0.015;
  brazo.rotation.y = giro;
  plaza.add(brazo);
});

// ----- Barrera -----
paredConPuerta(R_ARENA, 1.6, 0.8, 0x9c2b1d);          // pared roja
paredConPuerta(R_ARENA + 0.02, 0.18, 1.5, 0xf2efe6);  // franja blanca
paredConPuerta(R_ARENA - 0.01, 0.3, 0.15, 0x5a3a20);  // zoclo de madera
barandal(R_ARENA + 0.04, 1.68, 72, matMaderaClara, 0.22, 0.1); // tabla de arriba

// Anuncios en la barrera
const ANUNCIOS = [
  ['CARNITAS',  '#f2c230', '#7a1f14'], ['CERVEZA',  '#1e56c8', '#ffffff'],
  ['MORELIA',   '#9c2b1d', '#ffe9a8'], ['TEQUILA',  '#2a9d8f', '#ffffff'],
  ['TACOS',     '#f77f00', '#2a1a10'], ['MEZCAL',   '#333333', '#f2c230'],
  ['CHURROS',   '#e85d9a', '#ffffff'], ['ELOTES',   '#4caf50', '#ffffff'],
  ['REFRESCOS', '#d62828', '#ffffff'], ['PULQUE',   '#f1e9c8', '#7a1f14'],
  ['LA PLAZA',  '#7a1f14', '#f2c230'], ['TORERÍA',  '#222222', '#f2efe6'],
  ['MICHOACÁN', '#006847', '#ffffff'], ['AGUAS',    '#9fd3ff', '#1e3a8a'],
  ['PAN',       '#d9a441', '#3a2412'], ['SOMBREROS', '#ce1126', '#ffffff']
];

ANUNCIOS.forEach(([texto, fondo, color], i) => {
  const a = (i + 0.5) * Math.PI * 2 / ANUNCIOS.length;
  if (cercaDePuerta(a, R_ARENA, 0.25)) return;

  const cartel = crearCartel(texto, fondo, color, 2.4, 0.7);
  cartel.position.set(Math.sin(a) * (R_ARENA - 0.06), 0.8, Math.cos(a) * (R_ARENA - 0.06));
  cartel.rotation.y = a + Math.PI; // mira hacia el centro
  plaza.add(cartel);
});

// Burladeros (los escudos de madera frente a la barrera)
[2.1, 3.4, 4.6, 5.6].forEach((a) => {
  const g = new THREE.Group();
  g.position.set(Math.sin(a) * 14.1, 0, Math.cos(a) * 14.1);
  g.rotation.y = a + Math.PI;

  const tablero = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x9c2b1d })
  );
  tablero.position.y = 0.75;
  g.add(tablero);

  const franja = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 0.14, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xf2efe6 })
  );
  franja.position.y = 1.45;
  g.add(franja);

  const ala = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x7a1f14 })
  );
  ala.position.set(0.7, 0.75, 0.3);
  g.add(ala);

  plaza.add(g);
});

// Callejón (el piso entre la barrera y el primer escalón)
anilloConPuerta(R_ARENA, R_ARENA + 1.8, -0.02, 0xb98f55);

// ----- Tendidos: 6 filas de gradas escalonadas -----
for (let i = 0; i < FILAS; i++) {
  const rIn = R_ARENA + 1.8 + i * 1.7;
  const rOut = rIn + 1.7;
  const yArriba = 1.7 + i * 1.05;
  const alto = i === 0 ? 1.7 : 1.05;

  paredConPuerta(rIn, alto, yArriba - alto / 2, i % 2 ? 0xbfb29a : 0xd2c7b2);
  anilloConPuerta(rIn, rOut, yArriba, i % 2 ? 0xa79a82 : 0xc9bda6);
}

// Barandales: al frente del primer tendido y en lo más alto
barandal(R_ARENA + 1.9, 2.25, 72, matMetal, 0.08, 0.08);
barandal(R_ARENA + 1.9, 1.95, 72, matMetal, 0.08, 0.08);
barandal(R_FONDO - 0.2, 7.55, 90, matMetal, 0.08, 0.08);
barandal(R_FONDO - 0.2, 7.25, 90, matMetal, 0.08, 0.08);

// Muro de atrás de los tendidos
paredConPuerta(R_FONDO, 1.6, 1.7 + (FILAS - 1) * 1.05 + 0.8, 0x8d3a25);

// ----- Fachada exterior con columnas, ventanas, cornisa y banderines -----
paredConPuerta(R_FACHADA, 7.0, 3.5, 0xcbb894);

const NCOL = 40;
const geoColumna = new THREE.BoxGeometry(0.7, 8.8, 0.7);
const geoVentana = new THREE.BoxGeometry(1.5, 2.7, 0.12);
const geoMastil = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6);
const geoBandera = new THREE.PlaneGeometry(1.0, 0.6);
const COLORES_BANDERA = [0x006847, 0xf2efe6, 0xce1126];

segmentosAnillo(R_FACHADA + 0.1, NCOL, true, (a, i) => {
  const r = R_FACHADA + 0.1;

  const col = new THREE.Mesh(geoColumna, matPiedra);
  col.position.set(Math.sin(a) * r, 4.4, Math.cos(a) * r);
  col.rotation.y = a;
  plaza.add(col);

  // Ventana entre esta columna y la siguiente
  const av = a + Math.PI / NCOL;
  if (!cercaDePuerta(av, r, 0.12)) {
    const ven = new THREE.Mesh(geoVentana, new THREE.MeshStandardMaterial({ color: 0x2a1f1a }));
    ven.position.set(Math.sin(av) * (R_FACHADA + 0.04), 3.3, Math.cos(av) * (R_FACHADA + 0.04));
    ven.rotation.y = av;
    plaza.add(ven);
  }

  // Banderín arriba de cada segunda columna
  if (i % 2 === 0) {
    const mastil = new THREE.Mesh(geoMastil, matMetal);
    mastil.position.set(Math.sin(a) * r, 8.8 + 1.1, Math.cos(a) * r);
    plaza.add(mastil);

    const bandera = new THREE.Mesh(
      geoBandera,
      new THREE.MeshBasicMaterial({ color: COLORES_BANDERA[(i / 2) % 3 | 0], side: THREE.DoubleSide })
    );
    bandera.position.set(Math.sin(a) * r, 8.8 + 1.9, Math.cos(a) * r);
    bandera.position.x += Math.cos(a) * 0.5;
    bandera.position.z -= Math.sin(a) * 0.5;
    bandera.rotation.y = a + Math.PI / 2;
    plaza.add(bandera);
  }
});

// Cornisa (remate de la fachada)
barandal(R_FACHADA + 0.12, 8.95, 90, matPiedra, 1.0, 0.3);

// ----- Puerta Grande -----
const pIzq = puntoBorde(R_ARENA, -1);
const pDer = puntoBorde(R_ARENA, 1);

[pIzq, pDer].forEach((p) => {
  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 3.8, 16), matPiedra);
  pilar.position.set(p.x, 1.9, p.z);
  plaza.add(pilar);

  const capitel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.0), matPiedraOscura);
  capitel.position.set(p.x, 3.95, p.z);
  plaza.add(capitel);

  const lampara = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), matLuz);
  lampara.position.set(p.x, 4.6, p.z);
  plaza.add(lampara);
});

const dxP = pDer.x - pIzq.x;
const dzP = pDer.z - pIzq.z;
const dintel = new THREE.Mesh(
  new THREE.BoxGeometry(Math.hypot(dxP, dzP) + 1.0, 0.5, 0.7),
  matPiedra
);
dintel.position.set((pIzq.x + pDer.x) / 2, 4.3, (pIzq.z + pDer.z) / 2);
dintel.rotation.y = Math.atan2(-dzP, dxP);
plaza.add(dintel);

const cartelPuerta = crearCartel('PUERTA GRANDE', '#7a1f14', '#ffe9a8', 4.4, 1.1);
cartelPuerta.position.set(
  (pIzq.x + pDer.x) / 2 - Math.sin(A_PUERTA) * 0.4,
  5.3,
  (pIzq.z + pDer.z) / 2 - Math.cos(A_PUERTA) * 0.4
);
cartelPuerta.rotation.y = A_PUERTA + Math.PI;
plaza.add(cartelPuerta);

// Túnel: paredes a los lados del hueco de la puerta, a través de los tendidos
const SEGMENTOS_TUNEL = 8;
[-1, 1].forEach((signo) => {
  for (let j = 0; j < SEGMENTOS_TUNEL; j++) {
    const r0 = R_ARENA + (R_FACHADA + 0.3 - R_ARENA) * j / SEGMENTOS_TUNEL;
    const r1 = R_ARENA + (R_FACHADA + 0.3 - R_ARENA) * (j + 1) / SEGMENTOS_TUNEL;
    const p0 = puntoBorde(r0, signo);
    const p1 = puntoBorde(r1, signo);

    const muro = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 7.4, Math.hypot(p1.x - p0.x, p1.z - p0.z) + 0.1),
      matPiedraOscura
    );
    muro.position.set((p0.x + p1.x) / 2, 3.7, (p0.z + p1.z) / 2);
    muro.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z);
    plaza.add(muro);
  }
});

// ----- Torres de luz -----
[2.3, 3.5, 4.7, 5.9].forEach((a) => {
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 14, 8), matMetal);
  poste.position.set(Math.sin(a) * 31, 7, Math.cos(a) * 31);
  plaza.add(poste);

  const foco = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.5), matLuz);
  foco.position.set(Math.sin(a) * 31, 14.3, Math.cos(a) * 31);
  foco.rotation.y = a + Math.PI; // mira hacia la plaza
  plaza.add(foco);
});

// Cielo del atardecer (B muestra/oculta la plaza)
escena.background.set(0x3b4f7a);

// ----- Público sentado en los tendidos -----
let semilla = 20261111;
function azar() {
  semilla = (semilla * 16807) % 2147483647;
  return semilla / 2147483647;
}

const COLORES_CAMISA = [0xd62828, 0xf4c430, 0x1e56c8, 0x2a9d8f, 0xffffff, 0xe85d9a, 0x8e44ad, 0xf77f00, 0x3a3a3a, 0x4caf50];
const COLORES_PANTALON = [0x1e3a8a, 0x333333, 0x6b7280, 0x7c5c3a, 0x1f2937];
const COLORES_PIEL = [0xffc18b, 0xe0a370, 0xc68642, 0x8d5524, 0xf1c27d];
const COLORES_PELO = [0x1a1a1a, 0x38251c, 0x5a3825, 0x7a2e1b, 0xd9a441, 0x777777];
const COLORES_SOMBRERO = [0xe6c885, 0xf2e2b0, 0x222222, 0xb08850];

const publico = [];

for (let i = 0; i < FILAS; i++) {
  const rAsiento = R_ARENA + 1.8 + i * 1.7 + 1.1;
  const yAsiento = 1.7 + i * 1.05;
  const n = Math.floor(2 * Math.PI * rAsiento / 1.0);

  for (let j = 0; j < n; j++) {
    const a = (j + (i % 2) * 0.5) * Math.PI * 2 / n;

    if (cercaDePuerta(a, rAsiento, 0.08)) continue; // no se sientan en la puerta
    if (azar() < 0.07) continue;                    // algunos lugares vacíos

    publico.push({
      x: Math.sin(a) * rAsiento,
      z: Math.cos(a) * rAsiento,
      y: yAsiento,
      yaw: a + Math.PI, // miran hacia el centro
      ang: a,
      fase: azar() * Math.PI * 2,
      sombrero: azar() < 0.35,
      camisa: COLORES_CAMISA[(azar() * COLORES_CAMISA.length) | 0],
      pantalon: COLORES_PANTALON[(azar() * COLORES_PANTALON.length) | 0],
      piel: COLORES_PIEL[(azar() * COLORES_PIEL.length) | 0],
      pelo: COLORES_PELO[(azar() * COLORES_PELO.length) | 0],
      colSombrero: COLORES_SOMBRERO[(azar() * COLORES_SOMBRERO.length) | 0]
    });
  }
}

const NP = publico.length;
const matInstancia = new THREE.MeshStandardMaterial({ color: 0xffffff });

function crearInstancias(geometria) {
  const m = new THREE.InstancedMesh(geometria, matInstancia, NP);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  plaza.add(m);
  return m;
}

const mPiernas = crearInstancias(new THREE.BoxGeometry(0.38, 0.16, 0.7));
const mTorso = crearInstancias(new THREE.BoxGeometry(0.46, 0.55, 0.3));
const mCabeza = crearInstancias(new THREE.SphereGeometry(0.17, 12, 10));
const mPelo = crearInstancias(new THREE.SphereGeometry(0.185, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55));
const mCopa = crearInstancias(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 10));
const mAla = crearInstancias(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 16));

const _col = new THREE.Color();
publico.forEach((s, i) => {
  mPiernas.setColorAt(i, _col.setHex(s.pantalon));
  mTorso.setColorAt(i, _col.setHex(s.camisa));
  mCabeza.setColorAt(i, _col.setHex(s.piel));
  mPelo.setColorAt(i, _col.setHex(s.pelo));
  mCopa.setColorAt(i, _col.setHex(s.colSombrero));
  mAla.setColorAt(i, _col.setHex(s.colSombrero));
});

const _ficticio = new THREE.Object3D();

// Coloca una pieza de una persona sentada (lx, ly, lz = posición local; alzar = cuánto se levanta)
function ponerParte(malla, i, s, lx, ly, lz, alzar, esc = 1) {
  const c = Math.cos(s.yaw);
  const n = Math.sin(s.yaw);
  _ficticio.position.set(
    s.x + lx * c + lz * n,
    s.y + ly + alzar,
    s.z - lx * n + lz * c
  );
  _ficticio.rotation.set(0, s.yaw, 0);
  _ficticio.scale.setScalar(esc);
  _ficticio.updateMatrix();
  malla.setMatrixAt(i, _ficticio.matrix);
}

// Las piernas (y los sombreros ocultos) se colocan una sola vez
publico.forEach((s, i) => {
  ponerParte(mPiernas, i, s, 0, 0.08, 0.3, 0);
  if (!s.sombrero) {
    ponerParte(mCopa, i, s, 0, 1.05, 0, 0, 0);
    ponerParte(mAla, i, s, 0, 0.99, 0, 0, 0);
  }
});

function posicionarPublico(t, emocion) {
  for (let i = 0; i < NP; i++) {
    const s = publico[i];

    // Saltitos cuando hay emoción; "ola" cuando todo está tranquilo
    const salto = Math.pow(Math.max(0, Math.sin(t * (6 + (s.fase % 2)) + s.fase)), 2) * 0.3 * emocion;
    const ola = Math.pow(Math.max(0, Math.sin(s.ang * 3 - t * 2.2)), 3) * 0.3 * (1 - emocion);
    const alzar = salto + ola;

    ponerParte(mTorso, i, s, 0, 0.44, 0, alzar);
    ponerParte(mCabeza, i, s, 0, 0.9, 0, alzar);
    ponerParte(mPelo, i, s, 0, 0.92, -0.015, alzar);

    if (s.sombrero) {
      ponerParte(mCopa, i, s, 0, 1.05, 0, alzar);
      ponerParte(mAla, i, s, 0, 0.99, 0, alzar);
    }
  }

  mTorso.instanceMatrix.needsUpdate = true;
  mCabeza.instanceMatrix.needsUpdate = true;
  mPelo.instanceMatrix.needsUpdate = true;
  mCopa.instanceMatrix.needsUpdate = true;
  mAla.instanceMatrix.needsUpdate = true;
}

posicionarPublico(0, 0.15);
mPiernas.instanceMatrix.needsUpdate = true;

// Qué tan emocionado está el público en cada momento
const EMOCION = {
  espera: 0.15, persigue: 0.8, levanta: 1, camina: 0.5, entrega: 0.5, paga: 0.5, fin: 1,
  va_mesa: 0.2, bebe: 0.2, mareada: 0.6, vomita: 0.8, avanza: 0.8, cae: 1, caida: 0.9,
  auxilio: 0.6, cargan: 0.5, sube: 0.8, se_va: 1, se_fue: 0.3
};

let emocionPublico = 0.15;
let ultimoPublico = 0;

animaciones.push((t) => {
  const delta = Math.min(Math.max(t - ultimoPublico, 0), 0.05);
  ultimoPublico = t;

  if (!plaza.visible) return; // si ocultaste la plaza con B, no gastar tiempo

  const objetivo = EMOCION[estado] ?? 0.2;
  emocionPublico += (objetivo - emocionPublico) * Math.min(delta * 3, 1);
  posicionarPublico(t, emocionPublico);
});

// ==================================================
//                 VARIABLES DE JUEGO
// ==================================================

let inicioBrinco = -10;
const DURACION = 0.8;

// Estados: espera → persigue → levanta → camina → entrega → paga → fin
//          → va_mesa → bebe → mareada → vomita → avanza → cae → caida
let estado = 'espera';
let tEstado = 0;
let elevacion = 0; // 0 = en el suelo, 1 = en brazos

function cambiarEstado(nuevo) {
  estado = nuevo;
  tEstado = 0;
}

const capturado = () => estado !== 'espera' && estado !== 'persigue';

const ESTADOS_BAR = ['va_mesa', 'bebe', 'mareada', 'vomita', 'avanza', 'cae', 'caida'];
const enBar = () => ESTADOS_BAR.includes(estado);

// Después de caerse: las amigas la cargan, la suben a la camioneta y se la llevan
const ESTADOS_RESCATE = ['auxilio', 'cargan', 'sube', 'se_va', 'se_fue'];
const enRescate = () => ESTADOS_RESCATE.includes(estado);

const LARGO_CUERPO = 1.3;   // de los pies de Ingrid al centro de su cuerpo (acostada)
const subeCentro = new THREE.Vector3();
let subeGiro = 0;
let velCarro = 0;

// Lugar de cada amiga alrededor de Ingrid: 0 y 1 la cargan, 2 y 3 caminan detrás
function slotRescate(i) {
  const ry = persona.rotation.y;
  const fx = Math.sin(ry);
  const fz = Math.cos(ry);
  const rx = Math.cos(ry);
  const rz = -Math.sin(ry);
  const lado = [-0.95, 0.95, -0.5, 0.5][i];
  const adelante = [LARGO_CUERPO, LARGO_CUERPO, -1.0, -1.0][i];

  return new THREE.Vector3(
    persona.position.x + fx * adelante + rx * lado,
    0,
    persona.position.z + fz * adelante + rz * lado
  );
}
let baseAvance = 0;

const VELOCIDAD_PERSONA = 3.5;
const VELOCIDAD_CARGANDO = 2.6;
const DISTANCIA_ATRAPAR = 1.8;
const DISTANCIA_ENTREGA = 4.4; // separación entre muchacha y comprador al entregar

// Chuleta en brazos: a la altura del pecho, delante de la persona
const ALTURA_CARGADO = 1.0;
const ADELANTE_CARGADO = 1.1;
const ADELANTE_COMPRADOR = 2.1; // el comprador es muy ancho: sostiene a Chuleta más lejos
const DISTANCIA_PAGO = 2.7;     // qué tan cerca se para la muchacha para cobrar
const LADO_CERDO = 2.1;         // a qué distancia de su costado deja a Chuleta
let tPago = 0;

// Ángulos de brazos (rotación en X; negativo = hacia adelante)
const BRAZOS_CARGANDO = -Math.PI * 0.35;
const BRAZOS_EXTENDIDOS = -Math.PI * 0.5;

let ultimoTiempo = 0;

// ----- Movimiento de Chuleta -----
const VEL_CERDO = 3.2;        // unidades por segundo al caminar
const FACTOR_CORRER = 1.8;    // multiplicador con Shift (más rápido que la persona)
const LIMITE = 9.5;           // borde de la cuadrícula

const teclas = new Set();
let vx = 0;
let vz = 0;
let fase = 0;                 // fase del ciclo de caminata
let tumbado = 0;              // 0 = de pie, 1 = acostado (dormir)
let ultimoCerdo = 0;

// ----- Movimiento por ejes -----
// true  = solo se mueve sobre un eje a la vez (adelante/atrás en Z, izquierda/derecha en X)
//         y NO gira solo: conserva su orientación (T para cambiar de modo)
// false = movimiento libre en diagonal y gira hacia donde camina
let modoEjes = true;
let ultimoEje = 'z';

// ----- Escalamiento y sesgado (shear) de Chuleta -----
let escalaCerdo = 1;
let sesgoX = 0;   // x' = x + sesgoX * y  (se inclina de lado)
let sesgoZ = 0;   // z' = z + sesgoZ * y  (se inclina hacia adelante/atrás)

function actualizarForma(delta) {
  if (capturado()) {
    // Al atraparlo vuelve a su forma normal
    const kr = Math.min(delta * 4, 1);
    escalaCerdo += (1 - escalaCerdo) * kr;
    sesgoX += (0 - sesgoX) * kr;
    sesgoZ += (0 - sesgoZ) * kr;
  } else {
    if (teclas.has('KeyX')) escalaCerdo *= 1 + 1.2 * delta;
    if (teclas.has('KeyZ')) escalaCerdo /= 1 + 1.2 * delta;
    if (teclas.has('KeyD')) sesgoX += 1.2 * delta;
    if (teclas.has('KeyA')) sesgoX -= 1.2 * delta;
    if (teclas.has('KeyW')) sesgoZ += 1.2 * delta;
    if (teclas.has('KeyS')) sesgoZ -= 1.2 * delta;

    if (teclas.has('Digit0') || teclas.has('Numpad0')) {
      escalaCerdo = 1;
      sesgoX = 0;
      sesgoZ = 0;
    }

    escalaCerdo = THREE.MathUtils.clamp(escalaCerdo, 0.4, 3);
    sesgoX = THREE.MathUtils.clamp(sesgoX, -1.5, 1.5);
    sesgoZ = THREE.MathUtils.clamp(sesgoZ, -1.5, 1.5);
  }

  // Matriz = Sesgado · Escalamiento (se aplica desde los pies del cerdo)
  forma.matrix.set(
    escalaCerdo, sesgoX * escalaCerdo, 0, 0,
    0, escalaCerdo, 0, 0,
    0, sesgoZ * escalaCerdo, escalaCerdo, 0,
    0, 0, 0, 1
  );
  forma.matrixWorldNeedsUpdate = true;

  datos['Escala'] = escalaCerdo.toFixed(2);
  datos['Sesgado'] = `X ${sesgoX.toFixed(2)} · Z ${sesgoZ.toFixed(2)}`;
}

// Punto delante de una persona
function frente(p, distancia) {
  return new THREE.Vector3(
    p.position.x + Math.sin(p.rotation.y) * distancia,
    0,
    p.position.z + Math.cos(p.rotation.y) * distancia
  );
}

// Acerca suavemente la rotación de un brazo/pierna a un ángulo
function hacia(obj, objetivo, k) {
  obj.rotation.x += (objetivo - obj.rotation.x) * k;
}

// Deja a Chuleta en el suelo, al costado del comprador
function ponerCerdoAlLado(delta) {
  const th = comprador.rotation.y;
  const derecha = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
  const adelante = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));

  const objetivo = new THREE.Vector3()
    .copy(comprador.position)
    .addScaledVector(derecha, LADO_CERDO)
    .addScaledVector(adelante, 0.3);

  const kc = Math.min(delta * 4, 1);
  robot.position.x += (objetivo.x - robot.position.x) * kc;
  robot.position.z += (objetivo.z - robot.position.z) * kc;
  robot.position.y += (0 - robot.position.y) * kc;

  // Mira hacia donde mira el comprador (hacia la muchacha)
  robot.rotation.y += difAngulo(robot.rotation.y, th) * kc;
  pivote.rotation.x = 0;
  pivote.rotation.z = 0;
}

// Coloca a Chuleta de forma rígida en brazos de alguien
function colocarCerdo(pos, y, persona, t) {
  robot.position.set(pos.x, y, pos.z);
  robot.rotation.y = persona.rotation.y + Math.PI;
  pivote.rotation.x = 0;
  pivote.rotation.z = Math.sin(t * 12) * 0.08;
}

// ==================================================
//                      EMOTES
// ==================================================

const EMOTES = {
  baile:  { etiqueta: 'Baile',   duracion: 3.5 },
  amor:   { etiqueta: 'Amor',    duracion: 2.8 },
  dormir: { etiqueta: 'Dormir',  duracion: Infinity }, // dura hasta que se mueva
  alegria:{ etiqueta: 'Alegría', duracion: 3.0 },
  giro:   { etiqueta: 'Giro',    duracion: 1.3 },
  oink:   { etiqueta: '¡Oink!',  duracion: 1.8 }
};

const TECLA_EMOTE = {
  Digit1: 'baile',   Numpad1: 'baile',
  Digit2: 'amor',    Numpad2: 'amor',
  Digit3: 'dormir',  Numpad3: 'dormir',
  Digit4: 'alegria', Numpad4: 'alegria',
  Digit5: 'giro',    Numpad5: 'giro',
  Digit6: 'oink',    Numpad6: 'oink'
};

let emote = null;
let tEmote = 0;
let baseGiro = 0;
let proxParticula = 0;

function iniciarEmote(nombre) {
  if (capturado()) return;

  // Presionar la misma tecla otra vez lo cancela
  if (emote === nombre) {
    cancelarEmote();
    return;
  }

  emote = nombre;
  tEmote = 0;
  baseGiro = robot.rotation.y;
  proxParticula = 0;
}

function cancelarEmote() {
  emote = null;
  burbuja.visible = false;
}

// Partículas flotantes (corazones, notas, estrellas, Z...)
const particulas = [];

function lanzarParticula(texto, color) {
  const sprite = crearGlifo(texto, color);
  sprite.position.set(
    robot.position.x + (Math.random() - 0.5) * 0.8,
    robot.position.y + 1.9,
    robot.position.z + (Math.random() - 0.5) * 0.8
  );
  escena.add(sprite);

  particulas.push({
    sprite,
    vida: 1.6,
    vx: (Math.random() - 0.5) * 0.6,
    vy: 0.9 + Math.random() * 0.5
  });
}

function actualizarParticulas(delta) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.vida -= delta;

    if (p.vida <= 0) {
      escena.remove(p.sprite);
      p.sprite.material.map.dispose();
      p.sprite.material.dispose();
      particulas.splice(i, 1);
      continue;
    }

    p.sprite.position.x += p.vx * delta;
    p.sprite.position.y += p.vy * delta;
    p.sprite.material.opacity = Math.min(p.vida / 0.6, 1);
  }
}

// Lanza una partícula cada cierto intervalo
function emitir(delta, intervalo, texto, color) {
  proxParticula -= delta;
  if (proxParticula <= 0) {
    lanzarParticula(texto, color);
    proxParticula = intervalo;
  }
}

// ==================================================
//                  CÁMARAS (tecla C)
// ==================================================

const VISTAS = ['Libre (órbita)', 'Seguir a Chuleta', 'Vista desde arriba', 'Primera persona (Chuleta)'];
let vista = 0;

const _destino = new THREE.Vector3();
const _mirada = new THREE.Vector3();
const miraSuave = new THREE.Vector3(0, 1.8, 0);

function cambiarVista() {
  vista = (vista + 1) % VISTAS.length;

  if (vista === 0) {
    // Volver a la órbita libre desde la posición inicial
    camara.position.set(6, 6, 12);
    controles.target.set(0, 1.8, 0);
    controles.enabled = true;
  } else {
    controles.enabled = false;
    miraSuave.copy(robot.position);
  }
}

function actualizarCamara(delta) {
  if (vista === 0) {
    controles.update();
    return;
  }

  const ry = robot.rotation.y;
  const fx = Math.sin(ry);
  const fz = Math.cos(ry);
  const suave = Math.min(delta * 5, 1);

  if (vista === 1) {
    // Tercera persona: detrás y arriba de Chuleta
    _destino.set(
      robot.position.x - fx * 6,
      robot.position.y + 3.5,
      robot.position.z - fz * 6
    );
    camara.position.lerp(_destino, suave);

    _mirada.set(robot.position.x, robot.position.y + 1, robot.position.z);
    miraSuave.lerp(_mirada, suave * 1.5);
    camara.lookAt(miraSuave);

  } else if (vista === 2) {
    // Cenital: toda la escena desde arriba
    _destino.set(0, 24, 0.01);
    camara.position.lerp(_destino, suave);

    _mirada.set(0, 0, 0);
    miraSuave.lerp(_mirada, suave * 1.5);
    camara.lookAt(miraSuave);

  } else if (vista === 3) {
    // Primera persona: los ojos de Chuleta
    camara.position.set(
      robot.position.x + fx * 1.7,
      robot.position.y + 1.4,
      robot.position.z + fz * 1.7
    );
    camara.lookAt(
      robot.position.x + fx * 6,
      robot.position.y + 1.2,
      robot.position.z + fz * 6
    );
  }
}

// ==================================================
//                 CONTROLES DEL CERDO
// ==================================================

function reiniciar() {
  cambiarEstado('espera');
  elevacion = 0;

  robot.position.set(0, 0, 0);
  robot.rotation.set(0, 0, 0);
  pivote.rotation.set(0, 0, 0);

  vx = 0;
  vz = 0;
  tumbado = 0;
  tPago = 0;
  escalaCerdo = 1;
  sesgoX = 0;
  sesgoZ = 0;
  cancelarEmote();

  persona.position.copy(POSICION_INICIAL_PERSONA);
  persona.rotation.set(0, 0, 0);

  comprador.position.copy(POSICION_COMPRADOR);
  comprador.rotation.set(
    0, Math.atan2(-POSICION_COMPRADOR.x, -POSICION_COMPRADOR.z), 0
  );

  [muchacha, vendedor].forEach((p) => {
    p.brazoIzq.rotation.set(0, 0, 0);
    p.brazoDer.rotation.set(0, 0, 0);
    p.piernaIzq.rotation.set(0, 0, 0);
    p.piernaDer.rotation.set(0, 0, 0);
  });

  billete.visible = false;
  etiquetaPago.visible = false;

  extras.forEach((m, i) => {
    const c = EXTRAS[i];
    m.grupo.position.set(c.pos[0], 0, c.pos[2]);
    m.grupo.rotation.set(0, Math.atan2(-c.pos[0], -c.pos[2]), 0);
    m.brazoIzq.rotation.set(0, 0, 0);
    m.brazoDer.rotation.set(0, 0, 0);
    m.piernaIzq.rotation.set(0, 0, 0);
    m.piernaDer.rotation.set(0, 0, 0);
    m.enojo.visible = false;
    m.tEnojo = 0;
    m.vaso.visible = false;
  });

  // Bar: vaso, charco y gotas de vómito
  vasoIngrid.visible = false;
  charco.visible = false;
  charco.scale.setScalar(0.01);
  vomitos.forEach((p) => {
    escena.remove(p.m);
    p.m.geometry.dispose();
  });
  vomitos.length = 0;

  // Camioneta de regreso a su lugar (lejos, afuera de la plaza)
  carro.position.copy(CARRO_INICIO);
  carro.rotation.y = CARRO_GIRO;
  ruedas.forEach((r) => { r.rotation.x = 0; });
  velCarro = 0;
}

const TECLAS_BLOQUEADAS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'
]);

addEventListener('keydown', (e) => {

  // Reiniciar la escena
  if (e.code === 'KeyR') {
    reiniciar();
    return;
  }

  // Cambiar perspectiva de la cámara
  if (e.code === 'KeyC') {
    if (!e.repeat) cambiarVista();
    return;
  }

  // T: alternar entre movimiento por ejes y movimiento libre
  if (e.code === 'KeyT') {
    if (!e.repeat) modoEjes = !modoEjes;
    return;
  }

  // B: mostrar / ocultar la plaza de toros
  if (e.code === 'KeyB') {
    if (!e.repeat) {
      plaza.visible = !plaza.visible;
      escena.background.set(plaza.visible ? 0x3b4f7a : 0x0f1420);
    }
    return;
  }

  // I: empiezan a corretear a Chuleta
  if (e.code === 'KeyI') {
    if (estado === 'espera') cambiarEstado('persigue');
    return;
  }

  // Evitar que las flechas / espacio muevan la página
  if (TECLAS_BLOQUEADAS.has(e.code)) {
    e.preventDefault();
  }

  // Si Chuleta fue atrapado ya no se puede mover
  if (capturado()) return;

  teclas.add(e.code);

  // Recordar el último eje que se presionó
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') ultimoEje = 'x';
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') ultimoEje = 'z';

  // Emotes
  if (TECLA_EMOTE[e.code] && !e.repeat) {
    iniciarEmote(TECLA_EMOTE[e.code]);
  }

  // Salto
  if (e.code === 'Space') {
    const ahora = reloj.getElapsedTime();

    if (ahora - inicioBrinco > DURACION) {
      inicioBrinco = ahora;
      cancelarEmote();
    }
  }

});

addEventListener('keyup', (e) => {
  teclas.delete(e.code);
});

// Si la ventana pierde el foco, soltar todas las teclas
addEventListener('blur', () => {
  teclas.clear();
});

// ==================================================
//                  ANIMACIÓN DEL CERDO
// ==================================================

animaciones.push((t) => {

  const delta = Math.min(Math.max(t - ultimoCerdo, 0), 0.05);
  ultimoCerdo = t;

  actualizarParticulas(delta);
  actualizarForma(delta);

  // ---------- Atrapado: la persona controla la posición ----------
  if (capturado()) {
    if (emote) cancelarEmote();

    // Chuleta patalea mientras lo cargan; ya en el suelo solo mueve la cola
    const cargado = estado === 'levanta' || estado === 'camina' || estado === 'entrega';
    const pataleo = cargado ? Math.sin(t * 12) * 0.35 : 0;
    pataDelIzq.rotation.x = pataleo;
    pataDelDer.rotation.x = -pataleo;
    pataTrasIzq.rotation.x = -pataleo;
    pataTrasDer.rotation.x = pataleo;

    cerdo.position.set(0, 0, 0);
    cerdo.rotation.set(0, 0, 0);
    cabeza.rotation.set(0, 0, 0);
    pivote.position.y = 0.9;
    pivote.scale.set(1, 1, 1);
    cola.rotation.z = Math.sin(t * (cargado ? 12 : 7)) * 0.5;

    vx = 0;
    vz = 0;
    tumbado = 0;
    return;
  }

  // ---------- Entrada de teclado ----------
  let ix = 0;
  let iz = 0;
  if (teclas.has('ArrowRight')) ix += 1;
  if (teclas.has('ArrowLeft')) ix -= 1;
  if (teclas.has('ArrowDown')) iz += 1;
  if (teclas.has('ArrowUp')) iz -= 1;

  // Modo ejes: si hay dos flechas a la vez, solo cuenta el eje de la última presionada
  if (modoEjes && ix !== 0 && iz !== 0) {
    if (ultimoEje === 'x') iz = 0;
    else ix = 0;
  }

  const hayMovimiento = ix !== 0 || iz !== 0;

  // Moverse cancela cualquier emote
  if (hayMovimiento && emote) cancelarEmote();

  // ---------- Velocidad con aceleración suave ----------
  const correr = teclas.has('ShiftLeft') || teclas.has('ShiftRight');
  const vMax = VEL_CERDO * (correr ? FACTOR_CORRER : 1);

  let objX = 0;
  let objZ = 0;
  if (hayMovimiento) {
    const largo = Math.hypot(ix, iz);
    objX = (ix / largo) * vMax;
    objZ = (iz / largo) * vMax;
  }

  const kv = Math.min(delta * (hayMovimiento ? 7 : 10), 1);
  vx += (objX - vx) * kv;
  vz += (objZ - vz) * kv;

  robot.position.x = THREE.MathUtils.clamp(robot.position.x + vx * delta, -LIMITE, LIMITE);
  robot.position.z = THREE.MathUtils.clamp(robot.position.z + vz * delta, -LIMITE, LIMITE);

  const velocidad = Math.hypot(vx, vz);

  // (La persecución ya no empieza sola: se inicia con la tecla I)

  // ---------- Orientación: gira suavemente hacia donde camina ----------
  if (!emote) {
    if (!modoEjes && velocidad > 0.3) {
      const objetivo = Math.atan2(vx, vz);
      robot.rotation.y += difAngulo(robot.rotation.y, objetivo) * Math.min(delta * 10, 1);
    }

    // Giro manual con Q / E
    if (teclas.has('KeyQ')) robot.rotation.y += 2.8 * delta;
    if (teclas.has('KeyE')) robot.rotation.y -= 2.8 * delta;
  }

  // ---------- Ciclo de caminata ----------
  fase += delta * velocidad * 2.8;
  const amp = Math.min(velocidad / VEL_CERDO, 1.8); // 0 quieto, 1 caminando, ~1.8 corriendo
  const bal = Math.sin(fase);
  const paso = 0.55 * amp;

  // Patas en diagonal (trote): delantera izq + trasera der, y al revés
  pataDelIzq.rotation.x = bal * paso;
  pataTrasDer.rotation.x = bal * paso;
  pataDelDer.rotation.x = -bal * paso;
  pataTrasIzq.rotation.x = -bal * paso;

  // Cuerpo: rebote, balanceo lateral y contoneo
  cerdo.position.set(0, Math.abs(bal) * 0.07 * amp, 0);
  cerdo.rotation.z = bal * 0.06 * amp;
  cerdo.rotation.x = Math.sin(fase * 2) * 0.025 * amp;
  cerdo.rotation.y = bal * 0.05 * amp;

  // Cabeza, orejas y cola
  cabeza.rotation.x = Math.sin(fase * 2) * 0.06 * amp;
  cabeza.rotation.y = 0.2 * Math.sin(t * 2) * (1 - Math.min(amp, 1)) - bal * 0.08 * amp;
  cabeza.rotation.z = 0;

  orejaIzq.rotation.z = 0.5 + Math.sin(fase * 2 + 1) * 0.18 * amp;
  orejaDer.rotation.z = -0.5 - Math.sin(fase * 2 + 1) * 0.18 * amp;

  cola.rotation.z = Math.sin(t * 5) * 0.35;

  pivote.position.y = 0.9;
  pivote.scale.set(1, 1, 1);
  robot.position.y = 0;

  // ---------- Salto con vuelta ----------
  const s = t - inicioBrinco;
  const saltando = s >= 0 && s < DURACION;

  if (saltando) {
    const p = Math.min(Math.max(s / DURACION, 0), 1);

    robot.position.y = Math.sin(p * Math.PI) * 2;
    pivote.rotation.x = -p * Math.PI * 2;

    // Patas recogidas en el aire
    const recoger = Math.sin(p * Math.PI) * 0.8;
    pataDelIzq.rotation.x = recoger;
    pataDelDer.rotation.x = recoger;
    pataTrasIzq.rotation.x = -recoger;
    pataTrasDer.rotation.x = -recoger;
  } else {
    pivote.rotation.x = 0;
  }

  // ---------- Emotes ----------
  if (emote && !saltando) {
    tEmote += delta;
    const te = tEmote;
    const def = EMOTES[emote];

    if (te > def.duracion) {
      cancelarEmote();
    } else {
      switch (emote) {

        case 'baile': {
          const w = Math.sin(te * 9);
          cerdo.rotation.y = w * 0.6;
          cerdo.rotation.z = Math.sin(te * 4.5) * 0.15;
          robot.position.y = Math.abs(Math.sin(te * 4.5)) * 0.25;

          pataDelIzq.rotation.x = w * 0.6;
          pataTrasDer.rotation.x = w * 0.6;
          pataDelDer.rotation.x = -w * 0.6;
          pataTrasIzq.rotation.x = -w * 0.6;

          cabeza.rotation.z = w * 0.25;
          orejaIzq.rotation.z = 0.5 + w * 0.3;
          orejaDer.rotation.z = -0.5 + w * 0.3;
          cola.rotation.z = Math.sin(te * 14) * 0.6;

          emitir(delta, 0.4, Math.random() > 0.5 ? '♪' : '♫', '#9ad1ff');
          break;
        }

        case 'amor': {
          const latido = Math.sin(te * 8);
          pivote.scale.setScalar(1 + 0.05 * latido);
          robot.position.y = Math.abs(Math.sin(te * 3)) * 0.1;

          cabeza.rotation.x = -0.15;
          cabeza.rotation.z = Math.sin(te * 3) * 0.2;
          cola.rotation.z = Math.sin(te * 16) * 0.7;

          emitir(delta, 0.25, '❤', '#ff4d79');
          break;
        }

        case 'dormir': {
          // Respiración lenta
          const resp = Math.sin(te * 2.2);
          pivote.scale.set(1 + resp * 0.03, 1 + resp * 0.03, 1 + resp * 0.03);

          cabeza.rotation.x = 0.25;
          cola.rotation.z = Math.sin(te * 1.2) * 0.1;

          emitir(delta, 0.9, 'Z', '#cfe3ff');
          break;
        }

        case 'alegria': {
          const h = Math.abs(Math.sin(te * 8));
          robot.position.y = h * 0.9;

          // Aplastamiento al caer
          const aplasta = 1 - h;
          pivote.scale.set(1 + 0.1 * aplasta, 1 - 0.1 * aplasta, 1 + 0.1 * aplasta);

          pataDelIzq.rotation.x = -h * 0.9;
          pataDelDer.rotation.x = -h * 0.9;
          pataTrasIzq.rotation.x = h * 0.5;
          pataTrasDer.rotation.x = h * 0.5;

          orejaIzq.rotation.z = 0.5 + Math.sin(te * 16) * 0.4;
          orejaDer.rotation.z = -0.5 - Math.sin(te * 16) * 0.4;
          cola.rotation.z = Math.sin(te * 20) * 0.7;

          emitir(delta, 0.2, '★', '#ffd84d');
          break;
        }

        case 'giro': {
          const u = Math.min(te / def.duracion, 1);
          const suave = u * u * (3 - 2 * u);

          // Dos vueltas completas con un saltito
          robot.rotation.y = baseGiro + suave * Math.PI * 4;
          robot.position.y = Math.sin(u * Math.PI) * 0.7;

          const recoger = Math.sin(u * Math.PI) * 0.7;
          pataDelIzq.rotation.x = recoger;
          pataDelDer.rotation.x = recoger;
          pataTrasIzq.rotation.x = -recoger;
          pataTrasDer.rotation.x = -recoger;

          cola.rotation.z = Math.sin(te * 18) * 0.6;

          emitir(delta, 0.15, '✦', '#ffffff');
          break;
        }

        case 'oink': {
          burbuja.visible = true;
          const pop = Math.min(te / 0.15, 1);
          burbuja.scale.set(2.4 * pop, 0.6 * pop, 1);
          burbuja.position.y = 3.1 + Math.sin(te * 6) * 0.05;

          // Cabeza arriba como cantando "¡oink!"
          cabeza.rotation.x = -0.35 * Math.abs(Math.sin(te * 9));
          cerdo.rotation.x = -0.05 * Math.abs(Math.sin(te * 9));
          cola.rotation.z = Math.sin(te * 12) * 0.6;
          break;
        }
      }
    }
  }

  // ---------- Acostarse / levantarse suavemente ----------
  const objetivoTumbado = emote === 'dormir' ? 1 : 0;
  tumbado += (objetivoTumbado - tumbado) * Math.min(delta * 4, 1);
  pivote.rotation.z = tumbado * (Math.PI / 2);

  // ---------- Información en pantalla ----------
  datos['Traslación'] = vec(robot.position);

  datos['Rotación Y'] =
    `${THREE.MathUtils.radToDeg(robot.rotation.y).toFixed(1)}°`;

  datos['Velocidad'] = velocidad.toFixed(1) + ' m/s' + (correr && hayMovimiento ? ' (corriendo)' : '');
  datos['Emote'] = emote ? EMOTES[emote].etiqueta : '—';
  datos['Movimiento'] = modoEjes
    ? 'Por ejes (T = libre): ↑ −Z · ↓ +Z · ← −X · → +X'
    : 'Libre (T = por ejes)';

});

// ==================================================
//   PERSECUCIÓN, CAPTURA, ENTREGA, PAGO Y FIESTA
// ==================================================

const _manoA = new THREE.Vector3();
const _manoB = new THREE.Vector3();

animaciones.push((t) => {

  // Tiempo entre fotogramas
  const delta = Math.min(Math.max(t - ultimoTiempo, 0), 0.05);
  ultimoTiempo = t;
  tEstado += delta;

  actualizarVomitos(delta);

  // Chuleta se queda junto al comprador mientras Ingrid está de fiesta
  if (enBar() || enRescate()) ponerCerdoAlLado(delta);

  const k = Math.min(delta * 8, 1);

  // Distancia entre la muchacha y Chuleta
  const dx = robot.position.x - persona.position.x;
  const dz = robot.position.z - persona.position.z;
  const distancia = Math.sqrt(dx * dx + dz * dz);

  // La camioneta entra de reversa por la Puerta Grande cuando Ingrid se cae
  if (['cae', 'caida', 'auxilio', 'cargan'].includes(estado) && carro.position.x > CARRO_PARQUEO.x) {
    const falta = carro.position.x - CARRO_PARQUEO.x;
    const pasoCarro = Math.min(Math.min(11, 2 + falta * 1.2) * delta, falta);
    carro.position.x -= pasoCarro;
    ruedas.forEach((r) => { r.rotation.x -= pasoCarro / 0.45; });
  }
  const carroListo = carro.position.x <= CARRO_PARQUEO.x + 0.05;

  switch (estado) {

    // ---------- Esperando ----------
    case 'espera': {
      piernaIzq.rotation.x = 0;
      piernaDer.rotation.x = 0;
      brazoIzq.rotation.x = 0;
      brazoDer.rotation.x = 0;
      persona.position.y = 0;
      break;
    }

    // ---------- Persiguiendo ----------
    case 'persigue': {
      if (distancia > DISTANCIA_ATRAPAR) {

        persona.position.x += (dx / distancia) * VELOCIDAD_PERSONA * delta;
        persona.position.z += (dz / distancia) * VELOCIDAD_PERSONA * delta;
        persona.rotation.y = Math.atan2(dx, dz);

        const carrera = Math.sin(t * 14);
        piernaIzq.rotation.x = carrera * 0.9;
        piernaDer.rotation.x = -carrera * 0.9;
        brazoIzq.rotation.x = -carrera * 0.8;
        brazoDer.rotation.x = carrera * 0.8;
        persona.position.y = Math.abs(carrera) * 0.08;

      } else {
        // Llegó hasta Chuleta: lo atrapa
        persona.rotation.y = Math.atan2(dx, dz);
        cambiarEstado('levanta');
      }
      break;
    }

    // ---------- Lo levanta (solo hasta el pecho) ----------
    case 'levanta': {
      elevacion = Math.min(elevacion + delta * 1.5, 1);
      const suave = elevacion * elevacion * (3 - 2 * elevacion);

      persona.position.y = 0;
      hacia(piernaIzq, 0, k);
      hacia(piernaDer, 0, k);
      hacia(brazoIzq, BRAZOS_CARGANDO * suave, k);
      hacia(brazoDer, BRAZOS_CARGANDO * suave, k);

      const f = frente(persona, ADELANTE_CARGADO * suave);
      const kc = Math.min(delta * 10, 1);
      robot.position.x += (f.x - robot.position.x) * kc;
      robot.position.z += (f.z - robot.position.z) * kc;
      robot.position.y = ALTURA_CARGADO * suave;

      // Chuleta mira a la persona y patalea un poco
      robot.rotation.y = persona.rotation.y + Math.PI;
      pivote.rotation.x = 0;
      pivote.rotation.z = Math.sin(t * 12) * 0.15 * suave;

      if (elevacion >= 1) cambiarEstado('camina');
      break;
    }

    // ---------- Camina hacia el comprador cargando a Chuleta ----------
    case 'camina': {
      const bx = comprador.position.x - persona.position.x;
      const bz = comprador.position.z - persona.position.z;
      const d = Math.sqrt(bx * bx + bz * bz);

      persona.rotation.y = Math.atan2(bx, bz);
      // El comprador se voltea hacia ella
      comprador.rotation.y = Math.atan2(-bx, -bz);

      hacia(brazoIzq, BRAZOS_CARGANDO, k);
      hacia(brazoDer, BRAZOS_CARGANDO, k);

      if (d > DISTANCIA_ENTREGA) {
        persona.position.x += (bx / d) * VELOCIDAD_CARGANDO * delta;
        persona.position.z += (bz / d) * VELOCIDAD_CARGANDO * delta;

        const paso = Math.sin(t * 10);
        piernaIzq.rotation.x = paso * 0.6;
        piernaDer.rotation.x = -paso * 0.6;
        persona.position.y = Math.abs(paso) * 0.05;
      } else {
        piernaIzq.rotation.x = 0;
        piernaDer.rotation.x = 0;
        persona.position.y = 0;
        cambiarEstado('entrega');
      }

      colocarCerdo(
        frente(persona, ADELANTE_CARGADO),
        ALTURA_CARGADO + persona.position.y,
        persona,
        t
      );
      break;
    }

    // ---------- Le entrega a Chuleta al comprador ----------
    case 'entrega': {
      const e = Math.min(tEstado / 1.2, 1);
      const suave = e * e * (3 - 2 * e);

      hacia(brazoIzq, BRAZOS_CARGANDO, k);
      hacia(brazoDer, BRAZOS_CARGANDO, k);
      hacia(vendedor.brazoIzq, BRAZOS_CARGANDO, k);
      hacia(vendedor.brazoDer, BRAZOS_CARGANDO, k);

      const origen = frente(persona, ADELANTE_CARGADO);
      const destino = frente(comprador, ADELANTE_COMPRADOR);
      const pos = origen.lerp(destino, suave);

      robot.position.set(pos.x, ALTURA_CARGADO + Math.sin(suave * Math.PI) * 0.2, pos.z);
      robot.rotation.y = comprador.rotation.y + Math.PI;
      pivote.rotation.x = 0;
      pivote.rotation.z = Math.sin(t * 12) * 0.08;

      if (e >= 1) {
        tPago = 0;
        cambiarEstado('paga');
      }
      break;
    }

    // ---------- El comprador paga 300 pesos ----------
    case 'paga': {
      const bx = comprador.position.x - persona.position.x;
      const bz = comprador.position.z - persona.position.z;
      const d = Math.sqrt(bx * bx + bz * bz);

      persona.rotation.y = Math.atan2(bx, bz);
      comprador.rotation.y = Math.atan2(-bx, -bz);

      // Suelta a Chuleta en el suelo, a su costado
      ponerCerdoAlLado(delta);
      hacia(vendedor.brazoIzq, 0, k);

      // Un momento para que Chuleta se quite del camino
      if (tEstado < 0.8) {
        hacia(vendedor.brazoDer, 0, k);
        hacia(brazoIzq, 0, k);
        hacia(brazoDer, 0, k);
        break;
      }

      // La muchacha se acerca para cobrar
      if (d > DISTANCIA_PAGO) {
        persona.position.x += (bx / d) * 2.2 * delta;
        persona.position.z += (bz / d) * 2.2 * delta;

        const paso = Math.sin(t * 10);
        piernaIzq.rotation.x = paso * 0.6;
        piernaDer.rotation.x = -paso * 0.6;
        persona.position.y = Math.abs(paso) * 0.05;

        hacia(vendedor.brazoDer, 0, k);
        hacia(brazoIzq, 0, k);
        hacia(brazoDer, 0, k);
        break;
      }

      // Ya está frente a él: se estira el brazo con el billete
      hacia(piernaIzq, 0, k);
      hacia(piernaDer, 0, k);
      persona.position.y = 0;

      tPago += delta;
      const p = Math.min(tPago / 1.8, 1);

      hacia(vendedor.brazoDer, BRAZOS_EXTENDIDOS, k);
      hacia(brazoIzq, BRAZOS_EXTENDIDOS, k);
      hacia(brazoDer, 0, k);

      vendedor.brazoDer.userData.mano.getWorldPosition(_manoA);
      brazoIzq.userData.mano.getWorldPosition(_manoB);

      const q = Math.min(Math.max((p - 0.4) / 0.5, 0), 1);
      const qs = q * q * (3 - 2 * q);

      billete.visible = true;
      billete.position.lerpVectors(_manoA, _manoB, qs);
      billete.position.y += Math.sin(qs * Math.PI) * 0.15;
      billete.rotation.y = comprador.rotation.y;

      if (p >= 1) cambiarEstado('fin');
      break;
    }

    // ---------- Fin del pago: la muchacha celebra ----------
    case 'fin': {
      ponerCerdoAlLado(delta);

      hacia(vendedor.brazoIzq, 0, k);
      hacia(vendedor.brazoDer, 0, k);

      // Saltitos de alegría y un brazo en alto
      persona.position.y = Math.abs(Math.sin(t * 6)) * 0.15;
      brazoDer.rotation.x = -Math.PI * 0.8 + Math.sin(t * 10) * 0.2;
      hacia(brazoIzq, BRAZOS_EXTENDIDOS, k);

      // El billete se queda en su mano
      brazoIzq.userData.mano.getWorldPosition(billete.position);
      billete.position.y += 0.08;

      etiquetaPago.visible = true;
      etiquetaPago.position.set(
        persona.position.x,
        persona.position.y + 4.7,
        persona.position.z
      );

      // Después de celebrar, se va con sus amigas
      if (tEstado > 3) {
        etiquetaPago.visible = false;
        billete.visible = false;
        vasoIngrid.visible = true;
        cambiarEstado('va_mesa');
      }
      break;
    }

    // ---------- Camina a la mesa y se sienta ----------
    case 'va_mesa': {
      const silla = SILLAS[4];
      const bx = silla.pos.x - persona.position.x;
      const bz = silla.pos.z - persona.position.z;
      const d = Math.hypot(bx, bz);

      hacia(brazoIzq, 0, k);
      hacia(brazoDer, -0.3, k);

      if (d > 0.15) {
        persona.rotation.y = Math.atan2(bx, bz);
        const paso = Math.min(VELOCIDAD_PERSONA * 0.8 * delta, d);
        persona.position.x += (bx / d) * paso;
        persona.position.z += (bz / d) * paso;

        const p = Math.sin(t * 10);
        piernaIzq.rotation.x = p * 0.6;
        piernaDer.rotation.x = -p * 0.6;
        persona.position.y = Math.abs(p) * 0.05;
      } else {
        persona.position.x = silla.pos.x;
        persona.position.z = silla.pos.z;
        persona.rotation.y += difAngulo(persona.rotation.y, silla.giro) * k;
        hacia(piernaIzq, -Math.PI / 2, k);
        hacia(piernaDer, -Math.PI / 2, k);
        persona.position.y += (ALTURA_SENTADO - persona.position.y) * k;

        if (persona.position.y < ALTURA_SENTADO + 0.05) cambiarEstado('bebe');
      }
      break;
    }

    // ---------- Toma con sus amigas ----------
    case 'bebe': {
      persona.position.y = ALTURA_SENTADO;
      const sorbo = Math.max(0, Math.sin(tEstado * 2.8));
      hacia(brazoDer, -Math.PI * 0.2 - sorbo * Math.PI * 0.5, k);
      hacia(brazoIzq, -0.3, k);

      // Se va balanceando cada vez más
      persona.rotation.z = Math.sin(t * 1.5) * 0.03 * Math.min(tEstado / 6, 1);

      if (tEstado > 7) cambiarEstado('mareada');
      break;
    }

    // ---------- Se levanta muy mareada ----------
    case 'mareada': {
      const silla = SILLAS[4];
      const fuera = silla.pos.clone().addScaledVector(silla.afuera, 1.0);

      persona.position.x += (fuera.x - persona.position.x) * k * 0.5;
      persona.position.z += (fuera.z - persona.position.z) * k * 0.5;
      persona.position.y += (0 - persona.position.y) * k;

      // Se voltea hacia afuera de la mesa
      persona.rotation.y += difAngulo(persona.rotation.y, silla.giro + Math.PI) * k * 0.5;

      hacia(piernaIzq, 0, k);
      hacia(piernaDer, 0, k);

      const mareo = Math.min(tEstado / 1.5, 1);
      persona.rotation.z = Math.sin(t * 2.2) * 0.18 * mareo;
      persona.rotation.x = Math.sin(t * 1.7 + 1) * 0.1 * mareo;
      brazoIzq.rotation.x = Math.sin(t * 2.2) * 0.4;
      brazoDer.rotation.x = -Math.sin(t * 2.2 + 1) * 0.4;

      if (tEstado > 3) {
        vasoIngrid.visible = false;
        const f = frente(persona, 3.0);
        charco.position.set(f.x, 0.02, f.z);
        charco.scale.setScalar(0.01);
        charco.visible = true;
        proxParticula = 0;
        cambiarEstado('vomita');
      }
      break;
    }

    // ---------- Vomita ----------
    case 'vomita': {
      persona.rotation.x += (0.7 - persona.rotation.x) * k;
      persona.rotation.z = Math.sin(t * 25) * 0.03;
      hacia(brazoIzq, -0.9, k);
      hacia(brazoDer, -0.9, k);

      if (tEstado > 0.5 && tEstado < 2.2) {
        proxParticula -= delta;
        if (proxParticula <= 0) {
          lanzarVomito();
          proxParticula = 0.07;
        }
        const c = Math.min(charco.scale.x + delta * 0.7, 1);
        charco.scale.setScalar(c);
      }

      if (tEstado > 2.8) {
        baseAvance = persona.rotation.y;
        cambiarEstado('avanza');
      }
      break;
    }

    // ---------- Avanza tambaleándose ----------
    case 'avanza': {
      persona.rotation.x += (0 - persona.rotation.x) * k;
      persona.rotation.y = baseAvance + Math.sin(t * 2.3) * 0.5;
      persona.rotation.z = Math.sin(t * 3) * 0.12;

      persona.position.x += Math.sin(persona.rotation.y) * 1.1 * delta;
      persona.position.z += Math.cos(persona.rotation.y) * 1.1 * delta;

      const p = Math.sin(t * 6);
      piernaIzq.rotation.x = p * 0.5;
      piernaDer.rotation.x = -p * 0.5;
      brazoIzq.rotation.x = Math.sin(t * 3) * 0.7;
      brazoDer.rotation.x = -Math.sin(t * 3) * 0.7;
      persona.position.y = Math.abs(p) * 0.04;

      if (tEstado > 3.5) cambiarEstado('cae');
      break;
    }

    // ---------- Se cae de frente ----------
    case 'cae': {
      const u = Math.min(tEstado / 0.9, 1);
      const caida = u * u;

      persona.rotation.x = caida * (Math.PI / 2);
      persona.rotation.z += (0 - persona.rotation.z) * k;
      persona.position.y = caida * 0.35;
      persona.position.x += Math.sin(persona.rotation.y) * (1 - u) * 0.8 * delta;
      persona.position.z += Math.cos(persona.rotation.y) * (1 - u) * 0.8 * delta;

      hacia(brazoIzq, -Math.PI * 0.6, k);
      hacia(brazoDer, -Math.PI * 0.6, k);
      hacia(piernaIzq, 0, k);
      hacia(piernaDer, 0, k);

      if (u >= 1) cambiarEstado('caida');
      break;
    }

    // ---------- Tirada en el suelo ----------
    case 'caida': {
      persona.rotation.x = Math.PI / 2;
      persona.position.y = 0.35;

      // Después de un rato tirada, sus amigas corren a ayudarla
      if (tEstado > 2.5) cambiarEstado('auxilio');
      break;
    }

    // ---------- Las amigas corren hacia Ingrid ----------
    case 'auxilio': {
      persona.rotation.x = Math.PI / 2;
      persona.position.y = 0.35;

      const llegaron = extras.every((m, i) => {
        const s = slotRescate(i);
        return Math.hypot(m.grupo.position.x - s.x, m.grupo.position.z - s.z) < 0.4;
      });

      // Esperan también a que la camioneta ya esté estacionada
      if (carroListo && ((llegaron && tEstado > 1) || tEstado > 8)) cambiarEstado('cargan');
      break;
    }

    // ---------- La levantan y la cargan hacia la camioneta ----------
    case 'cargan': {
      persona.rotation.x = Math.PI / 2;

      // Brazos y piernas le cuelgan
      hacia(brazoIzq, Math.sin(t * 3) * 0.08, k);
      hacia(brazoDer, -Math.sin(t * 3) * 0.08, k);
      hacia(piernaIzq, 0, k);
      hacia(piernaDer, 0, k);

      // La levantan hasta la altura de las manos
      const lev = Math.min(tEstado / 1.0, 1);
      persona.position.y = 0.35 + 0.9 * (lev * lev * (3 - 2 * lev));

      if (tEstado > 1) {
        // Van hacia la parte de atrás de la camioneta (la caja está abierta ahí)
        puntoCarro(0, -5.2, _punto);

        let cx = persona.position.x + Math.sin(persona.rotation.y) * LARGO_CUERPO;
        let cz = persona.position.z + Math.cos(persona.rotation.y) * LARGO_CUERPO;

        const bx = _punto.x - cx;
        const bz = _punto.z - cz;
        const d = Math.hypot(bx, bz);

        if (d > 0.3) {
          persona.rotation.y += difAngulo(persona.rotation.y, Math.atan2(bx, bz)) * Math.min(delta * 3, 1);
          cx += (bx / d) * 2.2 * delta;
          cz += (bz / d) * 2.2 * delta;

          persona.position.x = cx - Math.sin(persona.rotation.y) * LARGO_CUERPO;
          persona.position.z = cz - Math.cos(persona.rotation.y) * LARGO_CUERPO;
        } else {
          subeCentro.set(cx, 0, cz);
          subeGiro = persona.rotation.y;
          cambiarEstado('sube');
        }
      }
      break;
    }

    // ---------- La meten a la caja de la camioneta ----------
    case 'sube': {
      const u = Math.min(tEstado / 1.5, 1);
      const s = u * u * (3 - 2 * u);

      puntoCarro(0, -1.8, _punto); // centro de la caja

      const cx = subeCentro.x + (_punto.x - subeCentro.x) * s;
      const cz = subeCentro.z + (_punto.z - subeCentro.z) * s;

      persona.rotation.x = Math.PI / 2;
      persona.rotation.y = subeGiro + difAngulo(subeGiro, carro.rotation.y) * s;
      persona.position.y = 1.25 - 0.1 * s;
      persona.position.x = cx - Math.sin(persona.rotation.y) * LARGO_CUERPO;
      persona.position.z = cz - Math.cos(persona.rotation.y) * LARGO_CUERPO;

      if (u >= 1) {
        velCarro = 0;
        cambiarEstado('se_va');
      }
      break;
    }

    // ---------- La camioneta se la lleva (por la Puerta Grande) ----------
    case 'se_va': {
      velCarro = Math.min(velCarro + 4 * delta, 12);

      carro.position.x += Math.sin(carro.rotation.y) * velCarro * delta;
      carro.position.z += Math.cos(carro.rotation.y) * velCarro * delta;
      ruedas.forEach((r) => { r.rotation.x += velCarro * delta * 2.2; });

      // Ingrid viaja acostada en la caja
      puntoCarro(0, -1.8, _punto);
      persona.rotation.x = Math.PI / 2;
      persona.rotation.y = carro.rotation.y;
      persona.position.y = 1.15;
      persona.position.x = _punto.x - Math.sin(persona.rotation.y) * LARGO_CUERPO;
      persona.position.z = _punto.z - Math.cos(persona.rotation.y) * LARGO_CUERPO;

      if (carro.position.x > 60) cambiarEstado('se_fue');
      break;
    }

    // ---------- Ya se fueron ----------
    case 'se_fue': {
      break;
    }
  }

  // Información en pantalla
  if (capturado()) {
    datos['Traslación'] = vec(robot.position);
    datos['Rotación Y'] =
      `${THREE.MathUtils.radToDeg(robot.rotation.y).toFixed(1)}°`;
    datos['Velocidad'] = '0.0 m/s';
    datos['Emote'] = '—';
  }

  const textos = {
    espera: 'Libre (I para que lo corretee)',
    persigue: 'Persiguiendo a Chuleta',
    levanta: '¡Atrapó a Chuleta!',
    camina: 'Llevando a Chuleta con el comprador',
    entrega: 'Entregando a Chuleta',
    paga: 'El comprador está pagando...',
    fin: '¡Recibió $300 pesos!',
    va_mesa: 'Ingrid va a la mesa con sus amigas',
    bebe: 'Ingrid está tomando...',
    mareada: 'Ingrid se levantó muy mareada',
    vomita: 'Ingrid está vomitando...',
    avanza: 'Ingrid camina tambaleándose',
    cae: '¡Ingrid se cae!',
    caida: 'Ingrid está tirada...',
    auxilio: 'Sus amigas corren a ayudarla (la camioneta entra de reversa)',
    cargan: 'Cargan a Ingrid hacia la camioneta',
    sube: 'Suben a Ingrid a la camioneta',
    se_va: 'Se llevan a Ingrid',
    se_fue: 'Se fueron con Ingrid (R para reiniciar)'
  };
  datos['Estado'] = textos[estado];
  datos['Distancia'] = distancia.toFixed(2) + ' metros';
  datos['Vista'] = VISTAS[vista];

});

// ==================================================
//     MUCHACHAS DE FONDO: persiguen, se enojan y toman
// ==================================================

// Se quedan un poco más lejos que la principal: solo ella puede atrapar a Chuleta
const DISTANCIA_EXTRA = 2.6;

// Evita que las muchachas se encimen unas con otras
function separar(g) {
  [persona, ...extras.map((e) => e.grupo)].forEach((otro) => {
    if (otro === g) return;

    const ox = g.position.x - otro.position.x;
    const oz = g.position.z - otro.position.z;
    const dd = Math.sqrt(ox * ox + oz * oz);

    if (dd < 1.4 && dd > 0.001) {
      const empuje = (1.4 - dd) * 0.5;
      g.position.x += (ox / dd) * empuje;
      g.position.z += (oz / dd) * empuje;
    }
  });
}

let ultimoExtras = 0;

animaciones.push((t) => {

  const delta = Math.min(Math.max(t - ultimoExtras, 0), 0.05);
  ultimoExtras = t;
  const k = Math.min(delta * 6, 1);

  // Cuando la principal ya atrapó a Chuleta, las demás se enojan (hasta que se van a la mesa)
  const enojadas = capturado() && !enBar() && !enRescate();

  extras.forEach((m, i) => {
    const g = m.grupo;
    const fase = i * 0.9;

    // ---------- Rescate: la levantan, la cargan y la suben a la camioneta ----------
    if (enRescate()) {
      m.tEnojo = 0;
      m.enojo.visible = false;
      m.vaso.visible = false;
      g.rotation.z += (0 - g.rotation.z) * k;

      const kk = Math.min(delta * 14, 1);

      if (estado === 'auxilio' || estado === 'cargan') {
        const slot = slotRescate(i);
        const bx = slot.x - g.position.x;
        const bz = slot.z - g.position.z;
        const d = Math.hypot(bx, bz);

        if (d > 0.25) {
          // Corren hacia su lugar (se paran de la mesa)
          g.rotation.y = Math.atan2(bx, bz);
          const paso = Math.min(4.5 * delta, d);
          g.position.x += (bx / d) * paso;
          g.position.z += (bz / d) * paso;

          const c = Math.sin(t * 14 + fase);
          hacia(m.piernaIzq, c * 0.8, kk);
          hacia(m.piernaDer, -c * 0.8, kk);
          hacia(m.brazoIzq, -c * 0.6, kk);
          hacia(m.brazoDer, c * 0.6, kk);
          g.position.y += (Math.abs(c) * 0.07 - g.position.y) * kk;
        } else {
          // Ya en su lugar: siguen a Ingrid
          g.position.x = slot.x;
          g.position.z = slot.z;
          g.rotation.y += difAngulo(g.rotation.y, persona.rotation.y) * kk;

          const caminando = estado === 'cargan' && tEstado > 1;
          const c = caminando ? Math.sin(t * 10 + fase) : 0;

          hacia(m.piernaIzq, c * 0.5, kk);
          hacia(m.piernaDer, -c * 0.5, kk);

          if (i < 2) {
            // Las dos que la cargan llevan los brazos abajo, sosteniéndola
            hacia(m.brazoIzq, -0.3, kk);
            hacia(m.brazoDer, -0.3, kk);
          } else {
            hacia(m.brazoIzq, -c * 0.5, kk);
            hacia(m.brazoDer, c * 0.5, kk);
          }
          g.position.y += (Math.abs(c) * 0.05 - g.position.y) * kk;
        }
      } else {
        // Ya la subieron: se quedan en su lugar y se despiden de la camioneta
        const haciaCarro = Math.atan2(
          carro.position.x - g.position.x,
          carro.position.z - g.position.z
        );
        g.rotation.y += difAngulo(g.rotation.y, haciaCarro) * k;

        hacia(m.piernaIzq, 0, kk);
        hacia(m.piernaDer, 0, kk);

        if (estado === 'sube') {
          hacia(m.brazoIzq, 0, kk);
          hacia(m.brazoDer, 0, kk);
          g.position.y += (0 - g.position.y) * kk;
        } else {
          const salto = Math.abs(Math.sin(t * 6 + fase));
          g.position.y += (salto * 0.12 - g.position.y) * kk;
          hacia(m.brazoIzq, -Math.PI * 0.85 + Math.sin(t * 10 + fase) * 0.3, kk);
          hacia(m.brazoDer, -Math.PI * 0.85 + Math.sin(t * 10 + fase + 1.5) * 0.3, kk);
        }
      }
      return;
    }

    // ---------- En la mesa: caminan, se sientan y toman ----------
    if (enBar()) {
      const silla = SILLAS[i];
      const bx = silla.pos.x - g.position.x;
      const bz = silla.pos.z - g.position.z;
      const d = Math.hypot(bx, bz);

      m.tEnojo = 0;
      m.enojo.visible = false;
      g.rotation.z += (0 - g.rotation.z) * k;
      m.vaso.visible = true;

      if (d > 0.15) {
        g.rotation.y = Math.atan2(bx, bz);
        const paso = Math.min(VELOCIDAD_PERSONA * 0.8 * delta, d);
        g.position.x += (bx / d) * paso;
        g.position.z += (bz / d) * paso;

        const c = Math.sin(t * 10 + fase);
        m.piernaIzq.rotation.x = c * 0.6;
        m.piernaDer.rotation.x = -c * 0.6;
        hacia(m.brazoIzq, 0, k);
        hacia(m.brazoDer, -0.3, k);
        g.position.y = Math.abs(c) * 0.05;
      } else {
        // Sentadas; miran a Ingrid cuando está mal
        const mirarla = ['mareada', 'vomita', 'avanza', 'cae', 'caida'].includes(estado);
        const objetivo = mirarla
          ? Math.atan2(persona.position.x - g.position.x, persona.position.z - g.position.z)
          : silla.giro;
        g.rotation.y += difAngulo(g.rotation.y, objetivo) * k;

        hacia(m.piernaIzq, -Math.PI / 2, k);
        hacia(m.piernaDer, -Math.PI / 2, k);
        g.position.y += (ALTURA_SENTADO - g.position.y) * k;

        const sorbo = Math.max(0, Math.sin(t * 2.2 + fase * 2));
        hacia(m.brazoDer, -Math.PI * 0.2 - sorbo * Math.PI * 0.5, k);
        hacia(m.brazoIzq, -0.3, k);
      }
      return;
    }

    // ---------- Enojadas ----------
    if (enojadas) {
      m.tEnojo += delta;

      // Miran con coraje a la muchacha principal
      const objetivo = Math.atan2(
        persona.position.x - g.position.x,
        persona.position.z - g.position.z
      );
      g.rotation.y += difAngulo(g.rotation.y, objetivo) * k;

      // Patalean, tiemblan y sacuden los puños
      const pisada = Math.sin(t * 9 + fase);
      g.position.y = Math.abs(pisada) * 0.1;
      g.rotation.z = Math.sin(t * 28 + fase) * 0.04;

      m.piernaIzq.rotation.x = Math.max(pisada, 0) * 0.7;
      m.piernaDer.rotation.x = Math.max(-pisada, 0) * 0.7;
      m.brazoIzq.rotation.x = -Math.PI * 0.75 + Math.sin(t * 18 + fase) * 0.25;
      m.brazoDer.rotation.x = -Math.PI * 0.75 + Math.sin(t * 18 + fase + 1.5) * 0.25;

      // Letrero de enojo
      const pop = Math.min(m.tEnojo / 0.2, 1);
      m.enojo.visible = true;
      m.enojo.scale.set(1.3 * pop, 0.325 * pop, 1);
      m.enojo.position.y = 2.6 + Math.abs(pisada) * 0.08;
      return;
    }

    m.tEnojo = 0;
    m.enojo.visible = false;
    g.rotation.z += (0 - g.rotation.z) * k;

    // ---------- Persiguiendo a Chuleta (misma velocidad que la principal) ----------
    if (estado === 'persigue') {
      const dx = robot.position.x - g.position.x;
      const dz = robot.position.z - g.position.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      const parar = DISTANCIA_EXTRA + i * 0.35;

      g.rotation.y = Math.atan2(dx, dz);

      if (d > parar) {
        g.position.x += (dx / d) * VELOCIDAD_PERSONA * delta;
        g.position.z += (dz / d) * VELOCIDAD_PERSONA * delta;

        const carrera = Math.sin(t * 14 + fase);
        m.piernaIzq.rotation.x = carrera * 0.9;
        m.piernaDer.rotation.x = -carrera * 0.9;
        m.brazoIzq.rotation.x = -carrera * 0.8;
        m.brazoDer.rotation.x = carrera * 0.8;
        g.position.y = Math.abs(carrera) * 0.08;
      } else {
        // Ya lo alcanzaron de cerca, pero no pueden atraparlo: estiran los brazos
        hacia(m.piernaIzq, 0, k);
        hacia(m.piernaDer, 0, k);
        hacia(m.brazoIzq, -Math.PI * 0.45 + Math.sin(t * 8 + fase) * 0.15, k);
        hacia(m.brazoDer, -Math.PI * 0.45 + Math.sin(t * 8 + fase + 1) * 0.15, k);
        g.position.y += (0 - g.position.y) * k;
      }

      separar(g);
      return;
    }

    // ---------- Esperando: se quedan quietas (no reaccionan a Chuleta hasta presionar I) ----------
    const miradaInicial = Math.atan2(-EXTRAS[i].pos[0], -EXTRAS[i].pos[2]);
    g.rotation.y += difAngulo(g.rotation.y, miradaInicial) * k;
    g.position.y += (0 - g.position.y) * k;
    hacia(m.brazoIzq, 0, k);
    hacia(m.brazoDer, 0, k);
    hacia(m.piernaIzq, 0, k);
    hacia(m.piernaDer, 0, k);
  });

});

// ==================================================
//                  BUCLE PRINCIPAL
// ==================================================

let ultimoBucle = 0;

renderizador.setAnimationLoop(() => {

  const t = reloj.getElapsedTime();
  const delta = Math.min(Math.max(t - ultimoBucle, 0), 0.05);
  ultimoBucle = t;

  animaciones.forEach((animar) => animar(t));

  const lineas = Object.entries(datos).map(
    ([k, v]) => `${k}: ${v}`
  );

  panel.textContent = lineas.join('\n');

  actualizarCamara(delta);

  renderizador.render(escena, camara);

});

// ==================================================
//                 CAMBIAR TAMAÑO
// ==================================================

addEventListener('resize', () => {

  camara.aspect = innerWidth / innerHeight;
  camara.updateProjectionMatrix();

  renderizador.setSize(innerWidth, innerHeight);

});
