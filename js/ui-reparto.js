// ============================================================
// ui-reparto.js — vista Reparto
// ============================================================
import { getReparto } from "./db.js";
import { fmtEur, fmtNum, toneClass, showToast, initials } from "./ui-comunes.js";

const BAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#3b82f6","#ef4444","#14b8a6",
];

function allocCard(item, rank) {
  const isTicker = item.symbol !== "_LIQUIDITY";
  const isLiq    = item.symbol === "_LIQUIDITY";
  const ticker   = isTicker ? item.symbol.split(".")[0] : "€";

  const card = document.createElement("div");
  card.className = "alloc-card";

  // Logo
  const logoWrap = document.createElement("div");
  if (isLiq) {
    logoWrap.className = "alloc-logo liquidity";
    logoWrap.textContent = "€";
  } else if (item.logoBase64) {
    logoWrap.className = "alloc-logo";
    const img = document.createElement("img");
    img.src = item.logoBase64;
    img.alt = ticker;
    img.onerror = () => {
      logoWrap.classList.add("initials");
      logoWrap.innerHTML = "";
      logoWrap.textContent = initials(ticker);
    };
    logoWrap.appendChild(img);
  } else {
    logoWrap.className = "alloc-logo initials";
    logoWrap.textContent = initials(ticker);
  }

  const tickerEl = document.createElement("div");
  tickerEl.className = "alloc-ticker";
  tickerEl.textContent = isLiq ? "Liquidez" : ticker;

  const pctEl = document.createElement("div");
  pctEl.className = "alloc-pct";
  pctEl.textContent = fmtNum(item.pct, 1) + "%";

  card.append(logoWrap, tickerEl, pctEl);
  return card;
}

function barRow(item, rank, maxPct) {
  const isTicker = item.symbol !== "_LIQUIDITY";
  const label = isTicker ? item.symbol.split(".")[0] : "Liq.";
  const color = item.symbol === "_LIQUIDITY" ? "#3b82f6" : BAR_COLORS[rank % BAR_COLORS.length];
  const widthPct = maxPct > 0 ? (item.pct / maxPct) * 100 : 0;

  const row = document.createElement("div");
  row.className = "bar-row";

  row.innerHTML = `
    <div class="bar-label" title="${item.name ?? label}">${label}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${widthPct.toFixed(1)}%;background:${color}"></div></div>
    <div class="bar-val">${fmtNum(item.pct, 1)}%</div>
  `;
  return row;
}

export async function renderReparto() {
  const container = document.getElementById("view-reparto");
  container.innerHTML = "";

  let items;
  try {
    items = await getReparto();
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Error cargando datos: ${e.message}</div>`;
    return;
  }

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Sin datos. Pulsa sincronizar en el dashboard.</div>`;
    return;
  }

  items.sort((a, b) => b.pct - a.pct);
  const maxPct = items[0]?.pct ?? 1;

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = "Distribución de la cartera";
  container.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "alloc-grid";
  items.forEach((item, i) => grid.appendChild(allocCard(item, i)));
  container.appendChild(grid);

  const chartTitle = document.createElement("div");
  chartTitle.className = "section-title";
  chartTitle.style.marginTop = "1.5rem";
  chartTitle.textContent = "Peso por posición";
  container.appendChild(chartTitle);

  const chart = document.createElement("div");
  chart.className = "bar-chart";
  items.forEach((item, i) => chart.appendChild(barRow(item, i, maxPct)));
  container.appendChild(chart);
}
