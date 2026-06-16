// ============================================================
// ui-comunes.js — utilidades compartidas
// ============================================================

let toastTimer = null;

export function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

export function fmtEur(v) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v);
}

export function fmtPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

export function fmtNum(v, decimals = 2) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

export function toneClass(v) {
  if (v > 0) return "pos";
  if (v < 0) return "neg";
  return "";
}

export function initials(str) {
  if (!str) return "?";
  const parts = str.replace(/\..+$/, "").toUpperCase().split(/[\s_-]/);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return str.replace(/\..+$/, "").substring(0, 2).toUpperCase();
}

export function logoEl(logoBase64, symbol, className = "") {
  const wrap = document.createElement("div");
  wrap.className = `logo-cell ${className}`;
  if (logoBase64) {
    const img = document.createElement("img");
    img.src = logoBase64;
    img.alt = symbol;
    img.onerror = () => {
      wrap.classList.add("initials");
      wrap.innerHTML = initials(symbol);
    };
    wrap.appendChild(img);
  } else {
    wrap.classList.add("initials");
    wrap.textContent = initials(symbol);
  }
  return wrap;
}
