/* ============================================================
   CATALYST — public pages
   explore · challenge detail · how it works · about · report
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;
  var esc = C.esc;
  C.pages = C.pages || {};

  /* ==========================================================
     EXPLORE
     ========================================================== */
  var state = { q: "", category: "all", urgency: "all", status: "all", location: "all", skill: "all", sort: "newest", page: 1, per: 9, view: "grid" };

  C.pages.explore = function () {
    var main = document.getElementById("main");
    var all = C.Data.allChallenges();
    var cats = uniq(all.map(function (c) { return c.category; }));
    var states = uniq(all.map(function (c) { return c.state; }).filter(Boolean)).sort();
    var skills = uniq(all.reduce(function (a, c) { return a.concat(c.skills); }, [])).sort();

    /* seed from URL */
    ["q", "category", "urgency", "status", "location", "skill", "sort", "view"].forEach(function (k) {
      var v = C.param(k);
      if (v) state[k] = v;
    });

    main.innerHTML =
      '<section class="page-hero">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">Explore problems <b>·</b> Community board</p>' +
          '<h1 class="h1">Community<br>problems.</h1>' +
          '<p class="lede">Every open problem reported to Catalyst, with the evidence attached to it. Filter by what you can actually contribute, not just by topic.</p>' +
          '<div class="page-hero__meta">' +
            '<span class="badge badge--demo">Demo records</span>' +
            '<span class="badge">' + all.length + ' problems</span>' +
            '<span class="badge">' + states.length + ' states</span>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="explore-bar">' +
        '<div class="explore-bar__inner">' +
          '<div class="search-field">' +
            '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5.6"/><path d="M13.2 13.2L17 17"/></svg>' +
            '<input type="search" id="exSearch" placeholder="Search title, description, location, expertise…" aria-label="Search problems" value="' + esc(state.q) + '">' +
          '</div>' +
          '<button class="filter-toggle" id="filterToggle">Filters <span id="filterCount"></span></button>' +
          '<div class="segmented" id="viewToggle" role="group" aria-label="View mode">' +
            '<button data-view="grid" class="is-active">Grid</button>' +
            '<button data-view="list">List</button>' +
          '</div>' +
          '<select class="select" id="sortSel" aria-label="Sort by" style="width:auto;min-width:150px;padding:9px 34px 9px 12px;font-size:11px;border:1px solid var(--line);background-color:transparent">' +
            '<option value="newest">Newest first</option>' +
            '<option value="urgency">Urgency</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="wrap">' +
        '<div class="explore-body">' +
          '<aside class="filters" id="filters" aria-label="Filters">' +
            '<div class="filters__group"><span class="filters__label">Category</span>' +
              sel("fCategory", [["all", "All categories"]].concat(cats.map(function (c) { return [c, c]; }))) + '</div>' +
            '<div class="filters__group"><span class="filters__label">Urgency</span>' +
              sel("fUrgency", [["all", "Any urgency"], ["Critical", "Critical"], ["High", "High"], ["Medium", "Medium"]]) + '</div>' +
            '<div class="filters__group"><span class="filters__label">Status</span>' +
              sel("fStatus", [["all", "Any status"], ["submitted", "Submitted"], ["under_review", "Under review"], ["validated", "Validated"]]) + '</div>' +
            '<div class="filters__group"><span class="filters__label">Location</span>' +
              sel("fLocation", [["all", "All states"]].concat(states.map(function (s) { return [s, s]; }))) + '</div>' +
            '<div class="filters__group"><span class="filters__label">Relevant expertise</span>' +
              sel("fSkill", [["all", "Any skill"]].concat(skills.map(function (s) { return [s, s]; }))) + '</div>' +
            '<button class="filters__reset" id="fReset">Reset all filters</button>' +
            '<p class="filters__count" id="fCount"></p>' +
          '</aside>' +
          '<div class="explore-main">' +
            '<div class="explore-head">' +
              '<p class="explore-count" id="exCount">Loading…</p>' +
              '<span class="badge badge--outline" id="exMode">Grid view</span>' +
            '</div>' +
            '<div class="explore-active" id="exActive"></div>' +
            '<div id="exResults" aria-live="polite"></div>' +
            '<div class="pager" id="exPager"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function sel(id, opts) {
      return '<select id="' + id + '">' + opts.map(function (o) {
        return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>";
      }).join("") + "</select>";
    }
    function uniq(a) { return a.filter(function (v, i, s) { return v && s.indexOf(v) === i; }); }

    var results = document.getElementById("exResults");
    var pager = document.getElementById("exPager");
    var countEl = document.getElementById("exCount");
    var activeEl = document.getElementById("exActive");

    /* restore selections */
    [["fCategory", "category"], ["fUrgency", "urgency"], ["fStatus", "status"], ["fLocation", "location"], ["fSkill", "skill"]].forEach(function (p) {
      var n = document.getElementById(p[0]);
      if (n && state[p[1]]) n.value = state[p[1]];
    });
    var sortSel = document.getElementById("sortSel");
    if (sortSel) sortSel.value = state.sort;

    /* loading skeleton on first load */
    results.innerHTML = C.skeletonCards(6, 3);
    countEl.textContent = "Loading problems…";

    function activeChips() {
      var chips = [];
      if (state.category !== "all") chips.push(["category", "Category: " + state.category]);
      if (state.urgency !== "all") chips.push(["urgency", "Urgency: " + state.urgency]);
      if (state.status !== "all") chips.push(["status", "Status: " + state.status.replace("_", " ")]);
      if (state.location !== "all") chips.push(["location", state.location]);
      if (state.skill !== "all") chips.push(["skill", state.skill]);
      if (state.q) chips.push(["q", "“" + state.q + "”"]);
      activeEl.innerHTML = chips.map(function (c) {
        return '<span class="active-chip">' + esc(c[1]) + '<button data-clear="' + c[0] + '" aria-label="Remove filter">×</button></span>';
      }).join("");
      document.getElementById("filterCount").textContent = chips.length ? "(" + chips.length + ")" : "";
    }

    function load() {
      activeChips();
      C.Data.listChallenges({
        q: state.q, category: state.category, urgency: state.urgency,
        status: state.status, location: state.location, skill: state.skill,
        sort: state.sort, page: state.page, per: state.per
      }).then(function (res) {
        countEl.innerHTML = "<b>" + res.total + "</b> problem" + (res.total === 1 ? "" : "s") +
          (res.total ? " · showing " + ((res.page - 1) * res.per + 1) + "–" + Math.min(res.total, res.page * res.per) : "");
        document.getElementById("exMode").textContent = state.view === "grid" ? "Grid view" : "List view";

        if (!res.total) {
          results.innerHTML = C.emptyState({
            title: "No problems match those filters",
            text: "Try removing a filter, widening the location, or searching for a broader term. New reports are added continuously.",
            icon: '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg>',
            action: '<button class="btn btn--ghost btn--sm" id="emptyReset"><span>Clear all filters</span></button>'
          });
          var er = document.getElementById("emptyReset");
          if (er) er.addEventListener("click", reset);
          pager.innerHTML = "";
          return;
        }

        results.innerHTML = state.view === "grid"
          ? '<div class="grid grid--3">' + res.items.map(function (c) { return C.challengeCard(c); }).join("") + "</div>"
          : '<div class="challenge-list">' + res.items.map(C.challengeRow).join("") + "</div>";
        C.reveals(results);

        /* pagination */
        pager.innerHTML = "";
        if (res.pages > 1) {
          var html = '<button ' + (res.page === 1 ? "disabled" : "") + ' data-page="' + (res.page - 1) + '" aria-label="Previous page">←</button>';
          for (var i = 1; i <= res.pages; i++) {
            html += '<button data-page="' + i + '"' + (i === res.page ? ' class="is-active"' : "") + '>' + i + "</button>";
          }
          html += '<button ' + (res.page === res.pages ? "disabled" : "") + ' data-page="' + (res.page + 1) + '" aria-label="Next page">→</button>';
          pager.innerHTML = html;
        }
      }).catch(function () {
        countEl.textContent = "Could not load problems";
        results.innerHTML = C.emptyState({
          error: true, title: "The problem board did not load",
          text: "This is a data-layer error, not an empty board. Check your connection and try again.",
          icon: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M10 6v5M10 13.6v.4"/></svg>',
          action: '<button class="btn btn--ghost btn--sm" id="retry"><span>Try again</span></button>'
        });
        var rt = document.getElementById("retry");
        if (rt) rt.addEventListener("click", load);
      });
    }

    function reset() {
      state = { q: "", category: "all", urgency: "all", status: "all", location: "all", skill: "all", sort: "newest", page: 1, per: 9, view: state.view };
      document.getElementById("exSearch").value = "";
      ["fCategory", "fUrgency", "fStatus", "fLocation", "fSkill"].forEach(function (id) { document.getElementById(id).value = "all"; });
      load();
    }

    /* events */
    var search = document.getElementById("exSearch");
    search.addEventListener("input", C.debounce(function () {
      state.q = search.value.trim();
      state.page = 1;
      load();
    }, 260));

    [["fCategory", "category"], ["fUrgency", "urgency"], ["fStatus", "status"], ["fLocation", "location"], ["fSkill", "skill"]].forEach(function (p) {
      document.getElementById(p[0]).addEventListener("change", function (e) {
        state[p[1]] = e.target.value;
        state.page = 1;
        load();
      });
    });

    sortSel.addEventListener("change", function () { state.sort = sortSel.value; state.page = 1; load(); });

    document.getElementById("viewToggle").addEventListener("click", function (e) {
      var b = e.target.closest("[data-view]");
      if (!b) return;
      state.view = b.getAttribute("data-view");
      C.$$("#viewToggle button").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      load();
    });

    activeEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-clear]");
      if (!b) return;
      var k = b.getAttribute("data-clear");
      state[k] = k === "q" ? "" : "all";
      if (k === "q") search.value = "";
      else {
        var map = { category: "fCategory", urgency: "fUrgency", status: "fStatus", location: "fLocation", skill: "fSkill" };
        if (map[k]) document.getElementById(map[k]).value = "all";
      }
      state.page = 1;
      load();
    });

    pager.addEventListener("click", function (e) {
      var b = e.target.closest("[data-page]");
      if (!b || b.disabled) return;
      state.page = parseInt(b.getAttribute("data-page"), 10);
      load();
      document.querySelector(".explore-body").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("fReset").addEventListener("click", reset);

    var ft = document.getElementById("filterToggle");
    ft.addEventListener("click", function () {
      document.getElementById("filters").classList.toggle("is-open");
    });

    load();
  };

  /* ==========================================================
     CHALLENGE DETAIL
     ========================================================== */
  C.pages.challenge = function () {
    var main = document.getElementById("main");
    main.innerHTML = '<div class="wrap" style="padding-top:calc(var(--nav-h) + 60px)">' + C.skeletonCards(2, 2) + "</div>";

    /* identifier comes from ?id=, with a path-segment fallback */
    var parts = location.pathname.replace(/\/index\.html$/, "").split("/").filter(Boolean);
    var slug = C.param("id") || parts[parts.length - 1] || "";

    C.Data.getChallenge(slug).then(function (c) {
      document.title = c.title + " — CATALYST";
      document.querySelector('meta[name="description"]').setAttribute("content", c.summary);
      main.innerHTML =
        '<div class="breadcrumbs" style="max-width:var(--maxw);margin:0 auto;padding-left:var(--pad);padding-right:var(--pad)">' +
          '<a href="' + C.relRoot() + '">Home</a><span class="sep">/</span>' +
          '<a href="' + C.relRoot() + 'explore/">Challenges</a><span class="sep">/</span>' +
          '<span style="color:var(--ink-dim)">' + esc(c.id) + "</span>" +
        "</div>" +
        C.challengeDetail(c);
      C.bindChallengeActions(main);
    }).catch(function () {
      main.innerHTML = '<div class="nf">' +
        '<div><p class="nf__code">404</p>' +
        '<h1 class="h2">That challenge is not on the board.</h1>' +
        '<p class="lede" style="margin:16px auto 26px">The reference may be mistyped, or the report may have been withdrawn. The board shows every live challenge.</p>' +
        '<div class="row" style="justify-content:center;gap:10px"><a class="btn btn--primary" href="' + C.relRoot() + 'explore/"><span>Explore challenges</span><span class="btn__arrow">↗</span></a>' +
        '<a class="btn btn--ghost" href="' + C.relRoot() + 'report/"><span>Report a problem</span></a></div></div></div>';
    });
  };

  /* ==========================================================
     HOW IT WORKS
     ========================================================== */
  C.pages.how = function () {
    var stages = [
      ["01", "A problem is reported", "A resident, field worker or local institution files what is failing, with photographs, a location and an estimate of who is affected. Reports can be filed without an account, but an account lets the reporter track the response.", ["Citizen", "Field worker", "Institution"], "Output: a challenge record with evidence attached", "Reported conditions are treated as claims until someone verifies them. Nothing is published as an established fact."],
      ["02", "The report is assessed", "Text and images are processed for category, likely severity, scope and the capability the problem demands. A confidence score is produced alongside a written rationale, and possible duplicates are flagged.", ["Automated assessment", "Moderator triage"], "Output: a structured brief with suggested expertise", "This is an initial assessment, not a verdict. Every record carries a human-validation requirement before it can advance."],
      ["03", "A human validates it", "A moderator — or a partner authority where one is configured — reviews the evidence, corrects the category and severity, merges duplicates, and records the reason for the decision.", ["Moderator", "Partner authority"], "Output: validated or returned-for-information status", "Only validated challenges can be matched to institutions. The validation decision and its author are kept in the audit trail."],
      ["04", "Expertise is matched", "Departments, labs and individual researchers are suggested with the reason for each suggestion — a lab within reach, a relevant research programme, prior work in the same district. Suggestions are invitations, never assignments.", ["University", "Faculty"], "Output: invited institutions with stated fit", "No institution is shown as matched until it has accepted. Declined and unanswered invitations are visible to moderators."],
      ["05", "A team forms", "A faculty supervisor and a multidisciplinary student team are assembled around the challenge. Roles, missing skills and availability are explicit, and the team is recorded against the challenge.", ["Students", "Mentor"], "Output: team roster with defined roles", "Students apply; they are not assigned. A place on a team is a reviewed decision, not an automatic entitlement."],
      ["06", "A proposal is written", "The team states the problem in its own words, sets a scope it can actually deliver, chooses a method, and defines what success would look like before any work starts.", ["Team", "Mentor"], "Output: reviewed proposal with milestones", "A proposal that cannot name its baseline or its measurement method is sent back, not approved."],
      ["07", "A prototype is built", "Software, hardware, field instrument or process — the team builds the smallest thing that can test the core assumption, and documents what it cost and what it could not do.", ["Team", "Industry partner"], "Output: prototype plus build documentation", "Prototype work is reviewed at milestones. Reviews are recorded with the reviewer's name."],
      ["08", "It is tested in the field", "The prototype goes back to the community it was built for. The team measures against the baseline established in the proposal and records what changed, including what got worse.", ["Community", "Team", "Mentor"], "Output: field results against a baseline", "Field results are reported as measured, not as hoped for. Negative results are kept and published."],
      ["09", "Impact is measured", "People reached, conditions before and after, cost and time, community feedback and supporting evidence are recorded together. A reviewer marks the measurement as self-reported or independently verified.", ["Reviewer", "Partner"], "Output: an impact record with a verification state", "Estimated, planned and verified impact are three different labels. They are never merged into one number."],
      ["10", "The work is handed over", "Deployment, ownership and maintenance are agreed with whoever will run the solution after the project ends. The challenge closes only when someone has taken responsibility for it.", ["Partner", "Community", "Institution"], "Output: handover record and closing review", "If no owner is identified, the challenge stays open rather than being marked complete."]
    ];

    document.getElementById("main").innerHTML =
      '<section class="page-hero">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">How it works <b>·</b> Lifecycle</p>' +
          '<h1 class="h1">From report<br>to result.</h1>' +
          '<p class="lede">Ten stages, each with an owner, an artefact and a checkpoint. A challenge cannot skip a stage — it can only stop at one, visibly.</p>' +
          '<div class="page-hero__meta"><span class="badge">10 stages</span><span class="badge">12 system states</span><span class="badge badge--outline">Human validation at every gate</span></div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--flush"><div class="wrap">' +
        '<div class="note" style="max-width:800px;margin-bottom:clamp(30px,4vw,44px)">' +
          '<b>How to read this page.</b> The left column is the stage, the middle is what actually happens and who does it, and the right is the artefact produced and the rule that keeps it honest.' +
        '</div>' +
        stages.map(function (s) {
          return '<div class="hiw-stage reveal">' +
            '<div class="hiw-stage__n">' + s[0] + "</div>" +
            '<div class="hiw-stage__body">' +
              "<h3>" + esc(s[1]) + "</h3>" +
              "<p>" + esc(s[2]) + "</p>" +
              '<div class="hiw-stage__tags">' + s[3].map(function (t) { return '<span class="chip chip--static">' + esc(t) + "</span>"; }).join("") + "</div>" +
            "</div>" +
            '<div class="hiw-stage__aside">' +
              '<span class="micro">' + esc(s[4]) + "</span>" +
              "<p>" + esc(s[5]) + "</p>" +
            "</div>" +
          "</div>";
        }).join("") +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
        C.sectionHead("Who does what", "Four roles, one record.", "Every participant works from the same challenge record. What differs is what each is permitted to change.") +
        '<div class="roles-grid reveal">' +
          roleBlock("Citizen", "Reports the problem and stays in the loop.", ["Files evidence and location", "Confirms whether conditions changed", "Receives status updates on the report"]) +
          roleBlock("Student", "Does the technical and field work.", ["Applies to a challenge", "Joins a supervised team", "Produces deliverables for review", "Builds a contribution record"]) +
          roleBlock("University", "Supplies supervision and method.", ["Accepts or declines invitations", "Assigns a faculty mentor", "Reviews proposals and prototypes", "Signs off field-testing readiness"]) +
          roleBlock("Industry", "Supplies capability at the hard stage.", ["Offers testing, fabrication or deployment", "Mentors on production constraints", "Reviews deliverables for feasibility"]) +
        "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap wrap--narrow">' +
        C.sectionHead("What can go wrong", "The honest failure modes.", "A pipeline that only describes success is a brochure. These are the points where the model breaks.") +
        [
          ["Weak evidence", "A report with no photographs and a vague location is hard to validate. It stays in review rather than being discarded — the reporter is asked for more."],
          ["Duplicate reports", "The same problem filed by five neighbours is one challenge, not five. Duplicates are merged and the original reporters are credited."],
          ["No accepting institution", "Suggested universities can decline. A challenge with no accepting institution stays visible and unmatched rather than being quietly dropped."],
          ["Team attrition", "Student availability changes. Missing skills are tracked explicitly so a team can recruit rather than silently fail."],
          ["Unmeasured impact", "A prototype that shipped but was never measured is reported as deployed, not as impact. The distinction is enforced in the data model."],
          ["No owner at handover", "If nobody agrees to run the solution after the project, the challenge stays open. Closing it would misrepresent the outcome."]
        ].map(function (p, i) {
          return '<div class="principle reveal"><span class="principle__n">' + C.pad(i + 1) + "</span><div><h3>" + esc(p[0]) + "</h3><p>" + esc(p[1]) + "</p></div></div>";
        }).join("") +
      "</div></section>" +

      '<section class="cta-band"><div class="wrap cta-band__inner reveal">' +
        '<p class="eyebrow eyebrow--center">Start anywhere</p>' +
        '<h2 class="h2 cta-band__title">The board is open.</h2>' +
        '<p class="lede cta-band__sub">Read a live challenge, or file one. Both take less than ten minutes.</p>' +
        '<div class="cta-band__actions">' +
          '<a class="btn btn--solid btn--lg" href="' + C.relRoot() + 'explore/"><span>Explore challenges</span><span class="btn__arrow">↗</span></a>' +
          '<a class="btn btn--lg" href="' + C.relRoot() + 'report/"><span>Report a problem</span><span class="btn__arrow">↗</span></a>' +
        "</div>" +
      "</div></section>";
  };

  function roleBlock(title, sub, items) {
    return '<div class="role-block"><h3>' + esc(title) + "</h3><p>" + esc(sub) + "</p><ul>" +
      items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
  }

  /* ==========================================================
     ABOUT
     ========================================================== */
  C.pages.about = function () {
    document.getElementById("main").innerHTML =
      '<section class="page-hero">' +
        '<div class="page-hero__grid" aria-hidden="true"></div>' +
        '<div class="page-hero__inner">' +
          '<p class="eyebrow">About <b>·</b> The model</p>' +
          '<h1 class="h1">Problems are<br>not in short<br>supply.</h1>' +
          '<p class="lede">What is scarce is the machinery that turns a well-evidenced local problem into supervised, testable work — and then into something a community actually keeps using.</p>' +
        '</div>' +
      '</section>' +

      '<section class="section section--flush"><div class="wrap">' +
        '<div class="about-lead">' +
          '<div class="reveal">' +
            '<h2 class="h2" style="margin-bottom:20px">Why Catalyst exists.</h2>' +
            '<p class="lede" style="margin-bottom:18px">Community problems are usually known long before they are solved. A leaking main, a school without a lab, a bridge with missing planks — the information exists at street level and dies there, because there is no route from “we know this is broken” to “someone with the right capability is now working on it”.</p>' +
            '<p class="lede" style="margin-bottom:18px">Universities hold deep expertise and thousands of capable students. Industry holds fabrication, testing and deployment capacity. Both are separated from the problem by distance, incentives and a lack of structured briefs.</p>' +
            '<p class="lede">Catalyst is the connective layer: a structured record of the problem, a reason to believe it is real, and a supervised pathway from analysis to a tested intervention.</p>' +
          "</div>" +
          '<div class="reveal">' +
            '<blockquote class="about-quote">“The bottleneck is not ideas, and it is not talent. It is the handover between the people who know what is broken and the people who know how to fix it.”<span>The premise</span></blockquote>' +
            '<div class="note" style="margin-top:26px"><b>Prototype notice.</b> This build demonstrates the product model. There are no live institutional partnerships, no verified deployments and no measured outcomes behind it. All records are labelled demo data.</div>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
        C.sectionHead("Principles", "Six rules we do not bend.", "These constrain the product more than any feature does.") +
        '<div class="reveal">' +
          [
            ["Evidence before enthusiasm", "A problem is only worth routing when there is something to look at: a photograph, a location, an affected population. Reports without evidence are helped, not published as fact."],
            ["Machines propose, people decide", "Automated assessment is a triage aid. It suggests a category, a severity and a set of skills. A human validates before anything advances."],
            ["No institution is volunteered", "Matching produces invitations with reasons. A university appears as matched only after it has accepted. Suggested is not the same as committed."],
            ["Impact is a measurement, not a claim", "Planned, estimated, self-reported and independently verified are four different states. The interface keeps them apart, and a project cannot promote its own verification."],
            ["Students are contributors, not free labour", "Work is scoped, supervised, credited and reviewed. Students can see what they will learn and what they will own before they commit."],
            ["Nothing closes without an owner", "A solution with no one to run it is not finished. Challenges stay open until responsibility for maintenance is accepted."]
          ].map(function (p, i) {
            return '<div class="principle"><span class="principle__n">' + C.pad(i + 1) + "</span><div><h3>" + esc(p[0]) + "</h3><p>" + esc(p[1]) + "</p></div></div>";
          }).join("") +
        "</div>" +
      "</div></section>" +

      '<section class="section" id="data"><div class="wrap">' +
        '<div class="about-lead">' +
          '<div class="reveal">' +
            C.sectionHead("Data policy", "What we store, and what we do not.", "") +
            '<p class="lede" style="margin-bottom:16px">Reports contain photographs of real places and, sometimes, identifiable people. That carries obligations.</p>' +
            '<ul class="cd__ul" style="font-size:13px;gap:10px">' +
              "<li>Photographs are shown as submitted and marked unauthenticated until a reviewer verifies them.</li>" +
              "<li>Precise coordinates are used for matching and mapping; they are not published as an exact address by default.</li>" +
              "<li>Reporter identity can be withheld from public view while remaining available to moderators.</li>" +
              "<li>Evidence is never sold, and never used to train a third-party model without explicit consent.</li>" +
              "<li>Deletion requests are honoured, except where a record is required for an active institutional review.</li>" +
            "</ul>" +
          "</div>" +
          '<div class="reveal">' +
            C.sectionHead("Roadmap", "What is not built yet.", "") +
            '<div class="principle"><span class="principle__n">01</span><div><h3>Real identity and roles</h3><p>Authentication currently runs against a local demo store. Production requires a real identity provider and server-enforced role assignment.</p></div></div>' +
            '<div class="principle"><span class="principle__n">02</span><div><h3>Institutional verification</h3><p>University and industry accounts must be verified against a registry before they can accept a challenge.</p></div></div>' +
            '<div class="principle"><span class="principle__n">03</span><div><h3>Measured impact</h3><p>Verification workflows, reviewer assignment and evidence audits for impact records.</p></div></div>' +
            '<div class="principle"><span class="principle__n">04</span><div><h3>Regional language support</h3><p>Reporting in the reporter\u2019s own language, with translation on the moderator side.</p></div></div>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      '<section class="section" id="contact"><div class="wrap wrap--narrow">' +
        C.sectionHead("Contact", "Who to talk to.", "") +
        '<div class="roles-grid reveal">' +
          '<div class="role-block"><h3>Citizens &amp; communities</h3><p>Questions about a report, or a problem that needs help describing.</p><p style="color:var(--amber)">community@catalyst.example</p></div>' +
          '<div class="role-block"><h3>Universities</h3><p>Departmental participation, supervision and research collaboration.</p><p style="color:var(--amber)">academic@catalyst.example</p></div>' +
          '<div class="role-block"><h3>Industry</h3><p>Testing, fabrication, deployment partnerships and sponsorship.</p><p style="color:var(--amber)">partners@catalyst.example</p></div>' +
        "</div>" +
        '<p class="cd__fine" style="margin-top:20px">Addresses above are placeholders in this prototype build. They are not monitored.</p>' +
      "</div></section>";
  };

  /* ==========================================================
     REPORT — multi-step wizard
     ========================================================== */
  C.pages.report = function () {
    var main = document.getElementById("main");
    var step = 1;
    var uploader = null;
    var docFile = null;

    var cats = ["Water", "Sanitation", "Healthcare", "Education", "Agriculture", "Infrastructure", "Environment", "Public Safety", "Other"];

    main.innerHTML =
      '<section class="wizard"><div class="wrap">' +
        '<div class="wizard__head">' +
          '<p class="eyebrow">Report <b>·</b> Community intake</p>' +
          '<h1 class="h1" style="font-size:clamp(30px,4.6vw,58px)">Tell us what is broken.</h1>' +
          '<p class="lede">Four steps, about eight minutes. Photographs matter more than prose — they are what lets a reviewer confirm the conditions you are describing.</p>' +
        '</div>' +

        '<div class="steps" id="steps">' +
          '<button class="step-tab is-active" data-step="1"><span class="n"><b>1</b></span><span class="lbl">Describe</span></button>' +
          '<button class="step-tab" data-step="2"><span class="n"><b>2</b></span><span class="lbl">Evidence</span></button>' +
          '<button class="step-tab" data-step="3"><span class="n"><b>3</b></span><span class="lbl">Review</span></button>' +
          '<button class="step-tab" data-step="4"><span class="n"><b>4</b></span><span class="lbl">Assessment</span></button>' +
        '</div>' +

        '<div class="wizard__layout">' +
          '<div class="wizard__panel">' +

            /* ---- STEP 1 ---- */
            '<div class="wizard__step is-on" data-pane="1">' +
              '<h2>Describe the problem</h2>' +
              '<p class="small">Be specific about what is failing and who it affects. Avoid proposing a solution at this stage — we want the condition, not the pitch.</p>' +
              '<div class="wizard__fields">' +
                '<div class="field"><label for="rTitle">Problem title <span class="req">*</span></label>' +
                  '<input type="text" id="rTitle" maxlength="90" placeholder="e.g. Borewell water smells of metal after rain" required>' +
                  '<span class="field__hint"><span id="titleCount">0</span>/90 characters</span>' +
                  '<span class="field__err">Give the problem a short, specific title.</span></div>' +

                '<div class="field"><label for="rDesc">Detailed description <span class="req">*</span></label>' +
                  '<textarea id="rDesc" maxlength="1400" placeholder="What is happening? When did it start? What have you already tried? Who is most affected?" required></textarea>' +
                  '<span class="field__hint"><span id="descCount">0</span>/1400 · minimum 60 characters for a usable brief</span>' +
                  '<span class="field__err">Add at least 60 characters describing the problem.</span></div>' +

                '<div class="field__row">' +
                  '<div class="field"><label for="rCat">Category <span class="req">*</span></label>' +
                    '<select id="rCat" required><option value="">Select a category</option>' +
                    cats.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("") +
                    "</select><span class=\"field__err\">Choose the closest category.</span></div>" +
                  '<div class="field"><label for="rPop">Affected population</label>' +
                    '<input type="text" id="rPop" placeholder="e.g. 3,400 residents across four streets"></div>' +
                "</div>" +

                '<div class="field__row">' +
                  '<div class="field"><label for="rDistrict">District <span class="req">*</span></label>' +
                    '<input type="text" id="rDistrict" placeholder="e.g. Kolar" required>' +
                    '<span class="field__err">District is required for matching.</span></div>' +
                  '<div class="field"><label for="rCity">City / town / village</label>' +
                    '<input type="text" id="rCity" placeholder="e.g. Ward 14"></div>' +
                "</div>" +

                '<div class="field"><label for="rLandmark">Landmark or address detail</label>' +
                  '<input type="text" id="rLandmark" placeholder="e.g. Behind the government school, 3rd cross"></div>' +

                '<div class="field"><label>GPS location</label>' +
                  '<div class="gps-row">' +
                    '<button type="button" class="gps-btn" id="gpsBtn"><svg viewBox="0 0 16 16"><path d="M8 14s5-4.4 5-8A5 5 0 003 6c0 3.6 5 8 5 8z"/><circle cx="8" cy="6" r="1.8"/></svg> Use my location</button>' +
                    '<span class="gps-val" id="gpsVal"></span>' +
                  "</div>" +
                  '<span class="field__hint">Optional. Used to place the challenge on a map and to check whether nearby reports already exist.</span>' +
                "</div>" +

                '<div class="field"><label for="rContext">Additional context</label>' +
                  '<textarea id="rContext" style="min-height:88px" placeholder="Prior complaints, official responses, seasonal patterns, anything a reviewer should know."></textarea></div>' +
              "</div>" +
              '<div class="wizard__nav"><span class="small" style="color:var(--ink-ghost)">Step 1 of 4</span>' +
                '<button class="btn btn--primary" data-next="2"><span>Continue to evidence</span><span class="btn__arrow">↗</span></button></div>' +
            "</div>" +

            /* ---- STEP 2 ---- */
            '<div class="wizard__step" data-pane="2">' +
              '<h2>Attach evidence</h2>' +
              '<p class="small">Photographs are the strongest part of a report. One clear wide shot plus one close-up is usually enough to verify a condition.</p>' +
              '<div class="wizard__fields">' +
                '<div class="field" id="uploadHost"></div>' +
                '<div class="upload-help"><p><b>What makes a photo useful:</b> take it in daylight, include something for scale, and avoid photographing people\u2019s faces unless they have agreed. Wide shot first, then the detail that is broken.</p></div>' +
                '<div class="field" style="margin-top:6px"><label for="rDoc">Optional video or document</label>' +
                  '<div class="drop" style="padding:16px">' +
                    '<p class="drop__title" style="font-size:11.5px">Attach a short clip, inspection report or letter</p>' +
                    '<p class="drop__sub">MP4, PDF or DOCX · up to 25 MB</p>' +
                    '<input type="file" id="rDoc" accept="video/*,.pdf,.doc,.docx" aria-label="Attach a document or video">' +
                  "</div>" +
                  '<div id="docChip"></div>' +
                "</div>" +
                '<div class="note note--info"><b>Prototype limitation.</b> In this build files are held in your browser while you complete the form and are saved with the local challenge record. No file is uploaded to a server, because no storage backend is connected. In production this step posts to a signed upload endpoint and the resulting object keys are attached to the challenge record.</div>' +
              "</div>" +
              '<div class="wizard__nav"><button class="btn btn--ghost" data-back="1"><span>← Back</span></button>' +
                '<button class="btn btn--primary" data-next="3"><span>Review report</span><span class="btn__arrow">↗</span></button></div>' +
            "</div>" +

            /* ---- STEP 3 ---- */
            '<div class="wizard__step" data-pane="3">' +
              '<h2>Review before submitting</h2>' +
              '<p class="small">Check the details below. You can go back and edit any step without losing what you have entered.</p>' +
              '<div class="review" id="reviewList"></div>' +
              '<div class="field" style="margin-top:22px">' +
                '<label class="check"><input type="checkbox" id="rConsent">' +
                  "<span>I confirm this report is accurate to the best of my knowledge, that the photographs are mine to share, and that I understand it will be reviewed before publication.</span></label>" +
                '<span class="field__err" style="margin-top:6px">Please confirm to continue.</span>' +
              "</div>" +
              '<div class="form-error" id="submitErr"></div>' +
              '<div class="wizard__nav"><button class="btn btn--ghost" data-back="2"><span>← Back</span></button>' +
                '<button class="btn btn--primary" id="submitBtn"><span>Submit report</span><span class="btn__arrow">↗</span></button></div>' +
            "</div>" +

            /* ---- STEP 4 ---- */
            '<div class="wizard__step" data-pane="4">' +
              '<div id="successPane"></div>' +
              '<div id="analysisPane" style="margin-top:24px"></div>' +
            "</div>" +

          "</div>" +

          '<aside class="wizard__aside">' +
            '<div class="cd__panel">' +
              '<p class="micro">Why these questions</p>' +
              '<p class="cd__fine" style="margin-top:10px">Each field exists to answer a question a reviewer will ask: <b style="color:var(--ink-dim)">what is broken</b> (title, description), <b style="color:var(--ink-dim)">where</b> (district, landmark, GPS), <b style="color:var(--ink-dim)">who is affected</b> (population) and <b style="color:var(--ink-dim)">how do we know</b> (photographs).</p>' +
            "</div>" +
            '<div class="cd__panel">' +
              '<p class="micro">What happens next</p>' +
              '<ol class="cd__timeline" style="margin-top:10px">' +
                '<li><span class="cd__tdot"></span><div><p class="cd__t-text">Automated initial assessment</p><span class="cd__t-date">Immediately</span></div></li>' +
                '<li><p class="cd__tdot"></p><div><p class="cd__t-text">Moderator review</p><span class="cd__t-date">1–3 working days</span></div></li>' +
                '<li><p class="cd__tdot"></p><div><p class="cd__t-text">Validation and publication</p><span class="cd__t-date">If evidence is sufficient</span></div></li>' +
                '<li><p class="cd__tdot"></p><div><p class="cd__t-text">Institution matching</p><span class="cd__t-date">After validation</span></div></li>' +
              "</ol>" +
            "</div>" +
            '<div class="cd__panel cd__panel--quiet"><p class="micro">Not in this build</p><p class="cd__fine">Submission is stored locally in your browser. No authority is notified and no reference ID is issued by a real system.</p></div>' +
          "</aside>" +
        "</div>" +
      "</div></section>";

    /* ---------- uploader ---------- */
    uploader = C.imageUploader({
      host: document.getElementById("uploadHost"),
      title: "Add photographs of the problem",
      sub: "JPG, PNG or WebP · up to 6 photos · 8 MB each",
      max: 6
    });

    /* ---------- doc chip ---------- */
    var docInput = document.getElementById("rDoc");
    docInput.addEventListener("change", function () {
      docFile = docInput.files && docInput.files[0] ? docInput.files[0] : null;
      var host = document.getElementById("docChip");
      host.innerHTML = "";
      if (!docFile) return;
      var d = document.createElement("div");
      d.className = "filechip";
      d.innerHTML = '<span class="filechip__ic">' + (/^video\//.test(docFile.type) ? "VID" : "DOC") + "</span>" +
        '<span class="filechip__meta"><span class="filechip__filename filechip__name">' + esc(docFile.name) + "</span>" +
        '<span class="filechip__size">' + C.fmtBytes(docFile.size) + "</span></span>" +
        '<button type="button" class="filechip__x" aria-label="Remove attachment">×</button>';
      d.querySelector(".filechip__x").addEventListener("click", function () {
        docFile = null; docInput.value = ""; host.innerHTML = "";
      });
      host.appendChild(d);
    });

    /* ---------- counters ---------- */
    var tEl = document.getElementById("rTitle"), dEl = document.getElementById("rDesc");
    tEl.addEventListener("input", function () { document.getElementById("titleCount").textContent = tEl.value.length; });
    dEl.addEventListener("input", function () { document.getElementById("descCount").textContent = dEl.value.length; });

    /* ---------- GPS ---------- */
    var coords = null;
    document.getElementById("gpsBtn").addEventListener("click", function () {
      var b = this, val = document.getElementById("gpsVal");
      if (!navigator.geolocation) { val.textContent = "Not supported in this browser"; val.style.color = "#e5968a"; return; }
      b.disabled = true;
      val.textContent = "Locating…"; val.style.color = "";
      navigator.geolocation.getCurrentPosition(function (pos) {
        coords = { lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) };
        val.textContent = "Captured · " + coords.lat + ", " + coords.lng;
        val.style.color = "var(--ok)";
        b.disabled = false;
      }, function () {
        val.textContent = "Permission denied — you can continue without GPS";
        val.style.color = "#e5968a";
        b.disabled = false;
      }, { timeout: 9000 });
    });

    /* ---------- step navigation ---------- */
    function go(n) {
      if (n === 3) buildReview();
      if (n === 4) return;
      step = n;
      C.$$("[data-pane]").forEach(function (p) {
        p.classList.toggle("is-on", p.getAttribute("data-pane") === String(n));
      });
      C.$$(".step-tab").forEach(function (t) {
        var s = +t.getAttribute("data-step");
        t.classList.toggle("is-active", s === n);
        t.classList.toggle("is-done", s < n);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function validateStep1() {
      var ok = true;
      var t = tEl.value.trim(), d = dEl.value.trim();
      setErr(tEl, t.length < 6);
      setErr(dEl, d.length < 60);
      setErr(document.getElementById("rCat"), !document.getElementById("rCat").value);
      setErr(document.getElementById("rDistrict"), !document.getElementById("rDistrict").value.trim());
      if (t.length < 6 || d.length < 60 || !document.getElementById("rCat").value || !document.getElementById("rDistrict").value.trim()) ok = false;
      if (!ok) {
        var f = main.querySelector(".is-invalid input, .is-invalid textarea, .is-invalid select");
        if (f) f.focus();
      }
      return ok;
    }
    function setErr(inp, bad) {
      var f = inp.closest(".field");
      if (f) f.classList.toggle("is-invalid", bad);
    }

    main.addEventListener("click", function (e) {
      var nx = e.target.closest("[data-next]");
      if (nx) {
        var n = +nx.getAttribute("data-next");
        if (n === 2 && !validateStep1()) return;
        if (n === 3) {
          if (!validateStep1()) { go(1); return; }
          if (!uploader.requireOne()) { C.toast("Add at least one photograph before reviewing.", "err"); return; }
        }
        go(n);
        return;
      }
      var bk = e.target.closest("[data-back]");
      if (bk) { go(+bk.getAttribute("data-back")); return; }

      var tab = e.target.closest(".step-tab");
      if (tab) {
        var s = +tab.getAttribute("data-step");
        if (s > 2 && !validateStep1()) { go(1); return; }
        if (s === 3) {
          if (!validateStep1()) { go(1); return; }
          if (!uploader.requireOne()) { C.toast("Add at least one photograph before reviewing.", "err"); return; }
        }
        if (s <= 3) go(s);
      }
    });

    /* ---------- review ---------- */
    function buildReview() {
      var photos = uploader.photos();
      document.getElementById("reviewList").innerHTML =
        row("Title", "<strong>" + esc(tEl.value.trim() || "—") + "</strong>") +
        row("Description", esc(dEl.value.trim() || "—")) +
        row("Category", esc(document.getElementById("rCat").value || "—")) +
        row("Location", esc([document.getElementById("rLandmark").value, document.getElementById("rCity").value, document.getElementById("rDistrict").value].filter(Boolean).join(", ") || "—") +
          (coords ? '<br><span style="color:var(--ok);font-size:11px">GPS ' + coords.lat + ", " + coords.lng + "</span>" : "")) +
        row("Affected population", esc(document.getElementById("rPop").value.trim() || "Not stated")) +
        row("Context", esc(document.getElementById("rContext").value.trim() || "None provided")) +
        row("Evidence", '<div class="review__thumbs">' + photos.map(function (p) {
          return '<img src="' + p.dataUrl + '" alt="">';
        }).join("") + "</div><span style=\"font-size:11px;color:var(--ink-faint)\">" +
          photos.length + " photo" + (photos.length === 1 ? "" : "s") + (docFile ? " · 1 attachment" : "") +
          (photos.length === 1 ? " — one more photo usually helps verification" : "") + "</span>");
    }
    function row(k, v) {
      return '<div class="review__row"><span class="review__k">' + esc(k) + '</span><div class="review__v">' + v + "</div></div>";
    }

    /* ---------- analysis + submit ---------- */
    var CAT_MAP = {
      Water: { type: "Water quality investigation", skills: ["Water chemistry", "Environmental engineering", "Public health surveillance"], team: "Civil / Environmental Engineering", pri: "High" },
      Sanitation: { type: "Sanitation systems project", skills: ["Sanitation engineering", "Public health", "Behaviour change"], team: "Environmental Engineering", pri: "High" },
      Healthcare: { type: "Health access intervention", skills: ["Public health", "Facility planning", "Health economics"], team: "Public Health · Architecture", pri: "High" },
      Education: { type: "Learning access initiative", skills: ["Education research", "Low-cost apparatus design", "Teacher training"], team: "Education · Mechanical Engineering", pri: "Medium" },
      Agriculture: { type: "Agricultural systems study", skills: ["Agronomy", "Sensing / IoT", "Extension design"], team: "Agricultural Science · Electronics", pri: "High" },
      Infrastructure: { type: "Civic infrastructure assessment", skills: ["Structural assessment", "Hydraulic modelling", "Cost estimation"], team: "Civil Engineering · Urban Planning", pri: "High" },
      Environment: { type: "Environmental remediation study", skills: ["Waste systems", "Air quality monitoring", "Environmental health"], team: "Environmental Engineering · Data Science", pri: "High" },
      "Public Safety": { type: "Public safety assessment", skills: ["Risk assessment", "Lighting / electrical design", "Community consultation"], team: "Civil Engineering · Social Work", pri: "Critical" },
      Other: { type: "Open scoping project", skills: ["Problem structuring", "Field research"], team: "Multidisciplinary", pri: "Medium" }
    };

    function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

    document.getElementById("submitBtn").addEventListener("click", function () {
      var btn = this;
      var consent = document.getElementById("rConsent");
      if (!consent.checked) {
        consent.closest(".field").classList.add("is-invalid");
        consent.focus();
        return;
      }
      if (btn.classList.contains("is-busy")) return; /* double-submit guard */
      btn.classList.add("is-busy");
      btn.querySelector("span").textContent = "Submitting…";
      var err = document.getElementById("submitErr");
      err.classList.remove("is-on");

      var cat = document.getElementById("rCat").value;
      var info = CAT_MAP[cat] || CAT_MAP.Other;
      var title = tEl.value.trim(), desc = dEl.value.trim();
      var seed = hash(title + desc + cat);
      var conf = 58 + (seed % 34);
      var photos = uploader.photos().map(function (p) { return { dataUrl: p.dataUrl, name: p.name }; });

      var ai = {
        category: cat,
        severity: info.pri,
        confidence: conf,
        impact: document.getElementById("rPop").value.trim() || "Not quantified",
        summary: "Report describes a " + (info.type.toLowerCase()) + " affecting " +
          (document.getElementById("rPop").value.trim() || "an unstated population") + " in " +
          [document.getElementById("rCity").value.trim(), document.getElementById("rDistrict").value.trim()].filter(Boolean).join(", ") +
          ". Evidence supplied: " + photos.length + " photograph" + (photos.length === 1 ? "" : "s") + ". " +
          "Severity is provisionally " + info.pri.toLowerCase() + " pending human review.",
        skills: info.skills,
        duplicates: [],
        note: "AI-generated initial assessment requiring human validation."
      };

      C.Data.createChallenge({
        title: title, description: desc, category: cat,
        district: document.getElementById("rDistrict").value.trim(),
        city: document.getElementById("rCity").value.trim(),
        population: document.getElementById("rPop").value.trim(),
        photos: photos, coords: coords, ai: ai,
        urgency: info.pri
      }).then(function (rec) {
        /* success pane */
        document.getElementById("successPane").innerHTML =
          '<div class="success">' +
            '<span class="success__icon">' + C.icon("check") + "</span>" +
            '<p class="eyebrow eyebrow--center">Report received</p>' +
            '<h2 class="h2" style="margin:18px 0 12px">Thank you — it is on the board.</h2>' +
            '<p class="lede" style="margin:0 auto">Your report was recorded with ' + photos.length + " photograph" + (photos.length === 1 ? "" : "s") +
              ". It now enters moderator review. You can reopen it at any time.</p>" +
            '<div class="success__id">' + esc(rec.id) + '<span style="font-family:var(--body);font-size:9px;letter-spacing:.2em;color:var(--ink-ghost)">REFERENCE</span></div>' +
            '<p class="cd__fine">In this prototype the reference is generated locally and the record lives in your browser only.</p>' +
            '<div class="success__actions">' +
              '<a class="btn btn--primary" href="' + C.relRoot() + 'problems/index.html?id=' + encodeURIComponent(rec.slug) + '"><span>Open the problem</span><span class="btn__arrow">↗</span></a>' +
              '<a class="btn btn--ghost" href="' + C.relRoot() + 'explore/"><span>Back to the board</span></a>' +
            "</div>" +
          "</div>";

        /* analysis pane */
        var bars = [
          { k: "Clarity", v: Math.min(97, 52 + (seed % 40)) },
          { k: "Evidence", v: Math.min(97, 34 + photos.length * 13 + (seed % 16)) },
          { k: "Urgency", v: Math.min(97, 44 + (seed % 44)) },
          { k: "Feasibility", v: Math.min(97, 48 + (seed % 36)) }
        ];
        document.getElementById("analysisPane").innerHTML =
          '<div class="analysis">' +
            '<div class="analysis__head">' +
              '<div><p class="micro">Step 4 · Initial assessment</p><h3 class="h4" style="margin-top:6px">' + esc(rec.id) + " · " + esc(title) + "</h3></div>" +
              '<span class="badge badge--demo">Demo assessment · generated locally</span>' +
            "</div>" +
            '<div class="analysis__body">' +
              '<p class="cd__p" style="font-size:12.5px">' + esc(ai.summary) + "</p>" +
              '<div class="analysis__grid">' +
                aCell("Suggested category", ai.category) +
                aCell("Initial severity", ai.severity) +
                aCell("Estimated reach", ai.impact) +
                aCell("Confidence", conf + "%") +
              "</div>" +
              '<div><p class="micro" style="margin-bottom:10px">Suggested expertise</p><div class="row row--wrap" style="gap:6px">' +
                ai.skills.map(function (s) { return '<span class="chip chip--static">' + esc(s) + "</span>"; }).join("") + "</div></div>" +
              '<div><p class="micro" style="margin-bottom:10px">Assessment signals</p>' +
                bars.map(function (b) {
                  return '<div class="bar" style="margin-bottom:8px"><span class="bar__k">' + b.k + '</span><span class="bar__t"><i style="transform:scaleX(' + (b.v / 100) + ')"></i></span><span class="bar__v">' + b.v + "%</span></div>";
                }).join("") +
              "</div>" +
              '<ul class="analysis__list">' +
                "<li>Structured as a " + esc(info.type.toLowerCase()) + " with a suggested team from " + esc(info.team) + ".</li>" +
                "<li>" + (photos.length ? "Photographs are attached and will be checked against the description during review." : "No photographs attached — expect a request for more evidence.") + "</li>" +
                "<li>" + (coords ? "GPS coordinates captured; nearby reports will be checked for duplicates." : "No GPS captured — duplicate detection will rely on district and landmark only.") + "</li>" +
                "<li>No university has been contacted. Matching happens only after a moderator validates the report.</li>" +
              "</ul>" +
            "</div>" +
            '<div class="analysis__foot">This assessment was produced in your browser from the text you entered. It is a demonstration of the intended interface, <b>not</b> a real model output. No authority has been notified.</div>' +
          "</div>";

        go(4);
        C.$$(".step-tab").forEach(function (t) {
          t.classList.toggle("is-done", +t.getAttribute("data-step") <= 4);
          t.classList.remove("is-active");
        });
      }).catch(function (e) {
        btn.classList.remove("is-busy");
        btn.querySelector("span").textContent = "Submit report";
        err.textContent = (e && e.message) || "The report could not be saved. This usually means browser storage is full or disabled.";
        err.classList.add("is-on");
      });
    });

    function aCell(k, v) {
      return '<div><p class="analysis__k">' + esc(k) + '</p><p class="analysis__v">' + esc(v) + "</p></div>";
    }
  };
})();
