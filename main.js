window.openScreen = function(screenName, returnTo = null) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('resultat').style.display = 'none';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const screen = document.getElementById('screen-' + screenName);
  if (screen) {
    screen.dataset.returnTo = returnTo || 'menu';
    screen.classList.add('active');
  }
};

window.closeScreen = function(returnTo = null) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  if (returnTo) {
    document.getElementById(returnTo).classList.add('active');
  } else {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('resultat').style.display = 'block';
  }
};

window.seleccio = {
  genere: null,
  quantitat_personatges: 1,
  personatges: [],
  estructura: null,
  mon: null,
  escenari: null,
  estil: null
};

const bancos = {
  'genere': [
    {id: 'accio', nom: 'Acció', suggeriments: ['Persecució', 'Supervivència', 'Rescat', 'Invasió']},
    {id: 'romantic', nom: 'Romàntic', suggeriments: ['Amor impossible', 'Segona oportunitat', 'Triangle', 'A distància']},
    {id: 'terror', nom: 'Terror', suggeriments: ['Psicològic', 'Sobrenatural', 'Slasher', 'Gore']},
    {id: 'comedia', nom: 'Comèdia', suggeriments: ['Situacional', 'Paròdia', 'Romàntica', 'Negra']}
  ],
  'estructura': [
    {id: '3actes', nom: '3 Actes', suggeriments: ['Clàssic', 'Accelerat', 'Amb flashbacks', 'Paral·lel']},
    {id: 'viatge', nom: 'Viatge', suggeriments: ['Físic', 'Emocional', 'Espiritual', 'Interior']},
    {id: 'no-lineal', nom: 'No Lineal', suggeriments: ['Flashback', 'Paral·lel', 'Trencat', 'Circular']},
    {id: 'en-marc', nom: 'En Marc', suggeriments: ['Narrador', 'Carta', 'Diari', 'Entrevista']}
  ],
  'mon': [
    {id: 'fantasia', nom: 'Fantasia', suggeriments: ['Alta', 'Urbana', 'Fosca', 'Èpica']},
    {id: 'ciencia', nom: 'Ciència Ficció', suggeriments: ['Dura', 'Space opera', 'Cyberpunk', 'Distopia']},
    {id: 'historic', nom: 'Històric', suggeriments: ['Modern', 'Victorià', 'Romà', 'Medieval']}
  ],
  'escenari': [
    {id: 'ciutat', nom: 'Ciutat', suggeriments: ['Barcelona', 'Madrid', 'Nova York', 'Tòquio', 'París', 'Londres', 'Berlín', 'Roma']},
    {id: 'bosc', nom: 'Bosc', suggeriments: ['Muntanya', 'Encantat', 'Fosc', 'Tropical']}
  ],
  'estil': [
    {id: 'directe', nom: 'Directe', suggeriments: ['Narratiu', 'Objectiu', 'Ràpid', 'Clar']},
    {id: 'poetic', nom: 'Poètic', suggeriments: ['Líric', 'Metafores', 'Ritme', 'Imatges']},
    {id: 'ironico', nom: 'Irònic', suggeriments: ['Sàtira', 'Humor', 'Contraste', 'Doble sentit']},
    {id: 'minimal', nom: 'Minimal', suggeriments: ['Concís', 'Essencial', 'Buit', 'Silenci']},
    {id: 'visual', nom: 'Visual', suggeriments: ['Descripció', 'Color', 'Moviment', 'Escena']},
    {id: 'dialogic', nom: 'Dialògic', suggeriments: ['Conversació', 'Subtext', 'Conflicte', 'Ritme']},
    {id: 'tecnic', nom: 'Tècnic', suggeriments: ['Precis', 'Detallat', 'Processos', 'Terminologia']},
    {id: 'experimental', nom: 'Experimental', suggeriments: ['Trencat', 'Abstracte', 'Mixt', 'Híbrid']}
  ]
};

const banco_personatge_dummy = [
  {id: 'quantitat', nom: 'Quants personatges?', suggeriments: ['1', '2', '3', '4+']},
  {id: 'heroi', nom: 'Heròic', suggeriments: ['P1', 'P2', 'P3', 'P4'],
   roles: {generico: ['Protagonista', 'Mentor', 'Còmplic', 'Traïdor']}},
  {id: 'antagonista', nom: 'Antagonista', suggeriments: ['P1', 'P2', 'P3', 'P4'],
   roles: {generico: ['Vilà pur', 'Antiheroi', 'Títere', 'Tràgic']}},
  {id: 'secundari', nom: 'Secundari', suggeriments: ['P1', 'P2', 'P3', 'P4'],
   roles: {generico: ['Amic', 'Company', 'Veí', 'Testimoni']}},
  {id: 'mentor', nom: 'Mentor', suggeriments: ['P1', 'P2', 'P3', 'P4'],
   roles: {generico: ['Mestre', 'Guia', 'Saviesa', 'Protector']}},
  {id: 'amor', nom: 'Amor', suggeriments: ['P1', 'P2', 'P3', 'P4'],
   roles: {generico: ['Interès romàntic', 'Ex-parella', 'Amor secret', 'Amor impossible']}}
];

function renderSubtabs(categoria) {
  const container = document.getElementById(categoria + '-content');
  const banco = categoria === 'personatge'? banco_personatge_dummy : bancos[categoria];
  if (!container ||!banco) return;

  container.innerHTML = '';
  banco.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = item.nom;
    btn.onclick = () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (item.suggeriments) {
        renderSuggeriments(categoria, item.id, item.suggeriments, item);
        openScreen(`${categoria}-${item.id}`, `screen-${categoria}`);
      } else {
        seleccio[categoria] = item.id;
        closeScreen();
      }
    };
    container.appendChild(btn);
  });
}

function renderSuggeriments(categoria, subtabId, suggeriments, itemRef) {
  const container = document.getElementById(`${categoria}-${subtabId}-content`);
  if (!container) return;
  container.innerHTML = '';
  suggeriments.forEach(sug => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = sug;
    btn.onclick = () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (categoria === 'personatge' && subtabId!== 'quantitat') {
        const num = sug;
        renderRolPersonatge(subtabId, num, itemRef);
        openScreen(`${categoria}-${subtabId}-${num.toLowerCase()}-rol`, `screen-${categoria}-${subtabId}`);
      } else if (categoria === 'personatge' && subtabId === 'quantitat') {
        seleccio.quantitat_personatges = sug === '4+'? 4 : parseInt(sug);
        closeScreen(`screen-${categoria}`);
      } else {
        seleccio[categoria] = {tipus: subtabId, detall: sug};
        closeScreen(`screen-${categoria}`);
      }
    };
    container.appendChild(btn);
  });
}

function renderRolPersonatge(tipus, num, itemRef) {
  const container = document.getElementById(`personatge-${tipus}-${num.toLowerCase()}-rol-content`);
  if (!container) return;
  const index = parseInt(num.substring(1)) - 1;
  const genereActual = seleccio.genere?.tipus || 'generico';
  const roles = itemRef.roles?.[genereActual] || itemRef.roles?.generico;
  container.innerHTML = '';
  roles.forEach(rol => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = rol;
    btn.onclick = () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      seleccio.personatges[index] = {tipus: tipus, rol: rol};
      closeScreen(`screen-personatge-${tipus}`);
    };
    container.appendChild(btn);
  });
}

const bancosLexic = {
  verbAccio: ["córrer", "escapar", "llançar-se", "saltar", "girar-se", "agafar", "empènyer", "arrossegar", "tremolar", "cridar", "xiuxiuejar", "mirar"],
  emocio: ["amb ràbia", "en silenci", "amb por", "amb esperança", "sense pensar-ho", "amb determinació", "amb dubte", "amb pressa", "lentament", "amb força"],
  adverbis: ["de cop", "lentament", "ràpid", "en silenci", "amb força", "sense fer soroll", "de sobte", "poc a poc"],
  connectors: ["Mentrestant,", "Al cap d’uns minuts,", "De cop i volta,", "Sense adonar-se,", "Més tard,", "Llavors,", "Però,"],
  pensament: ["{p0} va pensar que tot era un error.", "No podia creure el que veia.", "Havia de prendre una decisió, i ràpid.", "Si fallava, no hi hauria segona oportunitat.", "Tot depenia d’aquell moment."]
};

const plantillesCombinades = {
  obertura: ["La llum entrava quan {p0} va obrir els ulls.", "{p0} no sabia que aquell dia {p1} canviaria tot.", "{p0} mirava {esc} pensant en {p2}.", "El rellotge marcava les {hora} quan {p0} va prendre la decisió."],
  accio: ["{p0} va {verb} {emocio} cap a {esc}.", "Sense pensar-ho, {p0} va {verb} per {mon}.", "{p0} va {verb} {adverbi} mentre {p1} mirava.", "{p0} va {verb} {emocio} i després es va aturar."],
  dialog: ['"No puc més", va dir {p0}.', '"Tens raó", va respondre {p1}. "Però ho hem de provar."', '"Què vols dir?", va preguntar {p0}.', '"Que tot ha canviat", va xiuxiuejar {p2}.', '"No t’ho crec", va tallar {p1}.'],
  descripcio: ["L’aire a {esc} olia a pluja.", "{mon} s’estenia davant d’ells, infinit.", "Les parets de {esc} guardaven secrets.", "El vent bufava {adverbi} des de {mon}."],
  cliffhanger: ["Però llavors, va sentir un soroll.", "I en aquell moment, tot va canviar.", "No tenia ni idea del que venia després.", "El telèfon va sonar.", "La porta es va obrir sola."],
  tancamentCapitol: ["El capítol acabava aquí.", "Demà tornaria al mateix lloc.", "La decisió estava presa.", "No hi havia volta enrere."]
};

const motiusBase = ["La porta estava tancada.", "No podia mirar enrere.", "El temps s'esgotava.", "No hi havia volta enrere.", "Tot depenia d'aquell moment."];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function nomPersonatge(index, personatges, extra) {
  if (personatges[index]?.nom) return personatges[index].nom;
  const nomsBase = ['Àlex', 'Marta', 'Oriol', 'Laia', 'Pol', 'Clara'];
  if (personatges[index]) {
    personatges[index].nom = nomsBase[index] || `Personatge ${index+1}`;
    return personatges[index].nom;
  }
  const idxExtra = index - personatges.length;
  if (extra[idxExtra]?.nom) return extra[idxExtra].nom;
  return 'Algú';
}

function fill(template, data) {
  return template
   .replace(/{p0}/g, data.p0)
   .replace(/{p1}/g, data.p1)
   .replace(/{p2}/g, data.p2)
   .replace(/{esc}/g, data.esc)
   .replace(/{mon}/g, data.mon)
   .replace(/{hora}/g, data.hora)
   .replace(/{verb}/g, rand(bancosLexic.verbAccio))
   .replace(/{emocio}/g, rand(bancosLexic.emocio))
   .replace(/{adverbi}/g, rand(bancosLexic.adverbis));
}

function generarLectura() {
  if (!seleccio.genere ||!seleccio.estructura) {
    return `<p style="color:var(--text-muted)">Falta configurar Gènere o Estructura.</p>`;
  }
  while (seleccio.personatges.length < seleccio.quantitat_personatges) {
    seleccio.personatges.push({tipus: 'secundari', rol: 'Complementari'});
  }
  const personatgesExtra = [];
  const numExtra = Math.floor(Math.random() * 2) + 1;
  const nomsRelleno = ['Jordi', 'Núria', 'Marc', 'Elena', 'Roger', 'Aina'];
  const rolsRelleno = ['Veí', 'Client', 'Guàrdia', 'Venedor', 'Missatger'];
  for (let i = 0; i < numExtra; i++) {
    personatgesExtra.push({nom: rand(nomsRelleno), rol: rand(rolsRelleno)});
  }
  const totalPersonatges = seleccio.personatges.length + personatgesExtra.length;
  const data = {
    p0: nomPersonatge(0, seleccio.personatges, personatgesExtra),
    p1: nomPersonatge(1, seleccio.personatges, personatgesExtra),
    p2: totalPersonatges > 2? nomPersonatge(2, seleccio.personatges, personatgesExtra) : nomPersonatge(1, seleccio.personatges, personatgesExtra),
    esc: seleccio.escenari?.detall || 'el lloc',
    mon: seleccio.mon?.detall || 'el món',
    hora: Math.floor(Math.random()*12+1) + ':00'
  };
  const targetParaules = 70000;
  const paraulesPerCapitol = 3000;
  const numCapitols = Math.floor(targetParaules / paraulesPerCapitol);
  const actes = seleccio.estructura.tipus === '3actes'? 3 : 4;
  const capitolsPerActe = Math.floor(numCapitols / actes);
  let text = '';
  let paraulesAcumulades = 0;
  const estil = seleccio.estil?.tipus || 'directe';
  const elementsCallback = [];
  for (let acte = 1; acte <= actes; acte++) {
    text += `<h1>Acte ${acte}</h1>`;
    for (let cap = 1; cap <= capitolsPerActe; cap++) {
      const numCapitolGlobal = (acte-1)*capitolsPerActe + cap;
      const idCapitol = `capitol-${numCapitolGlobal}`;
      text += `<h2 id="${idCapitol}">Capítol ${numCapitolGlobal}</h2>`;
      const numEscenes = 3;
      for (let escena = 1; escena <= numEscenes; escena++) {
        const idEscena = `escena-${numCapitolGlobal}-${escena}`;
        text += `<h3 id="${idEscena}">Escena ${escena}</h3>`;
        let escenaText = '';
        escenaText += fill(rand(plantillesCombinades.obertura), data) + ' ';
        if (escena % 4 === 0) escenaText += rand(motiusBase) + ' ';
        escenaText += rand(bancosLexic.connectors) + ' ';
        escenaText += fill(rand(plantillesCombinades.accio), data) + ' ';
        if (Math.random() > 0.5) escenaText += fill(rand(bancosLexic.pensament), data) + ' ';
        escenaText += fill(rand(plantillesCombinades.descripcio), data) + ' ';
        if (totalPersonatges > 1 && Math.random() > 0.4) escenaText += fill(rand(plantillesCombinades.dialog), data) + ' ';
        if (Math.random() > 0.7 && elementsCallback.length > 0) escenaText += `El ${rand(elementsCallback)} tornava a aparèixer. `;
        if (Math.random() > 0.8) {
          const nouElement = rand(['medalló', 'carta', 'clau', 'foto', 'llibre']);
          if (!elementsCallback.includes(nouElement)) elementsCallback.push(nouElement);
        }
        escenaText += fill(rand(plantillesCombinades.cliffhanger), data) + ' ';
        if (estil === 'poetic') escenaText = escenaText.replace(/\./g, '... ');
        if (estil === 'minimal') escenaText = escenaText.split('.').slice(0,6).join('.') + '.';
        text += `<p>${escenaText}</p>`;
        paraulesAcumulades += escenaText.split(' ').length;
      }
      text += `<p><em>${fill(rand(plantillesCombinades.tancamentCapitol), data)}</em></p>`;
    }
  }
  while (paraulesAcumulades < targetParaules) {
    text += `<h2>Capítol extra</h2><p>${fill(rand(plantillesCombinades.accio), data)} ${fill(rand(plantillesCombinades.descripcio), data)}</p>`;
    paraulesAcumulades += 40;
  }
  return text;
}

let seccionsLectura = [];
let seccioActual = 0;

function generarTOC(textHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(textHTML, 'text/html');
  const headers = doc.querySelectorAll('h1, h2, h3');
  let tocHTML = '';
  seccionsLectura = [];
  headers.forEach((h) => {
    if (h.id) {
      seccionsLectura.push(h.id);
      const classe = h.tagName === 'H1'? 'toc-acte' : h.tagName === 'H2'? 'toc-capitol' : 'toc-escena';
      tocHTML += `<div class="toc-item ${classe}" onclick="saltarASeccio('${h.id}')">${h.textContent}</div>`;
    }
  });
  const tocContainer = document.getElementById('toc-content');
  if (tocContainer) tocContainer.innerHTML = tocHTML;
}

window.saltarASeccio = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    seccioActual = seccionsLectura.indexOf(id);
    const tocContainer = document.getElementById('toc-container');
    if (tocContainer) tocContainer.classList.add('toc-hidden');
  }
};

function generarPreview() {
  const g = seleccio.genere?.detall || 'No seleccionat';
  const e = seleccio.estructura?.detall || 'No seleccionat';
  const q = seleccio.quantitat_personatges;
  const p = seleccio.personatges.length;
  return `
    <h3>Preview de la teva selecció</h3>
    <p><strong>Gènere:</strong> ${g}</p>
    <p><strong>Estructura:</strong> ${e}</p>
    <p><strong>Personatges:</strong> ${q} configurats, ${p} definits</p>
    <p><strong>Món:</strong> ${seleccio.mon?.detall || 'No seleccionat'}</p>
    <p><strong>Escenari:</strong> ${seleccio.escenari?.detall || 'No seleccionat'}</p>
    <p><strong>Estil:</strong> ${seleccio.estil?.detall || 'No seleccionat'}</p>
    <hr>
    <p style="color:var(--text-muted)">Toca "Generar Guió" per veure el text complet de 60k-80k paraules.</p>
  `;
}

function exportarTxt() {
  const contingut = document.getElementById('lectura-content').innerText || generarLectura();
  const blob = new Blob([contingut], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guio-lectura.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  ['genere', 'personatge', 'estructura', 'mon', 'escenari', 'estil'].forEach(cat => renderSubtabs(cat));
  const btnPreview = document.getElementById('btn-preview');
  if (btnPreview) btnPreview.onclick = () => {
    document.getElementById('resultat').innerHTML = generarPreview();
    document.getElementById('resultat').style.display = 'block';
  };
  const btnGenerar = document.getElementById('btn-generar');
  if (btnGenerar) btnGenerar.onclick = () => {
    const text = generarLectura();
    const lecturaContent = document.getElementById('lectura-content');
    if (lecturaContent) {
      lecturaContent.innerHTML = text;
      generarTOC(text);
      openScreen('lectura');
    }
  };
  const btnExportar = document.getElementById('btn-exportar');
  if (btnExportar) btnExportar.onclick = exportarTxt;
  const btnPrev = document.getElementById('btn-prev-seccio');
  if (btnPrev) btnPrev.onclick = () => {
    if (seccioActual > 0) { seccioActual--; saltarASeccio(seccionsLectura[seccioActual]); }
  };
  const btnNext = document.getElementById('btn-next-seccio');
  if (btnNext) btnNext.onclick = () => {
    if (seccioActual < seccionsLectura.length - 1) { seccioActual++; saltarASeccio(seccionsLectura[seccioActual]); }
  };
  const btnTocToggle = document.getElementById('btn-toc-toggle');
  if (btnTocToggle) btnTocToggle.onclick = () => {
    const tocContainer = document.getElementById('toc-container');
    if (tocContainer) tocContainer.classList.toggle('toc-hidden');
  };
});