// core/generadorLlibre.js - Motor v6: Paràgrafs llargs 100-120 paraules
function generarEscena(beatNom, configBase, bancs, hist, numCap, numEsc, totalCaps) {
  hist = hist || {ubicacions:[], olors:[], sons:[], accions:[], tensions:0};

  const olorsPool = bancs.banco_olors?.filter(o => o.genero?.includes(configBase.genere)) || [];
  const sonsPool = bancs.banco_sons?.filter(s => s.genero?.includes(configBase.genere)) || [];
  const escenarisPool = bancs.banco_escenarios?.filter(e => e.ciutat === configBase.ciutat) || [];

  let escDisp = escenarisPool.filter(e =>!hist.ubicacions.slice(-2).includes(e.nom));
  if (escDisp.length === 0) { hist.ubicacions = []; escDisp = escenarisPool; }
  const esc = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(esc.nom);

  const olorObj = olorsPool[Math.floor(Math.random() * olorsPool.length)] || {texto_base:['aire fred']};
  const olor = olorObj.texto_base[Math.floor(Math.random() * olorObj.texto_base.length)];

  const soObj = sonsPool[Math.floor(Math.random() * sonsPool.length)] || {texto_base:['silenci']};
  const so = soObj.texto_base[Math.floor(Math.random() * soObj.texto_base.length)];

  const progress = numCap / totalCaps;
  if (progress > 0.25 && progress < 0.75) hist.tensions++;

  const plantillesLlarga = {
    'Obertura': [
      `${configBase.nom} va obrir els ulls a ${esc.nom}.`,
      `L'olor de ${olor} li va recordar una promesa que havia oblidat feia anys.`,
      `El so de ${so} ressonava entre les parets com un eco del passat que no volia escoltar.`,
      `${configBase.tic} sempre que la veritat era a punt de sortir.`,
      `Aquell matí a ${configBase.ciutat} tot semblava normal, però alguna cosa havia canviat i ell ho sabia.`
    ],
    'Tema plantejat': [
      `A ${esc.nom}, ${configBase.nom} va comprendre que no estava sol en aquella investigació.`,
      `L'aire feia olor de ${olor}, una olor que no encaixava amb el lloc ni amb l'hora.`,
      `Cada ${so} que sentia semblava un avís, un missatge codificat que només ell podia entendre.`,
      `Si no actuava ara, la pista es perdria per sempre entre els carrers de ${configBase.ciutat}.`,
      `I per primera vegada en anys, va sentir por. Por real, no la del tic.`
    ],
    'Catalitzador': [
      `El ${so} va trencar el silenci de ${esc.nom} com un tret a les tres de la matinada.`,
      `${configBase.nom} va córrer sense saber cap a on, només allunyant-se del so.`,
      `L'olor de ${olor} era més intensa ara, gairebé asfixiant, impregnant-li la roba i la pell.`,
      `Tenia dues opcions: fugir i oblidar-ho tot, o enfrontar-se al que fos que l'esperava.`,
      `Va triar quedar-se. Aquesta seria la decisió que ho canviaria tot, per bé o per mal.`
    ],
    'Setup': [
      `${configBase.nom} es va moure per ${esc.nom} intentant ordenar els pensaments que bullien al seu cap.`,
      `L'olor de ${olor} el seguia com una ombra que no podia sacsejar.`,
      `El ${so} de fons li recordava que el temps s'acabava i les respostes no arribaven.`,
      `Necessitava veritat, però tothom mentia. ${configBase.tic} sempre que obrien la boca.`,
      `A ${configBase.ciutat} ningú era qui deia ser, i ell menys que ningú.`
    ],
    'default': [
      `${configBase.nom} va continuar a ${esc.nom}, amb ${olor} i ${so} de fons.`,
      `Els seus pensaments eren un caos de records, sospites i preguntes sense resposta.`,
      `Si ${configBase.tic}, volia dir que estava a punt de descobrir alguna cosa important.`,
      `El carrer estava buit, però sentia que l'observaven des de les finestres fosques.`,
      `Va respirar fons, es va ajustar la jaqueta i va fer un pas endavant sense mirar enrere.`
    ]
  };

  const frases = plantillesLlarga[beatNom] || plantillesLlarga['default'];

  if (hist.tensions > 2 && Math.random() > 0.6) {
    frases.splice(3, 0, `De sobte, va entendre que tot el que creia sobre el cas era mentida.`);
  }

  return { text: frases.join(' '), hist };
}

window.generarEscena = generarEscena;
console.log('Motor v6 definit');