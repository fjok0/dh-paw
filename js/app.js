// ============================================================
// app.js — bootstrap, SW registration, nav, connection
// ============================================================
import { syncAll, getLastSync } from "./db.js";
import { renderReparto }  from "./ui-reparto.js";
import { renderAcciones } from "./ui-acciones.js";
import { renderOpciones } from "./ui-opciones.js";
import { showToast }      from "./ui-comunes.js";

// ---- Service Worker ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

// ---- Connection indicator ----
function updateConn() {
  const dot = document.getElementById("conn-dot");
  if (navigator.onLine) { dot.className = "online"; }
  else { dot.className = "offline"; }
}
window.addEventListener("online",  updateConn);
window.addEventListener("offline", updateConn);
updateConn();

// ---- Last sync display ----
async function refreshSyncLabel() {
  const t = await getLastSync();
  const el = document.getElementById("sync-status");
  if (t) {
    const d = new Date(t);
    el.textContent = `Sync ${d.toLocaleDateString("es-ES")} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    el.textContent = "Sin sync";
  }
}

// ---- Tab navigation ----
const views = ["reparto", "acciones", "opciones"];
const renderers = { reparto: renderReparto, acciones: renderAcciones, opciones: renderOpciones };
const rendered = new Set();

function showTab(name) {
  views.forEach((v) => {
    document.getElementById(`view-${v}`).classList.toggle("active", v === name);
    document.getElementById(`tab-${v}`).classList.toggle("active", v === name);
  });
  if (!rendered.has(name)) {
    renderers[name]();
    rendered.add(name);
  }
}

views.forEach((v) => {
  document.getElementById(`tab-${v}`).addEventListener("click", () => showTab(v));
});

// ---- Settings modal ----
const settingsBtn  = document.getElementById("btn-settings");
const settingsDlg  = document.getElementById("settings-dialog");
const settingsSave = document.getElementById("settings-save");
const pbUrlInput   = document.getElementById("pb-url");

settingsBtn.addEventListener("click", () => {
  pbUrlInput.value = localStorage.getItem("dh_pb_url") || "";
  settingsDlg.showModal();
});

settingsSave.addEventListener("click", () => {
  const url = pbUrlInput.value.trim();
  if (url) localStorage.setItem("dh_pb_url", url);
  settingsDlg.close();
  showToast("URL guardada");
});

settingsDlg.addEventListener("click", (e) => {
  if (e.target === settingsDlg) settingsDlg.close();
});

// ---- Sync button ----
document.getElementById("btn-sync").addEventListener("click", async () => {
  const btn = document.getElementById("btn-sync");
  btn.disabled = true;
  showToast("Sincronizando…");
  try {
    const result = await syncAll();
    rendered.clear();
    const active = views.find((v) => document.getElementById(`view-${v}`).classList.contains("active"));
    if (active) { renderers[active](); rendered.add(active); }
    await refreshSyncLabel();
    showToast(`OK · Reparto:${result.reparto} Acc:${result.acciones} Opc:${result.opciones}`);
  } catch (e) {
    showToast("Error: " + e.message);
  } finally {
    btn.disabled = false;
  }
});

// ---- Boot ----
(async () => {
  await refreshSyncLabel();
  showTab("reparto");
})();
