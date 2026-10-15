/* ============================================================
   SIMULADOR DE CIRCUITOS EDUCATIVO EN AR
   MindAR + A-Frame

   Target 0 = Básico
   Target 1 = Serie
   Target 2 = Paralelo

   Serie y Paralelo:
   las dos lámparas se toman desde la bandeja lateral y
   se arrastran con el dedo hasta sus posiciones.
   ============================================================ */

const TARGETS = {
  basico: 0,
  serie: 1,
  paralelo: 2
};

let circuitoActual = null;
let montajeActivo = null;
let arrastreActivo = null;

const CONFIG_MONTAJE = {

  serie: {
    slots: [
      { id: "s1", x: -0.06, z: 0 },
      { id: "s2", x: 0.28, z: 0 }
    ]
  },

  paralelo: {
    slots: [
      { id: "p1", x: 0.22, z: -0.22 },
      { id: "p2", x: 0.22, z: 0.22 }
    ]
  }

};


/* Herramientas THREE usadas para convertir el dedo
   en una posición sobre la mesa AR. */

const raycasterAR = new THREE.Raycaster();
const punteroAR = new THREE.Vector2();
const planoAR = new THREE.Plane();
const puntoAR = new THREE.Vector3();


/* ============================================================
   LIMPIAR
   ============================================================ */

function limpiarMesa() {

  document
    .querySelectorAll(".componentes-target")
    .forEach((contenedor) => {

      contenedor.innerHTML = "";

    });

  circuitoActual = null;
  montajeActivo = null;
  arrastreActivo = null;

  ocultarBandejaComponentes();

  const info =
    document.getElementById("panel-info");

  if (info) {

    info.innerText =
      "Apuntá a uno de los marcadores para visualizar el circuito.";

  }

}


/* ============================================================
   LED DEL CIRCUITO BÁSICO
   ============================================================ */

function crearLED(x, y, z, colorHex) {

  return `

    <a-cylinder
      position="${x} ${y} ${z}"
      radius="0.055"
      height="0.015"
      material="
        color: #212121;
        metalness: 0.5">
    </a-cylinder>


    <a-cylinder
      position="${x} ${y + 0.05} ${z}"
      radius="0.048"
      height="0.07"
      material="
        color: ${colorHex};
        emissive: ${colorHex};
        emissiveIntensity: 0.9;
        roughness: 0.1;
        transparent: true;
        opacity: 0.95">
    </a-cylinder>


    <a-sphere
      position="${x} ${y + 0.085} ${z}"
      radius="0.048"
      scale="1 0.7 1"
      material="
        color: ${colorHex};
        emissive: ${colorHex};
        emissiveIntensity: 0.95;
        roughness: 0.1;
        transparent: true;
        opacity: 0.95">
    </a-sphere>

  `;

}


/* ============================================================
   CIRCUITO BÁSICO
   ============================================================ */

function circuitoBasico() {

  return `

    <a-box
      position="-0.4 0.15 0"
      width="0.24"
      height="0.15"
      depth="0.18"
      material="
        color: #d32f2f;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.28 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #e0e0e0;
        metalness: 0.8">
    </a-box>


    <a-box
      position="-0.52 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #212121">
    </a-box>


    <a-box
      position="-0.12 0.14 0"
      width="0.2"
      height="0.09"
      depth="0.18"
      material="
        color: #212121;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.12 0.21 0"
      width="0.08"
      height="0.06"
      depth="0.08"
      material="
        color: #b0bec5;
        metalness: 0.6">
    </a-box>


    ${crearLED(
      0.28,
      0.08,
      0,
      "#00e676"
    )}


    <a-box
      position="-0.20 0.07 0"
      width="0.12"
      height="0.009"
      depth="0.022"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.08 0.07 0"
      width="0.20"
      height="0.009"
      depth="0.022"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.12 0.067 0.26"
      width="0.82"
      height="0.009"
      depth="0.022"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.28 0.067 0.13"
      width="0.022"
      height="0.009"
      depth="0.28"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.52 0.067 0.13"
      width="0.022"
      height="0.009"
      depth="0.28"
      material="
        color: black;
        roughness: 0.2">
    </a-box>

  `;

}


/* ============================================================
   ZÓCALOS DE LÁMPARA
   ============================================================ */

function crearZocaloLampara(x, z, id) {

  return `

    <a-ring
      data-slot-id="${id}"
      position="${x} 0.075 ${z}"
      rotation="-90 0 0"
      radius-inner="0.058"
      radius-outer="0.078"
      material="
        color: #777;
        opacity: 0.85;
        transparent: true">
    </a-ring>

  `;

}


/* ============================================================
   CIRCUITO SERIE ARMABLE
   ============================================================ */

function circuitoSerie() {

  return `

    <a-box
      position="-0.4 0.15 0"
      width="0.24"
      height="0.15"
      depth="0.18"
      material="
        color: #d32f2f;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.28 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #e0e0e0;
        metalness: 0.8">
    </a-box>


    <a-box
      position="-0.52 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #212121">
    </a-box>


    <a-box
      position="-0.17 0.07 0"
      width="0.22"
      height="0.009"
      depth="0.022"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.11 0.07 0"
      width="0.18"
      height="0.009"
      depth="0.022"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.12 0.067 0.28"
      width="0.82"
      height="0.009"
      depth="0.022"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.28 0.067 0.14"
      width="0.022"
      height="0.009"
      depth="0.30"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.52 0.067 0.14"
      width="0.022"
      height="0.009"
      depth="0.30"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    ${crearZocaloLampara(
      -0.06,
      0,
      "s1"
    )}


    ${crearZocaloLampara(
      0.28,
      0,
      "s2"
    )}

  `;

}


/* ============================================================
   CIRCUITO PARALELO ARMABLE
   ============================================================ */

function circuitoParalelo() {

  return `

    <a-box
      position="-0.4 0.15 0"
      width="0.24"
      height="0.15"
      depth="0.18"
      material="
        color: #d32f2f;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.28 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #e0e0e0;
        metalness: 0.8">
    </a-box>


    <a-box
      position="-0.52 0.15 0"
      width="0.05"
      height="0.06"
      depth="0.06"
      material="
        color: #212121">
    </a-box>


    <a-box
      position="-0.03 0.07 -0.22"
      width="0.54"
      height="0.009"
      depth="0.022"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.15 0.067 0.22"
      width="0.76"
      height="0.009"
      depth="0.022"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.22 0.07 -0.11"
      width="0.022"
      height="0.009"
      depth="0.22"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="0.22 0.067 0.11"
      width="0.022"
      height="0.009"
      depth="0.22"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.28 0.07 -0.11"
      width="0.022"
      height="0.009"
      depth="0.22"
      material="
        color: red;
        roughness: 0.2">
    </a-box>


    <a-box
      position="-0.52 0.067 0.11"
      width="0.022"
      height="0.009"
      depth="0.22"
      material="
        color: black;
        roughness: 0.2">
    </a-box>


    ${crearZocaloLampara(
      0.22,
      -0.22,
      "p1"
    )}


    ${crearZocaloLampara(
      0.22,
      0.22,
      "p2"
    )}

  `;

}


/* ============================================================
   LÁMPARA 3D
   ============================================================ */

function crearLamparaInteractiva(id) {

  const lampara =
    document.createElement(
      "a-entity"
    );


  lampara.setAttribute(
    "class",
    "lampara-interactiva"
  );


  lampara.setAttribute(
    "data-lamp-id",
    String(id)
  );


  lampara.setAttribute(
    "data-slot-id",
    ""
  );


  lampara.setAttribute(
    "position",
    "0 0.08 0"
  );


  lampara.innerHTML = `

    <a-cylinder
      class="lampara-base"
      position="0 0 0"
      radius="0.055"
      height="0.018"
      material="
        color: #303030;
        metalness: 0.5">
    </a-cylinder>


    <a-cylinder
      class="lampara-bombilla"
      position="0 0.05 0"
      radius="0.048"
      height="0.07"
      material="
        color: #455a64;
        emissive: #000000;
        emissiveIntensity: 0;
        roughness: 0.15">
    </a-cylinder>


    <a-sphere
      class="lampara-bombilla-superior"
      position="0 0.085 0"
      radius="0.048"
      scale="1 0.7 1"
      material="
        color: #455a64;
        emissive: #000000;
        emissiveIntensity: 0;
        roughness: 0.15">
    </a-sphere>

  `;


  return lampara;

}


/* ============================================================
   BANDEJA
   ============================================================ */

function mostrarBandejaComponentes(tipo) {

  const bandeja =
    document.getElementById(
      "bandeja-componentes"
    );


  if (!bandeja) return;


  if (
    tipo === "serie" ||
    tipo === "paralelo"
  ) {

    bandeja.classList.add(
      "visible"
    );

    bandeja.setAttribute(
      "aria-hidden",
      "false"
    );

  }

  else {

    ocultarBandejaComponentes();

  }

}


function ocultarBandejaComponentes() {

  const bandeja =
    document.getElementById(
      "bandeja-componentes"
    );


  if (!bandeja) return;


  bandeja.classList.remove(
    "visible"
  );


  bandeja.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* ============================================================
   INICIAR MONTAJE
   ============================================================ */

function iniciarMontaje(
  tipo,
  targetEntity,
  contenedor
) {

  const config =
    CONFIG_MONTAJE[tipo];


  if (!config) {

    montajeActivo = null;

    ocultarBandejaComponentes();

    return;

  }


  const workspace =
    targetEntity.querySelector(
      ".mesa-virtual"
    );


  if (!workspace) return;


  montajeActivo = {

    tipo: tipo,

    target: targetEntity,

    workspace: workspace,

    contenedor: contenedor,

    lamparas: new Map(),

    slots: config.slots

  };


  mostrarBandejaComponentes(
    tipo
  );

}


/* ============================================================
   PANTALLA -> PLANO DE LA MESA AR
   ============================================================ */

function obtenerPuntoEnWorkspace(
  clientX,
  clientY
) {

  if (
    !montajeActivo ||
    !montajeActivo.workspace
  ) {

    return null;

  }


  const scene =
    document.getElementById(
      "escena-ar"
    );


  if (
    !scene ||
    !scene.renderer ||
    !scene.camera
  ) {

    return null;

  }


  const canvas =
    scene.renderer.domElement;


  const rect =
    canvas.getBoundingClientRect();


  if (
    !rect.width ||
    !rect.height
  ) {

    return null;

  }


  punteroAR.x =
    ((clientX - rect.left) /
      rect.width) * 2 - 1;


  punteroAR.y =
    -((clientY - rect.top) /
      rect.height) * 2 + 1;


  raycasterAR.setFromCamera(
    punteroAR,
    scene.camera
  );


  const workspace =
    montajeActivo.workspace;


  const normal =
    new THREE.Vector3(
      0,
      1,
      0
    );


  const quaternion =
    new THREE.Quaternion();


  workspace.object3D.getWorldQuaternion(
    quaternion
  );


  normal
    .applyQuaternion(
      quaternion
    )
    .normalize();


  const puntoSuperficie =
    new THREE.Vector3(
      0,
      0.05,
      0
    );


  workspace.object3D.localToWorld(
    puntoSuperficie
  );


  planoAR.setFromNormalAndCoplanarPoint(
    normal,
    puntoSuperficie
  );


  if (
    !raycasterAR.ray.intersectPlane(
      planoAR,
      puntoAR
    )
  ) {

    return null;

  }


  const local =
    puntoAR.clone();


  workspace.object3D.worldToLocal(
    local
  );


  local.y =
    0.08;


  return local;

}


/* ============================================================
   INICIAR ARRASTRE
   ============================================================ */

function iniciarArrastreLampara(
  id,
  event
) {

  if (!montajeActivo) return;

  if (arrastreActivo) return;


  event.preventDefault();


  const key =
    String(id);


  let lampara =
    montajeActivo.lamparas.get(
      key
    );


  if (!lampara) {

    lampara =
      crearLamparaInteractiva(
        id
      );


    montajeActivo.contenedor.appendChild(
      lampara
    );


    montajeActivo.lamparas.set(
      key,
      lampara
    );

  }


  /* Al volver a tomarla, deja de ocupar su zócalo. */

  lampara.dataset.slotId =
    "";


  arrastreActivo = {

    id: key,

    lampara: lampara,

    pointerId:
      event.pointerId

  };


  if (
    event.currentTarget &&
    event.currentTarget.setPointerCapture
  ) {

    try {

      event.currentTarget.setPointerCapture(
        event.pointerId
      );

    }

    catch (e) {

      /* Algunos navegadores no permiten pointer capture. */

    }

  }


  moverLampara(
    event
  );

}


/* ============================================================
   MOVER LÁMPARA
   ============================================================ */

function moverLampara(
  event
) {

  if (!arrastreActivo) return;


  if (
    event.pointerId !==
    arrastreActivo.pointerId
  ) {

    return;

  }


  const punto =
    obtenerPuntoEnWorkspace(
      event.clientX,
      event.clientY
    );


  if (!punto) return;


  arrastreActivo.lampara.setAttribute(
    "position",
    `${punto.x} ${punto.y} ${punto.z}`
  );

}


/* ============================================================
   FINALIZAR ARRASTRE
   ============================================================ */

function finalizarArrastreLampara(
  event
) {

  if (!arrastreActivo) return;


  if (
    event &&
    event.pointerId !==
    arrastreActivo.pointerId
  ) {

    return;

  }


  if (!montajeActivo) {

    arrastreActivo =
      null;

    return;

  }


  const lampara =
    arrastreActivo.lampara;


  const pos =
    lampara.object3D.position;


  let mejorSlot =
    null;


  let mejorDistancia =
    Infinity;


  montajeActivo.slots.forEach(
    (slot) => {

      const ocupada =
        Array.from(
          montajeActivo.lamparas.values()
        ).some(
          (otra) => {

            return (
              otra !== lampara &&
              otra.dataset.slotId ===
              slot.id
            );

          }
        );


      if (ocupada) return;


      const dx =
        pos.x - slot.x;


      const dz =
        pos.z - slot.z;


      const distancia =
        Math.sqrt(
          dx * dx +
          dz * dz
        );


      if (
        distancia <
        mejorDistancia
      ) {

        mejorDistancia =
          distancia;

        mejorSlot =
          slot;

      }

    }
  );


  /* Radio de aceptación de la posición. */

  if (
    mejorSlot &&
    mejorDistancia <= 0.16
  ) {

    lampara.setAttribute(
      "position",
      `${mejorSlot.x} 0.08 ${mejorSlot.z}`
    );


    lampara.dataset.slotId =
      mejorSlot.id;

  }

  else {

    lampara.dataset.slotId =
      "";

  }


  arrastreActivo =
    null;


  comprobarMontaje();

}


/* ============================================================
   ENCENDER
   ============================================================ */

function encenderLamparas() {

  if (!montajeActivo) return;


  montajeActivo.lamparas.forEach(
    (lampara) => {

      lampara
        .querySelectorAll(
          ".lampara-bombilla, .lampara-bombilla-superior"
        )
        .forEach(
          (bombilla) => {

            bombilla.setAttribute(
              "material",
              "color: #ffeb3b; emissive: #ff9800; emissiveIntensity: 1.2; roughness: 0.1"
            );

          }
        );

    }
  );

}


/* ============================================================
   APAGAR
   ============================================================ */

function apagarLamparas() {

  if (!montajeActivo) return;


  montajeActivo.lamparas.forEach(
    (lampara) => {

      lampara
        .querySelectorAll(
          ".lampara-bombilla, .lampara-bombilla-superior"
        )
        .forEach(
          (bombilla) => {

            bombilla.setAttribute(
              "material",
              "color: #455a64; emissive: #000000; emissiveIntensity: 0; roughness: 0.15"
            );

          }
        );

    }
  );

}


/* ============================================================
   COMPROBAR MONTAJE
   ============================================================ */

function comprobarMontaje() {

  if (!montajeActivo) return;


  const ocupados =
    new Set();


  montajeActivo.lamparas.forEach(
    (lampara) => {

      if (
        lampara.dataset.slotId
      ) {

        ocupados.add(
          lampara.dataset.slotId
        );

      }

    }
  );


  const completo =
    montajeActivo.slots.every(
      (slot) => {

        return ocupados.has(
          slot.id
        );

      }
    );


  const info =
    document.getElementById(
      "panel-info"
    );


  if (completo) {

    encenderLamparas();


    if (info) {

      info.innerText =
        montajeActivo.tipo === "paralelo"

          ? "✓ Circuito paralelo completo: las dos lámparas están conectadas y encendidas."

          : "✓ Circuito serie completo: las dos lámparas están conectadas y encendidas.";

    }

  }

  else {

    apagarLamparas();


    if (info) {

      info.innerText =
        `Colocá las dos lámparas en sus posiciones. ${ocupados.size}/2 conectadas.`;

    }

  }

}


/* ============================================================
   TOUCH / POINTER
   ============================================================ */

function configurarArrastreComponentes() {

  document
    .querySelectorAll(
      ".pieza-arrastrable"
    )
    .forEach(
      (pieza) => {

        pieza.addEventListener(
          "pointerdown",
          (event) => {

            iniciarArrastreLampara(
              pieza.dataset.lampId,
              event
            );

          }
        );

      }
    );


  window.addEventListener(
    "pointermove",
    (event) => {

      if (!arrastreActivo) return;


      event.preventDefault();


      moverLampara(
        event
      );

    },
    {
      passive: false
    }
  );


  window.addEventListener(
    "pointerup",
    (event) => {

      finalizarArrastreLampara(
        event
      );

    }
  );


  window.addEventListener(
    "pointercancel",
    (event) => {

      finalizarArrastreLampara(
        event
      );

    }
  );

}


/* ============================================================
   INFORMACIÓN DE CIRCUITOS
   ============================================================ */

function obtenerCircuito(
  tipo
) {

  if (
    tipo ===
    "basico"
  ) {

    return {

      nombre:
        "Circuito Básico",

      descripcion:
        "Circuito Básico: conexión cerrada con fuente, componente, LED y retorno.",

      html:
        circuitoBasico()

    };

  }


  if (
    tipo ===
    "serie"
  ) {

    return {

      nombre:
        "LEDs en Serie",

      descripcion:
        "Circuito Serie: dos lámparas conectadas en una única trayectoria.",

      html:
        circuitoSerie()

    };

  }


  if (
    tipo ===
    "paralelo"
  ) {

    return {

      nombre:
        "LEDs en Paralelo",

      descripcion:
        "Circuito Paralelo: dos ramas independientes conectadas a la fuente.",

      html:
        circuitoParalelo()

    };

  }


  return null;

}


/* ============================================================
   MOSTRAR CIRCUITO SEGÚN EL MARCADOR
   ============================================================ */

function mostrarCircuitoEnTarget(
  tipo,
  targetEntity
) {

  if (!targetEntity) return;


  const contenedor =
    targetEntity.querySelector(
      ".componentes-target"
    );


  if (!contenedor) {

    console.warn(
      "No se encontró .componentes-target en",
      targetEntity.id
    );

    return;

  }


  if (
    montajeActivo &&
    montajeActivo.target !==
    targetEntity
  ) {

    montajeActivo =
      null;

    arrastreActivo =
      null;

  }


  const circuito =
    obtenerCircuito(
      tipo
    );


  if (!circuito) return;


  contenedor.innerHTML =
    circuito.html;


  if (
    tipo === "serie" ||
    tipo === "paralelo"
  ) {

    iniciarMontaje(
      tipo,
      targetEntity,
      contenedor
    );

  }

  else {

    montajeActivo =
      null;

    arrastreActivo =
      null;

    ocultarBandejaComponentes();

  }


  circuitoActual =
    tipo;


  const info =
    document.getElementById(
      "panel-info"
    );


  if (info) {

    info.innerText =
      (
        tipo === "serie" ||
        tipo === "paralelo"
      )

        ? "Elegí una lámpara de la bandeja lateral y arrastrala con el dedo hasta su posición."

        : circuito.descripcion;

  }


  const estado =
    document.getElementById(
      "estado-ar"
    );


  if (estado) {

    estado.classList.add(
      "detectado"
    );


    estado.innerText =
      `Marcador detectado: ${circuito.nombre}.`;

  }

}


/* ============================================================
   CONFIGURAR MARCADORES
   ============================================================ */

function configurarTargets() {
  const configuraciones = [
    {
      id: "target-basico",
      tipo: "basico"
    },
    {
      id: "target-serie",
      tipo: "serie"
    },
    {
      id: "target-paralelo",
      tipo: "paralelo"
    }
  ];

  configuraciones.forEach((config) => {
    const target = document.getElementById(config.id);

    if (!target) {
      console.warn("No se encontró el target:", config.id);
      return;
    }

    target.addEventListener("targetFound", () => {
      console.log("Marcador encontrado:", config.tipo);

      // Ocultar el botón de iniciar si la cámara ya detectó el marcador
      const boton = document.getElementById("btn-iniciar-ar");
      if (boton) {
        boton.style.display = "none";
      }

      // Asegurar que las leyendas superiores sean visibles
      const info = document.getElementById("panel-info");
      if (info) {
        info.style.display = "block";
      }

      const estado = document.getElementById("estado-ar");
      if (estado) {
        estado.style.display = "block";
      }

      mostrarCircuitoEnTarget(config.tipo, target);
    });

    target.addEventListener("targetLost", () => {
      console.log("Marcador perdido:", config.tipo);

      if (montajeActivo && montajeActivo.target === target) {
        arrastreActivo = null;
        ocultarBandejaComponentes();
      }

      const estado = document.getElementById("estado-ar");

      if (estado) {
        estado.classList.remove("detectado");
        estado.innerText = "Marcador fuera de vista. Volvé a enfocarlo para continuar.";
      }
    });
  });
}


/* ============================================================
   INICIAR CÁMARA / MINDAR
   ============================================================ */

async function iniciarAR() {

  const scene =
    document.getElementById(
      "escena-ar"
    );


  const boton =
    document.getElementById(
      "btn-iniciar-ar"
    );


  const info =
    document.getElementById(
      "panel-info"
    );


  const estado =
    document.getElementById(
      "estado-ar"
    );


  if (!scene) {

    console.error(
      "No se encontró #escena-ar"
    );

    return;

  }


  try {

    if (boton) {

      boton.disabled =
        true;

      boton.innerText =
        "Iniciando cámara...";

    }


    if (info) {

      info.innerText =
        "Solicitando acceso a la cámara...";

    }


    if (estado) {

      estado.classList.add(
        "activo"
      );


      estado.innerText =
        "Iniciando cámara. Apuntá al marcador cuando aparezca la imagen real.";

    }


    const mindarSystem =
      scene.systems[
        "mindar-image-system"
      ];


    if (!mindarSystem) {

      throw new Error(
        "No se encontró el sistema MindAR."
      );

    }


    await mindarSystem.start();


    if (boton) {

      boton.style.display =
        "none";

    }


    if (info) {

      info.innerText =
        "Cámara activa. Apuntá a uno de los tres marcadores.";

    }

  }

  catch (error) {

    console.error(
      "Error al iniciar AR:",
      error
    );


    if (boton) {

      boton.disabled =
        false;

      boton.innerText =
        "📷 Activar cámara";

    }


    if (estado) {

      estado.classList.remove(
        "activo"
      );


      estado.classList.add(
        "error"
      );


      estado.innerText =
        "No se pudo iniciar la cámara. Verificá el permiso de cámara del navegador.";

    }


    if (info) {

      info.innerText =
        "No se pudo iniciar la cámara.";

    }

  }

}


/* ============================================================
   INICIO
   ============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    configurarTargets();

    configurarArrastreComponentes();

    limpiarMesa();


    const boton =
      document.getElementById(
        "btn-iniciar-ar"
      );


    if (boton) {

      boton.addEventListener(
        "click",
        iniciarAR
      );

    }

  }
);
