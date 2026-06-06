// core/generadorLlibres.js - Motor amb memòria i continuïtat
function generarEscena(beat, contexte, bancs, hist = {}) {
  const { personatge, ciutat, escenari, olor, so } = contexte;

  // Històric per evitar repetir
  hist.ubicacions = hist.ubicacions || [];
  hist.accions = hist.accions || [];
  hist.dialogs = hist.dialogs || [];

  // 1. Seleccionar ubicació nova si ja es va usar
  let ubicacionsDisp = bancs.banco_escenarios.filter(e => e.ciutat === ciutat);
  ubicacionsDisp = ubicacionsDisp.filter(u =>!hist.ubicacions.includes(u.nom));
  const esc = ubicacionsDisp.length > 0? ubicacionsDisp[0] : bancs.banco_escenarios[0];
  hist.ubicacions.push(esc.nom);

  // 2. Plantilles segons beat per tenir continuïtat
  const plantilles = {
    'Obertura': `${personatge} va obrir els ulls a ${esc.nom}, respirant olor de ${olor} mentre ${so} omplia l'aire.`,
    'Tema plantejat': `A ${esc.nom}, ${personatge} va notar que alguna cosa no encaixava. El tic de ${contexte.tic} el va delatar.`,
    'Catalitzador': `L'escena va canviar a ${esc.nom}. Un ${so} inesperat va trencar la rutina de ${personatge}.`,
    'Setup': `${personatge} es va moure cap a ${esc.nom}, pensant en ${ciutat}. L'olor de ${olor} li recordava alguna cosa.`,
    'default': `${personatge} va continuar a ${esc.nom}, amb ${olor} i ${so} de fons.`
  };

  const textBase = plantilles[beat] || plantilles['default'];

  // 3. Afegir frase nova segons històric per allargar sense repetir
  let extres = '';
  if (hist.accions.length === 0) {
    extres = ` Era el primer dia que trepitjava aquest lloc.`;
    hist.accions.push('arribada');
  } else if (!hist.accions.includes('investigacio')) {
    extres = ` Va començar a buscar pistes entre les ombres.`;
    hist.accions.push('investigacio');
  } else if (!hist.dialogs.includes('dubte')) {
    extres = ` "No em quadra res", va murmurar per a si mateix.`;
    hist.dialogs.push('dubte');
  } else {
    const variants = [
      ` El silenci pesava més que abans.`,
      ` Cada pas ressonava diferent ara.`,
      ` Alguna cosa havia canviat des de l'última vegada.`
    ];
    extres = variants[Math.floor(Math.random() * variants.length)];
  }

  return { text: textBase + extres, hist };
}

window.generarEscena = generarEscena;