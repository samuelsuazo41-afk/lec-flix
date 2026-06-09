// main.js - Lec-Flix Policial V12.1.2 Híbrid
// Controlador UI + Cableado amb generarLlibre.js V1.0.2 i generaparagraf.js V12.1.1

let bancs = {};
let configActual = {};
let histActual = null;
let mod = null;

// CARREGA INICIAL DEL MOTOR HÍBRID
async function initMotor() {
  try {
    mod = await import('./generarLlibre.js');
    console.log('✅ Motor Híbrid V1.0.2 carregat - generarLlibre disponible');
  } catch (e) {
    console.error('❌ Error carregant motor:', e);
    mostrarError('Error: No es va poder carregar el motor de generació');
  }
}

// CARREGA DE BANCS JSON
async function cargarBancs() {
  try {
    const [escenarios, personatge, lectura, lecturaAux, olors, sons, emocions] = await Promise.all([
      fetch('./bancs/banco_escenarios.json').then(r => r.json()),
      fetch('./bancs/banco_personatge.json').then(r => r.json()),
      fetch('./bancs/banco_lectura.json').then(r => r.json()),
      fetch('./bancs/banco_lectura_aux.json').then(r => r.json()),
      fetch('./bancs/banco_olors.json').then(r => r.json()),
      fetch('./bancs/banco_sons.json').then(r => r.json()),
      fetch('./bancs/banco_emocions.json').then(r => r.json())
    ]);

    bancs = {
      banco_escenarios: escenarios,
      banco_personatge: personatge,
      banco_lectura: lectura,
      banco_lectura_aux: lecturaAux,
      banco_olors: olors,
      banco_sons: sons,
      banco_emocions: emocions
    };
    console.log('✅ Bancs carregats:', Object.keys(bancs));
  } catch (e) {
    console.error('❌ Error carregant bancs:', e);
    mostrarError('Error: No es van poder carregar els bancs de dades');
  }
}

// LLEGEIX CONFIG DES DE UI
function leerConfigUI() {
  const nom = document.getElementById('input-nom')?.value || 'Rita';
  const nom2 = document.getElementById('input-nom2')?.value || 'Víctor';
  const ciutat = document.getElementById('select-ciutat')?.value || 'Barcelona';
  const subtubActual = document.getElementById('input-ubicacio')?.value || 'Raval';
  const beatActual = document.getElementById('select-beat')?.value || 'hook';
  const tic = document.getElementById('input-tic')?.value || 'es passa la mà per la barba';
  const paraulesObjectiu = parseInt(document.getElementById('input-paraules')?.value) || 500;
  const escenesPerCap = parseInt(document.getElementById('input-escenes')?.value) || 3;
  const totalCaps = parseInt(document.getElementById('input-caps')?.value) || 12;
  const modo = document.getElementById('select-modo')?.value || 'escena';

  configActual = {
    nom, nom2, ciutat, subtubActual, beatActual,
    beatAnterior: histActual?.beatAnterior || null,
    tic, paraulesObjectiu, escenesPerCap, totalCaps, modo,
    temps: { any: '2024', mes: 'gener', dia: '1', event: '' },
    beatsCap: ['setup', 'giro1', 'midpoint', 'giro2', 'crisi', 'climax', 'resolucio']
  };
  return configActual;
}

// GENERAR TEXTO - BOTÓ PRINCIPAL
async function generarText() {
  if (!mod) {
    mostrarError('Error: Motor no carregat. Recarrega la pàgina.');
    return;
  }

  const btn = document.getElementById('btn-generar');
  const output = document.getElementById('output-text');

  btn.disabled = true;
  btn.textContent = 'Generant...';
  output.textContent = 'Generant text...';

  try {
    const config = leerConfigUI();
    const numCap = parseInt(document.getElementById('input-cap')?.value) || 1;
    const numEsc = parseInt(document.getElementById('input-esc')?.value) || 1;

    console.log(`🚀 Generant modo: ${config.modo}`, { numCap, numEsc });

    if (config.modo === 'llibre') {
      await mod.resetEstructura();
      histActual = null;
    }

    const resultado = await mod.generarLlibre(config, bancs, histActual, numCap, numEsc, config.totalCaps);
    histActual = resultado.hist;

    // RENDER BLINDAT segons tipo
    if (resultado.metadata.tipo === 'escena') {
      output.textContent = resultado.text;
    } else if (resultado.metadata.tipo === 'capitol') {
      output.textContent = resultado.capitols[0].escenes.map(e => e.text).join('\n\n');
    } else if (resultado.metadata.tipo === 'llibre') {
      output.textContent = resultado.capitols.map(c =>
        `=== CAPÍTOL ${c.num} - ${c.beat.toUpperCase()} ===\n\n` +
        c.escenes.map(e => e.text).join('\n\n')
      ).join('\n\n');
    }

    // METADATA
    const meta = document.getElementById('output-meta');
    if (meta && resultado.metadata) {
      const { tipo, paraulesAprox, paraules, ubicacio, emocio, beat, acte, nCapitols, escenes } = resultado.metadata;
      meta.innerHTML = `
        <strong>Tipus:</strong> ${tipo || 'escena'} |
        <strong>Paraules:</strong> ${paraulesAprox || paraules} |
        ${ubicacio? `<strong>Ubicació:</strong> ${ubicacio} | ` : ''}
        ${emocio? `<strong>Emoció:</strong> ${emocio} | ` : ''}
        ${beat? `<strong>Beat:</strong> ${beat} | ` : ''}
        ${acte? `<strong>Acte:</strong> ${acte} | ` : ''}
        ${nCapitols? `<strong>Capítols:</strong> ${nCapitols} | ` : ''}
        ${escenes? `<strong>Escenes:</strong> ${escenes}` : ''}
      `;
    }

    console.log('✅ Generació completa:', resultado.metadata);

  } catch (e) {
    console.error('❌ Error generant:', e);
    mostrarError(`Error: ${e.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generar Text';
  }
}

// RESET ESTRUCTURA
async function resetearHist() {
  if (!mod) return;
  await mod.resetEstructura();
  histActual = null;
  document.getElementById('output-text').textContent = 'Estructura resetejada. Llest per generar.';
  document.getElementById('output-meta').textContent = '';
  console.log('🔄 Hist resetejat');
}

// PREVIEW
function mostrarPreview() {
  const config = leerConfigUI();
  const preview = document.getElementById('output-text');
  preview.textContent = `PREVIEW CONFIG:\n\n${JSON.stringify(config, null, 2)}`;
}

// EXPORTAR TXT
function exportarTxt() {
  const text = document.getElementById('output-text').textContent;
  if (!text || text.startsWith('PREVIEW') || text.startsWith('Generant')) {
    mostrarError('No hi ha text per exportar');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lec-flix_${configActual.modo}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// UTILS UI
function mostrarError(msg) {
  const errorDiv = document.getElementById('error-msg');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 4000);
  }
  console.error(msg);
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', async () => {
  await initMotor();
  await cargarBancs();
  document.getElementById('btn-generar')?.addEventListener('click', generarText);
  document.getElementById('btn-preview')?.addEventListener('click', mostrarPreview);
  document.getElementById('btn-exportar')?.addEventListener('click', exportarTxt);
  document.getElementById('btn-reset')?.addEventListener('click', resetearHist);
  console.log('✅ App Lec-Flix iniciada');
});
