// core/generadorLlibre.js - Motor de frases ampliat, sense export
function rand(arr) {
  if (!arr ||!arr.length) return {};
  return arr[Math.floor(Math.random() * arr.length)];
}

function randNoRep(arr, hist, maxHist = 15) {
  if (!arr ||!arr.length) return {};
  const filtrat = arr.filter(x =>!hist.includes(x.id || x));
  const pool = filtrat.length? filtrat : arr;
  const sel = rand(pool);
  hist.push(sel.id || JSON.stringify(sel));
  if (hist.length > maxHist) hist.shift();
  return sel;
}

function fill(template, data) {
  if (!template) return '';
  // Suporta {{var}} i {var}
  return template
   .replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] || `{{${k}}}`)
   .replace(/\{(\w+)\}/g, (_, k) => data[k] || `{${k}}`);
}

// FUNCIÓ PRINCIPAL: genera 1 escena amb olor+so+emoció
function generarEscena(beat, config, bancs, hist) {
  const mapGenere = {
    accio: ['policiac','thriller','aventura'],
    romantic: ['romance'],
    terror: ['terror'],
    misteri: ['policiac','misterio','thriller'],
    fantasia: ['fantasia'],
    comedia: ['comedia']
  };
  const genereTriat = config.genere || 'policiac';
  const generos = mapGenere[genereTriat] || ['policiac'];

  // 1. Ubicació Catalunya
  const ubiPool = (bancs.banco_ubicacion || []).filter(u => u.tags?.includes('catalunya'));
  const ubi = randNoRep(ubiPool, hist.ubicacions) || {ciutat:'Barcelona', banco_variables:{olor:['humitat'], so:['silenci']}};

  // 2. Escenari concret
  const escPool = (bancs.banco_escenarios || []).filter(e => e.ciutat === ubi.ciutat && e.genero?.some(g => generos.includes(g)));
  const esc = randNoRep(escPool, hist.escenes) || {nom:'Carrer'};

  // 3. Plantilla d'escena - banco_escenes amb fallback
  const escBancPool = (bancs.banco_escenes || bancs.banco_lectura || []).filter(e => e.genero && generos.includes(e.genero));
  const escBanc = rand(escBancPool) || {texto_base:'{{nom}} va caminar per {{ciutat}}.', banco_variables:{escenario:['carrer']}};

  // 4. Personatge
  const persBanc = (bancs.banco_personatge || []).find(p => p.genero && generos.includes(p.genero)) || {banco_variables:{nom:['Àlex']}};
  const nom = rand(persBanc.banco_variables?.nom) || 'Àlex';
  const tic = rand(persBanc.banco_variables?.tic) || 'somriu';

  // 5. Emoció
  const emoBanc = rand((bancs.banco_emocions || []).filter(e => e.genero && generos.includes(e.genero))) || {banco_variables:{sensacio:['fred']}};
  const sensacio = rand(emoBanc.banco_variables?.sensacio) || 'fred';
  const pensament = rand(emoBanc.banco_variables?.pensament || ['no sé']) || 'no sé';

  // 6. Olor segons beat
  const tipusOlor = (beat.id || 1) <= 4? 'pluja' : (beat.id || 1) >= 11? 'sang' : (beat.id || 1) >= 8? 'fum' : 'pols';
  const olorBanc = (bancs.banco_olors || []).find(o => o.id === `olor_${tipusOlor}`);
  const olor = olorBanc? rand(olorBanc.texto_base) : rand(ubi.banco_variables?.olor) || 'humitat';

  // 7. So
  const so = rand(ubi.banco_variables?.so) || 'silenci';

  // 8. Dades per omplir
  const data = {
    ciutat: ubi.ciutat,
    so, olor, nom, tic,
    escenario: rand(escBanc.banco_variables?.escenario) || esc.nom,
    objeto: rand(escBanc.banco_variables?.objeto || ['pedra']),
    sensacio, pensament,
    percepcio: rand(escBanc.banco_variables?.percepcio || ['Veig'])
  };

  return {
    titol: `${beat.nom || 'Beat'} - ${esc.nom}`,
    text: fill(escBanc.texto_base, data)
  };
                        }
