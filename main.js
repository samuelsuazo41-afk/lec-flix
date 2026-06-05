// Abrir pantalla dedicada - ahora acepta nivel 3
window.openScreen = function(screenName, returnTo = null) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('resultat').style.display = 'none';

  // Guarda a dónde volver si es nivel 3
  const screen = document.getElementById('screen-' + screenName);
  screen.dataset.returnTo = returnTo || 'menu';
  screen.classList.add('active');
};

// Cerrar pantalla - si le pasas un ID vuelve a esa pantalla, si no al menú
window.closeScreen = function(returnTo = null) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  if (returnTo) {
    // Volver a pantalla nivel 2
    document.getElementById(returnTo).classList.add('active');
  } else {
    // Volver al menú principal
    document.getElementById('menu').style.display = 'block';
    document.getElementById('resultat').style.display = 'block';
  }
};

// Bancos reales - por ahora dummy con estructura de sugerencias
const bancos = {
  'genere': [
    {id: 'accio', nom: 'Acció', suggeriments: ['Persecució', 'Supervivència', 'Rescat', 'Invasió']},
    {id: 'romantic', nom: 'Romàntic', suggeriments: ['Amor impossible', 'Segona oportunitat', 'Triangle', 'A distància']},
    {id: 'terror', nom: 'Terror', suggeriments: ['Psicològic', 'Sobrenatural', 'Slasher', 'Gore']},
    {id: 'comedia', nom: 'Comèdia', suggeriments: ['Situacional', 'Paròdia', 'Romàntica', 'Negra']}
  ],
  'personatge': [
    {id: 'heroi', nom: 'Heròic', suggeriments: ['Clàssic', 'Antiheroi', 'Reticent', 'Tragic']},
    {id: 'antagonista', nom: 'Antagonista', suggeriments: ['Malvat pur', 'Amb motius', 'Còmic', 'Tràgic']}
  ],
  'estructura': [
    {id: '3actes', nom: '3 Actes', suggeriments: ['Clàssic', 'Accelerat', 'Amb flashbacks', 'Paral·lel']},
    {id: 'viatge', nom: 'Viatge', suggeriments: ['Físic', 'Emocional', 'Espiritual', 'Interior']}
  ],
  'mon': [
    {id: 'fantasia', nom: 'Fantasia', suggeriments: ['Alta', 'Urbana', 'Fosca', 'Èpica']},
    {id: 'ciencia', nom: 'Ciència Ficció', suggeriments: ['Dura', 'Space opera', 'Cyberpunk', 'Distopia']}
  ],
  'escenari': [
    {id: 'ciutat', nom: 'Ciutat', suggeriments: null},
    {id: 'bosc', nom: 'Bosc', suggeriments: null}
  ],
  'estil': [
    {id: 'directe', nom: 'Directe', suggeriments: null},
    {id: 'poetic', nom: 'Poètic', suggeriments: null}
  ]
};

// Render de subtabs nivel 2
function renderSubtabs(categoria) {
  const container = document.getElementById(categoria + '-content');
  if (!container ||!bancos[categoria]) return;

  container.innerHTML = '';
  bancos[categoria].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = item.nom;
    btn.onclick = () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (item.suggeriments) {
        // Tiene nivel 3: abrir pantalla de sugerencias
        renderSuggeriments(categoria, item.id, item.suggeriments);
        openScreen(`${categoria}-${item.id}`, `screen-${categoria}`);
      } else {
        // No tiene nivel 3: guardar y cerrar
        console.log('Seleccionat:', categoria, item.id);
        closeScreen();
      }
    };
    container.appendChild(btn);
  });
}

// Render de subtabs nivel 3 - sugerencias
function renderSuggeriments(categoria, subtabId, suggeriments) {
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

      console.log('Seleccionat:', categoria, subtabId, sug);
      closeScreen(`screen-${categoria}`); // vuelve al nivel 2
    };
    container.appendChild(btn);
  });
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  ['genere', 'personatge', 'estructura', 'mon', 'escenari', 'estil'].forEach(cat => {
    renderSubtabs(cat);
  });
});