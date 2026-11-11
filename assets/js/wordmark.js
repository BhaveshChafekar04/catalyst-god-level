/* ============================================================
   CATALYST — interactive wordmark engine
   Adapted from the original component. Same core technique:
   measured SVG glyphs, per-letter spring integration, cursor
   force field, construction-guide overlay, sheen sweep,
   scroll-linked transformation.

   Exported: CATALYST.Wordmark.mount(svgElement, options)
   options.scrollTarget — element whose scroll progress drives
                           the transform (default: window)
   options.interactive   — pointer interaction (default true)
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;

  var VB_W = 1240;
  var VB_H = 320;
  var BASELINE = 236;
  var TARGET_W = 1180;
  var FS0 = 200;

  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function mount(svg, opts) {
    opts = opts || {};
    if (!svg) return null;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var coarse = window.matchMedia("(hover: none)").matches;
    var WORD = (opts.word || "CATALYST").toUpperCase();

    var gLetters = svg.querySelector('[data-wm="letters"]');
    var gSheen = svg.querySelector('[data-wm="sheen"]');
    var gGuides = svg.querySelector('[data-wm="guides"]');
    var sheenGrad = svg.querySelector("#sheenGrad");
    var host = svg.closest(".wordmark") || svg;

    if (!gLetters) return null;

    var letters = [];   /* {el, sheenEl, baseX, w, cx, cy, dx,dy,vx,vy, rot,vrot, scale,vscale} */
    var guides = [];    /* {box, ticks[], label, link} */
    var cross = null;
    var laidOut = false;
    var hovering = false;
    var hoverAmt = 0;

    /* ---------- build ---------- */
    function makeText(ch, cls) {
      var t = svgEl("text", { x: "0", y: String(BASELINE), "font-size": String(FS0), class: cls });
      t.textContent = ch;
      return t;
    }

    for (var i = 0; i < WORD.length; i++) {
      var ch = WORD.charAt(i);
      var el = makeText(ch, "wm-letter");
      var sh = makeText(ch, "wm-sheen");
      gLetters.appendChild(el);
      gSheen.appendChild(sh);
      letters.push({
        el: el, sheenEl: sh, baseX: 0, w: 0, cx: 0, cy: 0,
        dx: 0, dy: 0, vx: 0, vy: 0, rot: 0, vrot: 0, scale: 1, vscale: 0
      });
    }

    /* ---------- layout: fit the mark to the viewBox width ---------- */
    function layout() {
      if (!letters.length) return;
      letters.forEach(function (L) {
        L.el.setAttribute("font-size", String(FS0));
        L.sheenEl.setAttribute("font-size", String(FS0));
        L.el.setAttribute("x", "0");
        L.sheenEl.setAttribute("x", "0");
      });
      var widths = letters.map(function (L) { return L.el.getComputedTextLength(); });
      var total = widths.reduce(function (a, b) { return a + b; }, 0);
      if (!total) return;

      var fs = FS0 * (TARGET_W / total);
      letters.forEach(function (L) {
        L.el.setAttribute("font-size", String(fs));
        L.sheenEl.setAttribute("font-size", String(fs));
      });
      widths = letters.map(function (L) { return L.el.getComputedTextLength(); });
      total = widths.reduce(function (a, b) { return a + b; }, 0);

      var tracking = (TARGET_W - total) / Math.max(1, letters.length - 1);
      var x = (VB_W - TARGET_W) / 2;

      letters.forEach(function (L, i) {
        L.baseX = x;
        L.w = widths[i];
        L.cx = x + widths[i] / 2;
        L.cy = BASELINE - fs * 0.345;
        L.fs = fs;
        L.el.setAttribute("x", String(x));
        L.sheenEl.setAttribute("x", String(x));
        x += widths[i] + tracking;
      });

      laidOut = true;
      buildGuides();
      drawRules();
    }

    /* ---------- construction guides ---------- */
    function buildGuides() {
      gGuides.textContent = "";
      guides = [];
      var capTop = letters[0].cy - letters[0].fs * 0.5;
      var capBot = letters[0].cy + letters[0].fs * 0.5;

      letters.forEach(function (L, idx) {
        var pad = 9;
        var top = L.cy - L.fs * 0.5 - pad * 0.4;
        var hgt = L.fs + pad * 0.8;

        var box = svgEl("rect", {
          class: "vbox",
          x: String(L.baseX - pad), y: String(top),
          width: String(L.w + pad * 2), height: String(hgt),
          opacity: "0"
        });
        gGuides.appendChild(box);

        var ticks = [];
        var corners = [
          [L.baseX - pad, top], [L.baseX + L.w + pad, top],
          [L.baseX - pad, top + hgt], [L.baseX + L.w + pad, top + hgt]
        ];
        corners.forEach(function (c) {
          var h = svgEl("line", { class: "vtick", x1: String(c[0] - 6), y1: String(c[1]), x2: String(c[0] + 6), y2: String(c[1]), opacity: "0" });
          var v = svgEl("line", { class: "vtick", x1: String(c[0]), y1: String(c[1] - 6), x2: String(c[0]), y2: String(c[1] + 6), opacity: "0" });
          gGuides.appendChild(h);
          gGuides.appendChild(v);
          ticks.push(h, v);
        });

        var label = svgEl("text", {
          class: "vlabel", x: String(L.baseX - pad),
          y: String(top - 7), opacity: "0"
        });
        label.textContent = WORD.charAt(idx) + "\u00b7" + ("0" + (idx + 1)).slice(-2);
        gGuides.appendChild(label);

        var link = svgEl("line", { class: "vlink", opacity: "0" });
        gGuides.appendChild(link);

        guides.push({ box: box, ticks: ticks, label: label, link: link, top: top, hgt: hgt });
      });

      /* crosshair */
      cross = svgEl("g", { opacity: "0" });
      var ch1 = svgEl("line", { class: "vcross" });
      var ch2 = svgEl("line", { class: "vcross" });
      var ring = svgEl("circle", { class: "vring", r: "14" });
      cross.appendChild(ch1); cross.appendChild(ch2); cross.appendChild(ring);
      gGuides.appendChild(cross);
      cross._h = ch1; cross._v = ch2; cross._r = ring;

      /* baseline + cap height rules */
      var ruleGroup = svgEl("g", { class: "wm-rules", opacity: "0" });
      ruleGroup.setAttribute("data-wm", "rules");
      [["CAP HEIGHT", capTop], ["BASELINE", capBot]].forEach(function (r) {
        var ln = svgEl("line", {
          class: "wm-rule", x1: "20", y1: String(r[1]), x2: String(VB_W - 20), y2: String(r[1])
        });
        var lb = svgEl("text", { class: "wm-rule-label", x: "20", y: String(r[1] - 5) });
        lb.textContent = r[0];
        ruleGroup.appendChild(ln);
        ruleGroup.appendChild(lb);
      });
      gGuides.appendChild(ruleGroup);
      rulesGroup = ruleGroup;
    }
    var rulesGroup = null;
    function drawRules() { /* re-created in buildGuides after layout */ }

    /* ---------- pointer ---------- */
    var pointer = { x: VB_W / 2, y: VB_H / 2, active: false };
    var smooth = { x: VB_W / 2, y: VB_H / 2 };
    var interactive = opts.interactive !== false && !reduce && !coarse;

    function toVB(clientX, clientY) {
      var r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return {
        x: (clientX - r.left) / r.width * VB_W,
        y: (clientY - r.top) / r.height * VB_H
      };
    }

    if (interactive) {
      window.addEventListener("pointermove", function (e) {
        var p = toVB(e.clientX, e.clientY);
        if (!p) return;
        pointer.x = p.x; pointer.y = p.y; pointer.active = true;
      }, { passive: true });

      svg.addEventListener("pointerenter", function () { hovering = true; });
      svg.addEventListener("pointerleave", function () { hovering = false; });

      window.addEventListener("pointerleave", function () { pointer.active = false; });
      document.addEventListener("mouseleave", function () { pointer.active = false; });
      window.addEventListener("blur", function () { pointer.active = false; });
    }

    /* ---------- scroll ---------- */
    var scrollProg = 0;
    function updateScroll() {
      if (opts.staticOnScroll) { scrollProg = 0; return; }
      var h = window.innerHeight || 1;
      var y = window.scrollY || window.pageYOffset;
      scrollProg = Math.min(1, Math.max(0, y / (h * 0.86)));
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    /* ---------- loop ---------- */
    var sheenPos = -600;
    var sheenSpeed = 0;
    var last = performance.now();
    var raf = 0;

    function frame(now) {
      var dt = Math.min(48, now - last) / 16.667;
      last = now;

      if (laidOut) {
        smooth.x += (pointer.x - smooth.x) * 0.15 * dt;
        smooth.y += (pointer.y - smooth.y) * 0.15 * dt;

        var R = 320;
        var i, L, g;

        for (i = 0; i < letters.length; i++) {
          L = letters[i];
          var tx = 0, ty = 0, trot = 0, tscale = 1;

          if (pointer.active) {
            var ddx = L.cx - smooth.x;
            var ddy = L.cy - smooth.y;
            var dist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dist < R) {
              var f = 1 - dist / R;
              f = f * f;
              var inv = dist > 0.001 ? 1 / dist : 0;
              tx = ddx * inv * f * 52;
              ty = ddy * inv * f * 34;
              trot = -ddx * inv * f * 7.5;
              tscale = 1 + f * 0.05;
            }
          }

          /* scroll: letters spread outward and lift as the mark recedes */
          var n = letters.length - 1;
          var spread = scrollProg * 30 * (i - n / 2) / (n / 2 || 1);
          tx += spread;
          ty += -scrollProg * 22;

          L.vx += (tx - L.dx) * 0.135 * dt;
          L.vy += (ty - L.dy) * 0.135 * dt;
          L.vx *= Math.pow(0.80, dt);
          L.vy *= Math.pow(0.80, dt);
          L.dx += L.vx * dt;
          L.dy += L.vy * dt;

          L.vrot += (trot - L.rot) * 0.115 * dt;
          L.vrot *= Math.pow(0.82, dt);
          L.rot += L.vrot * dt;

          L.vscale += (tscale - L.scale) * 0.115 * dt;
          L.vscale *= Math.pow(0.82, dt);
          L.scale += L.vscale * dt;

          var tr = "translate(" + L.dx.toFixed(2) + " " + L.dy.toFixed(2) + ") " +
                   "rotate(" + L.rot.toFixed(2) + " " + L.cx.toFixed(1) + " " + L.cy.toFixed(1) + ") " +
                   "translate(" + L.cx.toFixed(1) + " " + L.cy.toFixed(1) + ") scale(" + L.scale.toFixed(3) + ") " +
                   "translate(" + (-L.cx).toFixed(1) + " " + (-L.cy).toFixed(1) + ")";
          L.el.setAttribute("transform", tr);
          L.sheenEl.setAttribute("transform", tr);
        }

        /* sheen */
        sheenSpeed += 0.5 * dt;
        sheenPos += sheenSpeed * dt;
        if (sheenPos > VB_W + 620) { sheenPos = -620; sheenSpeed = 0.5; }
        if (sheenGrad) {
          sheenGrad.setAttribute("x1", String(sheenPos - 200));
          sheenGrad.setAttribute("x2", String(sheenPos + 200));
        }

        /* guides */
        if (interactive && cross && !reduce) {
          hoverAmt += ((pointer.active ? 1 : 0) - hoverAmt) * 0.1 * dt;
          var anyNear = false;

          for (i = 0; i < letters.length; i++) {
            L = letters[i]; g = guides[i];
            var dx2 = L.cx - smooth.x, dy2 = L.cy - smooth.y;
            var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            var near = Math.max(0, 1 - d2 / 400);
            near = near * near;
            if (near > 0.02) anyNear = true;

            g.box.setAttribute("opacity", (near * 0.9).toFixed(3));
            g.label.setAttribute("opacity", (near * 0.95).toFixed(3));
            g.box.setAttribute("x", String(L.baseX - 9 + L.dx));
            g.box.setAttribute("y", String(g.top + L.dy));
            g.label.setAttribute("x", String(L.baseX - 9 + L.dx));
            g.label.setAttribute("y", String(g.top - 7 + L.dy));
            for (var t = 0; t < g.ticks.length; t++) g.ticks[t].setAttribute("opacity", (near * 0.95).toFixed(3));

            var cs = [
              [L.baseX - 9 + L.dx, g.top + L.dy],
              [L.baseX + L.w + 9 + L.dx, g.top + L.dy],
              [L.baseX - 9 + L.dx, g.top + g.hgt + L.dy],
              [L.baseX + L.w + 9 + L.dx, g.top + g.hgt + L.dy]
            ];
            for (var c = 0; c < 4; c++) {
              var hh = g.ticks[c * 2], vv = g.ticks[c * 2 + 1];
              hh.setAttribute("x1", String(cs[c][0] - 6)); hh.setAttribute("y1", String(cs[c][1]));
              hh.setAttribute("x2", String(cs[c][0] + 6)); hh.setAttribute("y2", String(cs[c][1]));
              vv.setAttribute("x1", String(cs[c][0])); vv.setAttribute("y1", String(cs[c][1] - 6));
              vv.setAttribute("x2", String(cs[c][0])); vv.setAttribute("y2", String(cs[c][1] + 6));
            }

            g.link.setAttribute("x1", String(smooth.x));
            g.link.setAttribute("y1", String(smooth.y));
            g.link.setAttribute("x2", String(L.cx + L.dx));
            g.link.setAttribute("y2", String(L.cy + L.dy));
            g.link.setAttribute("opacity", (near * 0.45).toFixed(3));
          }

          cross.setAttribute("opacity", (hoverAmt * (anyNear ? 0.92 : 0.34)).toFixed(3));
          cross._h.setAttribute("x1", String(smooth.x - 24)); cross._h.setAttribute("y1", String(smooth.y));
          cross._h.setAttribute("x2", String(smooth.x + 24)); cross._h.setAttribute("y2", String(smooth.y));
          cross._v.setAttribute("x1", String(smooth.x)); cross._v.setAttribute("y1", String(smooth.y - 24));
          cross._v.setAttribute("x2", String(smooth.x)); cross._v.setAttribute("y2", String(smooth.y + 24));
          cross._r.setAttribute("cx", String(smooth.x));
          cross._r.setAttribute("cy", String(smooth.y));

          if (rulesGroup) rulesGroup.setAttribute("opacity", (hoverAmt * 0.9).toFixed(3));
        }

        /* host transform on scroll */
        var sc = 1 - scrollProg * 0.14;
        host.style.transform = "translateY(" + (-scrollProg * 34).toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
        host.style.opacity = String(Math.max(0, 1 - scrollProg * 1.1));
      }

      raf = requestAnimationFrame(frame);
    }

    /* ---------- start ---------- */
    layout();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { layout(); });
    }
    window.addEventListener("resize", C.debounce(layout, 160));

    if (reduce || opts.staticOnly) {
      gGuides.setAttribute("opacity", "0");
    } else {
      raf = requestAnimationFrame(frame);
    }

    return {
      destroy: function () { if (raf) cancelAnimationFrame(raf); },
      layout: layout
    };
  }

  C.Wordmark = { mount: mount };
})();
