// main.js - Lec-Flix Policial V12.1.1 Híbrid
// Controlador UI + Cableado con generaparagraf.js V12.1.1 y generarllibre.js

let bancs = {};
let configActual = {};
let histActual = null;
let mod = null;

// CARGA INICIAL DEL MOTOR HÍBRIDO
async function initMotor() {
  try {
    // CAMBIO CLAVE: importamos generarllibre.js en vez de generaparagraf.js
    mod = await import('./generarllibre.js');
    console.log('✅ Motor Híbrido V1.0 cargado - generarLlibre disponible');
  } catch (e) {
    console.error('❌ Error cargando motor:', e);
    mostrarError('Error: No se pudo cargar el motor de generación');
  }
}

// CARGA DE BANCS JSON
async function cargarBancs() {
  try {
    const [
      escenarios,
      personatge,
      lectura,
      lecturaAux,
      olors,
      sons,
      emocions
    ] = await Promise.all([
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
    mostrarError('Error: No se pudieron cargar los bancos de datos');
  }
}

// LEE CONFIG DESDE UI
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
  const modo = document.getElementById('select-modo')?.value || 'escena'; // NUEVO SELECT

  configActual = {
    nom,
    nom2,
    ciutat,
    subtubActual,
    beatActual,
    beatAnterior: histActual?.beatAnterior || null,
    tic,
    paraulesObjectiu,
    escenesPerCap,
    totalCaps,
    modo, // 'escena', 'capitol', 'llibre'
    temps: {
      any: '2024',
      mes: 'gener',
      dia: '1',
      event: ''
    },
    beatsCap: ['setup', 'giro1', 'midpoint', 'giro2', 'crisi', 'climax', 'resolucio'] // Para modo capitol
  };

  return configActual;
}

// GENERAR TEXTO - BOTÓN PRINCIPAL
async function generarText() {
  if (!mod) {
    mostrarError('Error: Motor no cargado. Recarga la página.');
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

    // RESET si es libro completo
    if (config.modo === 'llibre') {
      await mod.resetEstructura();
      histActual = null;
    }

    // LLAMADA HÍBRIDA: generarLlibre decide qué hacer según config.modo
    const resultado = await mod.generarLlibre(
      config,
      bancs,
      histActual,
      numCap,
      numEsc,
      config.totalCaps
    );

    // Actualizar hist para siguiente generación
    histActual = resultado.hist;

    // Mostrar resultado
    output.textContent = resultado.text;
    
    // Metadata
    const meta = document.getElementById('output-meta');
    if (meta && resultado.metadata) {
      const { paraules, ubicacio, emocio, beat, acte, tipo } = resultado.metadata;
      meta.innerHTML = `
        <strong>Tipo:</strong> ${tipo || 'escena'} | 
        <strong>Paraules:</strong> ${paraules} | 
        <strong>Ubicació:</strong> ${ubicacio} | 
        <strong>Emoció:</strong> ${emocio} | 
        <strong>Beat:</strong> ${beat} | 
        <strong>Acte:</strong> ${acte}
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

// PREVIEW - Muestra config sin generar
function mostrarPreview() {
  const config = leerConfigUI();
  const preview = document.getElementById('output-text');
  preview.textContent = `PREVIEW CONFIG:\n\n${JSON.stringify(config, null, 2)}`;
}

// EXPORTAR TXT
function exportarTxt() {
  const text = document.getElementById('output-text').textContent;
  if (!text || text.startsWith('PREVIEW') || text.startsWith('Generant')) {
    mostrarError('No hay texto para exportar');
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