import { noiseGLSL, paletteGLSL } from './noise'

// Glassmorphic Fresnel shell: rim glow + iridescent thin-film banding + faux refraction.
export const shellVert = /* glsl */ `
${noiseGLSL}
uniform float uTime, uHover;
varying vec3 vN, vV, vObj;
void main(){
  vec3 p = position;
  float n = snoise(p*1.6+uTime*.25);
  p += normal*n*(.03+uHover*.05);
  vec4 mv = modelViewMatrix*vec4(p,1.);
  vN = normalize(normalMatrix*normal);
  vV = -mv.xyz;
  vObj = p;
  gl_Position = projectionMatrix*mv;
}`

export const shellFrag = /* glsl */ `
${paletteGLSL}
uniform float uTime, uOpacity, uGold, uHover;
varying vec3 vN, vV, vObj;
void main(){
  vec3 n = normalize(vN), v = normalize(vV);
  float ndv = clamp(dot(n,v),0.,1.);
  float fres = pow(1.-ndv, 2.6);

  // thin-film style iridescence: cosine palette indexed by view angle
  float film = ndv*3. + vObj.y*.6 + uTime*.1;
  vec3 irid = .5+.5*cos(6.2831*(film+vec3(0.,.33,.67)));
  vec3 base = palette(fres, uGold);
  vec3 col = mix(base, irid, .35*fres);

  // faux refraction: a soft inner bright band bending with the normal
  float refr = smoothstep(.2,.9,sin(dot(n.xy,vec2(3.,2.))+uTime*.4)*.5+.5)*.08;
  float alpha = (fres*(1.1+uHover*.6) + refr + .02) * uOpacity * (1.+uLight*1.4);
  gl_FragColor = vec4(col*(1.2+fres*1.5), alpha);
}`
