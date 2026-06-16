// ============================================================
// ui-opciones.js — vista Opciones abiertas
// ============================================================
import { getOpciones } from "./db.js";
import { fmtEur, fmtNum, toneClass, initials } from "./ui-comunes.js";

export async function renderOpciones() {
  const container = document.getElementById("view-opciones");
  container.innerHTML = "";

  let items;
  try {
    items = await getOpciones();
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Error: ${e.message}</div>`;
    return;
  }

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Sin posiciones abiertas en opciones.</div>`;
    return;
  }

  items.sort((a, b) => (b.costBasisEur ?? 0) - (a.costBasisEur ?? 0));

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = `Opciones · ${items.length} posición${items.length === 1 ? "" : "es"}`;
  container.appendChild(title);

  const wrapper = document.createElement("div");
  wrapper.style.overflowX = "auto";

  const table = document.createElement("table");
  table.className = "data-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Símbolo</th>
        <th>Subyacente</th>
        <th class="num">Qty</th>
        <th class="num">Coste €</th>
        <th class="num">Valor €</th>
        <th class="num">+/− €</th>
      </tr>
    </thead>
    <tbody id="opt-tbody"></tbody>
  `;
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  const tbody = table.querySelector("#opt-tbody");
  items.forEach((p) => {
    const tr = document.createElement("tr");
    const tone = toneClass(p.unrealizedEur);
    tr.innerHTML = `
      <td style="font-size:0.65rem">${p.symbol}</td>
      <td>${p.underlying ?? "—"}</td>
      <td class="num">${fmtNum(p.openQty, 0)}</td>
      <td class="num">${fmtEur(p.costBasisEur)}</td>
      <td class="num">${fmtEur(p.marketValueEur)}</td>
      <td class="num ${tone}">${fmtEur(p.unrealizedEur)}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalCost = items.reduce((s, p) => s + (p.costBasisEur ?? 0), 0);
  const totalMV   = items.reduce((s, p) => s + (p.marketValueEur ?? 0), 0);
  const totalUn   = items.reduce((s, p) => s + (p.unrealizedEur ?? 0), 0);
  const tone = toneClass(totalUn);

  const tfoot = document.createElement("tfoot");
  tfoot.innerHTML = `
    <tr style="border-top:1px solid var(--border)">
      <td colspan="3" style="color:var(--muted);font-size:0.65rem">TOTAL</td>
      <td class="num">${fmtEur(totalCost)}</td>
      <td class="num">${fmtEur(totalMV)}</td>
      <td class="num ${tone}">${fmtEur(totalUn)}</td>
    </tr>
  `;
  table.appendChild(tfoot);
}
