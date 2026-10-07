import './styles/hero.css';
import './styles/home.css';
import './styles/home-rhythm.css';
import {Home} from '@/components/home';
import {preloadSerif} from '@/lib/fonts';
export default function Page(){preloadSerif();return <Home/>}
