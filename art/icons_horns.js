const ART_ICON_HORNS = (() => {
  const O = '#1d1220';
  const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${body}</svg>`;
  return {
    // Горн (Bugle): +1 попытка
    bugle: svg(`
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".55" stop-color="#e8ae32"/><stop offset="1" stop-color="#a8650e"/></linearGradient>
        <linearGradient id="bb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6c24a"/><stop offset="1" stop-color="#ffe9a6"/></linearGradient>
      </defs>
      <path d="M30 70 C24 44 58 34 76 46 C88 54 84 70 70 70" fill="none" stroke="${O}" stroke-width="16" stroke-linecap="round"/>
      <path d="M30 70 C24 44 58 34 76 46 C88 54 84 70 70 70" fill="none" stroke="url(#bg)" stroke-width="7" stroke-linecap="round"/>
      <path d="M33 60 C34 48 52 42 66 46" fill="none" stroke="#fff6cf" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
      <rect x="12" y="64" width="64" height="13" rx="6" fill="url(#bg)" stroke="${O}" stroke-width="5"/>
      <rect x="18" y="66.5" width="50" height="3" rx="1.5" fill="#fff6cf" opacity=".75"/>
      <rect x="6" y="61" width="11" height="19" rx="4" fill="#c98a1c" stroke="${O}" stroke-width="5"/>
      <path d="M72 64 L106 40 Q120 70 106 100 L72 77 Z" fill="url(#bb)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M106 40 Q120 70 106 100 Q98 70 106 40 Z" fill="#7a4608" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 64 L100 50" stroke="#fff6cf" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <path d="M44 77 C44 92 40 98 34 104" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
      <path d="M44 77 C44 92 40 98 34 104" fill="none" stroke="#d8262c" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 100 L40 100 L42 116 L26 116 Z" fill="#d8262c" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M31 104 L31 113 M35 104 L35 113" stroke="#8a0f14" stroke-width="2"/>`),
    // Большой горн (Gjallarhorn): все 3 попытки
    gjallar: svg(`
      <defs>
        <linearGradient id="gi" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e9cf9c"/><stop offset=".6" stop-color="#fff4da"/><stop offset="1" stop-color="#f3dfb4"/></linearGradient>
        <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset="1" stop-color="#c9871a"/></linearGradient>
      </defs>
      <path d="M10 104 C22 64 54 32 98 12 L120 44 C82 58 52 86 30 118 Z" fill="url(#gi)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M30 118 C52 86 82 58 120 44 L114 36 C78 50 48 78 24 110 Z" fill="#c9a46a" opacity=".55"/>
      <path d="M26 96 C40 72 64 50 94 32" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <path d="M32 80 L48 96" stroke="${O}" stroke-width="14" stroke-linecap="round"/>
      <path d="M32 80 L48 96" stroke="url(#gg)" stroke-width="7" stroke-linecap="round"/>
      <path d="M60 52 L76 70" stroke="${O}" stroke-width="14" stroke-linecap="round"/>
      <path d="M60 52 L76 70" stroke="url(#gg)" stroke-width="7" stroke-linecap="round"/>
      <path d="M96 16 Q114 18 122 40 Q112 46 104 44 Q96 30 96 16 Z" fill="url(#gg)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 22 Q112 24 116 36" fill="none" stroke="#fff6cf" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="14" cy="110" r="8" fill="url(#gg)" stroke="${O}" stroke-width="4.5"/>
      <path d="M50 30 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 Z" fill="#fff6b0" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M86 92 l3 -6 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 Z" fill="#fff6b0" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`),
    // Рог Демона: призыв босса клана
    dhorn: svg(`
      <defs>
        <linearGradient id="dh" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2a0610"/><stop offset=".5" stop-color="#8a1426"/><stop offset="1" stop-color="#d23a3a"/></linearGradient>
        <radialGradient id="dr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd0ff"/><stop offset=".5" stop-color="#c04dff"/><stop offset="1" stop-color="#c04dff" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="60" cy="66" r="44" fill="url(#dr)" opacity=".45"/>
      <path d="M30 112 C18 80 30 44 64 26 C84 16 104 14 118 8 C104 22 96 36 84 46 C64 62 54 86 56 112 Z" fill="url(#dh)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M36 98 C30 74 40 52 64 38" fill="none" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M38 88 C44 84 52 84 58 88 M42 70 C48 66 58 66 64 70 M52 54 C58 50 68 50 74 54" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="47" cy="78" r="3.5" fill="#f2a0ff" stroke="${O}" stroke-width="2"/>
      <circle cx="58" cy="61" r="3.5" fill="#f2a0ff" stroke="${O}" stroke-width="2"/>
      <circle cx="70" cy="46" r="3" fill="#f2a0ff" stroke="${O}" stroke-width="2"/>
      <path d="M26 110 Q44 104 60 110 L60 120 Q44 114 26 120 Z" fill="#3a2a30" stroke="${O}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M30 112 Q44 108 56 112" fill="none" stroke="#8a7a80" stroke-width="2" stroke-linecap="round"/>`)
  };
})();
