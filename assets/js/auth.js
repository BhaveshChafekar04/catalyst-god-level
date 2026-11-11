/* ============================================================
   CATALYST — authentication pages
   login · register · forgot-password · onboarding
   The Auth object in core.js is the only integration point;
   these views never touch storage directly.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CATALYST;
  var esc = C.esc;
  C.auth = {};

  var QUOTE = {
    login: ["“The bottleneck is not talent. It is the handover.”", "Catalyst · the premise"],
    register: ["“A report is only useful if someone can act on it.”", "Catalyst · reporting principle"],
    forgot: ["“Access should never be the reason a problem goes unreported.”", "Catalyst · access principle"],
    onboarding: ["“Tell us what you can contribute. We will show you what needs it.”", "Catalyst · matching principle"]
  };

  function shell(opts) {
    var q = QUOTE[opts.key] || QUOTE.login;
    return '<div class="auth">' +
      '<aside class="auth__aside">' +
        '<div class="auth__aside-inner">' +
          '<a class="brand" href="' + C.relRoot() + '" style="text-decoration:none">' +
            '<span class="brand__mark">CATALYST<b>.</b></span>' +
            '<span class="brand__sub">Accelerating Change. Creating Impact.</span>' +
          "</a>" +
          '<p class="auth__word">' + opts.asideTitle + "</p>" +
          "<p>" + opts.asideBody + "</p>" +
          '<blockquote class="auth__quote"><p>' + q[0] + "</p><span>" + q[1] + "</span></blockquote>" +
        "</div>" +
        '<p class="auth__foot">Societal innovation platform</p>' +
      "</aside>" +
      '<div class="auth__main">' +
        '<div class="auth__form">' + opts.body + "</div>" +
      "</div>" +
    "</div>";
  }

  function eye() {
    return '<button type="button" class="password-toggle" data-pw-toggle aria-label="Show password">' +
      '<svg viewBox="0 0 20 20"><path d="M1.8 10S4.8 4.6 10 4.6 18.2 10 18.2 10 15.2 15.4 10 15.4 1.8 10 1.8 10z"/><circle cx="10" cy="10" r="2.6"/></svg>' +
    "</button>";
  }

  /* ==========================================================
     LOGIN
     ========================================================== */
  C.auth.login = function () {
    var next = C.param("next", "");
    document.getElementById("main").innerHTML = shell({
      key: "login",
      asideTitle: "Welcome back.",
      asideBody: "Your challenges, teams and review queues are exactly where you left them. Sign in to pick up the thread.",
      body:
        '<p class="eyebrow">Sign in</p>' +
        '<h1 class="h2">Pick up where<br>you left off.</h1>' +
        '<p class="small">Access your workspace, tracked reports and active projects.</p>' +
        '<div class="form-error" id="authErr" role="alert"></div>' +
        '<form id="loginForm" novalidate>' +
          '<div class="auth__fields">' +
            '<div class="field"><label for="lEmail">Email address</label>' +
              '<input type="email" id="lEmail" autocomplete="email" placeholder="you@example.org" required>' +
              '<span class="field__err">Enter a valid email address.</span></div>' +
            '<div class="field"><label for="lPass">Password</label>' +
              '<div class="password-wrap"><input type="password" id="lPass" autocomplete="current-password" placeholder="At least 8 characters" required>' + eye() + "</div>" +
              '<span class="field__err">Use at least 8 characters.</span></div>' +
          "</div>" +
          '<div class="row row--between" style="margin-top:14px">' +
            '<label class="check" style="font-size:11.5px"><input type="checkbox" id="lRemember" checked><span>Keep me signed in</span></label>' +
            '<a href="' + C.relRoot() + 'forgot-password/" style="font-size:11px;color:var(--amber)">Forgot password?</a>' +
          "</div>" +
          '<button class="btn btn--primary btn--block auth__submit" id="loginBtn" type="submit"><span>Sign in</span><span class="btn__arrow">↗</span></button>' +
        "</form>" +
        '<div class="demo-note"><b>Prototype authentication.</b> This build has no identity server. Accounts live in this browser only, and any role shown is a client-side demo value — a real deployment must assign roles server-side.<br><br>Demo accounts (password <code>demo1234</code>):<br>' +
          '<code>student@catalyst.demo</code> · <code>faculty@catalyst.demo</code><br>' +
          '<code>industry@catalyst.demo</code> · <code>admin@catalyst.demo</code> · <code>citizen@catalyst.demo</code>' +
        "</div>" +
        '<p class="auth__alt">No account yet? <a href="' + C.relRoot() + 'register/">Create one</a></p>'
    });

    C.bindPasswordToggles(document.getElementById("main"));
    var form = document.getElementById("loginForm");
    var err = document.getElementById("authErr");
    var btn = document.getElementById("loginBtn");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.classList.remove("is-on");
      if (!C.validate(form)) return;
      btn.classList.add("is-busy");
      btn.querySelector("span").textContent = "Signing in…";

      C.Auth.login({
        email: document.getElementById("lEmail").value.trim(),
        password: document.getElementById("lPass").value
      }).then(function (res) {
        C.toast("Signed in as " + res.user.name + ".", "ok");
        var dest = next || C.dashboardFor(res.user.role);
        if (!next && !res.user.onboarded && res.user.role !== "admin") dest = C.relRoot() + "onboarding/index.html";
        setTimeout(function () { location.href = dest; }, 420);
      }).catch(function (e2) {
        btn.classList.remove("is-busy");
        btn.querySelector("span").textContent = "Sign in";
        err.textContent = e2.message || "Could not sign in.";
        err.classList.add("is-on");
        document.getElementById("lPass").focus();
      });
    });
  };

  /* ==========================================================
     REGISTER
     ========================================================== */
  C.auth.register = function () {
    document.getElementById("main").innerHTML = shell({
      key: "register",
      asideTitle: "Join the\n ecosystem.",
      asideBody: "Citizens report. Students build. Universities supervise. Industry implements. Pick the role that matches what you can actually contribute — you can request a change later.",
      body:
        '<p class="eyebrow">Create an account</p>' +
        '<h1 class="h2">Start here.</h1>' +
        '<p class="small">One account, one workspace, shaped by your role.</p>' +
        '<div class="form-error" id="authErr" role="alert"></div>' +
        '<form id="regForm" novalidate>' +
          '<div class="auth__fields">' +
            '<div class="field"><label for="rName">Full name</label>' +
              '<input type="text" id="rName" autocomplete="name" placeholder="Your name" required>' +
              '<span class="field__err">Enter your name.</span></div>' +
            '<div class="field"><label for="rEmail">Email address</label>' +
              '<input type="email" id="rEmail" autocomplete="email" placeholder="you@example.org" required>' +
              '<span class="field__err">Enter a valid email address.</span></div>' +
            '<div class="field"><label for="rOrg">Organisation <span style="text-transform:none;letter-spacing:0;color:var(--ink-ghost)">(optional)</span></label>' +
              '<input type="text" id="rOrg" autocomplete="organization" placeholder="College, department or company"></div>' +
            '<div class="field"><label>I am joining as</label>' +
              '<div class="roles">' +
                '<label class="role-opt"><input type="radio" name="role" value="citizen" checked><span>Citizen / reporter</span></label>' +
                '<label class="role-opt"><input type="radio" name="role" value="student"><span>Student</span></label>' +
                '<label class="role-opt"><input type="radio" name="role" value="university"><span>University / faculty</span></label>' +
                '<label class="role-opt"><input type="radio" name="role" value="industry"><span>Industry / startup</span></label>' +
              "</div>" +
              '<span class="field__hint">Role determines your workspace. Institutional roles are verified before they can accept challenges.</span></div>' +
            '<div class="field"><label for="rPass">Password</label>' +
              '<div class="password-wrap"><input type="password" id="rPass" autocomplete="new-password" placeholder="At least 8 characters" required>' + eye() + "</div>" +
              '<span class="field__err">Use at least 8 characters.</span>' +
              '<span class="field__hint" id="pwStrength">Use a mix of letters and numbers.</span></div>' +
            '<div class="field"><label for="rPass2">Confirm password</label>' +
              '<input type="password" id="rPass2" autocomplete="new-password" placeholder="Repeat password" required>' +
              '<span class="field__err">Passwords do not match.</span></div>' +
          "</div>" +
          '<label class="check" style="margin-top:18px"><input type="checkbox" id="rTerms">' +
            "<span>I agree to the platform's data policy, including that photographs I upload may be reviewed by moderators and partner institutions.</span></label>" +
          '<button class="btn btn--primary btn--block auth__submit" id="regBtn" type="submit"><span>Create account</span><span class="btn__arrow">↗</span></button>' +
        "</form>" +
        '<div class="demo-note"><b>Prototype note.</b> No verification email is sent and no institutional check occurs. A real deployment must verify email ownership and confirm university or company affiliation before granting institutional permissions.</div>' +
        '<p class="auth__alt">Already have an account? <a href="' + C.relRoot() + 'login/">Sign in</a></p>'
    });

    C.bindPasswordToggles(document.getElementById("main"));
    var form = document.getElementById("regForm");
    var err = document.getElementById("authErr");
    var btn = document.getElementById("regBtn");
    var pw = document.getElementById("rPass");

    pw.addEventListener("input", function () {
      var v = pw.value;
      var score = (v.length >= 8 ? 1 : 0) + (/[A-Z]/.test(v) ? 1 : 0) + (/[0-9]/.test(v) ? 1 : 0) + (/[^A-Za-z0-9]/.test(v) ? 1 : 0);
      var label = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
      var col = score <= 1 ? "#e5968a" : score === 2 ? "var(--warn)" : "var(--ok)";
      var el = document.getElementById("pwStrength");
      el.textContent = "Password strength: " + label;
      el.style.color = col;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.classList.remove("is-on");
      var ok = C.validate(form);
      var p1 = pw.value, p2 = document.getElementById("rPass2").value;
      var f2 = document.getElementById("rPass2").closest(".field");
      if (p1 !== p2) { f2.classList.add("is-invalid"); ok = false; }
      else f2.classList.remove("is-invalid");
      var terms = document.getElementById("rTerms");
      if (!terms.checked) { terms.closest(".check").style.color = "#e5968a"; ok = false; }
      if (!ok) return;

      btn.classList.add("is-busy");
      btn.querySelector("span").textContent = "Creating account…";
      C.Auth.register({
        name: document.getElementById("rName").value.trim(),
        email: document.getElementById("rEmail").value.trim(),
        org: document.getElementById("rOrg").value.trim(),
        role: (form.querySelector('input[name="role"]:checked') || {}).value || "citizen",
        password: p1
      }).then(function (res) {
        C.toast("Account created. Let's set up your workspace.", "ok");
        setTimeout(function () {
          location.href = C.relRoot() + "onboarding/index.html" + (res.user.role === "admin" ? "" : "");
        }, 420);
      }).catch(function (e2) {
        btn.classList.remove("is-busy");
        btn.querySelector("span").textContent = "Create account";
        err.textContent = e2.message || "Could not create the account.";
        err.classList.add("is-on");
      });
    });
  };

  /* ==========================================================
     FORGOT PASSWORD
     ========================================================== */
  C.auth.forgot = function () {
    document.getElementById("main").innerHTML = shell({
      key: "forgot",
      asideTitle: "Reset access.",
      asideBody: "Password resets are handled by the identity provider. In this prototype no email is sent — the flow demonstrates the interface only.",
      body:
        '<p class="eyebrow">Account recovery</p>' +
        '<h1 class="h2">Reset your<br>password.</h1>' +
        '<p class="small">Enter the email on your account. If it exists, a reset link will be issued.</p>' +
        '<div class="form-error" id="authErr" role="alert"></div>' +
        '<form id="fpForm" novalidate>' +
          '<div class="field"><label for="fpEmail">Email address</label>' +
            '<input type="email" id="fpEmail" autocomplete="email" placeholder="you@example.org" required>' +
            '<span class="field__err">Enter a valid email address.</span></div>' +
          '<button class="btn btn--primary btn--block auth__submit" id="fpBtn" type="submit"><span>Send reset link</span><span class="btn__arrow">↗</span></button>' +
        "</form>" +
        '<div id="fpDone" style="display:none;margin-top:24px">' +
          '<div class="note"><b>Request recorded.</b> If an account exists for that address, a reset link would be issued. <b>No email was sent</b> in this prototype, and no token was created.</div>' +
          '<a class="btn btn--ghost btn--block" href="' + C.relRoot() + 'login/" style="margin-top:12px"><span>Back to sign in</span></a>' +
        "</div>" +
        '<p class="auth__alt">Remembered it? <a href="' + C.relRoot() + 'login/">Sign in</a></p>'
    });

    var form = document.getElementById("fpForm");
    var btn = document.getElementById("fpBtn");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!C.validate(form)) return;
      btn.classList.add("is-busy");
      btn.querySelector("span").textContent = "Sending…";
      C.Auth.requestReset(document.getElementById("fpEmail").value.trim()).then(function () {
        form.style.display = "none";
        document.getElementById("fpDone").style.display = "block";
      });
    });
  };

  /* ==========================================================
     ONBOARDING
     ========================================================== */
  C.auth.onboarding = function () {
    var user = C.Auth.currentUser();
    if (!user) {
      location.replace(C.relRoot() + "login/index.html?next=" + encodeURIComponent(location.pathname));
      return;
    }

    var isStudent = user.role === "student";
    var body =
      '<p class="eyebrow">Onboarding <b>·</b> ' + esc(C.ROLE_LABEL[user.role]) + "</p>" +
      '<h1 class="h2">Set up your<br>workspace.</h1>' +
      '<p class="small">Two short steps. This determines which challenges get recommended to you — you can change any of it later.</p>' +
      '<div class="steps" style="margin-bottom:24px">' +
        '<button class="step-tab is-active" data-ob="1"><span class="n"><b>1</b></span><span class="lbl">Your context</span></button>' +
        '<button class="step-tab" data-ob="2"><span class="n"><b>2</b></span><span class="lbl">Your focus</span></button>' +
      "</div>" +
      '<form id="obForm" novalidate>' +
        '<div data-obpane="1">' +
          '<div class="auth__fields">' +
            '<div class="field"><label for="obName">Display name</label>' +
              '<input type="text" id="obName" value="' + esc(user.name) + '"></div>' +
            '<div class="field"><label for="obOrg">' + (isStudent ? "College / university" : user.role === "industry" ? "Company" : user.role === "university" ? "Institution" : "Neighbourhood or organisation") + "</label>" +
              '<input type="text" id="obOrg" value="' + esc(user.org || "") + '" placeholder="' + (isStudent ? "e.g. National Institute of Technology" : "Optional") + '"></div>' +
            (isStudent ?
            '<div class="field__row">' +
              '<div class="field"><label for="obBranch">Branch / discipline</label>' +
                '<select id="obBranch"><option value="">Select</option>' +
                ["Computer Science", "Electronics", "Electrical", "Mechanical", "Civil", "Chemical", "Environmental", "Design", "Public Health", "Social Science", "Management", "Other"]
                  .map(function (b) { return '<option>' + b + "</option>"; }).join("") + "</select></div>" +
              '<div class="field"><label for="obYear">Year</label>' +
                '<select id="obYear"><option value="">Select</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option></select></div>' +
            "</div>" : "") +
            '<div class="field"><label for="obAvail">Weekly availability</label>' +
              '<select id="obAvail"><option value="">Select</option><option>2–4 hours</option><option>4–6 hours</option><option>6–10 hours</option><option>10+ hours</option></select>' +
              '<span class="field__hint">Used to filter opportunities by realistic commitment.</span></div>' +
          "</div>" +
        "</div>" +
        '<div data-obpane="2" style="display:none">' +
          '<div class="field" style="margin-bottom:18px"><label>Problem domains you care about</label>' +
            '<div class="roles" style="grid-template-columns:1fr 1fr 1fr">' +
              ["Water", "Sanitation", "Healthcare", "Education", "Agriculture", "Infrastructure", "Environment", "Public Safety", "Other"]
                .map(function (d) {
                  return '<label class="role-opt"><input type="checkbox" name="dom" value="' + d + '"><span>' + d + "</span></label>";
                }).join("") +
            "</div>" +
            '<span class="field__hint">Choose at least one. Recommendations use these plus any skills you list.</span></div>' +
          '<div class="field"><label for="obSkills">Skills</label>' +
            '<input type="text" id="obSkills" placeholder="e.g. Python, GIS, field surveys, PCB design, technical writing">' +
            '<span class="field__hint">Comma separated. These are shown on your profile and used for team matching.</span></div>' +
          '<div class="field" style="margin-top:16px"><label for="obBio">One line about you</label>' +
            '<textarea id="obBio" style="min-height:82px" placeholder="What do you work on, and what would you like to work on?"></textarea></div>' +
        "</div>" +
        '<div class="row row--between" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-ob-back style="visibility:hidden"><span>← Back</span></button>' +
          '<button type="button" class="btn btn--primary" id="obNext"><span>Continue</span><span class="btn__arrow">↗</span></button>' +
        "</div>" +
      "</form>" +
      '<p class="auth__alt"><a href="' + C.dashboardFor(user.role) + '">Skip for now</a></p>';

    document.getElementById("main").innerHTML = shell({
      key: "onboarding",
      asideTitle: "Two minutes\n to a better\n match.",
      asideBody: "Onboarding exists so the board can show you problems you could actually help with, rather than everything in the country.",
      body: body
    });

    var pane = 1;
    function go(n) {
      pane = n;
      C.$$("[data-obpane]").forEach(function (p) {
        p.style.display = p.getAttribute("data-obpane") === String(n) ? "" : "none";
      });
      C.$$("[data-ob]").forEach(function (t) {
        var s = +t.getAttribute("data-ob");
        t.classList.toggle("is-active", s === n);
        t.classList.toggle("is-done", s < n);
      });
      document.querySelector("[data-ob-back]").style.visibility = n === 1 ? "hidden" : "visible";
      document.getElementById("obNext").querySelector("span").textContent = n === 1 ? "Continue" : "Finish setup";
    }

    document.querySelector("[data-ob-back]").addEventListener("click", function () { go(1); });

    document.getElementById("obNext").addEventListener("click", function () {
      var btn = this;
      if (pane === 1) {
        var avail = document.getElementById("obAvail").value;
        if (!avail) { document.getElementById("obAvail").closest(".field").classList.add("is-invalid"); return; }
        go(2);
        return;
      }
      var doms = C.$$('input[name="dom"]:checked').map(function (i) { return i.value; });
      if (!doms.length) { C.toast("Pick at least one problem domain.", "err"); return; }

      btn.classList.add("is-busy");
      btn.querySelector("span").textContent = "Saving…";
      C.Auth.updateProfile({
        name: document.getElementById("obName").value.trim() || user.name,
        org: document.getElementById("obOrg").value.trim(),
        branch: (document.getElementById("obBranch") || {}).value || "",
        year: (document.getElementById("obYear") || {}).value || "",
        availability: document.getElementById("obAvail").value,
        domains: doms,
        skills: document.getElementById("obSkills").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
        bio: document.getElementById("obBio").value.trim(),
        onboarded: true
      });
      C.toast("Workspace ready.", "ok");
      setTimeout(function () { location.href = C.dashboardFor(user.role); }, 600);
    });
  };
})();
