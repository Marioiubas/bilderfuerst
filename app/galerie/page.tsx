import '../styles/gallery.css';
import {Gallery} from '@/components/gallery/gallery';
import {preloadSerif} from '@/lib/fonts';
export const metadata={title:'Analoge Street Gallery — Bilder im Schaufenster',description:'Street Gallery in Fürth: neun analoge Aufnahmen im Schaufenster an der Ecke Schwabacher Straße / Alexanderstraße, rund um die Uhr, drei weitere im Laden. Wechselnde Ausstellungen.'};
export default function Page(){preloadSerif();return <Gallery/>}
