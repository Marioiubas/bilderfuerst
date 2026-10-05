// Homepage = a route through the lab (Direction C "Analog Technology"):
// Darkroom (hero) → status + "Was hast du?" → 01 Lichttisch → 02 Filmlabor → 03 Analog Store → 04 Scanner
// → 05 Druckraum → 06 Street Gallery → 07 Archiv → 08 Laden Fürth.
// Dark immersive zones alternate with calm light zones; status, gallery and store are deliberately still.
import {Hero} from './hero';
import {HomeStatus} from './home-status';
import {HomeRouter} from './home-router';
import {HomeLightTable} from './home-light-table';
import {HomeFilmLab} from './home-film-lab';
import {HomeStore} from './home-store';
import {HomeScanner} from './home-scanner';
import {HomePrintRoom} from './home-print-room';
import {HomeGallery} from './home-gallery';
import {HomeArchive} from './home-archive';
import {HomeVisit} from './home-visit';

export function Home(){
 return <>
  <Hero/>
  <HomeStatus/>
  <HomeRouter/>
  <HomeLightTable/>
  <HomeFilmLab/>
  <HomeStore/>
  <HomeScanner/>
  <HomePrintRoom/>
  <HomeGallery/>
  <HomeArchive/>
  <HomeVisit/>
 </>;
}
