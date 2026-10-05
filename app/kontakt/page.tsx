import '../styles/story.css';
import type {Metadata} from 'next';
import {ContactPage} from '@/components/story/contact';
export const metadata:Metadata={title:'Laden & Kontakt — Alexanderstraße 2, Fürth',description:'Analog Store · bilderfürst Fürth, Alexanderstraße 2, 90762 Fürth. Mo–Fr 9:30–18:30, Sa 9:30–16:30. Telefon 0911 774202. Abgabestellen in Fürth, Nürnberg und Fürth-Dambach.'};
export default function Page(){return <ContactPage/>}
