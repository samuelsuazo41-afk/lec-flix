// js/main.js - Lec-Flix v3: Tot cablejat amb olors i sons
let BANCS = {};

// Generador principal
export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;
  console.log('Bancs rebuts:', Object.keys(BANCS));

  // 1. Decidir ritme ABANS de tot
  let numCapitols, paraulesAprox, escenesPerCap;
  if (seleccio.ritme === 'Relat Curt') {
    numCapitols = 4; paraulesAprox = 5000; escenesPerCap = 3;
  } else if (seleccio.ritme === 'Èpic') {
    numCapitols = 25; paraulesAprox = 100000; escenesPerCap = 6;
  } else {
    numCapitols = 17; paraulesAprox = 60000; escenesPerCap = 5;
  }

  // 2. Carregar bancs amb fallback
  const personatges = BANCS.banco_personatge || [{id:'p1', genero:'policiac', banco_variables:{nom:['Àlex'], tic:['']} }];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat:'Barcelona', banco_variables:{so:['silenci'], olor:['aire fred']}}];
  const escenaris = BANCS.banco_escenarios || [{nom:'Carrer', ciutat:'Barcelona'}];
  const lectures = BANCS.banco_lectura || [
    {tipus: 'obertura', genero:'policiac', texto_base: '{p0} va obrir els ulls.'},
    {tipus: 'accio', genero:'policiac', texto_base: '{p0} va córrer cap a {esc}.'},
    {tipus: 'dialog', genero:'policiac', texto_base: '"No puc més", va dir {p0}.'},
    {tipus: 'descripcio', genero:'policiac', texto_base: 'L’aire olia a {olor}.'},
    {tipus: 'cliffhanger', genero:'policiac', texto_base: 'Però llavors, va sentir {so}.'},
    {tipus: 'tancament', genero:'policiac', texto_base: 'El capítol acabava aquí.'}
  ];

  // 3. Filtrar per selecció de l'usuari
  // PERSONATGE: si tria un, sinó agafa primer del gènere
  const persBanc = seleccio.personatgeId
   ? personatges.find(p => p.id === seleccio.personatgeId)
    : personatges.find(p => p.genero === seleccio.genere) || personatges[0];

  // MÓN: filtra ubicació per ciutat
  const ubi = seleccio.mon
   ? ubicacions.find(u => u.ciutat === seleccio.mon)
    : ubicacions[0];

  // ESCENARI: filtra per id, sinó per ciutat+genere
  const esc = seleccio.escenariId
   ? escenaris.find(e => e.id === seleccio.escenariId)
    : escenaris.find(e => e.ciutat === ubi.ciutat && e.genero?.includes(seleccio.genere)) || escenaris[0];

  // 4. Estructura beats
  const estructures = BANCS.banco_estructura || { beats: Array(numCapitols).fill({ nom: 'Beat' }) };
  const beats = estructures.beats?.length? estructures.beats : Array(numCapitols).fill({ nom: 'Beat' });

  // 5. Dades per omplir plantilles - JA AMB OLOR I SO
  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || '';

  // OLOR: filtra per gènere, sinó usa ubicació
  const olorsPool = BANCS.banco_olors?.filter(o => o.genero?.includes(seleccio.genere)) || [];
  const olorBanc = olorsPool.length? olorsPool[0] : null;
  const olor = olorBanc
   ? olorBanc.texto_base[Math.floor(Math.random() * olorBanc.texto_base.length)]
    : ubi.banco_variables?.olor?.[0] || 'aire fred';

  // SO: filtra per gènere, sinó usa ubicació
  const sonsPool = BANCS.banco_sons?.filter(s => s.genero?.includes(seleccio.genere)) || [];
  const soBanc = sonsPool.length? sonsPool[0] : null;
  const so = soBanc
   ? soBanc.texto_base[Math.floor(Math.random() * soBanc.texto_base.length)]
    : ubi.banco_variables?.so?.[0] || 'silenci';

  const data = { p0: nom, p1: 'Marta', p2: 'Oriol', esc: esc.nom, olor, so, tic, ciutat: ubi.ciutat };

  // 6. Tensió per cliffhangers
  const tensio = Array(numCapitols).fill(0).map((_, i) => i / numCapitols);

  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length]?.nom || 'Beat';
    const tens = tensio[numCap - 1];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEsc = '';

      textEsc += fill(plantilla('obertura', lectures, seleccio.genere), data) + ';

      const nAccions = tens > 0.7? 4 : 3;
      for (let i = 0; i < nAccions; i++) {
        textEsc += fill(plantilla('accio', lectures, seleccio.genere), data) + ' ';
      }

      if (beat === 'Midpoint' || beat === 'Confrontacio') {
        textEsc += fill(plantilla('dialog', lectures, seleccio.genere), data) + ' ';
      }

      textEsc += fill(plantilla('descripcio', lectures, seleccio.genere), data) + ';

      if (Math.random() > 0.3) {
        textEsc += fill(plantilla('dialog', lectures, seleccio.genere), data) + ' ';
      }

      if (numEsc === escenesPerCap && Math.random() > (0.8 - tens)) {
        textEsc += fill(plantilla('cliffhanger', lectures, seleccio.genere), data) + ' ';
      }

      escenes.push({ titol: `Escena ${numEsc}`, text: textEsc.trim() });
    }

    escenes.push({ titol: '', text: `<em>${plantilla('tancament', lectures, seleccio.genere)}</em>` });
    capitols.push({ num: numCap, beat, escenes });
  }

  return {
    capitols,
    metadata: {
      paraulesAprox,
      nCapitols: numCapitols,
      ritme: seleccio.ritme,
      genere: seleccio.genere,
      personatge: nom,
      ciutat: ubi.ciutat,
      escenari: esc.nom
    }
  };
}

function plantilla(tipus, lectures, genere) {
  // Filtra per tipus + gènere
  const opts = lectures.filter(p => p.tipus === tipus && p.genero === genere);
  if (!opts.length) return '{p0} va fer algo a {esc}.';
  const sel = opts[Math.floor(Math.random() * opts.length)];
  return sel.texto_base || sel.text;
}

function fill(template, data) {
  return template
  .replace(/{p0}/g, data.p0)
  .replace(/{p1}/g, data.p1)
  .replace(/{p2}/g, data.p2)
  .replace(/{esc}/g, data.esc)
  .replace(/{olor}/g, data.olor)
  .replace(/{so}/g, data.so)
  .replace(/{tic}/g, data.tic)
  .replace(/{ciutat}/g, data.ciutat);
}