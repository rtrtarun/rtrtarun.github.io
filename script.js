(function () {
  var d = window.PORTFOLIO;
  var $ = function (id) { return document.getElementById(id); };

  // Build elements with textContent only, so content can never inject HTML.
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function link(text, href, cls) {
    var a = el("a", cls, text);
    a.href = href;
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }
  function chips(list, max) {
    var box = el("div", "chips");
    (max ? list.slice(0, max) : list).forEach(function (t) { box.appendChild(el("span", "chip", t)); });
    return box;
  }
  function bullets(list) {
    var ul = el("ul", "arrows");
    list.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    return ul;
  }

  // ---------- Hero / about ----------
  document.title = d.name + " | " + d.role;
  $("brand").textContent = d.name.split(" ").map(function (w) { return w[0]; }).join("") + ".";
  $("hero-name").textContent = d.name;
  $("role").textContent = d.role;
  $("tagline").textContent = d.tagline;
  if (d.resumeUrl) {
    ["resume", "nav-resume"].forEach(function (id) { $(id).href = d.resumeUrl; $(id).hidden = false; });
  }
  if (d.photo) {
    var pic = $("portrait");
    pic.src = d.photo; pic.alt = "Portrait of " + d.name; pic.hidden = false;
  }
  d.keywords.forEach(function (k) { $("keywords").appendChild(el("span", "chip", k)); });
  d.about.forEach(function (p) { $("about-body").appendChild(el("p", null, p)); });
  if (d.aiHighlight) {
    var ai = el("aside", "ai-box");
    ai.appendChild(el("span", "ai-badge", "Current focus"));
    ai.appendChild(el("h3", null, d.aiHighlight.title));
    ai.appendChild(el("p", null, d.aiHighlight.intro));
    ai.appendChild(bullets(d.aiHighlight.points));
    $("about-body").appendChild(ai);
  }

  var workItems = d.experience.reduce(function (n, r) { return n + r.items.length; }, 0);
  var clients = {};
  d.experience.forEach(function (r) { clients[r.client] = 1; });
  [
    [Object.keys(clients).length, "Client engagements"],
    [d.experience.length, "Teams"],
    [workItems, "Systems & features delivered"],
  ].forEach(function (s) {
    var box = el("div", "stat");
    box.appendChild(el("strong", null, String(s[0])));
    box.appendChild(el("span", null, s[1]));
    $("stats").appendChild(box);
  });

  // ---------- Detail dialog ----------
  var dlg = $("detail");
  function openDialog(build) {
    var body = $("detail-body");
    body.textContent = "";
    build(body);
    dlg.showModal();
  }
  $("detail-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  function openWork(role, item) {
    openDialog(function (b) {
      b.appendChild(el("p", "eyebrow", role.team + " · " + role.client));
      b.appendChild(el("h3", "detail-title", item.title));
      item.details.forEach(function (t) { b.appendChild(el("p", null, t)); });
      (item.story || []).forEach(function (st) {
        b.appendChild(el("h4", null, st.h));
        b.appendChild(el("p", null, st.t));
      });
      b.appendChild(el("h4", null, item.story ? "Key contributions" : "What I did"));
      b.appendChild(bullets(item.highlights));
      b.appendChild(chips(item.tags));
    });
  }

  // ---------- Experience ----------
  d.experience.forEach(function (r) {
    var block = el("article", "role");
    var head = el("div", "role-head");
    var left = el("div");
    left.appendChild(el("h3", null, r.team));
    left.appendChild(el("p", "muted", r.title + " · " + r.org + " → " + r.client + (r.location ? " · " + r.location : "")));
    head.appendChild(left);
    if (r.period) head.appendChild(el("span", "period", r.period));
    block.appendChild(head);
    block.appendChild(el("p", null, r.summary));

    var grid = el("div", "grid");
    r.items.forEach(function (it) {
      var card = el("button", "card");
      card.type = "button";
      card.appendChild(el("h4", null, it.title));
      card.appendChild(el("p", null, it.summary));
      card.appendChild(chips(it.tags, 3));
      card.appendChild(el("span", "more", "Explain this →"));
      card.addEventListener("click", function () { openWork(r, it); });
      grid.appendChild(card);
    });
    block.appendChild(grid);
    $("experience-body").appendChild(block);
  });

  // ---------- Personal projects ----------
  d.projects.forEach(function (p, i) {
    var box = el("article", "project");
    box.appendChild(el("p", "chapter", String(i + 1).padStart(2, "0") + " / " + String(d.projects.length).padStart(2, "0")));
    box.appendChild(el("h3", null, p.title));
    box.appendChild(el("p", "muted", p.subtitle));
    box.appendChild(el("h4", null, "What it does"));
    box.appendChild(el("p", null, p.whatItDoes));
    box.appendChild(el("h4", null, "Key features"));
    box.appendChild(bullets(p.features));
    box.appendChild(el("h4", null, "Why it matters"));
    box.appendChild(el("p", null, p.why));
    box.appendChild(chips(p.stack));
    var links = el("div", "card-links");
    if (p.github) links.appendChild(link("View project ↗", p.github));
    if (p.demo) links.appendChild(link("Live demo ↗", p.demo));
    if (links.children.length) box.appendChild(links);
    $("projects-body").appendChild(box);
  });
  if (!d.projects.length) $("projects").hidden = true;

  // ---------- Skills ----------
  var info = d.skillInfo || {};
  function openSkill(name, s) {
    openDialog(function (b) {
      b.appendChild(el("p", "eyebrow", "Skill explained"));
      b.appendChild(el("h3", "detail-title", name));
      b.appendChild(el("h4", null, "What it is"));
      b.appendChild(el("p", null, s.what));
      b.appendChild(el("h4", null, "Think of it like this"));
      b.appendChild(el("p", null, s.like));
    });
  }
  Object.keys(d.skills).forEach(function (group) {
    var box = el("div", "skill-group");
    box.appendChild(el("h4", null, group));
    var list = el("div", "chips");
    d.skills[group].forEach(function (name) {
      var key = info[name] ? name : (info[name.split(" (")[0]] ? name.split(" (")[0] : null);
      if (!key) { list.appendChild(el("span", "chip", name)); return; }
      var b = el("button", "chip skill", name);
      b.type = "button";
      b.title = "What is this?";
      b.addEventListener("click", function () { openSkill(name, info[key]); });
      list.appendChild(b);
    });
    box.appendChild(list);
    $("skills-body").appendChild(box);
  });

  // ---------- Education & certifications ----------
  var edu = (d.education || []).concat(d.certifications || []);
  function openCert(e) {
    openDialog(function (b) {
      b.appendChild(el("p", "eyebrow", [e.org, e.period].filter(Boolean).join(" · ")));
      b.appendChild(el("h3", "detail-title", e.title));
      if (e.image) {
        var img = el("img", "cert-img");
        img.src = e.image; img.alt = "Certificate: " + e.title;
        b.appendChild(img);
      }
      var acts = el("div", "card-links");
      if (e.url) acts.appendChild(link("Verify on Credly ↗", e.url));
      var close = el("button", "btn small", "Close");
      close.type = "button";
      close.addEventListener("click", function () { dlg.close(); });
      acts.appendChild(close);
      b.appendChild(acts);
    });
  }
  edu.forEach(function (e) {
    var card = el("button", "card");
    card.type = "button";
    card.appendChild(el("h4", null, e.title));
    card.appendChild(el("p", null, [e.org, e.period].filter(Boolean).join(" · ")));
    card.appendChild(el("span", "more", "View certificate →"));
    card.addEventListener("click", function () { openCert(e); });
    $("education-body").appendChild(card);
  });
  if (!edu.length) $("education").hidden = true; else $("nav-edu").hidden = false;

  // ---------- Contact ----------
  var L = d.links;
  var NS = "http://www.w3.org/2000/svg";
  function icon(kind, paths) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    if (kind === "fill") svg.setAttribute("fill", "currentColor");
    else { svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round"); }
    paths.forEach(function (p) {
      var n = document.createElementNS(NS, p[0]);
      Object.keys(p[1]).forEach(function (k) { n.setAttribute(k, p[1][k]); });
      svg.appendChild(n);
    });
    return svg;
  }
  var ICONS = {
    Email: ["line", [["rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }], ["path", { d: "m22 7-10 6L2 7" }]]],
    LinkedIn: ["fill", [["path", { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }]]],
    GitHub: ["fill", [["path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }]]],
    Resume: ["line", [["path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }], ["path", { d: "M14 2v6h6M8 13h8M8 17h8" }]]],
    Credly: ["line", [["circle", { cx: 12, cy: 8, r: 6 }], ["path", { d: "M8.2 13.9 7 23l5-3 5 3-1.2-9.1" }]]],
  };
  [
    ["Email", L.email && "mailto:" + L.email, L.email],
    ["LinkedIn", L.linkedin, "LinkedIn"],
    ["GitHub", L.github, "GitHub"],
    ["Credly", L.credly, "Credly badges"],
    ["Resume", d.resumeUrl, "Download resume"],
  ].forEach(function (c) {
    if (!c[1]) return;
    var a = link("", c[1], "icon-link");
    a.setAttribute("aria-label", c[0]);
    a.title = c[2];
    a.appendChild(icon(ICONS[c[0]][0] === "fill" ? "fill" : "line", ICONS[c[0]][1]));
    a.appendChild(el("span", null, c[0]));
    $("contact-body").appendChild(a);
  });
  if (L.email) $("contact-body").appendChild(el("p", "muted email-line", L.email));
  if (d.contact) {
    [
      ["Role", d.contact.role],
      ["Location", d.contact.location],
      ["Open for opportunities", d.contact.openToWork ? "Yes" : "No"],
    ].forEach(function (f) {
      if (!f[1]) return;
      var li = el("li");
      li.appendChild(el("span", "muted", f[0]));
      li.appendChild(el("strong", null, f[1]));
      $("contact-facts").appendChild(li);
    });
  }
  $("footer").textContent = "© " + new Date().getFullYear() + " " + d.name;

  // ---------- Theme toggle ----------
  $("theme").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // ---------- Reveal on scroll ----------
  var secs = document.querySelectorAll("section:not(.hero)");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    secs.forEach(function (s) { s.classList.add("reveal"); io.observe(s); });
  }
})();

// ---------- Interactive extras ----------
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var exp = window.PORTFOLIO.experience;

  // Tech filter above the experience tiles: click a tag to show only matching work.
  var counts = {};
  exp.forEach(function (r) {
    r.items.forEach(function (i) { i.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  });
  var topTags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 10);
  var bar = document.createElement("div");
  bar.className = "filters";
  var active = null;
  function applyFilter() {
    document.querySelectorAll("#experience-body .role").forEach(function (role, ri) {
      var shown = 0;
      role.querySelectorAll(".card").forEach(function (c, ci) {
        var ok = !active || exp[ri].items[ci].tags.indexOf(active) !== -1;
        c.hidden = !ok;
        if (ok) shown++;
      });
      role.classList.toggle("dim", !shown);
      role.classList.toggle("filtering", !!active);
    });
    bar.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", (b.dataset.t || null) === active); });
  }
  [null].concat(topTags).forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip filter";
    b.dataset.t = t || "";
    b.textContent = t || "All";
    b.addEventListener("click", function () { active = (t === active) ? null : t; applyFilter(); });
    bar.appendChild(b);
  });
  $("experience-body").parentNode.insertBefore(bar, $("experience-body"));
  applyFilter();

  // Active nav link follows scroll.
  var links = {};
  document.querySelectorAll(".nav nav a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("current"); });
          links[e.target.id].classList.add("current");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  // Scroll progress bar.
  var prog = document.createElement("div");
  prog.className = "progress";
  document.body.appendChild(prog);
  addEventListener("scroll", function () {
    var h = document.documentElement;
    prog.style.transform = "scaleX(" + (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) + ")";
  }, { passive: true });

  if (calm) return;

  // Cursor spotlight on cards, plus a subtle tilt on clickable ones.
  document.querySelectorAll(".card, .project, .stat").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px");
      c.style.setProperty("--my", y + "px");
      if (c.classList.contains("card") && !c.classList.contains("static")) {
        c.style.transform = "perspective(700px) rotateX(" + ((y / r.height - 0.5) * -6) +
          "deg) rotateY(" + ((x / r.width - 0.5) * 6) + "deg) translateY(-3px)";
      }
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  // Typing effect cycling through focus areas.
  var roleEl = $("role");
  var phrases = [window.PORTFOLIO.role, "Cloud-native backends", "Observability & telemetry", "AI evaluation platforms", "API design"];
  var pi = 0, ci = 0, del = false;
  roleEl.classList.add("typing");
  (function tick() {
    var word = phrases[pi];
    roleEl.textContent = word.slice(0, ci);
    if (!del && ci === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    ci += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 70);
  })();

  // Count-up for stats.
  document.querySelectorAll(".stat strong").forEach(function (s) {
    var target = parseInt(s.textContent, 10), done = false;
    s.textContent = "0";
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting || done) return;
      done = true;
      o.disconnect();
      var start = performance.now();
      (function step(t) {
        var p = Math.min((t - start) / 900, 1);
        s.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }).observe(s);
  });

  // Floating gradient background that drifts with the cursor.
  var bg = document.createElement("div");
  bg.className = "blobs";
  for (var k = 0; k < 3; k++) bg.appendChild(document.createElement("i"));
  document.body.prepend(bg);
  addEventListener("pointermove", function (e) {
    bg.style.setProperty("--px", (e.clientX / innerWidth - 0.5) * 60 + "px");
    bg.style.setProperty("--py", (e.clientY / innerHeight - 0.5) * 60 + "px");
  });
})();

// ---------- "See more" collapsing: show the first few tiles, reveal the rest on click ----------
(function () {
  var SHOW = 3;
  document.querySelectorAll("#experience-body .grid, #education-body").forEach(function (grid) {
    var tiles = Array.prototype.slice.call(grid.children);
    if (tiles.length <= SHOW) return;
    tiles.slice(SHOW).forEach(function (t) { t.classList.add("extra"); });
    grid.classList.add("collapsible");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn see-more";
    var hidden = tiles.length - SHOW;
    function label() { btn.textContent = grid.classList.contains("open") ? "Show less ↑" : "See " + hidden + " more ↓"; }
    label();
    btn.addEventListener("click", function () { grid.classList.toggle("open"); label(); });
    grid.parentNode.insertBefore(btn, grid.nextSibling);
  });
})();
