// /data/loaderjson.js
export async function loadAllBancs() {
  const bancsFiles = [
    'banco_estructura.json',
    'banco_generes.json',
    'banco_personatge.json',
    'banco_escenarios.json',
    'banco_emocions.json',
    'banco_ecenes.json',
    'banco_lectura.json',
    'banco_olors.json',
    'banco_sons.json',
    'banco_ubicacion.json'
  ];

  const bancs = {};
  const promises = bancsFiles.map(async (file) => {
    const res = await fetch(`./data/${file}`);
    if (!res.ok) throw new Error(`No s'ha pogut carregar ${file}`);
    const key = file.replace('.json', '');
    bancs[key] = await res.json();
  });

  await Promise.all(promises);
  return bancs;
}
