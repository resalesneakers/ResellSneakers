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
// Função para carregar todos os produtos (exibição inicial)
async function carregarTodosProdutos() {
  const container = document.querySelector('#produtosContainer');
  const q = query(collection(db, "produtos"), orderBy("dataCriacao", "desc")); // se não tiver "dataCriacao", tira o orderBy
  const querySnapshot = await getDocs(q);

  container.innerHTML = '';

  querySnapshot.forEach((doc) => {
    const produto = doc.data();
    const cardHTML = criarCardProduto(produto, doc.id);
    container.innerHTML += cardHTML;
  });
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
          <span class="wishlist-icon" onclick="toggleFavorito('${id}')">
            <i class="${heartIcon}"></i>
          </span>
        </div>
        <div class="card-body">
          <div class="product-brand">${produto.marca || 'Marca'}</div>
          <h5 class="product-name">${produto.nome || 'Produto'} ${verificadoBadge}</h5>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="product-price">${produto.preco || '0'}€</div>
            <div class="product-condition">${produto.condicao || 'Usado'}</div>
          </div>
          <div class="mt-1">
            <span class="badge bg-secondary">${disponibilidade}</span>
          </div>
          <a href="produto-detalhe.html?id=${id}" class="btn btn-sm btn-outline-primary mt-2 w-100">
            Ver detalhes
          </a>
        </div>
      </div>
    </div>
  `;
}

// Função para aplicar filtro por disponibilidade
async function aplicarFiltroDisponibilidade(disponibilidade) {
  const container = document.querySelector('#produtosContainer');
  let q;

  if (disponibilidade === 'todos') {
    q = query(collection(db, "produtos"), orderBy("dataCriacao", "desc"));
  } else {
    q = query(collection(db, "produtos"), where("disponibilidade", "==", disponibilidade), orderBy("dataCriacao", "desc"));
  }

  const querySnapshot = await getDocs(q);
  container.innerHTML = '';
  querySnapshot.forEach((doc) => {
    const produto = doc.data();
    const cardHTML = criarCardProduto(produto, doc.id);
    container.innerHTML += cardHTML;
  });
}

// Função para configurar filtros por marca
function configurarFiltros() {
  const filtros = document.querySelectorAll('.filter-pills .badge');

  filtros.forEach(filtro => {
    filtro.addEventListener('click', async () => {
      filtros.forEach(f => f.classList.remove('badge-active'));
      filtros.forEach(f => f.classList.add('badge-light'));
      filtro.classList.add('badge-active');
      filtro.classList.remove('badge-light');

      const marca = filtro.dataset.brand;
      const container = document.querySelector('#popularProducts');
      let q;

      if (marca === 'all') {
        q = query(collection(db, "produtos"), orderBy("visualizacoes", "desc"), limit(8));
      } else {
        q = query(collection(db, "produtos"), where("marca", "==", marca), orderBy("visualizacoes", "desc"), limit(8));
      }

      const querySnapshot = await getDocs(q);
      container.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const produto = doc.data();
        const cardHTML = criarCardProduto(produto, doc.id);
        container.innerHTML += cardHTML;
      });
    });
  });
}
// Função de pesquisa por nome ou marca
document.querySelector('#barraPesquisa').addEventListener('input', async (e) => {
  const termo = e.target.value.toLowerCase();
  const container = document.querySelector('#produtosContainer');

  const q = query(collection(db, "produtos"));
  const querySnapshot = await getDocs(q);
  container.innerHTML = '';

  querySnapshot.forEach((doc) => {
    const produto = doc.data();
    const nome = (produto.nome || '').toLowerCase();
    const marca = (produto.marca || '').toLowerCase();

    if (nome.includes(termo) || marca.includes(termo)) {
      const cardHTML = criarCardProduto(produto, doc.id);
      container.innerHTML += cardHTML;
    }
  });
});

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
// Função para pesquisar produtos por nome ou marca
async function pesquisarProdutos(termo) {
  const produtosRef = collection(db, "produtos");
  const snapshot = await getDocs(produtosRef);
  const resultados = [];

  snapshot.forEach(doc => {
    const dados = doc.data();
    const nome = dados.nome?.toLowerCase() || '';
    const marca = dados.marca?.toLowerCase() || '';
    if (nome.includes(termo) || marca.includes(termo)) {
      resultados.push({ id: doc.id, ...dados });
    }
  });

  exibirResultadosPesquisa(resultados);
}

// Função para exibir os resultados
function exibirResultadosPesquisa(produtos) {
  const container = document.querySelector('#produtosContainer');
  container.innerHTML = '';

  if (produtos.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum produto encontrado.</p>';
    return;
  }

  produtos.forEach(produto => {
    const cardHTML = criarCardProduto(produto, produto.id);
    container.innerHTML += cardHTML;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await carregarProdutosRecomendados();
    await carregarProdutosTrending();
    await carregarTodosProdutos(); // mostra todos os produtos inicialmente
    configurarFiltros();
  } catch (error) {
    console.error("Erro ao inicializar a página:", error);
  }

  const barraPesquisa = document.getElementById("barraPesquisa");
  barraPesquisa.addEventListener("input", (e) => {
    const termo = e.target.value.trim().toLowerCase();
    if (termo.length === 0) {
      carregarProdutosTrending(); // se apagar a pesquisa, volta ao padrão
    } else {
      pesquisarProdutos(termo);
    }
  });

  // Filtro por disponibilidade
  const filtroDisponibilidade = document.getElementById("filtroDisponibilidade");
  filtroDisponibilidade.addEventListener("change", async () => {
    const valor = filtroDisponibilidade.value;
    const produtosRef = collection(db, "produtos");
    const snapshot = await getDocs(produtosRef);

    const filtrados = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      if (valor === "todos" || dados.disponibilidade?.toLowerCase() === valor.toLowerCase()) {
        filtrados.push({ id: doc.id, ...dados });
      }
    });

    exibirResultadosPesquisa(filtrados);
  });
});
// Lógica do filtro de disponibilidade
document.querySelector('#filtroDisponibilidade').addEventListener('change', (e) => {
  aplicarFiltroDisponibilidade(e.target.value);
});
// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  await carregarProdutosRecomendados();
  await carregarProdutosTrending();
  await carregarTodosProdutos();
  configurarFiltros();
});


