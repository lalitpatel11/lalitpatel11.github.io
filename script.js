document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Theme toggle (light / dark). Initial theme is applied inline in <head>.
  const themeToggle = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncThemeMeta = () => {
    if (themeMeta) themeMeta.setAttribute('content', root.dataset.theme === 'light' ? '#fafafa' : '#09090b');
  };
  syncThemeMeta();
  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    syncThemeMeta();
  });

  // Mobile menu
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menu-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  };
  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!nav.classList.contains('is-open'));
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Scroll progress + nav shadow
  const progress = document.getElementById('scroll-progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link (scroll-spy)
  const navLinks = document.querySelectorAll('.nav__links a');
  navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  const spyTargets = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach((s) => spy.observe(s));
  }

  // Reveal sections on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Stagger phone app icons
  document.querySelectorAll('.phone__app').forEach((el, i) => el.style.setProperty('--i', i));

  // Cursor spotlight on cards
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest?.('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // Copy email
  const copyBtn = document.getElementById('copy-email');
  copyBtn?.addEventListener('click', async () => {
    const label = copyBtn.querySelector('span');
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      label.textContent = 'Copied!';
    } catch (e) {
      window.location.href = `mailto:${copyBtn.dataset.email}`;
      return;
    }
    setTimeout(() => { label.textContent = 'Copy email'; }, 1800);
  });

  // Typing role
  const typed = document.getElementById('typed');
  const words = ['React Native Dev', 'Node.js Dev', 'Go Backend Dev', 'Flutter Dev', 'UI/UX Designer'];
  if (typed && !prefersReducedMotion) {
    let w = 0;
    let i = words[0].length;
    let deleting = true;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 85;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 300;
      } else {
        i += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }
});
