/* ============================================================
   CATALYST — core runtime
   Utilities · persistent store · auth abstraction · nav · UI
   NOTE: There is no backend in this deployment. Everything here
   runs in the browser against a local store, and every surface
   that depends on it is labelled as such. See services layer
   comments for the exact API contract a real backend must meet.
   ============================================================ */
(function () {
  "use strict";

  var C = (window.CATALYST = window.CATALYST || {});

  /* ----------------------------------------------------------
     tiny DOM helpers
     ---------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    return String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function fmtBytes(b) {
    if (!b) return "0 B";
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, s = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(s, a); }, ms || 180);
    };
  }
  function param(k, d) {
    var v = new URLSearchParams(location.search).get(k);
    return v === null ? d : v;
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }

  C.$ = $; C.$$ = $$; C.el = el; C.esc = esc; C.initials = initials;
  C.fmtDate = fmtDate; C.fmtBytes = fmtBytes; C.debounce = debounce;
  C.param = param; C.slug = slug; C.plural = plural; C.pad = pad;

  /* ----------------------------------------------------------
     persistent local store
     ---------------------------------------------------------- */
  var KEY = "catalyst.store.v2";
  var memory = null;

  function blank() { return { challenges: [], reports: [], users: [], saved: {}, applications: {}, teams: [], projects: [], partners: [], audit: [], notifications: [] }; }

  C.store = {
    read: function () {
      if (memory) return memory;
      try {
        var raw = localStorage.getItem(KEY);
        memory = raw ? JSON.parse(raw) : null;
      } catch (e) { memory = null; }
      if (!memory || typeof memory !== "object") memory = blank();
      Object.keys(blank()).forEach(function (k) { if (memory[k] === undefined) memory[k] = blank()[k]; });
      return memory;
    },
    write: function (fn) {
      var s = C.store.read();
      if (typeof fn === "function") fn(s);
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* quota */ }
      return s;
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      try { localStorage.removeItem("catalyst.session.v2"); } catch (e) {}
      memory = null;
    }
  };

  /* ----------------------------------------------------------
     AUTH ABSTRACTION
     ----------------------------------------------------------
     Replace this object with calls to the real identity provider.
     Contract required by the UI:
       register({name,email,password,role}) -> {user} | throws {code,message}
       login({email,password})              -> {user} | throws {code,message}
       logout()                             -> void
       currentUser()                        -> user | null
       requestReset(email)                  -> {ok:true}
       updateProfile(patch)                 -> {user}
     Server MUST decide role; the client role below is a demo only.
     ---------------------------------------------------------- */
  var SESSION = "catalyst.session.v2";
  var ROLE_LABEL = {
    citizen: "Citizen / Problem Reporter",
    student: "Student",
    university: "University / Faculty",
    industry: "Industry / Startup Partner",
    admin: "Administrator"
  };

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION) || "null"); } catch (e) { return null; }
  }
  function writeSession(u) {
    try {
      if (u) localStorage.setItem(SESSION, JSON.stringify(u));
      else localStorage.removeItem(SESSION);
    } catch (e) {}
  }

  function seedUsers() {
    var s = C.store.read();
    if (s.users.length) return s.users;
    var base = [
      { id: "u-admin", name: "Platform Admin", email: "admin@catalyst.demo", password: "demo1234", role: "admin", verified: true, org: "Catalyst" },
      { id: "u-student", name: "Aarav Menon", email: "student@catalyst.demo", password: "demo1234", role: "student", verified: true, org: "National Institute of Technology", branch: "Computer Science", year: "3rd year" },
      { id: "u-uni", name: "Dr. Priya Raghunathan", email: "faculty@catalyst.demo", password: "demo1234", role: "university", verified: true, org: "National Institute of Technology", dept: "Civil Engineering" },
      { id: "u-ind", name: "Rohan Bhatia", email: "industry@catalyst.demo", password: "demo1234", role: "industry", verified: true, org: "Verdant Water Systems" },
      { id: "u-cit", name: "Meera Kulkarni", email: "citizen@catalyst.demo", password: "demo1234", role: "citizen", verified: true, org: "Ward 14 Residents' Association" }
    ];
    C.store.write(function (s2) { s2.users = base; });
    return base;
  }

  C.ROLE_LABEL = ROLE_LABEL;

  C.Auth = {
    /* Demo-only credentials notice is rendered in the UI by auth pages. */
    register: function (d) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          var s = C.store.read();
          seedUsers();
          s = C.store.read();
          if (!d.email || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) {
            return reject({ code: "invalid_email", message: "Enter a valid email address." });
          }
          if (!d.password || d.password.length < 8) {
            return reject({ code: "weak_password", message: "Use at least 8 characters." });
          }
          if (s.users.some(function (u) { return u.email.toLowerCase() === d.email.toLowerCase(); })) {
            return reject({ code: "email_taken", message: "An account with that email already exists." });
          }
          /* Role assigned here is a DEMO stand-in. A real backend must
             assign roles server-side and never trust this value. */
          var role = ["citizen", "student", "university", "industry"].indexOf(d.role) >= 0 ? d.role : "citizen";
          var user = {
            id: "u-" + Date.now().toString(36),
            name: d.name, email: d.email, password: d.password, role: role,
            verified: false, org: d.org || "", createdAt: new Date().toISOString(), onboarded: false
          };
          C.store.write(function (s2) { s2.users.push(user); });
          writeSession(publicUser(user));
          resolve({ user: publicUser(user) });
        }, 620);
      });
    },
    login: function (d) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          seedUsers();
          var s = C.store.read();
          var u = s.users.filter(function (x) { return x.email.toLowerCase() === String(d.email || "").toLowerCase(); })[0];
          if (!u || u.password !== d.password) {
            return reject({ code: "bad_credentials", message: "Email or password is incorrect." });
          }
          var p = publicUser(u);
          writeSession(p);
          resolve({ user: p });
        }, 620);
      });
    },
    logout: function () {
      writeSession(null);
    },
    currentUser: function () { return readSession(); },
    requestReset: function (email) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: true, email: email }); }, 560);
      });
    },
    updateProfile: function (patch) {
      var cur = readSession();
      if (!cur) return null;
      var s = C.store.read();
      var u = s.users.filter(function (x) { return x.id === cur.id; })[0];
      if (!u) return null;
      Object.keys(patch).forEach(function (k) { u[k] = patch[k]; });
      C.store.write();
      var p = publicUser(u);
      writeSession(p);
      return p;
    }
  };

  function publicUser(u) {
    var o = {};
    Object.keys(u).forEach(function (k) { if (k !== "password") o[k] = u[k]; });
    return o;
  }
  C.publicUser = publicUser;
  C.seedUsers = seedUsers;

  /* ----------------------------------------------------------
     route guards
     ---------------------------------------------------------- */
  C.guard = function () {
    var body = document.body;
    var page = body.getAttribute("data-page") || "";
    var need = body.getAttribute("data-role"); /* space separated */
    var user = C.Auth.currentUser();
    var isAuthPage = /^(login|register|forgot)$/.test(page);

    if (body.hasAttribute("data-protected") && !user) {
      var next = location.pathname + location.search;
      location.replace(relRoot() + "login/index.html?next=" + encodeURIComponent(next));
      return false;
    }
    if (need && user) {
      var allowed = need.split(/\s+/);
      if (allowed.indexOf(user.role) < 0 && user.role !== "admin") {
        renderDenied(page);
        return false;
      }
    }
    if (isAuthPage && user && !param("stay")) {
      location.replace(dashboardFor(user.role));
      return false;
    }
    return true;
  };

  function renderDenied(page) {
    var host = $("main") || document.body;
    host.innerHTML =
      '<section class="section"><div class="wrap wrap--narrow">' +
      '<p class="eyebrow">403 <b>·</b> Restricted</p>' +
      '<h1 class="h2" style="margin:20px 0 16px">This area is not available on your account.</h1>' +
      '<p class="lede">Your account role does not include access to this workspace. If you believe this is a mistake, contact a platform administrator.</p>' +
      '<div class="row" style="margin-top:28px"><a class="btn btn--primary" href="' + relRoot() + '"><span>Back to home</span><span class="btn__arrow">↗</span></a>' +
      '<button class="btn btn--ghost" data-action="logout"><span>Sign out</span></button></div>' +
      "</div></section>";
  }

  /* ----------------------------------------------------------
     route helpers
     ---------------------------------------------------------- */
  /* the path relative to the project root: "" at home, "explore/" one level in */
  function pathIn() {
    var p = location.pathname.replace(/\/index\.html$/, "/");
    var r = ROOT;
    /* strip the deployment prefix (e.g. /webpages/<id>/) if present */
    if (r && r !== "/" && p.indexOf(r) === 0) p = p.slice(r.length - 1);
    else if (r && r !== "/") {
      var m = p.match(/\/webpages\/[^/]+\/(.*)$/);
      if (m) p = "/" + m[1];
    }
    return p.replace(/^\//, "");
  }
  C.pathIn = pathIn;

  C.dashboardFor = function (role) {
    var root = relRoot();
    if (role === "student") return root + "students/index.html";
    if (role === "university") return root + "universities/index.html";
    if (role === "industry") return root + "industry/index.html";
    if (role === "admin") return root + "admin/index.html";
    return root + "dashboard/index.html"; /* citizens land in the unified dashboard */
  };

  /* ----------------------------------------------------------
     depth-aware relative root
     ----------------------------------------------------------
     Derived from the URL of this script rather than from the
     pathname, so it is correct on the deployed /webpages/<id>/
     path, on a local dev server at /, and in a subdirectory.
     core.js always lives at <root>assets/js/core.js.
     ---------------------------------------------------------- */
  var ROOT = (function () {
    var s = document.currentScript;
    if (!s) {
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--) {
        if (/assets\/js\/core\.js/.test(all[i].src)) { s = all[i]; break; }
      }
    }
    if (s && s.src) {
      var m = s.src.match(/^(.*?)\/assets\/js\/core\.js/);
      if (m) return m[1].replace(/\/$/, "") + "/";
    }
    /* fallback: count directory levels from the pathname */
    var p = location.pathname.replace(/\/index\.html$/, "/");
    var depth = p.split("/").filter(Boolean).length;
    if (/\/$/.test(p) && depth > 0) depth -= 1;
    return depth <= 0 ? "" : new Array(depth + 1).join("../");
  })();

  function relRoot() { return ROOT; }
  C.relRoot = relRoot;

  /* evidence paths are stored site-relative; resolve them from any depth */
  C.asset = function (p) {
    if (!p) return "";
    if (/^(https?:|data:|blob:)/.test(p)) return p;
    if (p.charAt(0) === "/" || p.indexOf("../") === 0) return p;
    return relRoot() + p;
  };

  /* ----------------------------------------------------------
     toast
     ---------------------------------------------------------- */
  C.toast = function (msg, type) {
    var stack = $(".toast-stack");
    if (!stack) {
      stack = el("div", { class: "toast-stack", role: "status", "aria-live": "polite" });
      document.body.appendChild(stack);
    }
    var t = el("div", { class: "toast" + (type ? " toast--" + type : "") }, '<span class="toast__msg">' + esc(msg) + "</span>");
    stack.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 320);
    }, 4200);
  };

  /* ----------------------------------------------------------
     modal
     ---------------------------------------------------------- */
  C.modal = {
    open: function (html, opts) {
      opts = opts || {};
      var m = $("#modal");
      if (!m) {
        m = el("div", { class: "modal", id: "modal", role: "dialog", "aria-modal": "true" });
        m.innerHTML = '<div class="modal__panel"><button class="modal__close" aria-label="Close">×</button><div class="modal__content"></div></div>';
        document.body.appendChild(m);
        m.addEventListener("click", function (e) {
          if (e.target === m || e.target.closest(".modal__close")) C.modal.close();
        });
      }
      $(".modal__content", m).innerHTML = html;
      m.classList.add("is-open");
      document.body.classList.add("is-locked");
      document.addEventListener("keydown", escClose);
      if (opts.onMount) opts.onMount($(".modal__content", m));
    },
    close: function () {
      var m = $("#modal");
      if (m) { m.classList.remove("is-open"); document.body.classList.remove("is-locked"); }
      document.removeEventListener("keydown", escClose);
    }
  };
  function escClose(e) { if (e.key === "Escape") C.modal.close(); }

  /* ----------------------------------------------------------
     reveal on scroll
     ---------------------------------------------------------- */
  C.reveals = function (root) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var els = $$(".reveal", root || document);
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (n) {
      io.observe(n);
      /* anything already in the viewport reveals immediately — never wait for an event */
      var r = n.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
        n.classList.add("is-in");
        io.unobserve(n);
      }
    });
    /* safety net: no content may stay invisible if the observer never fires */
    clearTimeout(C._revealTimer);
    C._revealTimer = setTimeout(function () {
      $$(".reveal:not(.is-in)", root || document).forEach(function (n) { n.classList.add("is-in"); });
    }, 1400);
  };

  /* ----------------------------------------------------------
     navigation shell rendering
     ---------------------------------------------------------- */
  /* primary navigation — one entry per real route.
     Paths end in index.html because this host does not serve
     directory URLs; the active-state check strips it again. */
  var NAV_MAIN = [
    ["Home", ""],
    ["Explore Problems", "explore/index.html"],
    ["Report Problem", "report/index.html"],
    ["Student Universe", "student-universe/index.html"],
    ["Universities", "universities/index.html"],
    ["Projects", "projects/index.html"]
  ];
  /* secondary links live in the footer and the mobile menu */
  var NAV_MORE = [
    ["How It Works", "how-it-works/index.html"],
    ["For Industry", "industry/index.html"],
    ["About", "about/index.html"]
  ];
  var NAV_PUBLIC = NAV_MAIN;

  /* which navigation entry is the current page */
  function isActive(href, here) {
    var h = href.replace(/index\.html$/, "");
    if (h === "") return here === "" || here === "/";
    return here.indexOf(h) === 0;
  }

  C.renderHeader = function () {
    var host = $("#siteHead");
    if (!host) return;
    var root = relRoot();
    var user = C.Auth.currentUser();
    var here = pathIn();

    var links = NAV_MAIN.map(function (l) {
      var href = root + l[1];
      var active = isActive(l[1], here) ? ' aria-current="page"' : "";
      return '<a class="nav-link" href="' + href + '"' + active + ">" + l[0] + "</a>";
    }).join("");

    var right = (user
        ? '<a class="nav-login" href="' + C.dashboardFor(user.role) + '">Dashboard</a>'
        : '<a class="nav-login" href="' + root + 'login/">Login</a>') +
      '<a class="btn btn--sm btn--primary" href="' + root + 'report/"><span>Report Problem</span><span class="btn__arrow">↗</span></a>';

    host.className = "site-head" + (host.classList.contains("is-stuck") ? " is-stuck" : "");
    host.innerHTML =
      '<div class="site-head__inner">' +
        '<a class="brand" href="' + root + '" aria-label="Catalyst home">' +
          '<span class="brand__mark">CATALYST<b>.</b></span>' +
          '<span class="brand__sub">Accelerating Change. Creating Impact.</span>' +
        "</a>" +
        '<nav class="nav-links" aria-label="Primary">' + links + "</nav>" +
        '<div class="nav-actions">' + right +
          '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span></button>' +
        "</div>" +
      "</div>";

    /* mobile menu */
    var mm = $("#mobileMenu");
    if (!mm) {
      mm = el("div", { class: "mobile-menu", id: "mobileMenu" });
      document.body.appendChild(mm);
    }
    mm.innerHTML =
      '<span class="mobile-menu__label">Platform</span>' +
      NAV_MAIN.map(function (l) {
        return '<a href="' + root + l[1] + '"' + (isActive(l[1], here) ? ' aria-current="page"' : "") + ">" + l[0] + "<span>↗</span></a>";
      }).join("") +
      '<span class="mobile-menu__label">More</span>' +
      NAV_MORE.map(function (l) {
        return '<a href="' + root + l[1] + '"' + (isActive(l[1], here) ? ' aria-current="page"' : "") + ">" + l[0] + "<span>↗</span></a>";
      }).join("") +
      (user
        ? '<a href="' + C.dashboardFor(user.role) + '">Dashboard<span>↗</span></a>' +
          '<a href="' + root + 'profile/">Profile<span>↗</span></a>' +
          '<button class="btn btn--ghost" data-action="logout"><span>Sign out</span></button>'
        : '<a href="' + root + 'login/">Login<span>↗</span></a><a href="' + root + 'register/">Register<span>↗</span></a>' +
          '<a class="btn btn--primary" href="' + root + 'report/"><span>Report Problem</span></a>');

    var toggle = $("#navToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = mm.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("is-locked", open);
      });
      mm.addEventListener("click", function (e) {
        if (e.target.closest("a") || e.target.closest("button")) {
          mm.classList.remove("is-open");
          document.body.classList.remove("is-locked");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  };

  C.renderFooter = function () {
    var host = $("#siteFoot");
    if (!host) return;
    var root = relRoot();
    host.className = "site-foot";
    host.innerHTML =
      '<div class="wrap">' +
        '<div class="site-foot__top">' +
          '<div class="site-foot__brand">' +
            '<p class="site-foot__word">CATALYST<b>.</b></p>' +
            '<p class="site-foot__tag">Accelerating Change. Creating Impact.</p>' +
            '<p class="site-foot__blurb">A societal innovation platform for turning verified community problems into structured, supervised, real-world projects.</p>' +
          "</div>" +
          '<div class="site-foot__col"><h4>Platform</h4><ul>' +
            '<li><a href="' + root + 'explore/">Explore problems</a></li>' +
            '<li><a href="' + root + 'report/">Report a problem</a></li>' +
            '<li><a href="' + root + 'projects/">Projects</a></li>' +
            '<li><a href="' + root + 'how-it-works/">How it works</a></li>' +
            '<li><a href="' + root + 'about/">About Catalyst</a></li>' +
          "</ul></div>" +
          '<div class="site-foot__col"><h4>Ecosystem</h4><ul>' +
            '<li><a href="' + root + 'student-universe/">Student universe</a></li>' +
            '<li><a href="' + root + 'universities/">Universities</a></li>' +
            '<li><a href="' + root + 'industry/">Industry partners</a></li>' +
            '<li><a href="' + root + 'register/">Create an account</a></li>' +
          "</ul></div>" +
          '<div class="site-foot__col"><h4>Access</h4><ul>' +
            '<li><a href="' + root + 'login/">Sign in</a></li>' +
            '<li><a href="' + root + 'profile/">Profile</a></li>' +
            '<li><a href="' + root + 'forgot-password/">Reset password</a></li>' +
            '<li><a href="' + root + 'admin/">Administration</a></li>' +
          "</ul></div>" +
        "</div>" +
        '<div class="site-foot__bottom">' +
          '<span>© ' + new Date().getFullYear() + " Catalyst · Prototype build</span>" +
          '<div class="row"><a href="' + root + 'about/">Mission</a><a href="' + root + 'about/#data">Data policy</a><a href="' + root + 'about/#contact">Contact</a></div>' +
        "</div>" +
      "</div>";
  };

  /* sticky header behaviour */
  C.headerScroll = function () {
    var head = $("#siteHead");
    if (!head) return;
    var on = function () {
      var y = window.scrollY || window.pageYOffset;
      head.classList.toggle("is-stuck", y > 30);
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
  };

  /* ----------------------------------------------------------
     demo / real data labelling
     ---------------------------------------------------------- */
  C.DEMO_NOTE = "Prototype data — stored in this browser only. Connect the Catalyst API to persist records server-side.";
  C.demoBadge = function (label) {
    return '<span class="badge badge--demo" title="' + esc(C.DEMO_NOTE) + '">' + esc(label || "Demo data") + "</span>";
  };

  /* ----------------------------------------------------------
     page transition — a short fade/rise on entry only.
     Cheap: one class toggle, no library, no layout thrash.
     ---------------------------------------------------------- */
  C.pageTransition = function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var main = $("#main");
    if (main) {
      main.classList.add("is-entering");
      /* next frame so the browser paints the start state */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { main.classList.remove("is-entering"); });
      });
    }
    /* fade out on internal navigation, but never block the click if it fails */
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(href)) return;
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (href.indexOf("?") === 0) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () { location.href = href; }, 150);
    });
  };

  /* ----------------------------------------------------------
     lifecycle
     ---------------------------------------------------------- */
  C.STAGES = [
    { key: "submitted", label: "Submitted" },
    { key: "ai_processed", label: "AI Processed" },
    { key: "under_review", label: "Under Review" },
    { key: "validated", label: "Validated" },
    { key: "university_matched", label: "University Matched" },
    { key: "team_formed", label: "Team Formed" },
    { key: "proposal", label: "Proposal" },
    { key: "prototype", label: "Prototype" },
    { key: "field_testing", label: "Field Testing" },
    { key: "deployment", label: "Deployment" },
    { key: "impact_measured", label: "Impact Measured" },
    { key: "completed", label: "Completed" }
  ];
  C.stageIndex = function (key) {
    for (var i = 0; i < C.STAGES.length; i++) if (C.STAGES[i].key === key) return i;
    return 0;
  };

  /* ----------------------------------------------------------
     global delegated actions
     ---------------------------------------------------------- */
  function bindGlobal() {
    document.addEventListener("click", function (e) {
      var out = e.target.closest('[data-action="logout"]');
      if (out) {
        e.preventDefault();
        C.Auth.logout();
        C.toast("Signed out of the demo session.", "ok");
        setTimeout(function () { location.href = relRoot() + "login/index.html"; }, 400);
      }
      var open = e.target.closest("[data-modal-img]");
      if (open) {
        e.preventDefault();
        C.modal.open(
          '<img class="modal__img" src="' + esc(open.getAttribute("data-modal-img")) + '" alt="' + esc(open.getAttribute("data-caption") || "Evidence image") + '">' +
          '<p class="modal__cap">' + esc(open.getAttribute("data-caption") || "") + "</p>"
        );
      }
    });
  }

  /* ----------------------------------------------------------
     boot
     ---------------------------------------------------------- */
  C.boot = function (opts) {
    opts = opts || {};
    if (opts.chrome !== false) {
      C.renderHeader();
      C.renderFooter();
      C.headerScroll();
    }
    bindGlobal();
    C.pageTransition();
    C.reveals();
    C.guard();
    if (C.pageInit) C.pageInit();
  };
})();
