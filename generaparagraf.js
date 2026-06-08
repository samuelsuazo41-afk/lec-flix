// generaparagraf.js - Motor Paràgraf V9.9.4.2 lec-flix policial
// Fix final: concatenacions netes amb += template literal

let histGlobal = { ubicacions: [], emocions: [], frasesUsades: [], paraulesTotals: 0 };

export async function resetEstructura() {
  histGlobal = { ubicacions: [], emocions: [], frasesUsades: [], paraulesTotals: 0 };
  console.log('🔄 Estructura V9.9.4.2 resetejada');
}

function contarPalabras(texto) {
  return texto.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function pickNoRepetit(arr, hist) {
  if (!arr || arr.length === 0) return null;
  const disponibles = arr.filter(item =>!hist.frasesUsades.includes(item.texto_base?.substring(0,40)));
  const pool = disponibles.length > 0? disponibles : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || histGlobal;
  const { nom, ciutat, subtubActual, beatActual, sinopsis, pauta } = config;
  const paraulesObjectiu = config.paraulesObjectiu || 500;

  const escenaris = (bancs.banco_escenarios || []).filter(e => e.ciutat === ciutat && (!subtubActual || e.nom?.toLowerCase().includes(subtubActual.toLowerCase())));
  let escDisp = escenaris.filter(e =>!hist.ubicacions.slice(-4).includes(e.nom));
  if (escDisp.length === 0) {
    hist.ubicacions = [];
    escDisp = escenaris.length > 0? escenaris : [{nom: subtubActual || ciutat}];
  }
  const escenari = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(escenari.nom);

  const lectures = bancs.banco_lectura || [];
  const olors = (bancs.banco_olors || []).filter(o => o.genero?.includes('policiac'));
  const sons = (bancs.banco_sons || []).filter(s => s.genero?.includes('policiac'));
  const emocions = (bancs.banco_emocions || []).filter(e => e.genero === 'policiac');

  const olorObj = pickNoRepetit(olors, hist);
  const soObj = pickNoRepetit(sons, hist);
  const emocioObj = pickNoRepetit(emocions, hist);
  const olor = olorObj? olorObj.texto_base[0] : 'aire fred';
  const so = soObj? soObj.texto_base[0] : 'silenci';
  const emocio = emocioObj? emocioObj.texto_base[0] : 'inquietud';

  const progress = numCap / totalCaps;
  let capActe = progress <= 0.25? 1 : progress <= 0.75? 2 : 3;

  const inicios = {
    'hook': `${nom} va obrir els ulls a ${escenari.nom} amb ${emocio} corrent-li per la sang. L'olor de ${olor} li omplia els pulmons mentre el ${so} llunyà li recordava que ${ciutat} guardava secrets. ${sinopsis.substring(0,60)}...`,
    'plantejament': `A ${escenari.nom} ${nom} va sentir ${emocio} quan va comprendre que el cas era més profund. Cada racó feia olor de ${olor} i el ${so} el seguia com una ombra.`,
    'setup': `${nom} es va moure per ${escenari.nom} amb ${emocio}, intentant ordenar pensaments mentre l'olor de ${olor} el perseguia. El ${so} li deia que el temps s'esgotava.`,
    'giro1': `El ${so} va trencar el silenci de ${escenari.nom} amb força. ${nom} va sentir ${emocio} quan l'olor de ${olor} s'intensificava fins a ofegar-lo.`,
    'midpoint': `Al centre de ${escenari.nom}, ${nom} va descobrir la veritat. ${emocio} el va travessar mentre ${olor} i ${so} es barrejaven en una revelació.`,
    'giro2': `Res era el que semblava a ${escenari.nom}. ${nom} amb ${emocio} va entendre que havia estat manipulat. L'olor de ${olor} ara sabia a traïció.`,
    'crisi': `A ${escenari.nom} tot s'esfondrava. ${nom} amb ${emocio} extrema va veure com l'olor de ${olor} s'esvaïa i el ${so} s'apagava.`,
    'climax': `L'enfrontament final a ${escenari.nom}. ${nom} va avançar amb ${emocio} pura mentre ${olor} i ${so} marcaven el ritme del final.`,
    'resolucio': `${nom} va quedar sol a ${escenari.nom} després de la tempesta. ${emocio} es transformava en pau mentre l'olor de ${olor} es netejava.`,
    'default': `${nom} va continuar a ${escenari.nom} amb ${emocio}, ${olor} i ${so} de fons.`
  };

  let parrafo = inicios[beatActual] || inicios['default'];
  let paraulesComptades = contarPalabras(parrafo);

  let intents = 0;
  let bancLecturaUsat = [...lectures];
  while (paraulesComptades < paraulesObjectiu && intents < 80) {
    intents++;

    if (bancLecturaUsat.length > 0) {
      const lectura = bancLecturaUsat.splice(Math.floor(Math.random() * bancLecturaUsat.length), 1)[0];
      let text = lectura.texto_base || lectura.text || '';
      text = text.replace(/{p0}/g, nom).replace(/{esc}/g, escenari.nom).replace(/{olor}/g, olor)
              .replace(/{so}/g, so).replace(/{ciutat}/g, ciutat).replace(/{emocio}/g, emocio)
              .replace(/\n/g, ' ').trim();
      if (text.length > 30 &&!hist.frasesUsades.includes(text.substring(0,40))) {
        parrafo += ' ' + text;
        hist.frasesUsades.push(text.substring(0,40));
        paraulesComptades = contarPalabras(parrafo);
        continue;
      }
    }

    if (emocions.length > 0) {
      const emo = emocions[Math.floor(Math.random() * emocions.length)].texto_base[0];
      parrafo += ` ${nom} sentia ${emo} que li cremava per dins mentre caminava per ${escenari.nom}.`;
      paraulesComptades = contarPalabras(parrafo);
      continue;
    }

    if (olors.length > 0) {
      const olor2 = olors[Math.floor(Math.random() * olors.length)].texto_base[0];
      parrafo += ` L'olor de ${olor2} s'enfilava per les parets de ${escenari.nom}, barrejant-se amb ${olor}.`;
      paraulesComptades = contarPalabras(parrafo);
      continue;
    }

    if (sons.length > 0) {
      const so2 = sons[Math.floor(Math.random() * sons.length)].texto_base[0];
      parrafo += ` El ${so2} ressonava llunyà entre els carrers de ${ciutat}, acompanyant el ${so}.`;
      paraulesComptades = contarPalabras(parrafo);
      continue;
    }
  }

  if (capActe === 2 && numEsc % 2 === 0) {
    parrafo += ` De sobte va entendre que tot el que creia sobre el cas era una mentida elaborada durant anys.`;
  } else if (capActe === 3 && numEsc === config.escenesPerCap) {
    parrafo += ` I finalment va comprendre que el viatge havia valgut la pena malgrat el dolor.`;
  } else {
    parrafo += ` I va saber que ja no hi havia volta enrere.`;
  }

  paraulesComptades = contarPalabras(parrafo);
  hist.paraulesTotals += paraulesComptades;
  console.log(`✅ Cap${numCap} Esc${numEsc} ${beatActual}: ${paraulesComptades}/${paraulesObjectiu} paraules`);

  return {
    text: parrafo.trim(),
    hist,
    metadata: {
      paraules: paraulesComptades,
      ubicacio: escenari.nom,
      emocio: emocio,
      beat: beatActual,
      acte: capActe
    }
  };
}

window.generarEscena = generaParagraf;
console.log('✅ Motor Paràgraf V9.9.4.2 carregat - Concatenacions fixes');