import '../styles/story.css';
import type {Metadata} from 'next';
import {HistoryPage} from '@/components/story/history';
export const metadata:Metadata={title:'Geschichte — Drei Generationen Fotografie seit 1935',description:'Die Chronik der Familie Dittmer: Foto Seitz Nürnberg 1935, Bilderfürst Erlangen 1973, Fürth seit 2001, heute Analog Store mit eigenem Labor in der Alexanderstraße 2.'};
export default function Page(){return <HistoryPage/>}
