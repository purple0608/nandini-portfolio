(() => {
  const canvas = document.querySelector('#sculpture');
  if (!canvas) return;
  const toggle = document.querySelector('#motion-toggle');
  const fallback = document.querySelector('.scene-fallback');
  const gl = canvas.getContext('webgl', { alpha:true, antialias:true, premultipliedAlpha:false });
  function showFallback(){canvas.hidden=true;fallback.hidden=false;toggle.hidden=true;document.querySelector('.drag-hint').hidden=true;}
  if(!gl){showFallback();return;}
  const vertex = `attribute vec3 position;attribute vec3 normal;uniform vec2 rotation;uniform float aspect;varying vec3 N;varying vec3 P;
  mat3 ry(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
  mat3 rx(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}
  void main(){mat3 r=ry(rotation.y)*rx(rotation.x);vec3 p=r*position;N=r*normal;P=p;vec3 eye=p+vec3(0.,0.,-6.4);float f=2.35*min(aspect,1.0);gl_Position=vec4(eye.x*f/aspect,eye.y*f,(-21.0/19.0)*eye.z-40.0/19.0,-eye.z);}`;
  const fragment = `precision highp float;varying vec3 N;varying vec3 P;
  void main(){vec3 n=normalize(N);vec3 v=normalize(vec3(0.,0.,6.4)-P);vec3 l=normalize(vec3(-2.,4.,5.));float diffuse=max(dot(n,l),0.);float fill=max(dot(n,normalize(vec3(4.,-1.,2.))),0.);float spec=pow(max(dot(n,normalize(l+v)),0.),55.);float soft=pow(max(dot(n,normalize(l+v)),0.),7.);float rim=pow(1.-max(dot(n,v),0.),2.8);vec3 base=vec3(.025,.07,.28);vec3 col=base*(.45+.7*diffuse+.16*fill)+vec3(.60,.70,.88)*(.36*spec+.16*soft)+vec3(.20,.31,.58)*rim*.4;col*=.87+.13*smoothstep(-1.5,1.5,P.y);col=pow(col,vec3(.88));gl_FragColor=vec4(col,1.);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D program failed');}catch(e){showFallback();return;}
  const center=t=>{const r=1.13+.34*Math.cos(3*t);return [r*Math.cos(2*t),r*Math.sin(2*t),.48*Math.sin(3*t)];};
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const normalize=a=>{const l=Math.hypot(...a);return a.map(x=>x/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const positions=[],normals=[],indices=[],segments=260,sides=28;
  for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2,c=center(t),tangent=normalize(sub(center(t+.001),center(t-.001))),u=normalize(cross(tangent,[0,0,1])),v=normalize(cross(tangent,u));for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,n=u.map((x,k)=>x*Math.cos(a)+v[k]*Math.sin(a));positions.push(...c.map((x,k)=>x+.205*n[k]));normals.push(...n);if(i<segments&&j<sides){const p=i*(sides+1)+j;indices.push(p,p+sides+1,p+1,p+1,p+sides+1,p+sides+2);}}}
  gl.useProgram(program);
  for(const [name,array] of [['position',positions],['normal',normals]]){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);}
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const rotLoc=gl.getUniformLocation(program,'rotation'),aspectLoc=gl.getUniformLocation(program,'aspect');
  let rotX=.6,rotY=-.5,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,dragging=false,lastX=0,lastY=0,lastTime=0,raf=0,visible=true;
  function syncToggle(){toggle.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-label',paused?'Play sculpture animation':'Pause sculpture animation');toggle.setAttribute('aria-pressed',String(paused));}
  function draw(now=0){raf=0;const dt=Math.min((now-lastTime)/1000,.05)||0;lastTime=now;if(!paused&&!dragging)rotY+=dt*.10;const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(w&&h){if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform2f(rotLoc,rotX,rotY);gl.uniform1f(aspectLoc,w/h);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);}if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
  function requestDraw(){if(!raf)raf=requestAnimationFrame(draw);}
  toggle.addEventListener('click',()=>{paused=!paused;syncToggle();requestDraw();});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;rotY+=(e.clientX-lastX)*.008;rotX+=(e.clientY-lastY)*.008;lastX=e.clientX;lastY=e.clientY;requestDraw();});
  canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
  new ResizeObserver(requestDraw).observe(canvas);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.01}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);showFallback();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;syncToggle();requestDraw();});
  syncToggle();requestDraw();
})();
