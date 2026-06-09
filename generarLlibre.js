// generarllibre.js - Capa Híbrida V1.0.2 BLINDAT
// Orquestador: decide si generar 1 escena, 1 capítol o llibre complet
// Compatible 100% amb generaparagraf.js V12.1.1 BLINDAT + main.js V12.1.1

import { generaParagraf, resetEstructura } from './generaparagraf.js';

export async function generarLlibre(config, bancs, hist, numCap, numEsc, totalCaps) {
  console.log(`🚀 generarLlibre modo: ${config.modo || 'escena'}`);

  // MODO 1: 1 escena = 1 paràgraf
  if (!config.modo || config.modo === 'escena') {
    const res = await generaParagraf(config, bancs, hist, numCap, numEsc, totalCaps);
    return {
      text: res.text,
      capitols: [{
        num: numCap,
        beat: res.metadata.beat,
        escenes: [{
          titol: `Cap ${numCap} - Esc ${numEsc}`,
          text: res.text,
          metadata: res.metadata
        }]
      }],
      hist: res.hist,
      metadata: {
        tipo: 'escena',
        paraulesAprox: res.metadata.paraules,
        nCapitols: 1,
        beat: res.metadata.beat,
        ubicacio: res.metadata.ubicacio,
        emocio: res.metadata.emocio,
        acte: res.metadata.acte
      }
    };
  }

  // MODO 2: Capítol complet - bucle pla, sense recursió
  if (config.modo === 'capitol') {
    let escenesArr = [];
    let histActual = hist;
    const escenesPerCap = config.escenesPerCap || 3;
    const beatsCap = config.beatsCap || ['setup', 'giro1', 'midpoint', 'giro2', 'crisi', 'climax', 'resolucio'];

    for (let i = 0; i < escenesPerCap; i++) {
      const configEsc = {
      ...config,
        beatActual: beatsCap[i] || 'default',
        beatAnterior: i > 0? beatsCap[i-1] : histActual?.beatAnterior || null
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

  // MODO 3: Llibre complet - bucle pla, sense recursió
  if (config.modo === 'llibre') {
    await resetEstructura();
    let capitolsArr = [];
    let histActual = null;
    const totalCapsLlibre = config.totalCaps || 12;
    const escenesPerCap = config.escenesPerCap || 3;

    const beatsPerCap = config.beatsLlibre || [
      'hook', 'plantejament', 'setup',
      'giro1', 'midpoint', 'giro1',
      'giro2', 'crisi', 'crisi',
      'climax', 'climax', 'resolucio'
    ];

    for (let cap = 1; cap <= totalCapsLlibre; cap++) {
      const beatCap = beatsPerCap[cap-1] || 'default';
      const beatsEsc = calcularBeatsEscena(beatCap, escenesPerCap);

      const escenesArr = [];
      for (let i = 0; i < escenesPerCap; i++) {
        const configEsc = {
        ...config,
          beatActual: beatsEsc[i],
          beatAnterior: i > 0? beatsEsc[i-1] : histActual?.beatAnterior || null
        };
        const res = await generaParagraf(configEsc, bancs, histActual, cap, i+1, totalCapsLlibre);
        escenesArr.push({
          titol: `Escena ${i+1} - ${res.metadata.beat}`,
          text: res.text,
          metadata: res.metadata
        });
        histActual = res.hist;
      }

      capitolsArr.push({ num: cap, beat: beatCap, escenes: escenesArr });
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

// Helper: calcula beats per escena segons beat del capítol
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
  while (base.length < numEscenes) base.push(base[base.length-1]);
  return base.slice(0, numEscenes);
}

export { resetEstructura };
