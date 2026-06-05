// Abrir pantalla dedicada
window.openScreen = function(screenName) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('resultat').style.display = 'none';
  document.getElementById('screen-' + screenName).classList.add('active');
};

// Cerrar pantalla y volver al menú
window.closeScreen = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('menu').style.display = 'block';
  document.getElementById('resultat').style.display = 'block';
};

// Subtabs dummy
const dummyData = {
  'genere-content': ['Acció', 'Romàntic', 'Thriller', 'Comèdia', 'Ciència Ficció', 'Drama'],
  'personatge-content': ['Heròic', 'Antiheroi', 'Secundari', 'Villà', 'Protagonista', 'Narrador'],
  'estructura-content': ['3 Actes', 'Heroi', 'Lineal', 'No lineal', 'Paral·lel', 'Flashback'],
  'mon-content': ['Fantasia', 'Realista', 'Cyberpunk', 'Històric', 'Postapocalíptic', 'Contemporani'],
  'escenari-content': ['Ciutat', 'Bosc', 'Espai', 'Castell', 'Desert', 'Mar'],
  'estil-content': ['Directe', 'Poètic', 'Còmic', 'Fosc', 'Líric', 'Minimalista']
};

// Render inicial
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(dummyData).forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    dummyData[containerId].forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'subtab-btn';
      btn.textContent = text;
      btn.onclick = () => {
        container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      container.appendChild(btn);
    });
  });
});