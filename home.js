// Importando os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
  authDomain: "resalesneakers-e17cb.firebaseapp.com",
  databaseURL: "https://resalesneakers-e17cb-default-rtdb.firebaseio.com",
  projectId: "resalesneakers-e17cb",
  storageBucket: "resalesneakers-e17cb.appspot.com",
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
    const recomendadosContainer = document.querySelector('#featuredProducts');
    const q = query(collection(db, "produtos"), limit(4));
    const querySnapshot = await getDocs(q);

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
    const trendingContainer = document.querySelector('#popularProducts');
    const q = query(collection(db, "produtos"), orderBy("visualizacoes", "desc"), limit(8));
    const querySnapshot = await getDocs(q);

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
  const verificadoBadge = produto.verificado ? 
    `<i class="fas fa-check-circle verified-badge ms-1"></i>` : '';
  const heartIcon = produto.favorito ? 'fas fa-heart' : 'far fa-heart';
  const disponibilidade = produto.disponibilidade || 'Indefinido';

  return `
    <div class="col-6 col-md-3">
      <div class="card product-card h-100" data-id="${id}">
        <div class="position-relative">
          <img src="${produto.imagemPrincipal || 'https://via.placeholder.com/400x320'}" class="card-img-top product-img" alt="${produto.nome}">
          <a href="#" class="wishlist-icon" onclick="toggleFavorito('${id}')">
            <i class="${heartIcon}"></i>
          </a>
        </div>
        <div class="card-body">
          <div class="product-brand">${produto.marca || 'Marca'}</div>
          <h5 class="product-name">${produto.nome || 'Produto'}</h5>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="product-price">${produto.preco || '0'}€</div>
            <div class="product-condition">${produto.condicao || 'Usado'}</div>
          </div>
          <div class="mt-1">
            <span class="badge bg-secondary">${disponibilidade}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Função para configurar filtros
function configurarFiltros() {
  const filtros = document.querySelectorAll('.filter-pills .badge');

  filtros.forEach(filtro => {
    filtro.addEventListener('click', async () => {
      filtros.forEach(f => f.classList.remove('badge-active'));
      filtros.forEach(f => f.classList.add('badge-light'));
      filtro.classList.add('badge-active');
      filtro.classList.remove('badge-light');

      const marca = filtro.dataset.brand;

      if (marca === 'all') {
        await carregarProdutosTrending();
        return;
      }

      try {
        const trendingContainer = document.querySelector('#popularProducts');
        const q = query(collection(db, "produtos"), where("marca", "==", marca), limit(8));
        const querySnapshot = await getDocs(q);

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

// Alternar favorito (fictício)
window.toggleFavorito = async function(produtoId) {
  const wishlistIcon = document.querySelector(`.card[data-id="${produtoId}"] .wishlist-icon i`);
  if (wishlistIcon.classList.contains('far')) {
    wishlistIcon.classList.remove('far');
    wishlistIcon.classList.add('fas');
  } else {
    wishlistIcon.classList.remove('fas');
    wishlistIcon.classList.add('far');
  }
};

// Abrir chat fictício
window.abrirChat = function(vendedor) {
  alert(`Abrindo chat com ${vendedor}. Esta funcionalidade será implementada em breve.`);
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await carregarProdutosRecomendados();
    await carregarProdutosTrending();
    configurarFiltros();
  } catch (error) {
    console.error("Erro ao inicializar a página:", error);
  }
});
