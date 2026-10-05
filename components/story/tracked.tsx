"use client";
// Link/anchor that reports one analytics event (lib/analytics track(); no tracking library is installed).
import Link from 'next/link';
import type {ReactNode} from 'react';
import {track,type AnalyticsEvent} from '@/lib/analytics';

type Payload=Record<string,string|number|boolean|undefined>;
export function TrackedLink({href,event,payload,className,children,label}:{href:string;event:AnalyticsEvent;payload?:Payload;className?:string;children:ReactNode;label?:string}){
 const onClick=()=>track(event,payload);
 if(/^https?:/.test(href))return <a href={href} className={className} onClick={onClick} aria-label={label} target="_blank" rel="noopener noreferrer">{children}</a>;
 if(/^(tel|mailto):/.test(href))return <a href={href} className={className} onClick={onClick} aria-label={label}>{children}</a>;
 return <Link href={href} className={className} onClick={onClick} aria-label={label}>{children}</Link>;
}
