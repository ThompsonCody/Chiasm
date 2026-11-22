/** A single full-screen water pass: animated surface normals, refraction and reflected light. */
const vertex = `attribute vec2 position; varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
varying vec2 uv;
uniform sampler2D water;
uniform vec2 resolution;
uniform float time;
uniform vec4 light;
uniform vec3 lightColor;
float surface(vec2 p){
  return sin(p.x*17.+p.y*23.-time*.8)*.4
       +sin(p.x*31.-p.y*37.+time*1.1)*.23
       +sin(p.x*67.+p.y*51.-time*1.4)*.11;
}
void main(){
  float aspect=resolution.x/resolution.y;
  vec2 p=vec2(uv.x*aspect,uv.y);
  float wave=surface(p);
  vec2 distortion=vec2(surface(p+vec2(.03,.01)),wave)*.009;
  vec2 photo=uv;
  float photoAspect=3.;
  if(aspect<photoAspect)photo.x=(uv.x-.5)*aspect/photoAspect+.67;
  else photo.y=(uv.y-.5)*photoAspect/aspect+.5;
  vec3 base=texture2D(water,clamp(photo+distortion,0.,1.)).rgb;
  // Broad moving wave faces remain visible across the viewport, even above the graph.
  float normal=surface(p+vec2(0.,.006))-wave;
  float crest=pow(max(0.,normal*3.),3.);
  vec3 color=base*1.55+vec3(.006,.022,.032)*(wave*.5+.5);
  color+=vec3(.015,.055,.075)*crest;
  // The selected arc illuminates the rippling surface below its actual screen position.
  float below=light.y-uv.y;
  float spread=max(.05,light.z*.52)+max(0.,below)*.24;
  float lateral=(uv.x-light.x+wave*.012)/spread;
  float pool=exp(-lateral*lateral*2.5)*exp(-abs(below)*4.)
            *smoothstep(-.035,.065,below)*light.w;
  float bands=.2+.8*pow(.5+.5*sin(uv.y*380.+wave*5.-time*1.8),5.);
  color+=lightColor*pool*(.09+bands*.32+crest*.25);
  // Warm, quiet reflected highlights balance the cyan source.
  float gold=exp(-pow((uv.x-.91+wave*.02)/.1,2.))*pow(1.-uv.y,2.);
  color+=vec3(.24,.12,.035)*gold*bands*.35;
  gl_FragColor=vec4(color,1.);
}`;

export function createWaterRenderer(canvas: HTMLCanvasElement, onReady: () => void) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) return;
  const shaders: WebGLShader[] = [];
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)!;
    shaders.push(shader);
    gl!.shaderSource(shader, source); gl!.compileShader(shader);
    return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null;
  }
  const program = gl.createProgram()!;
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) { shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); return; }
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,"position");
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms = Object.fromEntries(["resolution","time","light","lightColor"].map(name => [name,gl.getUniformLocation(program,name)]));
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([7,19,27,255]));
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    onReady();
  };
  image.src = "/images/tidal-water.jpg";
  return {
    draw(time: number, light: readonly number[], color: readonly number[]) {
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      gl.uniform1f(uniforms.time,time);
      gl.uniform4f(uniforms.light,light[0],light[1],light[2],light[3]);
      gl.uniform3f(uniforms.lightColor,color[0],color[1],color[2]);
      gl.drawArrays(gl.TRIANGLES,0,6);
    },
    dispose() {
      image.onload=null; image.src="";
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      shaders.forEach(shader=>gl.deleteShader(shader));
    },
  };
}
