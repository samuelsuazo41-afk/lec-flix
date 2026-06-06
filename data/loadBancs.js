// js/loadBancs.js - Carrega tots els 9 bancs JSON amb normalització V8
export async function loadAllBancs() {
  // FIX: Los JSON están en la misma carpeta /data/ que este archivo
  const baseURL = new URL('./', import.meta.url).href;

  const bancsFiles = [
    'banco_generes.json',
    'banco_estructura.json',
    'banco_personatge.json',
    'banco_escenarios.json',
    'banco_lectura.json',
    'banco_emocions.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_ubicacion.json'
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

      // NORMALITZACIÓ V8: banco_estructura pot venir com array o com {beats:[]}
      if (key === 'banco_estructura') {
        if (Array.isArray(data)) {
          // Si és array directe, convertir a objecte amb beats
          data = { beats: data };
        } else if (!data.beats && data.beat) {
          // Si ve com {beat:[...]} convertir a beats
          data.beats = data.beat;
        }
      }

      bancs[key] = data;
      const count = Array.isArray(data)? data.length : (data.beats? data.beats.length : Object.keys(data).length);
      console.log(`✅ ${file} carregat: ${count} items`);

    } catch (err) {
      console.error(`❌ Error carregant ${file}:`, err.message);
      bancs[file.replace('.json', '')] = [];
      errors.push(file);
    }
  }));

  console.log('📚 Bancs carregats:', Object.keys(bancs));

  // ALERTA V8: Si banco_lectura està buit, el motor farà paràgrafs curts
  if (!bancs.banco_lectura || bancs.banco_lectura.length === 0) {
    console.warn('⚠️ ATENCIÓ V8: banco_lectura.json buit. Les escenes seran curtes');
  }

  if (errors.length > 0) {
    console.warn(`⚠️ Bancs amb error: ${errors.join(', ')}`);
  }

  return bancs;
}