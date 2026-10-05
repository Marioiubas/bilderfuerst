// Server-only: parses the large-format price list from the restored source text (lib/source-content.json,
// page /i/preisliste, edited 2026-02-02, re-verified live 2026-10-05) so prices stay identical to the source.
// Conflicts handled per docs/SOURCE-CONFLICTS.md: #19 (A3+ vs unmarked 40×50), #20 (Metallic 20×30).
import content from '@/lib/source-content.json';

export type PaperId='foto'|'metallic'|'fineart';
export type PrintPlace='fth'|'nbg'|'ask';
export type PrintRow={size:string;w:number;h:number;price:number|null;mark:''|'*'|'+';place:PrintPlace;flag?:'a3plus'|'plus'|'typo'};
export type PaperLine={id:PaperId;name:string;rows:PrintRow[]};

const A3PLUS=[32.9,48.3];
const HEADERS:Record<string,PaperId>={'Fotopapier 1':'foto','Metallic*':'metallic','FineArt':'fineart'};
const NAMES:Record<PaperId,string>={foto:'Fotopapier',metallic:'Metallic',fineart:'FineArt'};

export function printLines():PaperLine[]{
 const lines=content.preisliste.paragraphs;
 const out:PaperLine[]=[];let current:PaperLine|undefined;
 for(const raw of lines){
  const head=HEADERS[raw.trim()];
  if(head){current={id:head,name:NAMES[head],rows:[]};out.push(current);continue}
  const m=raw.match(/^(\d+)\s*x\s*(\d+)\s*cm\.\s*([\d.]+,\d{2})\s*€\s*([*+]?)$/);
  if(!m||!current)continue;
  const w=Number(m[1]),h=Number(m[2]);const price=Number(m[3].replace(/\./g,'').replace(',','.'));
  const mark=(m[4]||'') as PrintRow['mark'];
  const fitsA3=Math.min(w,h)<=A3PLUS[0]&&Math.max(w,h)<=A3PLUS[1];
  let place:PrintPlace=mark==='*'?'nbg':fitsA3?'fth':'ask';
  let flag:PrintRow['flag'];
  if(mark===''&&!fitsA3)flag='a3plus';
  if(mark==='+'){place='ask';flag='plus'}
  const row:PrintRow={size:`${w} × ${h} cm`,w,h,price,mark,place,flag};
  // SOURCE-CONFLICTS #20: Metallic 20×30 (7,50 €) is below Fotopapier and likely a typo — not shown.
  if(current.id==='metallic'&&w===20&&h===30){row.price=null;row.flag='typo'}
  current.rows.push(row);
 }
 return out;
}

/** Standard prints from the same page ("Standard Größen", Luster oder Glanz, pro Bild) + service fee per order. */
export const STANDARD_PRINTS=[
 {size:'10 × 15 cm',price:.45},{size:'13 × 18 cm',price:.79},{size:'15 × 20 cm',price:.99},{size:'20 × 30 cm',price:3.95},
] as const;
export const SERVICE_FEE=.99;
/** Small FineArt prints (/i/fineart-prints): sizes only, gloss or silk-matt; no separate prices stated. */
export const SMALL_FINEART=['9 × 13','10 × 15','13 × 18','15 × 20','20 × 30'] as const;
