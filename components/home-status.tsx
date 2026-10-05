"use client";
// Live status strip directly under the hero (Foam / C/O Berlin pattern). Still by design: no motion.
// SSR renders the static opening hours; after hydration the Europe/Berlin state replaces them.
import {HOURS_STATIC,openState,useBerlinNow} from './home-shared';

export function HomeStatus(){
 const now=useBerlinNow();
 const state=now?openState(now):null;
 return <section className="hm-status zone-dark" aria-label="Heute in Fürth">
  <div className="wrap hm-status-row">
   <p className="hm-status-item hm-status-live" data-open={state?state.open:undefined}>
    <span className="hm-status-dot" aria-hidden="true"/>
    <span className="hm-status-code">FTH</span>
    <span suppressHydrationWarning>{state?state.label:HOURS_STATIC}</span>
   </p>
   <p className="hm-status-item">
    <span className="hm-status-code">GAL</span>
    <span>Street Gallery · 9 Bilder im Schaufenster, rund um die Uhr</span>
   </p>
   <p className="hm-status-item hm-status-addr">
    <a href="#laden">Alexanderstraße 2, Fürth</a>
   </p>
  </div>
 </section>;
}
