// js/main.js - Lec-Flix v2: pantalles separades, 3 ritmes

let BANCS = {};

// Generador principal
export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;
  console.log('Bancs rebuts:', Object.keys(BANCS)); // per debug

  // Protecció si no carreguen els JSON
  const personatges = BANCS.banco_personatge || [{nom: 'Àlex'}, {nom: 'Marta'}, {nom: 'Oriol'}];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat: 'Barcelona'}];
  const lectures = BANCS.banco_lectura || [
    {tipus: 'obertura', text: '{p0} va obrir els ulls.'},
    {tipus: 'accio', text: '{p0} va córrer cap a {esc}.'},
    {tipus: 'dialog', text: '"No puc més", va dir {p0}.'},
    {tipus: 'descripcio', text: 'L’aire olia a pluja.'},
    {tipus: 'cliffhanger', text: 'Però llavors, va sentir un soroll.'},
    {tipus: 'tancament', text: 'El capítol acabava aquí.'}
  ];
 const beats = estructures[seleccio.estructura] || estructures['Save the Cat'] || Array(numCapitols).fill('Beat');

const estructures = BANCS.banco_estructura || {
  'Save the Cat': Array(17).fill('Beat'),
  '3 Actes': Array(17).fill('Beat'),
  'No Lineal': Array(17).fill('Beat')
};

  // Decidir ritme
  let numCapitols, paraulesAprox, escenesPerCap;
  if (seleccio.ritme === 'Relat Curt') {
    numCapitols = 4;
    paraulesAprox = 5000;
    escenesPerCap = 3;
  } else if (seleccio.ritme === 'Èpic') {
    numCapitols = 25;
    paraulesAprox = 100000;
    escenesPerCap = 6;
  } else {
    numCapitols = 17;
    paraulesAprox = 60000;
    escenesPerCap = 5;
  }

  // Personatges i dades
  const data = {
    p0: personatges[0]?.nom || 'Àlex',
    p1: personatges[1]?.nom || 'Marta',
    p2: personatges[2]?.nom || 'Oriol',
    esc: ubicacions[0]?.ciutat || 'Barcelona'
  };

  // Beats segons estructura
  const beats = estructures[seleccio.estructura] || estructures['Save the Cat'];
  const tensio = Array(numCapitols).fill(0).map((_, i) => i / numCapitols);

  const capitols = [];

  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[numCap - 1] || 'Beat';
    const tens = tensio[numCap - 1];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEsc = '';

      textEsc += fill(plantilla('obertura', lectures), data) + ' ';
      const nAccions = tens > 0.7? 4 : 3;
      for (let i = 0; i < nAccions; i++) {
        textEsc += fill(plantilla('accio', lectures), data) + ' ';
      }
      if (beat === 'Midpoint' || beat === 'Confrontacio') {
        textEsc += fill(plantilla('dialog', lectures), data) + ' ';
      }
      textEsc += fill(plantilla('descripcio', lectures), data) + ' ';
      if (Math.random() > 0.3) {
        textEsc += fill(plantilla('dialog', lectures), data) + ' ';
      }
      if (numEsc === escenesPerCap && Math.random() > (0.8 - tens)) {
        textEsc += fill(plantilla('cliffhanger', lectures), data) + ' ';
      }

      escenes.push({
        titol: `Escena ${numEsc}`,
        text: textEsc.trim()
      });
    }

    escenes.push({
      titol: '',
      text: `<em>${plantilla('tancament', lectures)}</em>`
    });

    capitols.push({ num: numCap, beat, escenes });
  }

  return {
    capitols,
    metadata: { paraulesAprox, nCapitols: numCapitols, ritme: seleccio.ritme }
  };
}

function plantilla(tipus, lectures) {
  const opts = lectures.filter(p => p.tipus === tipus);
  if (!opts.length) return '{p0} va fer algo.';
  return opts[Math.floor(Math.random() * opts.length)].text;
}

function fill(template, data) {
  return template
  .replace(/{p0}/g, data.p0)
  .replace(/{p1}/g, data.p1)
  .replace(/{p2}/g, data.p2)
  .replace(/{esc}/g, data.esc);
}