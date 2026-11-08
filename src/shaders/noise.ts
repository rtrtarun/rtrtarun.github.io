// Ashima/Stefan Gustavson 3D simplex noise + curl noise, shared by several shaders.
export const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 curlNoise(vec3 p){
  const float e=.1;
  float n1,n2,a,b;
  vec3 c;
  n1=snoise(p+vec3(0.,e,0.)); n2=snoise(p-vec3(0.,e,0.)); a=(n1-n2)/(2.*e);
  n1=snoise(p+vec3(0.,0.,e)); n2=snoise(p-vec3(0.,0.,e)); b=(n1-n2)/(2.*e);
  c.x=a-b;
  n1=snoise(p+vec3(0.,0.,e)+13.7); n2=snoise(p-vec3(0.,0.,e)+13.7); a=(n1-n2)/(2.*e);
  n1=snoise(p+vec3(e,0.,0.)+13.7); n2=snoise(p-vec3(e,0.,0.)+13.7); b=(n1-n2)/(2.*e);
  c.y=a-b;
  n1=snoise(p+vec3(e,0.,0.)+27.3); n2=snoise(p-vec3(e,0.,0.)+27.3); a=(n1-n2)/(2.*e);
  n1=snoise(p+vec3(0.,e,0.)+27.3); n2=snoise(p-vec3(0.,e,0.)+27.3); b=(n1-n2)/(2.*e);
  c.z=a-b;
  return c;
}
`

// Shared palette helper: cold blue <-> cyber gold, driven by uGold.
export const paletteGLSL = /* glsl */ `
uniform vec3 uPA, uPB, uPC;
uniform float uLight;
vec3 palette(float t,float gold){ vec3 c = mix(mix(uPA,uPB,t), mix(uPC,mix(uPC,vec3(1.),.5),t), gold); return mix(c, c*.3, uLight); }
`
