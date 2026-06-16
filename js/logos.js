// logos.js — devuelve URL candidata sin verificar; el <img onerror> maneja fallos

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

// Candidatos locales en orden de preferencia
function localCandidates(symbol) {
  const base = symbol.toUpperCase().split(".")[0];
  const sym  = symbol.toUpperCase();
  return [
    `assets/logos/${sym}_BIG.png`,
    `assets/logos/${base}_BIG.png`,
    `assets/logos/${sym}.png`,
    `assets/logos/${base}.png`,
    `assets/logos/${sym}_BIG.svg`,
    `assets/logos/${base}_BIG.svg`,
  ];
}

export function resolveLogoUrl(symbol) {
  if (!symbol || symbol === "_LIQUIDITY") return null;
  const base = symbol.toUpperCase().split(".")[0];

  // Primer candidato local que coincida con los archivos que tenemos
  const candidates = localCandidates(symbol);

  // TradingView como último recurso
  const slug = SLUG_MAP[base];
  if (slug) candidates.push(`${TV_BASE}/${slug}--big.svg`);

  // Devolvemos el primer candidato — el <img onerror> intentará el siguiente
  return candidates[0] || null;
}

// Versión con fallback encadenado para <img>
export function applyLogo(imgEl, wrapEl, symbol, fallbackText) {
  if (!symbol || symbol === "_LIQUIDITY") return;
  const base = symbol.toUpperCase().split(".")[0];
  const candidates = localCandidates(symbol);
  const slug = SLUG_MAP[base];
  if (slug) candidates.push(`${TV_BASE}/${slug}--big.svg`);

  let idx = 0;
  function tryNext() {
    if (idx >= candidates.length) {
      wrapEl.classList.add("initials");
      wrapEl.innerHTML = "";
      wrapEl.textContent = fallbackText;
      return;
    }
    imgEl.src = candidates[idx++];
  }
  imgEl.onerror = tryNext;
  tryNext();
}
