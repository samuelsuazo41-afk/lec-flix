// generarllibre.js - Motor Híbrid V14.3.0 Lec-Flix Policial
// 100% compatible amb main.js V14.3.0 + index.html V14.3.0
// Modes: escena | capitol | llibre + 34 plantilles pautes

let histGlobal = {
  ubicacions: [],
  emocions: [],
  frasesUsades: [],
  frasesUsadesCap: [],
  combinacionsUsades: new Set(),
  paraulesTotals: 0,
  usosOlor: {},
  usosSo: {},
  olorUsadaEscena: false,
  beatAnterior: null
};

export async function resetEstructura() {
  histGlobal = {
    ubicacions: [],
    emocions: [],
    frasesUsades: [],
    frasesUsadesCap: [],
    combinacionsUsades: new Set(),
    paraulesTotals: 0,
    usosOlor: {},
    usosSo: {},
    olorUsadaEscena: false,
    beatAnterior: null
  };
  console.log('🔄 Estructura V14.3.0 resetejada');
}

function contarPalabras(texto) {
  return texto.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function getTextoBase(item) {
  if (!item) return '';
  const tb = item.texto_base;
  if (Array.isArray(tb)) return tb[0] || '';
  if (typeof tb === 'string') return tb;
  return item.text || '';
}

function pickNoRepetit(arr, hist, tipus) {
  if (!arr || arr.length === 0) return null;
  const disponibles = arr.filter(item => {
    const txt = getTextoBase(item);
    if (!txt) return false;
    if (hist.frasesUsades.includes(txt.substring(0,40))) return false;
    if (tipus === 'olor' && (hist.usosOlor[txt] || 0) >= 2) return false;
    if (tipus === 'so' && (hist.usosSo[txt] || 0) >= 2) return false;
    return true;
  });
  const pool = disponibles.length > 0? disponibles : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pronomPerNom(nom) {
  return /^[AEIOUaeiou]/.test(nom)? 'Ella' : 'Ell';
}

function netejaEspais(text) {
  return text
  .replace(/\s+/g,' ')
  .replace(/\s+([.,])/g,'$1')
  .replace(/\bel una\b/gi, 'una')
  .replace(/\bla una\b/gi, 'una')
  .trim();
}

function forçaPassat(text) {
  return text
  .replace(/\bMira\b/g, 'Va mirar')
  .replace(/\bOlía\b/g, 'Feia olor')
  .replace(/\bSe le congeló\b/g, 'Se li va gelar')
  .replace(/\bSiente\b/g, 'Va sentir')
  .replace(/\bCamina\b/g, 'Va caminar');
}

function safeReplace(text, vars) {
  let out = text;
  const nom = vars['{p0}'] || vars['prota'] || vars['{{prota}}'] || 'Rita';
  const nom2 = vars['{p1}'] || vars['antagonista'] || vars['{{antagonista}}'] || 'Víctor';

  out = out.replace(/\bmotor\s+de\s+la\s+moto\b/gi, 'motor');
  out = out.replace(/(\buna moto accelerant fort\b|\bmotor\b)\s*,\s*sec i fred/gi, '$1 sec i fred');
  out = out.replace(/\bell\b/gi, nom2);
  out = out.replace(/\bella\b/gi, nom);
  out = out.replace(/\bEll\b/gi, nom2);
  out = out.replace(/\bElla\b/gi, nom);
  out = out.replace(/\{\}/g, nom);

  for (const [k,v] of Object.entries(vars)) {
    if (v) out = out.replaceAll(k, v);
  }
  out = out.replace(/\{[^}]*\}/g, '').trim();
  out = netejaEspais(out);
  return out.length > 10? out : '';
}

// AUTO-INIT hist si falta alguna clau
function blindarHist(hist) {
  hist.usosOlor = hist.usosOlor || {};
  hist.usosSo = hist.usosSo || {};
  hist.olorUsadaEscena = hist.olorUsadaEscena!== undefined? hist.olorUsadaEscena : false;
  hist.frasesUsades = hist.frasesUsades || [];
  hist.frasesUsadesCap = hist.frasesUsadesCap || [];
  hist.ubicacions = hist.ubicacions || [];
  hist.beatAnterior = hist.beatAnterior || null;
  return hist;
}

const CONNECTORS = ['Però', 'De cop', 'Mentrestant', 'Aleshores', 'Sense avís'];

async function generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = blindarHist(hist || histGlobal);

  // CABLEJAT 100% AMB MAIN.JS
  const { variables = {}, plantillaId, prompt_master, idioma = 'CAT', ciutat_1, ciutat_2, escenesPerCap = 3 } = config;

  const nom = variables.prota || variables['{p0}'] || variables['{{prota}}'] || 'Rita';
  const tic = variables.tic || 'es passa la mà per la barba';
  const ciutat = ciutat_1 || variables.ciutat_1 || variables['{{ciutat_1}}'] || 'Girona';
  const subtubActual = variables.subtub || null;
  const beatActual = config.beatActual || 'setup';
  const paraulesObjectiu = config.paraulesObjectiu || 500;
  const temps = variables.temps || {any:'2024', mes:'gener', dia:'1', event:''};

  // Reset per capítol nou cada 3 caps
  if (numEsc === 1 && numCap % 3 === 0) {
    hist.frasesUsadesCap = [];
    hist.usosOlor = {};
    hist.usosSo = {};
  }
  if (numEsc === 1) {
    hist.olorUsadaEscena = false;
  }

  // Escenari aleatori CP1/CP2 - USA BANCO_UBICACION
  const ciutats = bancs.banco_ubicacion || [];
  const ciutatObj = ciutats.find(c => c.ciutat === ciutat) || ciutats[0];
  const subtubs = ciutatObj?.subtubs || [{nom: ciutat}];

  let escDisp = subtubs.filter(e =>!hist.ubicacions.slice(-4).includes(e.nom));
  if (escDisp.length === 0) {
    hist.ubicacions = [];
    escDisp = subtubs;
  }
  const escenari = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(escenari.nom);

  // TIC aleatori de banco_personatge
  let ticActual = tic;
  if (bancs.banco_personatge?.[0]?.banco_variables?.tic) {
    const tics = bancs.banco_personatge[0].banco_variables.tic;
    ticActual = tics[Math.floor(Math.random() * tics.length)];
  }

  const olors = (bancs.banco_olors || []).filter(o => o.genero?.includes('policiac'));
  const sons = (bancs.banco_sons || []).filter(s => s.genero?.includes('policiac'));
  const emocions = (bancs.banco_emocions || []).filter(e => e.genero === 'policiac');
  const lectures = bancs.banco_lectura || [];
  const lecturesAux = bancs.banco_lectura_aux || [];

  // Olor 1 cop per escena
  let olor = 'aire fred';
  let olorObj = null;
  if (!hist.olorUsadaEscena && Math.random() < 0.3) {
    olorObj = pickNoRepetit(olors, hist, 'olor');
    if (olorObj) {
      const txt = getTextoBase(olorObj);
      olor = txt;
      hist.usosOlor[txt] = (hist.usosOlor[txt] || 0) + 1;
      hist.olorUsadaEscena = true;
    }
  }

  const soObj = pickNoRepetit(sons, hist, 'so');
  const emocioObj = pickNoRepetit(emocions, hist);
  const so = soObj? getTextoBase(soObj) : 'silenci';
  const emocio = emocioObj? getTextoBase(emocioObj) : 'inquietud';

  if (soObj) {
    const txt = getTextoBase(soObj);
    hist.usosSo[txt] = (hist.usosSo[txt] || 0) + 1;
  }

  const progress = numCap / totalCaps;
  let capActe = progress <= 0.25? 1 : progress <= 0.75? 2 : 3;

  // VARS CABLEJADES AMB MAIN.JS - DOBLE FORMAT {var} i {{var}}
  const varsTemps = {
    '{any}': temps.any || '2024',
    '{mes}': temps.mes || 'gener',
    '{dia}': temps.dia || '1',
    '{event}': temps.event || '',
    '{p0}': nom,
    '{p1}': variables.antagonista || variables['{{antagonista}}'] || 'Víctor',
    '{esc}': escenari.nom,
    '{olor}': olor,
    '{so}': so,
    '{ciutat_1}': ciutat,
    '{ciutat_2}': ciutat_2 || variables.ciutat_2 || variables['{{ciutat_2}}'] || 'Barcelona',
    '{ciutat}': ciutat,
    '{emocio}': emocio,
    '{tic}': ticActual,
    '{plantilla}': plantillaId || ''
  };

  // Afegir variables CP2 del main en format {{var}}
  Object.entries(variables).forEach(([k,v]) => {
    if (v) varsTemps[`{{${k}}}`] = v;
  });

  // Si hi ha prompt_master de plantilla 34, l'usem directe
  let parrafo = '';
  if (prompt_master && prompt_master.length > 50) {
    parrafo = safeReplace(prompt_master, varsTemps);
  } else {
    const inicios = {
      'hook': `${nom} va obrir els ulls a ${escenari.nom} amb ${emocio} corrent-li per la sang. ${ticActual}. L'olor de ${olor} li omplia els pulmons mentre el ${so} llunyà li recordava que ${ciutat} guardava secrets.`,
      'setup': `${nom} es va moure per ${escenari.nom} amb ${emocio}, intentant ordenar pensaments mentre l'olor de ${olor} el perseguia. ${ticActual}. El ${so} li deia que el temps s'esgotava.`,
      'giro1': `El ${so} va trencar el silenci de ${escenari.nom} amb força. ${nom} va sentir ${emocio} quan l'olor de ${olor} s'intensificava fins a ofegar-lo. ${ticActual}.`,
      'midpoint': `Al centre de ${escenari.nom}, ${nom} va descobrir la veritat. ${emocio} el va travessar mentre ${olor} i ${so} es barrejaven en una revelació. ${ticActual}.`,
      'giro2': `Res era el que semblava a ${escenari.nom}. ${nom} amb ${emocio} va entendre que havia estat manipulat. L'olor de ${olor} ara sabia a traïció. ${ticActual}.`,
      'crisi': `A ${escenari.nom} tot s'esfondrava. ${nom} amb ${emocio} extrema va veure com l'olor de ${olor} s'esvaïa i el ${so} s'apagava. ${ticActual}.`,
      'climax': hist.beatAnterior === 'crisi'? `Després de la crisi a ${escenari.nom}, ${nom} va avançar amb ${emocio} pura cap a l'enfrontament final. ${ticActual}. ${olor} i ${so} marcaven el ritme del final.` : `L'enfrontament final a ${escenari.nom}. ${nom} va avançar amb ${emocio} pura mentre ${olor} i ${so} marcaven el ritme del final. ${ticActual}.`,
      'resolucio': `${nom} va quedar sol a ${escenari.nom} després de la tempesta. ${emocio} es transformava en pau mentre l'olor de ${olor} es netejava. ${ticActual}.`,
      'default': `${nom} va continuar a ${escenari.nom} amb ${emocio}, ${olor} i ${so} de fons. ${ticActual}.`
    };
    parrafo = safeReplace(inicios[beatActual] || inicios['default'], varsTemps);
  }

  parrafo = forçaPassat(parrafo);
  let paraulesComptades = contarPalabras(parrafo);
  let fraseIndex = 0;
  let intents = 0;
  let bancLecturaUsat = [...lectures];
  let bancAuxUsat = [...lecturesAux];

  // BLINDAT: 200 intents + fallbacks llargs
  while (paraulesComptades < paraulesObjectiu && intents < 200) {
    intents++;
    let lectura = null;
    if (bancLecturaUsat.length > 0) {
      lectura = bancLecturaUsat.splice(Math.floor(Math.random() * bancLecturaUsat.length), 1)[0];
    } else if (bancAuxUsat.length > 0) {
      lectura = bancAuxUsat.splice(Math.floor(Math.random() * bancAuxUsat.length), 1)[0];
    }

    if (lectura) {
      let text = safeReplace(getTextoBase(lectura), varsTemps);
      text = forçaPassat(text);
      if (text.length > 20 &&!hist.frasesUsades.includes(text.substring(0,40))) {
        if (fraseIndex % 3 === 2) {
          const connector = CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)];
          if (contarPalabras(text) > 15) {
            text = connector + ', ' + text.split('.')[0] + '.';
          } else {
            text = connector + '. ' + text;
          }
        }
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

    // FALLBACK LLARG BLINDAT
    if (capActe === 2 && numEsc % 2 === 0) {
      parrafo += ` De sobte va entendre que tot el que creia sobre el cas era una mentida elaborada durant anys sense que ningú li hagués advertit del perill real que s'amagava darrere de cada pista falsa.`;
    } else if (capActe === 3 && numEsc === escenesPerCap) {
      parrafo += ` I finalment va comprendre que el viatge havia valgut la pena malgrat el dolor acumulat durant tant de temps perdut buscant respostes que sempre havien estat davant dels seus ulls.`;
    } else {
      parrafo += ` I va saber que ja no hi havia volta enrere possible per a ningú dels dos després de tot el que havien descobert aquella nit fosca a ${escenari.nom}.`;
    }
    paraulesComptades = contarPalabras(parrafo);
  }

  hist.paraulesTotals += paraulesComptades;
  hist.beatAnterior = beatActual;
  console.log(`✅ Cap${numCap} Esc${numEsc} ${beatActual}: ${paraulesComptades}/${paraulesObjectiu} paraules V14.3.0`);

  return {
    text: parrafo.trim(),
    hist,
    metadata: {
      paraules: paraulesComptades,
      ubicacio: escenari.nom,
      emocio: emocio,
      beat: beatActual,
      beatAnterior: hist.beatAnterior,
      acte: capActe,
      temps: `${temps.any}/${temps.mes}`
    }
  };
}

// ========================================
// MOTOR HÍBRID PRINCIPAL - CRIDAT DES DEL MAIN
// ========================================
export async function generarLlibre(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = blindarHist(hist || histGlobal);

  // CABLEJAT AMB MAIN.JS: config.modo, config.escenesPerCap, config.totalCaps
  const modo = config.modo || 'llibre';
  const escenesPerCap = config.escenesPerCap || 3;
  const beats = config.beatsCap || ['setup','giro1','midpoint','giro2','crisi','climax','resolucio'];

  // Modo ESCENA: 1 sol paràgraf
  if (modo === 'escena') {
    const beatActual = beats[numEsc - 1] || 'setup';
    const resultado = await generaParagraf(
      {...config, beatActual, escenesPerCap},
      bancs, hist, numCap, numEsc, totalCaps
    );
    return {
      capitols: [{
        num: numCap,
        beat: resultado.metadata.beat,
        titol: `Capítol ${numCap}`,
        resum: resultado.text.substring(0, 120) + '...',
        escenes: [{titol: `Escena ${numEsc}`, text: resultado.text}]
      }],
      metadata: {
        paraulesAprox: resultado.metadata.paraules,
        nCapitols: 1,
        beat: resultado.metadata.beat
      },
      hist: resultado.hist
    };
  }

  // Modo CAPÍTOL: generar escenesPerCap paràgrafs
  if (modo === 'capitol') {
    const escenes = [];
    let histLocal = hist;
    for (let i = 0; i < escenesPerCap; i++) {
      const beatActual = beats[i] || 'setup';
      const resultado = await generaParagraf(
        {...config, beatActual, escenesPerCap},
        bancs, histLocal, numCap, i + 1, totalCaps
      );
      escenes.push({titol: `Escena ${i + 1}`, text: resultado.text});
      histLocal = resultado.hist;
    }
    return {
      capitols: [{
        num: numCap,
        beat: 'capitol',
        titol: `Capítol ${numCap}`,
        resum: escenes[0].text.substring(0, 120) + '...',
        escenes: escenes
      }],
      metadata: {
        paraulesAprox: escenes.reduce((sum,e) => sum + contarPalabras(e.text), 0),
        nCapitols: 1
      },
      hist: histLocal
    };
  }

  // Modo LLIBRE: generar totalCaps capítols
  const capitols = [];
  let histLocal = hist;
  for (let cap = 1; cap <= totalCaps; cap++) {
    const escenes = [];
    for (let esc = 1; esc <= escenesPerCap; esc++) {
      const beatActual = beats[esc - 1] || 'setup';
      const resultado = await generaParagraf(
        {...config, beatActual, escenesPerCap},
        bancs, histLocal, cap, esc, totalCaps
      );
      escenes.push({titol: `Escena ${esc}`, text: resultado.text});
      histLocal = resultado.hist;
    }
    const beatCap = beats[Math.floor((cap-1) / totalCaps * beats.length)] || 'setup';
    capitols.push({
      num: cap,
      beat: beatCap,
      titol: `Capítol ${cap}`,
      resum: escenes[0].text.substring(0, 120) + '...',
      escenes: escenes
    });
  }

  return {
    capitols: capitols,
    metadata: {
      paraulesAprox: capitols.reduce((sum,c) => sum + c.escenes.reduce((s,e) => s + contarPalabras(e.text), 0), 0),
      nCapitols: totalCaps
    },
    hist: histLocal
  };
}

console.log('✅ Motor Híbrid V14.3.0 carregat - escena/capitol/llibre actiu');