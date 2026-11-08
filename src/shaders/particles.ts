import { noiseGLSL, paletteGLSL } from './noise'

export const particleVert = /* glsl */ `
${noiseGLSL}
${paletteGLSL}
uniform float uTime, uPixelRatio, uExplode, uGold;
uniform vec3 uMouse;
uniform float uMouseForce;
attribute vec4 aRand;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec3 p = position;
  bool stream = aRand.w > 0.88;

  if(stream){
    // Data streams: quantised vertical columns that fall through the volume.
    p.xz = floor(p.xz*.35+.5)/.35;
    p.y = mod(position.y + uTime*(1.2+aRand.x*2.2) + 14., 28.) - 14.;
    p.xz += curlNoise(vec3(p.xz*.2, uTime*.05)).xz*.15;
  } else {
    // Noise-field drift: curl noise gives divergence-free, fluid-like swirling.
    vec3 q = position*.14;
    p += curlNoise(q + uTime*.04) * (1.6 + aRand.x*1.4);
    float ang = uTime*.03*(.5+aRand.y);
    float s=sin(ang), c=cos(ang);
    p.xz = mat2(c,-s,s,c)*p.xz;
  }

  // Pointer repulsion + swirl: particles get pushed and curl around the cursor.
  vec3 d = p - uMouse;
  float r = length(d);
  float f = smoothstep(3.2,0.,r) * uMouseForce;
  p += normalize(d+1e-4)*f*1.4;
  p += cross(normalize(d+1e-4), vec3(0.,1.,0.))*f*.8;

  // On "explode" the cloud breathes outward.
  p *= 1. + uExplode*.25;

  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  float size = (stream ? 1.3 : 2.4)*(.5+aRand.z) * (1.+f*2.);
  gl_PointSize = size * uPixelRatio * (24./-mv.z);

  vColor = palette(aRand.y, uGold) * (1.+f*1.5);
  float tw = .55+.45*sin(uTime*(1.+aRand.x*3.)+aRand.z*20.);
  vAlpha = (stream? .55 : .8) * tw;
}`

export const particleFrag = /* glsl */ `
varying vec3 vColor; varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord-.5;
  float d = length(uv);
  if(d>.5) discard;
  float a = smoothstep(.5,0.,d);
  gl_FragColor = vec4(vColor*1.6, a*a*vAlpha);
}`
