const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const yearEl = document.getElementById('year');
const hero = document.querySelector('.hero');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function updateHeaderOnScroll() {
  if (!header) return;

  const scrolled = window.scrollY > 20;
  header.classList.toggle('is-sticky', scrolled);
}

let scrollTicking = false;

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateHeaderOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  },
  { passive: true }
);

updateHeaderOnScroll();

function initHeroEntrance() {
  if (!hero) return;

  if (prefersReducedMotion) {
    hero.classList.add('is-ready');
    return;
  }

  requestAnimationFrame(() => {
    hero.classList.add('is-ready');
  });
}

function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -6% 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = header?.classList.contains('is-sticky')
        ? 76
        : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 96;

      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen && header) {
      header.classList.add('is-sticky');
    } else {
      updateHeaderOnScroll();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });
}

const galleryViewport = document.querySelector('.gallery__viewport');
const galleryTrack = document.querySelector('.gallery__track');
const galleryPrev = document.querySelector('.gallery__btn--prev');
const galleryNext = document.querySelector('.gallery__btn--next');
const galleryDots = document.querySelector('.gallery__dots');
const galleryCounterCurrent = document.querySelector('.gallery__counter-current');

if (galleryViewport && galleryTrack) {
  const slides = Array.from(galleryTrack.querySelectorAll('.gallery__slide'));
  let activeIndex = 0;

  function getSlideStep() {
    const slide = slides[0];
    if (!slide) return galleryViewport.clientWidth;

    const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
    return slide.offsetWidth + gap;
  }

  function scrollToSlide(index) {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    galleryViewport.scrollTo({
      left: clamped * getSlideStep(),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  function updateGalleryState() {
    const step = getSlideStep();
    if (!step) return;

    activeIndex = Math.round(galleryViewport.scrollLeft / step);
    activeIndex = Math.max(0, Math.min(activeIndex, slides.length - 1));

    const maxScroll = galleryTrack.scrollWidth - galleryViewport.clientWidth;
    if (galleryPrev) galleryPrev.disabled = galleryViewport.scrollLeft <= 2;
    if (galleryNext) galleryNext.disabled = galleryViewport.scrollLeft >= maxScroll - 2;

    galleryDots?.querySelectorAll('.gallery__dot').forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });

    if (galleryCounterCurrent) {
      galleryCounterCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
    }
  }

  if (galleryDots) {
    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to photo ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      if (index === 0) dot.classList.add('is-active');

      dot.addEventListener('click', () => scrollToSlide(index));
      galleryDots.appendChild(dot);
    });
  }

  galleryPrev?.addEventListener('click', () => scrollToSlide(activeIndex - 1));
  galleryNext?.addEventListener('click', () => scrollToSlide(activeIndex + 1));

  galleryViewport.addEventListener(
    'scroll',
    () => {
      requestAnimationFrame(updateGalleryState);
    },
    { passive: true }
  );

  galleryViewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToSlide(activeIndex + 1);
    }
  });

  window.addEventListener('resize', updateGalleryState);
  updateGalleryState();
}

initHeroEntrance();
initScrollReveals();
initSmoothAnchors();
