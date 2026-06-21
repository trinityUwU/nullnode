/** GLSL building blocks for the immersive network scene. */

export const SNOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

export const CORE_VERTEX = /* glsl */ `
uniform float uTime; uniform float uActive;
varying float vNoise; varying vec3 vNormalW; varying vec3 vViewDir;
${SNOISE}
void main(){
  vec3 p = position;
  float n = snoise(p*1.4 + uTime*0.18);
  float n2 = snoise(p*3.4 - uTime*0.12);
  float disp = n*(0.10+0.06*uActive) + n2*0.035;
  p += normal * disp;
  vNoise = n;
  vec4 wp = modelMatrix * vec4(p,1.0);
  vNormalW = normalize(mat3(modelMatrix)*normal);
  vViewDir = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

export const CORE_FRAGMENT = /* glsl */ `
uniform vec3 uColor; uniform float uTime;
varying float vNoise; varying vec3 vNormalW; varying vec3 vViewDir;
void main(){
  float fres = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)),0.0), 2.6);
  float flow = 0.5 + 0.5*sin(vNoise*7.0 + uTime*1.6);
  vec3 base = uColor * (0.05 + 0.45*flow);
  vec3 col = base + uColor * fres * 2.4;
  gl_FragColor = vec4(col, fres*0.85 + 0.10);
}`

export const PARTICLE_VERTEX = /* glsl */ `
uniform float uTime; uniform float uPixel; uniform float uSize;
attribute float aSeed; attribute float aScale;
varying float vSeed;
void main(){
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  float tw = 0.55 + 0.45*sin(uTime*1.2 + aSeed*6.2831);
  gl_PointSize = uSize * aScale * uPixel * tw * (1.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`

export const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uColor; varying float vSeed;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(d));
  vec3 c = mix(uColor, vec3(1.0), 0.15*vSeed);
  gl_FragColor = vec4(c, a*0.9);
}`
