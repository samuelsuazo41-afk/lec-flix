// data/loadBancs.js - Carregador V14.3.0 lec-flix policial HÍBRID FINAL
// Carrega TOTS els bancs + fusió CP1/CP2 + normalització per main.js V14.3.0 + generarllibre.js V14.3.0

export async function cargarBancs() {
  const baseURL = new URL('./', import.meta.url).href;

  const bancsFiles = [
    'banco_generes.json',
    'banco_estructura.json',
    'banco_personatge.json',
    'banco_personatges_generals.json',
    'banco_escenarios.json',
    'banco_escenarios_policial.json',
    'banco_ubicacion.json',
    'banco_ubicacion_policial.json',
    'banco_lectura.json',
    'banco_lectura_aux.json',
    'banco_lectura_policial.json',
    'banco_emocions.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_climax_polical.json',
    'banco_dialogos_policial.json',
    'banco_giros_policial.json',
    'banco_situaciones_diarias.json',
    'banco_temps.json',
    'banco_temps_policial.json',
    'banco_plantillas.json',
    'banco_ritmes.json',
    'banco_variables.json'
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

      // NORMALITZACIÓ V14.3.0 per main.js + generarllibre.js
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
        // Fusió CP1 + CP2 policial escenarios
        const base = bancs.banco_escenarios || [];
        const pol = Array.isArray(data)? data : [];
        bancs.banco_escenarios = [...base,...pol];
        console.log(`🔗 Fusionats escenarios: ${bancs.banco_escenarios.length} total`);
      }
      else if (key === 'banco_ubicacion') {
        bancs[key] = Array.isArray(data)? data : [];
      }
      else if (key === 'banco_ubicacion_policial') {
        // Fusió CP1 + CP2 ubicacions
        const base = bancs.banco_ubicacion || [];
        const pol = Array.isArray(data)? data : [];
        bancs.banco_ubicacion = [...base,...pol];
      }
      else if (key === 'banco_temps') {
        bancs[key] = Array.isArray(data)? data : [];
      }
      else if (key === 'banco_temps_policial') {
        // Fusió CP1 + CP2 temps
        const base = bancs.banco_temps || [];
        const pol = Array.isArray(data)? data : [];
        bancs.banco_temps = [...base,...pol];
      }
      else if (key === 'banco_plantillas') {
        // 34 plantilles pautes Botó 3
        bancs[key] = Array.isArray(data)? data : [];
        console.log(`📚 Plantilles carregades: ${bancs[key].length}/34`);
      }
      else if (key === 'banco_ritmes') {
        // 4 ritmes: lento, normal, rapido, policial
        bancs[key] = Array.isArray(data)? data : [];
        console.log(`🎵 Ritmes carregats: ${bancs[key].length}/4`);
      }
      else if (key === 'banco_variables') {
        // Variables CP2 Pantalla 5
        bancs[key] = Array.isArray(data)? data : [];
        console.log(`🔧 Variables CP2 carregades: ${bancs[key].length} camps`);
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

  console.log('✅ TOTS ELS BANCS V14.3.0 CABLEJATS I NORMALITZATS');
  console.log(`📊 Total bancs: ${Object.keys(bancs).length} | Errors: ${errors.length}`);

  return bancs;
}