// ============================================================
// db.js — Dexie schema + PocketBase sync
// ============================================================

const DB_NAME = "dh_portfolio";
const DB_VERSION = 1;

const db = new Dexie(DB_NAME);
db.version(DB_VERSION).stores({
  dh_reparto:  "++id, symbol",
  dh_acciones: "++id, symbol",
  dh_opciones: "++id, symbol",
  meta:        "key",
});

// ---- PocketBase helpers ----

function getPbBase() {
  return (localStorage.getItem("dh_pb_url") || "").replace(/\/$/, "");
}

async function fetchCollection(base, collection) {
  const url = `${base}/api/collections/${collection}/records?perPage=200&sort=symbol`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PocketBase ${collection}: ${res.status}`);
  const json = await res.json();
  return json.items ?? [];
}

async function syncCollection(collection) {
  const base = getPbBase();
  if (!base) throw new Error("URL de PocketBase no configurada");
  const items = await fetchCollection(base, collection);
  await db[collection].clear();
  await db[collection].bulkAdd(items);
  return items.length;
}

export async function syncAll() {
  const [r, a, o] = await Promise.all([
    syncCollection("dh_reparto"),
    syncCollection("dh_acciones"),
    syncCollection("dh_opciones"),
  ]);
  const now = new Date().toISOString();
  await db.meta.put({ key: "last_sync", value: now });
  return { reparto: r, acciones: a, opciones: o, syncedAt: now };
}

export async function getLastSync() {
  const row = await db.meta.get("last_sync");
  return row?.value ?? null;
}

export async function getReparto() {
  return db.dh_reparto.toArray();
}

export async function getAcciones() {
  return db.dh_acciones.toArray();
}

export async function getOpciones() {
  return db.dh_opciones.toArray();
}
