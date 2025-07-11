// navbar-script.js
// Script universal de navegação - atualizado para responsividade, acessibilidade e animações

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', nav.classList.contains('open'));
      nav.style.transition = 'all 0.3s cubic-bezier(.4,0,.2,1)';
    });
  }
  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (nav && menuBtn && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  // Feedback visual ao focar
  const links = document.querySelectorAll('.modern-navbar .nav-link');
  links.forEach(link => {
    link.addEventListener('focus', () => link.classList.add('focus'));
    link.addEventListener('blur', () => link.classList.remove('focus'));
  });
}); 