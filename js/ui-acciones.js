import { getAcciones } from "./db.js";
import { fmtEur, fmtPct, fmtNum, toneClass, initials } from "./ui-comunes.js";
import { resolveLogoUrl } from "./logos.js";

export async function renderAcciones() {
  const container = document.getElementById("view-acciones");
  container.innerHTML = "";

  let items;
  try { items = await getAcciones(); }
  catch (e) { container.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`; return; }

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Sin posiciones abiertas en acciones.</div>`;
    return;
  }

  items.sort((a, b) => b.costBasisEur - a.costBasisEur);

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = `Acciones · ${items.length} posición${items.length === 1 ? "" : "es"}`;
  container.appendChild(title);

  const wrapper = document.createElement("div");
  wrapper.style.overflowX = "auto";
  container.appendChild(wrapper);

  const table = document.createElement("table");
  table.className = "data-table";
  wrapper.appendChild(table);

  table.innerHTML = `
    <thead><tr>
      <th>Empresa</th><th class="num">Qty</th><th class="num">Coste med.</th>
      <th class="num">Coste total</th><th class="num">Precio</th>
      <th class="num">Valor</th><th class="num">+/− €</th><th class="num">+/− %</th>
    </tr></thead>
    <tbody></tbody><tfoot></tfoot>`;

  const tbody = table.querySelector("tbody");

  // Resolve logos (failures silently return null)
  let urls = new Array(items.length).fill(null);
  try { urls = await Promise.all(items.map(p => resolveLogoUrl(p.symbol))); }
  catch { /* si falla, seguimos sin logos */ }

  items.forEach((p, i) => {
    const ticker = p.symbol.split(".")[0];
    const tone   = toneClass(p.unrealizedEur);
    const url    = urls[i];
    const tr     = document.createElement("tr");

    // Empresa
    const tdName = document.createElement("td");
    const logoSpan = document.createElement("span");
    logoSpan.className = "logo-cell";
    if (url) {
      const img = document.createElement("img");
      img.src = url; img.alt = ticker;
      img.onerror = () => { logoSpan.classList.add("initials"); logoSpan.innerHTML = ""; logoSpan.textContent = initials(ticker); };
      logoSpan.appendChild(img);
    } else {
      logoSpan.classList.add("initials");
      logoSpan.textContent = initials(ticker);
    }
    tdName.appendChild(logoSpan);
    tdName.appendChild(document.createTextNode(" " + ticker));

    const c = (txt, cls) => { const t = document.createElement("td"); t.className = cls || ""; t.textContent = txt; return t; };
    tr.append(
      tdName,
      c(fmtNum(p.openQty, 0), "num"),
      c(fmtEur(p.avgCostEur), "num"),
      c(fmtEur(p.costBasisEur), "num"),
      c(fmtEur(p.lastPrice), "num"),
      c(fmtEur(p.marketValueEur), "num"),
      c(fmtEur(p.unrealizedEur), `num ${tone}`),
      c(fmtPct(p.unrealizedPct), `num ${tone}`),
    );
    tbody.appendChild(tr);
  });

  const totalMV   = items.reduce((s, p) => s + (p.marketValueEur ?? 0), 0);
  const totalCost = items.reduce((s, p) => s + (p.costBasisEur ?? 0), 0);
  const totalUn   = items.reduce((s, p) => s + (p.unrealizedEur ?? 0), 0);
  const totalPct  = totalCost > 0 ? (totalUn / totalCost) * 100 : 0;
  const tone = toneClass(totalUn);
  table.querySelector("tfoot").innerHTML = `
    <tr style="border-top:1px solid var(--border)">
      <td colspan="3" style="color:var(--muted);font-size:0.65rem">TOTAL</td>
      <td class="num">${fmtEur(totalCost)}</td><td></td>
      <td class="num">${fmtEur(totalMV)}</td>
      <td class="num ${tone}">${fmtEur(totalUn)}</td>
      <td class="num ${tone}">${fmtPct(totalPct)}</td>
    </tr>`;
}
