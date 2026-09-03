/* =========================================================
   par.js — PAR+ case study interactions
   Requires: assets/script.js already loaded (handles nav scroll state + year)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Scroll reveal for result cards ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          revealIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.cs-result-card').forEach((el) => revealIO.observe(el));

  /* ---------- Lightbox ---------- */
  const items      = Array.from(document.querySelectorAll('[data-lightbox]'));
  const lightbox   = document.getElementById('lightbox');
  const backdrop   = document.getElementById('lightboxBackdrop');
  const lbImg      = document.getElementById('lightboxImg');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbCounter  = document.getElementById('lightboxCounter');
  const btnClose   = document.getElementById('lightboxClose');
  const btnPrev    = document.getElementById('lightboxPrev');
  const btnNext    = document.getElementById('lightboxNext');

  if (!lightbox || items.length === 0) return;

  let current = 0;
  let isOpen  = false;

  function open(index) {
    current = ((index % items.length) + items.length) % items.length;
    const item = items[current];
    const src  = item.dataset.src;
    const cap  = item.dataset.caption || '';

    lbImg.src       = src;
    lbImg.alt       = cap;
    lbCaption.textContent = cap;
    lbCounter.textContent = `${current + 1} / ${items.length}`;

    lightbox.hidden = false;
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
    isOpen = true;
  }

  function close() {
    lightbox.hidden = true;
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    isOpen = false;
    // Return focus to the trigger
    if (items[current]) items[current].focus();
  }

  function prev() { open(current - 1); }
  function next() { open(current + 1); }

  // Attach triggers
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe support (touch)
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

})();
