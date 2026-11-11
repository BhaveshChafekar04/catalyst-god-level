/* ============================================================
   CATALYST — portal views
   students · universities · industry · admin
   Each view returns markup into the dashboard shell; all data
   comes from C.Data so every screen is labelled honestly.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;
  var esc = C.esc;
  C.portal = {};

  function root() { return C.relRoot(); }
  function user() { return C.Auth.currentUser() || { name: "Guest", role: "citizen", org: "" }; }

  function metric(k, v, d) {
    return '<div class="metric"><p class="metric__k">' + esc(k) + '</p><p class="metric__v">' + esc(v) + "</p>" +
      (d ? '<p class="metric__d">' + esc(d) + "</p>" : "") + "</div>";
  }

  function sectionHead(title, action) {
    return '<div class="row row--between" style="margin-bottom:16px;align-items:flex-end">' +
      '<h2 class="h4" style="margin:0">' + esc(title) + "</h2>" +
      (action || "") + "</div>";
  }

  function lifecycleMini(p) {
    return C.lifecycle(p.stage, { compact: true });
  }

  function badgeFor(stage) {
    var map = { prototype: "info", field_testing: "warn", proposal: "outline", deployment: "ok", impact_measured: "ok", completed: "ok" };
    return C.STAGES[C.stageIndex(stage)].label;
  }

  /* ==========================================================
     STUDENT — OVERVIEW
     ========================================================== */
  C.portal.studentHome = function () {
    var u = user();
    var all = C.Data.allChallenges();
    var saved = C.Data.savedIds();
    var recs = all.filter(function (c) {
      return (u.domains || []).length ? (u.domains || []).indexOf(c.category) >= 0 : true;
    }).slice(0, 3);

    Promise.all([C.Data.listProjects(), C.Data.listTeams(), C.Data.listActivities()]).then(function (res) {
      var projects = res[0], teams = res[1], acts = res[2];
      var myProjects = projects;
      var openTasks = teams.reduce(function (a, t) { return a + t.tasks.filter(function (x) { return x.status !== "done"; }).length; }, 0);

      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: "Welcome back, " + (u.name || "").split(" ")[0] + ".",
        sub: "Your work, your teams, and what is waiting on you.",
        actions: '<a class="btn btn--sm btn--ghost" href="' + root() + 'students/opportunities/"><span>Find a problem</span></a>',
        body:
          '<div class="metric-strip" style="margin-bottom:24px">' +
            metric("Active projects", myProjects.length, "2 in build · 1 in proposal") +
            metric("Teams", teams.length, "1 missing a skill") +
            metric("Open tasks", openTasks, "Across your teams") +
            metric("Saved", saved.length, "Challenges you bookmarked") +
          "</div>" +

          '<div class="dash-grid">' +
            '<div class="dash-col">' +
              (u.onboarded === false ?
              '<div class="note note--info" style="margin-bottom:16px"><b>Finish your profile.</b> Add your branch, skills and availability so recommendations are not generic. <a href="' + root() + 'students/profile/" style="color:var(--amber)">Complete profile ↗</a></div>' : "") +

              '<section class="panel">' +
                sectionHead("Recommended for you", '<a class="link-amber" href="' + root() + 'students/opportunities/">All opportunities ↗</a>') +
                '<p class="small" style="margin-bottom:16px">Based on your stated domains and skills. Demo matching — not a scored model.</p>' +
                recs.map(function (c) {
                  return '<a class="list-row" href="' + C.chURL(c) + '">' +
                    '<span class="list-row__main"><span class="list-row__meta"><span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span><span>" + esc(c.category) + "</span><span>" + esc(c.location) + "</span></span>" +
                    '<span class="list-row__title">' + esc(c.title) + "</span>" +
                    '<span class="list-row__sub">' + esc(c.skills.slice(0, 3).join(" · ")) + "</span></span>" +
                    '<span class="list-row__arrow">↗</span></a>';
                }).join("") +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Your projects", '<a class="link-amber" href="' + root() + 'students/projects/">Open workspace ↗</a>') +
                myProjects.map(function (p) {
                  return '<a class="list-row" href="' + root() + 'students/projects/?id=' + p.id + '">' +
                    '<span class="list-row__main"><span class="list-row__meta"><span>' + esc(p.id) + "</span><span>" + esc(badgeFor(p.stage)) + "</span></span>" +
                    '<span class="list-row__title">' + esc(p.title) + "</span>" +
                    '<span class="list-row__sub">Next: ' + esc(p.next) + " · " + esc(p.university) + "</span></span>" +
                    '<span class="list-row__arrow">↗</span></a>';
                }).join("") +
              "</section>" +
            "</div>" +

            '<div class="dash-col">' +
              '<section class="panel">' +
                sectionHead("Waiting on you") +
                '<div class="task"><span class="task__box"></span><p class="task__t">Review mentor comment on calibration notebook</p><span class="task__m">Due 18 Oct</span></div>' +
                '<div class="task"><span class="task__box"></span><p class="task__t">Confirm availability for field deployment weekend</p><span class="task__m">Due 20 Oct</span></div>' +
                '<div class="task"><span class="task__box"></span><p class="task__t">Submit enclosure BOM as a deliverable</p><span class="task__m">Due 22 Oct</span></div>' +
                '<div class="task is-done"><span class="task__box"></span><p class="task__t">Accept team invitation — Dryland Sensing</p><span class="task__m">Done</span></div>' +
                '<p class="cd__fine" style="margin-top:14px">Demo task record. Tasks in a live build come from the project service.</p>' +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Open activities", '<a class="link-amber" href="' + root() + 'students/activities/">Centre ↗</a>') +
                acts.slice(0, 3).map(function (a) {
                  return '<a class="list-row" href="' + root() + 'students/activities/?id=' + a.id + '">' +
                    '<span class="list-row__main"><span class="list-row__meta"><span>' + esc(a.type) + "</span><span>" + esc(a.level) + "</span></span>" +
                    '<span class="list-row__title">' + esc(a.title) + "</span>" +
                    '<span class="list-row__sub">' + esc(a.effort) + " · " + esc(a.challengeId) + "</span></span>" +
                    '<span class="list-row__arrow">↗</span></a>';
                }).join("") +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Recent activity") +
                '<div class="feed">' +
                  '<div class="feed__item"><span class="feed__dot"></span><div><p class="feed__t">Mentor feedback received on <b>Node enclosure CAD</b></p><span class="feed__d">06 Oct · Dr. Priya Raghunathan</span></div></div>' +
                  '<div class="feed__item"><span class="feed__dot"></span><div><p class="feed__t">Deliverable marked <b>reviewed</b> — Calibration report</p><span class="feed__d">22 Sep · automatic</span></div></div>' +
                  '<div class="feed__item"><span class="feed__dot"></span><div><p class="feed__t">Joined team <b>Dryland Sensing</b></p><span class="feed__d">26 Aug</span></div></div>' +
                "</div>" +
              "</section>" +
            "</div>" +
          "</div>"
      }));
    });
  };

  /* ==========================================================
     STUDENT — OPPORTUNITIES
     ========================================================== */
  var oppState = { domain: "all", type: "all", level: "all", mode: "all", status: "all" };

  C.portal.studentOpportunities = function () {
    var all = C.Data.allChallenges();
    var acts = [];
    C.Data.listActivities().then(function (a) { acts = a; render(); });

    function render() {
      var items = all.filter(function (c) {
        if (oppState.domain !== "all" && c.category !== oppState.domain) return false;
        if (oppState.status !== "all" && c.status !== oppState.status) return false;
        if (oppState.level !== "all" && c.urgency !== oppState.level) return false;
        return true;
      });

      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: "Find a problem to solve",
        sub: "Open challenges you can apply to. Every one is a real brief with evidence attached.",
        body:
          '<div class="panel" style="margin-bottom:18px">' +
            '<div class="filters-inline">' +
              '<div class="field" style="margin:0"><label for="oDomain">Domain</label><select id="oDomain"><option value="all">All domains</option>' +
                ["Water", "Sanitation", "Healthcare", "Education", "Agriculture", "Infrastructure", "Environment", "Public Safety"].map(function (d) {
                  return '<option value="' + d + '"' + (oppState.domain === d ? " selected" : "") + ">" + d + "</option>";
                }).join("") + "</select></div>" +
              '<div class="field" style="margin:0"><label for="oLevel">Priority</label><select id="oLevel"><option value="all">Any priority</option><option' + (oppState.level === "Critical" ? " selected" : "") + ">Critical</option><option" + (oppState.level === "High" ? " selected" : "") + ">High</option><option" + (oppState.level === "Medium" ? " selected" : "") + ">Medium</option></select></div>" +
              '<div class="field" style="margin:0"><label for="oStatus">Status</label><select id="oStatus"><option value="all">Any status</option><option value="validated"' + (oppState.status === "validated" ? " selected" : "") + ">Validated</option><option value=\"under_review\"" + (oppState.status === "under_review" ? " selected" : "") + ">Under review</option><option value=\"submitted\"" + (oppState.status === "submitted" ? " selected" : "") + ">Submitted</option></select></div>" +
            "</div>" +
            '<p class="cd__fine" style="margin-top:12px" id="oppCount">' + items.length + " opportunities match</p>" +
          "</div>" +

          '<div class="grid grid--2" style="gap:16px">' + items.map(function (c) {
            var activity = acts.filter(function (a) { return a.challengeId === c.id; });
            var saved = C.Data.savedIds().indexOf(c.id) >= 0;
            return '<article class="opp-card">' +
              '<div class="opp-card__top"><span class="opp-card__type">' + esc(c.category) + " · " + esc(c.urgency) + "</span>" +
                '<span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.status.replace("_", " ")) + "</span></div>" +
              "<h3>" + esc(c.title) + "</h3>" +
              "<p>" + esc(c.summary) + "</p>" +
              '<dl class="opp-card__meta">' +
                "<div><dt>Location</dt><dd>" + esc(c.location) + "</dd></div>" +
                "<div><dt>Team</dt><dd>" + (c.teamSize || 0) + " members · " + (c.openRoles || []).length + " open</dd></div>" +
                "<div><dt>Commitment</dt><dd>6–8 hrs / week</dd></div>" +
                "<div><dt>Activities</dt><dd>" + (activity.length || 3) + " available</dd></div>" +
              "</dl>" +
              '<div class="row row--wrap" style="gap:5px">' + c.skills.slice(0, 3).map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") + "</div>" +
              '<div class="opp-card__foot">' +
                '<a class="btn btn--primary btn--sm" href="' + C.chURL(c) + '"><span>View challenge</span><span class="btn__arrow">↗</span></a>' +
                '<button class="btn btn--ghost btn--sm" data-save="' + esc(c.id) + '" data-saved="' + (saved ? 1 : 0) + '"><span>' + (saved ? "★ Saved" : "☆ Save") + "</span></button>" +
              "</div>" +
            "</article>";
          }).join("") + "</div>" +
          (items.length ? "" : C.emptyState({ title: "No opportunities match those filters", text: "Widen the domain or priority filter. New challenges are published after moderator validation." }))
      }));

      ["oDomain", "oLevel", "oStatus"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener("change", function () {
          if (id === "oDomain") oppState.domain = el.value;
          if (id === "oLevel") oppState.level = el.value;
          if (id === "oStatus") oppState.status = el.value;
          render();
        });
      });
      C.bindChallengeActions(document);
    }
  };

  /* ==========================================================
     STUDENT — ACTIVITY CENTRE
     ========================================================== */
  C.portal.studentActivities = function () {
    var selected = C.param("id", "");

    C.Data.listActivities().then(function (acts) {
      if (selected) {
        var a = acts.filter(function (x) { return x.id === selected; })[0];
        if (a) return renderDetail(a, acts);
      }
      renderList(acts);
    });

    function renderList(acts) {
      var types = acts.map(function (a) { return a.type; }).filter(function (v, i, s) { return s.indexOf(v) === i; });
      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: "Activity centre",
        sub: "Scoped pieces of problem-solving work attached to a real challenge — not courses.",
        body:
          '<div class="note" style="margin-bottom:20px"><b>What this is.</b> Each activity is a bounded deliverable a team actually needs: a sampling protocol, a hydraulic model, a condition survey. They exist because a challenge is stuck at a specific stage and needs a specific artefact.</div>' +
          '<div class="row row--wrap" style="gap:8px;margin-bottom:22px">' +
            '<span class="badge badge--outline">' + acts.length + " activities</span>" +
            types.map(function (t) { return '<span class="badge">' + esc(t) + "</span>"; }).join("") +
          "</div>" +
          '<div class="grid grid--2" style="gap:16px">' + acts.map(function (a) {
            var ch = C.Data.allChallenges().filter(function (c) { return c.id === a.challengeId; })[0];
            return '<a class="opp-card" href="' + root() + 'students/activities/?id=' + a.id + '" style="text-decoration:none">' +
              '<div class="opp-card__top"><span class="opp-card__type">' + esc(a.type) + "</span>" +
                '<span class="badge ' + (a.status === "in_progress" ? "badge--warn" : "badge--outline") + '">' + esc(a.status.replace("_", " ")) + "</span></div>" +
              "<h3>" + esc(a.title) + "</h3>" +
              '<p style="color:var(--ink-faint);font-size:11px">' + esc(ch ? ch.title : "") + "</p>" +
              '<dl class="opp-card__meta">' +
                "<div><dt>Level</dt><dd>" + esc(a.level) + "</dd></div>" +
                "<div><dt>Effort</dt><dd>" + esc(a.effort) + "</dd></div>" +
              "</dl>" +
              '<span class="link-amber" style="font-size:10.5px">Open activity ↗</span>' +
            "</a>";
          }).join("") + "</div>"
      }));
    }

    function renderDetail(a, acts) {
      var ch = C.Data.allChallenges().filter(function (c) { return c.id === a.challengeId; })[0];
      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: a.title,
        sub: a.type + " · " + a.level + " · " + a.effort,
        actions: '<a class="btn btn--sm btn--ghost" href="' + root() + 'students/activities/"><span>← All activities</span></a>',
        body:
          '<div class="dash-grid">' +
            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Objective</p>' +
                '<p class="cd__p" style="margin-top:8px">Produce a <b style="color:var(--ink)">' + esc(a.deliverable) + "</b> that the project team can use directly. The work is scoped to be completable in " + esc(a.effort) + ".</p>" +
                '<div class="divider" style="margin:18px 0"></div>' +
                '<p class="micro">Steps</p>' +
                '<ol class="cd__timeline" style="margin-top:10px">' +
                  '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Read the challenge brief and the attached evidence.</p></div></li>' +
                  '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Confirm scope with the team lead before starting field work.</p></div></li>' +
                  '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Collect or build the artefact, documenting method and limitations.</p></div></li>' +
                  '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Submit the deliverable, plus a short note on what you could not do.</p></div></li>' +
                  '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Respond to mentor review; revise once if required.</p></div></li>' +
                "</ol>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Submission</p>' +
                '<p class="small" style="margin:8px 0 16px">Accepted formats: PDF report, dataset, repository link, or a short screen recording. Maximum 25 MB per file.</p>' +
                '<div class="drop" style="padding:20px"><span class="drop__icon">' + C.icon("inbox") + "</span>" +
                  '<p class="drop__title" style="font-size:12px">Drop your deliverable here</p>' +
                  '<p class="drop__sub">PDF · DOCX · ZIP · link in a text field</p>' +
                  '<input type="file" aria-label="Submit deliverable"></div>' +
                '<div class="field" style="margin-top:14px"><label for="subNote">Note to reviewer</label>' +
                  '<textarea id="subNote" style="min-height:80px" placeholder="Method, limitations, and where the data is."></textarea></div>' +
                '<button class="btn btn--primary btn--sm" style="margin-top:12px" id="subBtn"><span>Submit for review</span><span class="btn__arrow">↗</span></button>' +
                '<p class="cd__fine">Submissions in this prototype are not stored on a server. In production this posts to the activity submission endpoint.</p>' +
              "</section>" +
            "</div>" +

            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Attached to</p>' +
                (ch ? '<a class="list-row" href="' + C.chURL(ch) + '" style="margin-top:8px">' +
                  '<span class="list-row__main"><span class="list-row__meta"><span>' + esc(ch.id) + "</span><span>" + esc(ch.category) + "</span></span>" +
                  '<span class="list-row__title">' + esc(ch.title) + "</span>" +
                  '<span class="list-row__sub">' + esc(ch.location) + "</span></span><span class=\"list-row__arrow\">↗</span></a>" : '<p class="small">Challenge not linked.</p>') +
                '<div class="divider" style="margin:16px 0"></div>' +
                '<p class="micro">Skills used</p>' +
                '<div class="row row--wrap" style="gap:5px;margin-top:8px">' + a.skills.map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") + "</div>" +
              "</section>" +
              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Review</p>' +
                '<div class="badge badge--outline" style="margin-top:10px">Awaiting submission</div>' +
                '<p class="cd__fine" style="margin-top:12px">Reviewed by a faculty mentor. Review is recorded against your portfolio as mentor-verified.</p>' +
              "</section>" +
              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Other activities on this challenge</p>' +
                acts.filter(function (x) { return x.challengeId === a.challengeId && x.id !== a.id; }).map(function (x) {
                  return '<a class="list-row" href="' + root() + 'students/activities/?id=' + x.id + '"><span class="list-row__main"><span class="list-row__title" style="font-size:12px">' + esc(x.title) + '</span><span class="list-row__sub">' + esc(x.level) + " · " + esc(x.effort) + '</span></span><span class="list-row__arrow">↗</span></a>';
                }).join("") || '<p class="small" style="margin-top:8px">No others yet.</p>' +
              "</section>" +
            "</div>" +
          "</div>"
      }));

      var sb = document.getElementById("subBtn");
      if (sb) sb.addEventListener("click", function () {
        sb.classList.add("is-busy");
        sb.querySelector("span").textContent = "Submitting…";
        setTimeout(function () {
          sb.classList.remove("is-busy");
          sb.querySelector("span").textContent = "Submit for review";
          C.toast("Demo only — the submission interface is wired, the storage endpoint is not.", "err");
        }, 700);
      });
    }
  };

  /* ==========================================================
     STUDENT — TEAMS
     ========================================================== */
  C.portal.studentTeams = function () {
    C.Data.listTeams().then(function (teams) {
      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: "Teams",
        sub: "Who you work with, what is missing, and what is due.",
        actions: '<button class="btn btn--sm btn--ghost" id="newTeam"><span>+ New team</span></button>',
        body:
          teams.map(function (t) {
            var ch = C.Data.allChallenges().filter(function (c) { return c.id === t.challengeId; })[0];
            return '<section class="panel" style="margin-bottom:18px">' +
              '<div class="row row--between" style="align-items:flex-start;margin-bottom:14px">' +
                '<div><p class="micro">' + esc(t.id) + " · " + esc(t.challengeId) + '</p><h2 class="h4" style="margin:6px 0 4px">' + esc(t.name) + "</h2>" +
                (ch ? '<a href="' + C.chURL(ch) + '" class="link-amber" style="font-size:10.5px">' + esc(ch.title) + " ↗</a>" : "") + "</div>" +
                '<div class="row" style="gap:6px">' + C.people(t.members) + "</div>" +
              "</div>" +

              '<div class="dash-grid dash-grid--tight">' +
                '<div class="dash-col">' +
                  '<p class="micro">Members</p>' +
                  '<div class="member-list" style="margin-top:10px">' + t.members.map(function (m) {
                    return '<div class="member"><span class="av">' + esc(C.initials(m.name)) + "</span><div><p class=\"member__name\">" + esc(m.name) + "</p><p class=\"member__role\">" + esc(m.role) + "</p></div>" +
                      (m.verified ? '<span class="badge badge--ok" style="margin-left:auto">Verified</span>' : '<span class="badge badge--outline" style="margin-left:auto">Unverified</span>') + "</div>";
                  }).join("") + "</div>" +
                "</div>" +
                '<div class="dash-col">' +
                  '<p class="micro">Missing skills</p>' +
                  '<div class="row row--wrap" style="gap:5px;margin:10px 0 14px">' +
                    (t.missing.length ? t.missing.map(function (m) { return '<span class="badge badge--warn">' + esc(m) + "</span>"; }).join("") : '<span class="badge badge--ok">No gaps recorded</span>') +
                  "</div>" +
                  '<button class="btn btn--ghost btn--sm" id="invite"><span>Invite a member</span><span class="btn__arrow">↗</span></button>' +
                "</div>" +
              "</div>" +

              '<div class="divider" style="margin:18px 0"></div>' +
              '<p class="micro">Tasks</p>' +
              '<div style="margin-top:10px">' + t.tasks.map(function (k) {
                return '<div class="task"><span class="task__box"></span><p class="task__t">' + esc(k.title) + " <span style=\"color:var(--ink-ghost)\">· " + esc(k.assignee) + "</span></p>" +
                  '<span class="task__m">' + esc(k.due) + " · " + esc(k.status) + "</span></div>";
              }).join("") + "</div>" +
            "</section>";
          }).join("") +

          C.emptyState({
            title: "Teams are formed around a validated challenge",
            text: "You can only create a team for a challenge that a moderator has validated and an institution has shown interest in. Find an open challenge to begin.",
            action: '<a class="btn btn--primary btn--sm" href="' + root() + 'students/opportunities/"><span>Find a challenge</span><span class="btn__arrow">↗</span></a>'
          })
      }));

      var nt = document.getElementById("newTeam");
      if (nt) nt.addEventListener("click", function () {
        C.modal.open('<div class="apply"><h2 class="h3" style="margin-bottom:8px">Create a team</h2>' +
          '<p class="small" style="margin-bottom:18px">Teams attach to a validated challenge. Choose one you have already applied to.</p>' +
          '<div class="field"><label>Challenge</label><select>' +
            C.Data.allChallenges().filter(function (c) { return c.status === "validated"; }).map(function (c) { return '<option>' + esc(c.title) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field" style="margin-top:14px"><label>Team name</label><input type="text" placeholder="e.g. Ward 14 Water Lab"></div>' +
          '<div class="row" style="margin-top:18px;gap:10px"><button class="btn btn--primary" id="ctGo"><span>Create team</span><span class="btn__arrow">↗</span></button>' +
          '<button class="btn btn--ghost" data-modal-close><span>Cancel</span></button></div></div>', {
          onMount: function (m) {
            m.addEventListener("click", function (e) {
              if (e.target.closest("[data-modal-close]")) C.modal.close();
              if (e.target.closest("#ctGo")) { C.modal.close(); C.toast("Team creation requires the projects service. Demo interface only.", "err"); }
            });
          }
        });
      });
    });
  };

  /* ==========================================================
     STUDENT — PROJECTS LIST + DETAIL
     ========================================================== */
  C.portal.studentProjects = function () {
    var id = C.param("id", "");
    C.Data.listProjects().then(function (ps) {
      if (id) {
        var p = ps.filter(function (x) { return x.id === id; })[0];
        if (p) return detail(p, ps);
      }
      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: "My projects",
        sub: "Everything you have applied to, been accepted into, or delivered.",
        body:
          '<div class="metric-strip" style="margin-bottom:20px">' +
            metric("In build", ps.filter(function (p) { return p.stage === "prototype"; }).length, "PR-1042") +
            metric("Field testing", ps.filter(function (p) { return p.stage === "field_testing"; }).length, "PR-1039") +
            metric("Proposal", ps.filter(function (p) { return p.stage === "proposal"; }).length, "PR-1031") +
            metric("Completed", 0, "None yet") +
          "</div>" +
          '<div class="panel"><div class="table-wrap"><table class="table">' +
            "<thead><tr><th>Project</th><th>Stage</th><th>Team</th><th>Next milestone</th><th></th></tr></thead><tbody>" +
            ps.map(function (p) {
              return "<tr><td><a href=\"" + root() + "students/projects/?id=" + p.id + "\" class=\"table__link\">" + esc(p.title) + "</a><span class=\"table__sub\">" + esc(p.id) + " · " + esc(p.university) + "</span></td>" +
                '<td><span class="badge badge--info">' + esc(badgeFor(p.stage)) + "</span></td>" +
                "<td>" + p.team.length + " members</td>" +
                "<td>" + esc(p.next) + "</td>" +
                '<td class="table-actions"><a class="tbtn" href="' + root() + 'students/projects/?id=' + p.id + '">Open</a></td></tr>';
            }).join("") +
          "</tbody></table></div></div>" +
          '<p class="cd__fine" style="margin-top:14px">Demo project records. In production these come from the project service, scoped to your memberships.</p>'
      }));
    });

    function detail(p, ps) {
      var ch = C.Data.allChallenges().filter(function (c) { return c.id === p.challengeId; })[0];
      C.mountDash(C.dashShell({
        role: "student", base: root() + "students/index.html",
        title: p.title,
        sub: p.id + " · " + p.university + " · Mentor " + p.mentor,
        actions: '<a class="btn btn--sm btn--ghost" href="' + root() + 'students/projects/"><span>← All projects</span></a>',
        body:
          '<div class="panel" style="margin-bottom:18px"><p class="micro">Lifecycle</p><div style="margin-top:12px">' + C.lifecycle(p.stage) + "</div></div>" +
          '<div class="dash-grid">' +
            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Problem</p>' +
                (ch ? '<a class="table__link" href="' + C.chURL(ch) + '" style="display:block;margin-top:8px;font-size:13px">' + esc(ch.title) + " ↗</a>" : "") +
                '<p class="cd__p" style="margin-top:10px;font-size:12.5px">' + esc(p.summary) + "</p>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Milestones") +
                '<div class="milestones">' + p.milestones.map(function (m, i) {
                  return '<div class="milestone ' + (m.status === "done" ? "is-done" : m.status === "active" ? "is-active" : "") + '">' +
                    '<span class="milestone__dot"></span>' +
                    '<div style="flex:1"><p class="milestone__t">' + esc(m.title) + '</p><span class="milestone__d">' + esc(m.date) + "</span></div>" +
                    '<span class="badge ' + (m.status === "done" ? "badge--ok" : m.status === "active" ? "badge--warn" : "badge--outline") + '">' + esc(m.status) + "</span>" +
                  "</div>";
                }).join("") + "</div>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Deliverables") +
                '<div class="table-wrap"><table class="table"><thead><tr><th>Deliverable</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
                  p.deliverables.map(function (d) {
                    return "<tr><td>" + esc(d.name) + '</td><td><span class="badge ' + (d.status === "reviewed" ? "badge--ok" : "badge--outline") + '">' + esc(d.status) + "</span></td><td>" + esc(d.date) + "</td></tr>";
                  }).join("") +
                "</tbody></table></div>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Updates") +
                (p.updates.length ? p.updates.map(function (u2) {
                  return '<div class="feed__item"><span class="feed__dot"></span><div><p class="feed__t">' + esc(u2.text) + '</p><span class="feed__d">' + esc(u2.date) + " · " + esc(u2.author) + "</span></div></div>";
                }).join("") : '<p class="small">No updates posted yet.</p>') +
                '<div class="field" style="margin-top:16px"><label for="newUpdate">Post an update</label>' +
                  '<textarea id="newUpdate" style="min-height:70px" placeholder="What changed, what blocked you, what is next?"></textarea></div>' +
                '<button class="btn btn--ghost btn--sm" style="margin-top:10px" id="postUpdate"><span>Post update</span></button>' +
              "</section>" +
            "</div>" +

            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Team</p>' +
                '<div class="member-list" style="margin-top:10px">' + p.team.map(function (n, i) {
                  return '<div class="member"><span class="av' + (i === 0 ? " av--amber" : "") + '">' + esc(C.initials(n)) + '</span><div><p class="member__name">' + esc(n) + '</p><p class="member__role">' + (i === 0 ? "Lead" : "Contributor") + "</p></div></div>";
                }).join("") + "</div>" +
                '<div class="divider" style="margin:14px 0"></div>' +
                '<p class="micro">Mentor</p><p class="cd__reporter">' + esc(p.mentor) + "</p>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Impact</p>' +
                '<div class="imp-row"><span class="imp-row__k">Planned reach</span><span class="imp-row__v">' + esc(p.impact.planned) + "</span></div>" +
                '<div class="imp-row"><span class="imp-row__k">Verified</span><span class="imp-row__v" style="color:var(--ink-ghost)">Not measured</span></div>' +
                '<div class="imp-row"><span class="imp-row__k">State</span><span class="badge badge--outline">Estimated / planned</span></div>' +
                '<p class="cd__fine" style="margin-top:12px">' + esc(p.impact.note) + " A planned figure is not an outcome and is never reported as one.</p>" +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Key dates</p>' +
                '<div class="imp-row"><span class="imp-row__k">Started</span><span class="imp-row__v">' + esc(p.start) + "</span></div>" +
                '<div class="imp-row"><span class="imp-row__k">Next review</span><span class="imp-row__v">' + esc(p.next) + "</span></div>" +
              "</section>" +
            "</div>" +
          "</div>"
      }));

      var pu = document.getElementById("postUpdate");
      if (pu) pu.addEventListener("click", function () {
        C.toast("Updates need the projects service. Demo interface only.", "err");
      });
    }
  };

  /* ==========================================================
     STUDENT — PROFILE
     ========================================================== */
  C.portal.studentProfile = function () {
    var u = user();
    C.mountDash(C.dashShell({
      role: "student", base: root() + "students/index.html",
      title: "Profile & skills",
      sub: "What you can do, what you want to work on, and when you are available.",
      body:
        '<div class="dash-grid">' +
          '<div class="dash-col">' +
            '<section class="panel">' +
              '<div class="row" style="gap:16px;align-items:center;margin-bottom:22px">' +
                '<span class="avatar-lg">' + esc(C.initials(u.name)) + "</span>" +
                '<div><p class="h4" style="margin:0">' + esc(u.name) + '</p><p class="small" style="margin:4px 0 0">' + esc(u.email || "no email on session") + "</p>" +
                '<p class="small">' + esc(u.org || "No institution set") + "</p></div>" +
                '<button class="btn btn--ghost btn--sm" style="margin-left:auto" id="editProfile"><span>Edit</span></button>' +
              "</div>" +
              '<div class="field"><label for="pName">Display name</label><input id="pName" type="text" value="' + esc(u.name) + '"></div>' +
              '<div class="field" style="margin-top:16px"><label for="pOrg">College / university</label><input id="pOrg" type="text" value="' + esc(u.org || "") + '"></div>' +
              '<div class="field__row" style="margin-top:16px">' +
                '<div class="field"><label for="pBranch">Branch</label><input id="pBranch" type="text" value="' + esc(u.branch || "") + '" placeholder="Computer Science"></div>' +
                '<div class="field"><label for="pYear">Year</label><input id="pYear" type="text" value="' + esc(u.year || "") + '" placeholder="3rd year"></div>' +
              "</div>" +
              '<div class="field" style="margin-top:16px"><label for="pSkills">Skills</label>' +
                '<input id="pSkills" type="text" value="' + esc((u.skills || []).join(", ")) + '" placeholder="Python, GIS, field surveys">' +
                '<span class="field__hint">Comma separated. Used for team matching and recommendation.</span></div>' +
              '<div class="field" style="margin-top:16px"><label for="pAvail">Weekly availability</label>' +
                '<select id="pAvail">' + ["2–4 hours", "4–6 hours", "6–10 hours", "10+ hours"].map(function (a) {
                  return '<option' + (u.availability === a ? " selected" : "") + ">" + a + "</option>";
                }).join("") + "</select></div>" +
              '<div class="field" style="margin-top:16px"><label for="pBio">About</label>' +
                '<textarea id="pBio" style="min-height:90px" placeholder="What do you work on?">' + esc(u.bio || "") + "</textarea></div>" +
              '<button class="btn btn--primary btn--sm" style="margin-top:18px" id="saveProfile"><span>Save profile</span></button>' +
            "</section>" +
          "</div>" +

          '<div class="dash-col">' +
            '<section class="panel">' +
              '<p class="micro">Problem domains</p>' +
              '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                ((u.domains || []).length ? u.domains.map(function (d) { return '<span class="chip chip--static">' + esc(d) + "</span>"; }).join("") : '<p class="small">No domains selected. Set them in <a class="link-amber" href="' + root() + 'onboarding/">onboarding</a>.</p>') +
              "</div>" +
            "</section>" +
            '<section class="panel" style="margin-top:18px">' +
              '<p class="micro">Profile completeness</p>' +
              '<div class="bar" style="margin-top:12px"><span class="bar__k">Overall</span><span class="bar__t"><i style="transform:scaleX(' + (u.onboarded ? 0.85 : 0.45) + ')"></i></span><span class="bar__v">' + (u.onboarded ? "85%" : "45%") + "</span></div>" +
              '<p class="cd__fine" style="margin-top:12px">Complete profiles get more specific recommendations. A complete profile is not a guarantee of placement.</p>' +
            "</section>" +
            '<section class="panel" style="margin-top:18px">' +
              '<p class="micro">Privacy</p>' +
              '<p class="cd__fine" style="margin-top:8px">Your name and portfolio are visible to mentors and team leads on projects you join. Your email is not shown publicly.</p>' +
            "</section>" +
          "</div>" +
        "</div>"
    }));

    var save = document.getElementById("saveProfile");
    if (save) save.addEventListener("click", function () {
      save.classList.add("is-busy");
      save.querySelector("span").textContent = "Saving…";
      setTimeout(function () {
        C.Auth.updateProfile({
          name: document.getElementById("pName").value.trim(),
          org: document.getElementById("pOrg").value.trim(),
          branch: document.getElementById("pBranch").value.trim(),
          year: document.getElementById("pYear").value.trim(),
          skills: document.getElementById("pSkills").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
          availability: document.getElementById("pAvail").value,
          bio: document.getElementById("pBio").value.trim()
        });
        save.classList.remove("is-busy");
        save.querySelector("span").textContent = "Save profile";
        C.toast("Profile saved locally.", "ok");
        C.renderHeader();
      }, 500);
    });
  };

  /* ==========================================================
     STUDENT — PORTFOLIO
     ========================================================== */
  C.portal.studentPortfolio = function () {
    var items = [
      { t: "Ward 14 water source inventory", p: "CH-2418", c: "Field survey · GPS mapping of 11 sources and 240 usage points", v: true, by: "Dr. Priya Raghunathan", d: "2026-09-30", tag: "Field study" },
      { t: "Calibration report — soil moisture nodes", p: "PR-1042", c: "Compared 12 sensors against gravimetric samples; documented drift of 4.2% over six weeks.", v: true, by: "Dr. Priya Raghunathan", d: "2026-09-22", tag: "Research" },
      { t: "Node enclosure CAD + bill of materials", p: "PR-1042", c: "IP65 enclosure design with off-the-shelf gland fittings; unit cost ₹1,840.", v: false, by: "Self-submitted", d: "2026-10-06", tag: "Hardware" },
      { t: "Dawn pedestrian count on the school route", p: "CH-2441", c: "Four mornings of counts; 312 observations across two intersections.", v: true, by: "Prof. S. Kulkarni", d: "2026-08-14", tag: "Field study" },
      { t: "Hydraulic model — Anna Nagar West 400 m stretch", p: "CH-2405", c: "SWMM model with three blockage scenarios; qualitative agreement with reported flood depth.", v: false, by: "Self-submitted", d: "2026-10-09", tag: "Software" }
    ];
    var verified = items.filter(function (i) { return i.v; }).length;

    C.mountDash(C.dashShell({
      role: "student", base: root() + "students/index.html",
      title: "Contribution portfolio",
      sub: "A record of work you did — and who reviewed it.",
      body:
        '<div class="metric-strip" style="margin-bottom:20px">' +
          metric("Contributions", items.length, "Across 3 challenges") +
          metric("Mentor-verified", verified, "Reviewed deliverables") +
          metric("In review", items.length - verified, "Awaiting a reviewer") +
          metric("Challenges", 3, "Distinct problem records") +
        "</div>" +

        '<div class="note" style="margin-bottom:20px"><b>How verification works.</b> A contribution is marked <b>mentor-verified</b> only when a named faculty mentor or project lead has reviewed the deliverable. Everything else is self-reported and labelled as such. Catalyst does not issue certificates, academic credit or employment guarantees.</div>' +

        '<div class="panel">' +
          '<div class="row row--between" style="margin-bottom:14px"><h2 class="h4" style="margin:0">Contributions</h2>' +
            '<div class="row" style="gap:8px"><span class="badge badge--ok">Verified</span><span class="badge badge--outline">Self-reported</span></div></div>' +
          '<div class="portal-grid">' + items.map(function (i) {
            return '<div class="contrib ' + (i.v ? "contrib--verified" : "") + '">' +
              '<div class="contrib__head"><div><h4>' + esc(i.t) + '</h4><p style="margin-top:4px">' + esc(i.c) + "</p></div>" +
                '<span class="badge ' + (i.v ? "badge--ok" : "badge--outline") + '">' + (i.v ? "Verified" : "Self-reported") + "</span></div>" +
              '<div class="contrib__meta"><span>' + esc(i.p) + "</span><span>" + esc(i.tag) + "</span><span>" + esc(i.d) + "</span><span>" + (i.v ? "Reviewed by " + esc(i.by) : "Not reviewed") + "</span></div>" +
            "</div>";
          }).join("") + "</div>" +
        "</div>" +

        '<div class="dash-grid" style="margin-top:18px">' +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">Skills demonstrated</p>' +
            '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
              ["Sampling design", "GPS mapping", "Sensor calibration", "SWMM", "Technical writing", "Community interviews", "CAD", "Python"].map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") +
            "</div></section></div>" +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">What this is not</p>' +
            '<p class="cd__fine" style="margin-top:8px">This portfolio is a project record, not a credential. It carries no academic credit, no certification and no placement guarantee. Where a real institution later offers recognition, it will appear here and be attributed to that institution.</p>' +
          "</section></div>" +
        "</div>"
    }));
  };

  /* ==========================================================
     UNIVERSITY
     ========================================================== */
  C.portal.uniHome = function () {
    var all = C.Data.allChallenges();
    C.Data.listProjects().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "university", base: root() + "universities/index.html",
        title: "Faculty overview",
        sub: "Challenges matched to your departments, and the work under your supervision.",
        body:
          '<div class="pf-hero" style="margin-bottom:22px">' +
            '<div><h2>' + esc(user().org || "Your institution") + "</h2>" +
            '<p>3 departments registered · 2 labs available · 1 invitation awaiting your response</p></div>' +
            '<span class="badge badge--warn">1 action required</span>' +
          "</div>" +

          '<div class="metric-strip" style="margin-bottom:22px">' +
            metric("Suggested challenges", all.filter(function (c) { return c.recommendations && c.recommendations.length; }).length, "Awaiting review") +
            metric("Accepted", 2, "In supervision") +
            metric("Active teams", 2, "Across 3 departments") +
            metric("Mentors assigned", 2, "1 unassigned") +
          "</div>" +

          '<div class="dash-grid">' +
            '<div class="dash-col">' +
              '<section class="panel">' +
                sectionHead("Invitations to review", '<a class="link-amber" href="' + root() + 'universities/challenges/">All ↗</a>') +
                '<p class="small" style="margin-bottom:14px">These are <b>suggestions</b> from the matching layer, each with a stated reason. Accepting creates a supervision obligation; declining is recorded.</p>' +
                all.filter(function (c) { return c.recommendations && c.recommendations.length; }).slice(0, 2).map(function (c) {
                  var rec = c.recommendations[0];
                  return '<div class="invite">' +
                    '<div class="row row--between" style="align-items:flex-start"><div style="min-width:0">' +
                      '<p class="micro">' + esc(c.id) + " · " + esc(c.category) + " · " + esc(c.urgency) + "</p>" +
                      '<a class="table__link" href="' + C.chURL(c) + '" style="display:block;margin:6px 0 4px">' + esc(c.title) + "</a>" +
                      '<p class="cd__fine" style="margin:0">Why suggested: ' + esc(rec.reason) + "</p>" +
                    "</div></div>" +
                    '<div class="row" style="gap:6px;margin-top:12px">' +
                      '<button class="tbtn tbtn--ok" data-decision="accept">Accept</button>' +
                      '<button class="tbtn" data-decision="info">Request info</button>' +
                      '<button class="tbtn tbtn--no" data-decision="decline">Decline</button>' +
                    "</div>" +
                  "</div>";
                }).join("") +
              "</section>" +

              '<section class="panel" style="margin-top:18px">' +
                sectionHead("Supervised projects") +
                '<div class="table-wrap"><table class="table"><thead><tr><th>Project</th><th>Stage</th><th>Mentor</th><th>Next</th></tr></thead><tbody>' +
                ps.map(function (p) {
                  return "<tr><td>" + esc(p.title) + '<span class="table__sub">' + esc(p.id) + "</span></td>" +
                    '<td><span class="badge badge--info">' + esc(badgeFor(p.stage)) + "</span></td>" +
                    "<td>" + esc(p.mentor) + "</td><td>" + esc(p.next) + "</td></tr>";
                }).join("") + "</tbody></table></div>" +
              "</section>" +
            "</div>" +

            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Department coverage</p>' +
                '<div class="bar-list" style="margin-top:12px">' +
                  bar("Civil Engineering", 0.82) + bar("Environmental Science", 0.64) + bar("Public Health", 0.38) + bar("Data Science", 0.55) +
                "</div>" +
                '<p class="cd__fine" style="margin-top:12px">Share of open challenges in your focus domains that map to a department here.</p>' +
              "</section>" +
              '<section class="panel" style="margin-top:18px">' +
                '<p class="micro">Labs & equipment</p>' +
                '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                  ["Groundwater laboratory", "Materials testing", "Sensor calibration bench", "Field vehicle"].map(function (l) { return '<span class="chip chip--static">' + esc(l) + "</span>"; }).join("") +
                "</div>" +
                '<a class="link-amber" href="' + root() + 'universities/profile/" style="display:inline-block;margin-top:12px;font-size:10.5px">Edit facilities ↗</a>' +
              "</section>" +
            "</div>" +
          "</div>"
      }));

      document.querySelectorAll("[data-decision]").forEach(function (b) {
        b.addEventListener("click", function () {
          var d = b.getAttribute("data-decision");
          if (d === "accept") C.toast("Demo only — acceptance must be recorded server-side with an authorised faculty account.", "err");
          else if (d === "decline") C.toast("Demo only — a decline reason is required in the real workflow.", "err");
          else C.toast("Demo only — the request-information thread needs the messaging service.", "err");
        });
      });
    });
  };

  function bar(label, v) {
    return '<div class="bar"><span class="bar__k">' + esc(label) + '</span><span class="bar__t"><i style="transform:scaleX(' + v + ')"></i></span><span class="bar__v">' + Math.round(v * 100) + "%</span></div>";
  }

  C.portal.uniChallenges = function () {
    var all = C.Data.allChallenges();
    C.mountDash(C.dashShell({
      role: "university", base: root() + "universities/index.html",
      title: "Challenges",
      sub: "Suggested, accepted and declined — with the reason recorded for each.",
      body:
        '<div class="panel"><div class="table-wrap"><table class="table">' +
          "<thead><tr><th>Challenge</th><th>Domain</th><th>Priority</th><th>Suggested reason</th><th>Decision</th><th></th></tr></thead><tbody>" +
          all.map(function (c) {
            var rec = (c.recommendations || [])[0];
            var decision = rec ? "pending" : "not_suggested";
            return "<tr><td><a class=\"table__link\" href=\"" + C.chURL(c) + "\">" + esc(c.title) + '</a><span class="table__sub">' + esc(c.id) + " · " + esc(c.location) + "</span></td>" +
              "<td>" + esc(c.category) + "</td>" +
              '<td><span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span></td>" +
              "<td style=\"max-width:280px;color:var(--ink-faint);font-size:11px\">" + esc(rec ? rec.reason : "No match reason recorded") + "</td>" +
              '<td><span class="badge ' + (decision === "pending" ? "badge--warn" : "badge--outline") + '">' + esc(decision.replace("_", " ")) + "</span></td>" +
              '<td class="table-actions"><a class="tbtn" href="' + C.chURL(c) + '">Review</a></td></tr>';
          }).join("") +
        "</tbody></table></div></div>" +
        '<div class="note" style="margin-top:16px"><b>No institution is shown as matched until it accepts.</b> Accepting creates a supervision record with a named faculty owner. Declining keeps the challenge open and re-runs matching against other departments.</div>'
    }));
  };

  C.portal.uniTeams = function () {
    C.Data.listTeams().then(function (teams) {
      C.mountDash(C.dashShell({
        role: "university", base: root() + "universities/index.html",
        title: "Teams",
        sub: "Student teams under your supervision, and the gaps they have declared.",
        body: teams.map(function (t) {
          return '<section class="panel" style="margin-bottom:16px">' +
            '<div class="row row--between" style="align-items:flex-start">' +
              '<div><p class="micro">' + esc(t.id) + '</p><h2 class="h4" style="margin:6px 0">' + esc(t.name) + "</h2>" +
              '<p class="small">' + t.members.length + " members · missing: " + esc(t.missing.join(", ") || "none") + "</p></div>" +
              '<a class="btn btn--ghost btn--sm" href="' + C.chURL({ slug: t.challengeId, id: t.challengeId }) + '"><span>Challenge</span><span class="btn__arrow">↗</span></a>' +
            "</div>" +
            '<div class="divider" style="margin:14px 0"></div>' +
            '<div class="member-list">' + t.members.map(function (m) {
              return '<div class="member"><span class="av">' + esc(C.initials(m.name)) + '</span><div><p class="member__name">' + esc(m.name) + '</p><p class="member__role">' + esc(m.role) + "</p></div>" +
                '<span class="badge ' + (m.verified ? "badge--ok" : "badge--outline") + '" style="margin-left:auto">' + (m.verified ? "Verified" : "Unverified") + "</span></div>";
            }).join("") + "</div>" +
          "</section>";
        }).join("") +
        '<p class="cd__fine">Student membership is provisional until a mentor confirms the allocation. Verification here is a demo flag.</p>'
      }));
    });
  };

  C.portal.uniProjects = function () {
    C.Data.listProjects().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "university", base: root() + "universities/index.html",
        title: "Projects under review",
        sub: "Proposals, prototypes and field tests awaiting faculty sign-off.",
        body:
          ps.map(function (p) {
            return '<section class="panel" style="margin-bottom:16px">' +
              '<div class="row row--between" style="align-items:flex-start;margin-bottom:12px">' +
                '<div><p class="micro">' + esc(p.id) + " · " + esc(p.mentor) + '</p><h2 class="h4" style="margin:6px 0 4px">' + esc(p.title) + "</h2>" +
                '<p class="small">' + esc(p.summary) + "</p></div>" +
                '<span class="badge badge--info">' + esc(badgeFor(p.stage)) + "</span>" +
              "</div>" +
              '<div style="margin-bottom:14px">' + C.lifecycle(p.stage, { compact: true }) + "</div>" +
              '<div class="dash-grid dash-grid--tight">' +
                '<div class="dash-col"><p class="micro">Deliverables</p><div style="margin-top:8px">' +
                  p.deliverables.map(function (d) {
                    return '<div class="row row--between" style="padding:7px 0;border-bottom:1px solid rgba(244,241,234,.06)"><span style="font-size:11.5px">' + esc(d.name) + '</span><span class="badge ' + (d.status === "reviewed" ? "badge--ok" : "badge--outline") + '">' + esc(d.status) + "</span></div>";
                  }).join("") + "</div></div>" +
                '<div class="dash-col"><p class="micro">Review action</p>' +
                  '<div class="row row--wrap" style="gap:6px;margin-top:10px">' +
                    '<button class="tbtn tbtn--ok">Approve</button><button class="tbtn">Request changes</button><button class="tbtn tbtn--no">Return</button>' +
                  "</div>" +
                  '<p class="cd__fine" style="margin-top:10px">Sign-off requires a faculty account and is recorded in the audit trail.</p>' +
                "</div>" +
              "</div>" +
            "</section>";
          }).join("")
      }));
    });
  };

  C.portal.uniProfile = function () {
    var u = user();
    C.mountDash(C.dashShell({
      role: "university", base: root() + "universities/index.html",
      title: "Institution profile",
      sub: "Departments, research areas, facilities and the faculty who supervise.",
      body:
        '<div class="dash-grid">' +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">Institution</p>' +
            '<div class="field" style="margin-top:10px"><label>Name</label><input type="text" value="' + esc(u.org || "") + '" placeholder="Institution name"></div>' +
            '<div class="field" style="margin-top:14px"><label>City</label><input type="text" placeholder="e.g. Tiruchirappalli"></div>' +
            '<div class="field" style="margin-top:14px"><label>Verification status</label>' +
              '<div class="row" style="gap:8px"><span class="badge badge--warn">Unverified</span><span class="cd__fine" style="margin:0">Confirmed against a registry before any challenge can be accepted.</span></div></div>' +
            '<button class="btn btn--primary btn--sm" style="margin-top:18px" id="saveUni"><span>Save changes</span></button>' +
          "</section></div>" +
          '<div class="dash-col">' +
            '<section class="panel"><p class="micro">Departments</p>' +
              '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                ["Civil Engineering", "Environmental Science", "Public Health", "Data Science", "Mechanical Engineering"].map(function (d) { return '<span class="chip chip--static">' + esc(d) + "</span>"; }).join("") +
              "</div>" +
              '<p class="cd__fine" style="margin-top:12px">Departments determine which challenges can be routed to you.</p>' +
            "</section>" +
            '<section class="panel" style="margin-top:16px"><p class="micro">Faculty supervisors</p>' +
              '<div class="member-list" style="margin-top:10px">' +
                ['Dr. Priya Raghunathan · Agricultural Engineering', 'Prof. S. Kulkarni · Electrical', 'Dr. A. Fernandes · Public Health'].map(function (f) {
                  return '<div class="member"><span class="av av--amber">' + esc(C.initials(f)) + '</span><div><p class="member__name">' + esc(f.split(" · ")[0]) + '</p><p class="member__role">' + esc(f.split(" · ")[1]) + "</p></div></div>";
                }).join("") +
              "</div>" +
            "</section>" +
            '<section class="panel" style="margin-top:16px"><p class="micro">Research areas</p>' +
              '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                ["Groundwater contamination", "Urban flood modelling", "Dryland agriculture", "WASH behaviour"].map(function (d) { return '<span class="chip chip--static">' + esc(d) + "</span>"; }).join("") +
              "</div>" +
            "</section>" +
          "</div>" +
        "</div>"
    }));
    var s = document.getElementById("saveUni");
    if (s) s.addEventListener("click", function () { C.toast("Institution profile changes need the partner service.", "err"); });
  };

  /* ==========================================================
     INDUSTRY
     ========================================================== */
  C.portal.indHome = function () {
    var all = C.Data.allChallenges();
    C.Data.listProjects().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "industry", base: root() + "industry/index.html",
        title: "Partner overview",
        sub: "Where your capability would unblock a project that is already moving.",
        body:
          '<div class="pf-hero" style="margin-bottom:22px">' +
            '<div><h2>' + esc(user().org || "Your organisation") + "</h2>" +
            '<p>Offer profile: testing · fabrication · mentorship · deployment support</p></div>' +
            '<span class="badge badge--ok">Verified partner</span>' +
          "</div>" +

          '<div class="metric-strip" style="margin-bottom:22px">' +
            metric("Support requests", 3, "Open to your profile") +
            metric("Active collaborations", 2, "1 awaiting agreement") +
            metric("Milestones blocked", 1, "Needs testing capacity") +
            metric("Contributions", 4, "Recorded this cycle") +
          "</div>" +

          '<div class="dash-grid">' +
            '<div class="dash-col">' +
              '<section class="panel">' +
                sectionHead("Requests matched to your capability", '<a class="link-amber" href="' + root() + 'industry/opportunities/">All ↗</a>') +
                '<p class="small" style="margin-bottom:14px">Each request states the exact constraint it is trying to lift. Offers are non-binding until a written agreement is recorded.</p>' +
                [
                  ["PR-1042", "IP65 enclosure testing", "Needs a spray and dust test rig for 12 units before field deployment.", "Testing"],
                  ["PR-1039", "Luminaire batch fabrication", "Two-pole trial succeeded; municipal scale-up needs 40 units at a known unit cost.", "Fabrication"],
                  ["CH-2405", "Drain survey equipment", "Team needs a flow meter and total station for a two-week survey.", "Equipment"]
                ].map(function (r) {
                  return '<div class="invite">' +
                    '<div class="row row--between" style="align-items:flex-start"><div style="min-width:0">' +
                      '<p class="micro">' + esc(r[0]) + " · " + esc(r[3]) + "</p>" +
                      '<p style="font-size:13px;margin:6px 0 4px;color:var(--ink)">' + esc(r[1]) + "</p>" +
                      '<p class="cd__fine" style="margin:0">' + esc(r[2]) + "</p>" +
                    "</div></div>" +
                    '<div class="row" style="gap:6px;margin-top:10px"><button class="tbtn tbtn--ok">Offer support</button><button class="tbtn">Ask a question</button></div>' +
                  "</div>";
                }).join("") +
              "</section>" +
            "</div>" +

            '<div class="dash-col">' +
              '<section class="panel">' +
                '<p class="micro">Your offer profile</p>' +
                '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                  ["Prototype testing", "CNC / fabrication", "Pilot deployment", "Mentorship", "Lab access"].map(function (o) { return '<span class="chip chip--static">' + esc(o) + "</span>"; }).join("") +
                "</div>" +
                '<a class="link-amber" href="' + root() + 'industry/profile/" style="display:inline-block;margin-top:12px;font-size:10.5px">Edit offer profile ↗</a>' +
              "</section>" +
              '<section class="panel" style="margin-top:16px">' +
                '<p class="micro">Collision check</p>' +
                '<p class="cd__fine" style="margin-top:8px">Your organisation is not currently listed as a supplier on any challenge you have been matched to. Where a conflict exists, the platform flags it before an offer is recorded.</p>' +
              "</section>" +
              '<section class="panel" style="margin-top:16px">' +
                '<p class="micro">Funding</p>' +
                '<p class="cd__fine" style="margin-top:8px">Funding offers are recorded as <b style="color:var(--ink-dim)">proposed</b> until a signed agreement exists. No project on this platform is presented as funded.</p>' +
              "</section>" +
            "</div>" +
          "</div>"
      }));
    });
  };

  C.portal.indOpportunities = function () {
    var all = C.Data.allChallenges();
    C.mountDash(C.dashShell({
      role: "industry", base: root() + "industry/index.html",
      title: "Support opportunities",
      sub: "Challenges where an industry contribution would change the outcome.",
      body:
        '<div class="panel"><div class="table-wrap"><table class="table">' +
          "<thead><tr><th>Challenge</th><th>Stage</th><th>Constraint</th><th>Contribution sought</th><th></th></tr></thead><tbody>" +
          all.slice(0, 8).map(function (c, i) {
            var needs = ["Testing capacity", "Fabrication at unit cost", "Deployment partner", "Field equipment", "Mentorship"][i % 5];
            return "<tr><td><a class=\"table__link\" href=\"" + C.chURL(c) + "\">" + esc(c.title) + '</a><span class="table__sub">' + esc(c.id) + " · " + esc(c.location) + "</span></td>" +
              '<td><span class="badge badge--info">' + esc(C.stageLabel(c)) + "</span></td>" +
              '<td style="font-size:11px;color:var(--ink-faint)">' + esc(c.summary.slice(0, 90)) + "…</td>" +
              "<td>" + esc(needs) + "</td>" +
              '<td class="table-actions"><button class="tbtn">Offer</button></td></tr>';
          }).join("") +
        "</tbody></table></div></div>" +
        '<p class="cd__fine" style="margin-top:14px">Contributions are recorded against the project and attributed to your organisation only after the team accepts the offer.</p>'
    }));
  };

  C.portal.indProjects = function () {
    C.Data.listProjects().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "industry", base: root() + "industry/index.html",
        title: "Collaborations",
        sub: "Projects where you have offered support, and what is waiting on you.",
        body:
          ps.map(function (p, i) {
            return '<section class="panel" style="margin-bottom:16px">' +
              '<div class="row row--between" style="align-items:flex-start;margin-bottom:12px">' +
                '<div><p class="micro">' + esc(p.id) + '</p><h2 class="h4" style="margin:6px 0 4px">' + esc(p.title) + "</h2>" +
                '<p class="small">' + esc(p.university) + " · Lead " + esc(p.lead) + "</p></div>" +
                '<span class="badge ' + (i === 0 ? "badge--warn" : "badge--ok") + '">' + (i === 0 ? "Awaiting agreement" : "Agreement recorded") + "</span>" +
              "</div>" +
              '<div class="dash-grid dash-grid--tight">' +
                '<div class="dash-col"><p class="micro">Your contribution</p>' +
                  '<p class="cd__p" style="font-size:12.5px;margin-top:8px">' + esc(["Testing and validation of enclosure units", "Batch fabrication at agreed unit cost", "Inspection support and documentation review"][i % 3]) + "</p></div>" +
                '<div class="dash-col"><p class="micro">Next milestone</p>' +
                  '<p class="cd__v" style="margin-top:8px;font-size:12.5px">' + esc(p.milestones.filter(function (m) { return m.status !== "done"; })[0] ? p.milestones.filter(function (m) { return m.status !== "done"; })[0].title : "None") + "</p></div>" +
              "</div>" +
              '<p class="cd__fine" style="margin-top:12px">Reporting is limited to what the team has actually recorded. No outcome is attributed to your organisation before verification.</p>' +
            "</section>";
          }).join("")
      }));
    });
  };

  C.portal.indProfile = function () {
    var u = user();
    C.mountDash(C.dashShell({
      role: "industry", base: root() + "industry/index.html",
      title: "Partner profile",
      sub: "What you can offer, and how you are verified.",
      body:
        '<div class="dash-grid">' +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">Organisation</p>' +
            '<div class="field" style="margin-top:10px"><label>Name</label><input type="text" value="' + esc(u.org || "") + '"></div>' +
            '<div class="field" style="margin-top:14px"><label>Type</label><select><option>Startup</option><option selected>Small / medium enterprise</option><option>Large enterprise</option><option>Industry association</option></select></div>' +
            '<div class="field" style="margin-top:14px"><label>Verification</label><div class="row" style="gap:8px"><span class="badge badge--ok">Verified</span><span class="cd__fine" style="margin:0">Registry match on legal name and GSTIN.</span></div></div>' +
            '<button class="btn btn--primary btn--sm" style="margin-top:18px"><span>Save profile</span></button>' +
          "</section></div>" +
          '<div class="dash-col">' +
            '<section class="panel"><p class="micro">Capabilities offered</p>' +
              '<div class="row row--wrap" style="gap:5px;margin-top:10px">' +
                ["Prototype testing", "Fabrication", "CNC machining", "Pilot deployment", "Mentorship", "Lab access"].map(function (o) { return '<span class="chip chip--static">' + esc(o) + "</span>"; }).join("") +
              "</div></section>" +
            '<section class="panel" style="margin-top:16px"><p class="micro">Constraints</p>' +
              '<p class="cd__fine" style="margin-top:8px">Minimum batch size 20 units · Testing lead time 3 weeks · No direct funding in this prototype.</p></section>' +
            '<section class="panel" style="margin-top:16px"><p class="micro">Contact</p>' +
              '<div class="field" style="margin-top:10px"><label>Partnership contact</label><input type="text" placeholder="Name"></div>' +
              '<div class="field" style="margin-top:12px"><label>Email</label><input type="email" placeholder="partners@example.com"></div></section>' +
          "</div>" +
        "</div>"
    }));
  };

  /* ==========================================================
     ADMIN
     ========================================================== */
  C.portal.adminHome = function () {
    var all = C.Data.allChallenges();
    var s = C.store.read();
    C.mountDash(C.dashShell({
      role: "admin", base: root() + "admin/index.html",
      title: "Administration",
      sub: "Moderation, verification and the audit trail. Every privileged action is recorded.",
      body:
        '<div class="metric-strip" style="margin-bottom:22px">' +
          metric("Challenges", all.length, "All records") +
          metric("Awaiting review", all.filter(function (c) { return c.status !== "validated"; }).length, "Needs a decision") +
          metric("Partners", 6, "1 unverified") +
          metric("Users", (s.users || []).length, "Demo accounts") +
        "</div>" +

        '<div class="dash-grid">' +
          '<div class="dash-col">' +
            '<section class="panel">' +
              sectionHead("Moderation queue", '<a class="link-amber" href="' + root() + 'admin/challenges/">All challenges ↗</a>') +
              '<div class="table-wrap"><table class="table"><thead><tr><th>Challenge</th><th>Status</th><th>Priority</th><th>Action</th></tr></thead><tbody>' +
                all.filter(function (c) { return c.status !== "validated"; }).map(function (c) {
                  return "<tr><td><a class=\"table__link\" href=\"" + C.chURL(c) + "\">" + esc(c.title) + '</a><span class="table__sub">' + esc(c.id) + " · " + esc(c.location) + "</span></td>" +
                    '<td><span class="badge ' + (c.status === "under_review" ? "badge--warn" : "badge--info") + '">' + esc(c.status.replace("_", " ")) + "</span></td>" +
                    '<td><span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span></td>" +
                    '<td class="table-actions"><button class="tbtn tbtn--ok" data-mod="validate">Validate</button><button class="tbtn" data-mod="info">Request info</button></td></tr>';
                }).join("") +
              "</tbody></table></div>" +
            "</section>" +

            '<section class="panel" style="margin-top:18px">' +
              sectionHead("Audit history") +
              '<div class="audit" id="auditList"></div>' +
            "</section>" +
          "</div>" +

          '<div class="dash-col">' +
            '<section class="panel">' +
              '<p class="micro">Duplicate review</p>' +
              '<p class="cd__fine" style="margin-top:8px">One possible duplicate pair is flagged. The AI flagged it; a moderator decides.</p>' +
              '<div class="invite" style="margin-top:12px">' +
                '<p class="micro">CH-2418 ↔ CH-2391 · 82% text similarity</p>' +
                '<p class="cd__fine" style="margin-top:6px">Same ward, same water source, filed 19 days apart. Merging credits both reporters.</p>' +
                '<div class="row" style="gap:6px;margin-top:10px"><button class="tbtn tbtn--ok">Merge</button><button class="tbtn">Keep separate</button></div>' +
              "</div>" +
            "</section>" +
            '<section class="panel" style="margin-top:16px">' +
              '<p class="micro">Partner verification</p>' +
              '<div class="invite" style="margin-top:12px">' +
                '<p style="font-size:12.5px;margin:0">Northline Precision Castings</p>' +
                '<p class="cd__fine" style="margin-top:4px">Registry match pending · no GSTIN on file</p>' +
                '<div class="row" style="gap:6px;margin-top:10px"><button class="tbtn tbtn--ok">Verify</button><button class="tbtn tbtn--no">Reject</button></div>' +
              "</div>" +
              '<a class="link-amber" href="' + root() + 'admin/partners/" style="display:inline-block;margin-top:12px;font-size:10.5px">All partners ↗</a>' +
            "</section>" +
            '<section class="panel" style="margin-top:16px">' +
              '<p class="micro">Role assignment</p>' +
              '<p class="cd__fine" style="margin-top:8px">Roles are assigned here and enforced by the backend on every request. Hiding a button is not access control.</p>' +
              '<a class="link-amber" href="' + root() + 'admin/users/" style="display:inline-block;margin-top:10px;font-size:10.5px">Manage users ↗</a>' +
            "</section>" +
          "</div>" +
        "</div>"
    }));

    renderAudit();
    document.querySelectorAll("[data-mod]").forEach(function (b) {
      b.addEventListener("click", function () {
        C.toast("Moderation writes require the moderation service. Demo interface only.", "err");
      });
    });
  };

  function renderAudit() {
    var host = document.getElementById("auditList");
    if (!host) return;
    var s = C.store.read();
    var rows = (s.audit || []).slice(0, 10);
    if (!rows.length) {
      host.innerHTML = '<p class="small">No audit entries yet in this browser.</p>';
      return;
    }
    host.innerHTML = rows.map(function (a) {
      var d = new Date(a.at);
      return '<div class="audit__row"><span class="audit__t">' + d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " " +
        d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + "</span>" +
        '<span class="audit__a">' + esc(a.actor) + "</span>" +
        '<span class="audit__act">' + esc(a.action) + "</span>" +
        '<span class="audit__id">' + esc(a.target) + "</span></div>";
    }).join("");
  }

  C.portal.adminChallenges = function () {
    var all = C.Data.allChallenges();
    C.mountDash(C.dashShell({
      role: "admin", base: root() + "admin/index.html",
      title: "Challenges",
      sub: "All records, with moderation state and priority control.",
      body:
        '<div class="panel"><div class="table-wrap"><table class="table">' +
          "<thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Stage</th><th></th></tr></thead><tbody>" +
          all.map(function (c) {
            return "<tr><td style=\"font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:var(--amber)\">" + esc(c.id) + "</td>" +
              "<td><a class=\"table__link\" href=\"" + C.chURL(c) + "\">" + esc(c.title) + "</a></td>" +
              "<td>" + esc(c.category) + "</td>" +
              '<td><span class="badge">' + esc(c.status.replace("_", " ")) + "</span></td>" +
              '<td><span class="badge ' + C.statusClass(c.urgency) + '"><i></i>' + esc(c.urgency) + "</span></td>" +
              "<td style=\"font-size:11px;color:var(--ink-faint)\">" + esc(C.stageLabel(c)) + "</td>" +
              '<td class="table-actions"><button class="tbtn">Edit</button><button class="tbtn tbtn--no">Hide</button></td></tr>';
          }).join("") +
        "</tbody></table></div></div>" +
        '<p class="cd__fine" style="margin-top:14px">Priority and status changes are written to the audit trail with the acting user. The table is read-only in this prototype.</p>'
    }));
  };

  C.portal.adminProjects = function () {
    C.Data.listProjects().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "admin", base: root() + "admin/index.html",
        title: "Projects",
        sub: "Lifecycle position of every active project.",
        body:
          '<div class="panel"><div class="table-wrap"><table class="table">' +
            "<thead><tr><th>Project</th><th>Stage</th><th>University</th><th>Team</th><th>Impact state</th></tr></thead><tbody>" +
            ps.map(function (p) {
              return "<tr><td><a class=\"table__link\">" + esc(p.title) + '</a><span class="table__sub">' + esc(p.id) + " · " + esc(p.challengeId) + "</span></td>" +
                '<td><span class="badge badge--info">' + esc(badgeFor(p.stage)) + "</span></td>" +
                "<td>" + esc(p.university) + "</td><td>" + p.team.length + "</td>" +
                '<td><span class="badge badge--outline">Planned only</span></td></tr>';
            }).join("") +
          "</tbody></table></div></div>" +
          '<div class="note" style="margin-top:16px"><b>No project on this platform has a verified impact measurement.</b> The lifecycle component shows stage, not outcome. Impact records require a named verifier and a measurement date before they can be marked verified.</div>'
      }));
    });
  };

  C.portal.adminUsers = function () {
    C.seedUsers();
    var s = C.store.read();
    C.mountDash(C.dashShell({
      role: "admin", base: root() + "admin/index.html",
      title: "Users & roles",
      sub: "Who has access to what. Roles are enforced server-side in production.",
      body:
        '<div class="panel"><div class="table-wrap"><table class="table">' +
          "<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organisation</th><th>Created</th></tr></thead><tbody>" +
          (s.users || []).map(function (u) {
            return "<tr><td>" + esc(u.name) + "</td><td style=\"font-size:11px;color:var(--ink-faint)\">" + esc(u.email) + "</td>" +
              '<td><span class="badge badge--outline">' + esc(C.ROLE_LABEL[u.role] || u.role) + "</span></td>" +
              "<td>" + esc(u.org || "—") + "</td><td style=\"font-size:11px\">" + C.fmtDate(u.createdAt) + "</td></tr>";
          }).join("") +
        "</tbody></table></div></div>" +
        '<div class="note note--warn" style="margin-top:16px"><b>Prototype credential store.</b> These accounts exist in this browser with plaintext passwords for demonstration. That is never acceptable in production: passwords must be hashed server-side, and roles must be assigned and enforced by an authorisation service.</div>'
    }));
  };

  C.portal.adminPartners = function () {
    C.Data.listPartners().then(function (ps) {
      C.mountDash(C.dashShell({
        role: "admin", base: root() + "admin/index.html",
        title: "Partners",
        sub: "Universities, industry and government organisations.",
        body:
          '<div class="panel"><div class="table-wrap"><table class="table">' +
            "<thead><tr><th>Organisation</th><th>Type</th><th>City</th><th>Focus</th><th>Verification</th><th></th></tr></thead><tbody>" +
            ps.map(function (p) {
              return "<tr><td>" + esc(p.name) + '<span class="table__sub">' + esc(p.id) + "</span></td>" +
                "<td>" + esc(p.type) + "</td><td>" + esc(p.city) + "</td>" +
                '<td style="font-size:11px;color:var(--ink-faint)">' + esc(p.focus.join(", ")) + "</td>" +
                '<td><span class="badge ' + (p.verified ? "badge--ok" : "badge--warn") + '">' + esc(p.status) + "</span></td>" +
                '<td class="table-actions"><button class="tbtn">Review</button></td></tr>';
            }).join("") +
          "</tbody></table></div></div>" +
          '<p class="cd__fine" style="margin-top:14px">Verification is a registry match on legal name and registration identifier. Unverified partners can browse but cannot accept challenges.</p>'
      }));
    });
  };

  C.portal.adminAnalytics = function () {
    var all = C.Data.allChallenges();
    var s = C.store.read();
    var byCat = {};
    all.forEach(function (c) { byCat[c.category] = (byCat[c.category] || 0) + 1; });
    var byState = {};
    all.forEach(function (c) { if (c.state) byState[c.state] = (byState[c.state] || 0) + 1; });
    var maxCat = Math.max.apply(null, Object.keys(byCat).map(function (k) { return byCat[k]; }));

    C.mountDash(C.dashShell({
      role: "admin", base: root() + "admin/index.html",
      title: "Analytics",
      sub: "Distribution across domains and districts. Counts only — no impact claims.",
      body:
        '<div class="metric-strip" style="margin-bottom:22px">' +
          metric("Reports", all.length, "All time") +
          metric("Validated", all.filter(function (c) { return c.status === "validated"; }).length, "Published") +
          metric("Districts", Object.keys(byState).length, "Reporting") +
          metric("Interests", all.reduce(function (a, c) { return a + (c.interest || 0); }, 0), "Expressed") +
        "</div>" +
        '<div class="dash-grid">' +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">Reports by category</p>' +
            '<div class="chart chart__wrap" style="margin-top:18px">' +
              Object.keys(byCat).map(function (k) {
                var h = Math.max(6, (byCat[k] / maxCat) * 100);
                return '<div class="chart__bar" style="height:' + h + '%" title="' + esc(k) + ": " + byCat[k] + '"><span>' + esc(k.slice(0, 7)) + "</span></div>";
              }).join("") +
            "</div>" +
            '<p class="cd__fine" style="margin-top:10px">Demo counts across ' + Object.keys(byCat).length + " categories.</p>" +
          "</section></div>" +
          '<div class="dash-col"><section class="panel">' +
            '<p class="micro">Reports by district</p>' +
            '<div class="bar-list" style="margin-top:14px">' +
              Object.keys(byState).map(function (k) {
                var m = Math.max.apply(null, Object.keys(byState).map(function (x) { return byState[x]; }));
                return bar(k, byState[k] / m);
              }).join("") +
            "</div>" +
          "</section></div>" +
        "</div>" +
        '<section class="panel" style="margin-top:18px">' +
          '<p class="micro">Participation funnel</p>' +
          '<div class="bar-list" style="margin-top:14px">' +
            bar("Reports received", 1) +
            bar("Validated", 0.62) +
            bar("Institution accepted", 0.34) +
            bar("Team formed", 0.27) +
            bar("Prototype built", 0.15) +
            bar("Impact measured", 0.03) +
          "</div>" +
          '<p class="cd__fine" style="margin-top:12px">Illustrative funnel for the demo dataset. The final step is deliberately near-flat because no project in this build has a verified impact measurement — which is the honest state of a young portfolio.</p>' +
        "</section>"
    }));
  };

  /* ==========================================================
     shared project detail for portals
     ========================================================== */
  C.portal.projectDetail = function (role) {
    var id = C.param("id", "");
    C.Data.listProjects().then(function (ps) {
      var p = ps.filter(function (x) { return x.id === id; })[0] || ps[0];
      C.mountDash(C.dashShell({
        role: role, base: root() + (role === "university" ? "universities/" : role === "industry" ? "industry/" : "students/"),
        title: p.title,
        sub: p.id + " · " + p.lead + " · " + p.university,
        body:
          '<div class="panel" style="margin-bottom:18px">' + C.lifecycle(p.stage) + "</div>" +
          '<div class="dash-grid"><div class="dash-col"><section class="panel">' +
            '<p class="micro">Summary</p><p class="cd__p" style="margin-top:8px">' + esc(p.summary) + "</p>" +
            '<div class="divider" style="margin:16px 0"></div><p class="micro">Milestones</p>' +
            p.milestones.map(function (m) {
              return '<div class="milestone ' + (m.status === "done" ? "is-done" : m.status === "active" ? "is-active" : "") + '"><span class="milestone__dot"></span><div style="flex:1"><p class="milestone__t">' + esc(m.title) + '</p><span class="milestone__d">' + esc(m.date) + "</span></div>" +
                '<span class="badge ' + (m.status === "done" ? "badge--ok" : m.status === "active" ? "badge--warn" : "badge--outline") + '">' + esc(m.status) + "</span></div>";
            }).join("") +
          '</section></div><div class="dash-col"><section class="panel">' +
            '<p class="micro">Team</p><div class="member-list" style="margin-top:10px">' + p.team.map(function (n, i) {
              return '<div class="member"><span class="av">' + esc(C.initials(n)) + '</span><div><p class="member__name">' + esc(n) + '</p><p class="member__role">' + (i === 0 ? "Lead" : "Contributor") + "</p></div></div>";
            }).join("") + "</div>" +
            '<div class="divider" style="margin:14px 0"></div><p class="micro">Impact</p>' +
            '<div class="imp-row"><span class="imp-row__k">Planned</span><span class="imp-row__v">' + esc(p.impact.planned) + "</span></div>" +
            '<div class="imp-row"><span class="imp-row__k">Verified</span><span class="imp-row__v" style="color:var(--ink-ghost)">Not measured</span></div>' +
          "</section></div></div>"
      }));
    });
  };
})();
