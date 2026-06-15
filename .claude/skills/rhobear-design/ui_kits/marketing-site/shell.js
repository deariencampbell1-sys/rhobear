/* RHOBEAR shared shell behavior — local-first, no dependencies. */
(function () {
  var dropdowns = Array.prototype.slice.call(
    document.querySelectorAll('.nav-dropdown')
  );
  if (!dropdowns.length) return;

  function closeAll(except) {
    dropdowns.forEach(function (dd) {
      if (dd !== except) dd.classList.remove('open');
    });
  }

  dropdowns.forEach(function (dd) {
    var tab = dd.querySelector('.nav-tab[aria-haspopup]');
    if (!tab) return;
    // A tab with nested pages opens its panel on click instead of navigating.
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', !isOpen);
    });
  });

  // Click outside closes any open dropdown.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) closeAll(null);
  });

  // Escape closes any open dropdown.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeAll(null);
  });
})();


/* =====================================================================
   ★ Constellation starfield — the hub's exact sky, seated behind the page.
   Self-contained WebGL (no dependencies, no CDN). Injects its own canvas,
   drifts always, breathes an occasional ambient pulse, pauses when hidden,
   and calms down for prefers-reduced-motion.
   ===================================================================== */
(function () {
  if (document.getElementById('rho-stars')) return;
  var canvas = document.createElement('canvas');
  canvas.id = 'rho-stars';
  canvas.setAttribute('aria-hidden', 'true');
  var mount = function () {
    (document.body || document.documentElement).insertBefore(canvas, document.body.firstChild);
    start();
  };
  if (!document.body) { document.addEventListener('DOMContentLoaded', mount); } else { mount(); }

  function start() {
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
          || canvas.getContext('experimental-webgl');
    if (!gl) { canvas.style.display = 'none'; return; }

    var PULSE_RGB = { green:[0.30,1.00,0.62], amber:[1.00,0.66,0.18], purple:[0.70,0.47,1.00], neutral:[0.80,0.88,1.00] };
    var VERT = 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';
    var FRAG = [
      'precision highp float;','uniform vec2 u_res;','uniform float u_time;','uniform float u_bright;',
      'uniform float u_pulseEl[6];','uniform vec3 u_pulseC[6];',
      'float hash21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}',
      'vec3 starLayer(vec2 uv,float scale,float bright,float drift,float t){',
      ' vec2 g=uv*scale+vec2(drift,drift*0.4);vec2 id=floor(g);vec2 gv=fract(g)-0.5;vec3 acc=vec3(0.0);',
      ' for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 off=vec2(float(x),float(y));vec2 cid=id+off;',
      '  float h=hash21(cid);float on=step(0.55,h);vec2 sp=off+vec2(hash21(cid+1.7),hash21(cid+4.3))-0.5-gv;',
      '  float r=length(sp);float size=0.010+h*0.030;float tw=0.55+0.45*sin(t*(0.7+h*1.3)+h*28.0);',
      '  float core=smoothstep(size,0.0,r);float halo=exp(-r*r*90.0)*0.55;float glow=exp(-r*r*16.0)*0.05;',
      '  float s=(core+halo+glow)*tw*on;float temp=hash21(cid+9.1);',
      '  vec3 col=mix(vec3(0.62,0.78,1.0),vec3(1.0,0.92,0.74),step(0.82,temp));',
      '  col=mix(col,vec3(0.78,0.62,1.0),step(0.93,temp));acc+=col*s*bright;}}return acc;}',
      'void main(){vec2 uv=gl_FragCoord.xy/u_res.xy;float aspect=u_res.x/u_res.y;',
      ' vec2 p=vec2(uv.x*aspect,uv.y);float py=uv.y;vec3 stars=vec3(0.0);',
      ' stars+=starLayer(p,26.0,0.55,u_time*0.10,u_time);',
      ' stars+=starLayer(p,15.0,0.85,u_time*0.18,u_time);',
      ' stars+=starLayer(p,8.0,1.15,u_time*0.30,u_time);',
      ' vec3 pulseGlow=vec3(0.0);',
      ' for(int i=0;i<6;i++){float el=u_pulseEl[i];float active=step(0.0,el);float pr=el/1.75;',
      '  float eased=1.0-pow(1.0-clamp(pr,0.0,1.0),2.0);float front=1.0-eased*1.25;float d=abs(py-front);',
      '  float band=smoothstep(0.18,0.0,d);float fade=1.0-smoothstep(0.85,1.25,pr);',
      '  pulseGlow+=u_pulseC[i]*band*fade*active;}',
      ' vec3 col=stars+stars*pulseGlow*2.2+pulseGlow*0.05;col*=u_bright;',
      ' col=col/(col+vec3(0.55));float lum=clamp(max(max(col.r,col.g),col.b),0.0,1.0);',
      ' gl_FragColor=vec4(col,lum*0.92);}'
    ].join('\n');

    function comp(t, s) { var sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; }
    var prog = gl.createProgram();
    gl.attachShader(prog, comp(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, comp(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'u_res'), uTime = gl.getUniformLocation(prog, 'u_time'),
        uBright = gl.getUniformLocation(prog, 'u_bright'),
        uEl = gl.getUniformLocation(prog, 'u_pulseEl[0]'), uC = gl.getUniformLocation(prog, 'u_pulseC[0]');

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize(); window.addEventListener('resize', resize);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pulses = [], LIFE = 2300;
    function fireP(n) { pulses.push({ t0: performance.now(), rgb: PULSE_RGB[n] || PULSE_RGB.neutral }); while (pulses.length > 6) pulses.shift(); }
    var el = new Float32Array(6), cb = new Float32Array(18), startT = performance.now(), running = true;

    function frame() {
      if (!running) return;
      requestAnimationFrame(frame);
      var now = performance.now();
      for (var i = pulses.length - 1; i >= 0; i--) if (now - pulses[i].t0 > LIFE) pulses.splice(i, 1);
      for (var j = 0; j < 6; j++) {
        if (j < pulses.length) { el[j] = (now - pulses[j].t0) / 1000; cb[j*3] = pulses[j].rgb[0]; cb[j*3+1] = pulses[j].rgb[1]; cb[j*3+2] = pulses[j].rgb[2]; }
        else { el[j] = -1; cb[j*3] = cb[j*3+1] = cb[j*3+2] = 0; }
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - startT) / 1000);
      gl.uniform1f(uBright, 1.0);
      gl.uniform1fv(uEl, el); gl.uniform3fv(uC, cb);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);

    // an occasional quiet breath of life (not on reduced-motion)
    if (!reduce) {
      fireP('neutral');
      setInterval(function () {
        if (!document.hidden) fireP(Math.random() < 0.5 ? 'neutral' : (Math.random() < 0.5 ? 'green' : 'purple'));
      }, 14000);
    }
    // pause render when the tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; requestAnimationFrame(frame); }
    });
  }
})();

/* =====================================================================
   RHOBEAR curious greeter — light, local-first, no dependencies.
   Injects its own DOM, pauses proactive timers when hidden, and keeps the
   FAQ page clear for the support bot.
   ===================================================================== */
(function () {
  if (document.getElementById('rho-greeter')) return;
  if (/\/faq\.html(?:$|[?#])/.test(window.location.pathname)) return;

  var CHAT_URL = 'https://chat.rhobear.ai/chat';
  var LEAD_URL = 'https://chat.rhobear.ai/lead';
  var DISMISS_KEY = 'rho_greeter_dismissed';
  var DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
  var NUDGE_MS = 12000;
  var NUDGE_SCROLL = 0.4;
  var lines = [
    'What would you build first?',
    'Curious what you\'d spin up?',
    'Want a 30-sec tour of what it does?',
    'What are you trying to get off the ground?'
  ];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root, launcher, nudge, nudgeText, nudgeClose, panel, closeBtn, form, input, transcript, typing, leadBox;
  var open = false, nudged = false, dismissed = false, streaming = false, visibleMs = 0, lastTick = Date.now();
  var nudgeLine = 0, nudgeRotate = null;
  var focusBefore = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function isDismissed() {
    try {
      var then = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      return then && Date.now() - then < DISMISS_MS;
    } catch (e) { return false; }
  }

  function setDismissed() {
    dismissed = true;
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
  }

  function make(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  }

  function mount() {
    dismissed = isDismissed();
    root = make('div', 'rho-greeter', '');
    root.id = 'rho-greeter';
    root.setAttribute('data-reduce-motion', reduce ? 'true' : 'false');

    nudge = make('div', 'rho-greeter-nudge', '');
    nudge.setAttribute('role', 'status');
    nudge.setAttribute('aria-live', 'polite');
    nudgeText = make('button', 'rho-greeter-nudge-text', lines[Math.floor(Math.random() * lines.length)]);
    nudgeText.type = 'button';
    nudgeText.setAttribute('aria-label', 'Open RHOBEAR greeter');
    nudgeClose = make('button', 'rho-greeter-nudge-close', '×');
    nudgeClose.type = 'button';
    nudgeClose.setAttribute('aria-label', 'Dismiss greeter nudge for 7 days');
    nudge.appendChild(nudgeText);
    nudge.appendChild(nudgeClose);

    launcher = make('button', 'rho-greeter-launcher', '');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open RHOBEAR greeter');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = '<span aria-hidden="true">?</span><strong>Ask</strong>';

    panel = make('section', 'rho-greeter-panel', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'rho-greeter-title');
    panel.setAttribute('tabindex', '-1');
    panel.innerHTML = [
      '<div class="rho-greeter-head">',
      '  <div><p class="rho-greeter-kicker">RHOBEAR guide</p><h2 id="rho-greeter-title">What are you trying to build?</h2></div>',
      '  <button type="button" class="rho-greeter-close" aria-label="Close RHOBEAR greeter">×</button>',
      '</div>',
      '<div class="rho-greeter-transcript" aria-live="polite"></div>',
      '<div class="rho-greeter-typing" hidden><span></span><span></span><span></span><em>Thinking…</em></div>',
      '<form class="rho-greeter-form">',
      '  <label class="rho-greeter-label" for="rho-greeter-input">Ask a curious question</label>',
      '  <div class="rho-greeter-inputrow"><textarea id="rho-greeter-input" rows="2" maxlength="1200" placeholder="Tell me what you want to spin up…"></textarea><button type="submit">Send</button></div>',
      '</form>',
      '<a class="rho-greeter-cta" href="spin-it-up.html">→ Spin it up</a>'
    ].join('');

    root.appendChild(nudge);
    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);

    closeBtn = panel.querySelector('.rho-greeter-close');
    form = panel.querySelector('.rho-greeter-form');
    input = panel.querySelector('#rho-greeter-input');
    transcript = panel.querySelector('.rho-greeter-transcript');
    typing = panel.querySelector('.rho-greeter-typing');

    addMessage('bot', 'I can give a quick tour, sketch a use case, or help you think through what RHOBEAR could automate first.');

    launcher.addEventListener('click', openPanel);
    nudgeText.addEventListener('click', openPanel);
    nudgeClose.addEventListener('click', function () { setDismissed(); hideNudge(); });
    closeBtn.addEventListener('click', closePanel);
    form.addEventListener('submit', sendMessage);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('visibilitychange', function () { lastTick = Date.now(); });
    window.addEventListener('scroll', checkScroll, { passive: true });
    setInterval(checkTime, 500);
    checkScroll();
  }

  function showNudge() {
    if (nudged || dismissed || open) return;
    nudged = true;
    nudgeLine = Math.floor(Math.random() * lines.length);
    nudgeText.textContent = lines[nudgeLine];
    root.classList.add('nudge-on');
    nudgeRotate = setInterval(function () {
      if (document.hidden || open || !root.classList.contains('nudge-on')) return;
      nudgeLine = (nudgeLine + 1) % lines.length;
      nudgeText.textContent = lines[nudgeLine];
    }, 4200);
  }

  function hideNudge() {
    root.classList.remove('nudge-on');
    if (nudgeRotate) { clearInterval(nudgeRotate); nudgeRotate = null; }
  }

  function checkTime() {
    var now = Date.now();
    if (!document.hidden) visibleMs += now - lastTick;
    lastTick = now;
    if (visibleMs >= NUDGE_MS) showNudge();
  }

  function checkScroll() {
    if (document.hidden) return;
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    if ((window.scrollY || doc.scrollTop || 0) / max >= NUDGE_SCROLL) showNudge();
  }

  function openPanel() {
    if (open) return;
    focusBefore = document.activeElement;
    open = true;
    hideNudge();
    root.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 30);
  }

  function closePanel() {
    if (!open) return;
    open = false;
    root.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    if (focusBefore && focusBefore.focus) focusBefore.focus();
  }

  function onKeydown(e) {
    if (!open) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closePanel(); return; }
    if (e.key !== 'Tab') return;
    var items = panel.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])');
    items = Array.prototype.slice.call(items).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function addMessage(who, text) {
    var msg = make('div', 'rho-greeter-msg ' + who, '');
    msg.textContent = text;
    transcript.appendChild(msg);
    transcript.scrollTop = transcript.scrollHeight;
    return msg;
  }

  function setTyping(on) { typing.hidden = !on; }

  function sendMessage(e) {
    e.preventDefault();
    if (streaming) return;
    var message = input.value.replace(/^\s+|\s+$/g, '');
    if (!message) return;
    input.value = '';
    addMessage('user', message);
    streamAnswer(message);
  }

  function streamAnswer(message) {
    streaming = true;
    setTyping(true);
    var botMsg = addMessage('bot', '');
    var acc = '';

    fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    }).then(function (res) {
      if (!res.ok) throw new Error('Chat request failed');
      if (!res.body || !window.TextDecoder) return res.text().then(function (t) { handleRaw(t, botMsg, message, function (v) { acc += v; }); });
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { handleRaw(buf, botMsg, message, function (v) { acc += v; }); return; }
          buf += decoder.decode(r.value, { stream: true });
          var parts = buf.split('\n\n');
          buf = parts.pop();
          parts.forEach(function (part) { handleRaw(part, botMsg, message, function (v) { acc += v; }); });
          return pump();
        });
      }
      return pump();
    }).catch(function () {
      if (!acc) botMsg.textContent = 'I could not reach the RHOBEAR brain just now. Try again in a moment.';
    }).then(function () {
      streaming = false;
      setTyping(false);
      transcript.scrollTop = transcript.scrollHeight;
    });
  }

  function handleRaw(raw, botMsg, originalMessage, append) {
    raw.split('\n').forEach(function (line) {
      line = line.replace(/^\s+|\s+$/g, '');
      if (!line || line.indexOf('data:') !== 0) return;
      var payload = line.slice(5).replace(/^\s+/, '');
      if (payload === '[DONE]') return;
      try {
        var data = JSON.parse(payload);
        if (data.chunk) {
          append(data.chunk);
          botMsg.textContent += data.chunk;
          transcript.scrollTop = transcript.scrollHeight;
        }
        if (data.done && data.suggest_lead) showLead(originalMessage);
      } catch (e) {}
    });
  }

  function showLead(message) {
    if (leadBox) return;
    leadBox = make('form', 'rho-greeter-lead', '');
    leadBox.innerHTML = '<label>Want the quick-start when it\'s ready? Drop an email <span>(optional)</span></label><div><input type="email" placeholder="you@example.com" aria-label="Email for quick-start update"><button type="submit">Send</button></div><p hidden>Thanks — saved.</p>';
    transcript.appendChild(leadBox);
    transcript.scrollTop = transcript.scrollHeight;
    leadBox.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = leadBox.querySelector('input').value.replace(/^\s+|\s+$/g, '');
      if (!email) return;
      fetch(LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, message: message })
      }).catch(function () {}).then(function () {
        leadBox.querySelector('p').hidden = false;
        leadBox.querySelector('button').disabled = true;
      });
    });
  }

  ready(mount);
})();
