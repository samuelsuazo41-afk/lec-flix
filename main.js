// main.js - Lec-Flix V14.3.2 DIAGRAMA + EXPORTAR + PINÇA CAPTURES TOT
// 10 Pantalles + Botons Exportar + Sinopsi Editable + Dades Info + Prompt Masters
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

// PINÇA: PROMPT MASTERS HARDCODEJATS PERQUÈ SEMPRE SURTIN
const PROMPT_MASTERS = [
  {
    id: 'PM1',
    titol: 'Thriller Serial 14 Caps - Paranoia David Ferrer',
    descripcio: 'Prompt per thriller serial amb 3 víctimes + mentor. Multilocalitat Vic-Manresa-Solsona. Escala paranoia + cliffhangers cada cap. Variables ja omplertes.',
    tip: 'Plantilla 4: Thriller Serial 14 Caps | Plantilla 7: Paranoia 3 Actes',
    prompt: `Ets escriptor thriller serial bestseller. Genera SINOPSI 14 capítols paranoia escala + cliffhangers.

LOCACIONS 1-3 CIUTATS:
Escena 1-4: Vic boscos Sau → Víctima1 i 2
Escena 5-9: Manresa riu Cardener → Perfilació paranoia
Escena 10-14: Solsona casa abandonada → Climax símbol complet

REGLA COHERÈNCIA VIATGE: Profilador segueix estrella Vic→Manresa C-17 1h. Manresa→Solsona C-26 40min muntanya.

VARIABLES JA OMPLERTES:
PROFILADOR: David Ferrer, 41 anys traumat, fòbia sang
VÍCTIMA 1: Marta Lluís, 24 anys estudiant
VÍCTIMA 2: Jordi Coma, 31 anys mecànic
VÍCTIMA 3: Anna Roca, 28 anys infermera
RITUAL: Ganivet serra 7 incisions
SÍMBOL: Estrella 5 puntes gravada pit
MENTOR: Pare David Ferrer, desaparegut 10 anys
CIUTAT 1: Vic | ZONA: Boscos Sau
CIUTAT 2: Manresa | ZONA: Riu Cardener
CIUTAT 3: Solsona | ZONA: Casa abandonada perifèria

HOOK CAP 1: "Tercer cos aquest mes Vic boscos Sau. Mateix tall 7 incisions, mateix símbol estrella gravat pit." Pregunta: "Qui marca víctimes?"

CAP 1-2: INICI Víctima1 Marta Lluís 24 anys boscos Sau Vic. ENLLAÇ Víctima2 Jordi Coma 31 anys. DESENLLAÇ CLIFF: Mateix ritual ganivet serra 7 incisions. "Quan serà víctima3?" CONTINUÏTAT: Punt 1 estrella gravat pit Marta.

CAP 3-4: INICI Víctima2 Jordi Coma riu Cardener Manresa. ENLLAÇ David Ferrer 41 anys entra perfilació. DESENLLAÇ CLIFF: Perfil "assí coneix víctima". "Qui coneix totes 3?" CONTINUÏTAT: Punt 2 estrella pit Jordi.

CAP 5-7: INICI Perfilació Manresa David analitza patrons. ENLLAÇ Cap 8 gir. DESENLLAÇ CLIFF OPEN LOOP: "Per què símbol estrella 5 puntes?" MISTERI. CONTINUÏTAT: Paranoia David. Fòbia sang augmenta.

CAP 8 BEAT 8 PAYBACK: INICI David descobreix ell era objectiu 4. ENLLAÇ Solsona casa abandonada perifèria. DESENLLAÇ CLIFF PAYBACK: Pare David desaparegut 10 anys viu. És mentor culte estrella. "Mentor viu?" GIR MÀXIM. CONTINUÏTAT: Punt 3 estrella Anna Roca.

CAP 9-11: INICI Víctima3 Anna Roca 28 anys apareix viva Solsona lligada. ENLLAÇ Casa abandonada paret símbol complet. DESENLLAÇ CLIFF: Símbol estrella paret 5 punts complet. "Mentor és assassí?" CONTINUÏTAT: Casa perifèria Solsona fred.

CAP 12-14 PAYBACK TOTAL: INICI Casa abandonada Solsona nit. David enfronta pare mentor. ENLLAÇ Climax. DESENLLAÇ CLIFF RESOLT: Pare mentor és assassí. Volia venjança mare David morta. Frase: "No hi ha segona oportunitat." CONTINUÏTAT: David trenca estrella paret. Paranoia acaba.

PATTERN: Esc1 escena crim, Esc2 psico perfil David, Esc3 paranoia fòbia sang.
TONO 50% policial 40% psico 10% personal.
SORTIDA: 14 caps INICI/ENLLAÇ/DESENLLAÇ CLIFF + escala paranoia + MULTILOCAL VIC→MANRESA→SOLSONA`
  },
  {
    id: 'PM2',
    titol: 'Romàntica 12 Caps - Slow Burn',
    descripcio: 'Prompt per romàntica slow burn. 12 caps beats trope enemies-to-lovers. Tono 70% emocional.',
    tip: 'Plantilla 12: Romàntica Slow Burn 12 Caps | Plantilla 15: Enemies to Lovers',
    prompt: `Ets escriptor romàntica bestseller. Genera SINOPSI 12 capítols slow burn enemies-to-lovers...
VARIABLES: {{prota}}, {{love_interest}}, {{ciutat}}, {{conflicte}}`
  },
  {
    id: 'PM3',
    titol: 'Suspens Psicològic 10 Caps',
    descripcio: 'Prompt narrador no fiable. Paranoia creixent, gir cap 8.',
    tip: 'Plantilla 8: Suspens Psicològic 10 Caps | Plantilla 9: Narrador No Fiable',
    prompt: `Ets escriptor suspens psicològic. Genera SINOPSI 10 capítols paranoia...
VARIABLES: {{prota}}, {{dubte}}, {{ciutat}}`
  },
  {
    id: 'PM4',
    titol: 'Històrica 15 Caps - Segle XIX',
    descripcio: 'Prompt novel·la històrica segle XIX amb context real.',
    tip: 'Plantilla 18: Històrica Segle XIX 15 Caps | Plantilla 20: Romance Històric',
    prompt: `Ets escriptor històric. Genera SINOPSI 15 capítols segle XIX...
VARIABLES: {{prota}}, {{any}}, {{ciutat}}, {{esdeveniment_historic}}`
  }
];

// ========================================
// 1. SPLASH → MENÚ
// ========================================
window.entrarApp = () => {
  document.getElementById('screen-splash').classList.remove('active');
  document.getElementById('screen-menu').classList.add('active');
};

// ========================================
// 2. MENÚ PRINCIPAL - 7 BOTONS + ACCIONS
// ========================================
window.openScreen = function(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');

  if (screen === 'generar') renderPasosGenerar();
  if (screen === 'sinopsi') renderSinopsi();
  if (screen === 'promptmasters') renderPromptMasters(); // NOU
  if (screen === 'plantillas') renderBancoPlantillas();
  if (screen === 'dades') renderDadesVariables();
  if (screen === 'biblioteca') renderBiblioteca();
  if (screen === 'info') renderInfo();
};

window.closeScreen = () => openScreen('menu');

// ========================================
// 3. PANTALLA GENERAR LLIBRE - 4 PASOS PINÇA: NOMÉS POLICIAL
// ========================================
function renderPasosGenerar() {
  const genDiv = document.getElementById('pas1-generes');

  // PINÇA: Només gèneres actius del banc
  const generesActius = (BANCS.banco_generos || [])
   .filter(g => g.activo === true)
   .map(g => g.nombre);

  // Fallback Policial si no hi ha banc
  const generes = generesActius.length > 0? generesActius : ['Policial'];

  genDiv.innerHTML = generes.map(g =>
    `<button class="gen-btn" onclick="selectGenere('${g}')">${g}</button>`
  ).join('');

  // Auto-seleccionar si només n'hi ha 1
  if (generes.length === 1) {
    selectGenere(generes[0]);
  }

  renderPlantillesFiltre();
}

window.selectGenere = g => {
  seleccio.genere = g.toLowerCase();
  document.querySelectorAll('.gen-btn').forEach(b =>
    b.classList.toggle('active', b.textContent === g)
  );

  // PINÇA: Alert amb quines plantilles hi ha per aquest gènere
  const plantillesGenere = BANCS.banco_plantillas?.filter(p => p.genere === seleccio.genere) || [];
  if (plantillesGenere.length > 0) {
    const noms = plantillesGenere.map(p => `${p.nom} [${p.caps} caps]`).slice(0,5).join('\n• ');
    alert(`📚 GÈNERE ${g.toUpperCase()}\n\nPlantilles disponibles: ${plantillesGenere.length}\n\n• ${noms}\n\nSelecciona una al PAS 2 per generar.`);
  } else {
    alert(`⚠️ Gènere ${g}: Encara no hi ha plantilles carregades\nRevisa que banc_plantillas.json estigui a l'arrel del repo`);
  }

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
// 4. SINOPSI PROMPTS - PINÇA CAPTURE 3: GUARDAR EN VES DE COPIAR
// ========================================
function renderSinopsi() {
  const selector = document.getElementById('sinopsi-selector');
  const plantilles = BANCS.banco_plantillas || [];

  // PINÇA: Option 0 porta a Prompt Masters
  selector.innerHTML = `<option value="">-- Veure Prompt Masters --</option>` +
    plantilles.map(p => `<option value="${p.id}">[${p.id}] ${p.nom} - ${p.caps} caps</option>`).join('');

  selector.onchange = e => {
    if (!e.target.value) {
      openScreen('promptmasters'); // Porta a Prompt Masters
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

// PINÇA: Botó ara GUARDA en comptes de copiar
window.guardarSinopsi = () => {
  const text = document.getElementById('prompt-master-box').value;
  if (!text.trim()) return alert('El textarea està buit');
  localStorage.setItem('sinopsi_guardada', text);
  alert('✅ Sinopsi guardada! Ara pots copiar-la quan vulguis');
};

// ========================================
// 5B. PROMPT MASTERS - NOU - NOMÉS INFORMACIÓ + COPIAR
// ========================================
function renderPromptMasters() {
  const grid = document.getElementById('grid-prompts');

  grid.innerHTML = PROMPT_MASTERS.map(pm => `
    <div class="card-34" style="border-color:var(--accent);margin-bottom:20px">
      <h3>${pm.titol}</h3>
      <p style="color:var(--text-muted);font-size:12px;margin:8px 0 12px">${pm.descripcio}</p>
      <p style="font-size:11px;color:var(--accent);margin-bottom:6px">📋 PROMPT PER COPIAR:</p>
      <textarea readonly style="min-height:180px;font-size:11px;font-family:'Courier New',monospace;background:var(--bg);line-height:1.4">${pm.prompt}</textarea>
      <button onclick="navigator.clipboard.writeText(\`${pm.prompt.replace(/`/g, '\\`')}\`);alert('✅ Prompt ${pm.id} copiat! Enganxa a ChatGPT i demana: adapta això a la plantilla que triïs')">
        📋 COPIAR PROMPT
      </button>
      <p style="font-size:11px;background:var(--bg-panel);padding:8px;border-radius:4px;margin-top:8px">
        🎯 <strong>Tip:</strong> ${pm.tip}
      </p>
    </div>
  `).join('');
}

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
// 6. DADES I VARIABLES - PINÇA: NOMÉS INFORMACIÓ
// ========================================
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
    <p style="font-size:12px;color:var(--text-muted)">
      Aquesta pantalla és només informació. Per omplir variables usa PAS 3 de Generar Llibre o enganxa directament el teu prompt_master a Sinopsi i edita {{prota}}, {{ciutat_1}} allà.
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
// 8. INFO APP - PINÇA: GLOSARI COMPLET
// ========================================
function renderInfo() {
  document.getElementById('info-versio').textContent = 'V14.3.2';
  document.getElementById('info-plantilles').textContent = `${BANCS.banco_plantillas?.length || 0}/34`;
  document.getElementById('info-motor').textContent = mod? 'GPT-4 / Claude Ready' : 'Desconnectat';

  // PINÇA: GLOSARI COMPLET CIUTATS AMB SUBTUBS
  const ciutats = BANCS.banco_ubicacion?.map(c =>
    `<strong>${c.ciutat}</strong>: ${c.subtubs?.map(s=>s.nom).join(', ')}`
  ).join('<br>') || 'Cap carregada';

  const olors = BANCS.banco_olors?.map(o => o.texto_base).slice(0,5).join(', ') || 'Cap';
  const sons = BANCS.banco_sons?.map(s => s.texto_base).slice(0,5).join(', ') || 'Cap';
  const emocions = BANCS.banco_emocions?.map(e => e.texto_base).slice(0,5).join(', ') || 'Cap';

  const infoDiv = document.getElementById('info-bancs-lista');
  if (infoDiv) {
    infoDiv.innerHTML = `
      <h4 style="color:var(--accent)">📍 GLOSARI COMPLET CIUTATS I ZONES:</h4>
      <p style="font-size:12px;line-height:1.8">${ciutats}</p>
      <h4 style="color:var(--accent);margin-top:16px">👃 OLORES [mínim]:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${olors}...</p>
      <h4 style="color:var(--accent);margin-top:16px">🔊 SONS [mínim]:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${sons}...</p>
      <h4 style="color:var(--accent);margin-top:16px">😰 EMOCIONS [mínim]:</h4>
      <p style="font-size:11px;color:var(--text-muted)">${emocions}...</p>
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
// 10. EXPORTAR - BOTONS
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
  const text = `Llegeix "${seleccio.titol}" generat amb Lec-Flix V14.3.2`;
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
// 11. INIT + CONNECTAR BOTONS - PINÇA RUTA + BANCO GENEROS
// ========================================
async function initApp() {
  try {
    // PINÇA: Carregar bancs des d'arrel
    const bancMod = await import(baseURL + 'loadBancs.js?v=' + Date.now());
    BANCS = await bancMod.cargarBancs();

    // PINÇA: Carregar també banco_generos.json
    if (!BANCS.banco_generos) {
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
    console.log('✅ V14.3.2 PINÇA TOT carregat - 10 pantalles + Prompt Masters');

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