// core/generadorLlibre.js - Motor V8: Estándar editorial 400-500 paraules/escena
function generarEscena(beatNom, configBase, bancs, hist, numCap, numEsc, totalCaps, paraulesPerEscena) {
  hist = hist || {ubicacions:[], olors:[], sons:[], frasesUsades:[], tensions:0, capActe:1};

  // 1. Usar els 9 bancs de lectura
  const lectures = bancs.banco_lectura || [];
  let lecturasDisponibles = lectures.filter(l => l.genero === configBase.genere);

  // Filtrar per beat si existeix
  const lecturasBeat = lecturasDisponibles.filter(l => l.tipus === beatNom);
  if (lecturasBeat.length > 5) lecturasDisponibles = lecturasBeat;

  // Evitar repetir frases
  lecturasDisponibles = lecturasDisponibles.filter(l =>!hist.frasesUsades.includes(l.texto_base?.substring(0,30)));

  // 2. Bancs ambientació
  const olorsPool = bancs.banco_olors?.filter(o => o.genero?.includes(configBase.genere)) || [];
  const sonsPool = bancs.banco_sons?.filter(s => s.genero?.includes(configBase.genere)) || [];
  const escenarisPool = bancs.banco_escenarios?.filter(e => e.ciutat === configBase.ciutat) || [];

  // 3. Rotar ubicació cada 3 escenes per donar moviment
  let escDisp = escenarisPool.filter(e =>!hist.ubicacions.slice(-3).includes(e.nom));
  if (escDisp.length === 0) { hist.ubicacions = []; escDisp = escenarisPool; }
  const esc = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(esc.nom);

  const olor = olorsPool.length > 0? olorsPool[Math.floor(Math.random() * olorsPool.length)].texto_base[0] : 'aire fred';
  const so = sonsPool.length > 0? sonsPool[Math.floor(Math.random() * sonsPool.length)].texto_base[0] : 'silenci';

  // 4. Estructura 3 Actes amb tensió
  const progress = numCap / totalCaps;
  if (progress <= 0.25) hist.capActe = 1; // Setup
  else if (progress <= 0.75) { hist.capActe = 2; hist.tensions++; } // Confrontació
  else hist.capActe = 3; // Resolució

  // 5. Generar paràgraf CONTINUO sense punts
  let parrafo = '';
  let paraulesComptades = 0;

  // Frase inicial segons beat i acte
  const inicios = {
    'Obertura': `${configBase.nom} va obrir els ulls a ${esc.nom} amb la sensació que alguna cosa havia canviat mentre l'olor de ${olor} li omplia els pulmons i el ${so} llunyà li recordava que ${configBase.ciutat} guardava secrets`,
    'Tema plantejat': `A ${esc.nom} ${configBase.nom} va comprendre que el cas era més profund del que havia imaginat, cada racó feia olor de ${olor} i el ${so} semblava seguir-lo com una ombra persistent`,
    'Catalitzador': `El ${so} va trencar el silenci de ${esc.nom} amb la força d'un tro inesperat, ${configBase.nom} va sentir com l'olor de ${olor} s'intensificava fins a ofegar-lo i va saber que aquella era la decisió que ho canviaria tot`,
    'Setup': `${configBase.nom} es va moure per ${esc.nom} intentant ordenar els pensaments que bullien al seu cap, l'olor de ${olor} el perseguia com un record i el ${so} de fons li deia que el temps s'esgotava`,
    'default': `${configBase.nom} va continuar a ${esc.nom} amb ${olor} i ${so} de fons, els seus pensaments eren un caos de records i sospites mentre ${configBase.tic} delatava la seva nerviositat`
  };

  parrafo = inicios[beatNom] || inicios['default'];
  paraulesComptades = parrafo.split(' ').length;

  // 6. Omplir fins arribar a paraulesPerEscena usando els 9 bancs
  while (paraulesComptades < paraulesPerEscena && lecturasDisponibles.length > 0) {
    const lectura = lecturasDisponibles.splice(Math.floor(Math.random() * lecturasDisponibles.length), 1)[0];
    let text = lectura.texto_base || lectura.text || '';

    // Reemplaçar placeholders
    text = text.replace(/{p0}/g, configBase.nom)
              .replace(/{esc}/g, esc.nom)
              .replace(/{olor}/g, olor)
              .replace(/{so}/g, so)
              .replace(/{ciutat}/g, configBase.ciutat)
              .replace(/{tic}/g, configBase.tic);

    // NETEJAR PUNTS I SALTS per paràgraf continu
    text = text.replace(/\./g, ',').replace(/\n/g, ' ').trim();

    if (text.length > 20) {
      parrafo += `, ${text}`;
      hist.frasesUsades.push(text.substring(0,30));
      paraulesComptades = parrafo.split(' ').length;
    }
  }

  // 7. Gir Acte 2
  if (hist.capActe === 2 && hist.tensions % 3 === 0) {
    parrafo += `, de sobte va entendre que tot el que creia sobre el cas era una mentida elaborada durant anys i que ningú era qui deia ser`;
  }

  // 8. Tancar Acte 3
  if (hist.capActe === 3 && numEsc === totalCaps) {
    parrafo += ` i finalment va comprendre que el viatge havia valgut la pena malgrat tot el dolor i les pèrdues del camí`;
  } else {
    parrafo += ` i va saber que ja no hi havia volta enrere`;
  }

  return { text: parrafo, hist };
}

window.generarEscena = generarEscena;
console.log('Motor V8 Estándar Editorial carregat');