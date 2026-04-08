// ===========================
// CUSTOM CURSOR
// ===========================
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100, cx = -100, cy = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  if (cursor)    cursor.style.left    = cx + 'px', cursor.style.top    = cy + 'px';
  if (cursorDot) cursorDot.style.left = mx + 'px', cursorDot.style.top = my + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, [role="button"]').forEach(el => {
  el.addEventListener('mouseenter', () => cursor?.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor?.classList.remove('hovering'));
});

// ===========================
// NAVBAR SCROLL
// ===========================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 50);
}, { passive: true });

// ===========================
// BURGER MENU
// ===========================
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===========================
// SCROLL REVEAL
// ===========================
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ===========================
// ACCORDION / FAQ
// ===========================
document.querySelectorAll('.accordion__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.accordion__item');
    const answer = item.querySelector('.accordion__a');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.accordion__item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.accordion__a').style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ===========================
// MEMBER COUNT ANIMATION
// ===========================
const counterEl = document.getElementById('memberCount');
if (counterEl) {
  let count = 200;
  const target = 247;
  const step = () => {
    if (count < target) {
      count += Math.ceil((target - count) / 8);
      counterEl.textContent = count + ' membres actifs';
      requestAnimationFrame(step);
    } else {
      counterEl.textContent = target + ' membres actifs';
    }
  };
  setTimeout(step, 600);
}

// ===========================
// ACTIVE NAV LINK ON SCROLL
// ===========================
const sections = document.querySelectorAll('section[id], div[id="results"]');
const navAnchors = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current
      ? 'rgba(255,255,255,1)'
      : '';
  });
}, { passive: true });
