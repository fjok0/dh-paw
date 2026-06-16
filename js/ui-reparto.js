import { getReparto } from "./db.js";
import { fmtNum, initials } from "./ui-comunes.js";
import { resolveLogoUrl } from "./logos.js";

const BAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#3b82f6","#ef4444","#14b8a6",
];

function makeLogoEl(url, ticker, className = "alloc-logo") {
  const wrap = document.createElement("div");
  wrap.className = className;
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = ticker;
    img.onerror = () => { wrap.classList.add("initials"); wrap.innerHTML = ""; wrap.textContent = initials(ticker); };
    wrap.appendChild(img);
  } else {
    wrap.classList.add("initials");
    wrap.textContent = initials(ticker);
  }
  return wrap;
}

export async function renderReparto() {
  const container = document.getElementById("view-reparto");
  container.innerHTML = "";

  let items;
  try { items = await getReparto(); }
  catch (e) { container.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`; return; }

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Sin datos. Pulsa sincronizar en el dashboard.</div>`;
    return;
  }

  items.sort((a, b) => b.pct - a.pct);
  const maxPct = items[0]?.pct ?? 1;

  // Resolve logos in parallel
  const urls = await Promise.all(items.map(item => resolveLogoUrl(item.symbol)));

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Distribución de la cartera";
  container.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "alloc-grid";
  items.forEach((item, i) => {
    const isLiq  = item.symbol === "_LIQUIDITY";
    const ticker = isLiq ? "€" : item.symbol.split(".")[0];
    const card   = document.createElement("div");
    card.className = "alloc-card";

    let logoWrap;
    if (isLiq) {
      logoWrap = document.createElement("div");
      logoWrap.className = "alloc-logo liquidity";
      logoWrap.textContent = "€";
    } else {
      logoWrap = makeLogoEl(urls[i], ticker);
    }

    const tickerEl = document.createElement("div");
    tickerEl.className = "alloc-ticker";
    tickerEl.textContent = isLiq ? "Liquidez" : ticker;

    const pctEl = document.createElement("div");
    pctEl.className = "alloc-pct";
    pctEl.textContent = fmtNum(item.pct, 1) + "%";

    card.append(logoWrap, tickerEl, pctEl);
    grid.appendChild(card);
  });
  container.appendChild(grid);

  const chartTitle = document.createElement("div");
  chartTitle.className = "section-title";
  chartTitle.style.marginTop = "1.5rem";
  chartTitle.textContent = "Peso por posición";
  container.appendChild(chartTitle);

  const chart = document.createElement("div");
  chart.className = "bar-chart";
  items.forEach((item, i) => {
    const isLiq = item.symbol === "_LIQUIDITY";
    const label = isLiq ? "Liq." : item.symbol.split(".")[0];
    const color = isLiq ? "#3b82f6" : BAR_COLORS[i % BAR_COLORS.length];
    const w = maxPct > 0 ? (item.pct / maxPct) * 100 : 0;
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-label" title="${item.name ?? label}">${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${color}"></div></div>
      <div class="bar-val">${fmtNum(item.pct, 1)}%</div>
    `;
    chart.appendChild(row);
  });
  container.appendChild(chart);
}
