(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow
  const header = $('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const mobileToggle = $('#mobileToggle');
  const mobileMenu = $('#mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  // Reveal on scroll
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('in-view'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }

  // Counter animation
  const counters = $$('.counter');
  if ('IntersectionObserver' in window && counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target || '0');
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(target * eased);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  // Testimonials carousel
  const track = $('#carouselTrack') || $('.carousel-track');
  const prevBtn = $('#carouselPrev');
  const nextBtn = $('#carouselNext');
  const dotsWrap = $('#carouselDots');
  if (track) {
    const slides = $$(':scope > *', track);
    const getStep = () => {
      if (!slides.length) return track.clientWidth;
      const a = slides[0].getBoundingClientRect();
      const b = slides[1] ? slides[1].getBoundingClientRect() : null;
      return b ? (b.left - a.left) : a.width;
    };
    let index = 0;
    const goTo = (i) => {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: index * getStep(), behavior: 'smooth' });
      updateDots();
    };
    const updateDots = () => {
      if (!dotsWrap) return;
      $$('.dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === index));
    };
    if (dotsWrap && slides.length) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'dot' + (i === 0 ? ' active' : '');
        b.setAttribute('aria-label', `Atsauksme ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    let scrollT;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        const step = getStep();
        if (step > 0) {
          index = Math.round(track.scrollLeft / step);
          updateDots();
        }
      }, 80);
    });
  }

  // Back to top
  const backToTop = $('#backToTop') || $('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth in-page anchors
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  onScroll();
})();
