// ============================================================
// logos.js — URL de logo desde TradingView CDN (mismo criterio que el dashboard)
// ============================================================

const TV_BASE = "https://s3-symbol-logo.tradingview.com";

const SLUG_MAP = {
  // España
  TEF: "telefonica", MAP: "mapfre",
  IAG: "international-consolidated-airlines",
  SAN: "banco-santander", BBVA: "banco-bilbao-vizcaya-argentaria",
  REP: "repsol", IBE: "iberdrola", ACS: "acs", FER: "ferrovial",
  GRF: "grifols", ITX: "inditex", AMS: "amadeus-it", ELE: "endesa",
  CLNX: "cellnex-telecom", ACX: "acerinox", AENA: "aena",
  MRL: "merlin-properties", LOG: "logista", NTGY: "naturgy",
  RED: "red-electrica", ENG: "enagas", ROVI: "rovi",
  // Francia
  AIR: "airbus", MC: "lvmh", OR: "loreal", TTE: "totalenergies",
  BNP: "bnp-paribas", SAN_FR: "sanofi", RNO: "renault",
  RI: "pernod-ricard", DSY: "dassault-systemes",
  // USA
  AAPL: "apple", MSFT: "microsoft", GOOGL: "alphabet",
  AMZN: "amazon-com", META: "meta-platforms", NVDA: "nvidia",
  TSLA: "tesla", JPM: "jpmorgan-chase", V: "visa", MA: "mastercard",
  // ETFs comunes
  SPY: "spdr-s-and-p-500-etf-trust", QQQ: "invesco-qqq-trust",
  // ORY (Aéroports de Paris)
  ORY: "aeroports-de-paris", ADP: "aeroports-de-paris",
};

export function logoUrl(symbol) {
  if (!symbol || symbol === "_LIQUIDITY") return null;
  const base = symbol.toUpperCase().split(".")[0];
  const slug = SLUG_MAP[base];
  if (!slug) return null;
  return `${TV_BASE}/${slug}--big.svg`;
}
