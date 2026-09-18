/* Komilfo Beauty — static site logic (GitHub Pages friendly, no backend).
   Bookings are emailed to the studio via FormSubmit (https://formsubmit.co).
   The first ever submission triggers a one-time activation email to the
   studio address — it must be confirmed once, then everything is automatic. */

(function () {
  "use strict";

  /* ---------------- data ---------------- */
  var SERVICES = [
    { id: 1,  name: "Volume eyelash extensions — 3D / 4D / 5D / 6D", category: "Featured", durationMin: 105, priceEur: 50 },
    { id: 2,  name: "Hollywood waxing",                              category: "Featured", durationMin: 40,  priceEur: 35 },
    { id: 3,  name: "Face Lift Trio",                                category: "Featured", durationMin: 60,  priceEur: 70 },
    { id: 4,  name: "RF lifting",                                    category: "Featured", durationMin: 45,  priceEur: 45 },
    { id: 5,  name: "Microcurrent treatment",                        category: "Featured", durationMin: 45,  priceEur: 45 },
    { id: 6,  name: "Eyebrow tint",                                  category: "Lash & Brow", durationMin: 15, priceEur: 6 },
    { id: 7,  name: "Eyebrows wax",                                  category: "Lash & Brow", durationMin: 15, priceEur: 6 },
    { id: 8,  name: "Hands massage",                                 category: "Massage", durationMin: 30, priceEur: 20 },
    { id: 9,  name: "LPG massage — face & body",                     category: "Massage", durationMin: 60, priceEur: null },
    { id: 10, name: "Vacuum RF massage · Cavitation",                category: "Massage", durationMin: 60, priceEur: null },
    { id: 11, name: "HIFU / SMAS lifting",                           category: "Advanced Aesthetics", durationMin: 90, priceEur: null },
    { id: 12, name: "Thread lifting",                                category: "Advanced Aesthetics", durationMin: 90, priceEur: null },
    { id: 13, name: "Injectable treatments / dermal implants",       category: "Advanced Aesthetics", durationMin: 60, priceEur: null },
    { id: 14, name: "Mesotherapy · lipolytic injections",            category: "Advanced Aesthetics", durationMin: 60, priceEur: null },
    { id: 15, name: "Microneedling treatments",                      category: "Advanced Aesthetics", durationMin: 60, priceEur: null },
    { id: 16, name: "HydroLuxx facial",                              category: "Skin & Facials", durationMin: 60, priceEur: null },
    { id: 17, name: "Diamond / hydro microdermabrasion",             category: "Skin & Facials", durationMin: 60, priceEur: null },
    { id: 18, name: "Skin peels",                                    category: "Skin & Facials", durationMin: 45, priceEur: null },
    { id: 19, name: "Diode laser — vascular pathologies removal",    category: "Skin & Facials", durationMin: 45, priceEur: null },
    { id: 20, name: "Skin tag removal by electrolysis",              category: "Skin & Facials", durationMin: 45, priceEur: null },
    { id: 21, name: "Manicure",                                      category: "Nails & Waxing", durationMin: 60, priceEur: null },
    { id: 22, name: "Pedicure",                                      category: "Nails & Waxing", durationMin: 60, priceEur: null },
    { id: 23, name: "Face & body waxing · advanced wax",             category: "Nails & Waxing", durationMin: 40, priceEur: null }
  ];

  var STUDIO_EMAIL = "graphics.andreea@gmail.com";
  var OPEN_DAYS = [1, 2, 3, 4]; // Mon–Thu
  var OPEN_HOUR = 17, CLOSE_HOUR = 21, SLOT_STEP_MIN = 30;
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW = ["Mo","Tu","We","Th","Fr","Sa","Su"];

  /* ---------------- helpers ---------------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function prettyDate(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function dur(min) { return min >= 60 ? Math.floor(min / 60) + " h" + (min % 60 ? " " + (min % 60) + " min" : "") : min + " min"; }

  /* ---------------- reveal on scroll ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  function observeReveals() {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (n) { io.observe(n); });
  }

  /* ---------------- parallax ---------------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function runParallax() {
    var y = window.scrollY;
    layers.forEach(function (n) {
      var speed = parseFloat(n.getAttribute("data-parallax") || "0");
      var base = n.classList.contains("hero-img") ? "rotate(2.5deg) " : "";
      n.style.transform = base + "translateY(" + y * speed + "px)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(runParallax); ticking = true; }
  }, { passive: true });

  /* ---------------- services list ---------------- */
  function renderServices() {
    var host = document.getElementById("services-list");
    if (!host) return;
    var cats = [];
    SERVICES.forEach(function (s) {
      var c = cats.filter(function (c) { return c.name === s.category; })[0];
      if (!c) { c = { name: s.category, items: [] }; cats.push(c); }
      c.items.push(s);
    });
    cats.forEach(function (c) {
      host.appendChild(el("p", "cat-label reveal", c.name));
      c.items.forEach(function (s) {
        var row = el("div", "spine reveal");
        row.appendChild(el("span", "name", s.name));
        row.appendChild(el("span", "dur", dur(s.durationMin)));
        row.appendChild(s.priceEur
          ? el("span", "price", "€" + s.priceEur)
          : el("span", "price consult", "On booking"));
        row.addEventListener("click", function () {
          booking.setService(s.id);
          document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
        });
        host.appendChild(row);
      });
    });
  }

  /* ---------------- booking widget ---------------- */
  var booking = (function () {
    var host = document.getElementById("booking-app");
    var today = new Date();
    var state = {
      month: new Date(today.getFullYear(), today.getMonth(), 1),
      serviceId: null,
      date: null,
      time: null,
      sending: false
    };

    function selectedService() {
      return SERVICES.filter(function (s) { return s.id === state.serviceId; })[0] || null;
    }

    function slotsFor() {
      var svc = selectedService();
      if (!svc || !state.date) return [];
      var slots = [];
      for (var m = OPEN_HOUR * 60; m + svc.durationMin <= CLOSE_HOUR * 60; m += SLOT_STEP_MIN) {
        slots.push(pad(Math.floor(m / 60)) + ":" + pad(m % 60));
      }
      // today: only future slots
      if (state.date === fmtDate(today)) {
        var nowMin = today.getHours() * 60 + today.getMinutes();
        slots = slots.filter(function (t) {
          var p = t.split(":"); return (+p[0]) * 60 + (+p[1]) > nowMin;
        });
      }
      return slots;
    }

    function render() {
      host.innerHTML = "";
      var grid = el("div", "booking-grid");

      /* left column */
      var left = el("div");
      left.appendChild(el("p", "bk-step-label", "01 — Service"));
      var sel = el("select", "bk-select");
      var ph = el("option", null, "Choose a treatment…");
      ph.value = ""; ph.disabled = true; if (!state.serviceId) ph.selected = true;
      sel.appendChild(ph);
      SERVICES.forEach(function (s) {
        var o = el("option", null, s.name + (s.priceEur ? " — €" + s.priceEur : ""));
        o.value = s.id;
        if (s.id === state.serviceId) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () {
        state.serviceId = Number(sel.value); state.time = null; render();
      });
      left.appendChild(sel);

      left.appendChild(el("p", "bk-step-label", "02 — Day"));
      left.lastChild.style.marginTop = "2.6rem";
      left.appendChild(renderCalendar());

      left.appendChild(el("p", "bk-step-label", "03 — Time"));
      left.lastChild.style.marginTop = "2.6rem";
      if (!state.date || !state.serviceId) {
        left.appendChild(el("p", "slots-empty", "Choose a treatment and a day first."));
      } else {
        var slots = slotsFor();
        if (!slots.length) {
          left.appendChild(el("p", "slots-empty", "No free time slots left on this day."));
        } else {
          var slotWrap = el("div", "slots");
          slots.forEach(function (t) {
            var b = el("button", "slot" + (state.time === t ? " selected" : ""), t);
            b.type = "button";
            b.addEventListener("click", function () { state.time = t; render(); });
            slotWrap.appendChild(b);
          });
          left.appendChild(slotWrap);
        }
      }

      /* right column */
      var right = el("div");
      right.appendChild(el("p", "bk-step-label", "04 — Your details"));
      var form = el("form", "bk-form");
      form.setAttribute("novalidate", "novalidate");

      form.appendChild(field("Full name", '<input name="name" placeholder="Your name" autocomplete="name">'));
      form.appendChild(field("Email", '<input name="email" type="email" placeholder="you@email.com" autocomplete="email">'));
      form.appendChild(field("Phone (optional)", '<input name="phone" placeholder="+353 …" autocomplete="tel">'));
      form.appendChild(field("Notes (optional)", '<textarea name="notes" placeholder="Preferences, allergies, questions…"></textarea>'));

      var svc = selectedService();
      if (svc && state.date && state.time) {
        var sum = el("div", "bk-summary");
        sum.appendChild(el("span", "s-name", svc.name));
        sum.appendChild(el("span", "s-when", state.date + " · " + state.time + (svc.priceEur ? " · €" + svc.priceEur : "")));
        form.appendChild(sum);
      }

      var err = el("p", "bk-error");
      err.style.display = "none";
      form.appendChild(err);

      var submit = el("button", "bk-submit");
      submit.type = "submit";
      submit.appendChild(el("span", null, state.sending ? "Sending…" : "Confirm booking"));
      if (state.sending) submit.disabled = true;
      form.appendChild(submit);

      form.appendChild(el("p", "bk-note",
        "The studio receives your booking by email and confirms it shortly. You can also book via Fresha."));

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        err.style.display = "none";
        var name = form.name.value.trim();
        var email = form.email.value.trim();
        var phone = form.phone.value.trim();
        var notes = form.notes.value.trim();
        function fail(msg) { err.textContent = msg; err.style.display = "block"; }
        if (!state.serviceId || !state.date || !state.time) return fail("Please choose a service, a day and a time.");
        if (name.length < 2) return fail("Please enter your name.");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("That email address does not look valid.");

        state.sending = true;
        submit.disabled = true;
        submit.firstChild.textContent = "Sending…";

        var svc2 = selectedService();
        fetch("https://formsubmit.co/ajax/" + STUDIO_EMAIL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "New booking: " + svc2.name + " — " + prettyDate(state.date) + " at " + state.time,
            _template: "table",
            _captcha: "false",
            _replyto: email,
            Service: svc2.name,
            Date: prettyDate(state.date),
            Time: state.time,
            Duration: dur(svc2.durationMin),
            Price: svc2.priceEur ? "€" + svc2.priceEur : "On booking",
            "Client name": name,
            "Client email": email,
            "Client phone": phone || "—",
            Notes: notes || "—"
          })
        })
        .then(function (r) { if (!r.ok) throw new Error("send failed"); return r.json(); })
        .then(function () { renderSuccess(svc2, name); })
        .catch(function () {
          state.sending = false;
          fail("The booking could not be sent. Please try again or call +353 87 719 7365.");
          submit.disabled = false;
          submit.firstChild.textContent = "Confirm booking";
        });
      });

      right.appendChild(form);
      grid.appendChild(left);
      grid.appendChild(right);
      host.appendChild(grid);
    }

    function field(label, innerHTML) {
      var w = el("div", "bk-field");
      var l = el("label", null, label);
      w.appendChild(l);
      var span = document.createElement("span");
      span.innerHTML = innerHTML;
      w.appendChild(span.firstChild);
      return w;
    }

    function renderCalendar() {
      var cal = el("div", "calendar");
      var head = el("div", "cal-head");
      var canPrev = state.month.getFullYear() > today.getFullYear() ||
        (state.month.getFullYear() === today.getFullYear() && state.month.getMonth() > today.getMonth());
      var prev = el("button", "cal-nav", "←");
      prev.type = "button"; prev.disabled = !canPrev;
      prev.addEventListener("click", function () {
        state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); render();
      });
      var next = el("button", "cal-nav", "→");
      next.type = "button";
      next.addEventListener("click", function () {
        state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); render();
      });
      head.appendChild(prev);
      head.appendChild(el("div", "month", MONTHS[state.month.getMonth()] + " " + state.month.getFullYear()));
      head.appendChild(next);
      cal.appendChild(head);

      var gridEl = el("div", "cal-grid");
      DOW.forEach(function (d) { gridEl.appendChild(el("div", "cal-dow", d)); });
      var y = state.month.getFullYear(), m = state.month.getMonth();
      var startOffset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      for (var i = 0; i < startOffset; i++) gridEl.appendChild(el("div"));
      var _loop = function (d) {
        var date = new Date(y, m, d);
        var iso = fmtDate(date);
        var isPast = iso < fmtDate(today);
        var isClosed = OPEN_DAYS.indexOf(date.getDay()) === -1;
        var b = el("button", "cal-day" +
          (isClosed ? " closed" : "") +
          (state.date === iso ? " selected" : "") +
          (iso === fmtDate(today) ? " today" : ""), String(d));
        b.type = "button";
        b.disabled = isPast || isClosed;
        b.addEventListener("click", function () {
          state.date = iso; state.time = null; render();
        });
        gridEl.appendChild(b);
      };
      for (var d = 1; d <= daysInMonth; d++) _loop(d);
      cal.appendChild(gridEl);
      return cal;
    }

    function renderSuccess(svc, name) {
      host.innerHTML = "";
      var box = el("div", "bk-success reveal in");
      var big = el("div", "big");
      big.innerHTML = "Booking <em>received</em>";
      box.appendChild(big);
      box.appendChild(el("p", null,
        svc.name + " — " + prettyDate(state.date) + " at " + state.time +
        ". Thank you, " + name + " — the studio has been notified by email and will confirm your appointment shortly."));
      var again = el("button", "bk-submit");
      again.type = "button";
      again.style.marginTop = "2rem";
      again.appendChild(el("span", null, "Book another visit"));
      again.addEventListener("click", function () {
        state.time = null; render();
      });
      box.appendChild(again);
      host.appendChild(box);
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    render();
    return {
      setService: function (id) { state.serviceId = id; state.time = null; render(); }
    };
  })();

  renderServices();
  observeReveals();
})();
