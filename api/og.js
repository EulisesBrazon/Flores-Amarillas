import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawNombre = searchParams.get('nombre') || 'Para Ti';
    const nombre = rawNombre.trim();
    const variant = searchParams.get('variant') || 'classic';

    let bgGradient = 'linear-gradient(145deg, #0a0601 0%, #1e1102 50%, #060401 100%)';
    let borderColor = 'rgba(255, 214, 10, 0.65)';
    let tagText = '✨ FELIZ DÍA DE LAS FLORES AMARILLAS ✨';
    let tagColor = '#ffd60a';
    let nameGlow = '0 0 25px rgba(255, 214, 10, 0.9), 0 0 50px rgba(251, 133, 0, 0.6)';
    let nameColor = '#fffdf0';
    let subText = 'Un ramo mágico de girasoles y lluvia de pétalos dorados para iluminar tu vida';
    let subColor = 'rgba(255, 243, 196, 0.92)';
    let badgeText = 'RAMO MÁGICO 3D 🌻';

    if (variant === 'sakura') {
      bgGradient = 'linear-gradient(145deg, #0b0314 0%, #280b33 50%, #0a0212 100%)';
      borderColor = 'rgba(255, 105, 180, 0.65)';
      tagText = '🌸 SAKURA TWILIGHT • DEDICATORIA ESPECIAL 🌸';
      tagColor = '#ff758c';
      nameGlow = '0 0 25px rgba(255, 105, 180, 0.9), 0 0 50px rgba(255, 42, 133, 0.6)';
      nameColor = '#fff0f5';
      subText = 'Un atardecer de flores cerezo y destellos mágicos pensado con mucho cariño para ti';
      subColor = 'rgba(255, 229, 236, 0.92)';
      badgeText = 'SAKURA TWILIGHT 🌸';
    } else if (variant === 'classic') {
      bgGradient = 'linear-gradient(145deg, #050505 0%, #171305 50%, #020202 100%)';
      borderColor = 'rgba(255, 221, 0, 0.65)';
      tagText = '🌻 DÍA DE LAS FLORES AMARILLAS 🌻';
      tagColor = '#ffdd00';
      nameGlow = '0 0 25px rgba(255, 214, 10, 0.9), 0 0 50px rgba(255, 183, 3, 0.6)';
      nameColor = '#fff9d2';
      subText = 'Flores amarillas eternas para recordarte lo especial que eres en mi vida';
      subColor = 'rgba(255, 249, 219, 0.92)';
      badgeText = 'FLORES AMARILLAS 🌻';
    }

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: bgGradient,
            padding: '40px 60px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '28px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  padding: '30px 40px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
                },
                children: [
                  // Badge superior
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        padding: '6px 18px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${borderColor}`,
                        fontSize: '17px',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        color: tagColor,
                        marginBottom: '16px',
                        textTransform: 'uppercase',
                      },
                      children: tagText,
                    },
                  },
                  // Título principal con el nombre del destinatario
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: nombre.length > 22 ? '62px' : '82px',
                        fontWeight: '900',
                        color: nameColor,
                        textShadow: nameGlow,
                        marginBottom: '16px',
                        lineHeight: 1.1,
                      },
                      children: nombre,
                    },
                  },
                  // Subtítulo de dedicatoria
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '24px',
                        fontWeight: '300',
                        color: subColor,
                        maxWidth: '920px',
                        lineHeight: 1.4,
                        marginBottom: '20px',
                      },
                      children: subText,
                    },
                  },
                  // Indicador inferior
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '18px',
                        color: tagColor,
                        letterSpacing: '1px',
                        opacity: 0.9,
                      },
                      children: `✨ ${badgeText} • Toca para abrir tu sorpresa ✨`,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Error generando previsualización: ${e.message}`, { status: 500 });
  }
}
