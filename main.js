// main.js - Lec-Flix V14.3.0 DIAGRAMA OFICIAL
// 9 Pantalles segons diagrama + Lògica generarllibre.js V14.3.0

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
  modo: 'llibre'
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
  if (screen === 'hipnosi') renderHipnosi();
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
  // PAS 1: Gèneres
  const genDiv = document.getElementById('pas1-generes');
  const generes = ['Policial', 'Romàntica', 'Suspens', 'Històrica', 'Ciència Ficció'];
  genDiv.innerHTML = generes.map(g =>
    `<button class="gen-btn" onclick="selectGenere('${g}')">${g}</button>`
  ).join('');

  // PAS 2: 34 Plantilles filtrades per gènere
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
    <div class="card-plantilla" onclick="selectPlantilla('${p.id}')">
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

  // PAS 3: Render variables
  renderVariablesForm(p.variables || ['ciutat_1','ciutat_2','prota','antagonista']);
};

function renderVariablesForm(vars) {
  const div = document.getElementById('pas3-variables');
  div.innerHTML = vars.map(v => `
    <label>{{${v}}}</label>
    <input id="var-${v}" placeholder="${v}">
  `).join('');
}

// PAS 4: Idioma + Generar
window.setIdioma = lang => {
  seleccio.idioma = lang;
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === lang)
  );
};

window.generarLlibre = async () => {
  if (!seleccio.plantillaId) return alert('Selecciona plantilla primer');

  // Agafar variables del form
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
// 4. HIPNOSI PROMPTS - BOTÓ 2
// ========================================
function renderHipnosi() {
  const selector = document.getElementById('hipnosi-selector');
  const plantilles = BANCS.banco_plantillas || [];

  selector.innerHTML = plantilles.map(p =>
    `<option value="${p.id}">[${p.id}] ${p.nom}</option>`
  ).join('');

  selector.onchange = e => carregarPromptsPlantilla(e.target.value);
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

window.copiarTotHipnosi = () => {
  const text = Array.from(document.querySelectorAll('.hipnosi-caixa'))
   .map(c => c.value).join('\n\n---\n\n');
  navigator.clipboard.writeText(text);
  alert('Copiat!');
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
      <button onclick="event.stopPropagation(); usarPerGenerar('${p.id}')">USAR</button>
    </div>
  `).join('');
}

window.verDetallePlantilla = id => {
  const p = BANCS.banco_plantillas.find(x => x.id === id);
  document.getElementById('det-prompt').textContent = p.prompt_master;
  document.getElementById('det-climax').textContent = p.climax;
  document.getElementById('det-ratio').textContent = p.ratio;
  document.getElementById('det-variables').textContent = JSON.stringify(p.variables || [], null, 2);
  document.getElementById('grid-34').style.display = 'none';
  document.getElementById('detalle-plantilla').style.display = 'block';
};

window.usarPerGenerar = id => {
  selectPlantilla(id);
  openScreen('generar');
};

// ========================================
// 6. DADES I VARIABLES - BOTÓ 4
// ========================================
function renderDadesVariables() {
  const vars = BANCS.banco_variables || [];
  const div = document.getElementById('seccio-variables');

  div.innerHTML = vars.map(v => `
    <div class="var-row">
      <span>{{${v.id}}}</span>
      <input value="${v.placeholder}" onchange="updateVar('${v.id}', this.value)">
    </div>
  `).join('') + `<button onclick="addVariable()">+ AFEGIR VARIABLE</button>`;

  // Stats
  document.getElementById('stat-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34 ✅`;
  const mitja = BANCS.banco_plantillas?.reduce((a,b) => a + (b.caps||12), 0) / BANCS.banco_plantillas?.length || 0;
  document.getElementById('stat-mitja').textContent = mitja.toFixed(1);
}

// ========================================
// 7. BIBLIOTECA - BOTÓ 5
// ========================================
function renderBiblioteca() {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  const div = document.getElementById('lista-llibres');

  div.innerHTML = llibres.length? llibres.map(l => `
    <div class="llibre-item">
      <h4>${l.titol}</h4>
      <p>${l.data} | ${l.caps} caps</p>
      <button onclick="llegirLlibre(${l.id})">LLEGIR</button>
      <button onclick="eliminarLlibre(${l.id})">ELIMINAR</button>
    </div>
  `).join('') : '<p>No tens llibres guardats</p>';
}

// ========================================
// 8. INFO APP - BOTÓ 6
// ========================================
function renderInfo() {
  document.getElementById('info-versio').textContent = 'V14.3.0';
  document.getElementById('info-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  document.getElementById('info-motor').textContent = mod? 'GPT-4 / Claude' : 'Desconnectat';
}

// ========================================
// 9. LECTURA FINAL
// ========================================
function mostrarLecturaFinal(llibre) {
  const index = document.getElementById('index-lectura');
  index.innerHTML = llibre.capitols.map(c => `
    <div class="index-cap">
      <h3>Cap ${c.num}: ${c.titol}</h3>
      <p>${c.resum?.substring(0,120)}...</p>
      <button onclick="llegirCap(${c.num})">LLEGIR CAP ${c.num}</button>
    </div>
  `).join('');
}

window.llegirCap = num => {
  const cap = llibreGenerat.capitols.find(c => c.num === num);
  document.getElementById('text-lectura').innerHTML =
    `<h2>CAPÍTOL ${cap.num}</h2>` + cap.escenes.map(e => `<p>${e.text}</p>`).join('');
};

// ========================================
// INIT + LOAD BANCS
// ========================================
async function initApp() {
  const bancMod = await import(baseURL + 'data/loadBancs.js?v=' + Date.now());
  BANCS = await bancMod.cargarBancs();

  mod = await import(baseURL + 'generarllibre.js?v=' + Date.now());
  console.log('✅ V14.3.0 carregat - 9 pantalles actives');
}

document.addEventListener('DOMContentLoaded', initApp);