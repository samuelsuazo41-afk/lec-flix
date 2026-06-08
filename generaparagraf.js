// generaparagraf.js - Motor Paràgraf V9.9.10 lec-flix policial
// Fixes: anti-{} + anti-repetició olor/so + ritme 3-2-3

let histGlobal = { ubicacions: [], emocions: [], frasesUsades: [], frasesUsadesCap: [], combinacionsUsades: new Set(), paraulesTotals: 0, usosOlor: {}, usosSo: {} };

export async function resetEstructura() {
  histGlobal = { ubicacions: [], emocions: [], frasesUsades: [], frasesUsadesCap: [], combinacionsUsades: new Set(), paraulesTotals: 0, usosOlor: {}, usosSo: {} };
  console.log('🔄 Estructura V9.9.10 resetejada');
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

function pickNoRepetit(arr, hist, tipus, valor) {
  if (!arr || arr.length === 0) return null;
  const disponibles = arr.filter(item => {
    const txt = getTextoBase(item);
    if (!txt) return false;
    if (hist.frasesUsades.includes(txt.substring(0,40))) return false;
    if (tipus === 'olor' && hist.usosOlor[valor] >= 2) return false;
    if (tipus === 'so' && hist.usosSo[valor] >= 2) return false;
    return true;
  });
  const pool = disponibles.length > 0? disponibles : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pronomPerNom(nom) {
  return /^[AEIOUaeiou]/.test(nom)? 'Ella' : 'Ell';
}

function netejaEspais(text) {
  return text.replace(/\s+/g,' ').replace(/\s+([.,])/g,'$1').trim();
}

function forçaPassat(text) {
  // Passa presents comuns a passat perifràstic català
  return text.replace(/\bMira\b/g, 'Va mirar')
            .replace(/\bOlía\b/g, 'Feia olor')
            .replace(/\bSe le congeló\b/g, 'Se li va gelar');
}

function safeReplace(text, vars) {
  let out = text;
  for (const [k,v] of Object.entries(vars)) {
    out = out.replaceAll(k, v);
  }
  out = out.replace(/\{[a-z0-9_\/]+\}/gi, '').trim(); // mata {}
  out = netejaEspais(out);
  return out.length > 10? out : ''; // descarta frases buides
}

export async function generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || histGlobal;
  const { nom, tic, ciutat, subtubActual, beatActual, beatAnterior, sinopsis, pauta, temps } = config;
  const paraulesObjectiu = config.paraulesObjectiu || 500;

  if (numEsc === 1 && numCap % 3 === 0) {
    hist.frasesUsadesCap = [];
    hist.usosOlor = {};
    hist.usosSo = {};
  }

  const escenaris = (bancs.banco_escenarios || []).filter(e => {
    const matchCiutat = e.ciutat === ciutat;
    const matchSubtub =!subtubActual || e.nom?.toLowerCase().includes(subtubActual.toLowerCase()) || subtubActual.toLowerCase().includes(e.nom?.toLowerCase());
    return matchCiutat && matchSubtub;
  });
  let escDisp = escenaris.filter(e =>!hist.ubicacions.slice(-4).includes(e.nom));
  if (escDisp.length === 0) {
    hist.ubicacions = [];
    escDisp = escenaris.length > 0? escenaris : [{nom: subtubActual || ciutat}];
  }
  const escenari = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(escenari.nom);

  let ticActual = tic || 'es passa la mà per la barba';
  if (bancs.banco_personatge?.[0]?.banco_variables?.tic) {
    const tics = bancs.banco_personatge[0].banco_variables.tic;
    ticActual = tics[Math.floor(Math.random() * tics.length)];
  }

  const lectures = bancs.banco_lectura || [];
  const lecturesAux = bancs.banco_lectura_aux || [];
  const olors = (bancs.banco_olors || []).filter(o => o.genero?.includes('policiac'));
  const sons = (bancs.banco_sons || []).filter(s => s.genero?.includes('policiac'));
  const emocions = (bancs.banco_emocions || []).filter(e => e.genero === 'policiac');

  const olorObj = pickNoRepetit(olors, hist, 'olor', null);
  const soObj = pickNoRepetit(sons, hist, 'so', null);
  const emocioObj = pickNoRepetit(emocions, hist);

  const olor = olorObj? getTextoBase(olorObj) : 'aire fred';
  const so = soObj? getTextoBase(soObj) : 'silenci';
  const emocio = emocioObj? getTextoBase(emocioObj) : 'inquietud';
  if (olorObj) hist.usosOlor[olor] = 1;
  if (soObj) hist.usosSo[so] = 1;

  const progress = numCap / totalCaps;
  let capActe = progress <= 0.25? 1 : progress <= 0.75? 2 : 3;

  const varsTemps = { '{any}': temps?.any || '2024', '{mes}': temps?.mes || 'gener', '{dia}': temps?.dia || '1', '{event}': temps?.event || '', '{p0}': nom, '{esc}': escenari.nom, '{olor}': olor, '{so}': so, '{ciutat}': ciutat, '{emocio}': emocio, '{tic}': ticActual };

  const inicios = {
    'hook': `${nom} va obrir els ulls a ${escenari.nom} amb ${emocio} corrent-li per la sang. ${ticActual}. L'olor de ${olor} li omplia els pulmons mentre el ${so} llunyà li recordava que ${ciutat} guardava secrets.`,
    'plantejament': `A ${escenari.nom} ${nom} va sentir ${emocio} quan va comprendre que el cas era més profund. ${ticActual}. Cada racó feia olor de ${olor} i el ${so} el seguia com una ombra.`,
    'setup': `${nom} es va moure per ${escenari.nom} amb ${emocio}, intentant ordenar pensaments mentre l'olor de ${olor} el perseguia. ${ticActual}. El ${so} li deia que el temps s'esgotava.`,
    'giro1': `El ${so} va trencar el silenci de ${escenari.nom} amb força. ${nom} va sentir ${emocio} quan l'olor de ${olor} s'intensificava fins a ofegar-lo. ${ticActual}.`,
    'midpoint': `Al centre de ${escenari.nom}, ${nom} va descobrir la veritat. ${emocio} el va travessar mentre ${olor} i ${so} es barrejaven en una revelació. ${ticActual}.`,
    'giro2': `Res era el que semblava a ${escenari.nom}. ${nom} amb ${emocio} va entendre que havia estat manipulat. L'olor de ${olor} ara sabia a traïció. ${ticActual}.`,
    'crisi': `A ${escenari.nom} tot s'esfondrava. ${nom} amb ${emocio} extrema va veure com l'olor de ${olor} s'esvaïa i el ${so} s'apagava. ${ticActual}.`,
    'climax': beatAnterior === 'crisi'? `Després de la crisi a ${escenari.nom}, ${nom} va avançar amb ${emocio} pura cap a l'enfrontament final. ${ticActual}. ${olor} i ${so} marcaven el ritme del final.` : `L'enfrontament final a ${escenari.nom}. ${nom} va avançar amb ${emocio} pura mentre ${olor} i ${so} marcaven el ritme del final. ${ticActual}.`,
    'resolucio': `${nom} va quedar sol a ${escenari.nom} després de la tempesta. ${emocio} es transformava en pau mentre l'olor de ${olor} es netejava. ${ticActual}.`,
    'default': `${nom} va continuar a ${escenari.nom} amb ${emocio}, ${olor} i ${so} de fons. ${ticActual}.`
  };

  let parrafo = forçaPassat(safeReplace(inicios[beatActual] || inicios['default'], varsTemps));
  let paraulesComptades = contarPalabras(parrafo);
  let fraseIndex = 0;
  let intents = 0;
  let bancLecturaUsat = [...lectures];
  let bancAuxUsat = [...lecturesAux];

  while (paraulesComptades < paraulesObjectiu && intents < 80) {
    intents++;
    let lectura = null;

    // Prioritat banc principal, després auxiliar
    if (bancLecturaUsat.length > 0) {
      lectura = bancLecturaUsat.splice(Math.floor(Math.random() * bancLecturaUsat.length), 1)[0];
    } else if (bancAuxUsat.length > 0) {
      lectura = bancAuxUsat.splice(Math.floor(Math.random() * bancAuxUsat.length), 1)[0];
    }

    if (lectura) {
      let text = forçaPassat(safeReplace(getTextoBase(lectura), varsTemps));
      if (text.length > 20 &&!hist.frasesUsades.includes(text.substring(0,40))) {

        // RITME 3-2-3: frase curta cada 3 frases
        if (fraseIndex % 3 === 2 && contarPalabras(text) > 15) {
          text = text.split('.')[0] + '.'; // talla a primera frase
        }

        // Canvia nom per pronom a partir de frase 1
        if (fraseIndex >= 1) {
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

    // Fallback amb comptadors d'ús
    if (emocions.length > 0) {
      const emo = forçaPassat(safeReplace(getTextoBase(emocions[Math.floor(Math.random() * emocions.length)]), varsTemps));
      parrafo += ` ${pronomPerNom(nom)} va sentir ${emo} que li cremava per dins mentre caminava per ${escenari.nom}.`;
      paraulesComptades = contarPalabras(parrafo);
      fraseIndex++;
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
      beatAnterior: beatAnterior,
      acte: capActe,
      temps: temps?.any + '/' + temps?.mes
    }
  };
}

window.generarEscena = generaParagraf;
console.log('✅ Motor Paràgraf V9.9.10 carregat - anti-{} + ritme + anti-repetició');