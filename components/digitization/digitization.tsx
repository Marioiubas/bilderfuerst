"use client";
// /digitalisierung — "ANALOG MEMORY → DIGITAL SIGNAL". Signature experience #3.
// Order: hero → service index → object-first chooser (detail panel inline after the chosen
// tile's row) → estimator → identification (a path, not a prerequisite: after the estimate,
// folded on phones) → ICE scanner pass → process & manufactory → drop-off.
// Graphite + scanner cyan; red only for interaction.
import {useEffect,useState} from 'react';
import {track} from '@/lib/analytics';
import {objects,type EstimateMode,type ObjectId} from './data';
import {DigitizationHero} from './hero';
import {JumpIndex} from './jump-index';
import {Chooser} from './chooser';
import {Identify} from './identify';
import {Estimator} from './estimator';
import {IceScan} from './ice-scan';
import {DropOff,Process} from './process';

export function Digitization(){
 const [selected,setSelected]=useState<ObjectId>('dia');
 const [mode,setMode]=useState<EstimateMode>('dia');
 useEffect(()=>{track('view_digitization')},[]);
 const select=(id:ObjectId)=>{setSelected(id);const m=objects.find(o=>o.id===id)?.estimate;if(m)setMode(m)};
 return <div className="dz">
  <DigitizationHero/>
  <JumpIndex/>
  <Chooser selected={selected} onSelect={select} onEstimate={setMode}/>
  <Estimator mode={mode} onMode={setMode}/>
  <Identify/>
  <IceScan/>
  <Process/>
  <DropOff/>
 </div>;
}
