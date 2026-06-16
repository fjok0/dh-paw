// ============================================================
// logos.js — logo URL con prioridad: assets/logos/ → TradingView CDN → null
// ============================================================

const TV_BASE = "https://s3-symbol-logo.tradingview.com";

const SLUG_MAP = {
  TEF: "telefonica", MAP: "mapfre",
  IAG: "international-consolidated-airlines",
  SAN: "banco-santander", BBVA: "banco-bilbao-vizcaya-argentaria",
  REP: "repsol", IBE: "iberdrola", ACS: "acs", FER: "ferrovial",
  GRF: "grifols", ITX: "inditex", AMS: "amadeus-it", ELE: "endesa",
  CLNX: "cellnex-telecom", ACX: "acerinox", AENA: "aena",
  MRL: "merlin-properties", LOG: "logista", NTGY: "naturgy",
  RED: "red-electrica", ENG: "enagas", ROVI: "rovi",
  AIR: "airbus", MC: "lvmh", OR: "loreal", TTE: "totalenergies",
  BNP: "bnp-paribas", RNO: "renault", RI: "pernod-ricard",
  ORY: "aeroports-de-paris", ADP: "aeroports-de-paris",
  AAPL: "apple", MSFT: "microsoft", GOOGL: "alphabet",
  AMZN: "amazon-com", META: "meta-platforms", NVDA: "nvidia",
  TSLA: "tesla", JPM: "jpmorgan-chase", V: "visa", MA: "mastercard",
};

// Orden de búsqueda local (misma lógica que el proxy del dashboard)
function localCandidates(symbol) {
  const base = symbol.toUpperCase().split(".")[0];
  const sym  = symbol.toUpperCase();
  return [
    `assets/logos/${sym}_BIG.png`,
    `assets/logos/${base}_BIG.png`,
    `assets/logos/${sym}_BIG.svg`,
    `assets/logos/${base}_BIG.svg`,
    `assets/logos/${sym}.png`,
    `assets/logos/${base}.png`,
    `assets/logos/${sym}.svg`,
    `assets/logos/${base}.svg`,
  ];
}

// Cache: symbol → URL que funcionó (o "" si ninguna)
const _cache = new Map();

export async function resolveLogoUrl(symbol) {
  if (!symbol || symbol === "_LIQUIDITY") return null;
  if (_cache.has(symbol)) return _cache.get(symbol) || null;

  // 1. Prueba archivos locales en orden
  for (const path of localCandidates(symbol)) {
    try {
      const res = await fetch(path, { method: "HEAD" });
      if (res.ok) { _cache.set(symbol, path); return path; }
    } catch { /* continua */ }
  }

  // 2. TradingView CDN
  const base = symbol.toUpperCase().split(".")[0];
  const slug = SLUG_MAP[base];
  if (slug) {
    const url = `${TV_BASE}/${slug}--big.svg`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) { _cache.set(symbol, url); return url; }
    } catch { /* continua */ }
  }

  _cache.set(symbol, "");
  return null;
}
