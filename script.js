const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const yearEl = document.getElementById('year');

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

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

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
    });
  });
}
