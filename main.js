// js/main.js - Lec-Flix v6: Paràgrafs llargs
let BANCS = {};
let generarEscenaMotor = null;

try {
  await import(new URL('../core/generadorLlibre.js', import.meta.url).href);
  generarEscenaMotor = window.generarEscena;
  console.log('✅ Motor v6 carregat');
} catch (e) {
  console.warn('⚠️ Motor no carregat', e);
}

export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;

  // Ritme amb paraules reals de novel·la
  let numCapitols, paraulesAprox, escenesPerCap;
  if (seleccio.ritme === 'Relat Curt') {
    numCapitols = 4; paraulesAprox = 8000; escenesPerCap = 4; // 500 paraules/escena
  } else if (seleccio.ritme === 'Èpic') {
    numCapitols = 30; paraulesAprox = 100000; escenesPerCap = 8; // 400 paraules/escena
  } else {
    numCapitols = 20; paraulesAprox = 70000; escenesPerCap = 6; // 580 paraules/escena = estàndard
  }

  const personatges = BANCS.banco_personatge || [{id:'p1', genero:'policiac', banco_variables:{nom:['Àlex'], tic:['es passa la mà per la barba']} }];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat:'Barcelona'}];

  const persBanc = seleccio.personatgeId? personatges.find(p => p.id === seleccio.personatgeId) : personatges.find(p => p.genero === seleccio.genere) || personatges[0];
  const ubi = seleccio.mon? ubicacions.find(u => u.ciutat === seleccio.mon) : ubicacions[0];

  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || 'es passa la mà per la barba';
  const ciutat = ubi.ciutat;

  // CLAU: configBase SENSE olor/so fix. El motor els tria cada escena
  const configBase = { genere: seleccio.genere, nom, tic, ciutat };

  let hist = {ubicacions:[], olors:[], sons:[], accions:[], tensions:0};
  const estructures = BANCS.banco_estructura || { beats: Array(numCapitols).fill({ nom: 'Beat', id: 1 }) };
  const beats = estructures.beats?.length? estructures.beats : Array(numCapitols).fill({ nom: 'Beat' });

  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEscena = '';

      if (generarEscenaMotor) {
        // CLAU: passar 7 paràmetres perquè faci paràgraf llarg
        const resultat = generarEscenaMotor(beat.nom, configBase, bancs, hist, numCap, numEsc, numCapitols);
        textEscena = resultat.text;
        hist = resultat.hist;
      } else {
        textEscena = `${nom} va continuar... FALLBACK ACTIU. Motor no carregat.`;
      }

      escenes.push({ titol: `Escena ${numEsc}`, text: textEscena });
    }

    escenes.push({ titol: '', text: `<em>${beat.nom} s'acabava amb ${nom} mirant cap a ${ciutat}.</em>` });
    capitols.push({ num: numCap, beat: beat.nom, escenes });
  }

  return { capitols, metadata: { paraulesAprox, nCapitols: numCapitols, ritme: seleccio.ritme, genere: seleccio.genere, personatge: nom, ciutat } };
}