window.openScreen = function(screenName, returnTo = null) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('resultat').style.display = 'none';
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

// Bancos completos para todas las categorías
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

// Personatge con 6 categorías y 4 niveles
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
  const banco = categoria === 'personatge'
  ? window.banco_personatge || banco_personatge_dummy
    : bancos[categoria];

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
  const genereActual = seleccio.genere || 'generico';
  const roles = itemRef.roles[genereActual] || itemRef.roles.generico;

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

document.addEventListener('DOMContentLoaded', () => {
  ['genere', 'personatge', 'estructura', 'mon', 'escenari', 'estil'].forEach(cat => {
    renderSubtabs(cat);
  });
});