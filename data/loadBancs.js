// data/loadBancs.js - Carregador V9.9.9 lec-flix policial
// Carrega els 19 bancs JSON + fusió banco_escenarios + normalització per main.js V9.9.9

export async function cargarBancs() {
  const baseURL = new URL('./', import.meta.url).href;

  const bancsFiles = [
    // 19 BANCS COMPLETS V9.9.9
    'banco_generes.json',
    'banco_estructura.json',
    'banco_personatge.json',
    'banco_personatges_generals.json',
    'banco_escenarios.json',
    'banco_escenarios_policial.json',
    'banco_lectura.json',
    'banco_lectura_aux.json', // NOU: farciment + transicions
    'banco_emocions.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_ubicacion.json',
    'banco_climax_polical.json',
    'banco_dialogos_policial.json', // NOU V9.9
    'banco_giros_policial.json',    // NOU V9.9
    'banco_situaciones_diarias.json',
    'banco_temps.json'              // NOU V9.9.7: temps any/mes/dia/event
    // 'banco_terror.json' EXCLÒS per ara
  ];

  const bancs = {};
  const errors = [];

  await Promise.all(bancsFiles.map(async (file) => {
    try {
      const url = baseURL + file;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`⚠️ No s'ha pogut carregar ${file} - Status: ${res.status}`);
        bancs[file.replace('.json', '')] = [];
        errors.push(file);
        return;
      }

      let data = await res.json();
      const key = file.replace('.json', '');

      // NORMALITZACIÓ V9.9: Assegurar format correcte per main.js
      if (key === 'banco_estructura') {
        if