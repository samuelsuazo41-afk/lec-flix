// data/loadBancs.js - Carregador V9.9.9 lec-flix policial
// Carrega els 19 bancs JSON + fusió banco_escenarios + normalització per main.js V9.9.9

export async function cargarBancs() {
  const baseURL = new URL('./', import.meta.url).href;

  const bancsFiles = [
    'banco_generes.json',
    'banco_estructura.json',
    'banco_personatge.json',
    'banco_personatges_generals.json',
    'banco_escenarios.json',
    'banco_escenarios_policial.json',
    'banco_lectura.json',
    'banco_lectura_aux.json',
    'banco_emocions.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_ubicacion.json',
    'banco_climax_polical.json',
    'banco_dialogos_policial.json',
    'banco_giros_policial.json',
    'banco_situaciones_diarias.json',
    'banco_temps.json'
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

      // NORMALITZACIÓ V9.9.9 per main.js
      if (key === 'banco_estructura') {
        if (!Array.isArray(data)) data = [data];
        bancs[key] = data;
      }
      else if (key === 'banco_personatge') {
        if (!Array.isArray(data)) data = [data];
        bancs[key] = data;
      }
      else if (key === 'banco_escenarios') {
        bancs[key] = Array.isArray(data)? data : [];
      }
      else if (key === 'banco_escenarios_policial') {
        // Fusió amb escenarios base
        const base = bancs.banco_escenarios || [];
        const pol = Array.isArray(data)? data : [];
        bancs.banco_escenarios = [...base,...pol];
      }
      else if (key === 'banco_ubicacion') {
        bancs[key] = Array.isArray(data)? data : [];
      }
      else if (key === 'banco_temps') {
        bancs[key] = Array.isArray(data)? data : [];
      }
      else {
        bancs[key] = Array.isArray(data)? data : [];
      }

      console.log(`✅ ${file} carregat: ${bancs[key].length} items`);

    } catch (e) {
      console.error(`❌ Error carregant ${file}:`, e);
      bancs[file.replace('.json', '')] = [];
      errors.push(file);
    }
  }));

  if (errors.length > 0) {
    console.warn(`⚠️ Bancs amb error: ${errors.join(', ')}`);
  }

  console.log('✅ Tots els bancs V9.9.9 carregats i normalitzats');
  return bancs;
} 