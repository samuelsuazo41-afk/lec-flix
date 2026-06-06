// core/generadorLlibre.js - Motor v6: Paràgrafs llargs + estructura 3 actes
function generarEscena(beatNom, configBase, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || {ubicacions:[], olors:[], sons:[], accions:[], tensions:0};

  const olorsPool = bancs.banco_olors?.filter(o => o.genero?.includes(configBase.genere)) || [];
  const sonsPool = bancs.banco_sons?.filter(s => s.genero?.includes(configBase.genere)) || [];
  const escenarisPool = bancs.banco_escenarios?.filter(e => e.ciutat === configBase.ciutat) || [];

  // Rotar ubicació cada 2 escenes per donar sensació d'avanç
  let escDisp = escenarisPool.filter(e =>!hist.ubicacions.slice(-2).includes(e.nom));
  if (escDisp.length === 0) escDisp = escenarisPool;
  const esc = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(esc.nom);

  const olorObj = olorsPool[Math.floor(Math.random() * olorsPool.length)] || {texto_base:[configBase.olor || 'aire fred']};
  const olor = olorObj.texto_base[Math.floor(Math.random() * olorObj.texto_base.length)];

  const soObj = sonsPool[Math.floor(Math.random() * sonsPool.length)] || {texto_base:[configBase.so || 'silenci']};
  const so = soObj.texto_base[Math.floor(Math.random() * soObj.texto_base.length)];

  // Tensió puja amb els capítols. Acte 2 = més conflicte
  const progress = numCap / totalCaps;
  if (progress > 0.25 && progress < 0.75) hist.tensions++;

  // Plantilles llargues: 4-6 frases per escena
  const plantillesLlarga = {
    'Obertura': [
      `${configBase.nom} va obrir els ulls a ${esc.nom}.`,
      `L'olor de ${olor} li va recordar una promesa que havia oblidat.`,
      `El so de ${so} ressonava entre les parets com un eco del passat.`,
      `${configBase.tic} quan la veritat era a punt de sortir.`,
      `Aquell matí a ${configBase.ciutat} tot semblava normal, però alguna cosa havia canviat.`
    ],
    'Tema plantejat': [
      `A ${esc.nom}, ${configBase.nom} va comprendre que no estava sol.`,
      `L'aire feia olor de ${olor}, una olor que no encaixava amb el lloc.`,
      `Cada ${so} que sentia semblava un avís.`,
      `Si no actuava ara, la pista es perdria per sempre.`,
      `I per primera vegada en anys, va sentir por.`
    ],
    'Catalitzador': [
      `El ${so} va trencar el silenci de ${esc.nom} com un tret.`,
      `${configBase.nom} va córrer sense saber cap a on.`,
      `L'olor de ${olor} era més intensa ara, gairebé asfixiant.`,
      `Tenia dues opcions: fugir o enfrontar-se al que fos.`,
      `Va triar quedar-se. Aquesta seria la decisió que ho canviaria tot.`
    ],
    'Setup': [
      `${configBase.nom} es va moure per ${esc.nom} intentant ordenar els pensaments.`,
      `L'olor de ${olor} el seguia com una ombra.`,
      `El ${so} de fons li recordava que el temps s'acabava.`,
      `Necessitava respostes, però tothom mentia. ${configBase.tic} sempre que mentien.`,
      `A ${configBase.ciutat} ningú era qui deia ser.`
    ],
    'default': [
      `${configBase.nom} va continuar a ${esc.nom}, amb ${olor} i ${so} de fons.`,
      `Els seus pensaments eren un caos de records i sospites.`,
      `Si ${configBase.tic}, volia dir que estava a punt de descobrir alguna cosa.`,
      `El carrer estava buit, però sentia que l'observaven.`,
      `Va respirar fons i va fer un pas endavant.`
    ]
  };

  const frases = plantillesLlarga[beatNom] || plantillesLlarga['default'];

  // Si estem a Acte 2, afegir gir/conflicte extra
  if (hist.tensions > 1 && Math.random() > 0.5) {
    frases.splice(3, 0, `De sobte, va entendre que tot el que creia era mentida.`);
  }

  return { text: frases.join(' '), hist };
}

window.generarEscena = generarEscena;