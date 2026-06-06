// js/generadorLlibre.js - Motor V8.5: Usa els 9 bancs per arribar a 250 paraules
(function() {
  function contarPalabras(texto) {
    return texto.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  function generarEscena(beatNom, configBase, bancs, hist, numCap, numEsc, totalCaps, paraulesPerEscena) {
    hist = hist || {ubicacions:[], olors:[], sons:[], emocions:[], frasesUsades:[], tensions:0, capActe:1};

    // 1. FILTRAR TOTS ELS BANCS PEL GÈNERE
    const lectures = (bancs.banco_lectura || []).filter(l => l.genero === configBase.genere);
    const olors = (bancs.banco_olors || []).filter(o => o.genero?.includes(configBase.genere));
    const sons = (bancs.banco_sons || []).filter(s => s.genero?.includes(configBase.genere));
    const emocions = (bancs.banco_emocions || []).filter(e => e.genero === configBase.genere);
    const escenaris = (bancs.banco_escenarios || []).filter(e => e.ciutat === configBase.ciutat);

    console.log(`Bancs disponibles: Lectura:${lectures.length} Olors:${olors.length} Sons:${sons.length} Emocions:${emocions.length}`);

    // 2. EVITAR REPETICIÓ D'UBICACIÓ
    let escDisp = escenaris.filter(e =>!hist.ubicacions.slice(-4).includes(e.nom));
    if (escDisp.length === 0) { hist.ubicacions = []; escDisp = escenaris; }
    const esc = escDisp[Math.floor(Math.random() * escDisp.length)];
    hist.ubicacions.push(esc.nom);

    // 3. SELECCIONAR OLOR, SO, EMOCIÓ
    const olor = olors.length > 0? olors[Math.floor(Math.random() * olors.length)].texto_base[0] : 'aire fred';
    const so = sons.length > 0? sons[Math.floor(Math.random() * sons.length)].texto_base[0] : 'silenci';
    const emocio = emocions.length > 0? emocions[Math.floor(Math.random() * emocions.length)].texto_base[0] : 'inquietud';

    // 4. ACTE 1-2-3
    const progress = numCap / totalCaps;
    if (progress <= 0.25) hist.capActe = 1;
    else if (progress <= 0.75) { hist.capActe = 2; hist.tensions++; }
    else hist.capActe = 3;

    // 5. FRASE INICIAL + BEAT
    const inicios = {
      'Obertura': `${configBase.nom} va obrir els ulls a ${esc.nom} amb una ${emocio} que li corria per la sang mentre l'olor de ${olor} li omplia els pulmons i el ${so} llunyà li recordava que ${configBase.ciutat} guardava secrets`,
      'Tema plantejat': `A ${esc.nom} ${configBase.nom} va sentir ${emocio} quan va comprendre que el cas era més profund del que havia imaginat, cada racó feia olor de ${olor} i el ${so} el seguia com una ombra`,
      'Catalitzador': `El ${so} va trencar el silenci de ${esc.nom} amb força, ${configBase.nom} va sentir ${emocio} quan l'olor de ${olor} s'intensificava fins a ofegar-lo i va saber que aquella decisió ho canviaria tot`,
      'Setup': `${configBase.nom} es va moure per ${esc.nom} amb ${emocio}, intentant ordenar pensaments mentre l'olor de ${olor} el perseguia i el ${so} li deia que el temps s'esgotava`,
      'default': `${configBase.nom} va continuar a ${esc.nom} amb ${emocio}, ${olor} i ${so} de fons, mentre ${configBase.tic} delatava la seva nerviositat`
    };

    let parrafo = inicios[beatNom] || inicios['default'];
    let paraulesComptades = contarPalabras(parrafo);

    // 6. BUCLE AMB ELS 9 BANCS: lectura + emocions + olors + sons
    let intents = 0;
    let bancLecturaUsat = [...lectures].filter(l =>!hist.frasesUsades.includes(l.texto_base?.substring(0,40)));

    while (paraulesComptades < paraulesPerEscena && intents < 60) {
      intents++;

      // PRIORITAT 1: banco_lectura
      if (bancLecturaUsat.length > 0) {
        const lectura = bancLecturaUsat.splice(Math.floor(Math.random() * bancLecturaUsat.length), 1)[0];
        let text = lectura.texto_base || lectura.text || '';
        text = text.replace(/{p0}/g, configBase.nom)
               .replace(/{esc}/g, esc.nom)
               .replace(/{olor}/g, olor)
               .replace(/{so}/g, so)
               .replace(/{ciutat}/g, configBase.ciutat)
               .replace(/{tic}/g, configBase.tic)
               .replace(/{emocio}/g, emocio)
               .replace(/\./g, ',').replace(/\n/g, ' ').trim();

        if (text.length > 25) {
          parrafo += `, ${text}`;
          hist.frasesUsades.push(text.substring(0,40));
          paraulesComptades = contarPalabras(parrafo);
          continue;
        }
      }

      // PRIORITAT 2: banco_emocions - descriure estat intern
      if (emocions.length > 0) {
        const emo = emocions[Math.floor(Math.random() * emocions.length)].texto_base[0];
        parrafo += `, ${configBase.nom} sentia ${emo} que li cremava per dins`;
        paraulesComptades = contarPalabras(parrafo);
        continue;
      }

      // PRIORITAT 3: banco_olors - descripció sensorial
      if (olors.length > 0) {
        const olor2 = olors[Math.floor(Math.random() * olors.length)].texto_base[0];
        parrafo += `, l'olor de ${olor2} s'enfilava per les parets de ${esc.nom}`;
        paraulesComptades = contarPalabras(parrafo);
        continue;
      }

      // PRIORITAT 4: banco_sons - ambientació
      if (sons.length > 0) {
        const so2 = sons[Math.floor(Math.random() * sons.length)].texto_base[0];
        parrafo += `, el ${so2} ressonava llunyà entre els carrers de ${configBase.ciutat}`;
        paraulesComptades = contarPalabras(parrafo);
        continue;
      }
    }

    // 7. FINAL SEGONS ACTE
    if (hist.capActe === 2 && hist.tensions % 2 === 0) {
      parrafo += `, de sobte va entendre que tot el que creia sobre el cas era una mentida elaborada durant anys`;
    }
    if (hist.capActe === 3 && numEsc === totalCaps) {
      parrafo += ` i finalment va comprendre que el viatge havia valgut la pena malgrat el dolor`;
    } else {
      parrafo += ` i va saber que ja no hi havia volta enrere`;
    }

    paraulesComptades = contarPalabras(parrafo);
    console.log(`✅ Escena ${numEsc}: ${paraulesComptades}/${paraulesPerEscena} paraules`);

    return { text: parrafo, hist };
  }

  window.generarEscena = generarEscena;
  console.log('✅ Motor V8.5 definit - Usa 9 bancs');
})();