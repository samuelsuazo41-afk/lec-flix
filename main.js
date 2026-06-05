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

// Por ahora dummy hasta que loaderjson.js cargue banco_personatge.json
const banco_dummy = {
  personatge: [
    {id: 'quantitat', nom: 'Quants personatges?', suggeriments: ['1', '2', '3', '4+']},
    {id: 'heroi', nom: 'Heròic', suggeriments: ['P1', 'P2', 'P3', 'P4'],
     roles: {generico: ['Protagonista', 'Mentor', 'Còmplic', 'Traïdor']}},
    {id: 'antagonista', nom: 'Antagonista', suggeriments: ['P1', 'P2', 'P3', 'P4'],
     roles: {generico: ['Vilà pur', 'Antiheroi', 'Títere', 'Tràgic']}}
  ]
};

function renderSubtabs(categoria) {
  const container = document.getElementById(categoria + '-content');
  const banco = window[`banco_${categoria}`] || banco_dummy[categoria];
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
        // Nivel 3 de personatge = P1, P2... abre nivel 4 de rol
        const num = sug;
        renderRolPersonatge(subtabId, num, itemRef);
        openScreen(`${categoria}-${subtabId}-${num.toLowerCase()}-rol`, `screen-${categoria}-${subtabId}`);
      } else if (categoria === 'personatge' && subtabId === 'quantitat') {
        // Guarda cuántos personajes quiere
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

  // Aquí luego detectas género: seleccio.genere || 'generico'
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