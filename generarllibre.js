// generarllibre.js - Capa Híbrida V1.0.1 BLINDAT
// Compatible 100% con generaparagraf.js V12.1.1 + index.html V12.1.1

import { generaParagraf, resetEstructura } from './generaparagraf.js';

export async function generarLlibre(config, bancs, hist, numCap, numEsc, totalCaps) {
  console.log(`🚀 generarLlibre modo: ${config.modo || 'escena'}`);

  // MODO 1: 1 escena = 1 párrafo - devuelve formato estándar
  if (!config.modo || config.modo === 'escena') {
    const res = await generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps);
    // Adaptamos al formato que espera index.html
    return {
      capitols: [{
        num: numCap,
        beat: res.metadata.beat,
        escenes: [{
          titol: `Cap ${numCap} - Esc ${numEsc}`,
          text: res.text
        }]
      }],
      hist: res.hist,
      metadata: {
        tipo: 'escena',
        paraulesAprox: res.metadata.paraules,
        nCapitols: 1,
        beat: res.metadata.beat
      }
    };
  }

  // MODO 2: Capítulo completo
  if (config.modo === 'capitol') {
    let escenesArr = [];
    let histActual = hist;
    const escenesPerCap = config.escenesPerCap || 3;
    const beatsCap = config.beatsCap || ['setup', 'giro1', 'midpoint', 'giro2', 'crisi', 'climax', 'resolucio'];

    for (let i = 0; i < escenesPerCap; i++) {
      const configEsc = {
       ...config,
        beatActual: beatsCap[i] || 'default',
        beatAnterior: i > 0? beatsCap[i-1] : null
      };
      const res = await generaParagraf(configEsc, bancs, histActual, numCap, i+1, totalCaps);
      escenesArr.push({
        titol: `Escena ${i+1} - ${res.metadata.beat}`,
        text: res.text,
        metadata: res.metadata
      });
      histActual = res.hist;
    }

    const paraulesCap = escenesArr.reduce((sum, e) => sum + (e.metadata.paraules || 0), 0);

    return {
      capitols: [{
        num: numCap,
        beat: beatsCap[Math.floor(escenesPerCap/2)] || 'midpoint',
        escenes: escenesArr
      }],
      hist: histActual,
      metadata: {
        tipo: 'capitol',
        escenes: escenesPerCap,
        paraulesAprox: paraulesCap,
        nCapitols: 1
      }
    };
  }

  // MODO 3: Libro completo
  if (config.modo === 'llibre') {
    await resetEstructura();
    let capitolsArr = [];
    let histActual = null;
    const totalCapsLlibre = config.totalCaps || 12;
    const escenesPerCap = config.escenesPerCap || 3;

    // Beats por capítulo para novela 12 caps
    const beatsPerCap = config.beatsLlibre || [
      'hook', 'plantejament', 'setup',
      'giro1', 'midpoint', 'giro1',
      'giro2', 'crisi', 'crisi',
      'climax', 'climax', 'resolucio'
    ];

    for (let cap = 1; cap <= totalCapsLlibre; cap++) {
      const beatCap = beatsPerCap[cap-1] || 'default';
      const beatsEsc = calcularBeatsEscena(beatCap, escenesPerCap);

      const resCap = await generarLlibre(
        {
         ...config,
          modo: 'capitol',
          beatsCap: beatsEsc
        },
        bancs,
        histActual,
        cap,
        1,
        totalCapsLlibre
      );

      capitolsArr.push({
        num: cap,
        beat: beatCap,
        escenes: resCap.capitols[0].escenes
      });
      histActual = resCap.hist;
    }

    const paraulesLlibre = capitolsArr.reduce((sum, c) =>
      sum + c.escenes.reduce((s, e) => s + (e.metadata?.paraules || 0), 0), 0
    );

    return {
      capitols: capitolsArr,
      hist: histActual,
      metadata: {
        tipo: 'llibre',
        capitols: totalCapsLlibre,
        escenes: totalCapsLlibre * escenesPerCap,
        paraulesAprox: paraulesLlibre,
        nCapitols: totalCapsLlibre
      }
    };
  }

  // Fallback: escena
  return await generarLlibre({...config, modo: 'escena' }, bancs, hist, numCap, numEsc, totalCaps);
}

// Helper: calcula beats por escena según beat del capítulo
function calcularBeatsEscena(beatCap, numEscenes) {
  const mapa = {
    'hook': ['hook', 'plantejament', 'setup'],
    'plantejament': ['plantejament', 'setup', 'giro1'],
    'setup': ['setup', 'setup', 'giro1'],
    'giro1': ['giro1', 'midpoint', 'giro2'],
    'midpoint': ['midpoint', 'midpoint', 'giro2'],
    'giro2': ['giro2', 'crisi', 'crisi'],
    'crisi': ['crisi', 'crisi', 'climax'],
    'climax': ['climax', 'climax', 'resolucio'],
    'resolucio': ['resolucio', 'resolucio', 'resolucio']
  };
  const base = mapa[beatCap] || ['default', 'default', 'default'];
  // Rellena o corta según numEscenes
  while (base.length < numEscenes) base.push(base[base.length-1]);
  return base.slice(0, numEscenes);
}

function contarPalabras(texto) {
  return texto.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export { resetEstructura };
