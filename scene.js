/* LOOPS spatial showroom. True WebGL scene; locally bundled procedural GLB clothing. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const damp=(from,to,k,dt)=>THREE.MathUtils.lerp(from,to,1-Math.exp(-k*Math.min(.08,dt)));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function tube(scene,points,radius,material,segments=28){
  const c=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));
  const m=new THREE.Mesh(new THREE.TubeGeometry(c,segments,radius,8,false),material);
  m.castShadow=true;scene.add(m);return m;
}
function shadowTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');const g=ctx.createRadialGradient(128,128,6,128,128,125);
  g.addColorStop(0,'rgba(18,23,25,.42)');g.addColorStop(.35,'rgba(18,23,25,.2)');g.addColorStop(1,'rgba(18,23,25,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function createRoom(scene){
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:0x89969c,roughness:.94,metalness:0}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.33;floor.receiveShadow=true;scene.add(floor);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(15,5.4),new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,opacity:.75}));
  sh.rotation.x=-Math.PI/2;sh.position.set(0,-2.316,.03);scene.add(sh);
  // Diffuse studio lighting and a long soft top rim.
  scene.add(new THREE.HemisphereLight(0xdfe7e9,0x59646b,2.05));
  const main=new THREE.DirectionalLight(0xf4f8fa,3.2);main.position.set(-3.5,7,7);main.castShadow=true;main.shadow.mapSize.set(1024,1024);main.shadow.camera.left=-11;main.shadow.camera.right=11;main.shadow.camera.top=9;main.shadow.camera.bottom=-9;main.shadow.normalBias=.045;main.shadow.bias=-.00016;scene.add(main);
  const fill=new THREE.DirectionalLight(0xd2e2ef,1.2);fill.position.set(8,5,2);scene.add(fill);
  const back=new THREE.DirectionalLight(0xffffff,1.55);back.position.set(0,5,-5);scene.add(back);
}
function createRack(scene){
  const group=new THREE.Group();group.name='LOOPS | metal garment rail';scene.add(group);
  const chrome=new THREE.MeshStandardMaterial({color:0xd3dddf,metalness:.72,roughness:.24});
  const steel=new THREE.MeshStandardMaterial({color:0x96a3a8,metalness:.67,roughness:.36});
  function bar(x,y,z,h,r,material=chrome){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh}
  const top=bar(0,1.7,0,9.62,.033);top.rotation.z=Math.PI/2;
  for(let side of [-1,1]){
    const x=side*4.81;
    bar(x,-.17,0,3.65,.037);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.035,.29,.58,32,1),steel);foot.position.set(x,-2.05,0);foot.castShadow=true;group.add(foot);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.305,.305,.035,32),chrome);rim.position.set(x,-2.315,0);group.add(rim);
    tube(group,[[x,-.06,0],[x,1.53,0],[x-side*.05,1.66,0],[x-side*.19,1.70,0]],.035,chrome,40);
  }
  return group;
}
function makeHanger(pivot){
  const dark=new THREE.MeshStandardMaterial({color:0x22282b,metalness:.18,roughness:.8});
  const hook=new THREE.MeshStandardMaterial({color:0x454c4e,metalness:.6,roughness:.29});
  // Model top is y 0, hanger hook rises to rail at +0.38.
  tube(pivot,[[0,.18,-.01],[0,.30,-.01],[.055,.37,-.01],[.08,.34,-.01],[.055,.29,-.01]],.014,hook,22);
  tube(pivot,[[-.28,.035,0],[-.17,.105,-.01],[-.06,.16,-.01],[.06,.16,-.01],[.17,.105,-.01],[.28,.035,0]],.028,dark,28);
  tube(pivot,[[-.28,.035,0],[-.15,-.025,.01],[0,-.035,.01],[.15,-.025,.01],[.28,.035,0]],.019,dark,22);
}
function addGarmentDetails(group,index){
  const veryDark=new THREE.MeshStandardMaterial({color:index===4||index===8?0x777a75:0x353b3c,roughness:.87,metalness:.04});
  // Collar ring, visible three-dimensional lip.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.145,.026,8,36,Math.PI*2),veryDark);
  collar.position.set(0,-.125,.16);collar.scale.set(1.33,.66,1);collar.castShadow=true;group.add(collar);
  if([0,5,9].includes(index)){
    const hood=new THREE.Mesh(new THREE.TorusGeometry(.24,.083,14,40,Math.PI*1.77),new THREE.MeshStandardMaterial({color:index===9?0x627363:0x313638,roughness:1}));
    hood.position.set(0,-.045,-.15);hood.rotation.z=.4;hood.castShadow=true;group.add(hood);
    const stringMat=new THREE.MeshStandardMaterial({color:0xc6c5bc,roughness:1});
    tube(group,[[-.075,-.15,.18],[-.072,-.34,.19],[-.06,-.59,.18]],.008,stringMat,14);
    tube(group,[[.075,-.15,.18],[.075,-.36,.19],[.07,-.62,.18]],.008,stringMat,14);
  }
  if(index===2){
    const zip=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.34,8),new THREE.MeshStandardMaterial({color:0x515f65,metalness:.65}));
    zip.position.set(0,-.82,.17);group.add(zip);
  }
}

export async function startScene({products,selected,onSelect,onProgress=()=>{}}){
  const canvas=document.getElementById('webgl');const wrap=document.getElementById('canvasWrap');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.43;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x7c888c,17,32);createRoom(scene);
  const rack=createRack(scene);
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,.55,14.4);
  const target=new THREE.Vector3(0,.5,0);camera.lookAt(target);
  let width=innerWidth,height=innerHeight,progress=0,focus=selected,category='store',drag=0,disposed=false,raf=0,last=performance.now();
  let desiredFocus=focus;const pivots=[],models=[],loader=new GLTFLoader();
  const raycaster=new THREE.Raycaster();const cursor=document.getElementById('cursorDot');
  const look=new THREE.Vector3(0,.53,0);const reducedPixel=innerWidth<768;
  const adjustSize=()=>{width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.fov=width<700?48:38;camera.updateProjectionMatrix();renderer.setSize(width,height,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,width<700?1.35:1.65));};
  adjustSize();addEventListener('resize',adjustSize,{passive:true});
  // All assets are original and stored locally as GLB. No external model URL required.
  const all=products.length;
  const loads=products.map(async(p,i)=>{
    const pivot=new THREE.Group();pivot.name=`product-${p.id}`;pivot.position.set((i-(all-1)/2)*.94,1.32,0);
    pivot.userData.productIndex=i;rack.add(pivot);makeHanger(pivot);
    try {
      const gltf=await loader.loadAsync(`./assets/garments/${p.id}.glb`);
      const garment=gltf.scene;garment.name=p.name;
      garment.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.productIndex=i;if(o.material){o.material.side=THREE.DoubleSide;o.material.roughness=i===2?.45:.87}}});
      // Generated garment geometry uses a consistent origin and coordinates.
      pivot.add(garment);addGarmentDetails(pivot,i);
      const b=new THREE.Box3().setFromObject(garment);if(!Number.isFinite(b.min.x)||b.isEmpty())throw Error('Invalid garment bounds');
      return {pivot,garment,baseY:1.32,index:i,restX:(i-(all-1)/2)*.94};
    } catch(error){console.warn('Garment failed to load',p.id,error); // Still preserve the functional scene with a visible fallback.
      const fabric=new THREE.MeshStandardMaterial({color:p.color,roughness:.88,side:THREE.DoubleSide});
      const simple=new THREE.Mesh(new THREE.BoxGeometry(.76,1.45,.12),fabric);simple.position.y=-.78;simple.userData.productIndex=i;pivot.add(simple);
      return {pivot,garment:simple,baseY:1.32,index:i,restX:(i-(all-1)/2)*.94};
    }
  });
  let done=0;await Promise.all(loads.map(async(prom,i)=>{const v=await prom;pivots[i]=v;done++;onProgress(done/all)}));
  const originalColors=pivots.map(p=>{const colors=[];p.garment.traverse(o=>{if(o.isMesh&&o.material?.color)colors.push({material:o.material,color:o.material.color.clone()})});return colors});
  function resetTint(index){originalColors[index]?.forEach(({material,color})=>material.color.copy(color))}
  const groups=()=>products.map((p,i)=>i).filter(i=>category==='store'||products[i].category===category);
  function select(index){if(!groups().includes(index))return;if(index!==desiredFocus)resetTint(desiredFocus);desiredFocus=index;}
  function setCategory(v){category=v;for(let i=0;i<pivots.length;i++){const allow=v==='store'||products[i].category===v;pivots[i].pivot.visible=allow;}if(!groups().includes(desiredFocus))desiredFocus=groups()[0];}
  function setProgress(p){progress=clamp(p)}
  function setDrag(amount){drag=amount}
  function setColor(colorIdx){
    const p=products[desiredFocus];const obj=pivots[desiredFocus].garment;
    // Color variants are a material tint; printed texture still comes from the original asset.
    resetTint(desiredFocus);if(colorIdx===0)return;const shade=p.colors[colorIdx][1];
    obj.traverse(o=>{if(o.isMesh&&o.material?.color){o.material.color.set(shade);o.material.color.lerp(new THREE.Color(0xffffff),.28)}});
  }
  function pickAt(clientX,clientY){
    if(progress<.5)return;const point=new THREE.Vector2((clientX/width)*2-1,-(clientY/height)*2+1);raycaster.setFromCamera(point,camera);
    const roots=pivots.filter(p=>p.pivot.visible).map(p=>p.pivot);const hit=raycaster.intersectObjects(roots,true);
    if(hit.length){let node=hit[0].object;while(node&&node.userData.productIndex===undefined)node=node.parent;if(node?.userData.productIndex!==undefined){onSelect(node.userData.productIndex);return true}}return false;
  }
  const ndc=new THREE.Vector2(4,4);let hoverIndex=-1;
  const onPointerMove=e=>{
    if(progress<.6||e.pointerType==='touch')return;
    ndc.set((e.clientX/width)*2-1,-(e.clientY/height)*2+1);
    raycaster.setFromCamera(ndc,camera);const hits=raycaster.intersectObjects(pivots.filter(p=>p.pivot.visible).map(p=>p.pivot),true);
    const hit=hits[0];hoverIndex=-1;
    if(hit){let o=hit.object;while(o&&o.userData.productIndex===undefined)o=o.parent;hoverIndex=o?.userData.productIndex??-1}
    cursor.classList.toggle('is-hovering',hoverIndex>=0);
  };
  canvas.addEventListener('pointermove',onPointerMove,{passive:true});canvas.addEventListener('pointerleave',()=>cursor.classList.remove('is-hovering'));
  function animate(time){
    if(disposed)return;const dt=Math.max(.001,(time-last)/1000);last=time;const zoom=smooth(.07,1,progress);const focusAmount=smooth(.63,.99,progress);
    const cameraDistance=14.4-(14.4-7.1)*zoom;
    camera.position.z=damp(camera.position.z,cameraDistance,reduced?30:4.6,dt);
    camera.position.y=damp(camera.position.y,.56+(.09*zoom),4.4,dt);
    // Recenter the rail around the selected garment, as in the reference video.
    const rackX=-(desiredFocus-(all-1)/2)*.94*.72*focusAmount + drag*.8;
    rack.position.x=damp(rack.position.x,rackX,reduced?30:3.8,dt);
    look.x=damp(look.x,0,3,dt);look.y=damp(look.y,.47+.03*zoom,3,dt);camera.lookAt(look);
    for(const p of pivots){
      const targetIsSelected=p.index===desiredFocus&&p.pivot.visible;
      const amt=targetIsSelected?focusAmount:0;
      const restRot=((p.index%2===0)?1:-1)*1.02;
      const targetRotation=restRot*(1-amt);
      const t=p.pivot;
      t.rotation.y=damp(t.rotation.y,targetRotation,reduced?45:targetIsSelected?5.7:4.4,dt);
      t.position.z=damp(t.position.z,amt*.91,reduced?45:4.9,dt);
      const hover=hoverIndex===p.index?1:0;
      t.position.y=damp(t.position.y,p.baseY+amt*.09+hover*.035,reduced?40:4.1,dt);
      const newScale=1+amt*.055;
      t.scale.setScalar(damp(t.scale.x,newScale,reduced?45:5.2,dt));
      if(!reduced)t.rotation.z=Math.sin(time*.00085+p.index*1.37)*.008*(1-amt);
    }
    // Label follows selected garment in real screen space.
    const pos=new THREE.Vector3(0,-1.76,0);pivots[desiredFocus].pivot.localToWorld(pos);pos.project(camera);
    const itemLabel=document.getElementById('itemLabel');
    if(progress>.62){let x=(pos.x*.5+.5)*width;let y=(-pos.y*.5+.5)*height+23;
      x=clamp(x,100,width-100);y=clamp(y,70,height-120);itemLabel.style.left=`${x}px`;itemLabel.style.top=`${y}px`;
    }
    renderer.render(scene,camera);raf=requestAnimationFrame(animate);
  }
  raf=requestAnimationFrame(animate);
  function dispose(){disposed=true;cancelAnimationFrame(raf);removeEventListener('resize',adjustSize);canvas.removeEventListener('pointermove',onPointerMove);scene.traverse(obj=>{if(obj.geometry?.dispose)obj.geometry.dispose();if(obj.material){(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{if(m.map?.dispose)m.map.dispose();m.dispose?.()})}});renderer.dispose()}
  return {select,setCategory,setProgress,setDrag,setColor,pickAt,dispose};
}
