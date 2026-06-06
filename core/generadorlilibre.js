// core/generadorLlibre.js

function rand(arr) {
  if (!arr ||!arr.length) return {};
  return arr[Math.floor(Math.random() * arr.length)];
}

function randNoRep(arr, hist, maxHist = 15) {
  if (!arr ||!arr.length) return {};
  const filtrat = arr.filter(x =>!hist.includes(x.id || x));
  const pool = filtrat.length? filtrat : arr;
  const sel = rand(pool);
  hist.push(sel.id || sel);
  if (hist.length > maxHist) hist.shift();
  return sel;
}

function fill(template, data) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] || `{{${k}}}`);
}

export async function generarLlibre(config, bancs) {
  if (!bancs) throw new Error("Bancs no carregats");

  const hist = {ubicacions:[], escenes:[], personatges:[], beats:[]};

  // 1. Map UI -> generos JSON
  const mapGenere = {
    accio: ['policiac','thriller','aventura'],
    romantic: ['romance'],
    terror: ['terror'],
    misteri: ['policiac','misterio','thriller'],
    fantasia: ['fantasia'],
    comedia: ['comedia']
  };
  const genereTriat = Object.keys(config.genero).find(k => config.genero[k] > 0) || 'policiac';
  const generos = mapGenere[genereTriat] || ['policiac'];

  // 2. Beats amb fallback
  const beats = bancs.banco_estructura?.beats || Array(config.nCapitols).fill({id:1, nom:'Beat'});
  const beatsPerCapitol = Math.ceil(beats.length / config.nCapitols);

  const capitols = [];

  for (let i = 0; i < config.nCapitols; i++) {
    const beatsDelCapitol = beats.slice(i * beatsPerCapitol, (i + 1) * beatsPerCapitol);
    const escenes = [];

    for (const beat of beatsDelCapitol) {
      // 3. Ubicació Catalunya
      const ubiPool = (bancs.banco_ubicacion || []).filter(u => u.tags?.includes('catalunya'));
      const ubi = randNoRep(ubiPool, hist.ubicacions) || {ciutat:'Barcelona', banco_variables:{olor:['humitat'], so:['silenci']}};

      // 4. Escenari concret
      const escPool = (bancs.banco_escenarios || []).filter(e =>
        e.ciutat === ubi.ciutat && e.genero?.some(g => generos.includes(g))
      );
      const esc = randNoRep(escPool, hist.escenes) || {nom:'carrer'};

      // 5. Plantilla d'escena - atenció: banco_ecenes vs banco_escenes
      const escBancPool = (bancs.banco_ecenes || bancs.banco_escenes || []).filter(e => generos.includes(e.genero));
      const escBanc = rand(escBancPool) || {texto_base:'{{nom}} va caminar per {{ciutat}}.', banco_variables:{escenario:['carrer'], objeto:['pedra'], percepcio:['Veig']}};

      // 6. Personatge
      const persBanc = (bancs.banco_personatge || []).find(p => generos.includes(p.genero)) || {banco_variables:{nom:['Àlex'], descripcio_fisica:['alt']}};
      const nom = rand(persBanc.banco_variables?.nom) || 'Àlex';
      const desc = rand(persBanc.banco_variables?.descripcio_fisica || persBanc.banco_variables?.descripcio) || 'alt';
      const tic = rand(persBanc.banco_variables?.tic) || 'somriu';

      // 7. Emoció
      const emoBanc = rand((bancs.banco_emocions || []).filter(e => generos.includes(e.genero))) || {banco_variables:{sensacio:['fred'], pensament:['no sé']}};
      const sensacio = rand(emoBanc.banco_variables?.sensacio) || 'fred';
      const pensament = rand(emoBanc.banco_variables?.pensament || emoBanc.banco_variables?.dubte || emoBanc.banco_variables?.descobriment) || 'no sé';
      const reaccio = rand(emoBanc.banco_variables?.reaccio || emoBanc.banco_variables?.paralisis || emoBanc.banco_variables?.salida) || 'respira';

      // 8. Olor
      const tipusOlor = (beat.id || 1) <= 4? 'pluja' : (beat.id || 1) >= 11? 'sang' : (beat.id || 1) >= 8? 'fum' : 'pols';
      const olorBanc = (bancs.banco_olors || []).find(o => o.id === `olor_${tipusOlor}`);
      const olor = olorBanc? rand(olorBanc.texto_base) : rand(ubi.banco_variables?.olor) || 'humitat';

      // 9. So
      const so = rand(ubi.banco_variables?.so) || 'silenci';

      // 10. Dades per omplir plantilla
      const data = {
        ciutat: ubi.ciutat,
        so, olor, nom,
        escenario: rand(escBanc.banco_variables?.escenario) || 'carrer',
        objeto: rand(escBanc.banco_variables?.objeto || escBanc.banco_variables?.element) || 'pedra',
        sensacio, pensament, reaccio,
        percepcio: rand(escBanc.banco_variables?.percepcio || ['Veig'])
      };

      escenes.push({
        titol: `${beat.nom || 'Beat'} - ${esc.nom || 'Escena'}`,
        text: fill(escBanc.texto_base, data)
      });
    }

    capitols.push({ num: i + 1, escenes });
  }

  return {
    metadata: {
      genere: genereTriat,
      nCapitols: config.nCapitols
    },
    capitols
  };
}