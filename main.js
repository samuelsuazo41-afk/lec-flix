// main.js - Lec-Flix V14.3.0 FINAL UNIFICAT
// Inclou generarLlibre, mostrarLlibre, TOC, Exportar, Reset + 6 Pantalles

let BANCS = {};
let bancPlantillas = [];
let mod = null;
let histActual = null;
let llibreGenerat = null;

const baseURL = new URL('./', import.meta.url).href;

// ESTAT GLOBAL - Mateix objecte que el teu index
window.seleccio = {
  titol:'', genere:'policiac', estructura:'Save the Cat', ritme:'Novel·la', pov:'1 Protagonista',
  ciutatPrincipal:null, ciutatPrincipal2:null, subtubsPrincipal:[], subtubsPrincipal2:[],
  sinopsis:'', personatgeId:null,
  modo:'escena', totalCaps:12, escenesPerCap:3, numCap:1, numEsc:1,
  temps:{any:'2024',mes:'gener',dia:'1',event:''},
  beatsCap:['setup','giro1','midpoint','giro2','crisi','climax','resolucio'],
  plantillaId:null, prompt_master:''
};

// ========================================
// 1. INIT + CARREGA BANCS + MOTOR
// ========================================
async function initApp() {
  try {
    const bancMod = await import(baseURL + 'data/loadBancs.js?v=' + Date.now());
    BANCS = await bancMod.cargarBancs();
    bancPlantillas = BANCS.banc_plantillas || [];
    console.log('📚 Bancs V12.1.1 carregats:', Object.keys(BANCS), `${bancPlantillas.length}/34 plantilles`);

    mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
    console.log('✅ Motor Híbrid V1.0 carregat - generarLlibre disponible');
  } catch (e) {
    console.warn('Fallback bancs/motor', e);
    BANCS = {
      banco_ubicacion: [
        {ciutat:'Barcelona', subtubs:[{nom:'Gràcia'},{nom:'Barceloneta'},{nom:'Tibidabo'},{nom:'Gòtic'},{nom:'Eixample'}]},
        {ciutat:'Girona', subtubs:[{nom:'Pont de Pedra'},{nom:'Catedral'},{nom:'Call Jueu'}]},
        {ciutat:'Tarragona', subtubs:[{nom:'Amfiteatre'},{nom:'Part Alta'}]},
        {ciutat:'Figueres', subtubs:[{nom:'Museu Dalí'},{nom:'Centre'}]}
      ],
      banco_personatge: [{id:'p1', genero:'policiac', banco_variables:{nom:['Àlex','Rita','Marc'], tic:['es passa la mà per la barba','mira el rellotge','somriu']}}],
      banc_plantillas: []
    };
    mostrarError('Error carregant motor. Usa fallback.');
  }

  // Init listeners
  initBotons();
  console.log('✅ index.html V14.3.0 HÍBRID carregat - generarLlibre actiu');
}

// ========================================
// 2. NAVEGACIÓ - MATEIX QUE EL TEU INDEX
// ========================================
window.openScreen = function(screenName){
  document.getElementById('menu').style.display='none';
  document.getElementById('resultat').style.display='none';
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const screen = document.getElementById('screen-'+screenName);
  if(screen) screen.classList.add('active');

  if(screenName==='sinopsis'){
    document.getElementById('input-sinopsis').value = seleccio.sinopsis || '';
    renderPlantillaTabs();
  }
  if(screenName==='ubicacio') renderUbicacioList();
  if(screenName==='plantilla') renderGridPlantillas();
  if(screenName==='datos') renderVariablesGlobals();
  if(screenName==='biblioteca') renderBiblioteca();
  if(screenName==='info') renderInfoApp();
};

window.closeScreen = function(target='menu'){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  if(target==='lectura'){
    document.getElementById('menu').style.display='none';
    document.getElementById('screen-lectura').classList.add('active');
  } else {
    document.getElementById('menu').style.display='block';
    document.getElementById('resultat').style.display='block';
  }
};

// ========================================
// 3. SELECTORS INDEX - MATEIX CODI TEU
// ========================================
window.selectModo = modo=>{
  seleccio.modo = modo;
  document.querySelectorAll('.modo-btn').forEach(btn=>{
    btn.classList.remove('active');
    if(btn.dataset.modo === modo) btn.classList.add('active');
  });
  console.log('🎯 Modo:', modo);
};

window.saveSinopsis = ()=>{
  seleccio.sinopsis = document.getElementById('input-sinopsis').value.trim();
  document.getElementById('sinopsis-label').textContent = seleccio.sinopsis? '✓' : '▼';
  closeScreen();
}

window.selectEstructura = e=>{
  seleccio.estructura=e;
  document.getElementById('estructura-label').textContent=e;
  closeScreen();
}

window.selectRitme = r=>{
  seleccio.ritme=r;
  document.getElementById('ritme-label').textContent=r;
  if(r==='Relat Curt'){seleccio.totalCaps=5; seleccio.escenesPerCap=2;}
  if(r==='Novel·la'){seleccio.totalCaps=20; seleccio.escenesPerCap=3;}
  if(r==='Èpic'){seleccio.totalCaps=30; seleccio.escenesPerCap=4;}
  document.getElementById('input-caps').value = seleccio.totalCaps;
  document.getElementById('input-escenes').value = seleccio.escenesPerCap;
  closeScreen();
}

window.selectPov = p=>{
  seleccio.pov=p;
  document.getElementById('pov-label').textContent=p;
  closeScreen();
}

// ========================================
// 4. UBICACIÓ CP1 + CP2 - MATEIX CODI TEU
// ========================================
function renderUbicacioList(){
  const list = document.getElementById('ubicacio-list');
  const ciutats = BANCS.banco_ubicacion || [];
  list.innerHTML = ciutats.map(c=>{
    let tags = [];
    if(c.ciutat === seleccio.ciutatPrincipal) tags.push('CP1');
    if(c.ciutat === seleccio.ciutatPrincipal2) tags.push('CP2');
    const label = tags.length > 0? `${c.ciutat} (${tags.join(', ')})` : c.ciutat;
    return `<button class="opt-btn" onclick="selectCiutatHub('${c.ciutat}')">${label}</button>`;
  }).join('');
  renderInlineSubtabs();
}

function renderInlineSubtabs(){
  const inline = document.getElementById('inline-subtabs');
  if(seleccio.ciutatPrincipal || seleccio.ciutatPrincipal2){
    inline.style.display='block';
    document.getElementById('cp1-nom').textContent = seleccio.ciutatPrincipal || '-';
    document.getElementById('cp2-nom').textContent = seleccio.ciutatPrincipal2 || '-';
    document.getElementById('cp1-clear').style.display = seleccio.ciutatPrincipal? 'block':'none';
    document.getElementById('cp2-clear').style.display = seleccio.ciutatPrincipal2? 'block':'none';
  } else {
    inline.style.display='none';
  }
}

window.selectCiutatHub = ciutat=>{
  if(!seleccio.ciutatPrincipal){
    seleccio.ciutatPrincipal = ciutat;
  } else if(!seleccio.ciutatPrincipal2 && ciutat!== seleccio.ciutatPrincipal){
    seleccio.ciutatPrincipal2 = ciutat;
  } else {
    seleccio.ciutatPrincipal2 = ciutat;
  }
  document.getElementById('ubicacio-label').textContent = seleccio.ciutatPrincipal || '▼';
  renderUbicacioList();
}

window.clearCP = num=>{
  if(num===1){
    seleccio.ciutatPrincipal = null;
    seleccio.subtubsPrincipal = [];
  } else {
    seleccio.ciutatPrincipal2 = null;
    seleccio.subtubsPrincipal2 = [];
  }
  document.getElementById('ubicacio-label').textContent = seleccio.ciutatPrincipal || '▼';
  renderUbicacioList();
}

// ========================================
// 5. PLANTILLES SINOPSI + BOTÓ 3 PLANTILLA 34
// ========================================
function renderPlantillaTabs(){
  const container = document.getElementById('plantilla-tabs');
  const plantilles = window.PLANTILLES_SINOPSI || {
    'Cas Clàssic':'Un detectiu a {ciutat} investiga un cas que sembla rutinari fins que {event} ho canvia tot.',
    'Venjança':'A {ciutat}, {p0} busca justícia per {event} mentre {p1} intenta aturar-lo.',
    'Conspiració':'{p0} descobreix una trama que connecta {ciutat} amb {event}. Ningú és qui diu ser.'
  };
  const noms = Object.keys(plantilles);
  container.innerHTML = noms.map(nom=>
    `<div class="plantilla-tab" onclick="loadPlantilla('${nom}')">${nom}</div>`
  ).join('') + `<div class="plantilla-tab" onclick="openScreen('plantilla')">+34 més</div>`;
}

window.loadPlantilla = nom=>{
  const plantilles = window.PLANTILLES_SINOPSI || {};
  const textarea = document.getElementById('input-sinopsis');
  textarea.value = plantilles[nom] || '';
  document.querySelectorAll('.plantilla-tab').forEach(tab=>{
    tab.classList.remove('active');
    if(tab.textContent === nom) tab.classList.add('active');
  });
}

function renderGridPlantillas() {
  const grid = document.getElementById('grid-plantillas-34');
  if (!grid ||!bancPlantillas.length) return;

  grid.innerHTML = bancPlantillas.map(p => `
    <div class="card-plantilla" onclick="verDetallePlantilla('${p.id}')">
      <h3>[${p.id}] ${p.nom}</h3>
      <p><strong>Caps:</strong> ${p.caps} | <strong>Climax:</strong> ${p.climax}</p>
      <p><strong>Ratio:</strong> ${p.ratio}</p>
      <button onclick="event.stopPropagation(); usarPlantilla('${p.id}')">Usar</button>
    </div>
  `).join('');
}

function verDetallePlantilla(id) {
  const p = bancPlantillas.find(x => x.id === id);
  document.getElementById('det-id').textContent = p.id;
  document.getElementById('det-nom').textContent = p.nom;
  document.getElementById('det-prompt').textContent = p.prompt_master;
  document.getElementById('grid-plantillas-34').style.display = 'none';
  document.getElementById('pantalla-plantilla-detalle').style.display = 'block';
}

window.usarPlantilla = function(id) {
  const p = bancPlantillas.find(x => x.id === id);
  seleccio.plantillaId = id;
  seleccio.totalCaps = p.caps;
  seleccio.prompt_master = p.prompt_master;
  document.getElementById('input-caps').value = p.caps;
  closeScreen();
  openScreen('generar');
}

// ========================================
// 6. BOTÓ GENERAR - EL TEU BLOC SENCER
// ========================================
async function generarLlibre() {
  if(!seleccio.ciutatPrincipal){
    mostrarError('Selecciona Ciutat Principal 1 primer');
    return;
  }
  if(!mod ||!mod.generarLlibre){
    mostrarError('Error: Motor no cargado. Recarga la página.');
    return;
  }

  const btn = document.getElementById('btn-generar');
  btn.disabled = true;
  const modoTxt = seleccio.modo === 'escena'? 'Escena' : seleccio.modo === 'capitol'? 'Capítol' : 'Llibre';
  document.getElementById('resultat').innerHTML = `<p style="text-align:center">Generant ${modoTxt} ${seleccio.ritme}...</p>`;

  try{
    const config = {
    ...seleccio,
      nom: BANCS.banco_personatge?.[0]?.banco_variables?.nom?.[0] || 'Rita',
      nom2: BANCS.banco_personatge?.[0]?.banco_variables?.nom?.[1] || 'Víctor',
      tic: BANCS.banco_personatge?.[0]?.banco_variables?.tic?.[0] || 'es passa la mà per la barba',
      ciutat_1: seleccio.ciutatPrincipal,
      ciutat_2: seleccio.ciutatPrincipal2,
      ciutat_3: 'Madrid',
      paraulesObjectiu: seleccio.modo === 'escena'? 500 : seleccio.modo === 'capitol'? 1500 : 0
    };

    // RESET si es libro completo
    if(config.modo === 'llibre'){
      await mod.resetEstructura();
      histActual = null;
    }

    // LLAMADA HÍBRIDA: generarLlibre decide según config.modo
    const resultado = await mod.generarLlibre(
      config, BANCS, histActual, seleccio.numCap, seleccio.numEsc, seleccio.totalCaps
    );

    // Actualizar hist para siguiente generación
    histActual = resultado.hist;

    // Adaptar resultado según modo
    if(config.modo === 'escena'){
      llibreGenerat = {
        capitols:[{
          num:seleccio.numCap,
          beat:resultado.metadata.beat,
          escenes:[{titol:`Cap ${seleccio.numCap} - Esc ${seleccio.numEsc}`,text:resultado.text}]
        }],
        metadata:{paraulesAprox:resultado.metadata.paraules,nCapitols:1}
      };
    } else if(config.modo === 'capitol'){
      const escenes = resultado.text.split('\n\n').map((t,i)=>({ titol:`Escena ${i+1}`, text:t }));
      llibreGenerat = {
        capitols:[{num:seleccio.numCap,beat:'capitol',escenes}],
        metadata:{paraulesAprox:resultado.metadata.paraules,nCapitols:1}
      };
    } else {
      // Libro completo
      llibreGenerat = resultado;
    }

    mostrarLlibre(llibreGenerat);

  }catch(err){
    console.error(err);
    mostrarError(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
  }
}

// ========================================
// 7. PREVIEW + MOSTRAR LLIBRE - EL TEU CODI
// ========================================
function mostrarPreview() {
  if(!llibreGenerat) return mostrarError('Primer prem Generar Text');
  mostrarLlibre(llibreGenerat);
}

function mostrarLlibre(llibre){
  const div = document.getElementById('lectura-content');
  div.innerHTML = '';
  llibre.capitols.forEach(cap=>{
    const capDiv = document.createElement('div');
    capDiv.innerHTML = `<h2 style="color:var(--accent);margin:24px 0 12px">CAPÍTOL ${cap.num} - ${cap.beat?.toUpperCase() || ''}</h2>`;
    cap.escenes.forEach((esc,idx)=>{
      const el = document.createElement('div');
      el.innerHTML = `<h3 style="color:var(--text-muted);font-size:14px;margin:16px 0 8px">${esc.titol || `Escena ${idx+1}`}</h3><p style="line-height:1.8">${esc.text}</p>`;
      capDiv.appendChild(el);
    });
    capDiv.innerHTML += `<hr style="margin:32px 0;border:none;border-top:2px solid var(--border)">`;
    div.appendChild(capDiv);
  });

  document.getElementById('resultat').innerHTML = `<p style="text-align:center;color:var(--accent)">✅ Generat: ${llibre.metadata.paraulesAprox} paraules - ${llibre.metadata.nCapitols} capítols</p>`;
  document.getElementById('menu').style.display='none';
  document.getElementById('screen-lectura').classList.add('active');

  guardarBiblioteca();
}

// ========================================
// 8. TOC + SCROLL - EL TEU CODI
// ========================================
window.scrollToCap = num=>{
  const els = document.querySelectorAll('#lectura-content h2');
  if(els[num-1]) els[num-1].scrollIntoView({behavior:'smooth'});
  document.getElementById('toc-container').classList.add('toc-hidden');
};

// ========================================
// 9. EXPORTAR + RESET - EL TEU CODI
// ========================================
function exportarTxt() {
  if(!llibreGenerat) return mostrarError('Primer prem Generar Text');
  const text = llibreGenerat.capitols.map(c=>`CAPÍTOL ${c.num} - ${c.beat}\n\n`+c.escenes.map(e=>`${e.titol}\n${e.text}\n\n`).join('')).join('\n---\n\n');
  const blob = new Blob([text],{type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;
  a.download=(seleccio.titol||'lec-flix')+'_'+seleccio.modo+'.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function resetearHist() {
  if(!mod) return;
  await mod.resetEstructura();
  histActual = null;
  llibreGenerat = null;
  document.getElementById('resultat').innerHTML = '<p style="color:var(--text-muted);text-align:center">Estructura resetejada. Llest per generar.</p>';
  console.log('🔄 Reset complet');
}

// ========================================
// 10. DADES + BIBLIOTECA + INFO
// ========================================
function renderVariablesGlobals() {
  const container = document.getElementById('lista-variables');
  container.innerHTML = `
    <input id="var-ciutat1" placeholder="Ciutat 1" value="${seleccio.ciutatPrincipal||''}">
    <input id="var-ciutat2" placeholder="Ciutat 2" value="${seleccio.ciutatPrincipal2||''}">
    <input id="var-prota" placeholder="Protagonista" value="${seleccio.nom||'Rita'}">
    <button onclick="guardarVariables()">Guardar Variables</button>
  `;
}

function guardarVariables() {
  seleccio.ciutatPrincipal = document.getElementById('var-ciutat1').value;
  seleccio.ciutatPrincipal2 = document.getElementById('var-ciutat2').value;
  alert('Variables guardades');
  closeScreen();
}

function guardarBiblioteca() {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  llibres.unshift({
    id: Date.now(),
    plantilla: seleccio.plantillaId,
    titol: seleccio.titol,
    data: new Date().toLocaleString(),
    preview: document.getElementById('lectura-content').textContent.substring(0,150)
  });
  localStorage.setItem('biblioteca_lec_flix', JSON.stringify(llibres.slice(0,20)));
}

function renderBiblioteca() {
  const container = document.getElementById('lista-biblioteca');
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  container.innerHTML = llibres.length? llibres.map(l => `
    <div class="item-biblioteca">
      <h4>[${l.plantilla}] ${l.titol || 'Sense títol'}</h4>
      <p>${l.data}</p>
      <p>${l.preview}...</p>
    </div>
  `).join('') : '<p>No tens llibres guardats</p>';
}

function renderInfoApp() {
  document.getElementById('info-version').textContent = 'V14.3.0 FINAL';
  document.getElementById('info-plantilles').textContent = `${bancPlantillas.length}/34 carregades`;
}

// ========================================
// 11. INIT BOTONS + SERVICE WORKER
// ========================================
function initBotons() {
  document.getElementById('btn-generar')?.addEventListener('click', generarLlibre);
  document.getElementById('btn-preview')?.addEventListener('click', mostrarPreview);
  document.getElementById('btn-exportar')?.addEventListener('click', exportarTxt);
  document.getElementById('btn-reset')?.addEventListener('click', resetearHist);

  document.getElementById('btn-toc-toggle')?.addEventListener('click', ()=>{
    if(!llibreGenerat) return mostrarError('Primer prem Generar Text');
    const toc = document.getElementById('toc-container');
    const content = document.getElementById('toc-content');
    if(toc.classList.contains('toc-hidden')){
      content.innerHTML = llibreGenerat.capitols.map(c=>
        `<div class="toc-item" onclick="scrollToCap(${c.num})">
          <div class="toc-capitol">Capítol ${c.num} - ${c.beat}</div>
          <div class="toc-escenes">${c.escenes.length} escenes</div>
        </div>`
      ).join('');
    }
    toc.classList.toggle('toc-hidden');
  });
}

// Service Worker
if('serviceWorker' in navigator) navigator.serviceWorker.register(baseURL+'sw.js');

// INIT
document.addEventListener('DOMContentLoaded', initApp);