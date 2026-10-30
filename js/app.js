/* ============================================================
   LOS GITANOS CRIMINAL — app.js
   Sidebar / topbar communs + items de navigation.
   ============================================================ */

const NAV_ITEMS = [
  { page: "dashboard",    icon: "🏠", label: "Dashboard",    file: "dashboard.html" },
  { page: "tracker",      icon: "📋", label: "Tracker",      file: "tracker.html" },
  { page: "pochons",      icon: "🛍️", label: "Pochons",      file: "pochons.html" },
  { page: "stock",        icon: "📦", label: "Stock",        file: "stock.html" },
  { page: "transactions", icon: "🔁", label: "Transactions", file: "transactions.html" },
  { page: "labo",         icon: "🧪", label: "Labo",         file: "labo.html" },
  { page: "four",         icon: "🔥", label: "Four",         file: "four.html" },
  { page: "stats",        icon: "📊", label: "Stats",        file: "stats.html" },
  { page: "quotas",       icon: "🎯", label: "Quotas",       file: "quotas.html" },
  { page: "blanchiment",  icon: "💵", label: "Blanchiment",  file: "blanchiment.html" },
  { page: "paye",         icon: "💰", label: "Paye",         file: "paye.html" },
  { page: "taxes",        icon: "🧾", label: "Taxes",        file: "taxes.html" },
  { page: "admin",        icon: "⚙️", label: "Admin",        file: "admin.html" },
  { page: "profil",       icon: "👤", label: "Profil",       file: "profil.html" }
];

/* Les 5 premières pages restent toujours visibles dans la sidebar ;
   tout le reste est regroupé dans un sous-menu repliable "Plus". */
const NAV_PRIMARY_COUNT = 5;

/* Ouvre/ferme le sous-menu "Plus" dans la sidebar. */
function toggleNavSubmenu(toggleEl) {
  const submenu = toggleEl.nextElementSibling;
  const chevron = toggleEl.querySelector(".nav-chevron");
  const ouvert = submenu.style.display !== "none";
  submenu.style.display = ouvert ? "none" : "block";
  chevron.textContent = ouvert ? "▸" : "▾";
}

/* Construit le shell (sidebar + topbar) dans #shell, protège la page,
   et renvoie la session du membre connecté (ou redirige vers /index.html). */
async function initShell(activePage, pageTitle) {
  const session = requireSession();
  if (!session) return null;

  let allowed;
  try {
    allowed = await canAccess(session, activePage);
  } catch (e) {
    allowed = false;
  }
  if (!allowed) {
    document.body.innerHTML =
      '<div class="login-wrap"><div class="login-card"><div class="login-brand">ACCÈS REFUSÉ</div>' +
      '<p class="muted" style="text-align:center;margin-top:10px;">Ton compte est désactivé ou n\'a pas accès à cette page.</p>' +
      '<a href="' + pathToRoot() + 'index.html" class="btn btn-primary" style="margin-top:16px;display:block;text-align:center;" onclick="clearSession()">Retour à la connexion</a></div></div>';
    return null;
  }

  const root = pathToRoot();
  const primaryItems = NAV_ITEMS.slice(0, NAV_PRIMARY_COUNT);
  const restItems = NAV_ITEMS.slice(NAV_PRIMARY_COUNT);

  let navHtml = "";
  for (const item of primaryItems) {
    const ok = await canAccess(session, item.page);
    if (!ok) continue;
    const active = item.page === activePage ? " active" : "";
    navHtml += `<a class="nav-item${active}" href="${root}pages/${item.file}">
        <span class="ic">${item.icon}</span><span class="lbl">${item.label}</span>
      </a>`;
  }

  let restHtml = "";
  let restContainsActive = false;
  for (const item of restItems) {
    const ok = await canAccess(session, item.page);
    if (!ok) continue;
    const active = item.page === activePage ? " active" : "";
    if (active) restContainsActive = true;
    restHtml += `<a class="nav-item${active}" href="${root}pages/${item.file}">
        <span class="ic">${item.icon}</span><span class="lbl">${item.label}</span>
      </a>`;
  }

  if (restHtml) {
    navHtml += `
      <div class="nav-item nav-toggle" onclick="toggleNavSubmenu(this)">
        <span class="ic">☰</span><span class="lbl">Plus</span><span class="nav-chevron">${restContainsActive ? "▾" : "▸"}</span>
      </div>
      <div class="nav-submenu" style="display:${restContainsActive ? "block" : "none"};">${restHtml}</div>
    `;
  }

  const shellHtml = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-head">
          <img class="sidebar-emblem" src="${root}img/logo.png" alt="LGC">
          <div class="sidebar-logo"><span class="full">LOS GITANOS<br>CRIMINAL</span></div>
        </div>
        <nav class="nav">${navHtml}</nav>
        <div class="sidebar-foot">
          <div class="who"><b>${session.prenom} ${session.nom || ""}</b><span class="grade">${session.grade || ""}</span></div>
          <div id="rtStatus" class="small muted" style="margin:6px 0;">🔄 Connexion…</div>
          <div id="notifBtn" class="logout-link" style="display:none;color:var(--accent);" onclick="activerNotifs()">🔔 Activer les alertes</div>
          <span class="logout-link" onclick="logout()">Se déconnecter</span>
        </div>
      </aside>
      <div class="main">
        <div class="topbar">
          <div class="topbar-title">${pageTitle || ""}</div>
          <div class="topbar-brand"><span class="gem"></span> LOS GITANOS CRIMINAL</div>
        </div>
        <main class="content fade-in" id="content"></main>
      </div>
    </div>
  `;
  document.getElementById("shell").outerHTML = shellHtml;

  demarrerAlertesCooldown(session);

  // Indicateur temps réel : reflète l'état réel de la connexion Firebase
  // (se met à jour tout seul si la connexion tombe ou revient).
  db.ref(".info/connected").on("value", snap => {
    const el = document.getElementById("rtStatus");
    if (!el) return;
    el.textContent = snap.val() === true ? "🟢 Temps réel actif" : "🔴 Connexion perdue…";
  });

  return session;
}


/* ============================================================
   ALERTES COOLDOWN (par personne)
   Pour chaque action dont l'alerte est activée (Admin → Actions → 🔔), le membre connecté est prévenu
   dès qu'il peut recommencer : bandeau en haut de page + son + notification du navigateur.
   Fonctionne tant que le site est ouvert dans un onglet (rien ne peut s'envoyer site fermé).
   ============================================================ */
function activerNotifs() {
  if (!("Notification" in window)) return;
  Notification.requestPermission().then(() => majBoutonNotifs());
}
function majBoutonNotifs() {
  const b = document.getElementById("notifBtn");
  if (b) b.style.display = ("Notification" in window && Notification.permission === "default") ? "block" : "none";
}
function bipAlerte() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach(d => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = d ? 1175 : 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + d); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d + 0.16);
      o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.18);
    });
  } catch (e) {}
}
function afficherAlerte(texte) {
  let wrap = document.getElementById("lgcAlertes");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "lgcAlertes";
    wrap.style.cssText = "position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;flex-direction:column;gap:8px;max-width:92vw;";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.style.cssText = "background:var(--bg-1);border:2px solid var(--accent);border-radius:10px;padding:12px 18px;box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 30px -6px var(--accent);display:flex;gap:14px;align-items:center;font-weight:600;";
  el.innerHTML = `<span>🔔 ${texte}</span><span style="cursor:pointer;opacity:.7;" title="Fermer">✕</span>`;
  el.lastChild.onclick = () => el.remove();
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 60000);
  bipAlerte();
  try { if ("Notification" in window && Notification.permission === "granted") new Notification("Los Gitanos Criminal", { body: texte }); } catch (e) {}
}
function demarrerAlertesCooldown(session) {
  majBoutonNotifs();
  let defs = {}, arbre = {};
  const verifier = () => {
    const now = Date.now();
    entries(defs).forEach(([id, act]) => {
      const cfg = cooldownConfig(act);
      if (!cfg || cfg.par !== "personne" || !cfg.alerte) return;
      const fenetre = Math.max(cfg.duree + 12 * 3600000, 24 * 3600000);
      Object.values(arbre).forEach(semaine => Object.values(semaine || {}).forEach(e => {
        if (!e || e.action_id !== id || e.membre_id !== session.id || !e.createdAt) return;
        const libre = e.createdAt + cfg.duree;
        if (libre > now || libre < now - fenetre) return;
        const cle = "lgc_alerte_" + session.id + "_" + id + "_" + libre;
        if (localStorage.getItem(cle)) return;
        const et = cooldownEtat(id, act, arbre, session.id);
        localStorage.setItem(cle, "1");
        if (et && et.libres > 0) afficherAlerte(`${act.nom} : tu peux la refaire !`);
      }));
    });
  };
  db.ref("actions_dispo").on("value", s => { defs = s.val() || {}; verifier(); });
  db.ref("actions").on("value", s => { arbre = s.val() || {}; verifier(); });
  setInterval(verifier, 5000);
}
