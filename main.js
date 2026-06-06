// js/main.js - Lec-Flix v2: pantalles separades, 3 ritmes, sense banco_escenaris

// Estat global
window.seleccio = {
  titol: '',
  genere: 'policiac',
  estructura: 'Save the Cat',
  ritme: 'Novel·la', // Relat Curt | Novel·la | Èpic
  pov: '1 Protagonista'
};

let llibreGenerat = null;
let BANCS = {};

// Carregar bancs
export async function loadAllBancs() {
  const files = ['banco_estructura', 'banco_ubicacion', 'banco_lectura', 'banco_personatge'];
  const result = {};

  for (const file of files) {
    try {
      const res = await fetch(`./data/${file}.json`);
      if (!res.ok) throw new Error(`No trobat: ${file}`);
      result[file] = await res.json();
    } catch (err) {
      console.warn(`Banc ${file} no carregat, usando fallback`, err);
      result[file] = getFallback(file);
    }
  }
  return result;
}

// Fallbacks si no hi ha JSON
function getFallback(file) {
  if (file === 'banco_estructura') {
    return {
      'Save the Cat': Array(17).fill('Beat'),
      '3 Actes': Array(17).fill('Beat'),
      'No Lineal': Array(17).fill('Beat')
    };
  }
  if (file === 'banco_lectura') {
    return [
      {tipus: 'obertura', text: '{p0} va obrir els ulls.'},
      {tipus: 'accio', text: '{p0} va córrer cap a {esc}.'},
      {tipus: 'dialog', text: '"No puc més", va dir {p0}.'},
      {tipus: 'descripcio', text: 'L’aire olia a pluja.'},
      {tipus: 'cliffhanger', text: 'Però llavors, va sentir un soroll.'},
      {tipus: 'tancament', text: 'El capítol acabava aquí.'}
    ];
  }
  if (file === 'banco_personatge') {
    return [
      {nom: 'Àlex', rol: 'Protagonista'},
      {nom: 'Marta', rol: 'Còmplic'},
      {nom: 'Oriol', rol: 'Antagonista'}
    ];
  }
  if (file === 'banco_ubicacion') {
    return [{ciutat: 'Barcelona', pais: 'Catalunya'}];
  }
  return [];
}

// Generador principal
export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;

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
  } else { // Novel·la
    numCapitols = 17;
    paraulesAprox = 60000;
    escenesPerCap = 5;
  }

  // Personatges
  const personatges = BANCS.banco_personatge.slice(0, 3);
  const data = {
    p0: personatges[0]?.nom || 'Àlex',
    p1: personatges[1]?.nom || 'Marta',
    p2: personatges[2]?.nom || 'Oriol',
    esc: BANCS.banco_ubicacion[0]?.ciutat || 'Barcelona'
  };

  // Beats segons estructura
  const beats = BANCS.banco_estructura[seleccio.estructura] || BANCS.banco_estructura['Save the Cat'];
  const tensio = Array(numCapitols).fill(0).map((_, i) => i / numCapitols);

  const capitols = [];

  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[numCap - 1] || 'Beat';
    const tens = tensio[numCap - 1];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEsc = '';

      // Obertura
      textEsc += fill(plantilla('obertura'), data) + ';

      // Accions
      const nAccions = tens > 0.7? 4 : 3;
      for (let i = 0; i < nAccions; i++) {
        textEsc += fill(plantilla('accio'), data) + ' ';
      }

      // Pensament + diàleg al midpoint
      if (beat === 'Midpoint' || beat === 'Confrontacio') {
        textEsc += fill(plantilla('dialog'), data) + ' ';
      }

      // Descripció
      textEsc += fill(plantilla('descripcio'), data) + ';

      // Diàleg si hi ha més d’1 personatge
      if (Math.random() > 0.3) {
        textEsc += fill(plantilla('dialog'), data) + ' ';
      }

      // Cliffhanger final d’escena
      if (numEsc === escenesPerCap && Math.random() > (0.8 - tens)) {
        textEsc += fill(plantilla('cliffhanger'), data) + ' ';
      }

      escenes.push({
        titol: `Escena ${numEsc}`,
        text: textEsc.trim()
      });
    }

    // Tancament capítol
    escenes.push({
      titol: '',
      text: `<em>${plantilla('tancament')}</em>`
    });

    capitols.push({ num: numCap, beat, escenes });
  }

  return {
    capitols,
    metadata: { paraulesAprox, nCapitols: numCapitols, ritme: seleccio.ritme }
  };
}

// Agafar plantilla aleatòria
function plantilla(tipus) {
  const opts = BANCS.banco_lectura.filter(p => p.tipus === tipus);
  if (!opts.length) return '{p0} va fer algo.';
  return opts[Math.floor(Math.random() * opts.length)].text;
}

// Omplir variables
function fill(template, data) {
  return template
   .replace(/{p0}/g, data.p0)
   .replace(/{p1}/g, data.p1)
   .replace(/{p2}/g, data.p2)
   .replace(/{esc}/g, data.esc);
}