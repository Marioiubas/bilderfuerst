"use client";
// Opening hours with "today" in Europe/Berlin. Server HTML shows the full week; the client adds the
// today highlight + live status after mount (no hydration mismatch). Public holidays are not known.
import {useEffect,useState} from 'react';
import {PLACES,WEEKDAYS,fmtTime,type Hours,type Place} from './facts';

type Now={day:number;minutes:number};
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function berlinNow():Now{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const get=(t:string)=>parts.find(p=>p.type===t)?.value??'0';
 return {day:Math.max(0,DAYS.indexOf(get('weekday'))),minutes:Number(get('hour'))*60+Number(get('minute'))};
}
function useBerlinNow(){
 const [now,setNow]=useState<Now|null>(null);
 useEffect(()=>{const tick=()=>setNow(berlinNow());tick();const id=window.setInterval(tick,60_000);return()=>window.clearInterval(id)},[]);
 return now;
}
function status(hours:Hours,now:Now):{open:boolean;text:string}{
 const today=hours[now.day];
 if(today&&now.minutes>=today[0]&&now.minutes<today[1])return {open:true,text:`Jetzt geöffnet · bis ${fmtTime(today[1])} Uhr`};
 if(today&&now.minutes<today[0])return {open:false,text:`Geschlossen · öffnet heute um ${fmtTime(today[0])} Uhr`};
 for(let k=1;k<=7;k++){const d=(now.day+k)%7;const h=hours[d];if(h)return {open:false,text:`Geschlossen · öffnet ${k===1?'morgen':WEEKDAYS[d]} um ${fmtTime(h[0])} Uhr`}}
 return {open:false,text:'Geschlossen'};
}
const place=(id:Place['id'])=>PLACES.find(p=>p.id===id)!;

export function OpenStatus({placeId}:{placeId:Place['id']}){
 const now=useBerlinNow();const p=place(placeId);
 if(!now)return <p className="status status-ask vis-status">Öffnungszeiten laut Website</p>;
 const s=status(p.hours,now);
 return <p className={`status ${s.open?'status-ok':'status-ask'} vis-status`} data-open={s.open}>{s.text}</p>;
}

export function HoursTable({placeId}:{placeId:Place['id']}){
 const now=useBerlinNow();const p=place(placeId);
 return <table className="vis-hours">
  <caption className="sr-only">Öffnungszeiten {p.name}</caption>
  <tbody>{WEEKDAYS.map((d,i)=>{const h=p.hours[i];const today=now?.day===i;return <tr key={d} data-today={today||undefined} aria-current={today?'date':undefined}>
   <th scope="row">{d}{today&&<span className="vis-today mono">Heute</span>}</th>
   <td className="num">{h?`${fmtTime(h[0])}–${fmtTime(h[1])}`:'geschlossen'}</td>
  </tr>})}</tbody>
 </table>;
}

export function TodayLine({placeId}:{placeId:Place['id']}){
 const now=useBerlinNow();const p=place(placeId);
 if(!now)return null;
 const h=p.hours[now.day];const s=status(p.hours,now);
 return <p className={`status ${s.open?'status-ok':'status-ask'} vis-todayline`}>Heute {h?`${fmtTime(h[0])}–${fmtTime(h[1])}`:'geschlossen'}{s.open?' · jetzt geöffnet':''}</p>;
}
