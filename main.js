// js/main.js - MOTOR V9.9 lec-flix policial FINAL
// Repo: samuelsuazo41-afk/lec-flix
// Fusiona: Estructura UI V9.6 + Seed + Pauta + Mètriques Editorials 9 Beats

import { generaParagraf, resetEstructura } from './generaparagraf.js?v=' + Date.now();

// ========== 1. SEED DES DE SINOPSI ==========
// Cada sinopsi diferent = llibre únic. Mateixa sinopsi = mateix llibre
function hashSinopsi(text) {
  let hash = 0;
  if (!text) text = 'default_seed_lec_flix';
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit
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

// ========== 2. PAUTA DES DE SINOPSI ==========
// La sinopsi guia però no presona. Detecta paraules clau
function llegirPauta(sinopsi) {
  const text = (sinopsi || '').toLowerCase();
  return {
    ciutatForçada: text.includes('barceloneta')? 'barceloneta' :
                   text.includes('gotic') || text.includes('gòtic')? 'barri_gotic' :
                   text.includes('tibidabo')? 'tibidabo' :
                   text.includes('eixample')? 'eixample' : null,

    toForçat: text.includes('por') || text.includes('miedo')? 'emo_pol_tensio' :
              text.includes('sospita') || text.includes('sospecha')? 'emo_pol_desconfianca' :
              text.includes('ira') || text.includes('furia') || text.includes('ràbia')? 'emo_pol_furia' : null,

    motiu: text.includes('diners') || text.includes('dinero')? 'diners' :
           text.includes('gelosia') || text.includes('celos')? 'gelosia' :
           text.includes('venjança') || text.includes('venganza')? 'venjança' : 'poder'
  };
}

// ========== 3. MÈTRIQUES EDITORIALS 9 BEATS BESTSELLER ==========
function getConfigEditorial(ritme) {
  if (ritme === 'Relat Curt') {
    return {
      numCapitols: 4,
      paraulesTotals: 10000,
      escenesPerCap: 5,
      paraulesPerEscena: 500,
      beats: ['hook','inciting_incident','primer_giro','climax']
    };
  } else if (ritme === 'Èpic') {
    return {
      numCapitols: 30,
      paraulesTotals: 100000,
      escenesPerCap: 8,
      paraulesPerEscena: 400,
      beats: ['hook','plantejament','setup','giro1','midpoint','giro2','crisi','climax','resolucio']
    };
  } else {
    // Novel·la 60k - Estàndard Amazon Policial
    return {
      numCapitols: 20,
      paraulesTotals: 60000,
      escenesPerCap: 6,
      paraulesPerEscena: 500,
      beats: ['hook','plantejament','setup','giro1','midpoint','giro2','crisi','climax','resolucio']
    };
  }
}

// ========== 4. PICK SUBTUB EVITANT REPETIR ==========
// Mateixa lògica que tens tu, però filtrant hist.ubicacions
function pickSubtub(subtubs, hist) {
  if (!subtubs || subtubs.length === 0) return null;
  const disponibles = subtubs.filter(s =>!hist.ubicacions.includes(s));
  const pool = disponibles.length > 0? disponibles : subtubs;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// ========== 5. GENERADOR DE LLIBRE COMPLET V9.9 ==========
export async function generarLlibre(seleccio, bancs) {
  // A. RESET + SEED + PAUTA
  await resetEstructura();

  const seed = hashSinopsi(seleccio.sinopsis);
  const randomOriginal = Math.random;
  Math.random = seededRandom(seed);

  const pauta = llegirPauta(seleccio.sinopsis);
  const config = getConfigEditorial(seleccio.ritme);

  // B. CONFIG BASE des de seleccio que ja tens a index.html
  const configBase = {
    genere: seleccio.genere,
    subgenere: seleccio.subgenere || 'thriller',
    nom: seleccio.personatgeId || 'Rita',
    tic: 'es passa la mà per la barba',
    ciutat: seleccio.ciutatPrincipal,
    ciutat2: seleccio.ciutatPrincipal2,
    subtubsActius: seleccio.subtubsPrincipal || [],
    subtubsActius2: seleccio.subtubsPrincipal2 || [],
    subtubsExtra: seleccio.subtubsExtra || {},
    sinopsis: seleccio.sinopsis || '',
    pauta: pauta
  };

  // C. HIST GLOBAL amb anti-repetició V9.7
  let hist = {
    ubicacions: [],
    escenarisUsats: [],
    emocions: [],
    frasesUsades: [],
    combinacionsUsades: new Set(),
    pauta: pauta,
    paraulesTotals: 0
  };

  // D. BUCLE CAPÍTOLS 20x6
  const capitols = [];
  const beats = config.beats;

  for (let numCap = 1; numCap <= config.numCapitols; numCap++) {
    const beatNom = beats[(numCap - 1) % beats.length];
    const progress = numCap / config.numCapitols;

    // ROTACIÓ CIUTAT: Cap 1-6 CP1, 7-12 CP2, 13+ Extres
    let ciutatActual = configBase.ciutat;
    let subtubsActuals = configBase.subtubsActius;

    if (configBase.ciutat2 && numCap > 6 && numCap <= 12) {
      ciutatActual = configBase.ciutat2;
      subtubsActuals = configBase.subtubsActius2;
    } else if (seleccio.ciutatsExtra && seleccio.ciutatsExtra.length > 0 && numCap > 12) {
      const idxExtra = (numCap - 13) % seleccio.ciutatsExtra.length;
      ciutatActual = seleccio.ciutatsExtra[idxExtra];
      subtubsActuals = configBase.subtubsExtra[ciutatActual] || [];
    }

    // E. BUCLE ESCENES 6 per capítol
    const escenes = [];
    for (let numEsc = 1; numEsc <= config.escenesPerCap; numEsc++) {
      const subtub = pickSubtub(subtubsActuals, hist);

      const configEscena = {
       ...configBase,
        ciutat: ciutatActual,
        subtubActual: subtub,
        beatActual: beatNom,
        numCapitol: numCap,
        numEscena: numEsc,
        escenesPerCap: config.escenesPerCap,
        paraulesObjectiu: config.paraulesPerEscena,
        progress: progress
      };

      // F. CRIDA MOTOR PARÀGRAF V9.7
      const resultat = await generaParagraf(configEscena, bancs, hist, numCap, numEsc, config.numCapitols);
      hist = resultat.hist;
      hist.paraulesTotals += resultat.metadata.paraules;

      escenes.push({
        titol: `Escena ${numEsc} - ${beatNom}`,
        text: resultat.text,
        metadata: resultat.metadata
      });
    }

    // G. RESUM ACTE segons % llibre - Cliffhanger editorial
    if (progress <= 0.25) {
      escenes.push({ titol: '', text: `<em>Acte 1: Rita encara no sap en què s'ha ficat...</em>` });
    } else if (progress <= 0.75) {
      escenes.push({ titol: '', text: `<em>Acte 2: Cada pista l'allunya més de la veritat...</em>` });
    } else {
      escenes.push({ titol: '', text: `<em>Acte 3: Només queda enfrontar-se al que ha descobert...</em>` });
    }

    capitols.push({ num: numCap, beat: beatNom, escenes });
  }

  // H. RESTAURAR RANDOM ORIGINAL
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
      subgenere: seleccio.subgenere,
      sinopsis: seleccio.sinopsis,
      personatge: configBase.nom,
      ciutat: configBase.ciutat,
      ciutat2: configBase.ciutat2,
      subtubs: configBase.subtubsActius,
      subtubs2: configBase.subtubsActius2,
      pauta: pauta,
      paraulesPerEscena: config.paraulesPerEscena,
      complert: hist.paraulesTotals >= config.paraulesTotals * 0.95
    }
  };
}

// ========== 6. GENERAR LECTURA RÀPIDA ==========
// Per testar 6 escenes sense esperar 60k paraules
export async function generarLectura(seleccio, bancs, numEscenes = 6) {
  const res = await generarLlibre(seleccio, bancs);
  const primerCap = res.capitols[0];
  return {
    escenes: primerCap.escenes.slice(0, numEscenes),
    metadata: res.metadata
  };
}

// EXPOSAR A WINDOW PERQUÈ INDEX.HTML EL CRIDI
window.generarLlibre = generarLlibre;
window.generarLectura = generarLectura;

console.log('✅ Motor V9.9 lec-flix policial carregat - Seed + Pauta + 9 Beats + Mètriques Editorials');