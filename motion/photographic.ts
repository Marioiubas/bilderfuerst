import {animate,stagger} from 'animejs';
import {timing,easing,motionAllowed} from './tokens';

export function developImages(element:HTMLElement){
 if(!motionAllowed())return;
 return animate(element.querySelectorAll('[data-develop]'),{filter:['contrast(.65) brightness(.65)','contrast(1) brightness(1)'],clipPath:['inset(0 0 8% 0)','inset(0 0 0% 0)'],duration:timing.hero,ease:easing,delay:stagger(45)});
}
export function settleFrames(element:HTMLElement){
 if(!motionAllowed())return;
 const frames=element.querySelectorAll('[data-settle]');if(!frames.length)return;
 return animate(frames,{rotate:[-1,0],scale:[.985,1],duration:timing.section,ease:easing,delay:stagger(45)});
}
export function refreshProducts(element:HTMLElement){
 if(!motionAllowed())return;
 return animate(Array.from(element.children).slice(0,4),{opacity:[.55,1],translateY:[4,0],duration:200,delay:stagger(20),ease:easing});
}
export function shutterOpen(element:HTMLElement){
 if(!motionAllowed())return;
 return animate(element,{clipPath:['circle(22% at 50% 50%)','circle(80% at 50% 50%)'],duration:timing.fast,ease:easing});
}
