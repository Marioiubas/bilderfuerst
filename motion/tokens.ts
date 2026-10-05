// Motion tokens · Direction C "Analog Technology".
// Character: mechanical, optical, precise, tactile. Never bouncy, floaty or springy.
// Mirrors the CSS custom properties in app/styles/tokens.css.
import {cubicBezier} from 'animejs/easings';

export const duration={fast:180,normal:320,section:580,hero:820} as const;
export const stagger={small:25,normal:55} as const;

/** Every custom animation should name the photographic metaphor it represents. */
export type Metaphor='film-advance'|'shutter'|'aperture'|'contact-sheet'|'develop'|'scan-pass'|'print-emerge'|'frame-lock'|'focus'|'expose';

export const ease={
 /** Decisive mechanical stop: shutter, frame lock, drawers. */
 shutter:cubicBezier(.2,.75,.1,1),
 /** Symmetric optical travel: aperture, focus pull, contact-sheet moves. */
 optical:cubicBezier(.62,0,.32,1),
 /** Film advance lever: quick start, damped arrival. */
 advance:cubicBezier(.33,0,.15,1),
 /** Linear light travel for scanner lines. */
 linear:'linear',
} as const;

/** @deprecated legacy aliases kept for modules still being migrated. */
export const timing={micro:duration.fast,fast:duration.fast,standard:duration.normal,section:duration.section,hero:duration.hero} as const;
/** @deprecated use ease.shutter */
export const easing=ease.shutter;
/** @deprecated use stagger */
export const spacing={micro:stagger.small,row:stagger.normal,frame:70} as const;
export {motionAllowed} from './reduced-motion';
