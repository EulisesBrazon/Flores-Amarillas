/**
 * Bouquet Variant - Motor de Partículas y Flores con Optimización Adaptativa
 * Detecta si el usuario navega desde Móvil o Desktop:
 * - Desktop: Máxima fidelidad visual (40+ partículas, sombras volumétricas, floración completa).
 * - Móvil: Ultra-optimizado a 60 FPS (3 flores nítidas sin sobreposición, partículas ligeras,
 *   toques suaves con solo 3 pétalos para no sobrecargar el GPU).
 */
(function () {
  let canvas, ctx;
  let animationFrameId = null;
  let petals = [];
  let sparkles = [];
  let isRunning = false;
  let lastBurstTime = 0;
  let lastFrameTime = 0;

  // Detección precisa de dispositivos móviles / táctiles
  function detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
    );
  }

  const isMobile = detectMobile();

  // Etiquetar body para que el CSS también adapte el renderizado
  if (document.body) {
    document.body.classList.add(isMobile ? 'is-mobile-device' : 'is-desktop-device');
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add(isMobile ? 'is-mobile-device' : 'is-desktop-device');
    });
  }

  // Parámetros de rendimiento equilibrados según dispositivo (15 FPS en móvil)
  const CONFIG = {
    petalCount: isMobile ? 6 : 38,
    sparkleCount: isMobile ? 4 : 26,
    burstCount: isMobile ? 3 : 12,
    maxPetals: isMobile ? 18 : 75,
    colors: ["#ffd60a", "#ffb703", "#fb8500", "#fff3b0", "#ffe494"]
  };

  // Clase para cada pétalo cayendo
  class FallingPetal {
    constructor(w, h, startRandomY = true) {
      this.reset(w, h, startRandomY);
    }

    reset(w, h, startRandomY = false) {
      this.x = Math.random() * w;
      this.y = startRandomY ? Math.random() * h : -30 - Math.random() * 50;
      this.size = isMobile ? (10 + Math.random() * 12) : (12 + Math.random() * 16);
      this.speedY = 1.2 + Math.random() * 1.6;
      this.speedX = -0.4 + Math.random() * 0.8;
      this.angle = Math.random() * 360;
      this.angleSpeed = -1.2 + Math.random() * 2.4;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.02 + Math.random() * 0.03;
      this.swayWidth = 1.0 + Math.random() * 1.8;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.opacity = 0.65 + Math.random() * 0.35;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = 0.03 + Math.random() * 0.03;
    }

    update(w, h, dt = 1) {
      this.sway += this.swaySpeed * dt;
      this.flip += this.flipSpeed * dt;
      this.x += (Math.sin(this.sway) * this.swayWidth + this.speedX) * dt;
      this.y += this.speedY * dt;
      this.angle += this.angleSpeed * dt;

      if (this.y > h + 40 || this.x < -40 || this.x > w + 40) {
        this.reset(w, h, false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.scale(Math.cos(this.flip), 1);
      ctx.globalAlpha = this.opacity;

      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size * 0.5, -this.size * 0.4, -this.size * 0.4, -this.size, 0, -this.size * 1.2);
      ctx.bezierCurveTo(this.size * 0.4, -this.size, this.size * 0.5, -this.size * 0.4, 0, 0);
      ctx.fill();

      // En desktop trazamos el contorno iluminado; en móvil se omite para duplicar los FPS
      if (!isMobile) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Clase para chispas de luz dorada
  class GoldenSparkle {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.radius = 1.2 + Math.random() * 2.2;
      this.speedY = -0.3 - Math.random() * 0.6;
      this.speedX = -0.2 + Math.random() * 0.4;
      this.alpha = Math.random();
      this.alphaSpeed = 0.015 + Math.random() * 0.02;
      this.growing = Math.random() > 0.5;
    }

    update(w, h, dt = 1) {
      this.x += this.speedX * dt;
      this.y += this.speedY * dt;

      if (this.growing) {
        this.alpha += this.alphaSpeed * dt;
        if (this.alpha >= 0.9) this.growing = false;
      } else {
        this.alpha -= this.alphaSpeed * dt;
        if (this.alpha <= 0.1) this.growing = true;
      }

      if (this.y < -20 || this.x < -20 || this.x > w + 20) {
        this.reset(w, h);
        this.y = h + 10;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#fff8db";

      // shadowBlur solo en desktop para no castigar el renderizador móvil
      if (!isMobile) {
        ctx.shadowColor = "#ffd60a";
        ctx.shadowBlur = 8;
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Generar los pétalos concéntricos de las flores del ramo en el DOM
  // Optimizado en móvil: 3 flores limpias (sin la 4ta redundante) y menos nodos
  function populateFlowerPetals() {
    const flowerContainers = document.querySelectorAll(".b-flower");
    flowerContainers.forEach((flower) => {
      // En móvil, la 4ta flor del fondo (b-flower--top) se omite para evitar solapamientos y ahorrar DOM
      if (isMobile && flower.classList.contains("b-flower--top")) {
        flower.style.display = "none";
        return;
      }

      const outerLayer = flower.querySelector(".b-petals-layer--outer");
      const innerLayer = flower.querySelector(".b-petals-layer--inner");
      const isMain = flower.classList.contains("b-flower--main");
      const outerOffsetY = isMain ? -18 : -14;
      const innerOffsetY = isMain ? -12 : -9;

      // Densidad de pétalos adaptada
      const outerCount = isMobile ? (isMain ? 14 : 11) : (isMain ? 18 : 15);
      const innerCount = isMobile ? (isMain ? 10 : 8) : (isMain ? 14 : 11);

      if (outerLayer && outerLayer.children.length === 0) {
        for (let i = 0; i < outerCount; i++) {
          const petal = document.createElement("div");
          petal.className = "b-petal";
          const deg = (360 / outerCount) * i;
          petal.style.transform = `rotate(${deg}deg) translateY(${outerOffsetY}px)`;
          petal.style.animationDelay = `${(i * 0.04).toFixed(2)}s`;
          outerLayer.appendChild(petal);
        }
      }

      if (innerLayer && innerLayer.children.length === 0) {
        const offsetAngle = 360 / innerCount / 2;
        for (let i = 0; i < innerCount; i++) {
          const petal = document.createElement("div");
          petal.className = "b-petal";
          const deg = (360 / innerCount) * i + offsetAngle;
          petal.style.transform = `rotate(${deg}deg) translateY(${innerOffsetY}px)`;
          petal.style.animationDelay = `${(0.15 + i * 0.04).toFixed(2)}s`;
          innerLayer.appendChild(petal);
        }
      }
    });
  }

  // Inicializar Canvas
  function initCanvas() {
    canvas = document.getElementById("bouquet-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    petals = [];
    for (let i = 0; i < CONFIG.petalCount; i++) {
      petals.push(new FallingPetal(canvas.width, canvas.height, true));
    }

    sparkles = [];
    for (let i = 0; i < CONFIG.sparkleCount; i++) {
      sparkles.push(new GoldenSparkle(canvas.width, canvas.height));
    }

    // Efecto interactivo al hacer click/tap
    canvas.addEventListener("pointerdown", (e) => {
      const now = performance.now();
      // En móvil evitar acumulación por pulsaciones muy rápidas
      if (isMobile && now - lastBurstTime < 280) return;
      lastBurstTime = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      burstAt(x, y);
    });
  }

  // Explosión interactiva de partículas (Solo 3 pétalos en móvil para fluidez)
  function burstAt(x, y) {
    const count = CONFIG.burstCount;
    for (let i = 0; i < count; i++) {
      const p = new FallingPetal(canvas.width, canvas.height, false);
      p.x = x + (-15 + Math.random() * 30);
      p.y = y + (-15 + Math.random() * 30);
      p.speedX = (-3 + Math.random() * 6);
      p.speedY = (-4 + Math.random() * 3);
      p.size = isMobile ? (10 + Math.random() * 8) : (14 + Math.random() * 12);
      petals.push(p);
    }

    // Limitar para mantener tasa de frames limpia
    if (petals.length > CONFIG.maxPetals) {
      petals.splice(0, petals.length - CONFIG.maxPetals);
    }
  }

  // Límite estricto de 15 FPS en móvil (~66.6ms por cuadro) para máxima ligereza
  const MOBILE_FRAME_INTERVAL = 1000 / 15; // 66.67ms

  // Bucle de animación del Canvas con pacing estricto a 15 FPS en móvil
  function renderLoop(timestamp) {
    if (!isRunning || !canvas || !ctx) return;

    let dt = 1;
    if (isMobile) {
      if (!lastFrameTime) lastFrameTime = timestamp || performance.now();
      const elapsed = timestamp ? (timestamp - lastFrameTime) : MOBILE_FRAME_INTERVAL;

      // En móviles saltar ejecución si aún no han pasado los 66.6ms (15 FPS)
      if (elapsed < MOBILE_FRAME_INTERVAL) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }
      dt = Math.min(elapsed / 16.67, 5);
      lastFrameTime = timestamp || performance.now();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar chispas
    sparkles.forEach((s) => {
      s.update(canvas.width, canvas.height, dt);
      s.draw(ctx);
    });

    // Actualizar y dibujar pétalos
    petals.forEach((p) => {
      p.update(canvas.width, canvas.height, dt);
      p.draw(ctx);
    });

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Reiniciar la animación suave de entrada
  function replayEntrance() {
    const flowers = document.querySelectorAll(".b-flower");
    flowers.forEach((f) => {
      f.style.animation = "none";
      void f.offsetWidth;
      f.style.animation = "";
    });
    const wrap = document.querySelector(".bouquet-wrap-container");
    if (wrap) {
      wrap.style.animation = "none";
      void wrap.offsetWidth;
      wrap.style.animation = "";
    }
    const card = document.querySelector(".bouquet-card");
    if (card) {
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = "";
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    populateFlowerPetals();
    replayEntrance();
    if (!canvas) initCanvas();
    animationFrameId = requestAnimationFrame(renderLoop);

    // En móvil omitir destello automático inicial para arranque instantáneo
    if (!isMobile) {
      setTimeout(() => {
        if (isRunning && canvas) {
          burstAt(canvas.width / 2, canvas.height * 0.52);
        }
      }, 1250);
    }
  }

  function stop() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Exponer a ventana global
  window.BouquetVariant = {
    start: start,
    stop: stop,
    burstAt: burstAt,
    isMobile: isMobile
  };
})();
