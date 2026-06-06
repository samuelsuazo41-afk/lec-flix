// js/loadBancs.js - Carrega tots els bancs JSON amb fallback
export async function loadAllBancs() {
  // FIX: detecta automàticament si els JSON estan a /js/ o a /
  // Si estan a la mateixa carpeta que aquest arxiu -> './'
  // Si estan a la carpeta arrel -> '../'
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

  await Promise.all(bancsFiles.map(async (file) => {
    try {
      const url = baseURL + file;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`⚠️ No s'ha pogut carregar ${file} - Status: ${res.status}`);
        bancs[file.replace('.json', '')] = []; // fallback buit
        return;
      }

      const data = await res.json();
      const key = file.replace('.json', '');
      bancs[key] = data;

      console.log(`✅ ${file} carregat: ${Array.isArray(data)? data.length : Object.keys(data).length} items`);

    } catch (err) {
      console.error(`❌ Error carregant ${file}:`, err.message);
      bancs[file.replace('.json', '')] = []; // fallback buit per no petar
    }
  }));

  console.log('📚 Bancs carregats:', Object.keys(bancs));
  return bancs;
}