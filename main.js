// main.js - Lec-Flix V14.3.1 DIAGRAMA + EXPORTAR + PINÇA CAPTURES
// 9 Pantalles + Botons Exportar + Sinopsi Editable + Dades Info

let BANCS = {};
let mod = null;
let histActual = null;
let llibreGenerat = null;

// PINÇA CAPTURE 1: Ruta arrel, no /data/ per evitar "Failed to fetch"
const baseURL = new URL('./', import.meta.url).href;

const seleccio = {
  genere: 'policial',
  subgenere: null,
  plantillaId: null,
  prompt_master: '',
  variables: {},
  idioma: 'CAT',
  modo: 'llibre',
  titol: 'lec-flix',
  totalCaps: 12
};

// ========================================
// 1. SPLASH → MENÚ
// ========================================
window.entrarApp = () => {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-menu').classList.add('active');
};

// ========================================
// 2. MENÚ PRINCIPAL - 6 BOTONS + ACCIONS
// ========================================
window.openScreen = function(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');

  if (screen === 'generar') renderPasosGenerar();
  if (screen === 'sinopsi') renderSinopsi(); // PINÇA: ara editable
  if (screen === 'plantillas') renderBancoPlantillas();
  if (screen === 'dades') renderDadesVariables(); // PINÇA: ara només info
  if (screen === 'biblioteca') renderBiblioteca();
  if (screen === 'info') renderInfo();
};

window.closeScreen = () => openScreen('menu');

// ========================================
// 3. PANTALLA GENERAR LLIBRE - 4 PASOS
// ========================================
function renderPasosGenerar() {
  const genDiv = document.getElementById('pas1-generes');
  const generes = ['Policial', 'Romàntica', 'Suspens', 'Històrica', 'Ciència Ficció'];
  genDiv.innerHTML = generes.map(g =>
    `<button class="gen-btn" onclick="selectGenere('${g}')">${g}</button>`
  ).join('');
  renderPlantillesFiltre();
}

window.selectGenere = g => {
  seleccio.genere = g.toLowerCase();
  document.querySelectorAll('.gen-btn').forEach(b =>
    b.classList.toggle('active', b.textContent === g)
  );
  renderPlantillesFiltre();
};

function renderPlantillesFiltre() {
  const grid = document.getElementById('pas2-plantilles');
  const plantilles = BANCS.banco_plantillas?.filter(p =>
    p.genere === seleccio.genere ||!p.genere
  ) || [];

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

// ========================================
// 4. SINOPSI PROMPTS - PINÇA CAPTURE 3: EDITABLE PER ENGANXAR
// ========================================
function renderSinopsi() {
  const selector = document.getElementById('sinopsi-selector');
  const plantilles = BANCS.banco_plantillas || [];

  selector.innerHTML = plantilles.map(p =>
    `<option value="${p.id}">[${p.id}] ${p.nom} - ${p.caps} caps</option>`
  ).join('');

  selector.onchange = e => carregarPromptMaster(e.target.value);
  if (plantilles.length) carregarPromptMaster(plantilles[0].id);
}

// PINÇA: Només carrega si textarea està buit. Així pots enganxar el teu prompt David Ferrer
function carregarPromptMaster(id) {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  if (!p) return;
  const box = document.getElementById('prompt-master-box');
  if (!box.value.trim()) {
    box.value = p.prompt_master || '// Aquesta plantilla no té prompt_master';
  }
}

window.copiarPromptMaster = () => {
  const text = document.getElementById('prompt-master-box').value;
  if (!text.trim()) return alert('El textarea està buit');
  navigator.clipboard.writeText(text);
  alert('✅ Prompt Master copiat! Enganxa a ChatGPT/Claude/Gemini');
};

// ========================================
// 5. BANCO 34 PLANTILLAS - GRID + DETALL AMB PROMPT
// ========================================
function renderBancoPlantillas() {
  const grid = document.getElementById('grid-34');
  const plantilles = BANCS.banco_plantillas || [];

  if (!plantilles.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Carregant plantilles... Si surt 0/34 revisa que generarllibre.js estigui a l\'arrel del repo</p>';
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
  // PINÇA CAPTURE 5: Mostra prompt_master complet amb scroll
  document.getElementById('det-prompt').value = p.prompt_master || '// Sense prompt_master en aquesta plantilla';
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

// ========================================
// 6. DADES I VARIABLES - PINÇA CAPTURE 2: NOMÉS INFORMACIÓ
// ========================================
function renderDadesVariables() {
  const div = document.getElementById('info-dades-lista');
  const total = BANCS.banco_plantillas?.length || 0;
  const ciutats = BANCS.banco_ubicacion?.map(c => c.ciutat).join(', ') || 'Cap';
  const mitja = total > 0
   ? (BANCS.banco_plantillas.reduce((a,b) => a + (b.caps||12), 0) / total).toFixed(1)
    : 0;

  div.innerHTML = `
    <p><strong>Total plantilles:</strong> ${total}/34</p>
    <p><strong>Caps mitja:</strong> ${mitja}</p>
    <p><strong>Ciutats al banc:</strong> ${ciutats}</p>
    <p><strong>Olors registrades:</strong> ${BANCS.banco_olors?.length || 0}</p>
    <p><strong>Sons registrats:</strong> ${BANCS.banco_sons?.length || 0}</p>
    <p><strong>Emocions registrades:</strong> ${BANCS.banco_emocions?.length || 0}</p>
    <hr style="margin:16px 0;border:none;border-top:1px solid var(--border)">
    <p style="font-size:12px;color:var(--text-muted)">
      Aquesta pantalla és només informació. Per omplir variables usa PAS 3 de Generar Llibre
      o enganxa directament el teu prompt_master a Sinopsi i edita {{prota}}, {{ciutat_1}} allà.
    </p>
  `;
}

// ========================================
// 7. BIBLIOTECA - GUARDAR I LLEGIR
// ========================================
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

// ========================================
// 8. INFO APP - PINÇA CAPTURES: DADES BANCS
// ========================================
function renderInfo() {
  document.getElementById('info-versio').textContent = 'V14.3.1';
  document.getElementById('info-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  document.getElementById('info-motor').textContent = mod? 'GPT-4 / Claude Ready' : 'Desconnectat';

  const ciutats = BANCS.banco_ubicacion?.map(c => c.ciutat).join(', ') || 'Cap';
  const infoDiv = document.getElementById('info-bancs-lista');
  if (infoDiv) {
    infoDiv.innerHTML = `
      <p><strong>Ciutats disponibles:</strong> ${ciutats}</p>
      <p><strong>Olors:</strong> ${BANCS.banco_olors?.length || 0} registrades</p>
      <p><strong>Sons:</strong> ${BANCS.banco_sons?.length || 0} registrats</p>
      <p><strong>Emocions:</strong> ${BANCS.banco_emocions?.length || 0} registrades</p>
      <p style="margin-top:16px;font-size:12px;color:var(--text-muted)">Les ciutats són només informació per les plantilles, no variables a omplir</p>
    `;
  }
}

// ========================================
// 9. LECTURA FINAL + EXPORTAR
// ========================================
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
  document.getElementById('text-lectura').innerHTML =
    `<h2>CAPÍTOL ${cap.num}: ${cap.titol}</h2>` +
    cap.escenes.map(e => `<h4>${e.titol}</h4><p>${e.text}</p>`).join('');
};

// ========================================
// 10. EXPORTAR - BOTONS NOUS
// ========================================
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
  const text = `Llegeix "${seleccio.titol}" generat amb Lec-Flix V14.3.1`;
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

// ========================================
// 11. INIT + CONNECTAR BOTONS - PINÇA RUTA
// ========================================
async function initApp() {
  try {
    // PINÇA CAPTURE 1: Ruta arrel, sense /data/
    const bancMod = await import(baseURL + 'loadBancs.js?v=' + Date.now());
    BANCS = await bancMod.cargarBancs();

    mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
    console.log('✅ V14.3.1 PINÇA carregat - 9 pantalles + Sinopsi Editable');

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
    alert('Error carregant bancs: ' + e.message + '\n\nSolució: Mou generarllibre.js i loadBancs.js a l\'arrel del repo GitHub');
  }
}

document.addEventListener('DOMContentLoaded', initApp);