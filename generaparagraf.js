// generaparagraf.js - Motor Paràgraf V9.9.9 lec-flix policial
// Novetats V9.9.9: temps {any}{mes}{dia}{event}, tics variables, beatAnterior, frasesUsadesCap, subtubActual

let histGlobal = {
  ubicacions: [],
  emocions: [],
  frasesUsades: [],
  frasesUsadesCap: [],
  combinacionsUsades: new Set(),
  paraulesTotals: 0
};

export async function resetEstructura() {
  histGlobal = {
    ubicacions: [],
    emocions: [],
    frasesUsades: [],
    frasesUsadesCap: [],
    combinacionsUsades: new Set(),
    paraulesTotals: 0
  };
  console.log('🔄 Estructura V9.9.9 resetejada');
}

function contarPalabras(texto) {
  return texto.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function getTextoBase(item) {
  const tb = item.texto_base;
  if (Array.isArray(tb)) return tb[0] || '';
  if (typeof tb === 'string') return tb;
  return item.text || '';
}

function pickNoRepetit(arr, hist) {
  if (!arr || arr.length === 0) return null;
  const disponibles = arr.filter(item => {
    const txt = getTextoBase(item);
    return txt &&!hist.frasesUsades.includes(txt.substring(0,40));
  });
  const pool = disponibles.length > 0? disponibles : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pronomPerNom(nom) {
  return /^[AEIOUaeiou]/.test(nom)? 'Ella' : 'Ell';
}

function safeReplace(text, vars) {
  let out = text;
  for (const [k,v] of Object.entries(vars)) {
    out = out.replaceAll(k, v);
  }
  // Neteja qualsevol placeholder que hagi quedat
  out = out.replace(/\{[a-z0-9_\/]+\}/gi, '').replace(/\s+/g,' ').trim();
  return out;
}

export async function generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || histGlobal;
  const {
    nom,
    tic,
    ciutat,
    subtubActual,
    beatActual,
    beatAnterior,
    sinopsis,
    pauta,
    temps
  } = config;

  const paraulesObjectiu = config.paraulesObjectiu || 500;

  // CANVI 1: Anti-repetició cada 3 capítols
  if (numEsc === 1 && numCap % 3 === 0) {
    hist.frasesUsadesCap = [];
  }

  // CANVI 2: Usar subtubActual en lloc de filtrar només per ciutat
  const escenaris = (bancs.banco_escenarios || []).filter(e => {
    const matchCiutat = e.ciutat === ciutat;
    const matchSubtub =!subtubActual ||
      e.nom?.toLowerCase().includes(subtubActual.toLowerCase()) ||
      subtubActual.toLowerCase().includes(e.nom?.toLowerCase());
    return matchCiutat && matchSubtub;
  });

  let escDisp = escenaris.filter(e =>!hist.ubicacions.slice(-4).includes(e.nom));
  if (escDisp.length === 0) {
    hist.ubicacions = [];
    escDisp = escenaris.length > 0? escenaris : [{nom: subtubActual || ciutat}];
  }
  const escenari = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(escenari.nom);

  // CANVI 3: Tics des de banco_personatge variables
  let ticActual = tic || 'es passa la mà per la barba';
  if (bancs.banco_personatge && bancs.banco_personatge[0]?.banco_variables?.tic) {
    const tics = bancs.banco_personatge[0].banco_variables.tic;
    ticActual = tics[Math.floor(Math.random() * tics.length)];
  }

  const lectures = bancs.banco_lectura || [];
  const lecturesAux = bancs.banco_lectura_aux || [];
  const olors = (bancs.banco_olors || []).filter(o => o.genero?.includes('policiac'));
  const sons = (bancs.banco_sons || []).filter(s => s.genero?.includes('policiac'));
  const emocions = (bancs.banco_emocions || []).filter(e => e.genero === 'policiac');

  const olorObj = pickNoRepetit(olors, hist);
  const soObj = pickNoRepetit(sons, hist);
  const emocioObj = pickNoRepetit(emocions, hist);

  const olor = olorObj? getTextoBase(olorObj) : 'aire fred';
  const so = soObj? getTextoBase(soObj) : 'silenci';
  const emocio = emocioObj? getTextoBase(emocioObj) : 'inquietud';

  const progress = numCap / totalCaps;
  let capActe = progress <= 0.25? 1 : progress <= 0.75? 2 : 3;

  // CANVI 4: Variables de temps per safeReplace
  const varsTemps = {
    '{any}': temps?.any || '2024',
    '{mes}': temps?.mes || 'gener',
    '{dia}': temps?.dia || '1',
    '{event}': temps?.event || '',
    '{p0}': nom,
    '{esc}': escenari.nom,
    '{olor}': olor,
    '{so}': so,
    '{ciutat}': ciutat,
    '{emocio}': emocio,
    '{tic}': ticActual
  };

  // CANVI 5: Hooks que recorden beatAnterior
  const inicios = {
    'hook': `${nom} va obrir els ulls a ${escenari.nom} amb ${emocio} corrent-li per la sang. ${ticActual}. L'olor de ${olor} li omplia els pulmons mentre el ${so} llunyà li recordava que ${ciutat} guardava secrets.`,

    'plantejament': `A ${escenari.nom} ${nom} va sentir ${emocio} quan va comprendre que el cas era més profund. ${ticActual}. Cada racó feia olor de ${olor} i el ${so} el seguia com una ombra.`,

    'setup': `${nom} es va moure per ${escenari.nom} amb ${emocio}, intentant ordenar pensaments mentre l'olor de ${olor} el perseguia. ${ticActual}. El ${so} li deia que el temps s'esgotava.`,

    'giro1': `El ${so} va trencar el silenci de ${escenari.nom} amb força. ${nom} va sentir ${emocio} quan l'olor de ${olor} s'intensificava fins a ofegar-lo. ${ticActual}.`,

    'midpoint': `Al centre de ${escenari.nom}, ${nom} va descobrir la veritat. ${emocio} el va travessar mentre ${olor} i ${so} es barrejaven en una revelació. ${ticActual}.`,

    'giro2': `Res era el que semblava a ${escenari.nom}. ${nom} amb ${emocio} va entendre que havia estat manipulat. L'olor de ${olor} ara sabia a traïció. ${ticActual}.`,

    'crisi': `A ${escenari.nom} tot s'esfondrava. ${nom} amb ${emocio} extrema va veure com l'olor de ${olor} s'esvaïa i el ${so} s'apagava. ${ticActual}.`,

    'climax': beatAnterior === 'crisi'
     ? `Després de la crisi a ${escenari.nom}, ${nom} va avançar amb ${emocio} pura cap a l'enfrontament final. ${ticActual}. ${olor} i ${so} marcaven el ritme del final.`
      : `L'enfrontament final a ${escenari.nom}. ${nom} va avançar amb ${emocio} pura mentre ${olor} i ${so} marcaven el ritme del final. ${ticActual}.`,

    'resolucio': `${nom} va quedar sol a ${escenari.nom} després de la tempesta. ${emocio} es transformava en pau mentre l'olor de ${olor} es netejava. ${ticActual}.`,

    'default': `${nom} va continuar a ${escenari.nom} amb ${emocio}, ${olor} i ${so} de fons. ${ticActual}.`
  };

  let parrafo = safeReplace(inicios[beatActual] || inicios['default'], varsTemps);
  let paraulesComptades = contarPalabras(parrafo);
  let fraseIndex = 0;

  let intents = 0;
  let bancLecturaUsat = [...lectures];
  let bancAuxUsat = [...lecturesAux];

  while (paraulesComptades < paraulesObjectiu && intents < 80) {
    intents++;

    let lectura = null;
    if (bancLecturaUsat.length > 0) {
      lectura = bancLecturaUsat.splice(Math.floor(Math.random() * bancLecturaUsat.length), 1)[0];
    } else if (bancAuxUsat.length > 0) {
      lectura = bancAuxUsat.splice(Math.floor(Math.random() * bancAuxUsat.length), 1)[0];
    }

    if (lectura) {
      let text = safeReplace(getTextoBase(lectura), varsTemps);
      if (text.length > 20 &&!hist.frasesUsades.includes(text.substring(0,40))) {
        // Evita repetir el nom a cada frase
        if (fraseIndex > 0) {
          text = text.replace(new RegExp(`\\b${nom}\\b`, 'g'), pronomPerNom(nom));
        }
        parrafo += ` ${text}`;
        hist.frasesUsades.push(text.substring(0,40));
        hist.frasesUsadesCap.push(text.substring(0,40));
        paraulesComptades = contarPalabras(parrafo);
        fraseIndex++;
        continue;
      }
    }

    if (emocions.length > 0) {
      const emo = safeReplace(getTextoBase(emocions[Math.floor(Math.random() * emocions.length)]), varsTemps);
      parrafo += ` ${nom} sentia ${emo} que li cremava per dins mentre caminava per ${escenari.nom}.`;
      paraulesComptades = contarPalabras(parrafo);
      fraseIndex++;
      continue;
    }

    if (olors.length > 0) {
      const olor2 = safeReplace(getTextoBase(olors[Math.floor(Math.random() * olors.length)]), varsTemps);
      parrafo += ` L'olor de ${olor2} s'enfilava per les parets de ${escenari.nom}, barrejant-se amb ${olor}.`;
      paraulesComptades = contarPalabras(parrafo);
      fraseIndex++;
      continue;
    }

    if (sons.length > 0) {
      const so2 = safeReplace(getTextoBase(sons[Math.floor(Math.random() * sons.length)]), varsTemps);
      parrafo += ` El ${so2} ressonava llunyà entre els carrers de ${ciutat}, acompanyant el ${so}.`;
      paraulesComptades = contarPalabras(parrafo);
      fraseIndex++;
      continue;
    }
  }

  // CANVI 6: Tancament segons acte i beatAnterior
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
      beatAnterior: beatAnterior,
      acte: capActe,
      temps: temps?.any + ' + temps?.mes
    }
  };
}

window.generarEscena = generaParagraf;
console.log('✅ Motor Paràgraf V9.9.9 carregat - temps + tics + memòria beat + subtubActual');