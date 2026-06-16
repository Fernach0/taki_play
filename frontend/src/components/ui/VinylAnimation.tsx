'use client';

import { useEffect, useRef, useState } from 'react';

interface VinylAnimationProps {
  songTitle: string;
  artistName: string;
  onDone: () => void;
}

export function VinylAnimation({ songTitle, artistName, onDone }: VinylAnimationProps) {
  const [visible, setVisible]       = useState(true);
  const [armDropped, setArmDropped] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t1 = setTimeout(() => setArmDropped(true), 250);
    const t2 = setTimeout(() => setVisible(false), 1250);
    const t3 = setTimeout(() => onDoneRef.current(), 1550);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-dark-base/95 backdrop-blur-md transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Turntable */}
      <div
        className="relative flex items-center justify-center"
        style={{ animation: 'vinyl-fadein 0.25s ease-out forwards' }}
      >
        {/* Platter */}
        <div className="w-64 h-64 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: 'radial-gradient(circle, #1a1208 60%, #110e08 100%)', border: '4px solid #2e1f0e', boxShadow: '0 0 60px rgba(212,160,23,0.12), inset 0 0 30px rgba(0,0,0,0.5)' }}>

          {/* Vinyl record spinning */}
          <div
            className="w-56 h-56 rounded-full relative overflow-hidden"
            style={{ animation: 'vinyl-spin 1.6s linear infinite' }}
          >
            {/* Grooves via SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
              <circle cx="100" cy="100" r="100" fill="#080604" />
              {[98, 93, 88, 83, 78, 73, 68, 63, 58, 53, 48, 43, 38].map((r, i) => (
                <circle key={r} cx="100" cy="100" r={r}
                  fill="none"
                  stroke={i % 2 === 0 ? '#111009' : '#0a0806'}
                  strokeWidth="3"
                />
              ))}
              {/* Center label */}
              <circle cx="100" cy="100" r="30" fill="#c49010" />
              <circle cx="100" cy="100" r="26" fill="#d4a017" />
              <text x="100" y="97" textAnchor="middle" fill="#0d0a07" fontSize="8" fontFamily="serif" fontWeight="bold">TAKI</text>
              <text x="100" y="108" textAnchor="middle" fill="#0d0a07" fontSize="8" fontFamily="serif" fontWeight="bold">PLAY</text>
              {/* Center hole */}
              <circle cx="100" cy="100" r="4" fill="#0d0a07" />
            </svg>
          </div>
        </div>

        {/* Tonearm pivot + arm */}
        <div className="absolute" style={{ top: '-8px', right: '-16px' }}>
          {/* Pivot point */}
          <div className="w-4 h-4 rounded-full border-2 border-inca-gold bg-dark-surface shadow-md" />
          {/* Arm */}
          <div
            className="origin-top"
            style={{
              transform: armDropped ? 'rotate(-14deg)' : 'rotate(-45deg)',
              transition: 'transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1)',
              marginTop: '-2px',
              marginLeft: '6px',
            }}
          >
            <div className="w-0.5 h-28 rounded-full" style={{ background: 'linear-gradient(to bottom, #c4a882, #7a6652)' }} />
            <div className="w-3 h-1.5 rounded-sm -ml-1.5 mt-0.5" style={{ background: '#d4a017' }} />
          </div>
        </div>
      </div>

      {/* Song info */}
      <div
        className="mt-10 text-center"
        style={{
          opacity: armDropped ? 1 : 0,
          transform: armDropped ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
        }}
      >
        <p className="text-inca-gold text-xs tracking-[0.25em] uppercase mb-2">♪ Reproduciendo</p>
        <p className="text-warm-white font-serif text-2xl font-bold max-w-xs px-4">{songTitle}</p>
        <p className="text-sand-beige text-sm mt-1">{artistName}</p>
      </div>
    </div>
  );
}
