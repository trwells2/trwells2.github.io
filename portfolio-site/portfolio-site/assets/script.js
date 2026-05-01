/* =========================================================
   Portfolio — scroll-driven interactions
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- Generic IntersectionObserver reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal-line, .pillar, .project, [data-stat]').forEach((el) => {
    io.observe(el);
  });

  /* ---------- Stat count-up ---------- */
  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target)) return;
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toString();
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-count]').forEach(countUp);
          statIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-stat]').forEach((el) => statIO.observe(el));

  /* ---------- Horizontal scroll-pin for process track ---------- */
  const wrap = document.querySelector('.process__track-wrap');
  const track = document.getElementById('processTrack');

  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;

  const updateTrack = () => {
    if (!wrap || !track || !isDesktop() || reduceMotion) {
      if (track) track.style.transform = '';
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const distance = track.scrollWidth - window.innerWidth;
    const scrollable = wrap.offsetHeight - window.innerHeight;

    // Progress: 0 when wrap top hits viewport top, 1 when wrap bottom hits viewport bottom
    let progress = 0;
    if (scrollable > 0) {
      progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    }

    track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
  };

  let ticking = false;
  const onScrollTrack = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTrack();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScrollTrack, { passive: true });
  window.addEventListener('resize', updateTrack);
  updateTrack();

  /* ---------- Smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
