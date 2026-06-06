// js/main.js - Lec-Flix v5: Motor amb històric i config dinàmica
let BANCS = {};
let generarEscenaMotor = null;

// 1. Carrega motor de frases sense export. Es penja a window
try {
  await import(new URL('../core/generadorLlibre.js', import.meta.url).href);
  generarEscenaMotor = window.generarEscena || this.generarEscena;
  console.log('✅ Motor v5 carregat');
} catch (e) {
  console.warn('⚠️ Motor no carregat, usant fallback bàsic', e);
}

// 2. Generador principal - NOMÉS 1 export a tota l'app
export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;
  console.log('Bancs rebuts:', Object.keys(BANCS));

  // 3. Decidir ritme
  let numCapitols, paraulesAprox, escenesPerCap;
  if (seleccio.ritme === 'Relat Curt') {
    numCapitols = 4; paraulesAprox = 5000; escenesPerCap = 3;
  } else if (seleccio.ritme === 'Èpic') {
    numCapitols = 25; paraulesAprox = 100000; escenesPerCap = 6;
  } else {
    numCapitols = 17; paraulesAprox = 60000; escenesPerCap = 5;
  }

  // 4. Carregar bancs
  const personatges = BANCS.banco_personatge || [{id:'p1', genero:'policiac', banco_variables:{nom:['Àlex'], tic:['']} }];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat:'Barcelona', banco_variables:{so:['silenci'], olor:['aire fred']}}];
  const escenaris = BANCS.banco_escenarios || [{nom:'Carrer', ciutat:'Barcelona'}];
  const estructures = BANCS.banco_estructura || { beats: Array(numCapitols).fill({ nom: 'Beat', id: 1 }) };
  const beats = estructures.beats?.length? estructures.beats : Array(numCapitols).fill({ nom: 'Beat', id: 1 });

  // 5. Filtrar selecció usuari
  const persBanc = seleccio.personatgeId? personatges.find(p => p.id === seleccio.personatgeId) : personatges.find(p => p.genero === seleccio.genere) || personatges[0];
  const ubi = seleccio.mon? ubicacions.find(u => u.ciutat === seleccio.mon) : ubicacions[0];

  // 6. Dades base que NO canvien - sense olor/so/escenari fix
  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || '';
  const ciutat = ubi.ciutat;

  const configBase = { genere: seleccio.genere, nom, tic, ciutat };

  // 7. HISTÒRIC per evitar repeticions entre escenes
  let hist = {ubicacions:[], olors:[], sons:[], accions:[], dialogs:[], beats:[]};

  // 8. Generar capítols amb motor v5 + memòria
  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEscena = '';

      if (generarEscenaMotor) {
        // CLAU: passem configBase sense olor/so/escenari fix. El motor els tria cada escena
        const resultat = generarEscenaMotor(beat.nom, configBase, bancs, hist);
        textEscena = resultat.text;
        hist = resultat.hist; // guardar memòria
      } else {
        // FALLBACK amb random bàsic
        const escRandom = escenaris[Math.floor(Math.random()*escenaris.length)];
        textEscena = `${nom} va continuar a ${escRandom.nom}, respirant ${configBase.olor || 'aire'} mentre ${configBase.so || 'silenci'} omplia l'aire.`;
      }

      escenes.push({ titol: `Escena ${numEsc}`, text: textEscena });
    }

    // Tancament capítol amb beat
    escenes.push({ titol: '', text: `<em>${beat.nom} s'acabava amb ${nom} mirant cap a ${ciutat}.</em>` });
    capitols.push({ num: numCap, beat: beat.nom, escenes });
  }

  return {
    capitols,
    metadata: {
      paraulesAprox,
      nCapitols: numCapitols,
      ritme: seleccio.ritme,
      genere: seleccio.genere,
      personatge: nom,
      ciutat
    }
  };
}