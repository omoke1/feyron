/* ==========================================================================
   BOOK A CALL — Cloudstudio's scheduling widget.
   Self-contained: injects its own styles, speaks es/en, talks to
   GET /bookings/slots and POST /bookings (20-minute grid, Valencia time).
   Usage: window.openBooking({ name, lang, source })
   ========================================================================== */
(function () {
  "use strict";

  var TZ_NOTE = "Valencia (CET)";
  var DAY_START = 10 * 60;        // 10:00
  var DAY_END = 18 * 60;          // last slot 17:40
  var STEP = 20;
  var DAYS_AHEAD = 21;

  var I18N = {
    en: {
      title: "Book a call",
      sub: "20 minutes · pick a day and a slot · {tz}",
      pickDay: "Pick a day",
      pickSlot: "Pick a time",
      none: "No slots left this day — try another one",
      loading: "checking the calendar…",
      name: "Name",
      email: "Email",
      notes: "Anything we should know? (optional)",
      confirm: "Confirm — {slot}",
      booked: "Booked.",
      bookedSub: "{slot} · 20 min · {tz}. You'll get a reply from hello@cloudstudio.es confirming it.",
      ics: "Add to your calendar",
      back: "Back to the site",
      taken: "Someone just took that slot — pick another one.",
      error: "Couldn't book right now — email us at hello@cloudstudio.es",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      eventTitle: "Call — {name} × Cloudstudio",
    },
    es: {
      title: "Reserva una llamada",
      sub: "20 minutos · elige día y hora · {tz}",
      pickDay: "Elige un día",
      pickSlot: "Elige una hora",
      none: "No quedan huecos ese día — prueba otro",
      loading: "mirando el calendario…",
      name: "Nombre",
      email: "Email",
      notes: "¿Algo que debamos saber? (opcional)",
      confirm: "Confirmar — {slot}",
      booked: "Reservada.",
      bookedSub: "{slot} · 20 min · {tz}. Te llegará confirmación desde hello@cloudstudio.es.",
      ics: "Añadir a tu calendario",
      back: "Volver",
      taken: "Alguien acaba de pillar ese hueco — elige otro.",
      error: "No se pudo reservar — escríbenos a hello@cloudstudio.es",
      days: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      eventTitle: "Llamada — {name} × Cloudstudio",
    },
  };

  function injectCss() {
    if (document.getElementById("cs-booking-css")) return;
    var s = document.createElement("style");
    s.id = "cs-booking-css";
    s.textContent = "" +
      ".cs-book{position:fixed;inset:0;z-index:2147483400;display:grid;place-items:center;padding:16px;background:rgba(14,14,12,.45);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;transition:opacity .25s ease}" +
      ".cs-book.is-in{opacity:1}" +
      ".cs-book__card{width:min(560px,100%);max-height:calc(100dvh - 40px);overflow-y:auto;background:#0e0e0c;color:#faf7ea;border:2px solid var(--accent,#fff48d);border-radius:22px;padding:24px 24px 20px;text-align:left;box-shadow:0 30px 80px rgba(0,0,0,.4);transform:translateY(14px) scale(.97);transition:transform .3s cubic-bezier(.16,1,.3,1);position:relative;font-family:'Bricolage Grotesque',sans-serif}" +
      ".cs-book.is-in .cs-book__card{transform:none}" +
      ".cs-book__x{position:absolute;top:10px;right:12px;border:0;background:transparent;color:#cfcfc4;font-size:26px;line-height:1;cursor:pointer;padding:4px 8px}" +
      ".cs-book__x:hover{color:var(--accent,#fff48d)}" +
      ".cs-book h3{margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-.02em}" +
      ".cs-book__sub{margin:0 0 16px;font-family:'Geist Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#8f8f80}" +
      ".cs-book__label{display:block;margin:14px 0 8px;font-family:'Geist Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#cfcfc4}" +
      ".cs-book__days{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}" +
      ".cs-book__days::-webkit-scrollbar{display:none}" +
      ".cs-book__day{flex:none;width:64px;border:1.5px solid rgba(255,244,141,.25);border-radius:14px;background:transparent;color:#faf7ea;padding:9px 4px 8px;cursor:pointer;text-align:center;transition:transform .2s ease,background .2s ease}" +
      ".cs-book__day em{display:block;font-style:normal;font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8f8f80}" +
      ".cs-book__day b{display:block;font-size:20px;font-weight:800;line-height:1.25}" +
      ".cs-book__day i{display:block;font-style:normal;font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8f8f80}" +
      ".cs-book__day:hover{transform:translateY(-2px)}" +
      ".cs-book__day.is-on{background:var(--accent,#fff48d);border-color:var(--accent,#fff48d);color:#0e0e0c}" +
      ".cs-book__day.is-on em,.cs-book__day.is-on i{color:rgba(14,14,12,.65)}" +
      ".cs-book__slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:7px;min-height:44px}" +
      ".cs-book__slot{border:1.5px solid rgba(255,244,141,.25);border-radius:100px;background:transparent;color:#faf7ea;font-family:'Geist Mono',monospace;font-size:12.5px;padding:9px 0;cursor:pointer;transition:transform .18s ease,background .18s ease}" +
      ".cs-book__slot:hover{transform:scale(1.05)}" +
      ".cs-book__slot.is-on{background:var(--accent,#fff48d);border-color:var(--accent,#fff48d);color:#0e0e0c;font-weight:700}" +
      ".cs-book__slot:disabled{opacity:.22;cursor:default;text-decoration:line-through}" +
      ".cs-book__slot:disabled:hover{transform:none}" +
      ".cs-book__note{grid-column:1/-1;font-family:'Geist Mono',monospace;font-size:11px;color:#8f8f80;padding:10px 2px}" +
      ".cs-book__form{display:grid;gap:10px;margin-top:6px}" +
      ".cs-book__form[hidden]{display:none}" +
      ".cs-book__slot.is-loading{opacity:.3;cursor:default;text-decoration:none}" +
      ".cs-book__slot.is-loading:hover{transform:none}" +
      ".cs-book__form input,.cs-book__form textarea{width:100%;box-sizing:border-box;border:1.5px solid rgba(255,244,141,.28);border-radius:12px;background:rgba(255,255,255,.06);color:#faf7ea;font-family:inherit;font-size:15px;font-weight:500;padding:11px 14px;outline:none;transition:border-color .2s ease}" +
      ".cs-book__form input:focus,.cs-book__form textarea:focus{border-color:var(--accent,#fff48d)}" +
      ".cs-book__form textarea{resize:vertical;min-height:60px}" +
      ".cs-book__go{border:0;border-radius:100px;padding:14px 22px;background:var(--accent,#fff48d);color:#0e0e0c;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}" +
      ".cs-book__go:hover{transform:scale(1.03)}" +
      ".cs-book__go:disabled{opacity:.55;cursor:default;transform:none}" +
      ".cs-book__err{margin:2px 0 0;font-size:13px;font-weight:600;color:#ff9d8a}" +
      ".cs-book__hp{position:absolute;left:-5000px;width:1px;height:1px;opacity:0}" +
      ".cs-book__done{text-align:center;padding:18px 4px 8px}" +
      ".cs-book__done h3{font-size:30px}" +
      ".cs-book__done p{color:#cfcfc4;font-size:14.5px;line-height:1.5;margin:8px 0 18px}" +
      ".cs-book__done .cs-book__go{display:inline-block;text-decoration:none;margin:0 4px 8px}" +
      ".cs-book__ghostbtn{display:inline-block;border:1.5px solid rgba(255,244,141,.5);border-radius:100px;background:transparent;color:var(--accent,#fff48d);font-family:inherit;font-size:14px;font-weight:700;padding:12px 20px;cursor:pointer;text-decoration:none;margin:0 4px 8px}";
    document.head.appendChild(s);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  window.openBooking = function (opts) {
    opts = opts || {};
    var T = I18N[(opts.lang || document.documentElement.lang || "en").slice(0, 2)] || I18N.en;
    injectCss();
    if (document.querySelector(".cs-book")) return;

    var picked = { date: null, slot: null };
    var wrap = document.createElement("div");
    wrap.className = "cs-book";
    wrap.innerHTML =
      '<div class="cs-book__card" role="dialog" aria-modal="true" aria-label="' + T.title + '">' +
      '<button type="button" class="cs-book__x" aria-label="Close">×</button>' +
      "<h3>" + T.title + "</h3>" +
      '<p class="cs-book__sub">' + T.sub.replace("{tz}", TZ_NOTE) + "</p>" +
      '<span class="cs-book__label">' + T.pickDay + "</span>" +
      '<div class="cs-book__days"></div>' +
      '<span class="cs-book__label">' + T.pickSlot + "</span>" +
      '<div class="cs-book__slots"><span class="cs-book__note">' + T.loading + "</span></div>" +
      '<form class="cs-book__form" novalidate hidden>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="cs-book__hp">' +
      '<input type="text" name="name" required maxlength="255" placeholder="' + T.name + '" autocomplete="name">' +
      '<input type="email" name="email" required maxlength="255" placeholder="' + T.email + '" autocomplete="email">' +
      '<textarea name="notes" maxlength="2000" placeholder="' + T.notes + '"></textarea>' +
      '<p class="cs-book__err" hidden></p>' +
      '<button type="submit" class="cs-book__go"></button>' +
      "</form>" +
      "</div>";
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { requestAnimationFrame(function () { wrap.classList.add("is-in"); }); });

    var card = wrap.querySelector(".cs-book__card");
    var daysEl = wrap.querySelector(".cs-book__days");
    var slotsEl = wrap.querySelector(".cs-book__slots");
    var form = wrap.querySelector("form");
    var goBtn = form.querySelector(".cs-book__go");
    var errEl = form.querySelector(".cs-book__err");
    // never render an empty button, even if the form is shown before a slot
    goBtn.textContent = T.confirm.replace(/\s*[—–-]?\s*\{slot\}/, "");

    function close() {
      window.removeEventListener("keydown", onKey, true);
      wrap.classList.remove("is-in");
      setTimeout(function () { wrap.remove(); }, 260);
    }
    function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
    window.addEventListener("keydown", onKey, true);
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap || e.target.closest(".cs-book__x")) close();
    });

    // ---- day strip: next N weekdays ----
    var days = [];
    var cursor = new Date();
    for (var i = 0; days.length < 12 && i < DAYS_AHEAD + 4; i++) {
      var d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + i);
      var dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      // today only if slots remain
      if (i === 0) {
        var nowMin = cursor.getHours() * 60 + cursor.getMinutes();
        if (nowMin >= DAY_END - STEP) continue;
      }
      days.push(d);
    }
    days.forEach(function (d, ix) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cs-book__day";
      b.innerHTML = "<em>" + T.days[d.getDay()] + "</em><b>" + d.getDate() + "</b><i>" + T.months[d.getMonth()] + "</i>";
      b.addEventListener("click", function () {
        daysEl.querySelectorAll(".is-on").forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        picked.date = d;
        picked.slot = null;
        form.hidden = true;
        loadSlots(d);
      });
      daysEl.appendChild(b);
      if (ix === 0) b.click();
    });

    function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

    function loadSlots(d) {
      // paint the full 20-min grid immediately as a disabled skeleton so the
      // panel keeps its height while we fetch — no collapse-and-reflow jump
      renderSlots(d, null);
      fetch("/bookings/slots?date=" + dateKey(d))
        .then(function (r) { return r.ok ? r.json() : { taken: [] }; })
        .catch(function () { return { taken: [] }; })
        .then(function (json) { if (picked.date === d) renderSlots(d, json.taken || []); });
    }

    // taken === null → loading skeleton (every slot disabled, none struck through)
    function renderSlots(d, taken) {
      var loading = taken === null;
      slotsEl.innerHTML = "";
      var now = new Date();
      var isToday = dateKey(d) === dateKey(now);
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var any = false;
      for (var m = DAY_START; m < DAY_END; m += STEP) {
        var hh = pad(Math.floor(m / 60)), mm = pad(m % 60);
        var label = hh + ":" + mm;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cs-book__slot";
        b.textContent = label;
        if (loading) {
          b.disabled = true;
          b.classList.add("is-loading");
        } else if (taken.indexOf(label) !== -1 || (isToday && m <= nowMin + 30)) {
          b.disabled = true;
        } else {
          any = true;
          // capture the button too: `var b` is one binding for the whole loop,
          // so without this the handler always mutated the last slot created
          (function (label, btn) {
            btn.addEventListener("click", function () {
              slotsEl.querySelectorAll(".is-on").forEach(function (x) { x.classList.remove("is-on"); });
              btn.classList.add("is-on");
              picked.slot = label;
              form.hidden = false;
              goBtn.textContent = T.confirm.replace("{slot}", niceSlot());
              form.querySelector('[name="name"]').focus();
            });
          })(label, b);
        }
        slotsEl.appendChild(b);
      }
      if (!loading && !any) slotsEl.innerHTML = '<span class="cs-book__note">' + T.none + "</span>";
    }

    function niceSlot() {
      return T.days[picked.date.getDay()] + " " + picked.date.getDate() + " " + T.months[picked.date.getMonth()] + " · " + picked.slot;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity() || !picked.date || !picked.slot) return;
      errEl.hidden = true;
      goBtn.disabled = true;
      var payload = {
        website: form.website.value,
        name: form.name.value,
        email: form.email.value,
        notes: form.notes.value || null,
        starts_at: dateKey(picked.date) + " " + picked.slot,
        lang: (opts.lang || "en"),
        source: opts.source || "site",
      };
      fetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (r.status === 409) throw { taken: true };
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      }).then(function () {
        showDone(payload);
      }).catch(function (err) {
        goBtn.disabled = false;
        errEl.textContent = err && err.taken ? T.taken : T.error;
        errEl.hidden = false;
        if (err && err.taken) loadSlots(picked.date);
      });
    });

    function showDone(payload) {
      var slotTxt = niceSlot();
      var ics = buildIcs(payload, opts, T);
      card.innerHTML =
        '<button type="button" class="cs-book__x" aria-label="Close">×</button>' +
        '<div class="cs-book__done">' +
        "<h3>" + T.booked + ' <svg style="width:.9em;height:.9em;vertical-align:-.08em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.6 12.8 L9.4 18.2 C12 12 16 6.8 20.6 4.6"/></svg></h3>' +
        "<p>" + T.bookedSub.replace("{slot}", slotTxt).replace("{tz}", TZ_NOTE) + "</p>" +
        '<a class="cs-book__go" download="cloudstudio-call.ics" href="' + ics + '">' + T.ics + "</a>" +
        '<button type="button" class="cs-book__ghostbtn" data-close>' + T.back + "</button>" +
        "</div>";
      card.addEventListener("click", function (e) {
        if (e.target.closest("[data-close]") || e.target.closest(".cs-book__x")) close();
      });
      if (window.burstAt) window.burstAt(card, 22);
    }

    function buildIcs(payload, opts, T) {
      var d = picked.date;
      var hm = picked.slot.split(":");
      var start = dateKey(d).replace(/-/g, "") + "T" + hm[0] + hm[1] + "00";
      var endMin = parseInt(hm[0], 10) * 60 + parseInt(hm[1], 10) + STEP;
      var end = dateKey(d).replace(/-/g, "") + "T" + pad(Math.floor(endMin / 60)) + pad(endMin % 60) + "00";
      var title = T.eventTitle.replace("{name}", opts.name || payload.name);
      var body = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cloudstudio//Book a call//EN",
        "BEGIN:VEVENT",
        "UID:" + Date.now() + "@cloudstudio.es",
        "DTSTART;TZID=Europe/Madrid:" + start,
        "DTEND;TZID=Europe/Madrid:" + end,
        "SUMMARY:" + title,
        "DESCRIPTION:hello@cloudstudio.es",
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
    }
  };
})();
