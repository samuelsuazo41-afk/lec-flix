// === NAVEGACIÓN ===
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

// === ESTADO GLOBAL ===
window.seleccio = {
  genere: null,
  quantitat_personatges: 1,
  personatges: [],
  estructura: null,
  mon: null,
  escenari: null,
  estil: null
};

// === DUMMY FALLBACK - se usa si loaderjson.js falla ===
const banco_personatge_dummy = [
  {id: 'quantitat', nom: 'Quants personatges?', suggeriments: ['1', '2', '3', '4+']},
  {id: 'heroi', nom: 'Heròic', suggeriments: ['P1', 'P2', 'P3', 'P4'], roles: {generico: ['Protagonista', 'Mentor', 'Còmplic', 'Traïdor']}},
  {id: 'antagonista', nom: 'Antagonista', suggeriments: ['P1', 'P2', 'P3', 'P4'], roles: {generico: ['Vilà pur', 'Antiheroi', 'Títere', 'Tràgic']}},
  {id: 'secundari', nom: 'Secundari', suggeriments: ['P1', 'P2', 'P3', 'P4'], roles: {generico: ['Amic', 'Company', 'Veí', 'Testimoni']}},
  {id: 'mentor', nom: 'Mentor', suggeriments: ['P1', 'P2', 'P3', 'P4'], roles: {generico: ['Mestre', 'Guia', 'Saviesa', 'Protector']}},
  {id: 'amor', nom: 'Amor', suggeriments: ['P1', 'P2', 'P3', 'P4'], roles: {generico: ['Interès romàntic', 'Ex-parella', 'Amor secret', 'Amor impossible']}}
];

const bancos_dummy = {
  'generes': [
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
  'ubicacion': [
    {id: 'fantasia', nom: 'Fantasia', suggeriments: ['Alta', 'Urbana', 'Fosca', 'Èpica']},
    {id: 'ciencia', nom: 'Ciència Ficció', suggeriments: ['Dura', 'Space opera', 'Cyberpunk', 'Distopia']},
    {id: 'historic', nom: 'Històric', suggeriments: ['Modern', 'Victorià', 'Romà', 'Medieval']}
  ],
  'escenarios': [
    {id: 'ciutat', nom: 'Ciutat', suggeriments: ['Barcelona', 'Madrid', 'Nova York', 'Tòquio', 'París', 'Londres', 'Berlín', 'Roma']},
    {id: 'bosc', nom: 'Bosc', suggeriments: ['Muntanya', 'Encantat', 'Fosc', 'Tropical']}
  ],
  'olors': [
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

// Mapeo de categoría UI -> nombre real del banco cargado por loaderjson.js
const mapCategoria = {
  'genere': 'generes',
  'personatge': 'personatge',
  'estructura': 'estructura',
  'mon': 'ubicacion',
  'escenari': 'escenarios',
  'estil': 'olors'
};

// === RENDERIZADO ===
function renderSubtabs(categoria) {
  const container = document.getElementById(categoria + '-content');
  if (!container) return;

  const render = () => {
    const key = mapCategoria[categoria];
    const banco = categoria === 'personatge'
     ? (window.banco?.personatge || banco_personatge_dummy)
      : (window.banco?.[key] || bancos_dummy[key] || []);

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
  };

  // Espera a que carguen los bancos
  if (window.banco && window.banco[mapCategoria[categoria]]) render();
  else window.addEventListener('bancosLoaded', render, {once: true});
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
  const roles = itemRef.roles?.[genereActual] || itemRef.roles?.generico || ['Protagonista'];

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

// === MOTOR DEL GENERADOR DE LECTURA ===
function generarLectura() {
  // Validación mínima
  if (!seleccio.genere ||!seleccio.estructura || seleccio.personatges.length === 0) {
    return "<p style='color:var(--text-muted)'>Falta configurar Gènere, Estructura o almenys 1 Personatge.</p>";
  }

  // Rellenar personajes faltantes
  while (seleccio.personatges.length < seleccio.quantitat_personatges) {
    seleccio.personatges.push({tipus: 'secundari', rol: 'Complementari'});
  }

  const g = seleccio.genere.tipus;
  const gDetall = seleccio.genere.detall;
  const e = seleccio.estructura.tipus;
  const mon = seleccio.mon?.detall || 'un lloc qualsevol';
  const escenari = seleccio.escenari?.detall || 'un escenari indefinit';
  const estil = seleccio.estil?.tipus || 'directe';

  const plantilles = {
    'accio': {
      'Persecució': `La persecució comença quan ${nomPersonatge(0)} descobreix que ${nomPersonatge(1)} no és qui sembla. Corren per ${escenari}, mentre ${mon} s'enfonsa en el caos.`,
      'Supervivència': `${nomPersonatge(0)} ha de sobreviure. Sense recursos, a ${escenari}, cada pas per ${mon} és una aposta contra la mort.`
    },
    'terror': {
      'Psicològic': `Una veu ressona a la ment de ${nomPersonatge(0)}. A ${escenari}, entre les ombres de ${mon}, la realitat es trenca.`,
      'Sobrenatural': `Alguna cosa ha despertat a ${escenari}. ${nomPersonatge(0)} ho sent. ${mon} ja no és segur.`
    },
    'romantic': {
      'Amor impossible': `${nomPersonatge(0)} estima ${nomPersonatge(1)}, però ${mon} els separa. A ${escenari}, cada mirada és una ferida.`,
      'Segona oportunitat': `Després d'anys, ${nomPersonatge(0)} torna a trobar ${nomPersonatge(1)} a ${escenari}. ${mon} ha canviat, però els sentiments no.`
    },
    'comedia': {
      'Situacional': `${nomPersonatge(0)} entra a ${escenari} i ho embolica tot. ${mon} no tornarà a ser el mateix.`
    }
  };

  let text = '';
  if (e === '3actes') {
    text += `<h3>Acte 1 - Plantejament</h3><p>${plantilles[g]?.[gDetall] || 'La història comença.'}</p>`;
    text += `<h3>Acte 2 - Nus</h3><p>La tensió puja. ${nomPersonatge(0)} ha de decidir. ${escenari} es torna perillós.</p>`;
    text += `<h3>Acte 3 - Desenllaç</h3><p>El final arriba. ${mon} guarda el secret. ${nomPersonatge(0)} afronta el destí.</p>`;
  } else if (e === 'viatge') {
    text += `<h3>Inici del Viatge</h3><p>${nomPersonatge(0)} abandona ${escenari}. El camí per ${mon} és llarg.</p>`;
    text += `<h3>Prova</h3><p>En el viatge, troba el seu límit. ${nomPersonatge(1) || 'Un desconegut'} l'ajuda o el traiciona.</p>`;
    text += `<h3>Retorn</h3><p>Torna diferent. ${escenari} ja no és el mateix. Ni ${nomPersonatge(0)}.</p>`;
  } else {
    text += `<p>${plantilles[g]?.[gDetall] || 'La història es desenvolupa.'}</p>`;
  }

  if (estil === 'poetic') {
    text = text.replace(/\./g, '... ');
  } else if (estil === 'minimal') {
    text = text.split('.').slice(0, 3).join('.') + '.';
  }

  return text;
}

function nomPersonatge(index) {
  const p = seleccio.personatges[index];
  if (!p) return 'Algú';
  const noms = ['Àlex', 'Marta', 'Oriol', 'Laia'];
  return noms[index] || `Personatge ${index+1}`;
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  ['genere', 'personatge', 'estructura', 'mon', 'escenari', 'estil'].forEach(cat => {
    renderSubtabs(cat);
  });

  document.getElementById('btn-generar').onclick = () => {
    const resultat = generarLectura();
    document.getElementById('resultat').innerHTML = resultat;
    document.getElementById('resultat').style.display = 'block';
  };
});