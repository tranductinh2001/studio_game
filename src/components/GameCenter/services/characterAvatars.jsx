import React from 'react';

// =========================================================================
// 2D CARTOON CHARACTER PORTRAITS (SVG DATA URIs)
// Crisp, zero-latency vector illustrations for each team/character
// =========================================================================

const makeSvgDataUri = (svgBody) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${svgBody}</svg>`
  )}`;

export const CHARACTER_PRESETS = [
  {
    id: 'char_wolf',
    name: 'Sói Bạc Thông Thái',
    badge: '🐺',
    bg: '#0ea5e9',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g1)" stroke="#e0f2fe" stroke-width="4"/>
      <polygon points="24,48 34,16 50,36" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="96,48 86,16 70,36" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="29,43 35,24 45,36" fill="#38bdf8"/>
      <polygon points="91,43 85,24 75,36" fill="#38bdf8"/>
      <ellipse cx="60" cy="66" rx="34" ry="30" fill="#475569" stroke="#e2e8f0" stroke-width="2.5"/>
      <ellipse cx="60" cy="76" rx="22" ry="18" fill="#f1f5f9"/>
      <circle cx="46" cy="58" r="6" fill="#0f172a"/><circle cx="47.5" cy="56.5" r="2.2" fill="#38bdf8"/>
      <circle cx="74" cy="58" r="6" fill="#0f172a"/><circle cx="75.5" cy="56.5" r="2.2" fill="#38bdf8"/>
      <polygon points="54,70 66,70 60,77" fill="#0f172a"/>
      <path d="M51 82 Q60 89 69 82" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_eagle',
    name: 'Đại Bàng Lửa',
    badge: '🦅',
    bg: '#f59e0b',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#c2410c"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g2)" stroke="#fef3c7" stroke-width="4"/>
      <path d="M26 52 Q60 14 94 52 L88 86 Q60 100 32 86 Z" fill="#78350f" stroke="#fde68a" stroke-width="2.5"/>
      <path d="M36 44 Q60 22 84 44 L78 62 Q60 54 42 62 Z" fill="#fef3c7"/>
      <circle cx="46" cy="54" r="5.5" fill="#0f172a"/><circle cx="47" cy="52.5" r="2" fill="#fbbf24"/>
      <circle cx="74" cy="54" r="5.5" fill="#0f172a"/><circle cx="75" cy="52.5" r="2" fill="#fbbf24"/>
      <path d="M37 46 L52 50 M83 46 L68 50" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
      <polygon points="50,62 70,62 60,82" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
    `)
  },
  {
    id: 'char_dragon',
    name: 'Rồng Lửa Chiến Binh',
    badge: '🐉',
    bg: '#ef4444',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f87171"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g3)" stroke="#fee2e2" stroke-width="4"/>
      <polygon points="28,44 20,16 44,32" fill="#facc15" stroke="#7f1d1d" stroke-width="2"/>
      <polygon points="92,44 100,16 76,32" fill="#facc15" stroke="#7f1d1d" stroke-width="2"/>
      <ellipse cx="60" cy="65" rx="34" ry="29" fill="#dc2626" stroke="#fecaca" stroke-width="2.5"/>
      <ellipse cx="60" cy="76" rx="24" ry="15" fill="#fca5a5"/>
      <circle cx="46" cy="55" r="6" fill="#fef08a"/><circle cx="46" cy="55" r="3" fill="#0f172a"/>
      <circle cx="74" cy="55" r="6" fill="#fef08a"/><circle cx="74" cy="55" r="3" fill="#0f172a"/>
      <circle cx="52" cy="72" r="2.5" fill="#7f1d1d"/><circle cx="68" cy="72" r="2.5" fill="#7f1d1d"/>
      <path d="M46 82 Q60 90 74 82" stroke="#7f1d1d" stroke-width="3" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_knight',
    name: 'Hiệp Sĩ Công Nghệ',
    badge: '⚔️',
    bg: '#10b981',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#065f46"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g4)" stroke="#d1fae5" stroke-width="4"/>
      <path d="M56 14 L64 14 L68 28 L52 28 Z" fill="#fbbf24"/>
      <rect x="30" y="28" width="60" height="64" rx="24" fill="#94a3b8" stroke="#f8fafc" stroke-width="3"/>
      <rect x="38" y="46" width="44" height="18" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
      <circle cx="49" cy="55" r="4" fill="#34d399"/><circle cx="71" cy="55" r="4" fill="#34d399"/>
      <path d="M44 74 L76 74 M48 80 L72 80" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_flash',
    name: 'Tia Chớp Thần Tốc',
    badge: '⚡',
    bg: '#8b5cf6',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g5)" stroke="#ede9fe" stroke-width="4"/>
      <circle cx="60" cy="64" r="32" fill="#fde68a" stroke="#fffbeb" stroke-width="2.5"/>
      <path d="M28 56 Q60 20 92 56 L86 38 Q60 22 34 38 Z" fill="#6d28d9"/>
      <polygon points="62,18 52,36 60,36 55,48 70,32 62,32" fill="#facc15" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="48" cy="62" r="5" fill="#0f172a"/><circle cx="49.5" cy="60.5" r="2" fill="#ffffff"/>
      <circle cx="72" cy="62" r="5" fill="#0f172a"/><circle cx="73.5" cy="60.5" r="2" fill="#ffffff"/>
      <path d="M50 76 Q60 84 70 76" stroke="#7c2d12" stroke-width="3" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_astro',
    name: 'Phi Hành Gia Sao Băng',
    badge: '🌠',
    bg: '#ec4899',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#9d174d"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g6)" stroke="#fce7f3" stroke-width="4"/>
      <circle cx="60" cy="62" r="35" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
      <ellipse cx="60" cy="62" rx="25" ry="20" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M42 52 Q52 46 62 50" stroke="#7dd3fc" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
      <circle cx="51" cy="62" r="3.5" fill="#f472b6"/><circle cx="69" cy="62" r="3.5" fill="#f472b6"/>
      <path d="M54 70 Q60 75 66 70" stroke="#f9a8d4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="22" r="5" fill="#facc15"/>
    `)
  },
  {
    id: 'char_duck',
    name: 'Vịt Vàng Thuyền Trưởng',
    badge: '🦆',
    bg: '#eab308',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g7)" stroke="#fef9c3" stroke-width="4"/>
      <rect x="36" y="20" width="48" height="16" rx="6" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
      <rect x="30" y="34" width="60" height="6" rx="3" fill="#0f172a"/>
      <circle cx="60" cy="66" r="30" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <circle cx="48" cy="58" r="5" fill="#0f172a"/><circle cx="49.5" cy="56.5" r="1.8" fill="#ffffff"/>
      <circle cx="72" cy="58" r="5" fill="#0f172a"/><circle cx="73.5" cy="56.5" r="1.8" fill="#ffffff"/>
      <ellipse cx="60" cy="72" rx="14" ry="8" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
    `)
  },
  {
    id: 'char_robot',
    name: 'Robot AI Webby',
    badge: '🤖',
    bg: '#06b6d4',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g8" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0e7490"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g8)" stroke="#cffafe" stroke-width="4"/>
      <line x1="60" y1="16" x2="60" y2="30" stroke="#e2e8f0" stroke-width="4"/>
      <circle cx="60" cy="14" r="6" fill="#facc15"/>
      <rect x="28" y="30" width="64" height="56" rx="16" fill="#e2e8f0" stroke="#ffffff" stroke-width="3"/>
      <rect x="36" y="42" width="48" height="24" rx="8" fill="#0f172a"/>
      <circle cx="48" cy="54" r="5" fill="#22d3ee"/><circle cx="72" cy="54" r="5" fill="#22d3ee"/>
      <path d="M48 76 L72 76" stroke="#0e7490" stroke-width="4" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_lion',
    name: 'Sư Tử Hoàng Kim',
    badge: '🦁',
    bg: '#f97316',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g9" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#9a3412"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g9)" stroke="#ffedd5" stroke-width="4"/>
      <circle cx="60" cy="62" r="40" fill="#b45309" stroke="#f59e0b" stroke-width="3" stroke-dasharray="10 4"/>
      <circle cx="60" cy="64" r="28" fill="#fde047"/>
      <circle cx="49" cy="58" r="4.5" fill="#0f172a"/><circle cx="71" cy="58" r="4.5" fill="#0f172a"/>
      <polygon points="55,66 65,66 60,72" fill="#9a3412"/>
      <path d="M52 76 Q60 82 68 76" stroke="#9a3412" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_dolphin',
    name: 'Cá Heo Đại Dương',
    badge: '🐬',
    bg: '#0284c7',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g10" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g10)" stroke="#bae6fd" stroke-width="4"/>
      <path d="M26 76 Q32 30 64 28 Q94 28 96 66 Q80 68 72 78 Q50 86 26 76 Z" fill="#0ea5e9" stroke="#e0f2fe" stroke-width="2.5"/>
      <path d="M36 74 Q58 64 86 66 Q66 84 36 74 Z" fill="#f0f9ff"/>
      <circle cx="72" cy="50" r="4.5" fill="#0f172a"/><circle cx="73" cy="48.5" r="1.6" fill="#ffffff"/>
      <path d="M74 62 Q82 64 88 60" stroke="#0c4a6e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_panda',
    name: 'Gấu Trúc Hacker',
    badge: '🐼',
    bg: '#14b8a6',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g11" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2dd4bf"/><stop offset="100%" stop-color="#0f766e"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g11)" stroke="#ccfbf1" stroke-width="4"/>
      <circle cx="34" cy="34" r="12" fill="#0f172a"/><circle cx="86" cy="34" r="12" fill="#0f172a"/>
      <circle cx="60" cy="64" r="32" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <ellipse cx="46" cy="58" rx="9" ry="11" transform="rotate(-15 46 58)" fill="#0f172a"/>
      <ellipse cx="74" cy="58" rx="9" ry="11" transform="rotate(15 74 58)" fill="#0f172a"/>
      <circle cx="47" cy="56" r="3" fill="#2dd4bf"/><circle cx="73" cy="56" r="3" fill="#2dd4bf"/>
      <ellipse cx="60" cy="70" rx="5" ry="3.5" fill="#0f172a"/>
      <path d="M52 77 Q60 83 68 77" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'char_fox',
    name: 'Cáo Tinh Anh',
    badge: '🦊',
    bg: '#ea580c',
    image: makeSvgDataUri(`
      <defs><linearGradient id="g12" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#c2410c"/></linearGradient></defs>
      <circle cx="60" cy="60" r="58" fill="url(#g12)" stroke="#ffedd5" stroke-width="4"/>
      <polygon points="24,50 30,16 50,38" fill="#ea580c" stroke="#fff7ed" stroke-width="2"/>
      <polygon points="96,50 90,16 70,38" fill="#ea580c" stroke="#fff7ed" stroke-width="2"/>
      <ellipse cx="60" cy="66" rx="34" ry="28" fill="#f97316" stroke="#fff7ed" stroke-width="2"/>
      <path d="M28 66 Q45 88 60 92 Q75 88 92 66 Q75 74 60 72 Q45 74 28 66 Z" fill="#fff7ed"/>
      <circle cx="46" cy="58" r="5" fill="#0f172a"/><circle cx="47.5" cy="56.5" r="1.8" fill="#ffffff"/>
      <circle cx="74" cy="58" r="5" fill="#0f172a"/><circle cx="75.5" cy="56.5" r="1.8" fill="#ffffff"/>
      <circle cx="60" cy="74" r="4.5" fill="#0f172a"/>
    `)
  }
];

export const getCharacterForTeam = (team, index = 0) => {
  if (!team) return CHARACTER_PRESETS[index % CHARACTER_PRESETS.length];
  if (team.characterImage) {
    return {
      id: team.characterId || 'custom',
      name: team.name,
      badge: team.icon || '⭐',
      image: team.characterImage
    };
  }
  if (team.characterId) {
    const found = CHARACTER_PRESETS.find((c) => c.id === team.characterId);
    if (found) return found;
  }
  const idx = typeof team.number === 'number' ? Math.max(0, team.number - 1) : index;
  return CHARACTER_PRESETS[idx % CHARACTER_PRESETS.length];
};

export function CharacterAvatar({ team, index = 0, size = 'md', className = '' }) {
  const char = getCharacterForTeam(team, index);
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };
  const dimClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 shadow-md border-2 ${dimClass} ${className}`}
      style={{ borderColor: team?.color || '#38bdf8' }}
      title={team?.name || char.name}
    >
      <img
        src={char.image}
        alt={team?.name || char.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
