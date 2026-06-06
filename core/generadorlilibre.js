// core/generadorLlibre.js

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randNoRep(arr, hist, maxHist=15) {
  const filtrat = arr.filter(x =>!hist.includes(x.id || x));
  const pool = filtrat.length? filtrat : arr;
  const sel = rand(pool);
  hist.push(sel.id || sel);
  if (hist.length > maxHist) hist.shift();
  return sel;
}

function fill(template, data) {
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

  // 2. Beats
  const beats = bancs.banco_estructura.beats;
  const beatsPerCapitol = Math.ceil(beats.length / config.nCapitols);

  const capitols = [];

  for (let i = 0; i < config.nCapitols; i++) {
    const beatsDelCapitol = beats.slice(i * beatsPerCapitol, (i + 1) * beatsPerCapitol);
    const escenes = [];

    for (const beat of beatsDelCapitol) {
      // 3. Ubicació Catalunya
      const ubiPool = bancs.banco_ubicacion.filter(u => u.tags.includes('catalunya'));
      const ubi = randNoRep(ubiPool, hist.ubicacions);

      // 4. Escenari concret
      const escPool = bancs.banco_escenarios.filter(e =>
        e.ciutat === ubi.ciutat && e.genero.some(g => generos.includes(g))
      );
      const esc = randNoRep(escPool, hist.escenes);

      // 5. Plantilla d'escena
      const escBancPool = bancs.banco_ecenes.filter(e => generos.includes(e.genero));
      const escBanc = rand(escBancPool);

      // 6. Personatge
      const persBanc = bancs.banco_personatge.find(p => generos.includes(p.genero));
      const nom = rand(persBanc.banco_variables.nom);
      const desc = rand(persBanc.banco_variables.descripcio_fisica || persBanc.banco_variables.descripcio);
      const tic = rand(persBanc.banco_variables.tic);

      // 7. Emoció segons beat
      const emoBanc = rand(bancs.banco_emocions.filter(e => generos.includes(e.genero)));
      const sensacio = rand(emoBanc.banco_variables.sensacio);
      const pensament = rand(emoBanc.banco_variables.pensament || emoBanc.banco_variables.dubte || emoBanc.banco_variables.descobriment);
      const reaccio = rand(emoBanc.banco_variables.reaccio || emoBanc.banco_variables.paralisis || emoBanc.banco_variables.salida);

      // 8. Olor segons beat
      const tipusOlor = beat.id <= 4? 'pluja' : beat.id >= 11? 'sang' : beat.id >= 8? 'fum' : 'pols';
      const olorBanc = bancs.banco_olors.find(o => o.id === `olor_${tipusOlor}`);
      const olor = olorBanc? rand(olorBanc.texto_base) : rand(ubi.banco_variables.olor);

      // 9. So de la ciutat
      const so = rand(ubi.banco_variables.so);

      // 10. Dades per omplir plantilla
      const data = {
        ciutat: ubi.ciutat,
        so, olor, nom,
        escenario: rand(escBanc.banco_variables.escenario),
        objeto: rand(escBanc.banco_variables.objeto || escBanc.banco_variables.element),
        sensacio, pensament: pensament, reaccio,
        percepcio: rand(escBanc.banco_variables.percepcio || ['Veig'])
      };

      escenes.push({
        titol: `${beat.nom} - ${esc.nom}`,
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