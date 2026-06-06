// js/main.js - Lec-Flix v4: Motor amb històric per continuïtat
let BANCS = {};
let generarEscenaMotor = null;

// 1. Carrega motor de frases sense export. Es penja a window
try {
  await import(new URL('../core/generadorLlibre.js', import.meta.url).href);
  generarEscenaMotor = window.generarEscena || this.generarEscena;
  console.log('✅ Motor de frases amb memòria carregat');
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
  const esc = seleccio.escenariId? escenaris.find(e => e.id === seleccio.escenariId) : escenaris.find(e => e.ciutat === ubi.ciutat && e.genero?.includes(seleccio.genere)) || escenaris[0];

  // 6. Dades base que no canvien
  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || '';
  const ciutat = ubi.ciutat;

  const olorsPool = BANCS.banco_olors?.filter(o => o.genero?.includes(seleccio.genere)) || [];
  const olorBanc = olorsPool.length? olorsPool[Math.floor(Math.random()*olorsPool.length)] : null;
  const olor = olorBanc? olorBanc.texto_base[Math.floor(Math.random() * olorBanc.texto_base.length)] : ubi.banco_variables?.olor?.[0] || 'aire fred';

  const sonsPool = BANCS.banco_sons?.filter(s => s.genero?.includes(seleccio.genere)) || [];
  const soBanc = sonsPool.length? sonsPool[Math.floor(Math.random()*sonsPool.length)] : null;
  const so = soBanc? soBanc.texto_base[Math.floor(Math.random() * soBanc.texto_base.length)] : ubi.banco_variables?.so?.[0] || 'silenci';

  const configBase = { genere: seleccio.genere, nom, tic, ciutat, escenari: esc.nom, olor, so };

  // 7. HISTÒRIC per evitar repeticions entre escenes
  let hist = {ubicacions:[], accions:[], dialogs:[], beats:[]};

  // 8. Generar capítols amb motor ampliat + memòria
  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEscena = '';

      if (generarEscenaMotor) {
        // USA MOTOR AMPLIAT: genera paràgraf sencer + memòria
        const resultat = generarEscenaMotor(beat.nom, configBase, bancs, hist);
        textEscena = resultat.text;
        hist = resultat.hist; // ← CLAU: guardar memòria per la següent escena
      } else {
        // FALLBACK: paràgraf continu si el motor falla
        textEscena = `${nom} va continuar a ${esc.nom}, respirant ${olor} mentre ${so} omplia l'aire. El tic de ${tic} el delatava mentre pensava en ${ciutat}.`;
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
      ciutat,
      escenari: esc.nom
    }
  };
}

// Funcions auxiliars
function plantilla(tipus, lectures, genere) {
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