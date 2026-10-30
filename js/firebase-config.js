/* ============================================================
   LOS GITANOS CRIMINAL — firebase-config.js
   Config Firebase + session + permissions.

   Même projet Firebase que les autres sites : toutes les données de
   Los Gitanos Criminal sont rangées dans le dossier "gitanos/" de la base
   (voir DB_RACINE) — aucun mélange avec les autres groupes.
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB0VkhwfAshsXciEP2T5l64nqsbVGb8k8o",
  authDomain: "il-sangue-rosso.firebaseapp.com",
  databaseURL: "https://il-sangue-rosso-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "il-sangue-rosso",
  storageBucket: "il-sangue-rosso.firebasestorage.app",
  messagingSenderId: "348270636377",
  appId: "1:348270636377:web:779cbe207f6aee4d7d3048"
};

const NOM_GROUPE = "Los Gitanos Criminal";

// Dossier de la base réservé à ce groupe. Ne pas changer après l'initialisation.
const DB_RACINE = "gitanos";
firebase.initializeApp(FIREBASE_CONFIG);
const _firebaseDb = firebase.database();
const db = {
  ref: (chemin) => {
    if (chemin && chemin.startsWith(".info")) return _firebaseDb.ref(chemin); // état de connexion : hors dossier
    return _firebaseDb.ref(chemin ? DB_RACINE + "/" + chemin : DB_RACINE);
  }
};

/* ---------- THÈME (modifiable dans Admin → Apparence) ----------
   Stocké dans theme/{accent, fond, texte}. Une copie locale est appliquée
   tout de suite pour éviter un flash de couleurs au chargement. */
const THEME_DEFAUT = { accent: "#e6e6e6", fond: "#000000", texte: "#ededed" };
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function applyTheme(th) {
  th = Object.assign({}, THEME_DEFAUT, th || {});
  const rgb = hexToRgb(th.accent) || hexToRgb(THEME_DEFAUT.accent);
  const st = document.documentElement.style;
  st.setProperty("--accent", th.accent);
  st.setProperty("--accent-rgb", rgb.join(","));
  st.setProperty("--bg-0", th.fond);
  st.setProperty("--text", th.texte);
}
try { applyTheme(JSON.parse(localStorage.getItem("lgc_theme") || "null")); } catch (e) { applyTheme(null); }
db.ref("theme").on("value", snap => {
  const th = snap.val();
  applyTheme(th);
  try { localStorage.setItem("lgc_theme", JSON.stringify(th || null)); } catch (e) {}
});

const authReady = new Promise(resolve => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) resolve(user);
    else firebase.auth().signInAnonymously().then(cred => resolve(cred.user));
  });
});

/* ---------- liste des pages de l'app (utilisée par admin + permissions) ---------- */
const PAGES_DISPO = [
  { page: "dashboard",     label: "Dashboard" },
  { page: "tracker",       label: "Tracker" },
  { page: "pochons",       label: "Pochons" },
  { page: "stats",         label: "Stats" },
  { page: "stock",         label: "Stock" },
  { page: "quotas",        label: "Quotas" },
  { page: "labo",          label: "Labo" },
  { page: "four",          label: "Four" },
  { page: "blanchiment",   label: "Blanchiment" },
  { page: "paye",          label: "Paye" },
  { page: "transactions",  label: "Transactions" },
  { page: "taxes",         label: "Taxes" },
  { page: "admin",         label: "Admin" },
  { page: "profil",        label: "Profil" }
];

/* ---------- SESSION ---------- */
function getSession() {
  try { return JSON.parse(localStorage.getItem("lgc_session") || "null"); }
  catch (e) { return null; }
}
function setSession(membre) {
  localStorage.setItem("lgc_session", JSON.stringify(membre));
}
function clearSession() {
  localStorage.removeItem("lgc_session");
}
function logout() {
  clearSession();
  window.location.href = pathToRoot() + "index.html";
}
/* calcule le chemin relatif vers la racine selon qu'on est dans /pages/ ou pas */
function pathToRoot() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}
/* à appeler en haut de chaque page protégée (sauf index/setup) */
function requireSession() {
  const s = getSession();
  if (!s) {
    window.location.href = pathToRoot() + "index.html";
    return null;
  }
  return s;
}

/* ---------- PERMISSIONS ----------
   Stockées dans Firebase sous permissions/{grade}/{page} = true/false
   Le Fondateur (role === 'admin') a toujours accès à tout, même si rien
   n'est configuré — pour ne jamais se retrouver bloqué hors de l'admin. */
let _permsCache = null;
async function loadPermissions() {
  if (_permsCache) return _permsCache;
  const snap = await db.ref("permissions").once("value");
  _permsCache = snap.val() || {};
  return _permsCache;
}
async function canAccess(membre, page) {
  if (!membre) return false;
  if (membre.role === "admin") return true;
  const perms = await loadPermissions();
  const gradePerms = perms[membre.grade] || {};
  return gradePerms[page] === true;
}

/* ---------- UTILITAIRES ---------- */
function formatMoney(n) {
  n = Number(n) || 0;
  return n.toLocaleString("fr-FR") + " $";
}
function formatDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("fr-FR");
  } catch (e) { return d; }
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function nowHHMM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
/* IMPORTANT : ne jamais utiliser snap.forEach seul (bug si pas d'index) —
   toujours repasser par Object.entries(snap.val() || {}) */
function entries(val) {
  return Object.entries(val || {});
}
function toast(msg, isErr) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast" + (isErr ? " err" : "");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}


/* Ajuste un stock de façon atomique (évite les pertes quand 2 membres agissent en même temps). */
function adjustStock(path, delta) {
  return db.ref(path).transaction(v => Math.max(0, (Number(v) || 0) + Number(delta)));
}

/* Journal d'audit (utilisé par le Tracker, etc.) — admin.html a sa propre version. */
async function logAudit(action, details) {
  try {
    const s = (typeof getSession === "function" && getSession()) || {};
    await db.ref("audit/" + uid()).set({ action, details: details || "", membre: s.prenom || "?", createdAt: Date.now() });
  } catch (e) { console.error("logAudit KO", e); }
}
