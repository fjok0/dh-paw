// ============================================================
// ui-acciones.js — vista Acciones abiertas
// ============================================================
import { getAcciones } from "./db.js";
import { fmtEur, fmtPct, fmtNum, toneClass, initials, logoEl } from "./ui-comunes.js";

export async function renderAcciones() {
  const container = document.getElementById("view-acciones");
  container.innerHTML = "";

  let items;
  try {
    items = await getAcciones();
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`;
    return;
  }

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

  const table = document.createElement("table");
  table.className = "data-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Empresa</th>
        <th class="num">Qty</th>
        <th class="num">Coste med.</th>
        <th class="num">Coste total</th>
        <th class="num">Precio</th>
        <th class="num">Valor</th>
        <th class="num">+/− €</th>
        <th class="num">+/− %</th>
      </tr>
    </thead>
    <tbody id="acc-tbody"></tbody>
  `;
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  const tbody = table.querySelector("#acc-tbody");
  items.forEach((p) => {
    const tr = document.createElement("tr");
    const ticker = p.symbol.split(".")[0];
    const tone = toneClass(p.unrealizedEur);
    tr.innerHTML = `
      <td>
        <span class="logo-cell ${p.logoBase64 ? "" : "initials"}" id="logo-${ticker}"></span>
        ${ticker}
      </td>
      <td class="num">${fmtNum(p.openQty, 0)}</td>
      <td class="num">${fmtEur(p.avgCostEur)}</td>
      <td class="num">${fmtEur(p.costBasisEur)}</td>
      <td class="num">${fmtEur(p.lastPrice)}</td>
      <td class="num">${fmtEur(p.marketValueEur)}</td>
      <td class="num ${tone}">${fmtEur(p.unrealizedEur)}</td>
      <td class="num ${tone}">${fmtPct(p.unrealizedPct)}</td>
    `;
    tbody.appendChild(tr);

    // Inject logo
    const logoSpan = tr.querySelector(`#logo-${ticker}`);
    if (logoSpan) {
      if (p.logoBase64) {
        const img = document.createElement("img");
        img.src = p.logoBase64;
        img.alt = ticker;
        img.onerror = () => {
          logoSpan.classList.add("initials");
          logoSpan.innerHTML = initials(ticker);
        };
        logoSpan.appendChild(img);
      } else {
        logoSpan.classList.add("initials");
        logoSpan.textContent = initials(ticker);
      }
    }
  });

  // Totals row
  const totalMV  = items.reduce((s, p) => s + (p.marketValueEur ?? 0), 0);
  const totalCost = items.reduce((s, p) => s + (p.costBasisEur ?? 0), 0);
  const totalUn  = items.reduce((s, p) => s + (p.unrealizedEur ?? 0), 0);
  const totalPct = totalCost > 0 ? (totalUn / totalCost) * 100 : 0;
  const tone = toneClass(totalUn);

  const tfoot = document.createElement("tfoot");
  tfoot.innerHTML = `
    <tr style="border-top:1px solid var(--border)">
      <td colspan="3" style="color:var(--muted);font-size:0.65rem">TOTAL</td>
      <td class="num">${fmtEur(totalCost)}</td>
      <td></td>
      <td class="num">${fmtEur(totalMV)}</td>
      <td class="num ${tone}">${fmtEur(totalUn)}</td>
      <td class="num ${tone}">${fmtPct(totalPct)}</td>
    </tr>
  `;
  table.appendChild(tfoot);
}
