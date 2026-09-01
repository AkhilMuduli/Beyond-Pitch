/* ══════════════════════════════════════════════════════════════
   BEYOND — Micro-Interactions & Animations
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. PROGRESS BAR ──────────────────────────────────────
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;z-index:9999;pointer-events:none;
    background:linear-gradient(90deg,#e8412a,#f72585);
    width:0%;transition:width .1s linear;
  `;
  document.body.appendChild(bar);

  // ─── 2. NAV SCROLL ────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${(sy / docH) * 100}%`;
    navbar.classList.toggle('scrolled', sy > 50);
    if (sy > lastY + 8 && sy > 200) navbar.style.transform = 'translateY(-100%)';
    else if (sy < lastY - 5)         navbar.style.transform = 'translateY(0)';
    lastY = sy;
  }, { passive: true });
  navbar.style.transition = 'background .4s, backdrop-filter .4s, box-shadow .4s, transform .3s ease';

  // ─── 3. MOBILE NAV ────────────────────────────────────────
  const ham     = document.getElementById('hamburger');
  const mobNav  = document.getElementById('mobileNav');
  const mobClose= document.getElementById('mobileClose');
  const overlay = document.getElementById('navOverlay');

  const openNav = () => {
    mobNav.classList.add('open');
    overlay.classList.add('active');
    ham.classList.add('open');
    mobNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    mobNav.classList.remove('open');
    overlay.classList.remove('active');
    ham.classList.remove('open');
    mobNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  ham?.addEventListener('click', openNav);
  mobClose?.addEventListener('click', closeNav);
  overlay?.addEventListener('click', closeNav);
  mobNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  // ─── 4. SCROLL REVEAL ─────────────────────────────────────
  const aosEls = document.querySelectorAll('[data-aos]');
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = +(e.target.dataset.aosDelay || 0);
        setTimeout(() => e.target.classList.add('is-visible'), d);
        aosObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Self-referencing fix
  const aosObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = +(e.target.dataset.aosDelay || 0);
        setTimeout(() => e.target.classList.add('is-visible'), d);
        aosObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  aosEls.forEach(el => aosObs.observe(el));

  // ─── 5. PARTICLES (ambient dot field as Three.js loads) ───
  const pCont = document.getElementById('particles');
  if (pCont) {
    const colors = ['rgba(232,65,42,.6)','rgba(247,37,133,.4)','rgba(245,183,49,.3)','rgba(255,255,255,.15)'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const s = Math.random() * 2 + .6;
      p.style.cssText = `
        width:${s}px;height:${s}px;left:${Math.random()*100}%;
        border-radius:50%;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        animation:particle ${Math.random()*14+10}s linear ${-Math.random()*14}s infinite;
      `;
      pCont.appendChild(p);
    }
  }



  // ─── 6. CURSOR GLOW ───────────────────────────────────────
  const cg = document.createElement('div');
  cg.className = 'cursor-glow';
  document.body.appendChild(cg);
  let mx=0,my=0,gx=0,gy=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  const tick = () => {
    gx += (mx-gx)*.07; gy += (my-gy)*.07;
    cg.style.left = gx+'px'; cg.style.top = gy+'px';
    requestAnimationFrame(tick);
  };
  tick();

  // ─── 7. FAQ ───────────────────────────────────────────────
  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq__item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__q').setAttribute('aria-expanded','false');
      });
      if (!open) {
        item.classList.add('open');
        item.querySelector('.faq__q').setAttribute('aria-expanded','true');
      }
    });
  });

  // ─── 8. STAT COUNTERS ─────────────────────────────────────
  const stats = [
    { el: document.getElementById('stat1'), raw:'$8.4m+', end:8.4, prefix:'$', suffix:'m+', dec:1 },
    { el: document.getElementById('stat2'), raw:'12,000+', end:12000, prefix:'', suffix:'+', dec:0 },
    { el: document.getElementById('stat3'), raw:'340+', end:340, prefix:'', suffix:'+', dec:0 },
  ];
  let counted = false;
  const statsEl = document.querySelector('.stats-grid');
  if (statsEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        const dur=1800, step=16, steps=Math.ceil(dur/step);
        let f=0;
        const t = setInterval(() => {
          f++;
          const p = 1-Math.pow(1-f/steps,3);
          stats.forEach(s => {
            if (!s.el) return;
            const v = s.end * Math.min(p,1);
            s.el.textContent = s.prefix + (s.dec ? v.toFixed(s.dec) : Math.round(v).toLocaleString('en-IN')) + s.suffix;
          });
          if (f>=steps) { clearInterval(t); stats.forEach(s => { if(s.el) s.el.textContent=s.raw; }); }
        }, step);
      }
    }, { threshold:.4 }).observe(statsEl);
  }

  // ─── 9. MAGNETIC BUTTONS ──────────────────────────────────
  document.querySelectorAll('.nav__cta, .btn-hero').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX-r.left-r.width/2)*.18;
      const y = (e.clientY-r.top-r.height/2)*.18;
      btn.style.transform = `translate(${x}px,${y}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  // ─── 10. HERO PARALLAX ────────────────────────────────────
  const heroVisual = document.querySelector('.hero__visual');
  window.addEventListener('scroll', () => {
    if (heroVisual && window.scrollY < window.innerHeight) {
      heroVisual.style.transform = `translateY(${window.scrollY * .09}px)`;
    }
  }, { passive: true });

  // ─── 11. CREATOR CARD TILT ────────────────────────────────
  document.querySelectorAll('.ccard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width -.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `
        perspective(600px)
        rotateY(${x*10}deg)
        rotateX(${-y*8}deg)
        translateY(-5px) scale(1.02)
      `;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  // ─── 12. NICHE PILL ACTIVE ────────────────────────────────
  document.querySelectorAll('.npill').forEach(pill => {
    pill.addEventListener('click', () => {
      const pills = document.querySelectorAll('.npill');
      pills.forEach(p => { p.style.opacity='.45'; p.style.transform=''; });
      pill.style.opacity='1';
      pill.style.transform='translateY(-5px) scale(1.1)';
      setTimeout(() => pills.forEach(p => { p.style.opacity=''; p.style.transform=''; }), 1800);
    });
  });

  // ─── 13. DEAL CARD RIPPLE ─────────────────────────────────
  if (!document.getElementById('ripple-css')) {
    const s = document.createElement('style');
    s.id='ripple-css';
    s.textContent = `@keyframes ripp { to { transform:scale(2.8); opacity:0; } }`;
    document.head.appendChild(s);
  }
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('click', e => {
      const r = card.getBoundingClientRect();
      const size = Math.max(r.width,r.height);
      const rip = document.createElement('span');
      rip.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px;
        background:rgba(232,65,42,.15);border-radius:50%;
        transform:scale(0);animation:ripp .6s ease-out forwards;pointer-events:none;
      `;
      card.appendChild(rip);
      setTimeout(()=>rip.remove(), 600);
    });
  });

  // ─── 14. DEAL CARDS STAGGER APPEAR ───────────────────────
  const dealSection = document.getElementById('deals');
  if (dealSection) {
    let dealDone = false;
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !dealDone) {
        dealDone = true;
        document.querySelectorAll('.deal-card').forEach((c,i) => {
          c.style.cssText += 'opacity:0;transform:translateX(-20px);';
          setTimeout(() => {
            c.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.34,1.56,.64,1)';
            c.style.opacity='1'; c.style.transform='translateX(0)';
          }, i*150);
        });
      }
    }, { threshold:.3 }).observe(dealSection);
  }

  // ─── 15. BUBBLE CLUSTER MOUSE REPULSION ──────────────────
  const growthCluster = document.getElementById('growthCluster');
  if (growthCluster) {
    growthCluster.addEventListener('mousemove', e => {
      const rect = growthCluster.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      growthCluster.querySelectorAll('.bubble').forEach(b => {
        const br = b.getBoundingClientRect();
        const ox = br.left - rect.left + br.width / 2;
        const oy = br.top  - rect.top  + br.height / 2;
        const dx = cx - ox, dy = cy - oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = 120;
        if (dist < max && dist > 0) {
          const f = (max - dist) / max;
          const angle = Math.atan2(dy, dx);
          b.style.transition = 'transform .15s ease';
          b.style.transform  = `translate(${-Math.cos(angle)*f*22}px, ${-Math.sin(angle)*f*22}px) scale(${1 + f * .08})`;
        } else {
          b.style.transition = 'transform .5s ease';
          b.style.transform  = '';
        }
      });
    });
    growthCluster.addEventListener('mouseleave', () => {
      growthCluster.querySelectorAll('.bubble').forEach(b => {
        b.style.transition = 'transform .8s ease';
        b.style.transform  = '';
      });
    });
  }

  // ─── 16. HERO CARD HOVER GLOW ─────────────────────────────
  document.querySelectorAll('.hero__card').forEach(card => {
    const isGrowth = card.classList.contains('hero__card--tr');
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = isGrowth
        ? '0 16px 40px rgba(34,197,94,.22)' : '0 16px 40px rgba(232,65,42,.22)';
      card.style.borderColor = isGrowth
        ? 'rgba(34,197,94,.3)' : 'rgba(232,65,42,.3)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow=''; card.style.borderColor='';
    });
  });

  // ─── 17. FEATURE IMAGE TILT ──────────────────────────────
  document.querySelectorAll('.fsec__inner').forEach(sec => {
    sec.addEventListener('mousemove', e => {
      const r=sec.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      const img=sec.querySelector('.fsec__circle-img');
      if (img) img.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${-y*5}deg) scale(1.03)`;
    });
    sec.addEventListener('mouseleave', () => {
      const img=sec.querySelector('.fsec__circle-img');
      if (img) img.style.transform='';
    });
  });

  // ─── 18. MARQUEE HOVER PAUSE ──────────────────────────────
  const marq = document.querySelector('.marquee-inner');
  const marqSec = document.querySelector('.marquee-section');
  marqSec?.addEventListener('mouseenter', () => { if(marq) marq.style.animationPlayState='paused'; });
  marqSec?.addEventListener('mouseleave', () => { if(marq) marq.style.animationPlayState='running'; });

  // ─── 19. SMOOTH ANCHOR SCROLL ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const h = a.getAttribute('href');
      if (h==='#') return;
      const t = document.querySelector(h);
      if (t) {
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top+window.scrollY-(navbar?.offsetHeight||70)-20, behavior:'smooth' });
      }
    });
  });

  // ─── 20. BRAND REVIEW STAGGER ─────────────────────────────
  const brevCards = document.querySelectorAll('.brev-card');
  new IntersectionObserver((entries) => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.transition='opacity .5s ease, transform .5s cubic-bezier(.34,1.56,.64,1)';
          e.target.style.opacity='1'; e.target.style.transform='translateX(0)';
        }, i*120);
      }
    });
  }, { threshold:.3 }).observe(document.querySelector('.brand-reviews') || document.body);

  brevCards.forEach(c => {
    c.style.opacity='0'; c.style.transform='translateX(-16px)';
  });

});
