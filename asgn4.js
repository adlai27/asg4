// asgn4.js
let gl;
let a_Position, a_Normal, a_UV;
let u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix, u_NormalMatrix;
let u_showNormals, u_lightingOn, u_whichTex, u_ObjColor;
let u_SamplerSky, u_SamplerBrick;
let u_LightPos, u_LightColor, u_CamPos;

// spotlight
let u_spotOn, u_spotPos, u_spotDir, u_spotCosCutoff, u_spotColor;

let g_camera=null;

let g_showNormals=false;
let g_useLighting=true;   // default to lighting on
let g_animateLight=false;
let g_spotOn=false; 

// Light
let g_lightPos=[2,2,2];
let g_lightColor=[1,1,1];

let g_cubeColor=[1,0,0,1];
let g_sphereColor=[0,1,0,1];

// textures
let g_texSky=null, g_texBrick=null;
let g_skyLoaded=false, g_brickLoaded=false;

// time
let g_startTime=0;
let g_seconds=0;

// Shaders
const VSHADER_SOURCE=`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  attribute vec2 a_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;

  varying vec3 v_WorldPos;
  varying vec3 v_WorldNormal;
  varying vec2 v_UV;

  void main(){
    vec4 worldPos4 = u_ModelMatrix * a_Position;
    v_WorldPos     = worldPos4.xyz;

    vec4 n4        = u_NormalMatrix * vec4(a_Normal, 0.0);
    v_WorldNormal  = normalize(n4.xyz);

    v_UV           = a_UV;

    gl_Position    = u_ProjectionMatrix * u_ViewMatrix * worldPos4;
  }
`;

const FSHADER_SOURCE=`
  precision mediump float;

  varying vec3 v_WorldPos;
  varying vec3 v_WorldNormal;
  varying vec2 v_UV;

  uniform bool u_showNormals;
  uniform bool u_lightingOn;
  uniform vec4 u_ObjColor;

  uniform int u_whichTex; 
  uniform sampler2D u_SamplerSky;
  uniform sampler2D u_SamplerBrick;

  // main point light
  uniform vec3 u_LightPos;
  uniform vec3 u_LightColor;
  uniform vec3 u_CamPos;

  // spotlight
  uniform bool u_spotOn;
  uniform vec3 u_spotPos;
  uniform vec3 u_spotDir;
  uniform float u_spotCosCutoff;
  uniform vec3 u_spotColor;

  void main(){
    // 1) Normal Visualization
    if(u_showNormals){
      vec3 c = normalize(v_WorldNormal)*0.5 + 0.5;
      gl_FragColor = vec4(c,1.0);
      return;
    }

    // 2) If this is the big bounding box => do partial lighting
    if(u_whichTex == 2){
      vec4 skyTex = texture2D(u_SamplerSky, v_UV);

      if(!u_lightingOn){
        // If lighting off, show a dim version of sky
        gl_FragColor = vec4(skyTex.rgb * 0.2, 1.0);
        return;
      } 
      // If lighting on, do subtle diffuse from main point light + spot
      // Base sky
      vec3 color = skyTex.rgb;

      // Subtle diffuse from main point light
      vec3 N = normalize(v_WorldNormal);
      vec3 L = normalize(u_LightPos - v_WorldPos);
      float nDotL = max(dot(N,L), 0.0);

      // let's do a small factor, say up to 0.3 * nDotL
      vec3 subtlePoint = 0.3 * nDotL * u_LightColor;
      color += subtlePoint;

      // if spotlight is on, do a small addition
      if(u_spotOn){
        vec3 Ls = normalize(v_WorldPos - u_spotPos);
        float d = dot(Ls, normalize(u_spotDir));
        if(d >= u_spotCosCutoff){
          // fade it
          float fade = pow(d,4.0);
          // also small factor, say 0.3 * fade
          color += 0.3 * u_spotColor * fade;
        }
      }

      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // 3) For normal objects (floor, cube, sphere), pick base color
    vec4 baseColor = vec4(1,1,1,1);
    if(u_whichTex==0){
      baseColor = texture2D(u_SamplerSky, v_UV);
    } else if(u_whichTex==1){
      baseColor = texture2D(u_SamplerBrick, v_UV);
    } else if(u_whichTex==-1){
      baseColor = u_ObjColor;
    }

    // 4) If lighting off => just baseColor
    if(!u_lightingOn){
      gl_FragColor = baseColor;
      return;
    }

    // 5) Full Phong from main point light
    vec3 N = normalize(v_WorldNormal);
    vec3 L = normalize(u_LightPos - v_WorldPos);
    float nDotL = max(dot(N,L), 0.0);

    // ambient
    vec3 ambient = 0.2 * baseColor.rgb;
    // diffuse
    vec3 diffuse = baseColor.rgb * u_LightColor * nDotL;
    // spec
    vec3 V = normalize(u_CamPos - v_WorldPos);
    vec3 R = reflect(-L,N);
    float rDotV = max(dot(R,V), 0.0);
    float shininess = 32.0;
    float spec = pow(rDotV, shininess);
    vec3 specular = u_LightColor * spec;

    vec3 color = ambient + diffuse + specular;

    // 6) If spotlight is on
    if(u_spotOn){
      vec3 Ls = normalize(v_WorldPos - u_spotPos);
      float d = dot(Ls, normalize(u_spotDir));
      if(d >= u_spotCosCutoff){
        float fade = pow(d,4.0);
        color += u_spotColor * fade;
      }
    }

    gl_FragColor = vec4(color, baseColor.a);
  }
`;

function main(){
  const canvas = document.getElementById("main-canvas");
  gl = canvas.getContext("webgl",{preserveDrawingBuffer:true});
  if(!gl){
    console.log("No WebGL context");
    return;
  }
  if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
    console.log("Failed to init shaders");
    return;
  }

  // attribute/uniform loc
  a_Position = gl.getAttribLocation(gl.program,'a_Position');
  a_Normal   = gl.getAttribLocation(gl.program,'a_Normal');
  a_UV       = gl.getAttribLocation(gl.program,'a_UV');

  u_ModelMatrix      = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  u_ViewMatrix       = gl.getUniformLocation(gl.program,'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
  u_NormalMatrix     = gl.getUniformLocation(gl.program,'u_NormalMatrix');

  u_showNormals      = gl.getUniformLocation(gl.program,'u_showNormals');
  u_lightingOn       = gl.getUniformLocation(gl.program,'u_lightingOn');
  u_whichTex         = gl.getUniformLocation(gl.program,'u_whichTex');
  u_ObjColor         = gl.getUniformLocation(gl.program,'u_ObjColor');

  u_SamplerSky       = gl.getUniformLocation(gl.program,'u_SamplerSky');
  u_SamplerBrick     = gl.getUniformLocation(gl.program,'u_SamplerBrick');

  u_LightPos         = gl.getUniformLocation(gl.program,'u_LightPos');
  u_LightColor       = gl.getUniformLocation(gl.program,'u_LightColor');
  u_CamPos           = gl.getUniformLocation(gl.program,'u_CamPos');

  // spotlight
  u_spotOn           = gl.getUniformLocation(gl.program,'u_spotOn');
  u_spotPos          = gl.getUniformLocation(gl.program,'u_spotPos');
  u_spotDir          = gl.getUniformLocation(gl.program,'u_spotDir');
  u_spotCosCutoff    = gl.getUniformLocation(gl.program,'u_spotCosCutoff');
  u_spotColor        = gl.getUniformLocation(gl.program,'u_spotColor');

  if(a_Position<0||a_Normal<0||a_UV<0||
     !u_ModelMatrix||!u_ViewMatrix||!u_ProjectionMatrix||!u_NormalMatrix||
     !u_showNormals||!u_lightingOn||!u_whichTex||!u_ObjColor||
     !u_SamplerSky||!u_SamplerBrick||
     !u_LightPos||!u_LightColor||!u_CamPos||
     !u_spotOn||!u_spotPos||!u_spotDir||!u_spotCosCutoff||!u_spotColor){
    console.log("Failed to get some loc");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.8,0.8,0.9,1);

  g_camera=new Camera();
  initEventHandlers();
  initTextures();

  // spotlight init
  gl.useProgram(gl.program);
  gl.uniform3f(u_spotPos, 0,5,0);      
  gl.uniform3f(u_spotDir, 0,-1,0);     
  gl.uniform1f(u_spotCosCutoff, 0.9);  
  gl.uniform3f(u_spotColor,1,1,1);
  gl.uniform1i(u_spotOn,0);

  g_startTime = performance.now()/1000.0;
  requestAnimationFrame(tick);
}

function initEventHandlers(){
  // keys
  window.onkeydown=(ev)=>{
    switch(ev.key){
      case 'w': case 'W': g_camera.forward();  break;
      case 's': case 'S': g_camera.backward(); break;
      case 'a': case 'A': g_camera.left();     break;
      case 'd': case 'D': g_camera.right();    break;
      case 'q': case 'Q': g_camera.rotLeft();  break;
      case 'e': case 'E': g_camera.rotRight(); break;
      case 'z': case 'Z': g_camera.upward();   break;
      case 'x': case 'X': g_camera.downward(); break;
    }
    renderScene();
  };

  // mouse
  const canvas=document.getElementById("main-canvas");
  let drag=false,lastX=0,lastY=0;
  canvas.onmousedown=(ev)=>{drag=true; lastX=ev.clientX; lastY=ev.clientY;};
  canvas.onmouseup=()=>{drag=false;};
  canvas.onmousemove=(ev)=>{
    if(drag){
      let dx= ev.clientX-lastX;
      let dy= ev.clientY-lastY;
      g_camera.rotRight(dx*0.2);
      g_camera.tilt(-dy*0.2);
      lastX=ev.clientX; lastY=ev.clientY;
      renderScene();
    }
  };

  document.getElementById("btnLightOn").onclick=()=>{
    g_useLighting=true;
    renderScene();
  };
  document.getElementById("btnLightOff").onclick=()=>{
    g_useLighting=false;
    renderScene();
  };

  // buttons
  document.getElementById("btnAnimateLight").onclick=()=>{
    g_animateLight=!g_animateLight;
  };
  document.getElementById("btnToggleNormals").onclick=()=>{
    g_showNormals=!g_showNormals;
    renderScene();
  };
  document.getElementById("btnSpotLight").onclick=()=>{
    g_spotOn=!g_spotOn;
    renderScene();
  };

  // light sliders
  document.getElementById("lightX").oninput=function(){
    g_lightPos[0]= parseFloat(this.value);
    renderScene();
  };
  document.getElementById("lightY").oninput=function(){
    g_lightPos[1]= parseFloat(this.value);
    renderScene();
  };
  document.getElementById("lightZ").oninput=function(){
    g_lightPos[2]= parseFloat(this.value);
    renderScene();
  };

  // light color
  document.getElementById("lightR").oninput=function(){
    g_lightColor[0]= parseFloat(this.value);
    renderScene();
  };
  document.getElementById("lightG").oninput=function(){
    g_lightColor[1]= parseFloat(this.value);
    renderScene();
  };
  document.getElementById("lightB").oninput=function(){
    g_lightColor[2]= parseFloat(this.value);
    renderScene();
  };

  // color pickers for cube & sphere
  document.getElementById("cubeColor").oninput=function(){
    g_cubeColor = parseHexColor(this.value);
    renderScene();
  };
  document.getElementById("sphereColor").oninput=function(){
    g_sphereColor = parseHexColor(this.value);
    renderScene();
  };
}

function parseHexColor(hexStr){
  if(hexStr[0]==='#'){
    hexStr= hexStr.substring(1);
  }
  let r= parseInt(hexStr.substr(0,2),16)/255.0;
  let g= parseInt(hexStr.substr(2,2),16)/255.0;
  let b= parseInt(hexStr.substr(4,2),16)/255.0;
  return [r,g,b,1.0];
}

// textures
function initTextures(){
  g_texSky= gl.createTexture();
  let skyImg= new Image();
  skyImg.onload=()=>{ loadTex(skyImg,g_texSky); g_skyLoaded=true; };
  skyImg.src="sky.jpg";

  g_texBrick= gl.createTexture();
  let brickImg= new Image();
  brickImg.onload=()=>{ loadTex(brickImg,g_texBrick); g_brickLoaded=true; };
  brickImg.src="brick.jpg";
}
function loadTex(img, tex){
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
  gl.bindTexture(gl.TEXTURE_2D,null);
}

function tick(){
  g_seconds= performance.now()/1000.0 - g_startTime;
  if(g_animateLight){
    let r=4.0;
    g_lightPos[0]= r*Math.cos(g_seconds);
    g_lightPos[2]= r*Math.sin(g_seconds);
  }
  renderScene();
  requestAnimationFrame(tick);
}

function renderScene(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // set camera
  let viewMat= new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements);

  let projMat= new Matrix4();
  projMat.setPerspective(60, gl.drawingBufferWidth/gl.drawingBufferHeight,0.1,1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements);

  // toggles
  gl.uniform1i(u_showNormals,  g_showNormals ? 1:0);
  gl.uniform1i(u_lightingOn,   g_useLighting ? 1:0);
  gl.uniform1i(u_spotOn,       g_spotOn ? 1:0);

  // main light
  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  // camera
  gl.uniform3f(u_CamPos,
    g_camera.eye.elements[0],
    g_camera.eye.elements[1],
    g_camera.eye.elements[2]
  );

  if(g_skyLoaded){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,g_texSky);
    gl.uniform1i(u_SamplerSky,0);
  }
  if(g_brickLoaded){
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,g_texBrick);
    gl.uniform1i(u_SamplerBrick,1);
  }

  {
    let skyMat=new Matrix4();
    skyMat.scale(50,50,50);
    skyMat.translate(-0.5,-0.5,-0.5);

    gl.uniform1i(u_whichTex,2); 
    let nMat=new Matrix4();
    nMat.setInverseOf(skyMat);
    nMat.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,nMat.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,skyMat.elements);

    let skyCubeInside = new CubeInsideOut();
    skyCubeInside.render();
  }

  // Floor
  {
    let floorMat=new Matrix4();
    floorMat.translate(-12.5,-1,-12.5);
    floorMat.scale(25,0.01,25);

    gl.uniform1i(u_whichTex,1); // brick
    let nMat=new Matrix4();
    nMat.setInverseOf(floorMat);
    nMat.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,nMat.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,floorMat.elements);

    let floor=new CubeTex();
    floor.render();
  }

  // cube
  {
    let cMat=new Matrix4();
    cMat.translate(-1,0,0);

    gl.uniform1i(u_whichTex,-1); 
    gl.uniform4f(u_ObjColor,
      g_cubeColor[0],
      g_cubeColor[1],
      g_cubeColor[2],
      g_cubeColor[3]
    );

    let nMat=new Matrix4();
    nMat.setInverseOf(cMat);
    nMat.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,nMat.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,cMat.elements);

    let c=new CubeTex();
    c.render();
  }

  // sphere
  {
    let sMat=new Matrix4();
    sMat.translate(2,0,0);

    gl.uniform1i(u_whichTex,-1);
    gl.uniform4f(u_ObjColor,
      g_sphereColor[0],
      g_sphereColor[1],
      g_sphereColor[2],
      g_sphereColor[3]
    );

    let nMat=new Matrix4();
    nMat.setInverseOf(sMat);
    nMat.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,nMat.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,sMat.elements);

    let sp=new SphereTex(15,15);
    sp.render();
  }

  // Light indicator
  {
    let lMat=new Matrix4();
    lMat.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    lMat.scale(0.2,0.2,0.2);

    gl.uniform1i(u_whichTex,-1);
    gl.uniform4f(u_ObjColor,1.5,1.5,0,1);

    let nMat=new Matrix4();
    nMat.setInverseOf(lMat);
    nMat.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,nMat.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,lMat.elements);

    let lightCube=new CubeTex();
    lightCube.render();
  }
}
