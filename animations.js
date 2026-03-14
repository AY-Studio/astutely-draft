/**
 * Astutely — Animations & Interactions
 * Senior-grade, zero-dependency, progressive enhancement.
 */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ─────────────────────────────────────────────────────────────
   * 1. CUSTOM CURSOR — dot + trailing ring + contextual label
   * ───────────────────────────────────────────────────────────── */
  function initCursor() {
    if (REDUCED) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot   = document.createElement('div');
    const ring  = document.createElement('div');
    const label = document.createElement('span');
    dot.id   = 'cursor-dot';
    ring.id  = 'cursor-ring';
    label.id = 'cursor-label';
    document.body.append(dot, ring, label);

    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left   = mouseX + 'px';
      dot.style.top    = mouseY + 'px';
      label.style.left = mouseX + 'px';
      label.style.top  = mouseY + 'px';
    });

    function lerpRing() {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(lerpRing);
    }
    lerpRing();

    function setCursor(state, text) {
      document.body.classList.remove('cursor--hover', 'cursor--view');
      label.textContent = '';
      if (state) document.body.classList.add(state);
      if (text)  label.textContent = text;
    }

    document.addEventListener('mouseover', e => {
      const t = e.target;
      if (t.closest('.p-item, .work-item'))
        setCursor('cursor--view', 'View');
      else if (t.closest('.insight-list-item, .insight-card'))
        setCursor('cursor--view', 'Read');
      else if (t.closest('a, button, [role="button"], .service-card, label'))
        setCursor('cursor--hover', '');
      else
        setCursor(null, '');
    });

    document.documentElement.addEventListener('mouseleave', () => {
      dot.style.opacity = ring.style.opacity = label.style.opacity = '0';
    });
    document.documentElement.addEventListener('mouseenter', () => {
      dot.style.opacity = ring.style.opacity = '1';
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 2. NAV — hide on scroll down, reveal on scroll up, shadow
   * ───────────────────────────────────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    let lastY = window.scrollY, ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle('nav--shadow', y > 20);
        if (y > 100) nav.classList.toggle('nav--hidden', y > lastY + 8);
        else         nav.classList.remove('nav--hidden');
        lastY   = y;
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────────
   * 3. HERO ENTRANCE — staggered per child element
   * ───────────────────────────────────────────────────────────── */
  function initHero() {
    const heroContent = document.querySelector('.hero-content');
    const heroImage   = document.querySelector('.hero-image');
    if (!heroContent) return;

    if (REDUCED) {
      heroContent.classList.add('hero--entered');
      if (heroImage) heroImage.classList.add('hero-img--entered');
      return;
    }

    [...heroContent.children].forEach((el, i) => el.style.setProperty('--hero-i', i));

    // Double rAF ensures browser has painted the initial hidden state
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroContent.classList.add('hero--entered');
        if (heroImage) heroImage.classList.add('hero-img--entered');
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 4. WORD SPLIT — word-by-word lift from below on [data-wipe]
   * Run BEFORE initReveal so spans exist when observer starts.
   * ───────────────────────────────────────────────────────────── */
  function initWordSplit() {
    if (REDUCED) return;

    document.querySelectorAll('[data-wipe]').forEach(el => {
      const nodes = [...el.childNodes];
      el.innerHTML = '';
      let wordIdx = 0;

      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const words = node.textContent.trim().split(/\s+/).filter(Boolean);
          words.forEach((word, i) => {
            // Space before every word except the very first child appended
            if (i > 0 || el.childNodes.length > 0) {
              el.appendChild(document.createTextNode(' '));
            }
            const mask  = document.createElement('span');
            const inner = document.createElement('span');
            mask.className  = 'word-mask';
            inner.className = 'word-inner';
            inner.style.setProperty('--wi', wordIdx++);
            inner.textContent = word;
            mask.appendChild(inner);
            el.appendChild(mask);
          });
        } else if (node.nodeName === 'BR') {
          el.appendChild(document.createElement('br'));
        } else {
          // Unknown element node — append as-is
          el.appendChild(node.cloneNode(true));
        }
      });

      el.classList.add('words-split');
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 5. SCROLL REVEALS — IntersectionObserver, one-shot, staggered
   * ───────────────────────────────────────────────────────────── */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal], [data-wipe]');
    if (!targets.length) return;

    if (REDUCED) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Assign stagger index within sibling groups
    const parentMap = new Map();
    targets.forEach(el => {
      const p = el.parentNode;
      if (!parentMap.has(p)) parentMap.set(p, []);
      parentMap.get(p).push(el);
    });
    parentMap.forEach(siblings => {
      if (siblings.length > 1) {
        siblings.forEach((el, i) => el.style.setProperty('--stagger-i', i));
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }


  /* ─────────────────────────────────────────────────────────────
   * 6. STATS COUNTER — counts up when scrolled into view
   * ───────────────────────────────────────────────────────────── */
  function initStats() {
    const statEls = document.querySelectorAll('.stat-n');
    if (!statEls.length || REDUCED) return;

    function parse(text) {
      const m = text.trim().match(/^([^0-9]*)(\d+)(.*)$/);
      return m ? { prefix: m[1], num: parseInt(m[2], 10), suffix: m[3] } : null;
    }

    function countUp(el, parsed, duration) {
      const start = performance.now();
      function frame(now) {
        const t     = Math.min((now - start) / duration, 1);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = parsed.prefix + Math.round(parsed.num * eased) + parsed.suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parsed = parse(entry.target.textContent);
          if (parsed) countUp(entry.target, parsed, 1800);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statEls.forEach(el => observer.observe(el));
  }


  /* ─────────────────────────────────────────────────────────────
   * 7. LOGO MARQUEE — duplicate track, CSS animation drives it
   * ───────────────────────────────────────────────────────────── */
  function initMarquee() {
    const logoItems = document.querySelector('.logo-items');
    if (!logoItems) return;

    const track = document.createElement('div');
    track.className = 'logo-track';
    [...logoItems.children].forEach(child => track.appendChild(child));
    logoItems.appendChild(track);

    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    logoItems.appendChild(clone);
  }


  /* ─────────────────────────────────────────────────────────────
   * 8. SHIMMER — applies to .img elements with no real <img>
   * ───────────────────────────────────────────────────────────── */
  function initShimmer() {
    document.querySelectorAll('.img').forEach(el => {
      if (!el.querySelector('img')) el.setAttribute('data-shimmer', '');
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 9. MAGNETIC BUTTONS — subtle pull toward cursor on hover
   * ───────────────────────────────────────────────────────────── */
  function initMagnetic() {
    if (REDUCED) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.btn-primary, .btn-white, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.22;
        const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.22;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 10. SMOOTH ANCHOR SCROLL
   * ───────────────────────────────────────────────────────────── */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navH = document.querySelector('.site-nav')?.offsetHeight || 0;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 11. TEXT SCRAMBLE — nav logo hover
   * ───────────────────────────────────────────────────────────── */
  function initScramble() {
    if (REDUCED) return;

    const logo = document.querySelector('.nav-logo');
    if (!logo) return;

    const CHARS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const original = logo.textContent;
    let   animId;

    logo.addEventListener('mouseenter', () => {
      cancelAnimationFrame(animId);
      let frame = 0;
      const FRAMES = 16;

      function tick() {
        frame++;
        logo.textContent = original
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < (frame / FRAMES) * original.length) return original[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
        if (frame < FRAMES) animId = requestAnimationFrame(tick);
        else logo.textContent = original;
      }

      animId = requestAnimationFrame(tick);
    });

    logo.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      logo.textContent = original;
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 12. 3D TILT — cards on desktop
   * ───────────────────────────────────────────────────────────── */
  function initTilt() {
    if (REDUCED) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.testimonial, .phase-card').forEach(el => {
      let raf;

      el.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = (e.clientX - rect.left)  / rect.width  - 0.5;
          const y = (e.clientY - rect.top)   / rect.height - 0.5;
          el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
        });
      });

      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        setTimeout(() => { el.style.transform = ''; }, 380);
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 13. WORK OVERLAYS — inject hover overlay into .p-item cards
   * ───────────────────────────────────────────────────────────── */
  function initWorkOverlays() {
    document.querySelectorAll('.p-item').forEach(item => {
      const cat   = item.querySelector('.p-item-cat');
      const imgEl = item.querySelector('.img');
      if (!cat || !imgEl) return;

      const overlay = document.createElement('div');
      overlay.className = 'p-item-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <p class="p-item-overlay-cat">${cat.textContent}</p>
        <span class="p-item-overlay-cta">View project&nbsp;&nbsp;→</span>
      `;
      imgEl.appendChild(overlay);
    });
  }


  /* ─────────────────────────────────────────────────────────────
   * 14. SCROLL PROGRESS BAR
   * ───────────────────────────────────────────────────────────── */
  function initProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0';
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────────
   * INIT
   * ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initWordSplit();    // FIRST — modifies DOM before observer starts
    initCursor();
    initNav();
    initHero();
    initReveal();
    initStats();
    initMarquee();
    initShimmer();
    initMagnetic();
    initAnchorScroll();
    initScramble();
    initTilt();
    initWorkOverlays();
    initProgress();
  });

})();
