const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const rawNombre = req.query.nombre || '';
    const variant = req.query.variant || 'classic';
    const displayName = rawNombre ? decodeURIComponent(rawNombre.replace(/\+/g, ' ')).trim() : 'Para Ti';

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'flores.eulisesbrazon.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    const ogImageUrl = `${origin}/api/og?nombre=${encodeURIComponent(displayName)}&variant=${encodeURIComponent(variant)}`;
    const pageUrl = `${origin}/?nombre=${encodeURIComponent(displayName)}&variant=${encodeURIComponent(variant)}`;

    let title = `🌻 ¡Un detalle especial para ${displayName}! ✨`;
    let description = `Alguien especial te ha enviado flores amarillas. Toca para abrir tu sorpresa 💛`;

    if (variant === 'bouquet') {
      title = `🌻 ¡Ramo de Flores Amarillas para ${displayName}! ✨`;
      description = `Tienes un ramo mágico esperándote. Toca para descubrir tu dedicatoria 💛`;
    } else if (variant === 'sakura') {
      title = `🌸 ¡Flores Sakura para ${displayName}! ✨`;
      description = `Un detalle romántico crepuscular pensado especialmente para ti 🌸`;
    }

    const filePath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(filePath, 'utf8');

    const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:secure_url" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:url" content="${pageUrl}">
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImageUrl}">
    `;

    html = html.replace(/<title>.*?<\/title>/i, '');
    html = html.replace(/<head>/i, `<head>${metaTags}`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    const filePath = path.join(process.cwd(), 'index.html');
    return res.status(200).sendFile(filePath);
  }
};
