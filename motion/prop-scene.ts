import {animate} from 'animejs';
import {easing} from './tokens';
export type PropScene={play:()=>void;destroy:()=>void};
export async function mountProp(element:HTMLElement,name:string):Promise<PropScene>{
 const [THREE,{GLTFLoader}]=await Promise.all([import('three'),import('three/examples/jsm/loaders/GLTFLoader.js')]);
 const response=await fetch('/props/analog-craft.glb');if(!response.ok)throw new Error('Prop asset unavailable');
 const asset=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'/props/');
 const source=asset.scene.getObjectByName(name);if(!source)throw new Error('Missing prop');
 const scene=new THREE.Scene();const prop=source.clone(true);const wrapper=new THREE.Group();wrapper.add(prop);scene.add(wrapper);
 prop.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(prop);const centre=bounds.getCenter(new THREE.Vector3());prop.position.sub(centre);
 const size=bounds.getSize(new THREE.Vector3());const radius=Math.max(size.x,size.y,size.z)*.62;
 const camera=new THREE.OrthographicCamera(-radius,radius,radius,-radius,.01,20);camera.position.set(0,.85,.4);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xcbdbe4,0x34404a,3));
 for(const [x,y,z,power] of [[-.45,.6,.4,14],[.4,.4,-.3,9]] as const){const light=new THREE.PointLight(0xffffff,power);light.position.set(x,y,z);scene.add(light)}
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.setClearColor(0x000000,0);renderer.domElement.setAttribute('aria-hidden','true');
 element.appendChild(renderer.domElement);
 let disposed=false;let entrance:ReturnType<typeof animate>|undefined,tilt:ReturnType<typeof animate>|undefined;
 const render=()=>{if(!disposed)renderer.render(scene,camera)};
 const resize=()=>{const width=element.clientWidth,height=element.clientHeight;const aspect=width/height;camera.left=-radius*aspect;camera.right=radius*aspect;camera.updateProjectionMatrix();renderer.setSize(width,height);render()};
 const ro=new ResizeObserver(resize);ro.observe(element);resize();
 const mixer=new THREE.AnimationMixer(wrapper);let duration=0;
 if(name==='Aperture'){for(const clip of asset.animations){const action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();duration=Math.max(duration,clip.duration)}}
 const play=()=>{entrance?.revert();if(name!=='Aperture'||!duration){render();return;}const progress={time:0};entrance=animate(progress,{time:duration,duration:1400,ease:'inOutQuad',onUpdate:()=>{mixer.setTime(progress.time);render()}})};
 const move=(event:PointerEvent)=>{if(event.pointerType!=='mouse')return;const r=element.getBoundingClientRect();const y=((event.clientX-r.left)/r.width-.5)*.12;tilt?.pause();tilt=animate(wrapper.rotation,{y,duration:180,ease:easing,onUpdate:render})};
 const leave=()=>{tilt?.pause();tilt=animate(wrapper.rotation,{y:0,duration:180,ease:easing,onUpdate:render})};
 element.addEventListener('pointermove',move);element.addEventListener('pointerleave',leave);
 return {play,destroy(){disposed=true;entrance?.pause();tilt?.pause();ro.disconnect();element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);mixer.stopAllAction();mixer.uncacheRoot(wrapper);asset.scene.traverse(o=>{const mesh=o as import('three').Mesh;if(mesh.isMesh){mesh.geometry.dispose();for(const mat of Array.isArray(mesh.material)?mesh.material:[mesh.material])mat.dispose()}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}};
}
