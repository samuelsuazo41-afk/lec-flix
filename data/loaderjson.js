export async function loadAllBancs() {
  // loaderjson.js està dins /data/, així que baseURL és /data/
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
      const res = await fetch(baseURL + file); // sense afegir 'data/' extra
      if (!res.ok) throw new Error(`No s'ha pogut carregar ${file}`);
      const data = await res.json();
      const key = file.replace('.json', '');
      bancs[key] = data;
    } catch (err) {
      console.error(`Error carregant ${file}:`, err);
    }
  }));

  console.log('Bancs carregats:', Object.keys(bancs));
  return bancs;
}