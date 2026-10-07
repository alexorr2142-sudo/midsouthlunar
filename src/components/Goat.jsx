/**
 * Yang Yang (羊羊), the festival's paper-cut goat mascot. One original SVG
 * drawn in the red-and-gold palette, used in the hero, the chat button, and
 * the chat header. `mood` switches the expression.
 */
export default function Goat({ className = 'h-32 w-32', mood = 'happy', label }) {
  const mouth = mood === 'talk'
    ? <ellipse cx="60" cy="78" rx="5" ry="3.5" fill="#8A0E15" />
    : <path d="M53 76c3 4 11 4 14 0" stroke="#8A0E15" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  return (
    <svg viewBox="0 0 120 120" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} focusable="false">
      {/* lucky coin halo */}
      <circle cx="60" cy="62" r="54" fill="#F3D27A" />
      <circle cx="60" cy="62" r="48" fill="none" stroke="#D4A017" strokeWidth="2" strokeDasharray="5 4" />
      {/* horns */}
      <path d="M40 34c-12-2-20-12-16-24 8 2 12 8 12 14 0 3-1 5-2 7" fill="#D4A017" stroke="#8A0E15" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M30 20c-3 2-4 6-2 9" fill="none" stroke="#8A0E15" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M80 34c12-2 20-12 16-24-8 2-12 8-12 14 0 3 1 5 2 7" fill="#D4A017" stroke="#8A0E15" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M90 20c3 2 4 6 2 9" fill="none" stroke="#8A0E15" strokeWidth="1.6" strokeLinecap="round" />
      {/* ears */}
      <ellipse cx="31" cy="54" rx="8" ry="4.5" transform="rotate(-25 31 54)" fill="#B5121B" stroke="#8A0E15" strokeWidth="2" />
      <ellipse cx="89" cy="54" rx="8" ry="4.5" transform="rotate(25 89 54)" fill="#B5121B" stroke="#8A0E15" strokeWidth="2" />
      {/* head */}
      <path d="M60 28c20 0 32 14 32 32 0 10-4 17-9 22l2 13c.3 3-3 5-5.5 3.5l-8-5c-3.5 1.2-7.5 1.8-11.5 1.8s-8-.6-11.5-1.8l-8 5C38 100 34.7 98 35 95l2-13c-5-5-9-12-9-22 0-18 12-32 32-32z" fill="#B5121B" stroke="#8A0E15" strokeWidth="2.5" strokeLinejoin="round" />
      {/* paper-cut forehead swirl */}
      <path d="M60 36c-6 0-9 4-9 8 0 4 3 6 6 6 2.5 0 4-1.5 4-3.5S59.5 43 58 43" fill="none" stroke="#F3D27A" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M60 36c6 0 9 4 9 8 0 4-3 6-6 6-2.5 0-4-1.5-4-3.5S60.5 43 62 43" fill="none" stroke="#F3D27A" strokeWidth="2.2" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx="47" cy="62" rx="5.5" ry="6" fill="#FFF8EC" />
      <ellipse cx="73" cy="62" rx="5.5" ry="6" fill="#FFF8EC" />
      <circle cx="48" cy="63" r="3" fill="#2A1A12" />
      <circle cx="74" cy="63" r="3" fill="#2A1A12" />
      <circle cx="49" cy="61.5" r="1" fill="#FFF8EC" />
      <circle cx="75" cy="61.5" r="1" fill="#FFF8EC" />
      {/* cheeks */}
      <circle cx="41" cy="72" r="4" fill="#F3D27A" opacity=".8" />
      <circle cx="79" cy="72" r="4" fill="#F3D27A" opacity=".8" />
      {/* muzzle */}
      <ellipse cx="60" cy="74" rx="11" ry="8" fill="#D8202B" />
      <path d="M56 70c2-2 6-2 8 0 0 2-2 3-4 3s-4-1-4-3z" fill="#2A1A12" />
      {mouth}
      {/* beard */}
      <path d="M55 86c1 5 3 8 5 10 2-2 4-5 5-10" fill="#D4A017" stroke="#8A0E15" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Background pattern: auspicious clouds, plum blossoms, a small goat, and
 * coins. Built as a data URI so it ships inside the page with no request.
 * `stroke` and `fill` set the line and blossom colors; `alpha` the opacity.
 */
export function patternDataUri({ stroke = '#B5121B', fill = '#D4A017', alpha = 0.1 } = {}) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'>
<g fill='none' stroke='${stroke}' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' opacity='${alpha}'>
<path d='M30 60c-7 0-12-5-12-11s5-11 11-11c1-8 8-14 16-14 7 0 13 4 15 10 7-2 15 3 15 11 0 8-7 15-16 15z'/>
<path d='M34 48a6 6 0 0 1 6-6m7 0a6 6 0 0 1 6 6'/>
<path d='M170 190c-7 0-12-5-12-11s5-11 11-11c1-8 8-14 16-14 7 0 13 4 15 10 7-2 15 3 15 11 0 8-7 15-16 15z'/>
<path d='M174 178a6 6 0 0 1 6-6m7 0a6 6 0 0 1 6 6'/>
<g transform='translate(150 40) scale(.5)'>
<path d='M60 28c20 0 32 14 32 32 0 10-4 17-9 22l2 13-13-6c-7 2-17 2-24 0l-13 6 2-13c-5-5-9-12-9-22 0-18 12-32 32-32z'/>
<path d='M40 34c-12-2-20-12-16-24 8 2 12 8 12 14M80 34c12-2 20-12 16-24-8 2-12 8-12 14'/>
<circle cx='47' cy='62' r='4'/><circle cx='73' cy='62' r='4'/><path d='M53 76c3 4 11 4 14 0'/>
</g>
<g transform='translate(20 150) scale(.5)'>
<path d='M60 28c20 0 32 14 32 32 0 10-4 17-9 22l2 13-13-6c-7 2-17 2-24 0l-13 6 2-13c-5-5-9-12-9-22 0-18 12-32 32-32z'/>
<path d='M40 34c-12-2-20-12-16-24 8 2 12 8 12 14M80 34c12-2 20-12 16-24-8 2-12 8-12 14'/>
<circle cx='47' cy='62' r='4'/><circle cx='73' cy='62' r='4'/><path d='M53 76c3 4 11 4 14 0'/>
</g>
<circle cx='225' cy='120' r='11'/><rect x='220.5' cy='0' y='115.5' width='9' height='9'/>
<circle cx='105' cy='225' r='11'/><rect x='100.5' y='220.5' width='9' height='9'/>
<path d='M120 110c6 0 9 4 9 8s-3 7-9 7-9-3-9-7 3-8 9-8z'/><path d='M120 103v7m0 15v7'/>
</g>
<g fill='${fill}' opacity='${alpha * 1.4}'>
<circle cx='120' cy='20' r='4.5'/><circle cx='129' cy='26.5' r='4.5'/><circle cx='125.5' cy='37' r='4.5'/><circle cx='114.5' cy='37' r='4.5'/><circle cx='111' cy='26.5' r='4.5'/>
<circle cx='235' cy='230' r='4.5'/><circle cx='244' cy='236.5' r='4.5'/><circle cx='240.5' cy='247' r='4.5'/><circle cx='229.5' cy='247' r='4.5'/><circle cx='226' cy='236.5' r='4.5'/>
<circle cx='60' cy='110' r='4.5'/><circle cx='69' cy='116.5' r='4.5'/><circle cx='65.5' cy='127' r='4.5'/><circle cx='54.5' cy='127' r='4.5'/><circle cx='51' cy='116.5' r='4.5'/>
</g>
</svg>`
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
}
