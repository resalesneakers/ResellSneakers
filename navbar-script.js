// Script adicional para garantir consistência da navbar em todas as páginas

document.addEventListener('DOMContentLoaded', function() {
  // Garantir que o Bootstrap seja carregado
  if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap não encontrado. Carregando...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js';
    document.head.appendChild(script);
  }

  // Garantir que FontAwesome seja carregado
  if (!document.querySelector('link[href*="font-awesome"]')) {
    console.warn('FontAwesome não encontrado. Carregando...');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);
  }

  // Marcar link ativo baseado na página atual
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.modern-navbar .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Adicionar funcionalidade de logout
  function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          // Verificar se o Firebase está disponível
          if (typeof auth !== 'undefined') {
            await auth.signOut();
          }
          window.location.href = 'log.html';
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
          // Fallback: redirecionar para página de login
          window.location.href = 'log.html';
        }
      });
    }
  }

  // Adicionar funcionalidade de pesquisa
  function setupSearch() {
    const searchInput = document.getElementById('inputMarcaNavbar');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const searchTerm = this.value.trim();
          if (searchTerm) {
            // Redirecionar para página de produtos com filtro
            window.location.href = `produtos.html?marca=${encodeURIComponent(searchTerm)}`;
          }
        }
      });
    }
  }

  // Adicionar funcionalidade de menu mobile
  function setupMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
      navbarToggler.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
          navbarCollapse.classList.remove('show');
        } else {
          navbarCollapse.classList.add('show');
        }
      });

      // Fechar menu ao clicar em um link
      const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', function() {
          if (window.innerWidth < 992) {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  // Adicionar efeitos visuais
  function setupVisualEffects() {
    const navLinks = document.querySelectorAll('.modern-navbar .nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  }

  // Verificar se é admin e mostrar links correspondentes
  function setupAdminLinks() {
    const UID_ADMIN = "Up3RIVwJBGQVYWW3kPJCg0I5GIf1";
    
    // Verificar se o Firebase está disponível
    if (typeof auth !== 'undefined' && typeof onAuthStateChanged !== 'undefined') {
      onAuthStateChanged(auth, user => {
        if (user && user.uid === UID_ADMIN) {
          const adminLink = document.getElementById('adminLink');
          const dashboardLink = document.getElementById('dashboardLink');
          
          if (adminLink) adminLink.classList.remove('d-none');
          if (dashboardLink) dashboardLink.classList.remove('d-none');
        }
      });
    }
  }

  // Inicializar todas as funcionalidades
  function init() {
    setActiveNavLink();
    setupLogout();
    setupSearch();
    setupMobileMenu();
    setupVisualEffects();
    setupAdminLinks();
  }

  // Executar inicialização
  init();

  // Re-executar quando a página for redimensionada
  window.addEventListener('resize', function() {
    setActiveNavLink();
  });
});

// Função global para marcar link ativo (pode ser chamada de outras páginas)
window.setActiveNavLink = function() {
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.modern-navbar .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}; 