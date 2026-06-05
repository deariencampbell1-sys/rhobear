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
