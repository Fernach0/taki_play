// Posiciones fijas para evitar hydration mismatch en Next.js (no Math.random en render)
const ICONS = [
  '/iconos-musica/tone.png',
  '/iconos-musica/live-music.png',
  '/iconos-musica/music.png',
  '/iconos-musica/trumpet.png',
  '/iconos-musica/saxophone.png',
  '/iconos-musica/conga.png',
  '/iconos-musica/flute.png',
  '/iconos-musica/xylophone.png',
  '/iconos-musica/ektara.png',
  '/iconos-musica/drum.png',
];

const ITEMS: { icon: number; top: number; left: number; rotate: number; size: number }[] = [
  { icon: 0, top: 2,  left: 4,  rotate: 15,  size: 30 },
  { icon: 3, top: 2,  left: 20, rotate: -25, size: 26 },
  { icon: 6, top: 3,  left: 38, rotate: 10,  size: 32 },
  { icon: 1, top: 2,  left: 55, rotate: -15, size: 28 },
  { icon: 8, top: 3,  left: 72, rotate: 30,  size: 26 },
  { icon: 4, top: 2,  left: 88, rotate: -10, size: 30 },

  { icon: 2, top: 12, left: 10, rotate: -30, size: 28 },
  { icon: 5, top: 11, left: 29, rotate: 20,  size: 32 },
  { icon: 9, top: 13, left: 47, rotate: -5,  size: 26 },
  { icon: 7, top: 12, left: 64, rotate: 35,  size: 30 },
  { icon: 0, top: 11, left: 80, rotate: -20, size: 28 },
  { icon: 3, top: 13, left: 94, rotate: 12,  size: 26 },

  { icon: 5, top: 23, left: 3,  rotate: 25,  size: 30 },
  { icon: 8, top: 22, left: 17, rotate: -35, size: 28 },
  { icon: 1, top: 24, left: 34, rotate: 8,   size: 32 },
  { icon: 6, top: 22, left: 51, rotate: -22, size: 26 },
  { icon: 4, top: 23, left: 68, rotate: 18,  size: 30 },
  { icon: 2, top: 22, left: 85, rotate: -8,  size: 28 },

  { icon: 7, top: 33, left: 8,  rotate: -18, size: 26 },
  { icon: 9, top: 34, left: 25, rotate: 28,  size: 30 },
  { icon: 3, top: 33, left: 43, rotate: -12, size: 32 },
  { icon: 0, top: 34, left: 60, rotate: 22,  size: 28 },
  { icon: 5, top: 33, left: 77, rotate: -32, size: 26 },
  { icon: 1, top: 34, left: 93, rotate: 15,  size: 30 },

  { icon: 4, top: 44, left: 2,  rotate: 10,  size: 28 },
  { icon: 6, top: 43, left: 19, rotate: -28, size: 30 },
  { icon: 8, top: 45, left: 36, rotate: 20,  size: 26 },
  { icon: 2, top: 43, left: 53, rotate: -15, size: 32 },
  { icon: 9, top: 44, left: 70, rotate: 25,  size: 28 },
  { icon: 7, top: 43, left: 87, rotate: -5,  size: 30 },

  { icon: 1, top: 54, left: 7,  rotate: -22, size: 30 },
  { icon: 3, top: 55, left: 24, rotate: 18,  size: 26 },
  { icon: 5, top: 54, left: 41, rotate: -10, size: 32 },
  { icon: 0, top: 55, left: 58, rotate: 30,  size: 28 },
  { icon: 4, top: 54, left: 75, rotate: -18, size: 26 },
  { icon: 6, top: 55, left: 91, rotate: 12,  size: 30 },

  { icon: 8, top: 65, left: 3,  rotate: 28,  size: 28 },
  { icon: 2, top: 64, left: 20, rotate: -15, size: 30 },
  { icon: 7, top: 66, left: 37, rotate: 8,   size: 26 },
  { icon: 9, top: 64, left: 54, rotate: -25, size: 32 },
  { icon: 1, top: 65, left: 71, rotate: 20,  size: 28 },
  { icon: 3, top: 64, left: 88, rotate: -12, size: 30 },

  { icon: 5, top: 75, left: 9,  rotate: -20, size: 26 },
  { icon: 0, top: 76, left: 26, rotate: 15,  size: 30 },
  { icon: 4, top: 75, left: 43, rotate: -30, size: 32 },
  { icon: 6, top: 76, left: 60, rotate: 10,  size: 28 },
  { icon: 8, top: 75, left: 77, rotate: -8,  size: 26 },
  { icon: 2, top: 76, left: 93, rotate: 25,  size: 30 },

  { icon: 9, top: 86, left: 4,  rotate: 18,  size: 30 },
  { icon: 7, top: 85, left: 21, rotate: -25, size: 28 },
  { icon: 1, top: 87, left: 38, rotate: 12,  size: 26 },
  { icon: 3, top: 85, left: 55, rotate: -18, size: 32 },
  { icon: 5, top: 86, left: 72, rotate: 28,  size: 28 },
  { icon: 0, top: 85, left: 89, rotate: -10, size: 30 },

  { icon: 4, top: 95, left: 10, rotate: -15, size: 28 },
  { icon: 6, top: 96, left: 30, rotate: 22,  size: 26 },
  { icon: 8, top: 95, left: 50, rotate: -28, size: 30 },
  { icon: 2, top: 96, left: 70, rotate: 8,   size: 32 },
  { icon: 9, top: 95, left: 90, rotate: -20, size: 28 },
];

export function AndeanBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {ITEMS.map((item, i) => (
        <img
          key={i}
          src={ICONS[item.icon]}
          alt=""
          aria-hidden="true"
          width={item.size}
          height={item.size}
          className="absolute select-none"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            width: item.size,
            height: item.size,
            transform: `rotate(${item.rotate}deg)`,
            opacity: 0.07,
            filter: 'grayscale(30%)',
          }}
        />
      ))}
    </div>
  );
}
