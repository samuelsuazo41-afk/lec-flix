// generaparagraf.js - Motor Paràgraf V9.9.15 lec-flix policial FINAL BLINDAT
// Fixes: anti-{}, anti-repetició olor/so, ritme 3-2-3, forçaPassat única,
// neteja espais, comptadors usosOlor/usosSo, connectors cada 3 frases,
// fix motor moto, reomplert personatge automàtic, ANTI-BUCLE OLOR BLINDAT

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
  olorsUsadesEscena: [] // ← NOU: array per evitar repetir la mateixa olor
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
    olorsUsadesEscena: [] // ← NOU
  };
  console.log('🔄 Estructura V9.9.15 resetejada');
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

// REGLA 2: Anti-repetició olor/so per clau + màxim 2 usos per escena + blacklist escena
function pickNoRepetit(arr, hist, tipus) {
  if (!arr || arr.length === 0) return null;
  const disponibles = arr.filter(item => {
    const txt = getTextoBase(item);
    if (!txt) return false;
    if (hist.frasesUsades.includes(txt.substring(0,40))) return false;
    // BLINDAT: No repetir olors ja usades a l'escena
    if (tipus === 'olor' && hist.olorsUsadesEscena?.includes(txt)) return false;
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

// REGLA 5: Neteja espais + "el una" → "una" + Anti-bucle olor placeholder
function netejaEspais(text) {
  return text
.replace(/\s+/g,' ')
.replace(/\s+([.,])/g,'$1')
.replace(/\bel una\b/gi, 'una')
.replace(/\bla una\b/gi, 'una')
.replace(/\bL'olor de \{\} de\b/gi, '') // ← BLINDAT: elimina bucles {} olor
.replace(/\bL'olor de\b/gi, '') // ← BLINDAT: doble "de"
.trim();
}

// REGLA 6: ForçaPassat única - conjugació passat
function forçaPassat(text) {
  return text
.replace(/\bMira\b/g, 'Va mirar')
.replace(/\bOlía\b/g, 'Feia olor')
.replace(/\bSe le congeló\b/g, 'Se li va gelar')
.replace(/\bSiente\b/g, 'Va sentir')
.replace(/\bCamina\b/g, 'Va caminar');
}

// REGLA 1: Anti-{} + REGLA 2: Fix motor moto + REOMPLERT PERSONATGE + ANTI-BUCLE OLOR
function safeReplace(text, vars) {
  let out = text;
  const nom = vars['{p0}'] || 'Rita';
  const nom2 = vars['{p1}'] || 'Víctor';

  // FIX MOTOR: "motor de la moto" → "motor"
  out = out.replace(/\bmotor\s+de\s+la\s+moto\b/gi, 'motor');

  // FIX SEC I FRED: Treure si va enganxat al so
  out = out.replace(/(\buna moto accelerant fort\b|\bmotor\b)\s*,\s*sec i fred/gi, '$1 sec i fred');

  // BLINDAT ANTI-BUCLE: Si ja hi ha "L'olor de" al text i tornem a meter {olor}, eliminar
  const jaTeOlor = /\bL'olor de\b/i.test(out);

  // REOMPLERT AUTOMÀTIC: ella → Rita, ell → Víctor, {} → Rita
  out = out.replace(/\bell\b/gi, nom2);
  out = out.replace(/\bella\b/gi, nom);
  out = out.replace(/\bEll\b/gi, nom2);
  out = out.replace(/\bElla\b/gi, nom);
  out = out.replace(/\{\}/g, jaTeOlor? '' : nom); // ← BLINDAT: si ja hi ha olor, {} buit

  // Replace variables normals del main
  for (const [k,v] of Object.entries(vars)) {
    if (k === '{olor}' && jaTeOlor) continue; // ← BLINDAT: no substituir {olor} si ja n'hi ha
    out = out.replaceAll(k, v);
  }

  // REGLA 1 FIX: Anti-{} DEFINITIU - agafa qualsevol cosa dins {}
  out = out.replace(/\{[^}]*\}/g, '').trim();
  out = netejaEspais(out);
  return out.length > 10? out : '';
}

// REGLA 3: Connectors cada 3 frases - ritme 3-2-3
const CONNECTORS = ['Però', 'De cop', 'Mentrestant', 'Aleshores', 'Sense avís'];

export async function generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || histGlobal;
  const { nom, tic, ciutat, subtubActual, beatActual, beatAnterior, sinopsis, pauta, temps } = config;
  const paraulesObjectiu = config.paraulesObjectiu || 500;

  // Reset cada 3 caps - Sincronitzat amb main.js
  if (numEsc === 1 && numCap % 3 === 0) {
    hist.frasesUsadesCap = [];
    hist.usosOlor = {};
    hist.usosSo = {};
  }

  // BLINDAT: Reset flag olor cada escena nova
  if (numEsc === 1) {
    hist.olorUsadaEscena = false;
    hist.olorsUsadesEscena = [];
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

  // BLINDAT ANTI-BUCLE OLOR: màxim 1 per escena + 25% probabilitat + blacklist
  let olor = '';
  let olorObj = null;
  const jaHiHaOlorInici = /\bL'olor de\b/i.test(inicios[beatActual] || '');

  if (!jaHiHaOlorInici &&!hist.olorUsadaEscena && Math.random() < 0.25) {
    olorObj = pickNoRepetit(olors, hist, 'olor');
    if (olorObj) {
      const txt = getTextoBase(olorObj);
      olor = txt;
      hist.usosOlor[txt] = (hist.usosOlor[txt] || 0) + 1;
      hist.olorUsadaEscena = true;
      hist.olorsUsadesEscena.push(txt); // ← BLINDAT: guarda per no repetir
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

  const varsTemps = {
    '{any}': temps?.any || '2024',
    '{mes}': temps?.mes || 'gener',
    '{dia}': temps?.dia || '1',
    '{event}': temps?.event || '',
    '{p0}': nom,
    '{p1}': config.nom2 || 'Víctor',
    '{esc}': escenari.nom,
    '{olor}': olor,
    '{so}': so,
    '{ciutat}': ciutat,
    '{emocio}': emocio,
    '{tic}': ticActual
  };

  const inicios = {
    'hook': `${nom} va obrir els ulls a ${escenari.nom} amb ${emocio} corrent-li per la sang. ${ticActual}. ${olor? `L'olor de ${olor} li omplia els pulmons mentre ` : ''}el ${so} llunyà li recordava que ${ciutat} guardava secrets.`,
    'plantejament': `A ${escenari.nom} ${nom} va sentir ${emocio} quan va comprendre que el cas era més profund. ${ticActual}. ${olor? `Cada racó feia olor de ${olor} i ` : ''}el ${so} el seguia com una ombra.`,
    'setup': `${nom} es va moure per ${escenari.nom} amb ${emocio}, intentant ordenar pensaments ${olor? `mentre l'olor de ${olor} el perseguia` : 'mentre caminava'}. ${ticActual}. El ${so} li deia que el temps s'esgotava.`,
    'giro1': `El ${so} va trencar el silenci de ${escenari.nom} amb força. ${nom} va sentir ${emocio} ${olor? `quan l'olor de ${olor} s'intensificava fins a ofegar-lo` : 'quan va entendre el perill'}. ${ticActual}.`,
    'midpoint': `Al centre de ${escenari.nom}, ${nom} va descobrir la veritat. ${emocio} el va travessar ${olor && so? `mentre ${olor} i ${so} es barrejaven` : `mentre ${so} ressonava`} en una revelació. ${ticActual}.`,
    'giro2': `Res era el que semblava a ${escenari.nom}. ${nom} amb ${emocio} va entendre que havia estat manipulat. ${olor? `L'olor de ${olor} ara sabia a traïció` : 'Tot sabia a traïció'}. ${ticActual}.`,
    'crisi': `A ${escenari.nom} tot s'esfondrava. ${nom} amb ${emocio} extrema va veure com ${olor? `l'olor de ${olor} s'esvaïa i ` : ''}el ${so} s'apagava. ${ticActual}.`,
    'climax': beatAnterior === 'crisi'? `Després de la crisi a ${escenari.nom}, ${nom} va avançar amb ${emocio} pura cap a l'enfrontament final. ${ticActual}. ${so} marcava el ritme del final.` : `L'enfrontament final a ${escenari.nom}. ${nom} va avançar amb ${emocio} pura mentre ${so} marcava el ritme del final. ${ticActual}.`,
    'resolucio': `${nom} va quedar sol a ${escenari.nom} després de la tempesta. ${emocio} es transformava en pau ${olor? `mentre l'olor de ${olor} es netejava` : 'mentre el silenci tornava'}. ${ticActual}.`,
    'default': `${nom} va continuar a ${escenari.nom} amb ${emocio}, ${so} de fons. ${ticActual}.`
  };

  // ORDRE CORRECTE: safeReplace primer → forçaPassat després
  let parrafo = safeReplace(inicios[beatActual] || inicios['default'], varsTemps);
  parrafo = forçaPassat(parrafo);

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
      text = forçaPassat(text);

      // BLINDAT: Si el text té "L'olor de" i ja hem usat olor a l'escena, saltar
      const textTeOlor = /\bL'olor de\b/i.test(text);
      if (textTeOlor && hist.olorUsadaEscena) continue;

      if (text.length > 20 &&!hist.frasesUsades.includes(text.substring(0,40))) {
        // REGLA 3: Ritme 3-2-3 + Connector cada 3a frase
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

        // BLINDAT: Si aquesta frase porta olor, marcar usada
        if (textTeOlor) {
          hist.olorUsadaEscena = true;
        }

        paraulesComptades = contarPalabras(parrafo);
        fraseIndex++;
        continue;
      }
    }

    // Fallback amb comptadors
    if (emocions.length > 0) {
      const emo = forçaPassat(safeReplace(getTextoBase(emocions[Math.floor(Math.random() * emocions.length)]), varsTemps));
      parrafo += ` ${pronomPerNom(nom)} va sentir ${emo} que li cremava per dins mentre caminava per ${escenari.nom}.`;
      paraulesComptades = contarPalabras(parrafo);
      fraseIndex++;
      continue;
    }

    // BLINDAT: Fallback olor només si no s'ha usat i 15% probabilitat
    if (olors.length > 0 &&!hist.olorUsadaEscena && Math.random() < 0.15) {
      const olorsDisp = olors.filter(o => {
        const txt = getTextoBase(o);
        return (hist.usosOlor[txt] || 0) < 2 &&!hist.olorsUsadesEscena.includes(txt);
      });
      if (olorsDisp.length > 0) {
        const olorObj2 = olorsDisp[Math.floor(Math.random() * olorsDisp.length)];
        const olor2 = forçaPassat(safeReplace(getTextoBase(olorObj2), varsTemps));
        hist.usosOlor[olor2] = (hist.usosOlor[olor2] || 0) + 1;
        hist.olorUsadaEscena = true;
        hist.olorsUsadesEscena.push(olor2);
        parrafo += ` L'olor de ${olor2} s'enfilava...`;
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
  }

  hist.paraulesTotals += paraulesComptades;
  console.log(`✅ Cap${numCap} Esc${numEsc} ${beatActual}: ${paraulesComptades}/${paraulesObjectiu} paraules V9.9.15`);

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
console.log('✅ Motor Paràgraf V9.9.15 carregat - BLINDAT anti-bucle olor');