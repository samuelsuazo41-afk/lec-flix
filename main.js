// ======================================== main.js V14.3.4 QUADRAT ========================================
// Lec-Flix V14.3.4 - 10 Pantalles + Prompt Masters + Rutes Arrel
// PINÇA: Fitxer net, sense duplicats, ordre correcte

// ======================================== VARIABLES GLOBALS ÚNIQUES ========================================
let BANCS = {};
let mod = null;
let histActual = null;
let llibreGenerat = null;

// PINÇA: Ruta arrel per evitar Failed to fetch /data/
const baseURL = new URL('./', import.meta.url).href;

const seleccio = {
  genere: 'policiac', // PINÇA: id del banc, no nom
  subgenere: null,
  plantillaId: null,
  prompt_master: '',
  variables: {},
  idioma: 'CAT',
  modo: 'llibre',
  titol: 'lec-flix',
  totalCaps: 12
};

// PINÇA: PROMPT MASTERS HARDCODEJATS PERQUÈ SEMPRE SURTIN
const PROMPT_MASTERS = [
  {
    id: 'PM1',
    titol: 'Thriller Serial 14 Caps - Paranoia David Ferrer',
    descripcio: 'Prompt per thriller serial amb 3 víctimes + mentor. Multilocalitat Vic-Manresa-Solsona.',
    tip: 'Plantilla 4: Thriller Serial 14 Caps | Plantilla 7: Paranoia 3 Actes',
    prompt: `Ets escriptor thriller serial bestseller. Genera SINOPSI 14 capítols paranoia escala + cliffhangers... VARIABLES JA OMPLERTES: PROFILADOR: David Ferrer, 41 anys traumat...`
  },
  {
    id: 'PM2',
    titol: 'Romàntica 12 Caps - Slow Burn',
    descripcio: 'Prompt per romàntica slow burn. 12 caps beats trope enemies-to-lovers.',
    tip: 'Plantilla 12: Romàntica Slow Burn 12 Caps',
    prompt: `Ets escriptor romàntica bestseller. Genera SINOPSI 12 capítols slow burn... VARIABLES: {{prota}}, {{love_interest}}`
  },
  {
    id: 'PM3',
    titol: 'Suspens Psicològic 10 Caps',
    descripcio: 'Prompt narrador no fiable. Paranoia creixent, gir cap 8.',
    tip: 'Plantilla 8: Suspens Psicològic 10 Caps',
    prompt: `Ets escriptor suspens psicològic. Genera SINOPSI 10 capítols paranoia... VARIABLES: {{prota}}, {{dubte}}`
  },
  {
    id: 'PM4',
    titol: 'Històrica 15 Caps - Segle XIX',
    descripcio: 'Prompt novel·la històrica segle XIX amb context real.',
    tip: 'Plantilla 18: Històrica Segle XIX 15 Caps',
    prompt: `Ets escriptor històric. Genera SINOPSI 15 capítols segle XIX... VARIABLES: {{prota}}, {{any}}`
  }
];

// PINÇA DEBUG: Veure errors JS al mòbil
window.addEventListener('error', e => {
  console.error('ERROR MAIN.JS:', e.message, 'Línia:', e.lineno);
  alert('ERROR Línia ' + e.lineno + ': ' + e.message);
});

// ======================================== 1. SPLASH → MENÚ ========================================
window.entrarApp = () => {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-menu').classList.add('active');
};

// ======================================== 2. MENÚ PRINCIPAL - 7 BOTONS ========================================
window.openScreen = function(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  if (screen === 'generar') renderPasosGenerar();
  if (screen === 'sinopsi') renderSinopsi();
  if (screen === 'promptmasters') renderPromptMasters();
  if (screen === 'plantillas') renderBancoPlantillas();
  if (screen === 'dades') renderDadesVariables();
  if (screen === 'biblioteca') renderBiblioteca();
  if (screen === 'info') renderInfo();
};
window.closeScreen = () => openScreen('menu');

// ======================================== 3. PANTALLA GENERAR LLIBRE - 4 PASOS ========================================
function renderPasosGenerar() {
  const genDiv = document.getElementById('pas1-generes');
  const generesActius = (BANCS.banco_generos || []).filter(g => g.activo === true);
  if (generesActius.length === 0) {
    genDiv.innerHTML = `<button class="gen-btn" onclick="selectGenere('policiac','Policial')">Policial</button>`;
    selectGenere('policiac','Policial');
    renderPlantillesFiltre();
    return;
  }
  genDiv.innerHTML = generesActius.map(g =>
    `<button class="gen-btn" onclick="selectGenere('${g.id}','${g.nombre}')">${g.nombre}</button>`
  ).join('');
  selectGenere(generesActius[0].id, generesActius[0].nombre);
  renderPlantillesFiltre();
}

window.selectGenere = (id, nombre) => {
  seleccio.genere = id; // PINÇA CRÍTICA: guardem id "policiac"
  document.querySelectorAll('.gen-btn').forEach(b =>
    b.classList.toggle('active', b.textContent === nombre)
  );
  const plantillesGenere = BANCS.banco_plantillas?.filter(p => p.genere === seleccio.genere) || [];
  if (plantillesGenere.length > 0) {
    const noms = plantillesGenere.map(p => `${p.nom} [${p.caps} caps]`).slice(0,5).join('\n• ');
    alert(`📚 GÈNERE ${nombre.toUpperCase()}\n\nPlantilles: ${plantillesGenere.length}\n\n• ${noms}\n\nSelecciona una al PAS 2.`);
  } else {
    alert(`⚠️ Gènere ${nombre}: 0 plantilles amb genere:"${id}"\nRevisa banc_plantillas.json`);
  }
  renderPlantillesFiltre();
};

function renderPlantillesFiltre() {
  const grid = document.getElementById('pas2-plantilles');
  const plantilles = BANCS.banco_plantillas?.filter(p => p.genere === seleccio.genere ||!p.genere) || [];
  grid.innerHTML = plantilles.map(p => `
    <div class="card-34" onclick="selectPlantilla('${p.id}')">
      <h3>[${p.id}] ${p.nom}</h3>
      <p>${p.caps} caps | Climax: ${p.climax}</p>
    </div>
  `).join('');
}

window.selectPlantilla = id => {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  seleccio.plantillaId = id;
  seleccio.prompt_master = p.prompt_master;
  seleccio.subgenere = p.nom;
  seleccio.totalCaps = p.caps || 12;
  renderVariablesForm(p.variables || ['ciutat_1','ciutat_2','prota','antagonista','tic']);
};

function renderVariablesForm(vars) {
  const div = document.getElementById('pas3-variables');
  div.innerHTML = vars.map(v => `
    <label>{{${v}}}</label>
    <input id="var-${v}" placeholder="${v}">
  `).join('');
}

window.setIdioma = lang => {
  seleccio.idioma = lang;
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === lang)
  );
};

window.generarLlibre = async () => {
  if (!seleccio.plantillaId) return alert('Selecciona plantilla primer');
  document.querySelectorAll('#pas3-variables input').forEach(inp => {
    const key = inp.id.replace('var-','');
    seleccio.variables[key] = inp.value || inp.placeholder;
  });
  showProgress(0);
  const btn = document.getElementById('btn-generar');
  btn.disabled = true;
  try {
    if (!mod) {
      mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
    }
    const config = {...seleccio, modo: 'llibre', escenesPerCap: 3};
    const resultado = await mod.generarLlibre(config, BANCS, null, 1, 1, seleccio.totalCaps);
    llibreGenerat = resultado;
    guardarBiblioteca(resultado);
    showProgress(100);
    setTimeout(() => openScreen('lectura'), 500);
    mostrarLecturaFinal(resultado);
  } catch(e) {
    alert('Error: ' + e.message);
    console.error(e);
  } finally {
    btn.disabled = false;
  }
};

function showProgress(p) {
  document.getElementById('progress-bar').style.width = p + '%';
  document.getElementById('progress-text').textContent = p + '%';
}

// ======================================== 4. SINOPSI PROMPTS ========================================
function renderSinopsi() {
  const selector = document.getElementById('sinopsi-selector');
  const plantilles = BANCS.banco_plantillas || [];
  selector.innerHTML = `<option value="">-- Veure Prompt Masters --</option>` +
    plantilles.map(p => `<option value="${p.id}">[${p.id}] ${p.nom} - ${p.caps} caps</option>`).join('');
  selector.onchange = e => {
    if (!e.target.value) {
      openScreen('promptmasters');
    } else {
      carregarPromptMaster(e.target.value);
    }
  };
  if (plantilles.length) carregarPromptMaster(plantilles[0].id);
}

function carregarPromptMaster(id) {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  if (!p) return;
  const box = document.getElementById('prompt-master-box');
  if (!box.value.trim()) {
    box.value = p.prompt_master || '// Aquesta plantilla no té prompt_master';
  }
}

window.guardarSinopsi = () => {
  const text = document.getElementById('prompt-master-box').value;
  if (!text.trim()) return alert('El textarea està buit');
  localStorage.setItem('sinopsi_guardada', text);
  alert('✅ Sinopsi guardada! Ara pots copiar-la quan vulguis');
};

// ======================================== 5B. PROMPT MASTERS ========================================
function renderPromptMasters() {
  const grid = document.getElementById('grid-prompts');
  grid.innerHTML = PROMPT_MASTERS.map(pm => `
    <div class="card-34" style="border-color:var(--accent);margin-bottom:20px">
      <h3>${pm.titol}</h3>
      <p style="color:var(--text-muted);font-size:12px;margin:8px 0 12px">${pm.descripcio}</p>
      <p style="font-size:11px;color:var(--accent);margin-bottom:6px">📋 PROMPT PER COPIAR:</p>
      <textarea readonly style="min-height:180px;font-size:11px;font-family:'Courier New',monospace;background:var(--bg);line-height:1.4">${pm.prompt}</textarea>
      <button onclick="navigator.clipboard.writeText(\`${pm.prompt.replace(/`/g, '\\`')}\`);alert('✅ Prompt ${pm.id} copiat!')">📋 COPIAR PROMPT</button>
      <p style="font-size:11px;background:var(--bg-panel);padding:8px;border-radius:4px;margin-top:8px">🎯 <strong>Tip:</strong> ${pm.tip}</p>
    </div>
  `).join('');
}

// ======================================== 5. BANCO 34 PLANTILLAS ========================================
function renderBancoPlantillas() {
  const grid = document.getElementById('grid-34');
  const plantilles = BANCS.banco_plantillas || [];
  if (!plantilles.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Carregant plantilles... Si surt 0/34 revisa que generarllibre.js estigui a l\'arrel</p>';
    return;
  }
  grid.innerHTML = plantilles.map(p => `
    <div class="card-34" onclick="verDetallePlantilla('${p.id}')">
      <h3>[${p.id}] ${p.nom}</h3>
      <p>${p.caps} caps | ${p.climax}</p>
      <p>${p.ratio || ''}</p>
      <button>VEURE DETALL + PROMPT</button>
    </div>
  `).join('');
}

window.verDetallePlantilla = id => {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  document.getElementById('det-nom').textContent = p.nom;
  document.getElementById('det-nom').dataset.id = p.id;
  document.getElementById('det-climax').textContent = p.climax;
  document.getElementById('det-ratio').textContent = p.ratio || '';
  document.getElementById('det-variables').textContent = JSON.stringify(p.variables || [], null, 2);
  document.getElementById('det-prompt').value = p.prompt_master || '// Sense prompt_master';
  document.getElementById('grid-34').style.display = 'none';
  document.getElementById('detalle-plantilla').style.display = 'block';
};

window.usarPerGenerar = id => {
  selectPlantilla(id);
  openScreen('generar');
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-usar-plantilla')?.addEventListener('click', () => {
    const id = document.getElementById('det-nom').dataset.id;
    usarPerGenerar(id);
  });
});

// ======================================== 6. DADES I VARIABLES ========================================
function renderDadesVariables() {
  const div = document.getElementById('info-dades-lista');
  const total = BANCS.banco_plantillas?.length || 0;
  const ciutats = BANCS.banco_ubicacion?.map(c => c.ciutat).join(', ') || 'Cap';
  const mitja = total > 0? (BANCS.banco_plantillas.reduce((a,b) => a + (b.caps||12), 0) / total).toFixed(1) : 0;
  div.innerHTML = `
    <p><strong>Total plantilles:</strong> ${total}/34</p>
    <p><strong>Caps mitja:</strong> ${mitja}</p>
    <p><strong>Ciutats al banc:</strong> ${ciutats}</p>
    <p><strong>Olors registrades:</strong> ${BANCS.banco_olors?.length || 0}</p>
    <p><strong>Sons registrats:</strong> ${BANCS.banco_sons?.length || 0}</p>
    <p><strong>Emocions registrades:</strong> ${BANCS.banco_emocions?.length || 0}</p>
    <hr style="margin:16px 0;border:none;border-top:1px solid var(--border)">
    <p style="font-size:12px;color:var(--text-muted)">Aquesta pantalla és només informació. Per omplir variables usa PAS 3 de Generar Llibre.</p>
  `;
}

// ======================================== 7. BIBLIOTECA ========================================
function guardarBiblioteca(llibre) {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  llibres.unshift({
    id: Date.now(),
    titol: seleccio.titol || seleccio.variables.prota || 'Sense títol',
    plantilla: seleccio.plantillaId,
    data: new Date().toLocaleString('ca-ES'),
    caps: llibre.capitols.length,
    content: llibre
  });
  localStorage.setItem('biblioteca_lec_flix', JSON.stringify(llibres.slice(0, 20)));
}

function renderBiblioteca() {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  const div = document.getElementById('lista-llibres');
  div.innerHTML = llibres.length? llibres.map(l => `
    <div class="card-34">
      <h3>${l.titol}</h3>
      <p>[${l.plantilla}] ${l.data} | ${l.caps} caps</p>
      <button onclick="llegirLlibre(${l.id})">LLEGIR</button>
      <button onclick="eliminarLlibre(${l.id})" style="background:var(--danger)">ELIMINAR</button>
    </div>
  `).join('') : '<p style="text-align:center;color:var(--text-muted)">No tens llibres guardats</p>';
}

window.llegirLlibre = id => {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  const l = llibres.find(x => x.id === id);
  if (l) {
    llibreGenerat = l.content;
    openScreen('lectura');
    mostrarLecturaFinal(l.content);
  }
};

window.eliminarLlibre = id => {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  const filtrats = llibres.filter(x => x.id!== id);
  localStorage.setItem('biblioteca_lec_flix', JSON.stringify(filtrats));
  renderBiblioteca();
};

// ======================================== 8. INFO APP ========================================
function renderInfo() {
  document.getElementById('info-versio').textContent = 'V14.3.4';
  document.getElementById('info-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  document.getElementById('info-motor').textContent = mod? 'GPT-4 / Claude Ready' : 'Desconnectat';
  const ciutats = BANCS.banco_ubicacion?.map(c => `<strong>${c.ciutat}</strong>: ${c.subtubs?.map(s=>s.nom).join(', ')}`).join('<br>') || 'Cap carregada';
  const olors = BANCS.banco_olors?.map(o => o.texto_base).slice(0,5).join(', ') || 'Cap';
  const sons = BANCS.banco_sons?.map(s => s.texto_base).slice(0,5).join(', ') || 'Cap';
  const emocions = BANCS.banco_emocions?.map(e => e.texto_base).slice(0,5).join(', ') || 'Cap';
  const infoDiv = document.getElementById('info-bancs-lista');
  if (infoDiv) {
    infoDiv.innerHTML = `
      <h4 style="color:var(--accent)">📍 GLOSARI COMPLET CIUTATS I ZONES:</h4>
      <p style="font-size:12px;line-height:1.8">${ciutats}</p>
      <h4 style="color:var(--accent);margin-top:16px">👃 OLORES:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${olors}...</p>
      <h4 style="color:var(--accent);margin-top:16px">🔊 SONS:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${sons}...</p>
      <h4 style="color:var(--accent);margin-top:16px">😰 EMOCIONS:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${emocions}...</p>
    `;
  }
}

// ======================================== 9. LECTURA FINAL + EXPORTAR ========================================
function mostrarLecturaFinal(llibre) {
  const index = document.getElementById('index-lectura');
  index.innerHTML = llibre.capitols.map(c => `
    <div class="card-34" onclick="llegirCap(${c.num})">
      <h3>Cap ${c.num}: ${c.titol || 'Sense títol'}</h3>
      <p>${c.resum?.substring(0,120)}...</p>
    </div>
  `).join('');
  if (llibre.capitols.length) llegirCap(1);
}

window.llegirCap = num => {
  const cap = llibreGenerat?.capitols.find(c => c.num === num);
  if (!cap) return;
  document.getElementById('text-lectura').innerHTML = `<h2>CAPÍTOL ${cap.num}: ${cap.titol}</h2>` +
    cap.escenes.map(e => `<h4>${e.titol}</h4><p>${e.text}</p>`).join('');
};

window.exportarTxt = () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  const text = llibreGenerat.capitols.map(c =>
    `CAPÍTOL ${c.num} - ${c.titol}\n\n` +
    c.escenes.map(e => `${e.titol}\n${e.text}\n\n`).join('')
  ).join('\n---\n\n');
  const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (seleccio.titol || 'lec-flix') + '.txt';
  a.click();
  URL.revokeObjectURL(url);
};

window.exportarEpub = () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  alert('Exportar EPUB: Pendent implementar epub.js');
};

window.exportarPDF = () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  window.print();
};

window.compartirLlibre = async () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  const text = `Llegeix "${seleccio.titol}" generat amb Lec-Flix V14.3.4`;
  if (navigator.share) {
    await navigator.share({title: seleccio.titol, text: text});
  } else {
    navigator.clipboard.writeText(text);
    alert('Text copiat al porta-retalls!');
  }
};

window.resetApp = () => {
  if (confirm('Esborrar selecció i tornar a començar?')) {
    llibreGenerat = null;
    histActual = null;
    seleccio.variables = {};
    openScreen('generar');
  }
};

// ======================================== 11. INIT + CONNECTAR BOTONS ========================================
async function initApp() {
  try {
    const bancMod = await import(baseURL + 'loadBancs.js?v=' + Date.now());
    BANCS = await bancMod.cargarBancs();
    if (!BANCS.banco_generos || BANCS.banco_generos.length === 0) {
      try {
        const res = await fetch(baseURL + 'banco_generos.json?v=' + Date.now());
        const data = await res.json();
        BANCS.banco_generos = data.banco_generos || [];
      } catch(e) {
        console.warn('No es va trobar banco_generos.json, fallback Policial');
        BANCS.banco_generos = [{id:'policiac', nombre:'Policial', activo:true}];
      }
    }
    mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
    console.log('✅ V14.3.4 PINÇA TOT carregat - 10 pantalles + Prompt Masters');
    document.getElementById('btn-exportar-txt')?.addEventListener('click', exportarTxt);
    document.getElementById('btn-exportar-epub')?.addEventListener('click', exportarEpub);
    document.getElementById('btn-exportar-pdf')?.addEventListener('click', exportarPDF);
    document.getElementById('btn-compartir')?.addEventListener('click', compartirLlibre);
    document.getElementById('btn-reset')?.addEventListener('click', resetApp);
    document.getElementById('btn-llegir-cap1')?.addEventListener('click', () => llegirCap(1));
    document.getElementById('btn-generar-altre')?.addEventListener('click', () => openScreen('generar'));
    document.getElementById('btn-neteja-biblioteca')?.addEventListener('click', () => {
      if (confirm('Esborrar tota la biblioteca?')) {
        localStorage.removeItem('biblioteca_lec_flix');
        renderBiblioteca();
      }
    });
  } catch(e) {
    console.error('Error init:', e);
    alert('Error carregant bancs: ' + e.message + '\n\nSolució: Mou generarllibre.js, loadBancs.js i banco_generos.json a l\'arrel del repo GitHub');
  }
}

document.addEventListener('DOMContentLoaded', initApp);