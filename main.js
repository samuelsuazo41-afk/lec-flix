// js/main.js - Generador de llibres 60k-100k amb tots els bancs cablejats
import { loadAllBancs } from '../data/loaderjson.js';

let BANCS = {};
let HIST = {
  ubicacions: [],
  escenaris: [],
  beats: [],
  personatges: [],
  plantilles: [],
  emocions: []
};

// PRESETS RITME - Controlen la longitud real
const PRESETS_RITME = {
  'Relat Curt': { cap: 5, escenesPerCap: 5, paraulesPerEscena: 200 },
  'Novel·la': { cap: 25, escenesPerCap: 8, paraulesPerEscena: 300 },
  'Èpic': { cap: 40, escenesPerCap: 10, paraulesPerEscena: 300 }
};

// Multiplicador POV
const MULT_POV = {
  '1 Protagonista': 1,
  '3 POV Rotatius': 3,
  'Omniscient': 1.5
};

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

const randNoRep = (arr, key, max = 20) => {
  const f = arr.filter(x =>!HIST[key].includes(x.id || x));
  const pool = f.length? f : arr;
  const sel = rand(pool);
  HIST[key].push(sel.id || sel);
  if (HIST[key].length > max) HIST[key].shift();
  return sel;
};

const fill = (t, d) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => d[k] || `{{${k}}}`);

const MAP_GENERE = {
  accio: ['policiac', 'thriller', 'aventura'],
  romantic: ['romance'],
  terror: ['terror'],
  misteri: ['policiac', 'misterio', 'thriller'],
  fantasia: ['fantasia'],
  comedia: ['comedia']
};

export async function generarLlibre(config) {
  BANCS = await loadAllBancs();
  HIST = { ubicacions: [], escenaris: [], beats: [], personatges: [], plantilles: [], emocions: [] };

  const genereUI = config.genere || 'policiac';
  const generos = MAP_GENERE[genereUI] || ['policiac'];
  const preset = PRESETS_RITME[config.ritme || 'Novel·la'];
  const multPOV = MULT_POV[config.pov || '1 Protagonista'];

  const numCap = preset.cap;
  const escPerCap = Math.ceil(preset.escenesPerCap * multPOV);
  const beats = BANCS.banco_estructura.beats;

  const capitols = [];

  for (let i = 0; i < numCap; i++) {
    const escenes = [];

    for (let j = 0; j < escPerCap; j++) {
      const idx = i * escPerCap + j;
      const beat = beats[idx % beats.length];

      // 1. Ubicació - si l'usuari ha triat "mon", filtra per ciutat
      let ubiPool = BANCS.banco_ubicacion.filter(u => u.tags.includes('catalunya'));
      if (config.mon) {
        ubiPool = ubiPool.filter(u => u.ciutat === config.mon);
      }
      const ubi = ubiPool.length? randNoRep(ubiPool, 'ubicacions') : rand(BANCS.banco_ubicacion);

      // 2. Escenari concret - si l'usuari ha triat escenari, l'usa directe
      let esc;
      if (config.escenariId) {
        esc = BANCS.banco_escenarios.find(e => e.id === config.escenariId) || rand(BANCS.banco_escenarios);
      } else {
        const escPool = BANCS.banco_escenarios.filter(e =>
          e.ciutat === ubi.ciutat && e.genero.some(g => generos.includes(g))
        );
        esc = escPool.length? randNoRep(escPool, 'escenaris') : rand(BANCS.banco_escenarios);
      }

      // 3. Plantilla de lectura - ja no fa fallback a banco_ecenes
      const lectPool = BANCS.banco_lectura.filter(l => generos.includes(l.genero));
      const plantBase = lectPool.length? randNoRep(lectPool, 'plantilles') : rand(BANCS.banco_lectura);

      // 4. Personatge - si l'usuari ha triat, l'usa
      let persBanc;
      if (config.personatgeId) {
        persBanc = BANCS.banco_personatge.find(p => p.id === config.personatgeId) || BANCS.banco_personatge[0];
      } else {
        persBanc = BANCS.banco_personatge.find(p => generos.includes(p.genero)) || BANCS.banco_personatge[0];
      }
      const nom = rand(persBanc.banco_variables.nom);
      const tic = rand(persBanc.banco_variables.tic || ['']);

      // 5. Emoció
      const emoPool = BANCS.banco_emocions.filter(e => generos.includes(e.genero));
      const emo = emoPool.length? rand(emoPool) : BANCS.banco_emocions[0];
      const sensacio = rand(emo.banco_variables.sensacio || ['El cor em batega']);
      const pensament = rand(emo.banco_variables.pensament || emo.banco_variables.dubte || ['Penso en tot això']);
      const reaccio = rand(emo.banco_variables.reaccio || emo.banco_variables.paralisis || ['Em quedo quiet']);

      // 6. Olor + So - FIX: banco_sons és array, no objecte indexat
      const tipusOlor = tipusOlorPerBeat(idx);
      const olorBanc = BANCS.banco_olors.find(o => o.id === `olor_${tipusOlor}`);
      const olor = olorBanc? rand(olorBanc.texto_base) : rand(ubi.banco_variables?.olor || ['aire fred']);

      const soBanc = BANCS.banco_sons.find(s => s.id === `so_${tipusOlor}`);
      const so = soBanc? rand(soBanc.texto_base) : rand(ubi.banco_variables?.so || ['silenci']);

      // 7. Dades per omplir plantilla
      const data = {
        ciutat: ubi.ciutat, so, olor, nom, tic,
        escenario: rand(plantBase.banco_variables?.escenario || [esc.nom]),
        objeto: rand(plantBase.banco_variables?.objeto || plantBase.banco_variables?.element || ['alguna cosa']),
        sensacio, pensament, reaccio,
        percepcio: rand(plantBase.banco_variables?.percepcio || ['Veig']),
        mirada: rand(plantBase.banco_variables?.mirada || ['La seva mirada em busca']),
        desig: rand(plantBase.banco_variables?.desig || ['Vull dir-li el seu nom']),
        accions: rand(plantBase.banco_variables?.accions || ['M’acosto']),
        espai: rand(plantBase.banco_variables?.espai || [`a ${esc.nom}`]),
        element: rand(plantBase.banco_variables?.element || ['una ombra']),
        soroll: rand(plantBase.banco_variables?.soroll || [`Se sent ${so}`]),
        por: rand(plantBase.banco_variables?.por || ['No puc moure’m']),
        manipulacio: rand(plantBase.banco_variables?.manipulacio || ['algú menteix']),
        dubte: rand(plantBase.banco_variables?.dubte || ['No sé què pensar']),
        tancament: rand(plantBase.banco_variables?.tancament || ['Això ho canvia tot']),
        decisio: rand(plantBase.banco_variables?.decisio || ['He de decidir']),
        situacio: rand(plantBase.banco_variables?.situacio || ['Em passa alguna cosa']),
        absurd: rand(plantBase.banco_variables?.absurd || ['en el pitjor moment']),
        vergonya: rand(plantBase.banco_variables?.vergonya || ['Em poso vermell']),
        salida: rand(plantBase.banco_variables?.salida || ['Fingir que és broma']),
        descobriment: rand(plantBase.banco_variables?.descobriment || ['Toco el símbol i']),
        magia: rand(plantBase.banco_variables?.magia || ['la paret respira'])
      };

      escenes.push({
        beat: beat.nom,
        titol: `${beat.nom} - ${esc.nom}`,
        text: fill(plantBase.texto_base, data)
      });
    }

    capitols.push({ num: i + 1, escenes });
  }

  const totalParaulesAprox = numCap * escPerCap * preset.paraulesPerEscena;

  return {
    metadata: {
      genere: genereUI,
      ritme: config.ritme || 'Novel·la',
      pov: config.pov || '1 Protagonista',
      nCapitols: numCap,
      escenesPerCapitol: escPerCap,
      paraulesAprox: totalParaulesAprox,
      dataGeneracio: new Date().toISOString()
    },
    capitols
  };
}

// FIX: usar index en comptes de beat.id que no existeix
function tipusOlorPerBeat(idx) {
  if (idx <= 4) return 'pluja';
  if (idx >= 12) return 'sang';
  if (idx >= 8) return 'fum';
  return 'pols';
}