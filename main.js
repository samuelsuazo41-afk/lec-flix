// js/main.js - Lec-Flix amb banco_lectura extern

let BANCS = {};
let HIST = {
  plantilles: [],
  ubicacions: [],
  personatges: []
};

// Carrega tots els bancs des de /data/
export async function loadAllBancs() {
  const arxius = [
    'banco_estructura',
    'banco_ubicacion',
    'banco_escenarios',
    'banco_lectura',
    'banco_personatge',
    'banco_emocions',
    'banco_olors',
    'banco_sons',
    'banco_generes'
  ];

  for (const nom of arxius) {
    try {
      const res = await fetch(`./data/${nom}.json`);
      if (!res.ok) throw new Error(`No trobat: ${nom}.json`);
      BANCS[nom] = await res.json();
    } catch (e) {
      console.error(`Error carregant ${nom}:`, e);
      BANCS[nom] = [];
    }
  }
  return BANCS;
}

// Utilitats
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

function randNoRep(key, arr) {
  if (!arr ||!arr.length) return null;
  let item, tries = 0;
  do {
    item = rand(arr);
    tries++;
  } while (HIST[key].includes(item.id || item) && tries < 15);

  if (item.id) HIST[key].push(item.id);
  else HIST[key].push(item);

  if (HIST[key].length > 30) HIST[key] = [];
  return item;
}

// Map de gèneres del HTML als tags del banco_lectura
const MAP_GENERE = {
  romantic: ['romantic'],
  terror: ['terror'],
  misteri: ['misteri'],
  fantasia: ['fantasia'],
  accio: ['accio', 'policiac'],
  comedia: ['comedia']
};

// Agafa plantilles del banco_lectura segons tipus i gènere
function getPlantilles(tipus, genere) {
  const tags = MAP_GENERE[genere] || [genere];
  return BANCS.banco_lectura.filter(p =>
    p.tipus === tipus && tags.some(t => p.tags?.includes(t))
  );
}

// Calcula beats segons estructura
function calcularBeats(estructuraId, numCapitols, titol) {
  const estructura = BANCS.banco_estructura.find(e => e.id === estructuraId);
  if (!estructura) return Array(numCapitols).fill('Setup');

  const beats = estructura.beats || [];
  const resultat = [];
  for (let i = 0; i < numCapitols; i++) {
    const idx = Math.floor((i / numCapitols) * beats.length);
    resultat.push(beats[idx] || 'Transicio');
  }
  return resultat;
}

// Omple variables {p0}, {esc}, etc amb dades del banc
function fill(template, ctx) {
  let txt = template.text || template;

  txt = txt.replace(/{p0}/g, ctx.p0?.nom || 'Algú');
  txt = txt.replace(/{p1}/g, ctx.p1?.nom || 'Algú');
  txt = txt.replace(/{esc}/g, ctx.esc?.nom || 'el lloc');
  txt = txt.replace(/{mon}/g, ctx.mon?.ciutat || 'el món');
  txt = txt.replace(/{hora}/g, `${Math.floor(Math.random()*12+1)}:00`);

  // Variables lèxiques del banco_lectura.lexic
  const lex = BANCS.banco_lectura.find(p => p.tipus === 'lexic')?.lexic || {};
  txt = txt.replace(/{verbfisic}/g, rand(lex.verbFisic || ['caminar']));
  txt = txt.replace(/{verbverbal}/g, rand(lex.verbVerbal || ['dir']));
  txt = txt.replace(/{emocio}/g, rand(lex.emocio || ['amb calma']));
  txt = txt.replace(/{adverbi}/g, rand(lex.adverbis || ['lentament']));

  return txt;
}

// Generador principal
export async function generarLlibre(seleccio) {
  if (!BANCS.banco_lectura?.length) {
    throw new Error('banco_lectura no carregat');
  }

  HIST = { plantilles: [], ubicacions: [], personatges: [] };

  // Config
  const numCapitols = seleccio.ritme === 'Relat Curt'? 5 : seleccio.ritme === 'Èpic'? 25 : 17;
  const beats = calcularBeats(seleccio.estructura, numCapitols, seleccio.titol);

  // Personatges
  const persPool = BANCS.banco_personatge.filter(p => p.genero === seleccio.genere);
  const p0 = randNoRep('personatges', persPool);
  const p1 = randNoRep('personatges', persPool);

  // Món i escenari
  const mon = randNoRep('ubicacions', BANCS.banco_ubicacion);
  const escPool = BANCS.banco_escenarios.filter(e =>!mon || e.ciutat === mon.ciutat);
  const esc = randNoRep('escenaris', escPool);

  const ctx = { p0, p1, esc, mon };

  const capitols = [];

  for (let i = 0; i < numCapitols; i++) {
    const beat = beats[i];
    const escenes = [];

    // 5 escenes per capítol
    for (let j = 0; j < 5; j++) {
      let tipus = 'accio';
      if (j === 0) tipus = 'obertura';
      if (j === 4 && i === numCapitols - 1) tipus = 'tancamentCapitol';
      if (j === 4 && Math.random() > 0.7) tipus = 'cliffhanger';
      if (beat === 'Midpoint' || beat === 'Confrontacio') tipus = 'dialog';

      const plantilles = getPlantilles(tipus, seleccio.genere);
      const plantilla = randNoRep('plantilles', plantilles);

      if (plantilla) {
        escenes.push({
          titol: `${tipus.charAt(0).toUpperCase() + tipus.slice(1)} ${j+1}`,
          text: fill(plantilla, ctx)
        });
      }
    }

    capitols.push({
      num: i + 1,
      beat,
      escenes
    });
  }

  return {
    capitols,
    metadata: {
      paraulesAprox: numCapitols * 5 * 80,
      nCapitols: numCapitols,
      gènere: seleccio.genere,
      estructura: seleccio.estructura
    }
  };
}