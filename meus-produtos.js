import { app, auth, db, storage } from './firebase-config.js';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getDownloadURL, ref as storageRef } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const container = document.getElementById("produtosContainer");

let allProducts = [];

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Por favor, faça login para ver os seus produtos.");
    window.location.href = "log.html";
    return;
  }

  loadProductsRealtime(user.uid);
});

// Adicionar filtros de status
const filtros = document.querySelectorAll('.filter-btn');
let statusFiltro = 'todos';
filtros.forEach(btn => {
  btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    statusFiltro = btn.dataset.status;
    renderAllProducts();
  });
});

function renderAllProducts() {
  container.innerHTML = '';
  let produtosFiltrados = allProducts;
  if (statusFiltro !== 'todos') {
    produtosFiltrados = allProducts.filter(p => (p.status || p.disponibilidade) === statusFiltro);
  }
  if (produtosFiltrados.length === 0) {
    container.innerHTML = "<p class='text-center'>Nenhum produto encontrado para este filtro.</p>";
    return;
  }
  produtosFiltrados.forEach(renderProductCard);
}

function loadProductsRealtime(userId) {
  const q = query(
    collection(db, "produtos"),
    where("userId", "==", userId),
    orderBy("dataCriacao", "desc")
  );
  onSnapshot(q, (snapshot) => {
    allProducts = [];
    if (snapshot.empty) {
      container.innerHTML = "<p class='text-center'>Você ainda não publicou nenhum produto.</p>";
      updateStats();
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      allProducts.push(data);
    });
    renderAllProducts();
    updateStats();
  });
}

function renderProductCard(produto) {
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.dataset.id = produto.id;

  let status = produto.status || produto.disponibilidade || 'ativo';
  let statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  let statusClass = 'status-' + status;

  let imgEl = document.createElement('img');
  imgEl.className = 'img-fluid rounded-start';
  imgEl.alt = produto.nome;
  if (produto.imagemPrincipal) {
    if (!produto.imagemPrincipal.startsWith('http')) {
      getDownloadURL(storageRef(storage, produto.imagemPrincipal)).then(url => {
        imgEl.src = url;
      }).catch(() => {
        imgEl.src = 'https://via.placeholder.com/400x320?text=Sem+Imagem';
      });
    } else {
      imgEl.src = produto.imagemPrincipal;
    }
  } else {
    imgEl.src = 'https://via.placeholder.com/400x320?text=Sem+Imagem';
  }

  // Contadores
  let visualizacoes = produto.visualizacoes || 0;
  let favoritos = produto.favoritos || 0;

  card.innerHTML = `
    <div class="row g-0">
      <div class="col-md-4" id="img-col-${produto.id}"></div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${produto.nome}</h5>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          <p class="card-text"><strong>Marca:</strong> ${produto.marca} | <strong>Tamanho:</strong> ${produto.tamanho}</p>
          <p class="card-text"><strong>Preço:</strong> €${Number(produto.preco).toFixed(2)} - <strong>Estado:</strong> ${produto.condicao}</p>
          <p class="card-text"><strong>Visualizações:</strong> ${visualizacoes} | <strong>Favoritos:</strong> ${favoritos}</p>
          <div class="mt-3 d-flex gap-2">
            <a class="btn btn-primary btn-sm" href="produto-detalhe.html?id=${produto.id}">Ver</a>
            <a class="btn btn-warning btn-sm" href="editar-produto.html?id=${produto.id}">Editar</a>
            <button class="btn btn-danger btn-sm" onclick="removerProduto('${produto.id}')">Excluir</button>
            <button class="btn btn-success btn-sm" onclick="marcarComoVendido('${produto.id}')">Marcar como Vendido</button>
          </div>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    const imgCol = card.querySelector(`#img-col-${produto.id}`);
    if (imgCol) imgCol.appendChild(imgEl);
  }, 0);
  container.appendChild(card);
}

window.deleteProduct = async function (productId) {
  try {
    await deleteDoc(doc(db, "produtos", productId));
    document.querySelector(`[data-id="${productId}"]`)?.remove();
    allProducts = allProducts.filter(p => p.id !== productId);
    updateStats();
  } catch (error) {
    console.error("Erro ao eliminar produto:", error);
  }
};

window.toggleVisibility = async function (productId) {
  const produto = allProducts.find(p => p.id === productId);
  if (!produto) return;

  const novoStatus = produto.disponibilidade === "inativo" ? "venda" : "inativo";
  try {
    await updateDoc(doc(db, "produtos", productId), { disponibilidade: novoStatus });
    produto.disponibilidade = novoStatus;

    // Re-renderizar o produto
    document.querySelector(`[data-id="${productId}"]`)?.remove();
    renderProductCard(produto);
    updateStats();
  } catch (error) {
    console.error("Erro ao alterar visibilidade:", error);
  }
};

window.removerProduto = async function (produtoId) {
  if (!confirm('Tem certeza que deseja remover este produto?')) return;
  try {
    await updateDoc(doc(db, "produtos", produtoId), { status: "removido" });
    allProducts = allProducts.map(p => p.id === produtoId ? { ...p, status: "removido" } : p);
    renderAllProducts();
    updateStats();
  } catch (error) {
    alert("Erro ao remover produto: " + error.message);
  }
};

window.marcarComoVendido = async function (produtoId) {
  if (!confirm('Marcar este produto como vendido?')) return;
  try {
    await updateDoc(doc(db, "produtos", produtoId), { status: "vendido" });
    allProducts = allProducts.map(p => p.id === produtoId ? { ...p, status: "vendido" } : p);
    renderAllProducts();
    updateStats();
  } catch (error) {
    alert("Erro ao marcar como vendido: " + error.message);
  }
};

function updateStats() {
  const total = allProducts.length;
  const ativos = allProducts.filter(p => p.disponibilidade === "venda" || p.disponibilidade === "venda e troca").length;
  const inativos = allProducts.filter(p => p.disponibilidade === "inativo").length;

const totalEl = document.getElementById('totalProducts');
if (totalEl) totalEl.textContent = `Total: ${total}`;

const activeEl = document.getElementById('activeProducts');
if (activeEl) activeEl.textContent = `Ativos: ${ativos}`;

const inactiveEl = document.getElementById('inactiveProducts');
if (inactiveEl) inactiveEl.textContent = `Inativos: ${inativos}`;
}
