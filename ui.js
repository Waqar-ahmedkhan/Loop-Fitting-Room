(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const products = [
    {id:'01-washed-charcoal',name:'Washed Charcoal Hoodie',price:138,category:'man',code:'001',color:'#34393a',colors:[['Washed charcoal','#34393a'],['Smokestone','#767b78'],['Black','#191c1c']],description:'An oversized everyday layer with softly structured sleeves, an archival silhouette and washed charcoal finishing. Made to be worn on repeat.'},
    {id:'02-pink-stripe',name:'Candy Stripe Knit',price:118,category:'woman',code:'002',color:'#efadc5',colors:[['Candy stripe','#efadc5'],['Off white','#ede8df'],['Dust rose','#ba667e']],description:'A vintage-inspired striped sweater. Easy proportions, soft contrast and an unmistakable 2000s attitude.'},
    {id:'03-silver-tech',name:'Liquid Silver Jacket',price:226,category:'man',code:'003',color:'#a6aeb1',colors:[['Liquid silver','#a6aeb1'],['Graphite','#43494d']],description:'Technical shine and graphic piping in one sculptural outer layer. Inspired by early-2000s futurewear.'},
    {id:'04-burgundy-archive',name:'Archive Burgundy',price:115,category:'woman',code:'004',color:'#762f40',colors:[['Burgundy','#762f40'],['Black cherry','#421f28']],description:'Deep burgundy color, relaxed shape and subtle archival graphics. A piece to wear beyond the season.'},
    {id:'05-harness-tee',name:'Harness Tee',price:95,category:'man',code:'005',color:'#eae7dd',colors:[['Bone / red','#eae7dd'],['Black','#2c2b2c']],description:'A reinterpretation of the everyday tee. Sculptural red linework, oversized volume and a clean cotton finish.'},
    {id:'06-flame-hoodie',name:'Midnight Flame Hoodie',price:155,category:'man',code:'006',color:'#28292a',colors:[['Washed black','#28292a'],['Ash','#9a9d9b']],description:'A heavyweight archive-inspired silhouette finished with tonal flame artwork and generous proportions.'},
    {id:'07-halftone-acid',name:'Halftone Acid Tee',price:86,category:'woman',code:'007',color:'#469bad',colors:[['Acid blue','#469bad'],['Marine','#253d57'],['Lime','#d6eb72']],description:'An electric halftone graphic tee with subtle acid-wash variation and contrast trims. A true focal piece.'},
    {id:'08-stone-graphics',name:'Stone Archive Knit',price:129,category:'woman',code:'008',color:'#b4a99a',colors:[['Stone','#b4a99a'],['Dust grey','#777c79']],description:'Soft mineral tones meet loose architectural red linework. A contemporary reading of archival knitwear.'},
    {id:'09-white-basic',name:'Essential Blanc Tee',price:58,category:'woman',code:'009',color:'#edeae2',colors:[['Off white','#edeae2'],['Cool blue','#a3b0c5']],description:'A blank canvas with vintage proportions, comfortable shoulders and an understated archive insignia.'},
    {id:'10-sage-archive',name:'Sage Archive Hoodie',price:142,category:'man',code:'010',color:'#859984',colors:[['Sage','#859984'],['Forest','#3d5146']],description:'Desaturated sage cotton, oversized form and refined tonal detailing. Quiet, durable, always in rotation.'}
  ];
  const state = {selected:4,category:'store',size:'M',colorIndex:0,scroll:0,cart:loadCart(),panel:null,engine:null,ready:false,dragFrom:null,dragged:false};
  let toastTimer, demoStarted=false;
  function loadCart(){try{return JSON.parse(localStorage.getItem('loops-cart-v1')||'[]')}catch{return []}}
  function saveCart(){try{localStorage.setItem('loops-cart-v1',JSON.stringify(state.cart))}catch{}}
  const money=n=>`$${n.toFixed(2)}`;
  const visibleIndices=()=>products.map((p,i)=>({...p,index:i})).filter(p=>state.category==='store'||p.category===state.category).map(p=>p.index);
  function toast(msg){$('toast').textContent=msg;$('toast').classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('is-visible'),2800)}
  function select(index,fromEngine=false){
    const allowed=visibleIndices();if(!allowed.length)return;
    if(!allowed.includes(index))index=allowed[0];
    state.selected=index;state.colorIndex=0;state.size='M';
    const p=products[index];
    $('itemName').textContent=p.name.toUpperCase();$('itemCurrent').textContent=p.code;$('itemTotal').textContent=String(allowed.length).padStart(2,'0');
    $('detailName').textContent=p.name;$('detailCode').textContent=`NO. ${p.code} / LOOPS ARCHIVE`;$('detailPrice').textContent=money(p.price);$('detailDescription').textContent=p.description;
    $('detailArt').src=`./assets/product-art/${p.id}.webp`;$('detailArt').alt=p.name;
    document.querySelectorAll('[data-size]').forEach(el=>el.classList.toggle('active',el.dataset.size==='M'));
    const colors=$('colorOptions');colors.innerHTML='';
    p.colors.forEach(([name,hex],i)=>{const btn=document.createElement('button');btn.title=name;btn.setAttribute('aria-label',name);btn.style.background=hex;btn.classList.toggle('active',i===0);btn.addEventListener('click',()=>setColor(i));colors.appendChild(btn)});
    $('selectedColor').textContent=p.colors[0][0].toUpperCase();
    if(state.engine&&!fromEngine)state.engine.select(index);
    if($('experience').classList.contains('is-fallback'))$('fallbackImage').src=`./assets/${index===6?'fallback-acid':'fallback-showroom'}.jpg`;
  }
  function setColor(i){const p=products[state.selected];state.colorIndex=i;$('selectedColor').textContent=p.colors[i][0].toUpperCase();[...$('colorOptions').children].forEach((b,j)=>b.classList.toggle('active',j===i));state.engine?.setColor?.(i)}
  function step(by){const indices=visibleIndices();const now=indices.indexOf(state.selected);select(indices[(now+by+indices.length)%indices.length])}
  function setCategory(v){state.category=v;document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===v);b.setAttribute('aria-selected',String(b.dataset.category===v))});state.engine?.setCategory(v);const allowed=visibleIndices();if(!allowed.includes(state.selected))select(allowed[0]);else select(state.selected);renderCatalog()}
  function renderCatalog(){const filtered=products.map((p,i)=>({...p,index:i})).filter(p=>state.category==='store'||p.category===state.category);$('catalogCount').textContent=`${String(filtered.length).padStart(2,'0')} SELECTED OBJECTS`;$('catalogGrid').innerHTML=filtered.map(p=>`<article class="product-tile" data-index="${p.index}" tabindex="0" role="button" aria-label="Explore ${p.name}"><span class="tile-num">${p.code} / 010</span><span class="tile-archive">LOOPS®</span><div class="tile-art"><img loading="lazy" src="./assets/product-art/${p.id}.webp" alt="${p.name}"></div><div class="tile-meta"><div><h3>${p.name}</h3><p>${money(p.price)}</p></div><button tabindex="-1" aria-hidden="true">↗</button></div></article>`).join('');}
  function cartCount(){return state.cart.reduce((a,c)=>a+c.qty,0)}
  function syncCart(){saveCart();let n=cartCount();$('cartCount').textContent=n;$('panelCartCount').textContent=String(n).padStart(2,'0');$('subtotal').textContent=money(state.cart.reduce((n,c)=>n+products[c.index].price*c.qty,0));
    if(!state.cart.length){$('cartItems').innerHTML='<p class="cart-empty">Your archive bag is empty. Good pieces are waiting.</p>';return}
    $('cartItems').innerHTML=state.cart.map((c,i)=>{const p=products[c.index];return `<div class="cart-item"><img src="./assets/product-art/${p.id}.webp" alt="${p.name}"><div class="cart-item-body"><div class="cart-item-title"><div>${p.name.toUpperCase()}<p style="color:#727b76;font-weight:400;margin:7px 0">SIZE ${c.size} · ${c.color}</p></div><span>${money(p.price*c.qty)}</span></div><div class="cart-item-bottom"><div class="qty"><button data-qty="${i}:-1" aria-label="Decrease quantity">−</button>${c.qty}<button data-qty="${i}:1" aria-label="Increase quantity">+</button></div><button class="remove" data-remove="${i}">REMOVE</button></div></div></div>`}).join('')}
  function addToCart(){const p=products[state.selected];const color=p.colors[state.colorIndex][0];const found=state.cart.find(c=>c.index===state.selected&&c.size===state.size&&c.color===color);if(found)found.qty++;else state.cart.push({index:state.selected,size:state.size,color,qty:1});syncCart();openPanel('cart');toast('ADDED TO YOUR ARCHIVE BAG')}
  function openPanel(which){closePanel();state.panel=which;$('overlay').hidden=false;requestAnimationFrame(()=>$('overlay').classList.add('is-open'));const id=which==='details'?'detailsPanel':which==='cart'?'cartPanel':'menuPanel';$(id).classList.add('is-open');$(id).setAttribute('aria-hidden','false');if(which==='cart')$('cartBtn').setAttribute('aria-expanded','true');if(which==='menu')$('menuBtn').setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}
  function closePanel(){['detailsPanel','cartPanel','menuPanel'].forEach(id=>{$(id).classList.remove('is-open');$(id).setAttribute('aria-hidden','true')});$('overlay').classList.remove('is-open');setTimeout(()=>{if(!state.panel)$('overlay').hidden=true},350);state.panel=null;$('cartBtn').setAttribute('aria-expanded','false');$('menuBtn').setAttribute('aria-expanded','false');document.body.style.overflow=''}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const travelTo=y=>{closePanel();window.scrollTo({top:y,behavior:reduced?'instant':'smooth'})};
  function showroom(){travelTo(window.innerHeight*2.55)}
  function trackScroll(){
    const h=window.innerHeight;const p=Math.max(0,Math.min(1,window.scrollY/(h*2.45)));state.scroll=p;
    const intro=Math.max(0,Math.min(1,1-p*2.05));$('intro').style.opacity=String(intro);$('intro').style.transform=`translateY(${-p*45}px)`;
    const show=p>.42;$('experience').classList.toggle('is-showroom',show);$('showroomUI').style.opacity=String(Math.max(0,Math.min(1,(p-.42)*3)));
    $('titleBack').style.opacity=String(Math.max(0,Math.min(.88,(p-.55)*2)));
    $('scrollNotice').style.opacity=String(Math.max(0,1-p*4));$('canvasWrap').style.filter=`blur(${(1-p)*5}px)`;
    $('progressFill').style.width=`${Math.min(100,p*100)}%`;
    const poster=$('fallbackImage');if($('experience').classList.contains('is-fallback')){const target=p<.4?'./assets/fallback-intro.jpg':p<.85?'./assets/fallback-showroom.jpg':`./assets/${state.selected===6?'fallback-acid':'fallback-showroom'}.jpg`;if(!poster.src.endsWith(target.replace('./','/')))poster.src=target}
    state.engine?.setProgress(p);
  }
  function bind(){
    $('goTop').addEventListener('click',()=>travelTo(0));$('backBtn').addEventListener('click',()=>travelTo(0));$('enterBtn').addEventListener('click',showroom);$('footerTop').addEventListener('click',showroom);
    $('prevBtn').addEventListener('click',()=>step(-1));$('nextBtn').addEventListener('click',()=>step(1));$('detailsBtn').addEventListener('click',()=>openPanel('details'));
    $('cartBtn').addEventListener('click',()=>openPanel('cart'));$('menuBtn').addEventListener('click',()=>openPanel('menu'));$('addCart').addEventListener('click',addToCart);
    document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closePanel));$('overlay').addEventListener('click',closePanel);
    document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.category)));
    document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{state.size=b.dataset.size;document.querySelectorAll('[data-size]').forEach(c=>c.classList.toggle('active',c===b))}));
    $('catalogGrid').addEventListener('click',e=>{const tile=e.target.closest('[data-index]');if(tile){select(Number(tile.dataset.index));showroom();setTimeout(()=>openPanel('details'),750)}});
    $('catalogGrid').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const tile=e.target.closest('[data-index]');if(tile){e.preventDefault();tile.click()}}});
    $('cartItems').addEventListener('click',e=>{const q=e.target.closest('[data-qty]');const r=e.target.closest('[data-remove]');if(q){const [i,d]=q.dataset.qty.split(':').map(Number);if(!state.cart[i])return;state.cart[i].qty+=d;if(state.cart[i].qty<1)state.cart.splice(i,1);syncCart()}if(r){state.cart.splice(Number(r.dataset.remove),1);syncCart()}});
    document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.nav;if(v==='intro')travelTo(0);else if(v==='showroom')showroom();else if(v==='catalog')travelTo($('catalog').offsetTop);else{travelTo($('catalog').offsetTop);toast('LOOPS IS A CONCEPT STORE / ARCHIVE 0027')}}));
    window.addEventListener('scroll',trackScroll,{passive:true});window.addEventListener('resize',trackScroll,{passive:true});window.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel();if(!state.panel&&state.scroll>.55&&e.key==='ArrowRight'){e.preventDefault();step(1)}if(!state.panel&&state.scroll>.55&&e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
    // Drag gestures on the rendering canvas: on screen, not an invisible overlay.
    const canvas=$('webgl');let startX=0,startY=0,startIndex=0;
    canvas.addEventListener('pointerdown',e=>{if(state.scroll<.5)return;startX=e.clientX;startY=e.clientY;startIndex=state.selected;state.dragFrom=e.clientX;state.dragged=false;canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{if(state.dragFrom===null)return;if(Math.abs(e.clientX-startX)>12)state.dragged=true;state.engine?.setDrag?.((e.clientX-startX)/innerWidth)});
    const end=e=>{if(state.dragFrom===null)return;const dx=e.clientX-startX;const dy=e.clientY-startY;state.engine?.setDrag?.(0);if(Math.abs(dx)>34&&Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);else if(Math.abs(dx)<9&&Math.abs(dy)<9){state.engine?.pickAt?.(e.clientX,e.clientY)}state.dragFrom=null};
    canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
    const cursor=$('cursorDot');window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.style.opacity=state.scroll>.55&&e.target===canvas?'1':'0'});
    window.addEventListener('blur',()=>{cursor.style.opacity='0'});
  }
  function updatePreloader(percent,text){$('loaderPercent').textContent=`${String(Math.round(percent)).padStart(2,'0')}%`;$('loaderBar').style.width=`${Math.max(0,Math.min(100,percent))}%`;if(text)$('loaderState').textContent=text}
  function finishLoad(fallback=false){if(state.ready)return;state.ready=true;updatePreloader(100,fallback?'STATIC PREVIEW READY':'WELCOME TO THE ARCHIVE');setTimeout(()=>$('preloader').classList.add('is-gone'),360);if(fallback){$('experience').classList.add('is-fallback');$('webglNotice').hidden=false;$('fallbackImage').src='./assets/fallback-intro.jpg'}trackScroll();if(new URLSearchParams(location.search).has('demo'))setTimeout(runDemo,1300)}
  function runDemo(){if(demoStarted)return;demoStarted=true;const start=performance.now();const duration=6500;
    function tick(t){const elapsed=Math.min(duration,t-start);const sec=elapsed/1000;const ease=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
      if(sec<3.45)window.scrollTo({top:window.innerHeight*2.55*ease(Math.min(1,sec/3.45)),behavior:'instant'});
      if(sec>=3.6&&sec<4.25&&state.selected!==4)select(4);
      if(sec>=4.85&&state.selected!==6)select(6);
      if(elapsed<duration)requestAnimationFrame(tick);
    }requestAnimationFrame(tick)
  }
  async function loadEngine(){
    updatePreloader(28,'BUILDING THE SHOWROOM');
    const rescue=setTimeout(()=>finishLoad(true),11000);
    try{
      const {startScene}=await import('./scene.js');
      if(state.ready)return;
      const engine=await startScene({products,selected:state.selected,onSelect:i=>select(i,true),onProgress:(n)=>updatePreloader(32+n*.62,'HANGING THE ARCHIVE')});
      if(state.ready){engine.dispose();return}
      state.engine=engine;engine.setCategory(state.category);engine.select(state.selected);engine.setProgress(state.scroll);
      clearTimeout(rescue);finishLoad(false);
    }catch(e){clearTimeout(rescue);console.error('WebGL showroom could not initialize:',e);finishLoad(true)}
  }
  window.__LOOPS__={products,state,select,step,showroom,toast};
  bind();renderCatalog();select(4);syncCart();trackScroll();loadEngine();
})();
