import type {Metadata} from 'next';
import {Digitization} from '@/components/digitization/digitization';
export const metadata:Metadata={
 title:'Digitalisierung — Negative, Dias, Film, Video & Audio',
 description:'Dias, Negative, Super 8, Normal 8, 16 mm, Videokassetten, Tonband und Schallplatte digitalisieren lassen – in der bilderfürst Manufaktur in Fürth-Dambach. Premium-Scan mit ICE5, veröffentlichte Preise, Abgabe in Fürth und Nürnberg.',
};
export default function Page(){return <Digitization/>}
