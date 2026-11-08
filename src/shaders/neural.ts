import { noiseGLSL, paletteGLSL } from './noise'

// Neural edges: each edge carries a travelling pulse (aT is 0 at source, 1 at target).
export const edgeVert = /* glsl */ `
uniform float uTime, uExplode, uHover;
attribute float aPhase, aT;
varying float vPulse, vFade;
void main(){
  vec3 p = position * (1. + uExplode*2.1);
  float speed = .35 + uHover*.5;
  float head = fract(uTime*speed + aPhase);
  float d = aT - head;
  vPulse = exp(-d*d*38.);
  vFade = .25 + .75*(1.-uExplode*.4);
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.);
}`
export const edgeFrag = /* glsl */ `
${paletteGLSL}
uniform float uGold;
varying float vPulse, vFade;
void main(){
  vec3 base = palette(.2,uGold)*.35;
  vec3 hot = palette(1.,uGold)*3.2;
  gl_FragColor = vec4(base + hot*vPulse, (.18 + vPulse)*vFade);
}`

// Neural nodes: pulsing glowing points, scaled outward on explode.
export const nodeVert = /* glsl */ `
uniform float uTime, uExplode, uHover, uPixelRatio, uActive;
attribute float aPhase, aSeed;
varying float vBeat, vSel;
void main(){
  vec3 p = position * (1. + uExplode*2.1);
  float beat = pow(.5+.5*sin(uTime*(1.6+uHover)+aPhase*6.2831),3.);
  vBeat = beat;
  vSel = step(abs(aSeed-uActive),.001);
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = (7.+beat*9.+vSel*10.)*uPixelRatio*(9./-mv.z)*(1.+uExplode*.7);
}`
export const nodeFrag = /* glsl */ `
${paletteGLSL}
uniform float uGold;
varying float vBeat, vSel;
void main(){
  float d = length(gl_PointCoord-.5);
  if(d>.5) discard;
  float core = smoothstep(.5,0.,d);
  vec3 c = palette(vBeat,uGold)*(1.2+vBeat*3.5+vSel*3.);
  gl_FragColor = vec4(c, core*core);
}`

// Bioluminescent inner core: noise-displaced sphere with subsurface-ish glow.
export const coreVert = /* glsl */ `
${noiseGLSL}
uniform float uTime, uExplode, uHover;
varying vec3 vN, vV; varying float vDisp;
void main(){
  float beat = pow(.5+.5*sin(uTime*2.2),6.)*.08;
  float n = snoise(position*2.1+vec3(0.,uTime*.35,0.));
  float disp = n*(.12+uHover*.06)+beat;
  vDisp = n;
  vec3 p = position*(1.+disp)*(1.-uExplode*.55);
  vec4 mv = modelViewMatrix*vec4(p,1.);
  vN = normalize(normalMatrix*normal); vV=-mv.xyz;
  gl_Position = projectionMatrix*mv;
}`
export const coreFrag = /* glsl */ `
${paletteGLSL}
uniform float uTime, uGold, uHover;
varying vec3 vN, vV; varying float vDisp;
void main(){
  vec3 n=normalize(vN), v=normalize(vV);
  float fres = pow(1.-clamp(dot(n,v),0.,1.),2.);
  float veins = smoothstep(.55,.0,abs(vDisp-.1))*.9;
  vec3 deep = mix(uPA*.08, uPC*.2, uGold);
  vec3 glow = palette(.5+vDisp*.5, uGold);
  vec3 c = deep + glow*(fres*1.6 + veins*.9 + .25)*(1.+uHover*.5);
  gl_FragColor = vec4(c*1.5, 1.);
}`

// Volumetric-ish fog: inside-out sphere with fbm cloud banding.
export const fogVert = /* glsl */ `
varying vec3 vP;
void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`
export const fogFrag = /* glsl */ `
${noiseGLSL}
${paletteGLSL}
uniform float uTime, uGold;
varying vec3 vP;
void main(){
  vec3 p = normalize(vP)*2.;
  float n = snoise(p+vec3(uTime*.02,uTime*.015,0.))*.5 + snoise(p*2.3-uTime*.03)*.25;
  float band = smoothstep(-.1,.7,n);
  vec3 col = palette(.3+n*.3, uGold)*.07;
  gl_FragColor = vec4(col*band, band*.5);
}`
