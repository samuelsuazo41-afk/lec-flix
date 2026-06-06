// js/main.js - Lec-Flix v3: Cablejat amb motor de frases ampliat
let BANCS = {};
let generarEscenaMotor = null;

// Carrega motor de frases sense duplicar export
try {
  await import(new URL('../core/generadorLlibre.js', import.meta.url).href);
  generarEscenaMotor = window.generarEscena || this.generarEscena;
  console.log('✅ Motor de frases carregat');
} catch (e) {
  console.warn('⚠️ Motor no carregat, usant fallback bàsic');
}

// Generador principal - NOMÉS 1 export a tota l'app
export async function generarLlibre(seleccio, bancs) {
  BANCS = bancs;
  console.log('Bancs rebuts:', Object.keys(BANCS));

  // 1. Decidir ritme
  let numCapitols, paraulesAprox, escenesPerCap;
  if (seleccio.ritme === 'Relat Curt') {
    numCapitols = 4; paraulesAprox = 5000; escenesPerCap = 3;
  } else if (seleccio.ritme === 'Èpic') {
    numCapitols = 25; paraulesAprox = 100000; escenesPerCap = 6;
  } else {
    numCapitols = 17; paraulesAprox = 60000; escenesPerCap = 5;
  }

  // 2. Carregar bancs
  const personatges = BANCS.banco_personatge || [{id:'p1', genero:'policiac', banco_variables:{nom:['Àlex'], tic:['']} }];
  const ubicacions = BANCS.banco_ubicacion || [{ciutat:'Barcelona', banco_variables:{so:['silenci'], olor:['aire fred']}}];
  const escenaris = BANCS.banco_escenarios || [{nom:'Carrer', ciutat:'Barcelona'}];
  const estructures = BANCS.banco_estructura || { beats: Array(numCapitols).fill({ nom: 'Beat', id: 1 }) };
  const beats = estructures.beats?.length? estructures.beats : Array(numCapitols).fill({ nom: 'Beat', id: 1 });

  // 3. Filtrar selecció usuari
  const persBanc = seleccio.personatgeId? personatges.find(p => p.id === seleccio.personatgeId) : personatges.find(p => p.genero === seleccio.genere) || personatges[0];
  const ubi = seleccio.mon? ubicacions.find(u => u.ciutat === seleccio.mon) : ubicacions[0];
  const esc = seleccio.escenariId? escenaris.find(e => e.id === seleccio.escenariId) : escenaris.find(e => e.ciutat === ubi.ciutat && e.genero?.includes(seleccio.genere)) || escenaris[0];

  // 4. Dades base
  const nom = persBanc?.banco_variables?.nom?.[0] || 'Protagonista';
  const tic = persBanc?.banco_variables?.tic?.[0] || '';
  const olorsPool = BANCS.banco_olors?.filter(o => o.genero?.includes(seleccio.genere)) || [];
  const olorBanc = olorsPool.length? olorsPool[0] : null;
  const olor = olorBanc? olorBanc.texto_base[Math.floor(Math.random() * olorBanc.texto_base.length)] : ubi.banco_variables?.olor?.[0] || 'aire fred';
  const sonsPool = BANCS.banco_sons?.filter(s => s.genero?.includes(seleccio.genere)) || [];
  const soBanc = sonsPool.length? sonsPool[0] : null;
  const so = soBanc? soBanc.texto_base[Math.floor(Math.random() * soBanc.texto_base.length)] : ubi.banco_variables?.so?.[0] || 'silenci';

  const configBase = { genere: seleccio.genere, nom, tic, ciutat: ubi.ciutat, escenari: esc.nom, olor, so };

  // 5. Històric per evitar repeticions
  const hist = {ubicacions:[], escenes:[], personatges:[], beats:[]};

  // 6. Generar capítols amb motor ampliat - SENSE limitació de frases curtes
  const capitols = [];
  for (let numCap = 1; numCap <= numCapitols; numCap++) {
    const beat = beats[(numCap - 1) % beats.length];
    const escenes = [];

    for (let numEsc = 1; numEsc <= escenesPerCap; numEsc++) {
      let textEscena = '';

      if (generarEscenaMotor) {
        // USA MOTOR AMPLIAT: genera paràgraf sencer amb olor+so+emoció
        const escenaMotor = generarEscenaMotor(beat, configBase, bancs, hist);
        textEscena = escenaMotor.text;
      } else {
        // FALLBACK: paràgraf continu, sense "Frase y. Frase y."
        const dades = { p0: nom, esc: esc.nom, olor, so, tic, ciutat: ubi.ciutat };
        textEscena = `${dades.p0} va obrir els ulls a ${dades.esc}, respirant ${dades.olor} mentre ${dades.so} omplia l'aire. El tic de ${dades.tic} el delatava mentre pensava en ${dades.ciutat}.`;
      }

      escenes.push({
        titol: `Escena ${numEsc}`,
        text: textEscena // Paràgraf sencer, sense punts entre frases
      });
    }

    // Tancament capítol
    escenes.push({
      titol: '',
      text: `<em>${beat.nom} s'acabava amb ${nom} mirant cap a ${ubi.ciutat}.</em>`
    });

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
      ciutat: ubi.ciutat,
      escenari: esc.nom
    }
  };
}

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