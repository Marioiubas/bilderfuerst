// Line drawings of the three film formats a customer holds in hand (silver hairline, decorative).
import type {FormatId} from './film-data';
export function FormatGlyph({format}:{format:FormatId}){
 return <svg className="fg" viewBox="0 0 96 56" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
  {format==='35mm'&&<g>
   <rect x="22" y="2" width="10" height="5"/><rect x="10" y="7" width="34" height="42"/><rect x="22" y="49" width="10" height="4"/>
   <rect x="44" y="12" width="5" height="32"/>
   <path d="M49 14 H84 L90 20 V36 L84 42 H49"/>
   {[54,61,68,75].map(x=><g key={x}><rect x={x} y="16" width="3" height="3"/><rect x={x} y="37" width="3" height="3"/></g>)}
   <line x1="16" y1="14" x2="38" y2="14" strokeDasharray="2 3"/>
  </g>}
  {format==='120'&&<g>
   <rect x="10" y="8" width="5" height="40"/><rect x="61" y="8" width="5" height="40"/>
   <rect x="15" y="13" width="46" height="30"/>
   <path d="M61 43 H82 Q90 43 90 51"/>
   <line x1="20" y1="20" x2="56" y2="20"/><line x1="20" y1="28" x2="56" y2="28"/><line x1="20" y1="36" x2="56" y2="36"/>
  </g>}
  {format==='110'&&<g>
   <rect x="8" y="12" width="24" height="32"/><rect x="64" y="12" width="24" height="32"/>
   <rect x="32" y="19" width="32" height="18"/><rect x="40" y="23" width="16" height="10"/>
   <rect x="44" y="37" width="8" height="5"/>
  </g>}
 </svg>;
}
