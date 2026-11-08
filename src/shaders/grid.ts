export const gridVert = /* glsl */ `
varying vec3 vWorld;
void main(){
  vec4 w = modelMatrix*vec4(position,1.);
  vWorld = w.xyz;
  gl_Position = projectionMatrix*viewMatrix*w;
}`

export const gridFrag = /* glsl */ `
uniform float uTime, uGold;
uniform vec3 uPA, uPC;
uniform float uLight;
uniform vec3 uMouse;
varying vec3 vWorld;
float gridLine(vec2 p, float scale, float width){
  vec2 g = abs(fract(p/scale-.5)-.5)/fwidth(p/scale);
  return 1.-min(min(g.x,g.y)/width,1.);
}
void main(){
  vec2 p = vWorld.xz;
  float minor = gridLine(p,1.,1.2);
  float major = gridLine(p,5.,1.6);
  float dist = length(p);
  float fade = smoothstep(38.,4.,dist);

  // Pointer ripple: expanding rings from where the cursor ray hits the floor.
  float m = length(p-uMouse.xz);
  float ripple = sin(m*2.4-uTime*3.)*exp(-m*.45);
  float glow = smoothstep(7.,0.,m);

  vec3 cold = uPA, warm = uPC;
  vec3 col = mix(cold,warm,uGold);
  col *= 1.-.55*uLight;
  float a = (minor*.18 + major*.5) * fade;
  a += (minor+major)*glow*.5 + ripple*glow*.25*max(minor+major,.2);
  gl_FragColor = vec4(col*(1.+glow*(1.-uLight)), clamp(a*(1.+uLight*.8),0.,1.)*.9);
}`
