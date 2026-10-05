import './styles/story.css';
import type {Metadata} from 'next';
import {NotFoundView} from '@/components/story/source';
export const metadata:Metadata={title:'Seite nicht gefunden'};
export default function NotFound(){return <NotFoundView/>}
