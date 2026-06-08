// js/main.js - MOTOR V9.9.4 lec-flix policial FINAL
import { generaParagraf, resetEstructura } from './generaparagraf.js?v=' + Date.now();

function hashSinopsi(text) {
  let hash = 0;
  if (!text) text = 'default_seed_lec_flix';
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return function() {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

function llegirPauta(sinopsi) {
  const text = (sinopsi || '').toLowerCase();
  return {
    ciutatForçada: text.includes('barceloneta')? 'barceloneta' : text.includes('gotic') || text.includes('gòtic')? 'barri_gotic' : text.includes('tibidabo')? 'tibidabo' : text.includes('eixample')? 'eixample' : null,
    toForçat: text.includes('por') || text.includes('miedo')? 'emo_pol_tensio' : text.includes('sospita') || text.includes('sospecha')? 'emo_pol_desconfianca' : text.includes('ira') || text.includes('furia') || text.includes('ràbia')? 'emo_pol_furia' : null,
    motiu: text.includes('diners') || text.includes('dinero')? 'diners' : text.includes('gelosia') || text.includes('celos')? 'gelosia' : text.includes('venjança') || text.includes('venganza')? 'venjança' : 'poder'
  };
}

function getConfigEditorial(ritme) {
  if (ritme === 'Relat Curt') {
    return { numCapitols: 4, paraulesTotals: 10000, escenesPerCap: 5, paraulesPerEscena: 500, beats: ['hook','inciting_incident','primer_giro','climax'] };
  } else if (ritme === 'Èpic') {
    return { numCapitols: 30, paraulesTotals: 100000, escenesPerCap: 8, paraulesPerEscena: 400, beats: ['hook','plantejament','setup','giro1','midpoint','giro2','crisi','climax','resolucio'] };
  } else {
    return { numCapitols: 20, paraulesTotals: 60000, escenesPerCap: 6, paraulesPerEscena: 500, beats: ['hook','plantejament','setup','giro1','midpoint','giro2','crisi','climax','resolucio'] };
  }
}

function pickSubtub(subtubs, hist) {
  if (!subtubs || subtubs.length === 0) return null;
  const disponibles = subtubs.filter(s =>!hist.ubicacions.includes(s));
  const pool = disponibles.length > 0? disponibles : subtubs;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// Auto 1-2 ciutats extra per desenvolupament
function pickCiutatsExtra(bancs, cp1, cp2, random) {
  const totes = (bancs.banco_ubicacion || []).map(c => c.ciutat);
  const disponibles = totes.filter(c => c!== cp1 && c!== cp2);
  if (disponibles.length === 0) return [];
  const n = Math.floor(random() * 2) + 1;
  const extra = [];
  const pool = [...disponibles];
  for(let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(random() * pool.length);
    extra.push(pool.splice(idx, 1)[0]);
  }
  return extra;
}

export async function generarLlibre(seleccio, bancs) {
  await resetEstructura();
  const seed = hashSinopsi(seleccio.sinopsis);
  const rand = seededRandom(seed);
  const randomOriginal = Math.random;
  Math.random = rand;

  const pauta = llegirPauta(seleccio.sinopsis);
  const config = getConfigEditorial(seleccio.ritme);

  const ciutatsExtra = pickCiutatsExtra(bancs, seleccio.ciutatPrincipal, seleccio.ciutatPrincipal2, rand);
  console.log('🗺️ Ciutats extra auto:', ciutatsExtra);

  const configBase = {
    genere: seleccio.genere,
    nom: seleccio.personatgeId || 'Rita',
    tic: 'es passa la mà per la barba',
    ciutat: seleccio.ciutatPrincipal,
    ciutat2: seleccio.ciutatPrincipal2,
    ciutatsExtra: ciutatsExtra,
    subtubsActius: seleccio.subtubsPrincipal || [],
    subtubsActius2: seleccio.subtubsPrincipal2 || [],
    sinopsis: seleccio.sinopsis || '',
    pauta: pauta
  };

  let hist = { ubicacions: [], escenarisUsats: [], emocions: [], frasesUsades: [], combinacionsUsades: new Set(), pauta: pauta, paraulesTotals: 0 };
  const capitols = [];
  const beats = config.beats;

  for (let numCap = 1; numCap <= config.numCapitols; numCap++) {
    const beatNom = beats[(numCap - 1) % beats.length];
    const progress = numCap / config.numCapitols;

    let ciutatActual = configBase.ciutat;
    let subtubsActuals = configBase.subtubsActius;

    if (configBase.ciutat2 && numCap > 5 && numCap <= 10) {
      ciutatActual = configBase.ciutat2;
      subtubsActuals = configBase.subtubsActius2;
    } else if (ciutatsExtra.length > 0 && numCap > 10 && numCap <= 15) {
      ciutatActual = ciutatsExtra[0];
      const bancCiutat = bancs.banco_ubicacion.find(c => c.ciutat === ciutatActual);
      subtubsActuals = bancCiutat? bancCiutat.subtubs.map(s => s.nom) : [];
    } else if (ciutatsExtra.length > 1 && numCap > 15) {
      ciutatActual = ciutatsExtra[1];
      const bancCiutat = bancs.banco_ubicacion.find(c => c.ciutat === ciutatActual);
      subtubsActuals = bancCiutat? bancCiutat.subtubs.map(s => s.nom) : [];
    }

    const escenes = [];
    for (let numEsc = 1; numEsc <= config.escenesPerCap; numEsc++) {
      const subtub = pickSubtub(subtubsActuals, hist);
      const configEscena = {...configBase, ciutat: ciutatActual, subtubActual: subtub, beatActual: beatNom, numCapitol: numCap, numEscena: numEsc, escenesPerCap: config.escenesPerCap, paraulesObjectiu: config.paraulesPerEscena, progress: progress };

      const resultat = await generaParagraf(configEscena, bancs, hist, numCap, numEsc, config.numCapitols);
      hist = resultat.hist;
      hist.paraulesTotals += resultat.metadata.paraules;
      escenes.push({ titol: `Escena ${numEsc} - ${beatNom}`, text: resultat.text, metadata: resultat.metadata });
    }

    if (progress <= 0.25) {
      escenes.push({ titol: '', text: `<em>Acte 1: Rita encara no sap en què s'ha ficat...</em>` });
    } else if (progress <= 0.75) {
      escenes.push({ titol: '', text: `<em>Acte 2: Cada pista l'allunya més de la veritat...</em>` });
    } else {
      escenes.push({ titol: '', text: `<em>Acte 3: Només queda enfrontar-se al que ha descobert...</em>` });
    }
    capitols.push({ num: numCap, beat: beatNom, escenes });
  }

  Math.random = randomOriginal;

  return {
    capitols,
    metadata: {
      seed: seed,
      paraulesAprox: hist.paraulesTotals,
      paraulesObjectiu: config.paraulesTotals,
      nCapitols: config.numCapitols,
      ritme: seleccio.ritme,
      genere: seleccio.genere,
      sinopsis: seleccio.sinopsis,
      personatge: configBase.nom,
      ciutat: configBase.ciutat,
      ciutat2: configBase.ciutat2,
      ciutatsExtra: ciutatsExtra,
      subtubs: configBase.subtubsActius,
      subtubs2: configBase.subtubsActius2,
      pauta: pauta,
      paraulesPerEscena: config.paraulesPerEscena,
      complert: hist.paraulesTotals >= config.paraulesTotals * 0.95
    }
  };
}

export async function generarLectura(seleccio, bancs, numEscenes = 6) {
  const res = await generarLlibre(seleccio, bancs);
  const primerCap = res.capitols[0];
  return { escenes: primerCap.escenes.slice(0, numEscenes), metadata: res.metadata };
}

window.generarLlibre = generarLlibre;
window.generarLectura = generarLectura;
console.log('✅ Motor V9.9.4 carregat - Auto ciutats extra integrades');