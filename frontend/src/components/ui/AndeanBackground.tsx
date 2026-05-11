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

// Grilla densa generada a nivel de módulo (no en render → sin hydration mismatch)
const COLS = 11;
const ROWS = 14;

const ITEMS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const stagger = row % 2 === 0 ? 0 : 4.5; // efecto honeycomb
  return {
    icon: i % ICONS.length,
    left: 1 + col * 9 + stagger,
    top: 1 + row * 7,
    rotate: ((i * 47) % 80) - 40,        // rotación determinista −40° a +40°
    size: 34 + (i % 4) * 4,              // 34 / 38 / 42 / 46 px
  };
});

export function AndeanBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      {ITEMS.map((item, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={ICONS[item.icon]}
          alt=""
          aria-hidden="true"
          width={item.size}
          height={item.size}
          style={{
            position: 'absolute',
            top: `${item.top}%`,
            left: `${item.left}%`,
            width: item.size,
            height: item.size,
            transform: `rotate(${item.rotate}deg)`,
            opacity: 0.18,
            // Convierte el PNG a tono dorado cálido visible sobre fondo oscuro
            filter: 'brightness(0) invert(1) sepia(0.4) saturate(2) hue-rotate(5deg)',
          }}
        />
      ))}
    </div>
  );
}
