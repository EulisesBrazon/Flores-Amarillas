/**
 * Prototype Switcher - Implementación basada en la skill 'prototype'
 * Permite alternar dinámicamente entre las variantes de Flores Amarillas
 * respetando los query params como 'nombre' y sin recargas innecesarias.
 */
(function () {
  const VARIANTS = [
    {
      id: "classic",
      badge: "Variante 1",
      name: "Flores Amarillas Clásicas 🌻",
      description: "El regalo tradicional del Día de las Flores Amarillas"
    },
    {
      id: "sakura",
      badge: "Variante 2",
      name: "Sakura Twilight Romántica 🌸",
      description: "Atardecer suave en tonos rosa cerezo y destellos dorados"
    },
    {
      id: "bouquet",
      badge: "Variante 3 (Nueva Arquitectura)",
      name: "Ramo Mágico & Lluvia de Pétalos ✨🌻",
      description: "Animación completamente nueva: bouquet 3D, lluvia de pétalos y tarjeta de regalo"
    }
  ];

  // Obtener variante actual desde la URL
  function getCurrentVariant() {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("variant");
    const found = VARIANTS.find((item) => item.id === v);
    return found ? found.id : VARIANTS[0].id;
  }

  // Aplicar variante al documento
  function applyVariant(variantId) {
    VARIANTS.forEach((v) => {
      document.body.classList.remove(`variant-${v.id}`);
    });
    document.body.classList.add(`variant-${variantId}`);

    // Iniciar o pausar el motor de animación del bouquet según la variante
    if (variantId === "bouquet") {
      if (window.BouquetVariant) {
        window.BouquetVariant.start();
      }
    } else {
      if (window.BouquetVariant) {
        window.BouquetVariant.stop();
      }
    }

    // Sincronizar nombre en la tarjeta del bouquet si existe
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get("nombre");
    const bouquetNameEl = document.getElementById("bouquet-name");
    if (bouquetNameEl) {
      bouquetNameEl.textContent = nombre ? decodeURIComponent(nombre) : "Para Ti";
    }

    // Actualizar URL sin recargar, preservando parámetros como 'nombre'
    const url = new URL(window.location.href);
    url.searchParams.set("variant", variantId);
    window.history.replaceState({}, "", url.toString());

    updateSwitcherUI(variantId);
  }

  // Mover a la variante previa o siguiente
  function cycleVariant(direction) {
    const currentId = getCurrentVariant();
    const currentIndex = VARIANTS.findIndex((v) => v.id === currentId);
    let nextIndex = (currentIndex + direction) % VARIANTS.length;
    if (nextIndex < 0) nextIndex = VARIANTS.length - 1;
    applyVariant(VARIANTS[nextIndex].id);
  }

  // Actualizar la interfaz del switcher
  function updateSwitcherUI(variantId) {
    const current = VARIANTS.find((v) => v.id === variantId) || VARIANTS[0];
    const currentIndex = VARIANTS.findIndex((v) => v.id === current.id);
    const badgeEl = document.getElementById("prototype-badge-text");
    const nameEl = document.getElementById("prototype-name-text");

    if (badgeEl && nameEl) {
      badgeEl.textContent = `${current.badge} (${currentIndex + 1}/${VARIANTS.length})`;
      nameEl.textContent = current.name;
    }
  }

  // Crear e inyectar el Switcher flotante en el DOM
  function createSwitcher() {
    if (document.querySelector(".prototype-switcher-container")) return;

    const container = document.createElement("div");
    container.className = "prototype-switcher-container";
    container.setAttribute("aria-label", "Selector de variantes de prototipo");

    container.innerHTML = `
      <div class="prototype-bar">
        <button type="button" class="prototype-btn" id="prototype-prev" title="Variante anterior (←)" aria-label="Anterior">←</button>
        <div class="prototype-label-wrapper">
          <span class="prototype-badge" id="prototype-badge-text">Variante</span>
          <span class="prototype-variant-name" id="prototype-name-text">Cargando...</span>
        </div>
        <button type="button" class="prototype-btn" id="prototype-next" title="Siguiente variante (→)" aria-label="Siguiente">→</button>
        <button type="button" class="prototype-toggle-hide" id="prototype-minimize" title="Ocultar para ver tarjeta limpia" aria-label="Minimizar">✕</button>
        <button type="button" class="prototype-restore-btn" id="prototype-restore" title="Restaurar selector">🎨 Cambiar Variante</button>
      </div>
      <span class="prototype-hint">Presiona ← / → para comparar</span>
    `;

    document.body.appendChild(container);

    // Eventos de botones
    document.getElementById("prototype-prev").addEventListener("click", () => cycleVariant(-1));
    document.getElementById("prototype-next").addEventListener("click", () => cycleVariant(1));

    // Minimizar / Restaurar
    const minimizeBtn = document.getElementById("prototype-minimize");
    const restoreBtn = document.getElementById("prototype-restore");
    minimizeBtn.addEventListener("click", () => {
      container.classList.add("is-minimized");
    });
    restoreBtn.addEventListener("click", () => {
      container.classList.remove("is-minimized");
    });

    // Navegación por teclado (Flechas Izquierda / Derecha)
    window.addEventListener("keydown", (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag === "input" || activeTag === "textarea" || document.activeElement.isContentEditable) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycleVariant(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        cycleVariant(1);
      }
    });

    // Inicializar estado
    applyVariant(getCurrentVariant());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSwitcher);
  } else {
    createSwitcher();
  }
})();
