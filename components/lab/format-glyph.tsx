// Format symbol on the configurator tiles: the Blender format renders (public/renders/format-{135,120,110},
// 800×600 transparent + @2x). One camera and one scale for all three, so cartridge, roll film and pocket
// cassette compare at true relative size; the plate crops the same empty margin from each (lab.css .fg).
// w-descriptors so a phone tile (≈ 100 css px) takes the 800 px file even at DPR 3; the @2x file is used
// on wide tiles. Decorative: the numeral and descriptor next to it carry the information.
import {formats,type FormatId} from './film-data';

export function FormatRender({format}:{format:FormatId}){
 const c=formats[format].code;
 return <span className="fg" data-format={c} aria-hidden="true">
  <img src={`/renders/format-${c}.webp`} srcSet={`/renders/format-${c}.webp 800w, /renders/format-${c}@2x.webp 1600w`} sizes="(max-width: 899px) 34vw, 240px" width={800} height={600} alt="" loading="lazy" decoding="async"/>
 </span>;
}
