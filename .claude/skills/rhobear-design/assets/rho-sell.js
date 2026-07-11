/* ============================================================================
   Rho — the RHOBEAR sell-everywhere chat widget.
   Text + dictation (NO voice output). Streams from the live sales brain,
   captures leads straight to the team. Drop on any page with:
     <script>window.RHO_SELL={accent:'#ff7d1f',product:'capturd',
              greet:'Want to see the AI demo studio?'}</script>
     <script src="../../assets/rho-sell.js" defer></script>
   Self-contained, no dependencies. Backend: chat.rhobear.ai (/chat + /lead).
   ========================================================================== */
(function () {
  "use strict";
  if (window.__rhoSell) return; window.__rhoSell = true;

  var CFG = window.RHO_SELL || {};
  var ACCENT = CFG.accent || "#ff7d1f";
  var PRODUCT = CFG.product || "rhobear";
  var API = CFG.api || "https://chat.rhobear.ai";
  var GREET = CFG.greet || "Hey — I'm Rho. Ask me anything about RHOBEAR, or tell me what you're building and I'll bring it to the team.";

  // session id (server keeps context per session)
  var SID = null;
  try { SID = sessionStorage.getItem("rho_sid"); } catch (e) {}
  if (!SID) { SID = uuid(); try { sessionStorage.setItem("rho_sid", SID); } catch (e) {} }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16);
    });
  }

  // ---- styles ----
  var css = document.createElement("style");
  css.textContent = [
    ":root{--rho-accent:" + ACCENT + "}",
    ".rho-launch{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:12px 18px 12px 14px;border:none;border-radius:99px;background:var(--rho-accent);color:#12100a;font:600 14px/1 Inter,-apple-system,'Segoe UI',sans-serif;cursor:pointer;box-shadow:0 12px 34px -10px rgba(0,0,0,.5);transition:transform .18s ease,box-shadow .18s ease}",
    ".rho-launch:hover{transform:translateY(-2px);box-shadow:0 18px 44px -12px rgba(0,0,0,.6)}",
    ".rho-launch svg{width:20px;height:20px;display:block}",
    ".rho-launch .dot{width:7px;height:7px;border-radius:50%;background:#12100a;box-shadow:0 0 0 3px rgba(18,16,10,.18);animation:rhoPulse 2s infinite}",
    "@keyframes rhoPulse{0%,100%{opacity:1}50%{opacity:.4}}",
    ".rho-panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:380px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 40px);display:none;flex-direction:column;background:#14100a;color:#f6efe2;border:1px solid rgba(255,255,255,.09);border-radius:20px;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.7);font:400 14.5px/1.55 Inter,-apple-system,'Segoe UI',sans-serif}",
    ".rho-panel.open{display:flex;animation:rhoIn .22s cubic-bezier(.16,1,.3,1)}",
    "@keyframes rhoIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}",
    ".rho-head{display:flex;align-items:center;gap:11px;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.05),transparent)}",
    ".rho-av{width:34px;height:34px;border-radius:50%;background:var(--rho-accent);display:grid;place-items:center;color:#12100a;flex-shrink:0}",
    ".rho-av svg{width:19px;height:19px}",
    ".rho-ht{font-weight:700;font-size:15px}",
    ".rho-hs{font-size:11.5px;color:#9db08f;display:flex;align-items:center;gap:6px}",
    ".rho-hs .g{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80}",
    ".rho-x{margin-left:auto;background:none;border:none;color:#b8a98f;font-size:20px;cursor:pointer;line-height:1;padding:4px 8px;border-radius:8px}",
    ".rho-x:hover{background:rgba(255,255,255,.08);color:#fff}",
    ".rho-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}",
    ".rho-msg{max-width:85%;padding:11px 14px;border-radius:14px;font-size:14px;white-space:pre-wrap;word-wrap:break-word}",
    ".rho-msg.them{align-self:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-bottom-left-radius:5px}",
    ".rho-msg.me{align-self:flex-end;background:var(--rho-accent);color:#12100a;border-bottom-right-radius:5px;font-weight:500}",
    ".rho-msg a{color:var(--rho-accent);font-weight:600}",
    ".rho-msg.me a{color:#12100a;text-decoration:underline}",
    ".rho-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px}",
    ".rho-typing i{width:7px;height:7px;border-radius:50%;background:#9db08f;animation:rhoBounce 1.2s infinite}",
    ".rho-typing i:nth-child(2){animation-delay:.15s}.rho-typing i:nth-child(3){animation-delay:.3s}",
    "@keyframes rhoBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}",
    ".rho-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px}",
    ".rho-chip{font-size:12.5px;padding:7px 12px;border-radius:99px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#f6efe2;cursor:pointer;transition:all .15s}",
    ".rho-chip:hover{border-color:var(--rho-accent);color:var(--rho-accent)}",
    ".rho-foot{padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:flex-end;gap:8px}",
    ".rho-in{flex:1;resize:none;max-height:110px;min-height:22px;background:transparent;border:none;outline:none;color:#f6efe2;font:400 14.5px/1.45 Inter,sans-serif}",
    ".rho-in::placeholder{color:#7d6e52}",
    ".rho-mic,.rho-send{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;transition:all .15s}",
    ".rho-mic{background:rgba(255,255,255,.06);color:#b8a98f}",
    ".rho-mic:hover{color:var(--rho-accent)}.rho-mic.on{background:var(--rho-accent);color:#12100a;animation:rhoPulse 1.2s infinite}",
    ".rho-send{background:var(--rho-accent);color:#12100a}.rho-send:disabled{opacity:.4;cursor:default}",
    ".rho-mic svg,.rho-send svg{width:17px;height:17px}",
    ".rho-lead{margin:2px 0;padding:14px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:8px}",
    ".rho-lead h5{margin:0;font-size:13.5px;color:var(--rho-accent)}",
    ".rho-lead input,.rho-lead textarea{background:#0e0b06;border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:9px 11px;color:#f6efe2;font:400 13.5px Inter,sans-serif;outline:none}",
    ".rho-lead input:focus,.rho-lead textarea:focus{border-color:var(--rho-accent)}",
    ".rho-lead button{background:var(--rho-accent);color:#12100a;border:none;border-radius:9px;padding:10px;font:600 13.5px Inter,sans-serif;cursor:pointer}",
    ".rho-lead .msg{font-size:12px;color:#9db08f;min-height:1em}",
    ".rho-cred{text-align:center;font-size:10.5px;color:#5a5140;padding:0 0 9px}",
    "@media(max-width:480px){.rho-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);max-height:none}}",
    "@media(prefers-reduced-motion:reduce){.rho-panel.open,.rho-launch,.rho-typing i,.rho-launch .dot{animation:none;transition:none}}"
  ].join("");
  document.head.appendChild(css);

  var BEAR = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6.2" cy="6.5" r="2.6"/><circle cx="17.8" cy="6.5" r="2.6"/><path d="M12 4.2c-4.1 0-7 2.8-7 6.6 0 2.2 1.2 4 3 5.1V19c0 .7.6 1.3 1.3 1.3h5.4c.7 0 1.3-.6 1.3-1.3v-3.1c1.8-1.1 3-2.9 3-5.1 0-3.8-2.9-6.6-7-6.6Zm-2.7 8.1a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5.4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12 16c-1 0-1.8-.5-1.8-1.1h3.6C13.8 15.5 13 16 12 16Z"/></svg>';
  var CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.9-.9L3 20l1.1-5.1a8.4 8.4 0 0 1-.9-3.9A8.5 8.5 0 0 1 21 11.5Z"/></svg>';

  // ---- build DOM ----
  var launch = el("button", "rho-launch", '<span class="dot"></span>' + CHAT + "<span>Ask Rho</span>");
  launch.setAttribute("aria-label", "Chat with Rho");
  var panel = el("div", "rho-panel", "");
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Rho chat");
  panel.innerHTML =
    '<div class="rho-head"><div class="rho-av">' + BEAR + "</div>" +
    '<div><div class="rho-ht">Rho</div><div class="rho-hs"><span class="g"></span>RHOBEAR · here to help</div></div>' +
    '<button class="rho-x" aria-label="Close">×</button></div>' +
    '<div class="rho-body"></div>' +
    '<div class="rho-chips"></div>' +
    '<div class="rho-foot"><textarea class="rho-in" rows="1" placeholder="Type or tap the mic…"></textarea>' +
    '<button class="rho-mic" aria-label="Dictate" title="Dictate">' + micSvg() + "</button>" +
    '<button class="rho-send" aria-label="Send" disabled>' + sendSvg() + "</button></div>" +
    '<div class="rho-cred">Powered by RHOBEAR · real answers, real people</div>';
  document.body.appendChild(launch); document.body.appendChild(panel);

  var body = panel.querySelector(".rho-body");
  var chips = panel.querySelector(".rho-chips");
  var input = panel.querySelector(".rho-in");
  var sendBtn = panel.querySelector(".rho-send");
  var micBtn = panel.querySelector(".rho-mic");
  var greeted = false;

  launch.onclick = open; panel.querySelector(".rho-x").onclick = close;
  window.__rhoOpen = open; window.__rhoClose = close;
  function open() { panel.classList.add("open"); launch.style.display = "none"; if (!greeted) { greeted = true; addMsg(GREET, "them"); setChips(defaultChips()); } setTimeout(function () { input.focus(); }, 60); }
  function close() { panel.classList.remove("open"); launch.style.display = "flex"; }

  // autosize + enable send
  input.addEventListener("input", function () { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 110) + "px"; sendBtn.disabled = !input.value.trim(); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  sendBtn.onclick = send;

  function defaultChips() {
    return [
      ["Start free →", "How do I start free?"],
      ["See pricing", "What does everything cost?"],
      ["Build me something", "Can you build a custom setup for my business?"],
      ["Talk to a human", "__lead__"]
    ];
  }
  function setChips(list) {
    chips.innerHTML = "";
    list.forEach(function (c) {
      var b = el("button", "rho-chip", c[0]);
      b.onclick = function () { if (c[1] === "__lead__") showLead(); else { input.value = c[1]; send(); } };
      chips.appendChild(b);
    });
  }

  function addMsg(text, who) {
    var m = el("div", "rho-msg " + who, linkify(text));
    body.appendChild(m); scrollDown(); return m;
  }
  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function linkify(t) {
    var esc = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc.replace(/((https?:\/\/)?(workbench|cloud|capturd|reviews)\.rhobear\.ai[^\s,]*|rhobear-ai\.github\.io\/rhobear-designs[^\s,]*)/g,
      function (u) { var href = u.indexOf("http") === 0 ? u : "https://" + u; return '<a href="' + href + '" target="_blank" rel="noopener">' + u + "</a>"; });
  }

  function send() {
    var text = input.value.trim(); if (!text) return;
    addMsg(text, "me"); input.value = ""; input.style.height = "auto"; sendBtn.disabled = true; chips.innerHTML = "";
    var typing = el("div", "rho-typing", "<i></i><i></i><i></i>"); body.appendChild(typing); scrollDown();
    stream(text, typing);
  }

  function stream(text, typing) {
    var reply = null, acc = "";
    fetch(API + "/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: SID, source: PRODUCT })
    }).then(function (res) {
      if (!res.ok || !res.body) throw new Error("bad");
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = "";
      (function pump() {
        return reader.read().then(function (r) {
          if (r.done) { finish(); return; }
          buf += dec.decode(r.value, { stream: true });
          var parts = buf.split("\n\n"); buf = parts.pop();
          parts.forEach(function (p) {
            var line = p.replace(/^data:\s*/, "").trim(); if (!line) return;
            try { var j = JSON.parse(line); if (j.chunk) { acc += j.chunk; if (!reply) { if (typing.parentNode) typing.remove(); reply = addMsg("", "them"); } reply.innerHTML = linkify(acc); scrollDown(); } } catch (e) {}
          });
          return pump();
        });
      })();
    }).catch(function () { if (typing.parentNode) typing.remove(); addMsg("I'm having a hiccup reaching the brain — leave your email and I'll have someone follow up.", "them"); showLead(); })
      .then(function () {});
    function finish() { if (!reply && typing.parentNode) { typing.remove(); addMsg("—", "them"); } setChips(defaultChips()); }
  }

  // ---- lead capture ----
  function showLead() {
    if (panel.querySelector(".rho-lead")) return;
    var box = el("div", "rho-lead",
      "<h5>Leave it with me — I'll bring it to the team</h5>" +
      '<input class="l-name" placeholder="Your name" autocomplete="name">' +
      '<input class="l-email" type="email" placeholder="Email" autocomplete="email">' +
      '<textarea class="l-note" rows="2" placeholder="What are you after? (optional)"></textarea>' +
      '<button class="l-send">Send it →</button><div class="msg"></div>');
    body.appendChild(box); scrollDown();
    var msg = box.querySelector(".msg");
    box.querySelector(".l-send").onclick = function () {
      var email = box.querySelector(".l-email").value.trim();
      var name = box.querySelector(".l-name").value.trim();
      var note = box.querySelector(".l-note").value.trim();
      if (!/.+@.+\..+/.test(email)) { msg.textContent = "A real email so we can reach you — that's all."; return; }
      msg.textContent = "Sending…";
      fetch(API + "/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, message: (note || "(from " + PRODUCT + " page chat)"), source: "sell-widget:" + PRODUCT, session_id: SID })
      }).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function () { box.innerHTML = '<h5>Got it — that’s with the team.</h5><div class="msg">We’ll reach out at ' + esc(email) + " soon. Keep exploring in the meantime.</div>"; })
        .catch(function () { msg.textContent = "Couldn't send just now — email support@rhobear.ai and we'll catch it."; });
    };
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // ---- dictation (input only) ----
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, listening = false;
  if (!SR) { micBtn.style.display = "none"; }
  else {
    micBtn.onclick = function () {
      if (listening) { rec && rec.stop(); return; }
      rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
      var base = input.value;
      rec.onstart = function () { listening = true; micBtn.classList.add("on"); };
      rec.onend = function () { listening = false; micBtn.classList.remove("on"); input.dispatchEvent(new Event("input")); input.focus(); };
      rec.onerror = function () { listening = false; micBtn.classList.remove("on"); };
      rec.onresult = function (e) {
        var t = ""; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        input.value = (base ? base + " " : "") + t; input.dispatchEvent(new Event("input"));
      };
      rec.start();
    };
  }

  // helpers
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function micSvg() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'; }
  function sendSvg() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-3-6-7-2Z"/></svg>'; }
})();
