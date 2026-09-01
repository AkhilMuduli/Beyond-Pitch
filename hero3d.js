/**
 * BEYOND — Hero Star Field
 * Pure Canvas 2D: parallax star layers + cursor interaction
 * No dependencies.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let mouseX = 0, mouseY = 0;   // smoothed (0-1 range, centred at 0.5)
  let rawX   = 0.5, rawY = 0.5; // raw target
  let tick   = 0;
  let rafId;

  /* ═══════════════════════════════════════════════════════════
     RESIZE
  ═══════════════════════════════════════════════════════════ */
  function resize() {
    const hero = canvas.parentElement;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    buildScene();
  }

  /* ═══════════════════════════════════════════════════════════
     DATA STRUCTURES
  ═══════════════════════════════════════════════════════════ */
  let bgStars = [];  // scattered background stars (3 depth layers)

  function buildScene() {
    bgStars = [];

    // ── Background stars (3 parallax layers) ──────────────
    const layerDefs = [
      { n: 160, rMin: 0.25, rMax: 0.75, opMin: 0.16, opMax: 0.36, pFactor: 0.010 },
      { n: 100, rMin: 0.5,  rMax: 1.4,  opMin: 0.28, opMax: 0.52, pFactor: 0.022 },
      { n:  55, rMin: 1.1,  rMax: 2.8,  opMin: 0.45, opMax: 0.68, pFactor: 0.040 },
    ];

    layerDefs.forEach(({ n, rMin, rMax, opMin, opMax, pFactor }) => {
      for (let i = 0; i < n; i++) {
        const roll = Math.random();
        bgStars.push({
          nx:      Math.random(),          // normalised position (0-1)
          ny:      Math.random(),
          r:       rMin + Math.random() * (rMax - rMin),
          baseOp:  opMin + Math.random() * (opMax - opMin),
          pFactor,
          twPhase: Math.random() * Math.PI * 2,
          twSpeed: 0.004 + Math.random() * 0.014,
          // 5 % red, 4 % pink, rest white
          color:   roll < 0.05 ? [232, 65, 42]
                 : roll < 0.09 ? [247, 37, 133]
                 : [255, 255, 255],
        });
      }
    });

  }

  /* ═══════════════════════════════════════════════════════════
     MOUSE
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('mousemove', e => {
    rawX = e.clientX / window.innerWidth;
    rawY = e.clientY / window.innerHeight;
  }, { passive: true });

  // Touch support
  document.addEventListener('touchmove', e => {
    rawX = e.touches[0].clientX / window.innerWidth;
    rawY = e.touches[0].clientY / window.innerHeight;
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  function draw() {
    rafId = requestAnimationFrame(draw);
    tick += 0.008;

    // Smooth mouse — lower value = slower/lazier follow
    mouseX += (rawX - mouseX) * 0.025;
    mouseY += (rawY - mouseY) * 0.025;

    const dx = mouseX - 0.5;  // -0.5 to +0.5
    const dy = mouseY - 0.5;

    ctx.clearRect(0, 0, W, H);

    // Subtle radial vignette (makes the centre glow)
    const vig = ctx.createRadialGradient(W * 0.52, H * 0.46, 0, W * 0.52, H * 0.46, W * 0.55);
    vig.addColorStop(0,   'rgba(30,10,50,0.10)');
    vig.addColorStop(0.5, 'rgba(15,5,30,0.06)');
    vig.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // ── Background stars ─────────────────────────────────
    bgStars.forEach(s => {
      // parallax offset
      const ox = s.nx * W + dx * s.pFactor * W * 4;
      const oy = s.ny * H + dy * s.pFactor * H * 2.5;

      // wrap around edges
      const sx = ((ox % W) + W) % W;
      const sy = ((oy % H) + H) % H;

      const twinkle = 0.65 + Math.sin(tick * (s.twSpeed * 100) + s.twPhase) * 0.35;
      const op = s.baseOp * twinkle;
      const [r, g, b] = s.color;

      if (s.r > 1.5) {
        // Glow halo for brighter stars
        const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 4.5);
        g2.addColorStop(0,   `rgba(${r},${g},${b},${op})`);
        g2.addColorStop(0.4, `rgba(${r},${g},${b},${op * 0.3})`);
        g2.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${r},${g},${b},${op})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */
  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();

  // Pause when hero scrolls away
  const heroEl = canvas.closest('.hero');
  if (heroEl) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafId) draw(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    }, { threshold: 0 }).observe(heroEl);
  }

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else { if (!rafId) draw(); }
  });

})();
