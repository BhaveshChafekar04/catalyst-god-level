/* ============================================================
   CATALYST — UI construction layer
   Reusable markup builders + shared page behaviours.
   Keeps every route thin and consistent.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;
  var esc = C.esc;

  var ARROW = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.3"/></svg>';
  C.ARROW = ARROW;

  /* ----------------------------------------------------------
     primitives
     ---------------------------------------------------------- */
  C.statusClass = function (u) {
    return u === "Critical" ? "badge--crit" : u === "High" ? "badge--warn" : u === "Medium" ? "badge--info" : "badge";
  };
  C.stageLabel = function (c) { return C.STAGES[C.stageIndex(c.stage)].label; };

  /* challenge hrefs are resolved relative to the current page */
  C.chURL = function (c) {
    return C.relRoot() + "problems/index.html?id=" + encodeURIComponent(c.slug || c.id);
  };

  C.pill = function (label, cls, dot) {
    return '<span class="badge ' + (cls || "") + '">' + (dot ? "<i></i>" : "") + esc(label) + "</span>";
  };

  C.emptyState = function (o) {
    o = o || {};
    var icon = o.icon || '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg>';
    return '<div class="state' + (o.error ? " state--error" : "") + '">' +
      '<span class="state__icon" aria-hidden="true">' + icon + "</span>" +
      '<h3 class="state__title">' + esc(o.title || "Nothing here yet") + "</h3>" +
      '<p class="state__text">' + esc(o.text || "") + "</p>" +
      (o.action ? '<div style="margin-top:6px">' + o.action + "</div>" : "") +
    "</div>";
  };

  C.skeletonCards = function (n, cols) {
    var one = '<div class="skel-card"><div class="skeleton skel-card__media"></div><div class="skel-card__body">' +
      '<div class="skeleton" style="height:9px;width:32%"></div>' +
      '<div class="skeleton" style="height:15px;width:88%"></div>' +
      '<div class="skeleton" style="height:15px;width:64%"></div>' +
      '<div class="skeleton" style="height:10px;width:100%"></div>' +
      '<div class="skeleton" style="height:10px;width:72%"></div>' +
    "</div></div>";
    var out = "";
    for (var i = 0; i < (n || 6); i++) out += one;
    return '<div class="grid grid--' + (cols || 3) + '">' + out + "</div>";
  };

  /* ----------------------------------------------------------
     challenge card (grid)
     ---------------------------------------------------------- */
  C.challengeCard = function (c, opts) {
    opts = opts || {};
    var img = c.evidence && c.evidence[0] ? c.evidence[0] : null;
    var badge = opts.saved
      ? '<span class="card__saved" aria-label="Saved">★</span>'
      : "";
    return '<article class="card challenge-card' + (opts.reveal === false ? "" : " reveal") + '">' +
      '<a class="card__media" href="' + C.chURL(c) + '" aria-label="Open challenge: ' + esc(c.title) + '">' +
        (img ? '<img src="' + esc(C.asset(img.src)) + '" alt="' + esc(img.caption || "") + '" decoding="async">' :
               '<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--ink-ghost);font-size:10px;letter-spacing:.2em">NO IMAGE</div>') +
        '<span class="card__badges">' +
          '<span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span>" +
          '<span class="badge badge--outline">' + esc(c.category) + "</span>" +
        "</span>" + badge +
      "</a>" +
      '<div class="card__body">' +
        '<div class="card__toprow"><span class="micro">' + esc(c.id) + '</span><span class="micro">' + esc(c.state) + "</span></div>" +
        '<h3 class="card__title"><a href="' + C.chURL(c) + '">' + esc(c.title) + "</a></h3>" +
        '<p class="card__desc">' + esc(c.summary) + "</p>" +
        '<div class="card__skills">' + c.skills.slice(0, 3).map(function (s) {
          return '<span class="chip chip--static">' + esc(s) + "</span>";
        }).join("") + "</div>" +
        '<div class="card__foot"><span>' + esc(c.location) + "</span><span>" + esc(C.stageLabel(c)) + "</span></div>" +
      "</div>" +
    "</article>";
  };

  /* ----------------------------------------------------------
     challenge row (list)
     ---------------------------------------------------------- */
  C.challengeRow = function (c) {
    var img = c.evidence && c.evidence[0];
    return '<a class="challenge-row" href="' + C.chURL(c) + '">' +
      '<span class="challenge-row__media">' +
        (img ? '<img src="' + esc(C.asset(img.src)) + '" alt="" decoding="async">' : "") +
      "</span>" +
      '<span class="challenge-row__main">' +
        '<span class="challenge-row__meta"><span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span><span>" + esc(c.id) + "</span><span>" + esc(c.category) + "</span><span>" + esc(c.state) + "</span></span>" +
        "<h3>" + esc(c.title) + "</h3>" +
        "<p>" + esc(c.summary) + "</p>" +
      "</span>" +
      '<span class="challenge-row__side" style="text-align:right">' +
        '<span class="micro" style="display:block;margin-bottom:8px">' + esc(C.stageLabel(c)) + "</span>" +
        '<span class="micro" style="color:var(--ink-ghost)">' + esc(c.location) + "</span>" +
      "</span>" +
    "</a>";
  };

  /* ----------------------------------------------------------
     lifecycle component
     ---------------------------------------------------------- */
  C.lifecycle = function (stageKey, opts) {
    opts = opts || {};
    var cur = C.stageIndex(stageKey);
    var steps = C.STAGES.map(function (s, i) {
      var cls = i < cur ? "is-done" : i === cur ? "is-current" : "";
      return '<div class="lifecycle__step ' + cls + '">' +
        '<span class="lifecycle__node" aria-hidden="true"></span>' +
        '<span class="lifecycle__num">' + C.pad(i + 1) + "</span>" +
        '<span class="lifecycle__name">' + esc(s.label) + "</span>" +
      "</div>";
    }).join("");
    return '<div class="lifecycle' + (opts.compact ? " lifecycle--compact" : "") + '" role="list" aria-label="Project stage">' +
      steps + "</div>";
  };

  /* ----------------------------------------------------------
     dashboard shell
     ---------------------------------------------------------- */
  var ICONS = {
    grid: '<rect x="2.5" y="2.5" width="6" height="6"/><rect x="11.5" y="2.5" width="6" height="6"/><rect x="2.5" y="11.5" width="6" height="6"/><rect x="11.5" y="11.5" width="6" height="6"/>',
    search: '<circle cx="8.8" cy="8.8" r="5.6"/><path d="M13 13l4 4"/>',
    layers: '<path d="M10 2.5L17.5 6.5L10 10.5L2.5 6.5L10 2.5Z"/><path d="M2.5 10.5L10 14.5L17.5 10.5"/>',
    users: '<circle cx="7.5" cy="7" r="3"/><path d="M2.5 17c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6"/><path d="M13.5 5.2a2.6 2.6 0 010 4.9"/><path d="M14.5 12.6c2 .4 3 1.9 3 4.4"/>',
    check: '<path d="M4 10.5l4 4 8-9"/>',
    doc: '<path d="M5 2.5h7l4 4v11H5z"/><path d="M12 2.5v4h4"/><path d="M7.5 11h6M7.5 14h4"/>',
    chart: '<path d="M3 17V3"/><path d="M3 17h14"/><path d="M6.5 13.5V9M10 13.5V6M13.5 13.5v-3"/>',
    user: '<circle cx="10" cy="7" r="3.2"/><path d="M4 17.5c0-3.2 2.6-5.2 6-5.2s6 2 6 5.2"/>',
    award: '<circle cx="10" cy="8" r="4.6"/><path d="M7.2 11.6L6.2 18l3.8-2 3.8 2-1-6.4"/>',
    inbox: '<path d="M3 6.5h14v10H3z"/><path d="M3 6.5l7 5 7-5"/>',
    building: '<path d="M4 18V4h8v14"/><path d="M12 9h4v9"/><path d="M6.5 7h3M6.5 10.5h3M6.5 14h3"/>',
    flag: '<path d="M5 3v14"/><path d="M5 3h9l-1.6 3.5L14 10H5"/>',
    clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4.4l3 1.8"/>',
    star: '<path d="M10 2.6l2.3 4.9 5.2.7-3.8 3.7.9 5.3L10 14.6l-4.6 2.6.9-5.3L2.5 8.2l5.2-.7z"/>',
    logout: '<path d="M7.5 3.5H4v13h3.5"/><path d="M12 6.5L15.5 10 12 13.5"/><path d="M15.5 10H8"/>'
  };
  C.icon = function (name) {
    return '<svg viewBox="0 0 20 20" aria-hidden="true">' + (ICONS[name] || ICONS.grid) + "</svg>";
  };

  var NAVS = {
    student: [
      { label: "Overview", href: "", icon: "grid" },
      { label: "Find Opportunities", href: "opportunities/", icon: "search" },
      { label: "Activity Centre", href: "activities/", icon: "layers" },
      { label: "My Teams", href: "teams/", icon: "users" },
      { label: "My Projects", href: "projects/", icon: "check" },
      { label: "Portfolio", href: "portfolio/", icon: "award" },
      { label: "Profile", href: "profile/", icon: "user" }
    ],
    university: [
      { label: "Overview", href: "", icon: "grid" },
      { label: "Challenges", href: "challenges/", icon: "flag" },
      { label: "Teams", href: "teams/", icon: "users" },
      { label: "Projects", href: "projects/", icon: "check" },
      { label: "Profile", href: "profile/", icon: "building" }
    ],
    industry: [
      { label: "Overview", href: "", icon: "grid" },
      { label: "Opportunities", href: "opportunities/", icon: "search" },
      { label: "Projects", href: "projects/", icon: "check" },
      { label: "Partner Profile", href: "profile/", icon: "building" }
    ],
    admin: [
      { label: "Dashboard", href: "", icon: "grid" },
      { label: "Challenges", href: "challenges/", icon: "flag" },
      { label: "Projects", href: "projects/", icon: "check" },
      { label: "Users", href: "users/", icon: "users" },
      { label: "Partners", href: "partners/", icon: "building" },
      { label: "Analytics", href: "analytics/", icon: "chart" }
    ]
  };

  C.dashShell = function (o) {
    var user = C.Auth.currentUser();
    var root = C.relRoot();
    var nav = NAVS[o.role] || NAVS.student;
    var base = o.base || "";
    var path = location.pathname;
    var links = nav.map(function (n) {
      var href = base + n.href;
      var active = n.href === ""
        ? /\/$/.test(path.replace(/index\.html$/, "")) && path.indexOf("/" + o.base.split("/").filter(Boolean).pop()) > -1
        : path.indexOf("/" + n.href.replace(/\/$/, "")) > -1;
      return '<a class="dash-link" href="' + href + '"' + (active ? ' aria-current="page"' : "") + ">" +
        C.icon(n.icon) + "<span>" + esc(n.label) + "</span>" +
        (n.count ? '<span class="dash-link__count">' + n.count + "</span>" : "") +
      "</a>";
    }).join("");

    return '<div class="dash">' +
      '<div class="dash-scrim" data-scrim></div>' +
      '<aside class="dash-side" id="dashSide">' +
        '<a class="dash-side__brand" href="' + root + '">' +
          '<span class="brand__mark">CATALYST<b>.</b></span>' +
          '<span class="brand__sub">' + esc(C.ROLE_LABEL[o.role] || "") + "</span>" +
        "</a>" +
        '<nav class="dash-nav" aria-label="Workspace">' +
          '<span class="dash-nav__label">Workspace</span>' + links +
          '<span class="dash-nav__label">Public site</span>' +
          '<a class="dash-link" href="' + root + 'explore/">' + C.icon("search") + "<span>Explore challenges</span></a>" +
          '<a class="dash-link" href="' + root + 'report/">' + C.icon("flag") + "<span>Report a problem</span></a>" +
        "</nav>" +
        '<div class="dash-side__foot">' +
          '<div class="dash-user">' +
            '<span class="dash-user__av">' + esc(C.initials(user ? user.name : "Guest")) + "</span>" +
            '<span class="dash-user__meta"><span class="dash-user__name">' + esc(user ? user.name : "Not signed in") + "</span>" +
            '<span class="dash-user__role">' + esc(user ? C.ROLE_LABEL[user.role] : "Guest") + "</span></span>" +
          "</div>" +
          '<button class="dash-link" data-action="logout" style="width:100%;margin-top:4px">' + C.icon("logout") + "<span>Sign out</span></button>" +
        "</div>" +
      "</aside>" +
      '<div class="dash-main">' +
        '<div class="dash-top">' +
          '<div class="row" style="gap:12px;min-width:0">' +
            '<button class="dash-toggle" data-dash-toggle aria-label="Open navigation">' + C.icon("grid") + "<span>Menu</span></button>" +
            '<div style="min-width:0"><h1 class="dash-top__title">' + esc(o.title || "") + "</h1>" +
            (o.sub ? '<p class="dash-top__sub">' + esc(o.sub) + "</p>" : "") + "</div>" +
          "</div>" +
          '<div class="row" style="gap:10px">' +
            (o.actions || "") +
            '<a class="btn btn--sm btn--primary" href="' + root + 'report/"><span>Report</span><span class="btn__arrow">↗</span></a>' +
          "</div>" +
        "</div>" +
        '<div class="dash-body">' + (o.body || "") + "</div>" +
      "</div>" +
    "</div>";
  };

  C.mountDash = function (html) {
    var main = document.querySelector("main") || document.body;
    main.innerHTML = html;
    var side = document.getElementById("dashSide");
    var scrim = document.querySelector("[data-scrim]");
    var btn = document.querySelector("[data-dash-toggle]");
    function close() { side.classList.remove("is-open"); scrim.classList.remove("is-open"); }
    if (btn) btn.addEventListener("click", function () {
      side.classList.toggle("is-open"); scrim.classList.toggle("is-open");
    });
    if (scrim) scrim.addEventListener("click", close);
    C.reveals(main);
  };

  /* ----------------------------------------------------------
     challenge detail renderer (shared by public + portals)
     ---------------------------------------------------------- */
  C.challengeDetail = function (c, opts) {
    opts = opts || {};
    var root = C.relRoot();
    var user = C.Auth.currentUser();
    var saved = C.Data.savedIds().indexOf(c.id) >= 0;
    var interest = C.Data.interestFor(c.id);
    var evid = c.evidence || [];

    return '<section class="cd">' +
      '<div class="wrap">' +
        '<div class="cd__top">' +
          '<div class="cd__meta">' +
            '<span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + " priority</span>" +
            '<span class="badge badge--outline">' + esc(c.category) + "</span>" +
            '<span class="badge">' + esc(c.id) + "</span>" +
            '<span class="badge badge--' + (c.status === "validated" ? "ok" : c.status === "under_review" ? "warn" : "info") + '">' + esc(c.status.replace("_", " ")) + "</span>" +
          "</div>" +
          "<h1 class=\"cd__title\">" + esc(c.title) + "</h1>" +
          '<p class="cd__lede">' + esc(c.summary) + "</p>" +
          '<div class="cd__loc">' +
            '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s5-4.4 5-8A5 5 0 003 6c0 3.6 5 8 5 8z" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="6" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>' +
            esc(c.location) +
            '<span class="cd__loc-sep">·</span> Reported ' + C.fmtDate(c.reported) +
            '<span class="cd__loc-sep">·</span> ' + esc(c.population) +
          "</div>" +
        "</div>" +

        '<div class="cd__layout">' +
          '<div class="cd__main">' +

            '<section class="cd__block">' +
              '<h2 class="cd__h">Problem statement</h2>' +
              '<p class="cd__p">' + esc(c.background) + "</p>" +
            "</section>" +

            (evid.length ?
            '<section class="cd__block">' +
              '<div class="cd__h-row"><h2 class="cd__h">Evidence</h2><span class="micro">' + evid.length + " file" + (evid.length > 1 ? "s" : "") + "</span></div>" +
              '<div class="cd__gallery">' +
                evid.map(function (e, i) {
                  return '<button class="cd__shot" data-modal-img="' + esc(C.asset(e.src)) + '" data-caption="' + esc(e.caption || "") + '" aria-label="View evidence ' + (i + 1) + '">' +
                    '<img src="' + esc(C.asset(e.src)) + '" alt="' + esc(e.caption || "Evidence " + (i + 1)) + '" loading="lazy">' +
                    '<span class="cd__shot-cap">' + esc(e.caption || "") + "</span>" +
                  "</button>";
                }).join("") +
              "</div>" +
              '<p class="cd__note">Photographs were supplied by the reporter and are shown as submitted. Catalyst has not independently authenticated them.</p>' +
            "</section>" : "") +

            '<section class="cd__block">' +
              '<div class="cd__h-row"><h2 class="cd__h">AI initial assessment</h2><span class="badge badge--demo">AI-generated · needs human validation</span></div>' +
              '<div class="cd__ai">' +
                '<div class="cd__ai-grid">' +
                  '<div><p class="micro">Suggested category</p><p class="cd__ai-v">' + esc(c.ai.category) + "</p></div>" +
                  '<div><p class="micro">Initial severity</p><p class="cd__ai-v">' + esc(c.ai.severity) + "</p></div>" +
                  '<div><p class="micro">Estimated reach</p><p class="cd__ai-v">' + esc(c.ai.impact) + "</p></div>" +
                  '<div><p class="micro">Confidence</p><p class="cd__ai-v">' + c.ai.confidence + "%</p></div>" +
                "</div>" +
                '<p class="cd__p" style="margin-top:16px">' + esc(c.ai.summary) + "</p>" +
                '<div class="cd__ai-skills"><span class="micro">Likely expertise</span><div class="row row--wrap" style="gap:6px;margin-top:8px">' +
                  c.ai.skills.map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") +
                "</div></div>" +
                (c.ai.duplicates && c.ai.duplicates.length ?
                  '<p class="cd__note cd__note--warn">Possible duplicate of ' + c.ai.duplicates.map(function (d) {
                    var dup = C.Data.allChallenges().filter(function (x) { return x.id === d; })[0];
                    return dup ? '<a href="' + C.chURL(dup) + '">' + esc(d) + "</a>" : esc(d);
                  }).join(", ") + " — flagged for moderator review, not confirmed.</p>" : "") +
              "</div>" +
            "</section>" +

            '<section class="cd__block">' +
              '<h2 class="cd__h">Required capability</h2>' +
              '<div class="cd__cols">' +
                '<div><p class="micro">Skills</p><ul class="cd__ul">' + c.skills.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
                '<div><p class="micro">Disciplines</p><ul class="cd__ul">' + c.disciplines.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
                (c.equipment.length ? '<div><p class="micro">Equipment</p><ul class="cd__ul">' + c.equipment.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" : "") +
                (c.researchAreas.length ? '<div><p class="micro">Research areas</p><ul class="cd__ul">' + c.researchAreas.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" : "") +
              "</div>" +
            "</section>" +

            (c.recommendations && c.recommendations.length ?
            '<section class="cd__block">' +
              '<div class="cd__h-row"><h2 class="cd__h">Suggested university matches</h2><span class="badge">Suggestions only — not confirmed</span></div>' +
              '<ul class="cd__recs">' + c.recommendations.map(function (r) {
                return '<li><p class="cd__rec-name">' + esc(r.name) + "</p><p class=\"cd__rec-why\">" + esc(r.reason) + '</p><span class="badge badge--outline">Invitation not yet accepted</span></li>';
              }).join("") + "</ul>" +
            "</section>" : "") +

            '<section class="cd__block">' +
              '<h2 class="cd__h">Progress</h2>' +
              '<ol class="cd__timeline">' + c.progress.map(function (p, i) {
                return '<li' + (i === c.progress.length - 1 ? ' class="is-last"' : "") + '><span class="cd__tdot"></span>' +
                  '<div><p class="cd__t-text">' + esc(p.text) + '</p><span class="cd__t-date">' + C.fmtDate(p.date) + "</span></div></li>";
              }).join("") + "</ol>" +
            "</section>" +

            (c.related && c.related.length ?
            '<section class="cd__block">' +
              '<h2 class="cd__h">Related challenges</h2>' +
              '<div class="cd__related">' + c.related.map(function (id) {
                var r = C.Data.allChallenges().filter(function (x) { return x.id === id; })[0];
                if (!r) return "";
                return '<a class="cd__rel" href="' + C.chURL(r) + '"><span class="micro">' + esc(r.id) + "</span><p>" + esc(r.title) + '</p><span class="micro">' + esc(r.location) + "</span></a>";
              }).join("") + "</div>" +
            "</section>" : "") +

          "</div>" +

          '<aside class="cd__side">' +
            '<div class="cd__panel">' +
              '<p class="micro">Current stage</p>' +
              '<p class="cd__stage">' + esc(C.stageLabel(c)) + "</p>" +
              C.lifecycle(c.stage) +
            "</div>" +

            '<div class="cd__panel">' +
              '<p class="micro">Participation</p>' +
              '<div class="cd__stat-row"><span>' + c.interest + "</span><small>expressed interest</small></div>" +
              '<div class="cd__stat-row"><span>' + (c.teamSize || 0) + "</span><small>on the project team</small></div>" +
              (c.openRoles && c.openRoles.length ? '<div style="margin-top:14px"><p class="micro" style="margin-bottom:8px">Open roles</p><div class="row row--wrap" style="gap:6px">' +
                c.openRoles.map(function (r) { return '<span class="chip chip--static">' + esc(r) + "</span>"; }).join("") + "</div></div>" : "") +
              '<div class="cd__actions">' +
                (interest
                  ? '<div class="cd__interest"><span class="badge badge--ok"><i></i>Interest submitted</span><small>Status: awaiting review · ' + C.fmtDate(interest.at) + "</small></div>"
                  : '<button class="btn btn--primary btn--block" data-interest="' + esc(c.id) + '"><span>' + (user ? "Apply to join" : "Sign in to apply") + '</span><span class="btn__arrow">↗</span></button>') +
                '<button class="btn btn--ghost btn--block" data-save="' + esc(c.id) + '" data-saved="' + (saved ? "1" : "0") + '"><span>' + (saved ? "★ Saved" : "☆ Save challenge") + "</span></button>" +
              "</div>" +
              '<p class="cd__fine">Applying creates a request for review. It does not confirm a place on the team.</p>' +
            "</div>" +

            '<div class="cd__panel">' +
              '<p class="micro">Reported by</p>' +
              '<p class="cd__reporter">' + esc(c.reporter) + "</p>" +
              '<p class="cd__fine">' + esc(C.ROLE_LABEL[c.reporterRole] || c.reporterRole) + "</p>" +
              '<div class="divider" style="margin:14px 0"></div>' +
              '<p class="micro">Population affected</p>' +
              '<p class="cd__reporter" style="font-size:13px">' + esc(c.population) + "</p>" +
            "</div>" +

            '<div class="cd__panel cd__panel--quiet">' +
              '<p class="micro">Prototype notice</p>' +
              '<p class="cd__fine">This challenge record is demonstration data. Nothing here represents a verified real-world condition, and no university or agency has accepted it.</p>' +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</div>" +
    "</section>";
  };

  /* bind the interest / save buttons inside a detail view */
  C.bindChallengeActions = function (root) {
    C.$$("[data-save]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!C.Auth.currentUser()) {
          C.toast("Sign in to save challenges.", "err");
          setTimeout(function () { location.href = C.relRoot() + "login/?next=" + encodeURIComponent(location.pathname); }, 700);
          return;
        }
        var id = b.getAttribute("data-save");
        var on = b.getAttribute("data-saved") !== "1";
        C.Data.saveChallenge(id, on).then(function () {
          b.setAttribute("data-saved", on ? "1" : "0");
          b.querySelector("span").textContent = on ? "★ Saved" : "☆ Save challenge";
          C.toast(on ? "Challenge saved." : "Removed from saved.", "ok");
        });
      });
    });

    C.$$("[data-interest]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-interest");
        if (!C.Auth.currentUser()) {
          C.toast("Sign in to express interest.", "err");
          setTimeout(function () { location.href = C.relRoot() + "login/?next=" + encodeURIComponent(location.pathname); }, 700);
          return;
        }
        C.modal.open(
          '<div class="apply">' +
            '<h2 class="h3" style="margin-bottom:8px">Express interest</h2>' +
            '<p class="small" style="margin-bottom:20px">Tell the review team what you would contribute. Applications are reviewed by a moderator and a faculty supervisor — this does not reserve a place.</p>' +
            '<div class="field"><label for="applyNote">Your contribution</label>' +
              '<textarea id="applyNote" placeholder="e.g. I can run the water sampling protocol and build the analysis notebook. Available 6 hrs/week for 10 weeks."></textarea>' +
              '<span class="field__err">Add at least 20 characters.</span></div>' +
            '<div class="row" style="margin-top:18px;gap:10px">' +
              '<button class="btn btn--primary" data-apply-submit="' + esc(id) + '"><span>Submit interest</span><span class="btn__arrow">↗</span></button>' +
              '<button class="btn btn--ghost" data-modal-close><span>Cancel</span></button>' +
            "</div>" +
          "</div>",
          {
            onMount: function (m) {
              m.addEventListener("click", function (e) {
                if (e.target.closest("[data-modal-close]")) C.modal.close();
                var sub = e.target.closest("[data-apply-submit]");
                if (!sub) return;
                var ta = m.querySelector("#applyNote");
                var val = ta.value.trim();
                if (val.length < 20) { ta.closest(".field").classList.add("is-invalid"); ta.focus(); return; }
                sub.classList.add("is-busy");
                sub.querySelector("span").textContent = "Submitting…";
                C.Data.expressInterest(id, val).then(function () {
                  C.modal.close();
                  C.toast("Interest submitted — awaiting review.", "ok");
                  setTimeout(function () { location.reload(); }, 700);
                }).catch(function (err) {
                  C.modal.close();
                  C.toast(err.message || "Could not submit interest.", "err");
                });
              });
            }
          }
        );
      });
    });
  };

  /* ----------------------------------------------------------
     generic form validation
     ---------------------------------------------------------- */
  C.validate = function (form) {
    var ok = true;
    C.$$("[required]", form).forEach(function (inp) {
      var f = inp.closest(".field");
      if (!f) return;
      var v = (inp.value || "").trim();
      var bad = !v;
      if (!bad && inp.type === "email") bad = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v);
      if (!bad && inp.type === "password") bad = v.length < 8;
      if (!bad && inp.type === "checkbox") bad = !inp.checked;
      f.classList.toggle("is-invalid", bad);
      if (bad) {
        ok = false;
        var msg = f.querySelector(".field__err");
        if (msg && inp.type === "email") msg.textContent = "Enter a valid email address.";
        else if (msg && inp.type === "password") msg.textContent = "Use at least 8 characters.";
        else if (msg && inp.type === "checkbox") msg.textContent = "Please confirm to continue.";
      }
    });
    if (!ok) {
      var first = form.querySelector(".is-invalid input, .is-invalid textarea, .is-invalid select");
      if (first) first.focus();
    }
    return ok;
  };
  C.clearErrors = function (form) {
    C.$$(".is-invalid", form).forEach(function (n) { n.classList.remove("is-invalid"); });
  };

  /* password reveal toggle */
  C.bindPasswordToggles = function (root) {
    C.$$("[data-pw-toggle]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = b.parentElement.querySelector("input");
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.setAttribute("aria-label", show ? "Hide password" : "Show password");
        b.classList.toggle("is-on", show);
      });
    });
  };

  /* ----------------------------------------------------------
     image upload control
     ---------------------------------------------------------- */
  C.imageUploader = function (opts) {
    var state = { photos: [], max: opts.max || 6 };
    var host = opts.host;

    host.innerHTML =
      '<div class="drop" data-drop>' +
        '<span class="drop__icon">' + C.icon("inbox") + "</span>" +
        '<p class="drop__title">' + esc(opts.title || "Add photographs") + "</p>" +
        '<p class="drop__sub">' + esc(opts.sub || "JPG, PNG or WebP · up to 8 MB each · drag and drop or browse") + "</p>" +
        '<input type="file" accept="image/*" multiple data-input aria-label="Choose photographs">' +
      "</div>" +
      '<div class="thumbs" data-thumbs></div>' +
      '<p class="field__hint" data-count style="margin-top:8px">No photos attached yet.</p>' +
      '<p class="field__err" data-err>Add at least one photograph so reviewers can verify the conditions described.</p>';

    var input = host.querySelector("[data-input]");
    var drop = host.querySelector("[data-drop]");
    var thumbs = host.querySelector("[data-thumbs]");
    var count = host.querySelector("[data-count]");

    function render() {
      thumbs.innerHTML = state.photos.map(function (p, i) {
        return '<div class="thumb">' +
          '<img src="' + p.dataUrl + '" alt="">' +
          '<button type="button" class="thumb__x" data-rm="' + p.id + '" aria-label="Remove photo ' + (i + 1) + '">×</button>' +
          '<span class="thumb__n">IMG ' + C.pad(i + 1) + "</span>" +
          '<span class="thumb__prog"><i style="width:' + (p.done ? 100 : 35) + '%"></i></span>' +
        "</div>";
      }).join("");
      count.textContent = state.photos.length
        ? state.photos.length + (state.photos.length === 1 ? " photo attached." : " photos attached.")
        : "No photos attached yet.";
      count.style.color = state.photos.length ? "var(--ink-dim)" : "";
      if (opts.onChange) opts.onChange(state.photos);
    }

    function add(files) {
      Array.prototype.slice.call(files).forEach(function (f) {
        if (!/^image\//.test(f.type)) { C.toast("Only image files are accepted.", "err"); return; }
        if (f.size > 8 * 1024 * 1024) { C.toast("“" + f.name + "” is over 8 MB.", "err"); return; }
        if (state.photos.length >= state.max) { C.toast("You can attach up to " + state.max + " photos.", "err"); return; }
        var reader = new FileReader();
        reader.onload = function (e) {
          state.photos.push({ id: "p" + Date.now() + Math.random().toString(36).slice(2, 6), name: f.name, size: f.size, dataUrl: e.target.result, done: true });
          render();
        };
        reader.readAsDataURL(f);
      });
    }

    input.addEventListener("change", function (e) { add(e.target.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); });
    });
    drop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files);
    });
    thumbs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rm]");
      if (!b) return;
      state.photos = state.photos.filter(function (p) { return p.id !== b.getAttribute("data-rm"); });
      render();
    });

    render();
    return {
      photos: function () { return state.photos; },
      count: function () { return state.photos.length; },
      requireOne: function () {
        var err = host.querySelector("[data-err]");
        var bad = state.photos.length === 0;
        err.style.display = bad ? "block" : "none";
        return !bad;
      }
    };
  };

  /* ----------------------------------------------------------
     small helpers used across pages
     ---------------------------------------------------------- */
  C.sectionHead = function (label, title, lede) {
    return '<div class="reveal" style="margin-bottom:clamp(24px,4vw,40px)">' +
      '<p class="eyebrow">' + label + "</p>" +
      '<h2 class="h2" style="margin:16px 0 12px">' + title + "</h2>" +
      (lede ? '<p class="lede">' + lede + "</p>" : "") +
    "</div>";
  };

  C.kv = function (rows) {
    return '<dl class="kv">' + rows.map(function (r) {
      return "<dt>" + esc(r[0]) + "</dt><dd>" + r[1] + "</dd>";
    }).join("") + "</dl>";
  };

  C.people = function (list) {
    return list.map(function (p, i) {
      return '<span class="av' + (i === 0 ? " av--amber" : "") + '" title="' + esc(p.name) + '"' + (i ? ' style="margin-left:-8px;border-color:#0a0a0a"' : "") + ">" + esc(C.initials(p.name)) + "</span>";
    }).join("");
  };
})();
