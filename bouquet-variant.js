/**
 * Bouquet Variant - Nueva Arquitectura & Motor de Partículas 3D
 * Genera el ramo de flores amarillas tridimensional, lluvia de pétalos en Canvas,
 * y efectos interactivos al hacer clic o tocar la pantalla.
 */
(function () {
  let canvas, ctx;
  let animationFrameId = null;
  let petals = [];
  let sparkles = [];
  let isRunning = false;

  const isMobile = window.innerWidth < 600;
  const CONFIG = {
    petalCount: isMobile ? 26 : 42,
    sparkleCount: isMobile ? 18 : 32,
    colors: ["#ffd60a", "#ffb703", "#fb8500", "#fff3b0", "#ffe494"]
  };

  // Clase para cada pétalo cayendo en 3D
  class FallingPetal {
    constructor(w, h, startRandomY = true) {
      this.reset(w, h, startRandomY);
    }

    reset(w, h, startRandomY = false) {
      this.x = Math.random() * w;
      this.y = startRandomY ? Math.random() * h : -30 - Math.random() * 50;
      this.size = 12 + Math.random() * 16;
      this.speedY = 1.2 + Math.random() * 1.8;
      this.speedX = -0.5 + Math.random() * 1.0;
      this.angle = Math.random() * 360;
      this.angleSpeed = -1.5 + Math.random() * 3;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.02 + Math.random() * 0.03;
      this.swayWidth = 1.2 + Math.random() * 2.2;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.opacity = 0.6 + Math.random() * 0.4;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = 0.03 + Math.random() * 0.04;
    }

    update(w, h) {
      this.sway += this.swaySpeed;
      this.flip += this.flipSpeed;
      this.x += Math.sin(this.sway) * this.swayWidth + this.speedX;
      this.y += this.speedY;
      this.angle += this.angleSpeed;

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

      // Dibujar forma de pétalo orgánico curvado
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size * 0.5, -this.size * 0.4, -this.size * 0.4, -this.size, 0, -this.size * 1.2);
      ctx.bezierCurveTo(this.size * 0.4, -this.size, this.size * 0.5, -this.size * 0.4, 0, 0);
      ctx.fill();

      // Brillo del pétalo
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Clase para chispas de luz dorada / luciérnagas
  class GoldenSparkle {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.radius = 1.2 + Math.random() * 2.5;
      this.speedY = -0.4 - Math.random() * 0.8;
      this.speedX = -0.3 + Math.random() * 0.6;
      this.alpha = Math.random();
      this.alphaSpeed = 0.015 + Math.random() * 0.02;
      this.growing = Math.random() > 0.5;
    }

    update(w, h) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.growing) {
        this.alpha += this.alphaSpeed;
        if (this.alpha >= 1) this.growing = false;
      } else {
        this.alpha -= this.alphaSpeed;
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
      ctx.shadowColor = "#ffd60a";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Generar los pétalos concéntricos de las flores del ramo en el DOM
  function populateFlowerPetals() {
    const flowerContainers = document.querySelectorAll(".b-flower");
    flowerContainers.forEach((flower) => {
      const outerLayer = flower.querySelector(".b-petals-layer--outer");
      const innerLayer = flower.querySelector(".b-petals-layer--inner");
      const isMain = flower.classList.contains("b-flower--main");
      const outerOffsetY = isMain ? -18 : -14;
      const innerOffsetY = isMain ? -12 : -9;

      if (outerLayer && outerLayer.children.length === 0) {
        const outerCount = isMain ? 18 : 15;
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
        const innerCount = isMain ? 14 : 11;
        const offsetAngle = 360 / innerCount / 2;
        for (let i = 0; i < innerCount; i++) {
          const petal = document.createElement("div");
          petal.className = "b-petal";
          const deg = (360 / innerCount) * i + offsetAngle;
          petal.style.transform = `rotate(${deg}deg) translateY(${innerOffsetY}px)`;
          petal.style.animationDelay = `${(0.2 + i * 0.04).toFixed(2)}s`;
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

    // Efecto interactivo al hacer click: explosión de pétalos y estrellas
    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      burstAt(x, y);
    });
  }

  // Explosión interactiva de partículas
  function burstAt(x, y) {
    for (let i = 0; i < 12; i++) {
      const p = new FallingPetal(canvas.width, canvas.height, false);
      p.x = x + (-20 + Math.random() * 40);
      p.y = y + (-20 + Math.random() * 40);
      p.speedX = (-4 + Math.random() * 8);
      p.speedY = (-5 + Math.random() * 4);
      p.size = 14 + Math.random() * 12;
      petals.push(p);
    }
    // Limitar para mantener 60fps
    if (petals.length > 75) {
      petals.splice(0, petals.length - 75);
    }
  }

  // Bucle de animación del Canvas
  function renderLoop() {
    if (!isRunning || !canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar chispas
    sparkles.forEach((s) => {
      s.update(canvas.width, canvas.height);
      s.draw(ctx);
    });

    // Actualizar y dibujar pétalos
    petals.forEach((p) => {
      p.update(canvas.width, canvas.height);
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
    renderLoop();

    // Destello sutil de chispas cuando la flor central termina de desplegarse
    setTimeout(() => {
      if (isRunning && canvas) {
        burstAt(canvas.width / 2, canvas.height * 0.52);
      }
    }, 1250);
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
    burstAt: burstAt
  };
})();
