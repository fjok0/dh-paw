// ============================================================
// ui-acciones.js — vista Acciones abiertas
// ============================================================
import { getAcciones } from "./db.js";
import { fmtEur, fmtPct, fmtNum, toneClass, initials } from "./ui-comunes.js";
import { logoUrl } from "./logos.js";

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
    <tbody></tbody>
    <tfoot></tfoot>
  `;
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  const tbody = table.querySelector("tbody");
  items.forEach((p) => {
    const ticker = p.symbol.split(".")[0];
    const tone   = toneClass(p.unrealizedEur);
    const url    = logoUrl(p.symbol);

    const tr = document.createElement("tr");

    // Logo cell
    const tdName = document.createElement("td");
    const logoSpan = document.createElement("span");
    logoSpan.className = "logo-cell";
    if (url) {
      const img = document.createElement("img");
      img.src = url;
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
    tdName.appendChild(logoSpan);
    tdName.appendChild(document.createTextNode(ticker));
    tr.appendChild(tdName);

    tr.innerHTML += `
      <td class="num">${fmtNum(p.openQty, 0)}</td>
      <td class="num">${fmtEur(p.avgCostEur)}</td>
      <td class="num">${fmtEur(p.costBasisEur)}</td>
      <td class="num">${fmtEur(p.lastPrice)}</td>
      <td class="num">${fmtEur(p.marketValueEur)}</td>
      <td class="num ${tone}">${fmtEur(p.unrealizedEur)}</td>
      <td class="num ${tone}">${fmtPct(p.unrealizedPct)}</td>
    `;
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
      <td class="num">${fmtEur(totalCost)}</td>
      <td></td>
      <td class="num">${fmtEur(totalMV)}</td>
      <td class="num ${tone}">${fmtEur(totalUn)}</td>
      <td class="num ${tone}">${fmtPct(totalPct)}</td>
    </tr>
  `;
}
