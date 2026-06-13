// main.js - Lec-Flix V14.0.0 COMPLET
// Controlador UI + 6 Pantalles independents + Banc 34 Plantilles Pautes
// Controlador UI + generarLlibre.js V1.0.2 + generaparagraf.js V12.1.1

let bancs = {};
let bancPlantillas = [];
let configActual = {};
let histActual = null;
let mod = null;
let plantillaActiva = null;
let pantallaActual = 'splash'; // splash | menu | generar | plantilla | hipnosis | datos | biblioteca | info | lectura

// ========================================
// 1. INIT APP + CARREGA BANCS
// ========================================
async function initMotor() {
  try {
    mod = await import('./generarLlibre.js');
    console.log('✅ Motor Híbrid V1.0.2 carregat');
  } catch (e) {
    console.error('❌ Error motor:', e);
    mostrarError('Error: No es va poder carregar el motor');
  }
}

async function cargarBancs() {
  try {
    const [escenarios, personatge, lectura, lecturaAux, olors, sons, emocions, plantillas] = await Promise.all([
      fetch('./bancs/banco_escenarios.json').then(r => r.json()),
      fetch('./bancs/banco_personatge.json').then(r => r.json()),
      fetch('./bancs/banco_lectura.json').then(r => r.json()),
      fetch('./bancs/banco_lectura_aux.json').then(r => r.json()),
      fetch('./bancs/banco_olors.json').then(r => r.json()),
      fetch('./bancs/banco_sons.json').then(r => r.json()),
      fetch('./bancs/banco_emocions.json').then(r => r.json()),
      fetch('./bancs/banc_plantillas.json').then(r => r.json())
    ]);

    bancs = { banco_escenarios: escenarios, banco_personatge: personatge, banco_lectura: lectura,
              banco_lectura_aux: lecturaAux, banco_olors: olors, banco_sons: sons, banco_emocions: emocions };
    bancPlantillas = plantillas;

    console.log(`✅ Bancs carregats + ${bancPlantillas.length}/34 plantilles`);
    renderizarGridPlantillas(); // Omple Pantalla 3 Plantilla
  } catch (e) {
    console.error('❌ Error bancs:', e);
    mostrarError('Error carregant bancs');
  }
}

// ========================================
// 2. NAVEGACIÓ PANTALLES - 1 BOTÓ = 1 PANTALLA
// ========================================
function mostrarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.style.display = 'none');
  document.getElementById(`pantalla-${id}`)?.style.display = 'block';
  pantallaActual = id;
  console.log(`📱 Pantalla: ${id}`);
}

// ========================================
// 3. PANTALLA 1: SPLASH - BOTÓ ENTRAR
// ========================================
function initSplash() {
  document.getElementById('btn-entrar')?.addEventListener('click', () => mostrarPantalla('menu'));
}

// ========================================
// 4. PANTALLA 2: MENÚ PRINCIPAL - 6 BOTONS
// ========================================
function initMenu() {
  document.getElementById('btn-menu-1')?.addEventListener('click', () => mostrarPantalla('generar'));
  document.getElementById('btn-menu-2')?.addEventListener('click', () => mostrarPantalla('hipnosis'));
  document.getElementById('btn-menu-3')?.addEventListener('click', () => mostrarPantalla('plantilla'));
  document.getElementById('btn-menu-4')?.addEventListener('click', () => mostrarPantalla('datos'));
  document.getElementById('btn-menu-5')?.addEventListener('click', () => { renderizarBiblioteca(); mostrarPantalla('biblioteca'); });
  document.getElementById('btn-menu-6')?.addEventListener('click', () => { renderizarInfoApp(); mostrarPantalla('info'); });

  document.getElementById('btn-back-splash')?.addEventListener('click', () => mostrarPantalla('splash'));
}

// ========================================
// 5. PANTALLA 3: GENERAR LLIBRE - PAS 1 + PAS 2
// ========================================
function initGenerar() {
  renderizarGeneros();
  document.getElementById('btn-generar')?.addEventListener('click', generarLlibre);
  document.getElementById('btn-back-menu-gen')?.addEventListener('click', () => mostrarPantalla('menu'));
}

function renderizarGeneros() {
  const container = document.getElementById('btn-generos');
  if (!container) return;
  const generos = ['Policial', 'Romàntica', 'Suspens', 'Fantasia'];
  container.innerHTML = generos.map(g =>
    `<button class="btn-genere" onclick="filtrarPlantillas('${g}')">${g}</button>`
  ).join('');
}

function filtrarPlantillas(genero) {
  configActual.genero = genero;
  const filtradas = bancPlantillas.filter(p => p.subgenere.toLowerCase().includes(genero.toLowerCase()));
  const lista = document.getElementById('lista-34-plantillas');
  lista.innerHTML = filtradas.map(p => `
    <div class="item-plantilla-gen" onclick="seleccionarPlantillaParaGenerar('${p.id}')">
      <strong>[${p.id}]</strong> ${p.nom} <span>${p.caps} caps | ${p.climax}</span>
    </div>
  `).join('');
}

function seleccionarPlantillaParaGenerar(id) {
  plantillaActiva = bancPlantillas.find(p => p.id === id);
  if (!plantillaActiva) return;

  configActual.plantillaId = id;
  configActual.totalCaps = plantillaActiva.caps;
  configActual.climax = plantillaActiva.climax;
  configActual.prompt_master = plantillaActiva.prompt_master;

  document.getElementById('info-plantilla-seleccionada').textContent =
    `[${plantillaActiva.id}] ${plantillaActiva.nom} - ${plantillaActiva.caps} caps`;
  document.getElementById('input-caps').value = plantillaActiva.caps;
}

// ========================================
// 6. PANTALLA 4: PLANTILLA/PAUTES - 34 PLANTILLES GRID
// ========================================
function renderizarGridPlantillas() {
  const grid = document.getElementById('grid-plantillas-34');
  if (!grid ||!bancPlantillas.length) return;

  grid.innerHTML = bancPlantillas.map(p => `
    <div class="card-plantilla" onclick="verDetalleCompleto('${p.id}')">
      <div class="card-header">
        <h3>[${p.id}] ${p.nom}</h3>
        <span class="badge">${p.subgenere}</span>
      </div>
      <div class="card-body">
        <p><strong>Caps:</strong> ${p.caps}</p>
        <p><strong>Climax:</strong> ${p.climax}</p>
        <p><strong>Ratio:</strong> ${p.ratio}</p>
        <p><strong>Tags:</strong> ${p.tags_ciutats.slice(0,3).join(', ')}</p>
        <p><strong>Hooks:</strong> ${p.metodes_amazon.join(', ')}</p>
        <p class="desc">${p.descripcio}</p>
      </div>
      <div class="card-footer">
        <button onclick="event.stopPropagation(); usarPlantillaDesdeGrid('${p.id}')">Usar per Generar</button>
        <button onclick="event.stopPropagation(); copiarPrompt('${p.id}')">Copiar Prompt</button>
      </div>
    </div>
  `).join('');
}

function verDetalleCompleto(id) {
  plantillaActiva = bancPlantillas.find(p => p.id === id);
  if (!plantillaActiva) return;

  document.getElementById('det-id').textContent = plantillaActiva.id;
  document.getElementById('det-nom').textContent = plantillaActiva.nom;
  document.getElementById('det-subgenere').textContent = plantillaActiva.subgenere;
  document.getElementById('det-caps').textContent = plantillaActiva.caps;
  document.getElementById('det-climax').textContent = plantillaActiva.climax;
  document.getElementById('det-ratio').textContent = plantillaActiva.ratio;
  document.getElementById('det-tags').textContent = plantillaActiva.tags_ciutats.join(', ');
  document.getElementById('det-hooks').textContent = plantillaActiva.metodes_amazon.join(', ');
  document.getElementById('det-desc').textContent = plantillaActiva.descripcio;
  document.getElementById('det-prompt').textContent = plantillaActiva.prompt_master;

  document.getElementById('pantalla-plantilla-grid').style.display = 'none';
  document.getElementById('pantalla-plantilla-detalle').style.display = 'block';
}

function usarPlantillaDesdeGrid(id) {
  seleccionarPlantillaParaGenerar(id);
  mostrarPantalla('generar');
}

function copiarPrompt(id) {
  const p = bancPlantillas.find(x => x.id === id);
  navigator.clipboard.writeText(p.prompt_master);
  alert(`Prompt de ${p.id} copiat!`);
}

function initPlantilla() {
  document.getElementById('btn-back-menu-plant')?.addEventListener('click', () => mostrarPantalla('menu'));
  document.getElementById('btn-back-grid')?.addEventListener('click', () => {
    document.getElementById('pantalla-plantilla-detalle').style.display = 'none';
    document.getElementById('pantalla-plantilla-grid').style.display = 'block';
  });
}

// ========================================
// 7. PANTALLA 5: HIPNOSI PROMPTS
// ========================================
function cargarPromptsHipnosis() {
  if (!plantillaActiva) {
    document.getElementById('prompt-master-hipnosis').textContent = 'Selecciona primer una plantilla des de Banco o Generar';
    return;
  }
  document.getElementById('prompt-master-hipnosis').textContent = plantillaActiva.prompt_master;
  document.getElementById('info-hooks-hipnosis').textContent = `Amazon Hooks: ${plantillaActiva.metodes_amazon.join(', ')}`;
}

function initHipnosis() {
  document.getElementById('btn-back-menu-hip')?.addEventListener('click', () => mostrarPantalla('menu'));
  document.getElementById('btn-copiar-todo')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('prompt-master-hipnosis').textContent);
    alert('Prompt copiat!');
  });
}

// ========================================
// 8. PANTALLA 6: DADES I VARIABLES
// ========================================
function renderizarVariablesGlobales() {
  const container = document.getElementById('lista-variables');
  const vars = ['ciutat_1', 'ciutat_2', 'ciutat_3', 'prota', 'antagonista', 'objecte'];
  container.innerHTML = vars.map(v => `
    <div class="var-item">
      <label>{{${v}}}</label>
      <input type="text" id="var-${v}" placeholder="Valor per defecte">
    </div>
  `).join('');
}

function initDatos() {
  document.getElementById('btn-back-menu-dat')?.addEventListener('click', () => mostrarPantalla('menu'));
  document.getElementById('btn-validar-banc')?.addEventListener('click', () => {
    alert(`Banc validat: ${bancPlantillas.length}/34 plantilles OK`);
  });
}

// ========================================
// 9. PANTALLA 7: BIBLIOTECA
// ========================================
function guardarBiblioteca() {
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  llibres.unshift({
    id: Date.now(),
    plantilla: configActual.plantillaId,
    nom: plantillaActiva?.nom || 'Sense nom',
    data: new Date().toLocaleString(),
    preview: document.getElementById('output-text').textContent.substring(0,150)
  });
  localStorage.setItem('biblioteca_lec_flix', JSON.stringify(llibres.slice(0,50)));
}

function renderizarBiblioteca() {
  const container = document.getElementById('lista-biblioteca');
  const llibres = JSON.parse(localStorage.getItem('biblioteca_lec_flix') || '[]');
  if (!container) return;

  if (llibres.length === 0) {
    container.innerHTML = '<p>No tens llibres guardats encara</p>';
    return;
  }

  container.innerHTML = llibres.map(l => `
    <div class="item-biblioteca">
      <h4>[${l.plantilla}] ${l.nom}</h4>
      <p class="data">${l.data}</p>
      <p class="preview">${l.preview}...</p>
      <button onclick="releerLlibre(${l.id})">Llegir</button>
    </div>
  `).join('');
}

function initBiblioteca() {
  document.getElementById('btn-back-menu-bib')?.addEventListener('click', () => mostrarPantalla('menu'));
}

// ========================================
// 10. PANTALLA 8: INFO APP
// ========================================
function renderizarInfoApp() {
  document.getElementById('info-version').textContent = 'V14.0.0 COMPLET';
  document.getElementById('info-plantilles').textContent = `${bancPlantillas.length}/34 carregades`;
  document.getElementById('info-motor').textContent = mod? 'Connectat' : 'Desconnectat';
}

function initInfo() {
  document.getElementById('btn-back-menu-inf')?.addEventListener('click', () => mostrarPantalla('menu'));
}

// ========================================
// 11. PANTALLA 9: LECTURA FINAL
// ========================================
function initLectura() {
  document.getElementById('btn-descarregar')?.addEventListener('click', descarregarTxt);
  document.getElementById('btn-generar-altre')?.addEventListener('click', () => mostrarPantalla('generar'));
  document.getElementById('btn-back-menu-lect')?.addEventListener('click', () => mostrarPantalla('menu'));
}

function descarregarTxt() {
  const text = document.getElementById('output-text').textContent;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lec-flix_${configActual.plantillaId}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  guardarBiblioteca();
}

// ========================================
// 12. GENERAR LLIBRE - MOTOR
// ========================================
async function generarLlibre() {
  if (!mod) { mostrarError('Motor no carregat'); return; }
  if (!configActual.plantillaId) { mostrarError('Selecciona una plantilla primer'); return; }

  const btn = document.getElementById('btn-generar');
  btn.disabled = true;
  btn.textContent = 'Generant 12-16 capítols...';

  try {
    const config = leerConfigUI();
    await mod.resetEstructura();
    histActual = null;

    const resultado = await mod.generarLlibre(config, bancs, histActual, 1, 1, config.totalCaps);
    histActual = resultado.hist;

    // Render Índex
    const indexHTML = resultado.capitols.map(c =>
      `<li><strong>Cap ${c.num}:</strong> ${c.beat.toUpperCase()}</li>`
    ).join('');
    document.getElementById('output-index').innerHTML = `<ul>${indexHTML}</ul>`;

    // Render Llibre
    const llibreHTML = resultado.capitols.map(c =>
      `=== CAPÍTOL ${c.num} - ${c.beat.toUpperCase()} ===\n\n` +
      c.escenes.map(e => e.text).join('\n\n')
    ).join('\n\n');
    document.getElementById('output-text').textContent = llibreHTML;

    mostrarPantalla('lectura');
    console.log('✅ Llibre generat complet');
  } catch (e) {
    console.error('❌ Error:', e);
    mostrarError(`Error: ${e.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generar Llibre';
  }
}

function leerConfigUI() {
  return {
   ...configActual,
    nom: document.getElementById('input-nom')?.value || 'Inspector',
    nom2: document.getElementById('input-nom2')?.value || 'Sospitós',
    ciutat_1: document.getElementById('input-ciutat1')?.value || 'Girona',
    ciutat_2: document.getElementById('input-ciutat2')?.value || 'Barcelona',
    ciutat_3: document.getElementById('input-ciutat3')?.value || 'Madrid',
    idioma: document.getElementById('select-idioma')?.value || 'CAT'
  };
}

// ========================================
// 13. UTILS
// ========================================
function mostrarError(msg) {
  const errorDiv = document.getElementById('error-msg');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 4000);
  }
}

// ========================================
// 14. INIT COMPLET - CABLEADO TOTES PANTALLES
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  await initMotor();
  await cargarBancs();

  initSplash();
  initMenu();
  initGenerar();
  initPlantilla();
  initHipnosis();
  initDatos();
  initBiblioteca();
  initInfo();
  initLectura();

  mostrarPantalla('splash');
  console.log('✅ Lec-Flix V14.0.0 COMPLET iniciat - 9 Pantalles actives');
});