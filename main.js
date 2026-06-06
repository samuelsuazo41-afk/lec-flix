// js/main.js - Lec-Flix V8.1: Estándar editorial amb retry de motor
let BANCS = {};
let generarEscenaMotor = null;

// CARREGAR MOTOR AMB RETRY - evita "is not a function"
async function cargarMotor() {
  try {
    // FORZAR PATH ABSOLUT per GitHub Pages
    await import('https://samuelsuazo41-afk.github.io/core/generadorLlibre.js?v=' + Date.now());
  } catch (e1) {
    console.error('❌ ERROR CRÍTIC:', e1);
    alert('ERROR: No es pot carregar el motor. URL: https://samuelsuazo41-afk.github.io/core/generadorLlibre.js');
    return false;
  }

  generarEscenaMotor = window.generarEscena;
  if (typeof generarEscenaMotor!== 'function') {
    alert('ERROR: window.generarEscena no és funció');
    return false;
  }
  console.log('✅ Motor V8.2 carregat correctament');
  return true;
}

// Carregar motor abans d'exportar funció
await cargarMotor();

export async function generarLlibre(seleccio, bancs) {
  if (!generarEscenaMotor) {
    throw new Error('Motor no carregat. Recarrega la pàgina amb Ctrl+F5');
  }

  BANCS = bancs;
  console.log('📚 Bancs rebuts a main:', Object.keys(BANCS));

  // ESTÀNDAR EDITORIAL V8.1
  let numCapitols, paraulesTotals, escenesPerCap, paraulesPerEscena;

  if (seleccio.ritme === 'Relat Curt') {
    // 5.000 - 10.000 paraules
    numCapitols = 4;
    paraulesTotals = 5000;
    escenesPerCap = 5;
    paraulesPerEscena = 250; // 5 x 250 x 4 = 5.000

  } else if (seleccio.ritme === 'Èpic') {
    // 70.000 - 90.000 paraules
    numCapitols = 30;
    paraulesTotals = 72000;
    escenesPerCap = 8;
    paraulesPerEscena = 300; // 8 x 300 x 30 = 72.000

  } else {
    // Novel·la estàndard / Best seller 60.000 - 70.000
    numCapitols = 20;
    paraulesTotals = 60000;
    escenesPerCap = 6;
    paraulesPerEscena = 500; // 6 x 500 x 20 = 60.000
  }

  const personatges = BANCS.banco_personatge || [{id:'p1', genero:'policiac', banco_variables:{nom:['Inspector Martí Vallmitjana'], tic:['es passa la mà per la barba quan menteixen']} }];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat:'Girona'}];

  const persBanc = seleccio.personatgeId
   ? personatges.find(p => p.id === seleccio.personatgeId)
    : personatges.find(p => p.genero === seleccio.genere) || personatges[0];

  const ubi = seleccio.mon
   ? ubicacions.find(u => u.ciutat === seleccio.mon)
    : ubicacions[0];

  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || 'es passa la mà per la barba';
  const ciutat = ubi.ciutat;

  const configBase = { genere: seleccio.genere, nom, tic, ciutat };

  let hist = {ubicacions:[], olors:[], sons:[], frasesUsades:[], tensions:0, capActe:1};

  const estructures = BANCS.banco_estructura || { beats: Array(numCapitols).fill({ nom: 'Beat' }) };
  const beats = estructures.beats?.length
   ? estructures.beats
    : Array(numCapitols).fill({ nom: 'Beat' });

  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      // CRIDA AL MOTOR V8.1 amb 8 paràmetres
      const resultat = generarEscenaMotor(
        beat.nom,
        configBase,
        bancs,
        hist,
        numCap,
        numEsc,
        numCapitols,
        paraulesPerEscena
      );
      hist = resultat.hist;
      escenes.push({ titol: `Escena ${numEsc}`, text: resultat.text });
    }

    escenes.push({ titol: '', text: `<em>${beat.nom} s'acabava amb ${nom} mirant cap a ${ciutat}</em>` });
    capitols.push({ num: numCap, beat: beat.nom, escenes });
  }

  return {
    capitols,
    metadata: {
      paraulesAprox: paraulesTotals,
      nCapitols: numCapitols,
      ritme: seleccio.ritme,
      genere: seleccio.genere,
      personatge: nom,
      ciutat,
      paraulesPerEscena
    }
  };
}