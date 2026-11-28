/* Passport Photo Check — 100% client-side spec checker.
   No server, no upload, no analytics. All coordinates are numbers in the
   ORIGINAL image pixel space unless noted. */

/* ============================== presets ============================== */
/* w,h  : print size in millimetres
   head : [min,max] crown-to-chin height as % of the photo height
   eye  : [min,max] eye line as % of photo height measured from the BOTTOM (null = not specified)
   bg   : 'white' = plain white required, 'light' = plain light background accepted */
const PRESETS = [
  {id:'us', name:'United States', flag:'🇺🇸', doc:'Passport & visa', w:50.8, h:50.8, head:[50,68.75], eye:[56.25,68.75], bg:'white', free:true,
   src:'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html',
   note:'2×2 in. Head 1–1⅜ in. Eyes 1⅛–1⅜ in from the bottom. Plain white or off-white background.'},
  {id:'kr', name:'South Korea', flag:'🇰🇷', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'white', free:true,
   src:'https://www.passport.go.kr/home/kor/contents.do?menuPos=32',
   note:'35×45 mm. Head 3.2–3.6 cm from the crown (hair excluded). Plain white, no border. 413×531 px recommended online.'},
  {id:'schengen', name:'Schengen area (ICAO)', flag:'🇪🇺', doc:'Visa & residence permit', w:35, h:45, head:[71.1,80], eye:null, bg:'light', free:true,
   src:'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en',
   note:'35×45 mm. Head 32–36 mm (70–80%). Plain light background, no shadows.'},

  {id:'uk', name:'United Kingdom', flag:'🇬🇧', doc:'Passport', w:35, h:45, head:[64.4,75.6], eye:null, bg:'light',
   src:'https://www.gov.uk/photos-for-passports/photo-requirements',
   note:'35×45 mm. Crown-to-chin 29–34 mm. Plain cream or light grey background.'},
  {id:'ca', name:'Canada', flag:'🇨🇦', doc:'Passport', w:50, h:70, head:[44.3,51.4], eye:null, bg:'light',
   src:'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html',
   note:'50×70 mm. Chin-to-crown 31–36 mm. Plain white or light background. No editing allowed — crop only.'},
  {id:'au', name:'Australia', flag:'🇦🇺', doc:'Passport', w:35, h:45, head:[64,80], eye:null, bg:'light',
   src:'https://www.passports.gov.au/passports-explained/how-apply/passport-photo-guidelines',
   note:'35–40 mm wide, 45–50 mm high. Chin-to-crown 32–36 mm. Plain white or light grey.'},
  {id:'nz', name:'New Zealand', flag:'🇳🇿', doc:'Passport', w:35, h:45, head:[76,84], eye:null, bg:'light',
   src:'https://passports.govt.nz/passport-photos/',
   note:'35×45 mm. Head including hair about 80% of the photo height. Plain light background — not pure white.'},
  {id:'jp', name:'Japan', flag:'🇯🇵', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'white',
   src:'https://www.mofa.go.jp/mofaj/toko/passport/ic_photo.html',
   note:'35×45 mm, no border. Crown-to-chin 34±2 mm. Plain white background recommended.'},
  {id:'cn', name:'China', flag:'🇨🇳', doc:'Passport', w:33, h:48, head:[58.3,68.75], eye:null, bg:'white',
   src:'https://chiangmai.china-consulate.gov.cn/lshfw/lsfw/lsapp/zpyq/',
   note:'33×48 mm. Head 28–33 mm tall and 15–22 mm wide. 3–5 mm above the crown, at least 7 mm below the chin. White.'},
  {id:'hk', name:'Hong Kong SAR', flag:'🇭🇰', doc:'Passport', w:40, h:50, head:[56,66], eye:null, bg:'white',
   src:'https://www.immd.gov.hk/eng/services/hk-visas/hksar-passport.html',
   note:'40×50 mm. Face 28–33 mm. Plain white background.'},
  {id:'sg', name:'Singapore', flag:'🇸🇬', doc:'Passport', w:35, h:45, head:[55.6,77.8], eye:null, bg:'white',
   src:'https://www.ica.gov.sg/photo-guidelines',
   note:'35×45 mm. Chin-to-crown 25–35 mm. Plain white (light grey if the hair is white). 400×514 px online.'},
  {id:'in', name:'India', flag:'🇮🇳', doc:'Passport', w:50.8, h:50.8, head:[49.2,68.9], eye:[56.25,68.75], bg:'white',
   src:'https://www.passportindia.gov.in/',
   note:'2×2 in (51×51 mm). Head 25–35 mm. Eyes 1⅛–1⅜ in from the bottom. Plain white.'},
  {id:'de', name:'Germany', flag:'🇩🇪', doc:'Passport (biometric)', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.bundesdruckerei.de/en/innovation-and-solutions/biometric-photo',
   note:'35×45 mm. Head 32–36 mm (70–80%). Plain light background.'},
  {id:'fr', name:'France', flag:'🇫🇷', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.service-public.fr/particuliers/vosdroits/F1066',
   note:'35×45 mm. Head 32–36 mm. Plain light background, no shadows.'},
  {id:'it', name:'Italy', flag:'🇮🇹', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.poliziadistato.it/articolo/1117-Come_richiedere_il_passaporto',
   note:'35×45 mm. Head 32–36 mm. Plain light background.'},
  {id:'nl', name:'Netherlands', flag:'🇳🇱', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.rijksoverheid.nl/onderwerpen/paspoort-en-identiteitskaart/eisen-pasfoto',
   note:'35×45 mm. Head 32–36 mm. Plain light background.'},
  {id:'ie', name:'Ireland', flag:'🇮🇪', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.dfa.ie/passports/photo-guidelines/',
   note:'35×45 mm. Head 32–36 mm. Plain light background.'},
  {id:'pl', name:'Poland', flag:'🇵🇱', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://www.gov.pl/web/paszport/zdjecie',
   note:'35×45 mm. Head 32–36 mm. Plain light background.'},
  {id:'se', name:'Sweden', flag:'🇸🇪', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'light',
   src:'https://polisen.se/en/services-and-permits/passport-and-id-card/',
   note:'35×45 mm. Head 32–36 mm. Plain light background.'},
  {id:'tw', name:'Taiwan', flag:'🇹🇼', doc:'Passport', w:35, h:45, head:[71.1,80], eye:null, bg:'white',
   src:'https://www.boca.gov.tw/',
   note:'35×45 mm. Head 3.2–3.6 cm. Plain white background.'}
];

const FREE_IDS = new Set(['us','kr','schengen']);
const DPI = 600;
const MMPI = 25.4;
const GUMROAD_PRODUCT_ID = 'yd1RSbKIBjqXeNEwm6F2dg==';
const BUY_URL = 'https://8299181964131.gumroad.com/l/passport-photo-check?utm_source=yougkxm.github.io&utm_medium=tool&utm_campaign=passport-photo-check';
const LS_KEY = 'ppc_license_v1';

/* ============================== state ============================== */
const state = {
  img:null, imgW:0, imgH:0, S:1, analysis:null,
  preset:null, face:null, crop:null, autoCrop:null,
  model:null, modelTried:false, modelFailed:false,
  license:null, checks:[], lastStats:null
};
const $ = (id)=>document.getElementById(id);
const el = {};
['country','specs','drop','file','stage','preview','zoom','zoomv','panx','panxv','pany','panyv',
 'adjtop','adjtopv','adjchin','adjchinv','reset','facemsg','empty','result','verdict','vbig','vsub',
 'chk','lockedbox','loadstate','btn600','btnsheet','btnfree','expmsg','license','verify','licmsg',
 'protag','probenefits','dimm','spectable'].forEach(k=>{ el[k] = $(k); });

/* ============================== helpers ============================== */
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const fmt = (v,d=1)=>Number(v).toFixed(d).replace(/\.0+$/,'');
function fmtMM(v){ return String(Math.round(v*10)/10).replace(/\.0$/,''); }
function pxSize(p){ return { w: Math.round(p.w/MMPI*DPI), h: Math.round(p.h/MMPI*DPI) }; }
function flash(node, text, kind){
  if(!node) return;
  node.className = 'msg on ' + (kind||'info');
  node.textContent = text;
}
function hide(node){ if(node){ node.className='msg'; node.textContent=''; } }

/* ============================== presets UI ============================== */
function initCountries(){
  const g1 = document.createElement('optgroup'); g1.label = 'Free checks';
  PRESETS.filter(p=>p.free).forEach(p=>g1.appendChild(new Option(`${p.flag} ${p.name} — ${p.doc}`, p.id)));
  const g2 = document.createElement('optgroup'); g2.label = 'Pro — all 20 presets';
  PRESETS.filter(p=>!p.free).forEach(p=>g2.appendChild(new Option(`${p.flag} ${p.name} — ${p.doc}  🔒`, p.id)));
  el.country.append(g1, g2);

  const rows = ['<thead><tr><th>Country</th><th>Document</th><th>Print size</th><th>Head (crown→chin)</th><th>Background</th><th>Rule</th></tr></thead><tbody>'];
  for(const p of PRESETS){
    const lo = (p.head[0]/100*p.h), hi = (p.head[1]/100*p.h);
    rows.push(`<tr><td>${p.flag} ${p.name}</td><td>${p.doc}</td><td>${fmtMM(p.w)}×${fmtMM(p.h)} mm</td>`+
      `<td>${fmt(lo,1)}–${fmt(hi,1)} mm (${p.head[0]}–${p.head[1]}%)</td>`+
      `<td>${p.bg==='white'?'plain white':'plain light'}</td>`+
      `<td><a href="${p.src}" target="_blank" rel="noopener">source</a></td></tr>`);
  }
  rows.push('</tbody>');
  el.spectable.innerHTML = rows.join('');
  el.country.addEventListener('change', ()=> selectPreset(el.country.value));
}

function selectPreset(id){
  state.preset = PRESETS.find(p=>p.id===id) || PRESETS[0];
  const p = state.preset;
  const px = pxSize(p);
  el.specs.innerHTML = `<b>${p.flag} ${p.name}</b> · ${p.doc} · <b>${fmtMM(p.w)}×${fmtMM(p.h)} mm</b> `+
    `(${px.w}×${px.h} px at ${DPI} DPI) · head <b>${p.head[0]}–${p.head[1]}%</b> of the photo height.<br>${p.note}`;
  el.dimm.textContent = `${fmtMM(p.w)}×${fmtMM(p.h)} mm`;

  el.country.value = p.id;
  const unlocked = FREE_IDS.has(p.id) || !!state.license;
  if(!unlocked){
    el.lockedbox.style.display = 'block';
    el.result.style.display = 'none';
    el.empty.style.display = 'none';
  } else {
    el.lockedbox.style.display = 'none';
    if(state.img){ el.result.style.display='block'; el.empty.style.display='none'; }
    else { el.empty.style.display='block'; }
  }
  if(state.img){ applyCrop(); draw(); runChecks(); }
  updateProUI();
}

/* ============================== image input ============================== */
function bindInputs(){
  el.drop.addEventListener('click', ()=> el.file.click());
  el.file.addEventListener('change', e=>{ const f = e.target.files && e.target.files[0]; if(f) loadFile(f); });
  for(const t of ['dragenter','dragover']) el.drop.addEventListener(t, e=>{ e.preventDefault(); el.drop.classList.add('hover'); });
  for(const t of ['dragleave','drop']) el.drop.addEventListener(t, e=>{ e.preventDefault(); el.drop.classList.remove('hover'); });
  el.drop.addEventListener('drop', e=>{ const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if(f) loadFile(f); });
  document.addEventListener('paste', e=>{
    const items = [...((e.clipboardData && e.clipboardData.items)||[])];
    const it = items.find(i=>i.type && i.type.startsWith('image/'));
    if(it) loadFile(it.getAsFile());
  });
  el.reset.addEventListener('click', ()=>{ resetSliders(); if(state.img){ applyCrop(); draw(); runChecks(); } });
  for(const id of ['zoom','panx','pany']){
    el[id].addEventListener('input', ()=>{
      if(id==='zoom') el.zoomv.textContent = el.zoom.value+'%';
      if(id==='panx') el.panxv.textContent = el.panx.value;
      if(id==='pany') el.panyv.textContent = el.pany.value;
      if(!state.img) return;
      applyCrop(); draw(); runChecks();
    });
  }
  el.adjtop.addEventListener('input', ()=>{ el.adjtopv.textContent = el.adjtop.value; nudgeHead(); });
  el.adjchin.addEventListener('input', ()=>{ el.adjchinv.textContent = el.adjchin.value; nudgeHead(); });
  el.btn600.addEventListener('click', ()=> exportSingle());
  el.btnsheet.addEventListener('click', ()=> exportSheet());
  el.btnfree.addEventListener('click', ()=> exportFreePreview());
  el.verify.addEventListener('click', ()=> doVerify(el.license.value));
  el.license.addEventListener('keydown', e=>{ if(e.key==='Enter') doVerify(el.license.value); });
  document.querySelectorAll('.buy').forEach(a=>{ a.href = BUY_URL; });
}

function loadFile(file){
  if(!file || !(file.type||'').startsWith('image/')){ flash(el.facemsg, 'That file is not an image. Choose a JPG or PNG.', 'err'); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = ()=>{ URL.revokeObjectURL(url); setImage(img); };
  img.onerror = ()=>{ URL.revokeObjectURL(url); flash(el.facemsg, 'Could not read that image. Export it as JPG or PNG and try again.', 'err'); };
  img.src = url;
}

function setImage(img){
  state.img = img;
  state.imgW = img.naturalWidth; state.imgH = img.naturalHeight;
  state.S = Math.min(1, 1500/Math.max(state.imgW, state.imgH));
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(state.imgW*state.S));
  c.height = Math.max(2, Math.round(state.imgH*state.S));
  const ctx = c.getContext('2d', {willReadFrequently:true});
  ctx.drawImage(img, 0, 0, c.width, c.height);
  state.analysis = ctx.getImageData(0, 0, c.width, c.height);
  state.face = null; state.crop = null; state.autoCrop = null;
  el.drop.style.display = 'none';
  el.stage.classList.add('on');
  resetSliders();
  flash(el.facemsg, 'Finding the face…', 'info');
  draw();
  analyzeFace()
    .then(()=>{ applyCrop(); draw(); runChecks(); updateProUI(); })
    .catch(err=>{
      console.warn('face analysis failed', err);
      state.face = guessFace();
      const noFace = String(err && err.message) === 'no face found';
      if(!noFace){ state.modelFailed = true; state.modelTried = false; }
      el.facemsg.className = 'msg info on';
      el.facemsg.innerHTML = noFace
        ? 'No face found in this photo. Use a front-facing photo, or drag the <b>Head top</b> and <b>Chin</b> sliders until the blue lines sit on the top of the head and the chin — every other check still runs.'
        : 'Face detection is unavailable (offline or blocked). Drag the <b>Head top</b> and <b>Chin</b> sliders until the blue lines sit on the top of the head and the chin — every other check still runs.';
      applyCrop(); draw(); runChecks(); updateProUI();
    });
}

function resetSliders(){
  el.zoom.value = 100; el.zoomv.textContent = '100%';
  el.panx.value = 0; el.panxv.textContent = '0';
  el.pany.value = 0; el.panyv.textContent = '0';
  el.adjtop.value = 0; el.adjtopv.textContent = '0';
  el.adjchin.value = 0; el.adjchinv.textContent = '0';
}

/* ============================== face detection ============================== */
async function ensureModel(){
  if(state.model) return state.model;
  if(state.modelTried) return null;
  state.modelTried = true;
  const mod = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
  const files = await mod.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
  state.model = await mod.FaceLandmarker.createFromOptions(files, {
    baseOptions:{
      modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate:'CPU'
    },
    runningMode:'IMAGE', numFaces:1,
    minFaceDetectionConfidence:0.35, minFacePresenceConfidence:0.35
  });
  return state.model;
}

async function analyzeFace(){
  const model = await ensureModel();
  if(!model) throw new Error('model unavailable');
  const c = document.createElement('canvas');
  c.width = state.analysis.width; c.height = state.analysis.height;
  c.getContext('2d').putImageData(state.analysis, 0, 0);
  const res = model.detect(c);
  const lm = res && res.faceLandmarks && res.faceLandmarks[0];
  if(!lm) throw new Error('no face found');

  const S = state.S, AW = state.analysis.width, AH = state.analysis.height;
  const P = i => ({ x: lm[i].x*AW/S, y: lm[i].y*AH/S });
  const forehead = P(10), chin = P(152);
  const eyeL = P(33), eyeR = P(263);
  const irisL = lm.length > 473 ? P(468) : null, irisR = lm.length > 473 ? P(473) : null;
  const cheekL = P(234), cheekR = P(454);
  const eyeLeft = irisL || eyeL, eyeRight = irisR || eyeR;
  const eyeY = (eyeLeft.y + eyeRight.y)/2;
  const tilt = Math.atan2(eyeRight.y-eyeLeft.y, eyeRight.x-eyeLeft.x) * 180/Math.PI;
  const centerX = (cheekL.x + cheekR.x)/2;
  const faceWidth = Math.abs(cheekR.x - cheekL.x) || Math.abs(chin.x - forehead.x)*1.4;

  const crownY = refineCrown(centerX, forehead.y, eyeY, chin.y);
  state.face = {
    crownY, chinY: chin.y, eyeY, centerX, faceWidth, tilt,
    baseCrown:crownY, baseChin:chin.y, baseEye:eyeY, baseCenter:centerX,
    auto:true
  };
  if(!el.facemsg.className.includes('err')){
    flash(el.facemsg, 'Face found — blue lines mark the crown and chin, green the eye level. Nudge the sliders if the hairline was misread.', 'ok');
  }
}

/* top of the head: scan upward from the forehead landmark until the background colour is reached */
function refineCrown(centerX, foreheadY, eyeY, chinY){
  const a = state.analysis, W = a.width, H = a.height, S = state.S;
  const bg = cornerColor(a);
  const cx = Math.round(centerX*S), y0 = Math.round(foreheadY*S);
  const limit = Math.round((chinY - foreheadY)*0.75*S);
  const cands = [];
  for(let dx = -12; dx <= 12; dx += 3){
    const x = clamp(cx+dx, 0, W-1);
    let y = y0, steps = 0;
    while(y > 0 && steps < limit){
      const d = colorDist(pixel(a, x, y), bg);
      if(d < 26) break;
      y--; steps++;
    }
    if(steps < limit) cands.push(y/S + 1/S);
  }
  const guess = foreheadY - 0.72*(eyeY - foreheadY);
  if(cands.length < 3) return guess;
  cands.sort((p,q)=>p-q);
  const med = cands[Math.floor(cands.length/2)];
  // reject an implausible scan (too close to the forehead or above the frame)
  if(med > foreheadY - 0.12*(chinY-foreheadY) || med < 0) return guess;
  return med;
}
function pixel(a, x, y){
  const i = ((y|0)*a.width + (x|0))*4;
  return [a.data[i], a.data[i+1], a.data[i+2]];
}
function cornerColor(a){
  const s = 18, pts = [[2,2],[a.width-s-2,2],[2,a.height-s-2],[a.width-s-2,a.height-s-2]];
  let r=0,g=0,b=0,n=0;
  for(const [x0,y0] of pts){
    for(let y=y0;y<y0+s;y+=3) for(let x=x0;x<x0+s;x+=3){
      const i=(y*a.width+x)*4; r+=a.data[i]; g+=a.data[i+1]; b+=a.data[i+2]; n++;
    }
  }
  return [r/n, g/n, b/n];
}
function colorDist(c1, c2){
  return Math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2);
}
function guessFace(){
  // fallback when the model cannot run: a centred head at typical ID-photo framing
  const W = state.imgW, H = state.imgH;
  const crown = H*0.14, chin = H*0.72, eye = H*0.42;
  return {crownY:crown, chinY:chin, eyeY:eye, centerX:W/2, faceWidth:W*0.34, tilt:0,
          baseCrown:crown, baseChin:chin, baseEye:eye, baseCenter:W/2, auto:false};
}

/* ============================== crop ============================== */
function applyCrop(){
  if(!state.img || !state.preset) return;
  state.autoCrop = computeAutoCrop();
  const a = state.autoCrop, aspect = state.preset.w/state.preset.h;
  const zoom = clamp((+el.zoom.value||100)/100, 0.7, 1.6);
  let w = a.w/zoom, h = w/aspect;
  if(w > state.imgW){ w = state.imgW; h = w/aspect; }
  if(h > state.imgH){ h = state.imgH; w = h*aspect; }
  const px = (+el.panx.value||0)/100, py = (+el.pany.value||0)/100;
  const slackX = Math.max(0, state.imgW - w)/2, slackY = Math.max(0, state.imgH - h)/2;
  const cx = a.x + a.w/2 + px*slackX;
  const cy = a.y + a.h/2 + py*slackY;
  const x = clamp(cx - w/2, 0, Math.max(0, state.imgW - w));
  const y = clamp(cy - h/2, 0, Math.max(0, state.imgH - h));
  state.crop = {x, y, w, h};
}

function computeAutoCrop(){
  const p = state.preset, f = state.face;
  const aspect = p.w/p.h;
  if(!f) return centerCrop(aspect);
  const headH = Math.max(8, f.chinY - f.crownY);
  const target = (p.head[0]+p.head[1])/200;
  let ch = headH/target, cw = ch*aspect;
  if(cw > state.imgW){ cw = state.imgW; ch = cw/aspect; }
  if(ch > state.imgH){ ch = state.imgH; cw = ch*aspect; }
  let top;
  if(p.eye){
    const eyeFrac = (p.eye[0]+p.eye[1])/200;          // from the bottom
    top = f.eyeY - ch*(1-eyeFrac);
  } else {
    top = f.crownY - 0.10*ch;                          // ~10% headroom
  }
  const x = clamp(f.centerX - cw/2, 0, Math.max(0, state.imgW-cw));
  const y = clamp(top, 0, Math.max(0, state.imgH-ch));
  return {x, y, w:cw, h:ch};
}
function centerCrop(aspect){
  let h = state.imgH*0.9, w = h*aspect;
  if(w > state.imgW){ w = state.imgW; h = w/aspect; }
  return {x:(state.imgW-w)/2, y:(state.imgH-h)/2, w, h};
}

function nudgeHead(){
  const f = state.face;
  if(!f) return;
  const headH = f.baseChin - f.baseCrown;
  const t = (+el.adjtop.value)/100 * headH;
  const c = (+el.adjchin.value)/100 * headH;
  f.crownY = f.baseCrown + t;
  f.chinY = f.baseChin + c;
  applyCrop(); draw(); runChecks();
}

/* ============================== preview drawing ============================== */
function draw(){
  const cv = el.preview, p = state.preset, c = state.crop, f = state.face;
  if(!cv || !state.img || !c) return;
  const aspect = c.w/c.h;
  let W = 460, H = Math.round(W/aspect);
  if(H > 540){ H = 540; W = Math.round(H*aspect); }
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#eef1f5'; ctx.fillRect(0,0,W,H);
  ctx.drawImage(state.img, c.x, c.y, c.w, c.h, 0, 0, W, H);

  const Y = v => (v - c.y)/c.h*H;
  const X = v => (v - c.x)/c.w*W;

  if(f){
    // allowed crown band
    const chinY = Y(f.chinY);
    const okMin = chinY - (p.head[1]/100)*H;   // crown may not be lower than this
    const okMax = chinY - (p.head[0]/100)*H;   // nor higher than this
    ctx.fillStyle = 'rgba(16,185,129,.13)';
    ctx.fillRect(0, Math.max(0,okMin), W, Math.max(0, okMax-okMin));
    // eye band
    if(p.eye){
      const eTop = H*(1 - p.eye[1]/100), eBot = H*(1 - p.eye[0]/100);
      ctx.fillStyle = 'rgba(59,130,246,.12)';
      ctx.fillRect(0, eTop, W, eBot-eTop);
    }
    // vertical centre
    ctx.setLineDash([4,5]); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(f.centerX),0); ctx.lineTo(X(f.centerX),H); ctx.stroke();
    ctx.setLineDash([]);
    // crown / chin / eye
    line(ctx, 0, W, Y(f.crownY), '#2563eb', 2, 'crown');
    line(ctx, 0, W, Y(f.chinY), '#2563eb', 2, 'chin');
    line(ctx, 0, W, Y(f.eyeY), '#059669', 1.5, 'eye');
  }
  // frame
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
  ctx.strokeRect(1,1,W-2,H-2);
}
function line(ctx, x1, x2, y, color, w, label){
  if(!isFinite(y)) return;
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.setLineDash(label==='crown'||label==='chin' ? [] : [6,4]);
  ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.font = '600 10px -apple-system,Segoe UI,sans-serif';
  ctx.fillText(label, 6, Math.max(11, Math.min(y-4, 999)));
}

/* ============================== checks ============================== */
function bandStatus(v, min, max, tol){
  if(v >= min && v <= max) return 'pass';
  if(v >= min-tol && v <= max+tol) return 'warn';
  return 'fail';
}

function analyzeBackground(){
  const a = state.analysis, S = state.S, c = state.crop, f = state.face;
  const x0 = Math.round(c.x*S), y0 = Math.round(c.y*S);
  const w = Math.round(c.w*S), h = Math.round(c.h*S);
  const strips = [];
  if(f){
    const cx = f.centerX*S, crown = f.crownY*S, chin = f.chinY*S;
    const half = f.faceWidth*0.80*S;
    const topEnd = Math.round(crown - h*0.012);
    if(topEnd > y0 + 3)
      strips.push({x0:x0+Math.round(w*0.12), x1:x0+Math.round(w*0.88), y0:y0+1, y1:topEnd});
    const leftX1 = Math.round(cx - half), rightX0 = Math.round(cx + half);
    const midY0 = Math.round(crown), midY1 = Math.round(chin);
    if(leftX1 - x0 > 6) strips.push({x0:x0+1, x1:leftX1-2, y0:midY0, y1:midY1});
    if((x0+w) - rightX0 > 6) strips.push({x0:rightX0+2, x1:x0+w-1, y0:midY0, y1:midY1});
  }
  if(!strips.length){
    strips.push({x0:x0+Math.round(w*0.12), x1:x0+Math.round(w*0.88), y0:y0+1, y1:y0+Math.round(h*0.08)});
  }
  const lum = [], sat = [];
  for(const s of strips){
    for(let y=Math.max(0,s.y0); y<Math.min(a.height,s.y1); y+=2){
      for(let x=Math.max(0,s.x0); x<Math.min(a.width,s.x1); x+=2){
        const i = (y*a.width + x)*4;
        const r=a.data[i], g=a.data[i+1], b=a.data[i+2];
        lum.push(0.299*r + 0.587*g + 0.114*b);
        sat.push(Math.max(r,g,b) - Math.min(r,g,b));
      }
    }
  }
  if(lum.length < 60) return null;
  const mean = lum.reduce((s,v)=>s+v,0)/lum.length;
  const sd = Math.sqrt(lum.reduce((s,v)=>s+(v-mean)**2,0)/lum.length);
  const sMean = sat.reduce((s,v)=>s+v,0)/sat.length;
  let dark = 0; for(const v of lum) if(v < mean-28) dark++;
  return { mean, sd, sat:sMean, darkFrac: dark/lum.length, n: lum.length };
}

function analyzeLighting(){
  const a = state.analysis, S = state.S, f = state.face;
  if(!f) return null;
  const cx = f.centerX*S;
  const top = (f.crownY + (f.chinY-f.crownY)*0.35)*S;
  const bot = (f.crownY + (f.chinY-f.crownY)*0.85)*S;
  const half = f.faceWidth*0.35*S;
  let l=0, ln=0, r=0, rn=0;
  for(let y=Math.round(top); y<Math.round(bot); y+=3){
    for(let x=Math.round(cx-half); x<Math.round(cx); x+=3){
      if(x<0) continue; const i=(y*a.width+x)*4; l += 0.299*a.data[i]+0.587*a.data[i+1]+0.114*a.data[i+2]; ln++;
    }
    for(let x=Math.round(cx); x<Math.round(cx+half); x+=3){
      if(x>=a.width) continue; const i=(y*a.width+x)*4; r += 0.299*a.data[i]+0.587*a.data[i+1]+0.114*a.data[i+2]; rn++;
    }
  }
  if(!ln || !rn) return null;
  return Math.abs(l/ln - r/rn);
}

function runChecks(){
  if(!state.img || !state.crop || !state.face || !state.preset) return;
  const p = state.preset, c = state.crop, f = state.face;
  const headH = f.chinY - f.crownY;
  const headPct = headH/c.h*100;
  const headMM = headH/c.h*p.h;
  const checks = [];

  const {w:pxW, h:pxH} = pxSize(p);
  checks.push({key:'size', name:`Print size ${fmtMM(p.w)}×${fmtMM(p.h)} mm`,
    value:`${pxW}×${pxH} px`, status:'pass',
    detail:`${p.flag} ${p.name} · ${p.doc} · rendered at ${DPI} DPI for print`});

  const headSt = bandStatus(headPct, p.head[0], p.head[1], 3);
  checks.push({key:'head', name:'Head height (crown → chin)',
    value:`${fmt(headPct)}% · ${fmt(headMM)} mm`, status:headSt,
    detail: headSt==='pass'
      ? `Inside the ${p.head[0]}–${p.head[1]}% band (${fmt(p.head[0]/100*p.h)}–${fmt(p.head[1]/100*p.h)} mm).`
      : `Target ${p.head[0]}–${p.head[1]}% (${fmt(p.head[0]/100*p.h)}–${fmt(p.head[1]/100*p.h)} mm). ${headPct < p.head[0] ? 'The head is too small — move closer / zoom in when shooting, or zoom the crop.' : 'The head is too large — step back and leave more space around it.'}`});

  if(p.eye){
    const eyePct = (c.y + c.h - f.eyeY)/c.h*100;
    const st = bandStatus(eyePct, p.eye[0], p.eye[1], 3);
    checks.push({key:'eye', name:'Eye line from the bottom',
      value:`${fmt(eyePct)}%`, status:st,
      detail: st==='pass'
        ? `Inside the ${p.eye[0]}–${p.eye[1]}% band (${fmt(p.eye[0]/100*p.h)}–${fmt(p.eye[1]/100*p.h)} mm from the bottom edge).`
        : `Target ${p.eye[0]}–${p.eye[1]}% of the height. ${eyePct > p.eye[1] ? 'The face sits too high — move the crop down or leave more space above the head.' : 'The face sits too low — leave more space below the chin.'}`});
  }

  const offPct = Math.abs(f.centerX - (c.x + c.w/2))/c.w*100;
  const cSt = offPct <= 2 ? 'pass' : (offPct <= 5 ? 'warn' : 'fail');
  checks.push({key:'center', name:'Centering left / right',
    value:`${fmt(offPct)}% off centre`, status:cSt,
    detail: cSt==='pass' ? 'The head sits within 2% of the centre line.'
      : 'Shift the crop so the nose line is on the white centre line (Move ⇆).'});

  const tilt = Math.abs(f.tilt);
  const tSt = tilt <= 2 ? 'pass' : (tilt <= 5 ? 'warn' : 'fail');
  checks.push({key:'tilt', name:'Head tilt',
    value:`${fmt(tilt)}°`, status:tSt,
    detail: tSt==='pass' ? 'The eye line is level.'
      : 'The eye line is not level. Straighten the head and re-shoot — rotating the photo would be an edit some authorities reject.'});

  const bg = analyzeBackground();
  if(bg){
    const white = p.bg === 'white';
    let st, txt;
    if(white){
      if(bg.mean >= 238 && bg.sd <= 9 && bg.sat <= 14 && bg.darkFrac < 0.02) st='pass';
      else if(bg.mean >= 224 && bg.sd <= 18 && bg.sat <= 22) st='warn';
      else st='fail';
      txt = st==='pass' ? 'Plain, even, near-white background.'
        : 'This spec asks for a plain white background. Current background brightness '+Math.round(bg.mean)+'/255 with variation '+fmt(bg.sd)+'. Re-shoot against a white wall with even light, or pick a light background spec if your document allows it.';
    } else {
      if(bg.mean >= 196 && bg.sd <= 14) st='pass';
      else if(bg.mean >= 176 && bg.sd <= 24) st='warn';
      else st='fail';
      txt = st==='pass' ? 'Plain, even, light background.'
        : 'This spec asks for a plain light background (white, cream or light grey). Brightness '+Math.round(bg.mean)+'/255, variation '+fmt(bg.sd)+'. Avoid textured walls, furniture or shadows behind the head.';
    }
    if(p.id==='nz' && bg.mean > 244) { st = st==='pass' ? 'warn' : st; txt = 'New Zealand asks for a light background but not pure white — a very white background can be refused.'; }
    checks.push({key:'bg', name:'Background', value:`brightness ${Math.round(bg.mean)} · evenness ${fmt(bg.sd)}`, status:st, detail:txt});
  }

  const lightDiff = analyzeLighting();
  if(lightDiff != null){
    const st = lightDiff <= 14 ? 'pass' : (lightDiff <= 28 ? 'warn' : 'fail');
    checks.push({key:'light', name:'Even lighting across the face',
      value:`${Math.round(lightDiff)}/255 side difference`, status:st,
      detail: st==='pass' ? 'Both sides of the face are lit evenly.'
        : 'One side of the face is much brighter. Move the light to the front and remove the shadow behind the head.'});
  }

  const reqW = pxW, have = c.w;
  const pct = have/reqW*100;
  const rSt = pct >= 100 ? 'pass' : (pct >= 70 ? 'warn' : 'fail');
  checks.push({key:'dpi', name:`Resolution for ${DPI} DPI`,
    value:`${Math.round(pct)}% of target`, status:rSt,
    detail: rSt==='pass'
      ? `${Math.round(have)} px across the crop — enough for ${reqW} px at ${DPI} DPI.`
      : `The crop yields ${Math.round(have)} px where ${reqW} px are needed at ${DPI} DPI. A ${rSt==='warn'?'slightly':'much'} larger original photo (or a tighter crop from the same camera) is needed for a sharp print.`});

  const headroomMM = (f.crownY - c.y)/c.h*p.h;
  const hrSt = p.id==='cn'
    ? (headroomMM >= 3 && headroomMM <= 5 ? 'pass' : (headroomMM >= 1.5 && headroomMM <= 7 ? 'warn' : 'fail'))
    : (headroomMM >= 2 && headroomMM <= 9 ? 'pass' : (headroomMM >= 0 && headroomMM <= 12 ? 'warn' : 'fail'));
  checks.push({key:'headroom', name:'Space above the head',
    value:`${fmt(headroomMM)} mm`, status:hrSt,
    detail: p.id==='cn'
      ? 'China asks for 3–5 mm between the top of the head and the top edge.'
      : 'Leave a few millimetres of background above the crown; a cropped crown is a common rejection.'});

  state.checks = checks;
  renderChecks(checks);
  if(FREE_IDS.has(p.id) || isPro()){
    el.result.style.display = 'block';
    el.empty.style.display = 'none';
  }
}

function renderChecks(checks){
  const p = state.preset;
  const fails = checks.filter(c=>c.status==='fail').length;
  const warns = checks.filter(c=>c.status==='warn').length;
  const v = el.verdict, big = el.vbig, sub = el.vsub;
  v.className = 'verdict ' + (fails ? 'bad' : warns ? 'warn' : 'good');
  if(fails){
    big.textContent = `${fails} rule${fails>1?'s':''} need${fails>1?'':'s'} fixing`;
    sub.textContent = `${warns ? warns+' warning'+(warns>1?'s':'')+' · ' : ''}Fix the red items below, then check again.`;
  } else if(warns){
    big.textContent = 'Close — worth checking';
    sub.textContent = `${warns} warning${warns>1?'s':''}. The measurable rules pass, but a careful re-shoot removes the risk.`;
  } else {
    big.textContent = 'Every measurable rule passes';
    sub.textContent = `Head height, centering, tilt, background and resolution match the ${p.name} spec. Expression, glasses and paper quality are still up to the officer.`;
  }
  el.chk.innerHTML = checks.map(c=>{
    const icon = c.status==='pass' ? '✓' : c.status==='warn' ? '!' : c.status==='fail' ? '✕' : '–';
    const tag = c.status==='pass' ? 'Pass' : c.status==='warn' ? 'Check' : c.status==='fail' ? 'Fix' : '—';
    return `<li><span class="st ${c.status}">${icon}</span>
      <span><span class="nm">${c.name}</span><div class="dt">${c.detail}</div></span>
      <span class="val"><span class="tag ${c.status}">${tag}</span><br>${c.value}</span></li>`;
  }).join('');
}

/* ============================== export ============================== */
function isPro(){ return !!state.license; }
function renderCropCanvas(wPx, hPx){
  const c = document.createElement('canvas');
  c.width = wPx; c.height = hPx;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,wPx,hPx);
  const cr = state.crop;
  ctx.drawImage(state.img, cr.x, cr.y, cr.w, cr.h, 0, 0, wPx, hPx);
  return c;
}
function saveCanvas(canvas, filename, type, quality){
  const mime = type || 'image/jpeg';
  canvas.toBlob(async blob=>{
    if(!blob){ flash(el.expmsg, 'Could not create the file. Try a smaller source photo.', 'err'); return; }
    let out = blob;
    if(mime === 'image/jpeg'){
      try { out = await withJpegDpi(blob, DPI); } catch(e) { out = blob; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(out);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 6000);
  }, mime, quality || 0.95);
}
/* browsers write no DPI into a canvas JPEG; print shops read it, so stamp the JFIF density */
async function withJpegDpi(blob, dpi){
  const buf = new Uint8Array(await blob.arrayBuffer());
  if(!(buf[0]===0xFF && buf[1]===0xD8)) return blob;
  const isJfif = buf[2]===0xFF && buf[3]===0xE0 &&
    buf[6]===0x4A && buf[7]===0x46 && buf[8]===0x49 && buf[9]===0x46 && buf[10]===0x00;
  if(isJfif){
    buf[13] = 1;                       // units: dots per inch
    buf[14] = (dpi>>8)&0xFF; buf[15] = dpi&0xFF;
    buf[16] = (dpi>>8)&0xFF; buf[17] = dpi&0xFF;
    return new Blob([buf], {type:'image/jpeg'});
  }
  const app0 = new Uint8Array([0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x01,
    (dpi>>8)&0xFF, dpi&0xFF, (dpi>>8)&0xFF, dpi&0xFF, 0x00,0x00]);
  const out = new Uint8Array(buf.length + app0.length);
  out.set(buf.subarray(0,2), 0);
  out.set(app0, 2);
  out.set(buf.subarray(2), 2 + app0.length);
  return new Blob([out], {type:'image/jpeg'});
}
function exportSingle(){
  if(!state.img) return flash(el.expmsg, 'Add a photo first.', 'err');
  if(!isPro()) return showLockedMsg();
  const p = state.preset, {w,h} = pxSize(p);
  const cv = renderCropCanvas(w, h);
  saveCanvas(cv, `passport-photo_${p.id}_${fmtMM(p.w)}x${fmtMM(p.h)}mm_${DPI}dpi.jpg`, 'image/jpeg', 0.96);
  flash(el.expmsg, `Saved ${w}×${h} px JPEG (${fmtMM(p.w)}×${fmtMM(p.h)} mm at ${DPI} DPI).`, 'ok');
}
function sheetGrid(p){
  const SW = 2400, SH = 3600;                    // 4×6 in at 600 DPI
  const {w:wPx, h:hPx} = pxSize(p);
  let best = {cols:0, rows:0, n:0};
  for(let cols=1; cols<=Math.floor(SW/wPx); cols++){
    for(let rows=1; rows<=Math.floor(SH/hPx); rows++){
      const n = cols*rows;
      if(n <= 6 && n > best.n) best = {cols, rows, n};
    }
  }
  if(!best.n) best = {cols:1, rows:1, n:1};
  return {...best, SW, SH, wPx, hPx};
}
function sheetCanvas(p){
  const g = sheetGrid(p);
  const cv = document.createElement('canvas');
  cv.width = g.SW; cv.height = g.SH;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,g.SW,g.SH);
  const wanted = Math.round(1.5/MMPI*DPI);                          // 1.5 mm gutters
  const gapX = g.cols>1 ? Math.min(wanted, Math.floor((g.SW-g.cols*g.wPx)/(g.cols-1))) : 0;
  const gapY = g.rows>1 ? Math.min(wanted, Math.floor((g.SH-g.rows*g.hPx)/(g.rows-1))) : 0;
  const totalW = g.cols*g.wPx + (g.cols-1)*gapX;
  const totalH = g.rows*g.hPx + (g.rows-1)*gapY;
  const ox = Math.round((g.SW-totalW)/2), oy = Math.round((g.SH-totalH)/2);
  const one = renderCropCanvas(g.wPx, g.hPx);
  for(let r=0; r<g.rows; r++) for(let c=0; c<g.cols; c++){
    ctx.drawImage(one, ox + c*(g.wPx+gapX), oy + r*(g.hPx+gapY));
  }
  // cutting guides in the gutters only
  ctx.strokeStyle = '#d5d9e0'; ctx.lineWidth = 2;
  for(let c=1; c<g.cols; c++){
    const x = ox + c*(g.wPx+gapX) - gapX/2;
    ctx.beginPath(); ctx.moveTo(x, oy-40); ctx.lineTo(x, oy+totalH+40); ctx.stroke();
  }
  for(let r=1; r<g.rows; r++){
    const y = oy + r*(g.hPx+gapY) - gapY/2;
    ctx.beginPath(); ctx.moveTo(ox-40, y); ctx.lineTo(ox+totalW+40, y); ctx.stroke();
  }
  return {...g, canvas:cv};
}
function exportSheet(){
  if(!state.img) return flash(el.expmsg, 'Add a photo first.', 'err');
  if(!isPro()) return showLockedMsg();
  const p = state.preset;
  const g = sheetCanvas(p);
  saveCanvas(g.canvas, `passport-photo_${p.id}_4x6in_sheet_${g.n}up_${DPI}dpi.jpg`, 'image/jpeg', 0.95);
  flash(el.expmsg, `Saved a 4×6 in sheet (2400×3600 px, ${g.n} copies) — print “actual size”, cut along the grey lines.`, 'ok');
}
function exportFreePreview(){
  if(!state.img) return flash(el.expmsg, 'Add a photo first.', 'err');
  const p = state.preset, aspect = p.w/p.h;
  const W = 400, H = Math.round(W/aspect);
  const cv = renderCropCanvas(W, H);
  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px -apple-system,Segoe UI,sans-serif';
  ctx.translate(W/2, H/2); ctx.rotate(-Math.PI/7);
  for(let y=-H; y<H; y+=54){
    ctx.fillText('PREVIEW · NOT FOR PRINT · PRO REMOVES THIS', -W, y);
  }
  ctx.restore();
  saveCanvas(cv, `passport-photo_${p.id}_preview_watermarked.png`, 'image/png');
  flash(el.expmsg, 'Saved a watermarked 400 px preview. The print file (600 DPI, no watermark) is in Pro.', 'info');
}
function showLockedMsg(){
  flash(el.expmsg, 'Pro is needed for the print files: 600 DPI JPEG, the 4×6 in sheet and all 20 presets. Enter your license key below, or get one for $12.99.', 'info');
  el.license.focus();
}

/* ============================== license ============================== */
async function verifyKey(key){
  const clean = String(key||'').trim();
  if(!clean) return {ok:false, message:'Enter the license key from your Gumroad receipt.'};
  if(GUMROAD_PRODUCT_ID.indexOf('PLACEHOLDER') >= 0){
    return {ok:false, message:'The license check is not configured yet. Please try again later.'};
  }
  const body = new URLSearchParams({product_id: GUMROAD_PRODUCT_ID, license_key: clean, increment_uses_count:'false'});
  let res;
  try{
    res = await fetch('https://api.gumroad.com/v2/licenses/verify', {method:'POST', body});
  }catch(e){
    return {ok:false, message:'Could not reach the license server. Check your connection and try again.'};
  }
  let j = null;
  try { j = await res.json(); } catch(e) { /* ignored */ }
  if(j && j.success && j.purchase && !j.purchase.refunded && !j.purchase.chargebacked){
    return {ok:true, message:'Pro unlocked on this browser. All 20 presets and the print files are open.'};
  }
  const msg = (j && j.message) ? j.message : 'That key is not valid for this product.';
  return {ok:false, message: msg.charAt(0).toUpperCase()+msg.slice(1)};
}
async function doVerify(key){
  el.verify.disabled = true;
  flash(el.licmsg, 'Checking the key with Gumroad…', 'info');
  const r = await verifyKey(key);
  el.verify.disabled = false;
  flash(el.licmsg, r.message, r.ok ? 'ok' : 'err');
  if(r.ok){
    state.license = String(key).trim();
    try { localStorage.setItem(LS_KEY, state.license); } catch(e) {}
    el.license.value = state.license;
    updateProUI(); selectPreset(state.preset.id);
    if(state.img){ applyCrop(); draw(); runChecks(); }
  }
}
let wasPro = null;
function updateProUI(){
  const pro = isPro();
  el.protag.textContent = pro ? 'Pro' : 'Free';
  el.protag.className = 'tag' + (pro ? ' pro' : '');
  el.btn600.disabled = !pro || !state.img;
  el.btnsheet.disabled = !pro || !state.img;
  el.btn600.classList.toggle('lock', !pro);
  el.btnsheet.classList.toggle('lock', !pro);
  el.probenefits.style.display = pro ? 'none' : 'block';
  if(pro){
    el.lockedbox.style.display = 'none';
    if(state.img){ el.result.style.display = 'block'; el.empty.style.display = 'none'; }
    if(wasPro !== true) flash(el.licmsg, 'Pro is active on this browser.', 'ok');
  } else if(wasPro === true){
    hide(el.licmsg);
  }
  wasPro = pro;
}
function initLicense(){
  let saved = null;
  try { saved = localStorage.getItem(LS_KEY); } catch(e) {}
  if(saved){
    state.license = saved;
    el.license.value = saved;
    // silent re-check; network errors leave the local license in place
    verifyKey(saved).then(r=>{ if(!r.ok && /not valid|does not exist|invalid/i.test(r.message)){
      state.license = null;
      try { localStorage.removeItem(LS_KEY); } catch(e) {}
      updateProUI(); selectPreset(state.preset.id);
      flash(el.licmsg, 'The saved license is no longer valid. Enter a current key.', 'err');
    }});
  }
}

/* ============================== boot ============================== */
function boot(){
  initCountries();
  bindInputs();
  initLicense();
  selectPreset('us');
  if(isPro()) updateProUI();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* test hooks — used by the automated checks, harmless in production */
window.__ppc = {
  PRESETS, state, selectPreset, runChecks, verifyKey,
  pxSize, sheetGrid, bandStatus, computeAutoCrop, applyCrop, draw,
  exportSingle, exportSheet, sheetCanvas, isPro, doVerify, withJpegDpi,
  ready: () => !!(state.preset)
};
