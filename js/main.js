/* NAVBAR scroll */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 40);
}, { passive: true });

/* BURGER */
const burger  = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  navMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* SCROLL REVEAL */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* FAQ ACCORDION */
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq__item');
    const answer = item.querySelector('.faq__a');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq__item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq__a').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
