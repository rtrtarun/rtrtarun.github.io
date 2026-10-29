// Colour palettes, contact form and "Book a call". Reads window.PORTFOLIO.
(function () {
  var d = window.PORTFOLIO;
  var $ = function (id) { return document.getElementById(id); };
  var safe = function (fn) { try { return fn(); } catch (e) { return null; } };

  // ---------- Colour palettes ----------
  var PALETTES = [["", "Forest"], ["violet", "Violet"], ["ocean", "Ocean"], ["rose", "Rose"], ["amber", "Amber"]];
  var sel = $("palette");
  PALETTES.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p[0]; o.textContent = p[1];
    sel.appendChild(o);
  });
  sel.value = document.documentElement.dataset.palette || "";
  sel.addEventListener("change", function () {
    if (sel.value) document.documentElement.dataset.palette = sel.value;
    else delete document.documentElement.dataset.palette;
    safe(function () { localStorage.setItem("palette", sel.value); });
  });

  // ---------- Book a call ----------
  if (d.bookCallUrl) {
    ["book-call", "book-hero"].forEach(function (id) { $(id).href = d.bookCallUrl; $(id).hidden = false; });
  }

  // ---------- Contact form ----------
  var C = d.contact || {};
  var dlg = $("form-dialog"), form = $("contact-form"), status = $("form-status"), send = $("form-send");
  var placeholder = document.createElement("option");
  placeholder.value = ""; placeholder.textContent = "Choose a reason…"; placeholder.disabled = true; placeholder.selected = true;
  $("reason").appendChild(placeholder);
  (C.reasons || []).forEach(function (r) {
    var o = document.createElement("option");
    o.value = r; o.textContent = r;
    $("reason").appendChild(o);
  });
  function say(msg, bad) { status.textContent = msg; status.classList.toggle("bad", !!bad); }
  $("open-form").addEventListener("click", function () { say(""); dlg.showModal(); });
  ["form-close", "form-cancel"].forEach(function (id) { $(id).addEventListener("click", function () { dlg.close(); }); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website.value) return; // honeypot: bots fill this in
    if (!form.checkValidity()) { say("Please fill in every required field with valid details.", true); form.reportValidity(); return; }
    if (!C.formUrl) {
      // No backend configured yet: fall back to the visitor's email app.
      var body = "Name: " + form.firstName.value + " " + form.lastName.value + "\nEmail: " + form.email.value +
        "\nPhone: " + form.phone.value + "\nReason: " + form.reason.value + "\n\n" + form.message.value;
      location.href = "mailto:" + d.links.email + "?subject=" + encodeURIComponent("Portfolio enquiry: " + form.reason.value) + "&body=" + encodeURIComponent(body);
      return;
    }
    send.disabled = true; say("Sending…");
    // Apps Script web apps do not send CORS headers, so the response is opaque (no-cors).
    fetch(C.formUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(form)) })
      .then(function () { form.reset(); say("Message sent. Thank you, I will get back to you soon."); })
      .catch(function () { say("Could not send. Please email me directly at " + d.links.email + ".", true); })
      .then(function () { send.disabled = false; });
  });
})();
