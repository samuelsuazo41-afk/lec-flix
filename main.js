// main.js - Lec-Flix V14.3.0 DIAGRAMA + EXPORTAR
// 9 Pantalles + Botons Exportar TXT/EPUB/PDF/Compartir

let BANCS = {};
let mod = null;
let histActual = null;
let llibreGenerat = null;
const baseURL = new URL('./', import.meta.url).href;

const seleccio = {
  genere: 'policial',
  subgenere: null,
  plantillaId: null,
  prompt_master: '',
  variables: {},
  idioma: 'CAT',
  modo: 'llibre',
  titol: 'lec-flix'
};

// ========================================
// 1. SPLASH → MENÚ
// ========================================
window.entrarApp = () => {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-menu').classList.add('active');
};

// ========================================
// 2. MENÚ PRINCIPAL - 6 BOTONS
// ========================================
window.openScreen = function(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');

  if (screen === 'generar') renderPasosGenerar();
  if (screen === 'sinopsi') renderSinopsi();
  if (screen === 'plantillas') renderBancoPlantillas();
  if (screen === 'dades') renderDadesVariables();
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
  renderVariablesForm(p.variables || ['ciutat_1','ciutat_2','prota','antagonista']);
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
    seleccio.variables[inp.id.replace('var-','')] = inp.value;
  });

  showProgress(0);
  const btn = document.getElementById('btn-generar');
  btn.disabled = true;

  try {
    const config = {...seleccio, modo: 'llibre'};
    const resultado = await mod.generarLlibre(config, BANCS, null, 1, 1, seleccio.totalCaps || 12);

    llibreGenerat = resultado;
    guardarBiblioteca(resultado);
    showProgress(100);
    setTimeout(() => openScreen('lectura'), 500);
    mostrarLecturaFinal(resultado);
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
  }
};

function showProgress(p) {
  document.getElementById('progress-bar').style.width = p + '%';
  document.getElementById('progress-text').textContent = p + '%';
}

// ========================================
// 4. SINOPSI PROMPTS - BOTÓ 2
// ========================================
function renderSinopsi() {
  const selector = document.getElementById('sinopsi-selector');
  const plantilles = BANCS.banco_plantillas || [];

  selector.innerHTML = plantilles.map(p =>
    `<option value="${p.id}">[${p.id}] ${p.nom}</option>`
  ).join('');

  selector.onchange = e => carregarPromptsPlantilla(e.target.value);
  if (plantilles.length) carregarPromptsPlantilla(plantilles[0].id);
}

function carregarPromptsPlantilla(id) {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  if (!p) return;

  const beats = ['hook','cliffhanger','payback8','payback14','inici_cap','enllac','desenllac'];
  beats.forEach((beat, i) => {
    const caixa = document.getElementById(`caixa-${i+1}`);
    if (caixa) caixa.value = p.prompts?.[beat] || p.prompt_master || '';
  });
}

window.copiarTotSinopsi = () => {
  const text = Array.from(document.querySelectorAll('.sinopsi-caixa'))
  .map(c => c.value).join('\n\n---\n\n');
  navigator.clipboard.writeText(text);
  alert('Sinopsi copiada al porta-retalls!');
};

// ========================================
// 5. BANCO 34 PLANTILLAS - BOTÓ 3
// ========================================
function renderBancoPlantillas() {
  const grid = document.getElementById('grid-34');
  const plantilles = BANCS.banco_plantillas || [];

  grid.innerHTML = plantilles.map(p => `
    <div class="card-34" onclick="verDetallePlantilla('${p.id}')">
      <h3>[${p.id}] ${p.nom}</h3>
      <p>${p.caps} caps | ${p.climax}</p>
      <p>${p.ratio}</p>
      <button>VEURE DETALL</button>
    </div>
  `).join('');
}

window.verDetallePlantilla = id => {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  document.getElementById('det-nom').textContent = p.nom;
  document.getElementById('det-nom').dataset.id = p.id;
  document.getElementById('det-climax').textContent = p.climax;
  document.getElementById('det-ratio').textContent = p.ratio;
  document.getElementById('det-variables').textContent = JSON.stringify(p.variables || [], null, 2);
  document.getElementById('det-prompt').textContent = p.prompt_master;
  document.getElementById('grid-34').style.display = 'none';
  document.getElementById('detalle-plantilla').style.display = 'block';
};

window.usarPerGenerar = id => {
  selectPlantilla(id);
  openScreen('generar');
};

// Connectar botó usar del detall
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-usar-plantilla')?.addEventListener('click', () => {
    const id = document.getElementById('det-nom').dataset.id;
    usarPerGenerar(id);
  });
});

// ========================================
// 6. DADES I VARIABLES - BOTÓ 4
// ========================================
function renderDadesVariables() {
  const vars = BANCS.banco_variables || [];
  const div = document.getElementById('seccio-variables');

  div.innerHTML = vars.map(v => `
    <label>{{${v.id}}}</label>
    <input value="${v.placeholder}" onchange="updateVar('${v.id}', this.value)">
  `).join('');

  document.getElementById('stat-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  const mitja = BANCS.banco_plantillas?.reduce((a,b) => a + (b.caps||12), 0) / BANCS.banco_plantillas?.length || 0;
  document.getElementById('stat-mitja').textContent = mitja.toFixed(1);
}

window.updateVar = (id, val) => {
  const v = BANCS.banco_variables.find(x => x.id === id);
  if (v) v.placeholder = val;
};

// ========================================
// 7. BIBLIOTECA - BOTÓ 5
// ========================================
function guardarBiblioteca(llibre) {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  llibres.unshift({
    id: Date.now(),
    titol: seleccio.titol,
    plantilla: seleccio.plantillaId,
    data: new Date().toLocaleString(),
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
      <h3>${l.titol || 'Sense títol'}</h3>
      <p>[${l.plantilla}] ${l.data} | ${l.caps} caps</p>
      <button onclick="llegirLlibre(${l.id})">LLEGIR</button>
      <button onclick="eliminarLlibre(${l.id})" style="background:#c33">ELIMINAR</button>
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
// 8. INFO APP - BOTÓ 6
// ========================================
function renderInfo() {
  document.getElementById('info-versio').textContent = 'V14.3.0';
  document.getElementById('info-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  document.getElementById('info-motor').textContent = mod? 'GPT-4 / Claude' : 'Desconnectat';
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
    `<h2>CAPÍTOL ${cap.num}</h2>` + cap.escenes.map(e => `<h4>${e.titol}</h4><p>${e.text}</p>`).join('');
};

// ========================================
// 10. EXPORTAR - BOTONS NOUS
// ========================================
window.exportarTxt = () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  const text = llibreGenerat.capitols.map(c =>
    `CAPÍTOL ${c.num} - ${c.titol}\n\n` + c.escenes.map(e => `${e.titol}\n${e.text}\n\n`).join('')
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
  alert('Exportar EPUB: Funcionalitat pendent d\'implementar amb llibreria epub.js');
  // TODO: implementar generació EPUB real
};

window.exportarPDF = () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  window.print();
};

window.compartirLlibre = async () => {
  if (!llibreGenerat) return alert('Primer genera un llibre');
  const text = `Llegeix "${seleccio.titol}" generat amb Lec-Flix V14.3.0`;
  if (navigator.share) {
    await navigator.share({title: seleccio.titol, text: text});
  } else {
    navigator.clipboard.writeText(text);
    alert('Enllaç copiat!');
  }
};

window.resetApp = () => {
  if (confirm('Esborrar selecció i tornar a començar?')) {
    llibreGenerat = null;
    histActual = null;
    openScreen('generar');
  }
};

// ========================================
// 11. INIT + CONNECTAR BOTONS
// ========================================
async function initApp() {
  const bancMod = await import(baseURL + 'data/loadBancs.js?v=' + Date.now());
  BANCS = await bancMod.cargarBancs();

  mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
  console.log('✅ V14.3.0 carregat - 9 pantalles + Exportar');

  // Connectar botons exportar
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
}

document.addEventListener('DOMContentLoaded', initApp);