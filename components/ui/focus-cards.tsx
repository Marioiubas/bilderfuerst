"use client";
// Aceternity UI "Focus Cards" (ui.aceternity.com/components/focus-cards), installed from the registry and
// adapted for the Street Gallery (Direction C):
// - hovering (mouse only) OR keyboard-focusing one card dims the others, like a single gallery spot;
// - no blur, no scale, no gradient text, no caption overlay on the photograph, rectangular frames;
// - generic render prop so every card is a real control (<button>) with its caption beside/below;
// - state is exposed as data attributes and styled in app/styles/gallery.css (CSS transitions only,
//   so Anime layout animations on the same list never fight over one element).
import {useState,type FocusEvent,type HTMLAttributes,type PointerEvent,type ReactNode,type Ref} from 'react';

export type FocusState={index:number;focused:boolean;dimmed:boolean};

type Props<T>={
 items:T[];
 getKey:(item:T)=>string;
 render:(item:T,state:FocusState)=>ReactNode;
 itemProps?:(item:T,index:number)=>HTMLAttributes<HTMLLIElement>&Record<`data-${string}`,string|undefined>;
 listRef?:Ref<HTMLOListElement>;
}&Omit<HTMLAttributes<HTMLOListElement>,'children'>;

export function FocusCards<T>({items,getKey,render,itemProps,listRef,...rest}:Props<T>){
 const [focused,setFocused]=useState<number|null>(null);
 const enter=(i:number)=>(e:PointerEvent<HTMLLIElement>)=>{if(e.pointerType==='mouse')setFocused(i)};
 const leave=(e:PointerEvent<HTMLLIElement>)=>{if(e.pointerType==='mouse')setFocused(null)};
 const focus=(i:number)=>(e:FocusEvent<HTMLLIElement>)=>{if((e.target as HTMLElement).matches(':focus-visible'))setFocused(i)};
 const blur=(e:FocusEvent<HTMLLIElement>)=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(null)};
 return <ol ref={listRef} data-focus={focused===null?'off':'on'} {...rest}>
  {items.map((item,i)=>{
   const state:FocusState={index:i,focused:focused===i,dimmed:focused!==null&&focused!==i};
   return <li key={getKey(item)} {...itemProps?.(item,i)} data-spot={state.focused?'lit':state.dimmed?'dim':undefined}
    onPointerEnter={enter(i)} onPointerLeave={leave} onFocus={focus(i)} onBlur={blur}>{render(item,state)}</li>;
  })}
 </ol>;
}
