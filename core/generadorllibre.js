// core/generadorLlibre.js - Motor v5 anti-repetició
function generarEscena(beatNom, configBase, bancs, hist) {
  hist = hist || {ubicacions:[], olors:[], sons:[], accions:[]};

  // 1. Agafar bancs aleatoris CADA escena, no fixos
  const olorsPool = bancs.banco_olors?.filter(o => o.genero?.includes(configBase.genere)) || [];
  const sonsPool = bancs.banco_sons?.filter(s => s.genero?.includes(configBase.genere)) || [];
  const escenarisPool = bancs.banco_escenarios?.filter(e => e.ciutat === configBase.ciutat) || [];

  // 2. Evitar repetir ubicació
  let escDisp = escenarisPool.filter(e =>!hist.ubicacions.includes(e.nom));
  if (escDisp.length === 0) { hist.ubicacions = []; escDisp = escenarisPool; }
  const esc = escDisp[Math.floor(Math.random() * escDisp.length)];
  hist.ubicacions.push(esc.nom);

  // 3. Evitar repetir olor/so
  let olorsDisp = olorsPool.filter(o =>!hist.olors.includes(o.texto_base?.[0]));
  if (olorsDisp.length === 0) { hist.olors = []; olorsDisp = olorsPool; }
  const olorObj = olorsDisp[Math.floor(Math.random() * olorsDisp.length)] || {texto_base:[configBase.olor]};
  const olor = olorObj.texto_base[Math.floor(Math.random() * olorObj.texto_base.length)];
  hist.olors.push(olor);

  let sonsDisp = sonsPool.filter(s =>!hist.sons.includes(s.texto_base?.[0]));
  if (sonsDisp.length === 0) { hist.sons = []; sonsDisp = sonsPool; }
  const soObj = sonsDisp[Math.floor(Math.random() * sonsDisp.length)] || {texto_base:[configBase.so]};
  const so = soObj.texto_base[Math.floor(Math.random() * soObj.texto_base.length)];
  hist.sons.push(so);

  // 4. Plantilles segons beat per continuïtat narrativa
  const plantilles = {
    'Obertura': `${configBase.nom} va obrir els ulls a ${esc.nom}. L'olor de ${olor} i el so de ${so} el van desorientar.`,
    'Tema plantejat': `A ${esc.nom}, ${configBase.nom} va notar que ${olor} no era normal. ${configBase.tic} el va delatar.`,
    'Catalitzador': `Un ${so} va trencar el silenci a ${esc.nom}. ${configBase.nom} va saber que alguna cosa havia canviat.`,
    'Setup': `${configBase.nom} es va moure per ${esc.nom}, respirant ${olor} mentre pensava en ${configBase.ciutat}.`,
    'default': `${configBase.nom} va continuar a ${esc.nom}, amb ${olor} i ${so} de fons. ${configBase.tic}.`
  };

  const textBase = plantilles[beatNom] || plantilles['default'];

  // 5. Frase extra per allargar i no repetir acció
  if (!hist.accions.includes('investigacio')) {
    hist.accions.push('investigacio');
    return { text: textBase + ` Va començar a buscar pistes entre les ombres.`, hist };
  } else if (!hist.accions.includes('dubte')) {
    hist.accions.push('dubte');
    return { text: textBase + ` "Això no quadra", va murmurar.`, hist };
  } else {
    const variants = [
      ` El silenci pesava més que abans.`,
      ` Cada pas ressonava diferent ara.`,
      ` Alguna cosa s'havia mogut sense que se n'adonés.`
    ];
    return { text: textBase + variants[Math.floor(Math.random()*variants.length)], hist };
  }
}

window.generarEscena = generarEscena;