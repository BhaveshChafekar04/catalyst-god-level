/* ============================================================
   CATALYST — application pages
   problem detail · projects · student universe · dashboard · profile
   Every view reads from C.Data. Nothing here invents a record.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;
  var esc = C.esc;
  C.pages = C.pages || {};

  function root() { return C.relRoot(); }
  function user() { return C.Auth.currentUser(); }

  /* a sign-in gate used by the two account pages */
  function gate(title, lede) {
    return '<section class="page-hero page-hero--slim">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">Account required <b>·</b> Sign in</p>' +
          '<h1 class="h1">' + esc(title) + "</h1>" +
          '<p class="lede">' + esc(lede) + "</p>" +
        "</div>" +
      "</section>" +
      '<section class="section section--flush"><div class="wrap wrap--narrow">' +
        '<div class="note note--info" style="margin-bottom:26px"><b>This page needs a session.</b> ' +
          "Catalyst has no identity server in this build, so accounts live in this browser only. " +
          "Sign in with a demo account to see the workspace, or create one — either way the role shown is a client-side demo value." +
        "</div>" +
        '<div class="panel">' +
          '<p class="micro" style="margin-bottom:12px">Demo accounts · password <code>demo1234</code></p>' +
          '<ul class="cd__ul" style="font-size:12.5px">' +
            "<li><code>student@catalyst.demo</code> — student workspace</li>" +
            "<li><code>faculty@catalyst.demo</code> — university workspace</li>" +
            "<li><code>industry@catalyst.demo</code> — industry workspace</li>" +
            "<li><code>citizen@catalyst.demo</code> — citizen reporter</li>" +
            "<li><code>admin@catalyst.demo</code> — administrator</li>" +
          "</ul>" +
        "</div>" +
        '<div class="row row--wrap" style="margin-top:26px;gap:10px">' +
          '<a class="btn btn--primary" href="' + root() + 'login/index.html?next=' + encodeURIComponent(location.pathname) + '"><span>Sign in</span><span class="btn__arrow">↗</span></a>' +
          '<a class="btn btn--ghost" href="' + root() + 'register/"><span>Create an account</span></a>' +
        "</div>" +
      "</div></section>";
  }

  /* ==========================================================
     PROBLEM DETAIL  (/problems/?id=)
     Reuses C.challengeDetail so the record renders identically
     to the previous /challenges/ route.
     ========================================================== */
  C.pages.problem = function () {
    var main = document.getElementById("main");
    main.innerHTML = '<div class="wrap" style="padding-top:calc(var(--nav-h) + 60px)">' + C.skeletonCards(2, 2) + "</div>";

    var parts = location.pathname.replace(/\/index\.html$/, "").split("/").filter(Boolean);
    var slug = C.param("id") || parts[parts.length - 1] || "";

    C.Data.getChallenge(slug).then(function (c) {
      document.title = c.title + " — CATALYST";
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", c.summary);
      main.innerHTML =
        '<div class="breadcrumbs" style="max-width:var(--maxw);margin:0 auto;padding-left:var(--pad);padding-right:var(--pad)">' +
          '<a href="' + root() + '">Home</a><span class="sep">/</span>' +
          '<a href="' + root() + 'explore/">Problems</a><span class="sep">/</span>' +
          '<span style="color:var(--ink-dim)">' + esc(c.id) + "</span>" +
        "</div>" +
        C.challengeDetail(c);
      C.bindChallengeActions(main);
    }).catch(function () {
      main.innerHTML = '<div class="nf"><div>' +
        '<p class="nf__code">404</p>' +
        '<h1 class="h2">That problem is not on the board.</h1>' +
        '<p class="lede" style="margin:16px auto 26px">The reference may be mistyped, or the report may have been withdrawn. The board shows every live problem.</p>' +
        '<div class="row" style="justify-content:center;gap:10px">' +
          '<a class="btn btn--primary" href="' + root() + 'explore/"><span>Explore problems</span><span class="btn__arrow">↗</span></a>' +
          '<a class="btn btn--ghost" href="' + root() + 'report/"><span>Report a problem</span></a>' +
        "</div></div></div>";
    });
  };

  /* ==========================================================
     PROJECTS  (/projects/)
     ========================================================== */
  C.pages.projects = function () {
    var main = document.getElementById("main");
    main.innerHTML = '<div class="wrap" style="padding-top:calc(var(--nav-h) + 60px)">' + C.skeletonCards(3, 3) + "</div>";

    C.Data.listProjects().then(function (projects) {
      var all = C.Data.allChallenges();
      var byStage = {};
      projects.forEach(function (p) { byStage[p.stage] = (byStage[p.stage] || 0) + 1; });

      var cards = projects.map(function (p) {
        var ch = all.filter(function (c) { return c.id === p.challengeId; })[0];
        var done = p.milestones.filter(function (m) { return m.status === "done"; }).length;
        var pct = Math.round((done / p.milestones.length) * 100);
        return '<article class="card reveal" style="display:flex;flex-direction:column">' +
          '<div class="card__body" style="flex:1;display:flex;flex-direction:column;gap:12px">' +
            '<div class="card__toprow"><span class="micro">' + esc(p.id) + '</span><span class="micro">' + esc(C.STAGES[C.stageIndex(p.stage)].label) + "</span></div>" +
            '<h3 class="card__title" style="font-size:clamp(15px,1.5vw,19px)">' + esc(p.title) + "</h3>" +
            '<p class="card__desc">' + esc(p.summary) + "</p>" +
            '<div class="row row--wrap" style="gap:6px">' +
              '<span class="chip chip--static">' + esc(p.university) + "</span>" +
              '<span class="chip chip--static">' + p.team.length + " members</span>" +
            "</div>" +
            '<div style="margin-top:auto">' +
              '<div class="row row--between" style="margin-bottom:6px"><span class="micro">Milestones</span><span class="micro">' + done + "/" + p.milestones.length + "</span></div>" +
              '<div class="bar"><span class="bar__t"><i style="transform:scaleX(' + (pct / 100) + ')"></i></span></div>' +
            "</div>" +
            '<div class="card__foot" style="border-top:1px solid var(--line);padding-top:12px">' +
              "<span>" + esc(p.mentor) + "</span>" +
              (ch ? '<a href="' + C.chURL(ch) + '" style="color:var(--amber)">Problem ↗</a>' : "<span>—</span>") +
            "</div>" +
          "</div>" +
        "</article>";
      }).join("");

      main.innerHTML =
        '<section class="page-hero">' +
          '<div class="page-hero__grid" aria-hidden="true"></div>' +
          '<div class="page-hero__inner">' +
            '<p class="eyebrow">Projects <b>·</b> Work in progress</p>' +
            '<h1 class="h1">Problems<br>under work.</h1>' +
            '<p class="lede">Every project below is attached to a challenge record on the board. Stage, milestones and impact state are shown as recorded — including the ones that have not produced a result yet.</p>' +
            '<div class="page-hero__meta">' +
              '<span class="badge badge--demo">Demo records</span>' +
              '<span class="badge">' + projects.length + " projects</span>" +
              '<span class="badge badge--outline">Impact shown only where measured</span>' +
            "</div>" +
          "</div>" +
        "</section>" +
        '<section class="section section--flush"><div class="wrap">' +
          '<div class="stat-row reveal" style="margin-bottom:clamp(28px,4vw,44px)">' +
            '<div class="stat-cell"><span class="stat-cell__v">' + projects.length + '</span><span class="stat-cell__k">Active projects</span></div>' +
            '<div class="stat-cell"><span class="stat-cell__v">' + (byStage.prototype || 0) + '</span><span class="stat-cell__k">In prototype</span></div>' +
            '<div class="stat-cell"><span class="stat-cell__v">' + (byStage.field_testing || 0) + '</span><span class="stat-cell__k">Field testing</span></div>' +
            '<div class="stat-cell"><span class="stat-cell__v">0</span><span class="stat-cell__k">Verified impact</span></div>' +
          "</div>" +
          '<div class="grid grid--3">' + cards + "</div>" +
          '<div class="note" style="margin-top:34px"><b>On verified impact.</b> No project in this build has completed a measurement cycle, so the verified-impact count is zero. Planned reach is shown on each record and is not the same thing as a measured outcome.</div>' +
        "</div></section>";

      C.reveals(main);
    }).catch(function () {
      main.innerHTML = '<div class="wrap" style="padding-top:calc(var(--nav-h) + 60px)">' +
        C.emptyState({ error: true, title: "Projects did not load", text: "This is a data-layer error, not an empty list." }) + "</div>";
    });
  };

  /* ==========================================================
     STUDENT UNIVERSE  (/student-universe/)
     A public explainer + entry point. The working student
     workspace lives behind auth at /students/.
     ========================================================== */
  C.pages.studentUniverse = function () {
    var main = document.getElementById("main");
    var u = user();
    var isStudent = u && u.role === "student";

    var tracks = [
      ["Problem research", "Root-cause analysis, stakeholder mapping and a written problem statement a supervisor can challenge.", "Research · Analysis"],
      ["Field validation", "Surveys, interviews and site measurement that confirm — or contradict — the reported condition.", "Field work · Social science"],
      ["Prototype build", "Software, hardware or process. The smallest thing that can test the core assumption.", "Engineering · Design"],
      ["Testing and evaluation", "Measured against the baseline set in the proposal, including results that did not work.", "Evaluation · Data"],
      ["Documentation and impact", "A record of what was built, what it cost and what changed — reviewed before it counts.", "Writing · Measurement"]
    ];

    main.innerHTML =
      '<section class="page-hero">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">Student universe <b>·</b> For students</p>' +
          '<h1 class="h1">A portfolio built<br>on problems<br>that are real.</h1>' +
          '<p class="lede">Coursework proves you can follow a brief. A Catalyst project proves you can find the brief, argue for a scope, work with a community and defend a result to a mentor.</p>' +
          '<div class="page-hero__meta">' +
            '<span class="badge">Supervised work</span>' +
            '<span class="badge">Multidisciplinary teams</span>' +
            '<span class="badge badge--outline">Verified contributions</span>' +
          "</div>" +
          '<div class="row row--wrap" style="margin-top:30px;gap:10px">' +
            (isStudent
              ? '<a class="btn btn--primary" href="' + root() + 'students/"><span>Open my workspace</span><span class="btn__arrow">↗</span></a>'
              : '<a class="btn btn--primary" href="' + root() + 'login/index.html?next=' + encodeURIComponent(root() + "students/index.html") + '"><span>Sign in as a student</span><span class="btn__arrow">↗</span></a>') +
            '<a class="btn btn--ghost" href="' + root() + 'explore/"><span>Browse open problems</span><span class="btn__arrow">↗</span></a>' +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="section section--flush"><div class="wrap">' +
        '<div class="split">' +
          '<div class="reveal">' +
            '<p class="eyebrow">What you actually do</p>' +
            '<h2 class="h2" style="margin:18px 0 18px">Five kinds of work.</h2>' +
            '<p class="lede">Every activity is attached to a named challenge with a real location and an affected population. None of it is a course, and none of it is a certificate.</p>' +
          "</div>" +
          '<div class="reveal">' +
            '<div class="note note--info"><b>What this is not.</b> Catalyst does not guarantee placements, funding, academic credit or employment. Recognition appears only where an institution has explicitly configured and approved it.</div>' +
          "</div>" +
        "</div>" +
        '<div class="cs__list" style="margin-top:clamp(28px,4vw,44px)">' +
          tracks.map(function (t, i) {
            return '<div class="cs__item"><span class="cs__n">' + C.pad(i + 1) + "</span>" +
              "<div><b>" + esc(t[0]) + "</b><p>" + esc(t[1]) + "</p>" +
              '<span class="chip chip--static" style="margin-top:10px;display:inline-block">' + esc(t[2]) + "</span></div></div>";
          }).join("") +
        "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
        '<div class="split">' +
          '<div class="reveal">' +
            '<p class="eyebrow">The workspace</p>' +
            '<h2 class="h2" style="margin:18px 0 18px">What is behind the login.</h2>' +
            '<p class="lede">The student workspace is a real set of screens reading from the same challenge records as the public board. It is built; the data behind it is demo data.</p>' +
            '<div class="row row--wrap" style="margin-top:24px;gap:10px">' +
              '<a class="btn btn--primary" href="' + root() + 'students/"><span>Student hub</span><span class="btn__arrow">↗</span></a>' +
              '<a class="btn btn--ghost" href="' + root() + 'students/opportunities/"><span>Opportunities</span></a>' +
            "</div>" +
          "</div>" +
          '<div class="reveal">' +
            '<div class="panel">' +
              '<p class="micro" style="margin-bottom:14px">Screens in the workspace</p>' +
              '<ul class="cd__ul" style="font-size:12.5px;gap:9px">' +
                "<li>Overview — recommendations, active projects, pending actions</li>" +
                "<li>Find opportunities — filterable by domain, skill and commitment</li>" +
                "<li>Activity centre — scoped tasks with deliverables and review status</li>" +
                "<li>My teams — members, missing skills, task board</li>" +
                "<li>My projects — milestones, deliverables, mentor feedback</li>" +
                "<li>Portfolio — self-reported vs mentor-verified contributions</li>" +
                "<li>Profile — branch, year, skills, domains, availability</li>" +
              "</ul>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div></section>" +

      '<section class="cta-band"><div class="wrap cta-band__inner reveal">' +
        '<p class="eyebrow eyebrow--center">Start here</p>' +
        '<h2 class="h2 cta-band__title">Pick a problem.<br><span class="amber">Then earn the result.</span></h2>' +
        '<p class="lede cta-band__sub">Applications are reviewed by a moderator and a faculty supervisor. A place on a team is a decision, not an entitlement.</p>' +
        '<div class="cta-band__actions">' +
          '<a class="btn btn--solid btn--lg" href="' + root() + 'explore/"><span>Explore problems</span><span class="btn__arrow">↗</span></a>' +
          '<a class="btn btn--lg" href="' + root() + 'register/"><span>Create an account</span><span class="btn__arrow">↗</span></a>' +
        "</div>" +
      "</div></section>";

    C.reveals(main);
  };

  /* ==========================================================
     DASHBOARD  (/dashboard/)
     ========================================================== */
  C.pages.dashboard = function () {
    var main = document.getElementById("main");
    var u = user();

    if (!u) {
      main.innerHTML = gate("Your workspace.", "Reports you filed, applications you submitted and challenges you saved — all in one place.");
      return;
    }

    var saved = C.Data.savedIds();
    var all = C.Data.allChallenges();
    var mine = all.filter(function (c) { return c.reporter === u.name; });
    var interests = all.filter(function (c) { return C.Data.interestFor(c.id); });

    var savedCards = saved.map(function (id) {
      var c = all.filter(function (x) { return x.id === id; })[0];
      return c ? C.challengeCard(c) : "";
    }).join("");

    main.innerHTML =
      '<section class="page-hero page-hero--slim">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">Dashboard <b>·</b> ' + esc(C.ROLE_LABEL[u.role] || "Member") + "</p>" +
          '<h1 class="h1">Welcome back,<br>' + esc((u.name || "").split(" ")[0]) + ".</h1>" +
          '<p class="lede">Your reports, applications and saved problems. Everything here is stored in this browser only — there is no server behind it yet.</p>' +
          '<div class="page-hero__meta">' +
            '<span class="badge badge--demo">Local session</span>' +
            '<span class="badge badge--outline">' + esc(u.email) + "</span>" +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="section section--flush"><div class="wrap">' +
        '<div class="stat-row reveal" style="margin-bottom:clamp(28px,4vw,44px)">' +
          '<div class="stat-cell"><span class="stat-cell__v">' + mine.length + '</span><span class="stat-cell__k">Reports filed</span></div>' +
          '<div class="stat-cell"><span class="stat-cell__v">' + interests.length + '</span><span class="stat-cell__k">Applications</span></div>' +
          '<div class="stat-cell"><span class="stat-cell__v">' + saved.length + '</span><span class="stat-cell__k">Saved problems</span></div>' +
          '<div class="stat-cell"><span class="stat-cell__v">0</span><span class="stat-cell__k">Verified contributions</span></div>' +
        "</div>" +

        '<div class="row row--between" style="margin-bottom:18px;align-items:flex-end">' +
          '<h2 class="h4" style="margin:0">Saved problems</h2>' +
          '<a class="link-arrow" href="' + root() + 'explore/">Explore more</a>' +
        "</div>" +
        (savedCards
          ? '<div class="grid grid--3">' + savedCards + "</div>"
          : C.emptyState({
              title: "Nothing saved yet",
              text: "Save a problem from the board and it will appear here. Saving requires a session.",
              action: '<a class="btn btn--ghost btn--sm" href="' + root() + 'explore/"><span>Browse the board</span></a>'
            })) +

        '<div class="row row--between" style="margin:clamp(34px,5vw,52px) 0 18px;align-items:flex-end">' +
          '<h2 class="h4" style="margin:0">My applications</h2>' +
        "</div>" +
        (interests.length
          ? '<div class="panel"><ul class="cd__ul" style="font-size:12.5px;gap:12px">' + interests.map(function (c) {
              var i = C.Data.interestFor(c.id);
              return "<li><a href=\"" + C.chURL(c) + "\" style=\"color:var(--amber)\">" + esc(c.title) + "</a> — awaiting review · " + C.fmtDate(i.at) + "</li>";
            }).join("") + "</ul></div>"
          : C.emptyState({ title: "No applications yet", text: "Express interest on a problem to start an application. It is reviewed before a place is offered." })) +

        '<div class="note" style="margin-top:34px"><b>Where the real workspace lives.</b> Role-specific workspaces are separate: ' +
          '<a href="' + root() + 'students/" style="color:var(--amber)">students</a>, ' +
          '<a href="' + root() + 'universities/" style="color:var(--amber)">universities</a>, ' +
          '<a href="' + root() + 'industry/" style="color:var(--amber)">industry</a>, ' +
          '<a href="' + root() + 'admin/" style="color:var(--amber)">administration</a>. ' +
          "This page is the shared summary across them.</div>" +
      "</div></section>";

    C.reveals(main);
  };

  /* ==========================================================
     PROFILE  (/profile/)
     ========================================================== */
  C.pages.profile = function () {
    var main = document.getElementById("main");
    var u = user();

    if (!u) {
      main.innerHTML = gate("Your profile.", "Role, organisation, skills and the record of what you have contributed.");
      return;
    }

    var skills = (u.skills || []).length ? u.skills : [];
    var domains = (u.domains || []).length ? u.domains : [];

    main.innerHTML =
      '<section class="page-hero page-hero--slim">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">Profile <b>·</b> ' + esc(C.ROLE_LABEL[u.role] || "Member") + "</p>" +
          '<h1 class="h1">' + esc(u.name || "Your profile") + "</h1>" +
          '<p class="lede">' + esc(u.bio || "No bio yet. Add one during onboarding, or edit it below.") + "</p>" +
          '<div class="page-hero__meta">' +
            '<span class="badge badge--demo">Local session</span>' +
            (u.verified ? '<span class="badge badge--ok"><i></i>Verified</span>' : '<span class="badge badge--warn"><i></i>Unverified</span>') +
            (u.onboarded ? '<span class="badge badge--outline">Onboarded</span>' : '<span class="badge badge--outline">Onboarding incomplete</span>') +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="section section--flush"><div class="wrap">' +
        '<div class="split">' +
          '<div class="reveal">' +
            '<h2 class="h4" style="margin-bottom:16px">Account</h2>' +
            '<div class="panel">' +
              C.kv([
                ["Name", esc(u.name || "—")],
                ["Email", esc(u.email || "—")],
                ["Role", esc(C.ROLE_LABEL[u.role] || u.role)],
                ["Organisation", esc(u.org || "—")],
                ["Branch", esc(u.branch || "—")],
                ["Year", esc(u.year || "—")],
                ["Availability", esc(u.availability || "—")]
              ]) +
            "</div>" +
            '<div class="note note--info" style="margin-top:20px"><b>Role is a demo value.</b> In this build the role is stored client-side. A real deployment must assign and enforce roles on the server — changing a value here must never grant access.</div>' +
          "</div>" +
          '<div class="reveal">' +
            '<h2 class="h4" style="margin-bottom:16px">Skills and domains</h2>' +
            '<div class="panel" style="margin-bottom:20px">' +
              '<p class="micro" style="margin-bottom:10px">Skills</p>' +
              (skills.length
                ? '<div class="row row--wrap" style="gap:6px">' + skills.map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") + "</div>"
                : '<p class="small" style="color:var(--ink-faint)">None listed. Add skills during onboarding.</p>') +
            "</div>" +
            '<div class="panel">' +
              '<p class="micro" style="margin-bottom:10px">Problem domains</p>' +
              (domains.length
                ? '<div class="row row--wrap" style="gap:6px">' + domains.map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") + "</div>"
                : '<p class="small" style="color:var(--ink-faint)">None selected.</p>') +
            "</div>" +
            '<div class="row row--wrap" style="margin-top:24px;gap:10px">' +
              '<a class="btn btn--primary" href="' + root() + 'onboarding/"><span>Edit profile</span><span class="btn__arrow">↗</span></a>' +
              '<a class="btn btn--ghost" href="' + C.dashboardFor(u.role) + '"><span>Go to workspace</span></a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div></section>";

    C.reveals(main);
  };
})();
