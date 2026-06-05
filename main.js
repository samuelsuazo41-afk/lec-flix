// Función global para desplegar tabs
window.toggleTab = function(tabId) {
  const tab = document.getElementById(tabId);
  if (!tab) return;

  const isOpen = tab.classList.contains('open');

  // Cerrar todos
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('open'));

  // Abrir el clicado si no estaba abierto
  if (!isOpen) {
    tab.classList.add('open');
  }
};

// Subtabs dummy para probar
const dummyData = {
  'genere-content': ['Acció', 'Romàntic', 'Thriller', 'Comèdia'],
  'personatge-content': ['Heròic', 'Antiheroi', 'Secundari', 'Villà'],
  'estructura-content': ['3 Actes', 'Heroi', 'Lineal', 'No lineal'],
  'mon-content': ['Fantasia', 'Realista', 'Cyberpunk', 'Històric'],
  'escenari-content': ['Ciutat', 'Bosc', 'Espai', 'Castell'],
  'estil-content': ['Directe', 'Poètic', 'Còmic', 'Fosc']
};

// Render inicial de subtabs
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
