// Importando os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
    authDomain: "resalesneakers-e17cb.firebaseapp.com",
    databaseURL: "https://resalesneakers-e17cb-default-rtdb.firebaseio.com",
    projectId: "resalesneakers-e17cb",
    storageBucket: "resalesneakers-e17cb.firebasestorage.app",
    messagingSenderId: "698715655625",
    appId: "1:698715655625:web:fde7f7a7f2da0037792c18",
    measurementId: "G-WVNMT06HJS"
  };

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para carregar produtos recomendados
async function carregarProdutosRecomendados() {
  try {
    const recomendadosContainer = document.querySelector('.recommended-title').closest('section').querySelector('.row.g-4');
    const q = query(collection(db, "produtos"), limit(4));
    const querySnapshot = await getDocs(q);
    
    // Limpar o conteúdo atual
    recomendadosContainer.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
      const produto = doc.data();
      const cardHTML = criarCardProduto(produto, doc.id);
      recomendadosContainer.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Erro ao carregar produtos recomendados:", error);
  }
}

// Função para carregar produtos em trending
async function carregarProdutosTrending() {
  try {
    const trendingContainer = document.querySelector('section.bg-light .row.g-4');
    const q = query(collection(db, "produtos"), orderBy("visualizacoes", "desc"), limit(8));
    const querySnapshot = await getDocs(q);
    
    // Limpar o conteúdo atual
    trendingContainer.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
      const produto = doc.data();
      const cardHTML = criarCardProduto(produto, doc.id);
      trendingContainer.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Erro ao carregar produtos trending:", error);
  }
}

// Função para criar um card de produto
function criarCardProduto(produto, id) {
  // Verificar se o vendedor é verificado
  const verificadoBadge = produto.verificado ? 
    `<i class="fas fa-check-circle verified-badge ms-1"></i>` : '';
  
  // Verificar se o produto está na lista de desejos
  const heartIcon = produto.favorito ? 'fas fa-heart' : 'far fa-heart';
  
  return `
    <div class="col-6 col-md-3">
      <div class="card product-card h-100" data-id="${id}">
        <div class="position-relative">
          <img src="${produto.imagem || '/api/placeholder/400/320'}" class="card-img-top product-img" alt="${produto.nome}">
          <a href="#" class="wishlist-icon" onclick="toggleFavorito('${id}')">
            <i class="${heartIcon}"></i>
          </a>
        </div>
        <div class="card-body">
          <div class="product-brand">${produto.marca || 'Marca'}</div>
          <h5 class="product-name">${produto.nome || 'Produto'}</h5>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="product-price">${produto.preco || '0'}€</div>
            <div class="product-condition">${produto.estado || 'Usado'}</div>
          </div>
          <div class="seller-info d-flex align-items-center mt-3">
            <img src="${produto.vendedorImagem || '/api/placeholder/50/50'}" alt="Vendedor" class="seller-avatar me-2">
            <span>@${produto.vendedor || 'anônimo'}</span>
            ${verificadoBadge}
          </div>
          <a href="#" class="chat-icon" title="Conversar com o vendedor" onclick="abrirChat('${produto.vendedor}')">
            <i class="fas fa-comments"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Função para lidar com os filtros (marcas)
function configurarFiltros() {
  const filtros = document.querySelectorAll('.filter-pills .badge');
  
  filtros.forEach(filtro => {
    filtro.addEventListener('click', async () => {
      // Remover classe ativa de todos os filtros
      filtros.forEach(f => f.classList.remove('badge-active'));
      f.classList.add('badge-light');
      
      // Adicionar classe ativa ao filtro clicado
      filtro.classList.add('badge-active');
      filtro.classList.remove('badge-light');
      
      // Obter o texto do filtro (marca)
      const marca = filtro.textContent.split(' ')[0];
      
      // Se for "Todos", carregar todos os produtos
      if (marca === 'Todos') {
        await carregarProdutosTrending();
        return;
      }
      
      // Caso contrário, filtrar por marca
      try {
        const trendingContainer = document.querySelector('section.bg-light .row.g-4');
        const q = query(collection(db, "produtos"), where("marca", "==", marca), limit(8));
        const querySnapshot = await getDocs(q);
        
        // Limpar o conteúdo atual
        trendingContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
          const produto = doc.data();
          const cardHTML = criarCardProduto(produto, doc.id);
          trendingContainer.innerHTML += cardHTML;
        });
      } catch (error) {
        console.error("Erro ao filtrar produtos:", error);
      }
    });
  });
}

// Função para alternar favorito
window.toggleFavorito = async function(produtoId) {
  const wishlistIcon = document.querySelector(`.card[data-id="${produtoId}"] .wishlist-icon i`);
  
  if (wishlistIcon.classList.contains('far')) {
    wishlistIcon.classList.remove('far');
    wishlistIcon.classList.add('fas');
    // Aqui você adicionaria lógica para salvar no Firestore
  } else {
    wishlistIcon.classList.remove('fas');
    wishlistIcon.classList.add('far');
    // Aqui você adicionaria lógica para remover do Firestore
  }
};

// Função para abrir chat com vendedor
window.abrirChat = function(vendedor) {
  alert(`Abrindo chat com ${vendedor}. Esta funcionalidade será implementada em breve.`);
};

// Inicializar a página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await carregarProdutosRecomendados();
    await carregarProdutosTrending();
    configurarFiltros();
  } catch (error) {
    console.error("Erro ao inicializar a página:", error);
  }
});