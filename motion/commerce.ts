import {animate,stagger} from 'animejs';
import {motionAllowed,easing,timing} from './tokens';
export function openSheet(element:HTMLDialogElement,drawer:boolean){
 if(!motionAllowed())return;
 const a=animate(element,{opacity:[.65,1],translateX:drawer?[20,0]:0,translateY:drawer?0:[8,0],duration:timing.fast,ease:easing});
 const targets=element.querySelectorAll('.cart-line,.search-results>a,.mobile-nav-dialog>a');
 const rows=targets.length?animate(targets,{opacity:[.7,1],duration:180,delay:stagger(25),ease:easing}):undefined;
 return {revert(){a.revert();rows?.revert()}};
}
