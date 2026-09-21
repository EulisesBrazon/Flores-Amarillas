/**
 * frases.js - Gestión y persistencia de dedicatorias para el Día de las Flores Amarillas
 * Asigna una frase aleatoria de entre 22 dedicatorias únicas y la guarda en localStorage
 * para que en visitas posteriores desde el mismo dispositivo se conserve la misma frase.
 */
(function () {
  const FRASES = [
    "Un detalle eterno para recordarte lo mucho que iluminas mi vida. 💛",
    "Dicen que el amarillo es alegría, pero para mí la verdadera alegría eres tú. ✨",
    "Flores amarillas para la persona que hace florecer todo a su alrededor. 🌻",
    "Que la magia de este día te acompañe siempre, como tu luz me acompaña a mí. 💛",
    "Una flor amarilla por cada sonrisa que me has regalado sin darte cuenta. 🌼",
    "No podía dejar pasar este día sin recordarte lo especial e irremplazable que eres. ✨",
    "Que estas flores te recuerden que siempre estás presente en mis mejores pensamientos. 🌻",
    "El mundo necesita más personas con un corazón tan brillante como el tuyo. 💛",
    "Para la persona que tiene el don de convertir cualquier día común en algo mágico. ✨",
    "Estas flores no se marchitan, igual que el cariño tan sincero que siento por ti. 🌼",
    "Amarillo como el sol de la mañana, brillante como todo lo que tocas con tu ternura. 🌻",
    "Prometí darte flores amarillas, y aquí tienes un jardín entero que nunca dejará de brillar. 💛",
    "Tu energía ilumina cada rincón de mi mundo. ¡Feliz día de las flores amarillas! ✨",
    "La vida es mucho más bonita desde que formas parte de mi camino. 🌼",
    "Un abrazo en forma de flores doradas para alguien que vale oro puro. 🌻",
    "Gracias por ser ese rayito de luz cálida que siempre me hace sonreír. 💛",
    "Hoy y siempre, mereces que te llenen de flores, amor y momentos inolvidables. ✨",
    "Que este detalle llene tu corazón de la misma paz y alegría que tú me transmites. 🌼",
    "Floreces con tanta fuerza que es imposible no admirar la belleza de tu alma. 🌻",
    "Porque alguien tan único merecía un detalle igual de mágico. ¡Te adoro! 💛",
    "El amor se demuestra en los detalles, y tú mereces los más hermosos del universo. ✨",
    "Para quien hace que cada segundo a su lado se sienta como primavera. 🌼"
  ];

  // Obtener o asignar aleatoriamente la frase persistida
  function getOrAssignPhrase(nombre) {
    const cleanName = nombre ? encodeURIComponent(nombre.trim().toLowerCase()) : "general";
    const cacheKey = `flores_frase_dedicatoria_${cleanName}`;
    let frase = null;

    try {
      frase = localStorage.getItem(cacheKey);
    } catch (err) {
      console.warn("localStorage no disponible:", err);
    }

    // Si no está en caché o la frase guardada ya no existe en la lista
    if (!frase || !FRASES.includes(frase)) {
      const randomIndex = Math.floor(Math.random() * FRASES.length);
      frase = FRASES[randomIndex];
      try {
        localStorage.setItem(cacheKey, frase);
      } catch (err) {
        // En caso de modo privado/incógnito estricto
      }
    }

    return frase;
  }

  // Aplicar la frase en todos los contenedores dedicados
  function applyDedicationPhrase() {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get("nombre");
    const fraseAsignada = getOrAssignPhrase(nombre);

    // 1. Tarjeta del Bouquet (Variante 3)
    const bouquetPhraseEl = document.getElementById("bouquet-phrase");
    if (bouquetPhraseEl) {
      bouquetPhraseEl.textContent = fraseAsignada;
    }

    // 2. Dedicatoria flotante (Variantes 1 y 2 - Clásica y Sakura)
    const generalPhraseEl = document.getElementById("frase-usuario");
    if (generalPhraseEl) {
      generalPhraseEl.textContent = fraseAsignada;
    }
  }

  // Exponer a nivel global para que prototype.js o cambios dinámicos puedan invocarla
  window.FloresFrases = {
    lista: FRASES,
    obtenerFrase: getOrAssignPhrase,
    aplicar: applyDedicationPhrase
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDedicationPhrase);
  } else {
    applyDedicationPhrase();
  }
})();
