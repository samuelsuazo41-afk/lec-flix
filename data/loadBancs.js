// data/loadBancs.js - Carregador V9.9 lec-flix policial
// Carrega els 15 bancs JSON + normalització per main.js V9.9

export async function cargarBancs() {
  // FIX: Els JSON estan a /data/ i aquest arxiu també està a /data/
  const baseURL = new URL('./', import.meta.url).href;

  const bancsFiles = [
    // 15 BANCS COMPLETS V9.9
    'banco_generes.json',
    'banco_estructura.json',
    'banco_personatge.json',
    'banco_personatges_generals.json',
    'banco_escenarios.json',
    'banco_escenarios_policial.json',
    'banco_lectura.json',
    'banco_emocions.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_ubicacion.json',
    'banco_climax_polical.json',
    'banco_dialogos_policial.json',
    'banco_giros_policial.json',
    'banco_situaciones_diarias.json'
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
        // main.js espera data.beats per iterar 9 beats
        if (Array.isArray(data)) {
          data = { beats: data };
        } else if (!data.beats && data.beat) {
          data.beats = data.beat;
          delete data.beat;
        } else if (!data.beats) {
          data = { beats: [] };
        }
      }

      // NORMALITZACIÓ: Assegurar que tots els bancs siguin array
      if (!Array.isArray(data) && key!== 'banco_estructura') {
        // Si ve com objecte, convertir a array de valors
        data = Object.values(data);
      }

      bancs[key] = data;

      const count = Array.isArray(data)? data.length :
                    (data.beats? data.beats.length : Object.keys(data).length);
      console.log(`✅ ${file} carregat: ${count} items`);

    } catch (err) {
      console.error(`❌ Error carregant ${file}:`, err.message);
      bancs[file.replace('.json', '')] = [];
      errors.push(file);
    }
  }));

  console.log('📚 Bancs V9.9 carregats:', Object.keys(bancs));

  // VALIDACIONS CRÍTIQUES V9.9
  if (!bancs.banco_lectura || bancs.banco_lectura.length === 0) {
    console.warn('⚠️ ATENCIÓ V9.9: banco_lectura.json buit. Les escenes seran curtes i genèriques');
  }

  if (!bancs.banco_ubicacion || bancs.banco_ubicacion.length === 0) {
    console.error('❌ CRÍTIC: banco_ubicacion.json buit. No hi ha ciutats per seleccionar');
  }

  if (!bancs.banco_personatge || bancs.banco_personatge.length === 0) {
    console.warn('⚠️ ATENCIÓ: banco_personatge.json buit. S\'usarà nom per defecte');
  }

  if (errors.length > 0) {
    console.warn(`⚠️ Bancs amb error: ${errors.join(', ')}`);
  } else {
    console.log('✅ Tots els 15 bancs V9.9 carregats correctament');
  }

  return bancs;
}