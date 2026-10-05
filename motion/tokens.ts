export const timing={micro:180,fast:260,standard:420,section:600,hero:850} as const;
export const easing='outCubic' as const;
export const spacing={micro:25,row:45,frame:70} as const;

export function motionAllowed(){return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
