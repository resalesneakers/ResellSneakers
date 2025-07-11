// home.js modificado com botão de chat nos cards
import { auth, db, storage } from './firebase-config.js';
import { collection, query, where, orderBy, onSnapshot, getDocs, limit, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const marcasPadrao = ["Nike", "Adidas", "Jordan", "Yeezy", "New Balance", "Puma", "Converse", "Vans"];
let favoritosIds = new Set();

// Buscar favoritos do usuário autenticado
async function carregarFavoritosUsuario() {
  favoritosIds.clear();
  const user = auth.currentUser;
  if (!user) return;
  const favsSnap = await getDocs(query(collection(db, "favoritos"), where("userId", "==", user.uid)));
  favsSnap.forEach(doc => favoritosIds.add(doc.data().produtoId));
}

function criarCardProduto(produto, id) {
  const verificadoBadge = produto.verificado ? `<i class="fas fa-check-circle verified-badge ms-1"></i>` : '';
  const heartIcon = favoritosIds.has(id) ? 'fas fa-heart' : 'far fa-heart';
  const disponibilidade = produto.disponibilidade || 'Indefinido';
  const imagem = produto.imagemPrincipal && produto.imagemPrincipal !== ''
    ? produto.imagemPrincipal
    : 'https://via.placeholder.com/400x320?text=Sem+Imagem';

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch mb-4">
      <div class="card product-card shadow-sm h-100 w-100" data-id="${id}" style="border-radius: 18px; overflow: hidden; transition: box-shadow 0.2s;">
        <div class="position-relative" style="height: 220px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
          <img src="${imagem}" class="card-img-top product-img" alt="${produto.nome}" style="max-height: 200px; width: auto; object-fit: contain; margin: auto;">
          <span class="wishlist-icon position-absolute top-0 end-0 m-2" onclick="toggleFavorito('${id}')">
            <i class="${heartIcon}"></i>
          </span>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="product-brand text-uppercase text-muted small mb-1">${produto.marca || 'Marca'}</div>
          <h5 class="product-name mb-1">${produto.nome || 'Produto'} ${verificadoBadge}</h5>
          <div class="d-flex justify-content-between align-items-center mt-2 mb-2">
            <div class="product-price fw-bold text-danger">${produto.preco || '0'}€</div>
            <div class="product-condition badge bg-light text-dark">${produto.condicao || 'Usado'}</div>
          </div>
          <span class="badge bg-secondary mb-2">${disponibilidade}</span>
          <a href="produto-detalhe.html?id=${id}" class="btn btn-sm btn-outline-primary mt-auto w-100">
            Ver detalhes
          </a>
          <a href="chat.html?produto=${id}&vendedor=${produto.vendedorId || produto.userId || ''}" class="btn btn-outline-primary btn-sm mt-2 w-100" ${(produto.vendedorId || produto.userId) ? '' : 'onclick="alert(\'Vendedor não encontrado\');return false;"'}>
            <i class="bi bi-chat-dots"></i> Chat
          </a>
        </div>
      </div>
    </div>
  `;
}

async function carregarProdutosFiltradosRealtime({ termo = '', marca = '', condicao = '', disponibilidade = '' } = {}) {
  const container = document.querySelector('#produtosContainer');
  await carregarFavoritosUsuario();
  let q = collection(db, "produtos");
  let filtros = [];

  if (marca && marca !== 'all') filtros.push(where('marca', '==', marca));
  if (condicao && condicao !== 'todos') filtros.push(where('condicao', '==', condicao));
  if (disponibilidade && disponibilidade !== 'todos') filtros.push(where('disponibilidade', '==', disponibilidade));

  if (filtros.length > 0) {
    q = query(q, ...filtros, orderBy('dataCriacao', 'desc'));
  } else {
    q = query(q, orderBy('dataCriacao', 'desc'));
  }

  onSnapshot(q, (querySnapshot) => {
    let produtos = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (!termo || (data.nome?.toLowerCase().includes(termo) || data.marca?.toLowerCase().includes(termo))) {
        produtos.push({ ...data, id: doc.id });
      }
    });

    container.innerHTML = '';
    if (produtos.length === 0) {
      container.innerHTML = '<p class="text-muted">Nenhum produto encontrado.</p>';
      return;
    }
    produtos.forEach(produto => {
      const cardHTML = criarCardProduto(produto, produto.id);
      container.innerHTML += cardHTML;
    });
  });
}

function configurarFiltrosInteligentes() {
  // Filtros de marca (pills)
  document.querySelectorAll('.filter-pills .badge').forEach(filtro => {
    filtro.addEventListener('click', () => {
      document.querySelectorAll('.filter-pills .badge').forEach(f => f.classList.remove('badge-active'));
      filtro.classList.add('badge-active');
      const marca = filtro.dataset.brand;
      carregarProdutosFiltradosRealtime({ marca: marca === 'all' ? '' : marca });
    });
  });

  // Filtro de marca digitada (input na navbar)
  const inputMarca = document.getElementById('inputMarcaNavbar');
  if (inputMarca) {
    inputMarca.addEventListener('change', () => {
      const marca = inputMarca.value.trim();
      if (marca) {
        carregarProdutosFiltradosRealtime({ marca });
      } else {
        carregarProdutosFiltradosRealtime();
      }
    });
  }

  // Filtro de disponibilidade
  const filtroDisp = document.getElementById('filtroDisponibilidade');
  if (filtroDisp) {
    filtroDisp.addEventListener('change', (e) => {
      carregarProdutosFiltradosRealtime({ disponibilidade: e.target.value });
    });
  }

  // Barra de pesquisa
  const barraPesquisa = document.getElementById('barraPesquisa');
  if (barraPesquisa) {
    barraPesquisa.addEventListener('input', (e) => {
      const termo = e.target.value.trim().toLowerCase();
      carregarProdutosFiltradosRealtime({ termo });
    });
  }
}

// Toast para feedback visual
function showToast(msg, success = true) {
  let toast = document.getElementById('toast-feedback');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-feedback';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.zIndex = '9999';
    toast.style.padding = '16px 28px';
    toast.style.borderRadius = '12px';
    toast.style.background = success ? '#28a745' : '#dc3545';
    toast.style.color = 'white';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
    toast.style.fontSize = '1rem';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = success ? '#28a745' : '#dc3545';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

window.toggleFavorito = async function(produtoId) {
  const user = auth.currentUser;
  if (!user) {
    showToast('Faça login para favoritar produtos.', false);
    return;
  }
  const favRef = query(collection(db, "favoritos"), where("userId", "==", user.uid), where("produtoId", "==", produtoId));
  const favSnap = await getDocs(favRef);
  const wishlistIcon = document.querySelector(`.card[data-id="${produtoId}"] .wishlist-icon i`);
  if (favSnap.empty) {
    // Adicionar favorito
    await setDoc(doc(collection(db, "favoritos")), { userId: user.uid, produtoId });
    favoritosIds.add(produtoId);
    wishlistIcon.classList.remove('far');
    wishlistIcon.classList.add('fas');
    wishlistIcon.classList.add('animate__animated', 'animate__bounceIn');
    showToast('Adicionado aos favoritos!');
    setTimeout(() => wishlistIcon.classList.remove('animate__animated', 'animate__bounceIn'), 800);
  } else {
    // Remover favorito
    await deleteDoc(favSnap.docs[0].ref);
    favoritosIds.delete(produtoId);
    wishlistIcon.classList.remove('fas');
    wishlistIcon.classList.add('far');
    wishlistIcon.classList.add('animate__animated', 'animate__fadeOut');
    showToast('Removido dos favoritos.', false);
    setTimeout(() => wishlistIcon.classList.remove('animate__animated', 'animate__fadeOut'), 800);
  }
};

window.abrirChatComVendedor = function(produtoId, vendedorId) {
  if (!vendedorId) {
    alert("Vendedor n\u00e3o identificado.");
    return;
  }
  if (produtoId && vendedorId) {
    window.location.href = `chat.html?produto=${produtoId}&vendedor=${vendedorId}`;
  } else {
    alert('Não foi possível abrir o chat: vendedor não encontrado.');
  }
};

async function carregarRecomendadosParaUsuario() {
  const featuredDiv = document.getElementById('featuredProducts');
  featuredDiv.innerHTML = '<div class="text-center w-100"><div class="spinner-border"></div></div>';
  let user = auth.currentUser;
  if (!user) {
    featuredDiv.innerHTML = '<p class="text-muted">Faça login para ver recomendações personalizadas.</p>';
    return;
  }
  // Buscar histórico do usuário
  const histSnap = await getDocs(query(collection(db, 'historico_usuario'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(30)));
  let marcas = {}, vendedores = {}, tamanhos = {};
  histSnap.forEach(doc => {
    const h = doc.data();
    if (h.marca) marcas[h.marca] = (marcas[h.marca] || 0) + 1;
    if (h.vendedorId) vendedores[h.vendedorId] = (vendedores[h.vendedorId] || 0) + 1;
    if (h.tamanho) tamanhos[h.tamanho] = (tamanhos[h.tamanho] || 0) + 1;
  });
  // Pega as marcas e vendedores mais vistos
  const topMarcas = Object.entries(marcas).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e[0]);
  const topVendedores = Object.entries(vendedores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e[0]);
  // Buscar produtos recomendados
  let recomendados = [];
  if (topMarcas.length > 0) {
    const q = query(collection(db, 'produtos'), where('marca', 'in', topMarcas), orderBy('dataCriacao', 'desc'), limit(8));
    const snap = await getDocs(q);
    snap.forEach(doc => recomendados.push({ ...doc.data(), id: doc.id }));
  }
  if (recomendados.length < 8 && topVendedores.length > 0) {
    const q2 = query(collection(db, 'produtos'), where('userId', 'in', topVendedores), orderBy('dataCriacao', 'desc'), limit(8-recomendados.length));
    const snap2 = await getDocs(q2);
    snap2.forEach(doc => recomendados.push({ ...doc.data(), id: doc.id }));
  }
  // Se ainda não houver recomendações suficientes, preenche com produtos populares
  if (recomendados.length < 4) {
    const q3 = query(collection(db, 'produtos'), orderBy('visualizacoes', 'desc'), limit(8-recomendados.length));
    const snap3 = await getDocs(q3);
    snap3.forEach(doc => recomendados.push({ ...doc.data(), id: doc.id }));
  }
  // Renderizar
  featuredDiv.innerHTML = '';
  if (recomendados.length === 0) {
    featuredDiv.innerHTML = '<p class="text-muted">Nenhuma recomendação disponível.</p>';
    return;
  }
  recomendados.slice(0,8).forEach(produto => {
    featuredDiv.innerHTML += criarCardProduto(produto, produto.id);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  carregarProdutosFiltradosRealtime();
  configurarFiltrosInteligentes();
  setupLogoutBtn();
  // Recomendações personalizadas
  auth.onAuthStateChanged(user => {
    if (user) carregarRecomendadosParaUsuario();
    else document.getElementById('featuredProducts').innerHTML = '<p class="text-muted">Faça login para ver recomendações personalizadas.</p>';
  });
});

function setupLogoutBtn() {
  const tryAttach = () => {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js').then(({ getAuth, signOut }) => {
          const auth = getAuth();
          signOut(auth).then(() => {
            window.location.href = 'log.html';
          });
        });
      });
    } else {
      setTimeout(tryAttach, 200);
    }
  };
  tryAttach();
}



