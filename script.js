/* =====================================================
   Les cadeaux se modifient directement dans index.html.
   Ce fichier ne gère que les animations et les boutons.
   ===================================================== */
const $ = (s) => document.querySelector(s);
const KEY = "noel-liste-offerts";
let offerts = [];
try { offerts = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
const sauver = () => { try { localStorage.setItem(KEY, JSON.stringify(offerts)); } catch (e) {} };

const cartes = [...document.querySelectorAll(".card")];
let filtre = "Tous";

/* Pastille de catégorie ajoutée automatiquement depuis data-cat */
cartes.forEach((c) => {
  const m = c.querySelector(".media");
  if (!m.querySelector("img")) m.innerHTML = `<span class="emoji">${m.textContent.trim()}</span>`;
  const b = document.createElement("span");
  b.className = "badge"; b.textContent = c.dataset.cat || "Cadeau";
  c.querySelector(".media").appendChild(b);
});

const titre = (c) => c.querySelector("h3").textContent.trim();

function filtres() {
  const cats = ["Tous", ...new Set(cartes.map((c) => c.dataset.cat))];
  $("#filters").innerHTML = cats.map((c) => `<button class="chip ${c === filtre ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
}

function afficher() {
  cartes.forEach((c) => {
    c.hidden = !(filtre === "Tous" || c.dataset.cat === filtre);
    const fait = offerts.includes(titre(c));
    c.classList.toggle("done", fait);
    c.querySelector(".gift").textContent = fait ? "✓ Déjà offert (annuler)" : "Marquer comme offert";
  });
  const n = cartes.filter((c) => offerts.includes(titre(c))).length, t = cartes.length;
  $("#progressText").textContent = `${n} cadeau${n > 1 ? "x" : ""} offert${n > 1 ? "s" : ""} sur ${t}`;
  $("#progressBar").style.width = (t ? (n / t) * 100 : 0) + "%";
}

/* Apparition au défilement */
function apparition() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add("show"), (e.target.dataset.d || 0)); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  cartes.forEach((c, k) => { c.dataset.d = (k % 3) * 120; io.observe(c); });
}

/* Effet 3D + reflet qui suit la souris */
function inclinaison() {
  if (matchMedia("(hover:none)").matches) return;
  cartes.forEach((c) => {
    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--ry", (x - 0.5) * 8 + "deg");
      c.style.setProperty("--rx", (0.5 - y) * 8 + "deg");
      c.style.setProperty("--mx", x * 100 + "%");
      c.style.setProperty("--my", y * 100 + "%");
    });
    c.addEventListener("mouseleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  });
}

$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest(".chip"); if (!b) return;
  filtre = b.dataset.c; filtres(); afficher();
});
cartes.forEach((c) => c.querySelector(".gift").addEventListener("click", () => {
  const t = titre(c);
  offerts = offerts.includes(t) ? offerts.filter((x) => x !== t) : [...offerts, t];
  sauver(); afficher();
}));

/* Compte à rebours jusqu'à Noël */
function rebours() {
  const now = new Date();
  let noel = new Date(now.getFullYear(), 11, 25);
  if (now.getMonth() === 11 && now.getDate() === 25) { $("#countdown").innerHTML = "<p>🎄 Joyeux Noël !</p>"; return; }
  if (now > noel) noel = new Date(now.getFullYear() + 1, 11, 25);
  const s = Math.floor((noel - now) / 1000);
  const v = [["jours", Math.floor(s / 86400)], ["heures", Math.floor(s / 3600) % 24], ["min", Math.floor(s / 60) % 60], ["sec", s % 60]];
  $("#countdown").innerHTML = v.map(([l, n]) => `<div><b>${String(n).padStart(2, "0")}</b><small>${l}</small></div>`).join("");
}
rebours(); setInterval(rebours, 1000);

/* Barre de navigation */
addEventListener("scroll", () => $("#nav").classList.toggle("scrolled", scrollY > 30), { passive: true });

/* Neige et étincelles dorées */
(function neige() {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const cv = $("#snow"), ctx = cv.getContext("2d");
  let W, H, f = [];
  const taille = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  taille(); addEventListener("resize", taille);
  for (let i = 0; i < 110; i++) f.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.6 + 0.8, v: Math.random() * 0.8 + 0.3, d: Math.random() * 6.28, or: i % 9 === 0 });
  (function boucle() {
    ctx.clearRect(0, 0, W, H);
    f.forEach((s) => {
      s.y += s.v; s.d += 0.01; s.x += Math.sin(s.d) * 0.4;
      if (s.y > H) { s.y = -5; s.x = Math.random() * W; }
      ctx.fillStyle = s.or ? "rgba(246,214,140,.9)" : "rgba(255,255,255,.8)";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.or ? s.r * 0.8 : s.r, 0, 7); ctx.fill();
    });
    requestAnimationFrame(boucle);
  })();
})();

filtres(); afficher(); apparition(); inclinaison();