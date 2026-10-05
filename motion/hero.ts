import {animate,createTimeline,stagger} from 'animejs';
import {motionAllowed,easing} from './tokens';

export function enterDarkroom(element:HTMLElement){
 if(!motionAllowed())return;
 return createTimeline({defaults:{duration:700,ease:easing}})
  .add(element.querySelectorAll('.hero-enter'),{opacity:[.65,1],delay:stagger(75)},0)
  .add(element.querySelectorAll('.rear .film-strip'),{translateX:[-25,0],translateY:[15,0],rotate:[-4,-2],opacity:[.5,1]},100)
  .add(element.querySelectorAll('.front .film-strip'),{translateX:[35,0],translateY:[-10,0],rotate:[5,2],opacity:[.5,1]},190);
}

export function contactSheet(element:HTMLElement,next:boolean){
 const frames=Array.from(element.querySelectorAll<HTMLElement>('.negative-position'));
 const before=frames.map(f=>f.getBoundingClientRect());
 element.classList.toggle('contact-view',next);
 if(!motionAllowed())return;
 const animations=frames.map((frame,i)=>{
  const after=frame.getBoundingClientRect();
  return animate(frame,{translateX:[before[i].left-after.left,0],translateY:[before[i].top-after.top,0],scaleX:[before[i].width/after.width,1],scaleY:[before[i].height/after.height,1],duration:620,ease:easing});
 });
 return ()=>animations.forEach(a=>a.revert());
}
