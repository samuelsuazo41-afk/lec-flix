// js/main.js - Lec-Flix 4 nivells + 17 capítols 60k

// Estat global
window.seleccio = {
  titol: null,
  genere: null,
  quantitat_personatges: 1,
  personatges: [],
  estructura: null,
  mon: null,
  escenari: null,
  estil: null
};

let llibreGenerat = null;

// Bancos nivell 1
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

// Banc personatges nivell 2 amb rols nivell 3
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

// Banc lèxic
const bancosLexic = {
  verbFisic: ["córrer", "escapar", "llançar-se", "saltar", "girar-se", "agafar", "empènyer", "arrossegar", "tremolar", "caminar", "trontollar", "estirar-se", "agenollar-se", "alçar-se", "copar", "tancar", "obrir", "trencar", "esquivar", "fugir", "envestir", "amagar-se", "recular", "avançar", "precipitar-se"],
  verbVerbal: ["cridar", "xiuxiuejar", "murar", "confessar", "preguntar", "respondre", "insistir", "suplicar"],
  emocio: ["amb ràbia", "en silenci", "amb por", "amb esperança", "sense pensar-ho", "amb determinació", "amb dubte", "amb pressa", "lentament", "amb força", "amb tristesa", "amb coratge", "amb sarcasme", "amb tendresa", "amb fredor", "amb neguit", "amb resignació", "amb fúria", "amb calma", "amb desesperació", "amb ironia", "amb cautela", "amb ànsia"],
  adverbis: ["de cop", "lentament", "ràpid", "en silenci", "amb força", "sense fer soroll", "de sobte", "poc a poc", "bruscament", "suavament", "inesperadament", "constantment", "amb cura", "amb nervis"],
  connectors: ["Mentrestant,", "Al cap d’uns minuts,", "De cop i volta,", "Sense adonar-se,", "Més tard,", "Llavors,", "Però,", "No obstant això,", "Aleshores,", "Després de tot,", "En aquell instant,", "Paradoxalment,", "Curiosament,"],
  pensament: [
    "{p0} va pensar que tot era un error.",
    "No podia creure el que veia.",
    "Havia de prendre una decisió, i ràpid.",
    "Si fallava, no hi hauria segona oportunitat.",
    "Tot depenia d’aquell moment.",
    "{p0} es preguntava si havia estat un error.",
    "La ment de {p0} corria més ràpid que les seves cames.",
    "No hi havia temps per dubtar.",
    "{p0} sabia que això canviaria tot.",
    "No podia permetre’s fallar ara."
  ]
};

// Plantilles combinades per tipus d’escena
const plantillesCombinades = {
  obertura: [
    "La llum entrava quan {p0} va obrir els ulls.",
    "{p0} no sabia que aquell dia {p1} canviaria tot.",
    "{p0} mirava {esc} pensant en {p2}.",
    "El rellotge marcava les {hora} quan {p0} va prendre la decisió.",
    "El silenci pesava sobre {esc} mentre {p0} respirava fons.",
    "{p0} va sentir un calfred en creuar la porta de {esc}.",
    "Aquell matí, {p0} va despertar amb la sensació que algo anava malament.",
    "Els ulls de {p0} es van clavar en {esc} buscant una resposta."
  ],
  accio: [
    "{p0} va {verbfisic} {emocio} cap a {esc}.",
    "Sense pensar-ho, {p0} va {verbfisic} per {mon}.",
    "{p0} va {verbfisic} {adverbi} mentre {p1} mirava.",
    "{p0} va {verbfisic} {emocio} i després es va aturar.",
    "{p0} va avançar {adverbi} cap a la foscor de {esc}.",
    "Amb un moviment brusc, {p0} va {verbfisic} {emocio}.",
    "{p0} no va dubtar: va {verbfisic} {adverbi} i va creuar {esc}.",
    "El cos de {p0} va reaccionar abans que la ment: va {verbfisic} {emocio}."
  ],
  dialog: [
    '"No puc més", va {verbverbal} {p0}.',
    '"Tens raó", va respondre {p1}. "Però ho hem de provar."',
    '"Què vols dir?", va preguntar {p0}.',
    '"Que tot ha canviat", va xiuxiuejar {p2}.',
    '"No t’ho crec", va tallar {p1}.',
    '"Mira això", va dir {p0} assenyalant {esc}.',
    '"No tenim temps", va insistir {p1} amb urgència.',
    '"Confia en mi", va suplicar {p2} baixant la veu.'
  ],
  descripcio: [
    "L’aire a {esc} olia a pluja.",
    "{mon} s’estenia davant d’ells, infinit.",
    "Les parets de {esc} guardaven secrets.",
    "El vent bufava {adverbi} des de {mon}.",
    "L’ombra de {esc} s’allargava sobre el terra fred.",
    "Un silenci dens omplia cada racó de {mon}.",
    "La llum jugava amb les textures de {esc}, creant patrons impossibles.",
    "{mon} semblava viure amb vida pròpia, respirant al seu ritme."
  ],
  cliffhanger: [
    "Però llavors, va sentir un soroll.",
    "I en aquell moment, tot va canviar.",
    "No tenia ni idea del que venia després.",
    "El telèfon va sonar.",
    "La porta es va obrir sola.",
    "Algú els observava des de l’ombra.",
    "El terra va tremolar sota els seus peus.",
    "Una figura va aparèixer al final del passadís."
  ],
  tancamentCapitol: [
    "El capítol acabava aquí.",
    "Demà tornaria al mateix lloc.",
    "La decisió estava presa.",
    "No hi havia volta enrere.",
    "Aquella nit canviaria tot.",
    "El destí ja estava marcat.",
    "No quedava temps per lamentar-se.",
    "El següent pas seria l’últim."
  ]
};

// Control de repetició
const usatsString = {obertura:new Set(), accio:new Set(), dialog:new Set(), descripcio:new Set(), cliffhanger:new Set()};
function randNoRep(key, arr) {
  let fr, tries = 0;
  do {
    fr = rand(arr);
    tries++;
  } while (usatsString[key].has(fr) && tries < 15);
  usatsString[key].add(fr);
  if (usatsString[key].size > 30) usatsString[key].clear();
  return fr;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fixMayus(str) {
  return str.replace(/, ([A-ZÀ-Ú])/g, ', $1'.toLowerCase());
}

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
  .replace(/{verbfisic}/g, rand(bancosLexic.verbFisic))
  .replace(/{verbverbal}/g, rand(bancosLexic.verbVerbal))
  .replace(/{emocio}/g, rand(bancosLexic.emocio))
  .replace(/{adverbi}/g, rand(bancosLexic.adverbis));
}

// Diccionari de temes segons títol
const diccionariTemes = {
  traicio: ['mentida', 'secret', 'dubt', 'confiança', 'trencar'],
  mort: ['silenci', 'ombra', 'final', 'comiat', 'fred'],
  amor: ['cor', 'puls', 'calor', 'desig', 'apropar'],
  fuga: ['córrer', 'llindar', 'portes', 'camí', 'lluny']
};

function analitzarTitol(titol) {
  if (!titol) return {tema:'generic', keywords:[]};
  const lower = titol.toLowerCase();
  for (let k in diccionariTemes) {
    if (lower.includes(k)) return {tema:k, keywords:diccionariTemes[k]};
  }
  return {tema:'generic', keywords:[]};
}

// Mapa de beats 17 capítols
function calcularMapa(numCapitols, titol) {
  const beatsBase = [
    'Hook', 'Setup', 'Catalitzador', 'Debat', 'PP1',
    'BStory', 'FunAndGames', 'Midpoint', 'MalsConsells',
    'AllIsLost', 'DarkNight', 'PP2', 'Tormenta',
    'Climax1', 'Climax2', 'Climax3', 'Resolucio'
  ];
  const {tema} = analitzarTitol(titol);
  const beats = [...beatsBase];

  if (tema === 'traicio') {
    beats[4] = 'Primera Mentida';
    beats[8] = 'Confrontacio';
    beats[14] = 'Traicio Final';
  }
  if (tema === 'fuga') {
    beats[4] = 'Primer Obstacle';
    beats[8] = 'Persecucio';
    beats[14] = 'Ultima Frontera';
  }

  const tensio = [];
  for (let i = 0; i < numCapitols; i++) {
    tensio.push(i / numCapitols);
  }
  return {beats, tensio, keywords:analitzarTitol(titol).keywords};
}

// Generador principal
function generarLectura() {
  if (!seleccio.genere ||!seleccio.estructura) {
    return `<p style="color:var(--text-muted)">Falta configurar Gènere o Estructura.</p>`;
  }

  while (seleccio.personatges.length < seleccio.quantitat_personatges) {
    seleccio.personatges.push({tipus: 'secundari', rol: 'Complementari'});
  }

  const personatgesExtra = [];
  const nomsRelleno = ['Jordi', 'Núria', 'Marc', 'Elena', 'Roger', 'Aina', 'Pau', 'Clàudia', 'Bernat', 'Iris'];
  const rolsRelleno = ['Veí', 'Client', 'Guàrdia', 'Venedor', 'Missatger', 'Testimoni', 'Mecànic', 'Infermera'];
  for (let i = 0; i < 3; i++) {
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

  const numCapitols = 17;
  const actes = 4;
  const capitolsPerActe = [5, 5, 4, 3];
  const {beats, tensio} = calcularMapa(numCapitols, seleccio.titol);

  let text = '';
  const estil = seleccio.estil?.tipus || 'directe';

  for (let acte = 1; acte <= actes; acte++) {
    text += `<h1>Acte ${acte}</h1>`;

    const capInici = capitolsPerActe.slice(0, acte-1).reduce((a,b)=>a+b, 0) + 1;
    const capFinal = capInici + capitolsPerActe[acte-1] - 1;

    for (let numCapitolGlobal = capInici; numCapitolGlobal <= capFinal; numCapitolGlobal++) {
      const idCapitol = `capitol-${numCapitolGlobal}`;
      const beat = beats[numCapitolGlobal-1];
      const tens = tensio[numCapitolGlobal-1];

      text += `<h2 id="${idCapitol}">Capítol ${numCapitolGlobal}</h2>`;

      const numEscenes = 5;

      for (let escena = 1; escena <= numEscenes; escena++) {
        const idEscena = `escena-${numCapitolGlobal}-${escena}`;
        text += `<h3 id="${idEscena}">Escena ${escena}</h3>`;
        let escenaText = '';

        escenaText += fill(randNoRep('obertura', plantillesCombinades.obertura), data) + ';

        const numAccions = tens > 0.7? 5 : 4;
        for (let i = 0; i < numAccions; i++) {
          escenaText += fill(randNoRep('accio', plantillesCombinades.accio), data) + ' ';
        }

        if (beat === 'Midpoint' || beat === 'Confrontacio') {
          escenaText += fill(rand(bancosLexic.pensament), data) + ' ';
          escenaText += fill(randNoRep('dialog', plantillesCombinades.dialog), data) + ' ';
        }

        if (Math.random() > 0.3) {
          escenaText += fill(rand(bancosLexic.pensament), data) + ' ';
        }

        escenaText += fill(randNoRep('descripcio', plantillesCombinades.descripcio), data) + ' ';
        escenaText += fill(randNoRep('descripcio', plantillesCombinades.descripcio), data) + ';

        if (totalPersonatges > 1 && Math.random() > 0.3) {
          escenaText += fill(randNoRep('dialog', plantillesCombinades.dialog), data) + ' ';
        }

        if (escena === numEscenes && Math.random() > (0.8 - tens)) {
          escenaText += fill(randNoRep('cliffhanger', plantillesCombinades.cliffhanger), data) + ' ';
        }

        escenaText = fixMayus(escenaText);

        if (estil === 'poetic') escenaText = escenaText.replace(/\./g, '... ');
        if (estil === 'minimal') escenaText = escenaText.split('.').slice(0,12).join('.') + '.';

        text += `<p>${escenaText}</p>`;
      }

      text += `<p><em>${rand(plantillesCombinades.tancamentCapitol)}</em></p>`;
    }
  }

  return text;
}

// TOC i navegació
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

// Preview
function generarPreview() {
  const g = seleccio.genere?.detall || 'No seleccionat';
  const e = seleccio.estructura?.detall || 'No seleccionat';
  const q = seleccio.quantitat_personatges;
  const p = seleccio.personatges.length;
  const t = seleccio.titol || 'Sense títol';
  return `
    <h3>Preview de la teva selecció</h3>
    <p><strong>Títol:</strong> ${t}</p>
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

// Exportar
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

// Renderitzar sub-tabs nivell 2
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

// Renderitzar subtabs nivell 3
function renderSuggeriments(categoria, subtabId, suggeriments, itemRef) {
  const containerId = `${categoria}-${subtabId}-content`;
  let container = document.getElementById(containerId);
  if (!container) {
    const parentScreen = document.getElementById(`screen-${categoria}`);
    container = document.createElement('section');
    container.id = containerId;
    container.className = 'screen';
    container.innerHTML = `
      <div class="screen-header">
        <button onclick="closeScreen('screen-${categoria}')">← Tornar</button>
        <h2>${itemRef.nom}</h2>
      </div>
      <div class="screen-content"></div>
    `;
    document.querySelector('main').appendChild(container);
  }
  const content = container.querySelector('.screen-content');
  content.innerHTML = '';
  suggeriments.forEach(sug => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = sug;
    btn.onclick = () => {
      content.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
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
    content.appendChild(btn);
  });
}

// Renderitzar rols personatge nivell 4
function renderRolPersonatge(tipus, num, itemRef) {
  const containerId = `personatge-${tipus}-${num.toLowerCase()}-rol-content`;
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('section');
    container.id = containerId;
    container.className = 'screen';
    container.innerHTML = `
      <div class="screen-header">
        <button onclick="closeScreen('screen-personatge-${tipus}')">← Tornar</button>
        <h2>Rol ${num}</h2>
      </div>
      <div class="screen-content"></div>
    `;
    document.querySelector('main').appendChild(container);
  }
  const content = container.querySelector('.screen-content');
  const index = parseInt(num.substring(1)) - 1;
  const genereActual = seleccio.genere?.tipus || 'generico';
  const roles = itemRef.roles?.[genereActual] || itemRef.roles?.generico;
  content.innerHTML = '';
  roles.forEach(rol => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = rol;
    btn.onclick = () => {
      content.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      seleccio.personatges[index] = {tipus: tipus, rol: rol};
      closeScreen(`screen-personatge-${tipus}`);
    };
    content.appendChild(btn);
  });
}

// Inicialització
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