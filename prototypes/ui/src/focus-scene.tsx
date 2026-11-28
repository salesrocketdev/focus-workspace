import {useId} from 'react';
// Original vector landscapes, shared by the settings preview and immersive view.
export const scenes=[
 {id:'forest',label:'Montanhas e árvores',description:'A paisagem original'},
 {id:'ocean',label:'Oceano',description:'Ondas tranquilas'},
 {id:'aurora',label:'Aurora',description:'Horizonte em tons frios'},
 {id:'desert',label:'Deserto',description:'Dunas ao entardecer'},
 {id:'gradient',label:'Gradiente',description:'Somente cores suaves'},
 {id:'none',label:'Sem cenário',description:'Foco minimalista'}
] as const;
export type FocusScene=typeof scenes[number]['id'];
export function normalizeScene(value:unknown):FocusScene{return scenes.find(s=>s.id===value)?.id??'forest'}
const tree='M0 0l-8 14h4l-9 12h6l-10 12h34l-10-12h6l-9-12h4z';
export function SceneArt({scene}:{scene:FocusScene}){
 const gradientId=useId();
 if(scene==='none')return null;
 return <svg viewBox="0 0 1200 180" preserveAspectRatio="none" aria-hidden="true" focusable="false">
 {scene==='forest'?<><path d="M0 60Q130 95 240 70T470 85T720 68T950 94T1200 52V180H0Z" fill="#f6c9aa"/><path d="M0 108Q130 64 300 116T600 112T900 106T1200 100V180H0Z" fill="#d0bec6"/><path d="M0 131L130 95 230 135 395 113 590 155 820 108 1010 143 1200 116V180H0Z" fill="#a4aebc"/><path d="M0 160L180 145 360 161 560 145 780 169 990 143 1200 116V180H0Z" fill="#879495"/>{[12,25,44,58,76,91,1085,1105,1120,1144,1165,1187].map((x,i)=><g key={x} transform={'translate('+x+' '+(122+i%3*9)+') scale('+(i%3===0?1.25:.8)+')'} fill="#66747b"><path d={tree}/><rect x="-1.5" y="37" width="3" height="12"/></g>)}</>:scene==='ocean'?<><path d="M0 45Q150 75 300 48T600 55T900 45T1200 50V180H0Z" fill="#c9e1e9"/><path d="M0 90Q150 55 300 90T600 95T900 90T1200 92V180H0Z" fill="#94c1d2"/><path d="M0 130Q150 105 300 135T600 130T900 138T1200 125V180H0Z" fill="#6097ad"/><path d="M0 158Q200 137 400 162T800 152T1200 157V180H0Z" fill="#477e96"/></>:scene==='aurora'?<><path d="M0 15Q200 75 400 28T800 45T1200 10V180H0Z" fill="#c1d6db"/><path d="M0 75Q180 5 360 72T720 78T1080 35L1200 65V180H0Z" fill="#9cb9cf"/><path d="M0 110Q200 150 380 100T770 106T1200 100V180H0Z" fill="#938ab8"/><path d="M0 150L180 105 400 164 620 121 880 165 1200 128V180H0Z" fill="#615d85"/></>:scene==='desert'?<><circle cx="960" cy="62" r="38" fill="#f2c384"/><path d="M0 83Q200 20 420 105T800 83T1200 58V180H0Z" fill="#e9c3a0"/><path d="M0 125Q220 80 420 138T850 100T1200 125V180H0Z" fill="#d7a58b"/><path d="M0 155Q240 110 480 155T960 148T1200 130V180H0Z" fill="#b88b78"/></>:<><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--ring-track)" stopOpacity="0"/><stop offset="1" stopColor="var(--field-selected-edge)" stopOpacity=".9"/></linearGradient></defs><rect width="1200" height="180" fill={'url(#'+gradientId+')'}/></>}
 </svg>
}
/* Portrait compositions use the same palettes as the desktop illustrations,
   rather than stretching the ultra-wide SVG into a phone-sized rectangle. */
function PortraitSceneArt({scene}:{scene:FocusScene}){
 const id=useId();
 return <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
 {scene==='forest'?<>
  <path d="M0 105Q60 35 120 108T245 80T400 66V300H0Z" fill="#f6c9aa"/>
  <path d="M0 154Q70 79 145 140T260 130T400 106V300H0Z" fill="#d0bec6"/>
  <path d="M0 190L75 126 148 200 237 145 310 208 400 154V300H0Z" fill="#a4aebc"/>
  <path d="M0 232Q80 193 170 239T400 205V300H0Z" fill="#879495"/>
  {[8,28,49,70,330,354,378,397].map((x,i)=><g key={x} transform={'translate('+x+' '+(206+i%3*14)+') scale('+(i%3===0?1.15:.85)+')'} fill="#66747b"><path d={tree}/><rect x="-1.5" y="37" width="3" height="12"/></g>)}
 </>:scene==='ocean'?<>
  <path d="M0 76Q94 120 200 86T400 90V300H0Z" fill="#c9e1e9"/>
  <path d="M0 137Q95 86 200 137T400 132V300H0Z" fill="#94c1d2"/>
  <path d="M0 206Q90 163 200 206T400 193V300H0Z" fill="#6097ad"/>
  <path d="M0 260Q95 216 200 260T400 248V300H0Z" fill="#477e96"/>
 </>:scene==='aurora'?<>
  <path d="M0 34Q93 138 205 54T400 36V300H0Z" fill="#c1d6db"/>
  <path d="M0 120Q106 18 214 126T400 100V300H0Z" fill="#9cb9cf"/>
  <path d="M0 176Q100 236 200 167T400 166V300H0Z" fill="#938ab8"/>
  <path d="M0 250L85 178 175 260 255 195 340 245 400 206V300H0Z" fill="#615d85"/>
 </>:scene==='desert'?<>
  <circle cx="310" cy="94" r="38" fill="#f2c384"/>
  <path d="M0 140Q90 42 200 154T400 100V300H0Z" fill="#e9c3a0"/>
  <path d="M0 209Q106 132 220 224T400 174V300H0Z" fill="#d7a58b"/>
  <path d="M0 260Q120 202 230 270T400 234V300H0Z" fill="#b88b78"/>
 </>:<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--ring-track)" stopOpacity="0"/><stop offset="1" stopColor="var(--field-selected-edge)" stopOpacity=".9"/></linearGradient></defs><rect width="400" height="300" fill={'url(#'+id+')'}/></>}
 </svg>;
}
export function FocusLandscape({scene}:{scene:FocusScene}){
 return scene==='none'?null:<div className="landscape focus-landscape" data-focus-scene={scene} aria-hidden="true">
  <div className="scene-wide-art"><SceneArt scene={scene}/></div>
  <div className="scene-portrait-art"><PortraitSceneArt scene={scene}/></div>
 </div>
}
