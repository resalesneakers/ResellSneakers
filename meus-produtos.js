import { app, auth, db, storage } from './firebase-config.js';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getDownloadURL, ref as storageRef } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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

function loadProductsRealtime(userId) {
  const q = query(
    collection(db, "produtos"),
    where("userId", "==", userId),
    orderBy("dataCriacao", "desc")
  );

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    allProducts = [];

    if (snapshot.empty) {
      container.innerHTML = "<p class='text-center'>Você ainda não publicou nenhum produto.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      allProducts.push(data);
      renderProductCard(data);
    });

    updateStats();
  });
}

function renderProductCard(produto) {
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.dataset.id = produto.id;

  // Carregar imagem corretamente
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

  card.innerHTML = `
    <div class="row g-0">
      <div class="col-md-4" id="img-col-${produto.id}"></div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${produto.nome}</h5>
          <p class="card-text"><strong>Marca:</strong> ${produto.marca} | <strong>Tamanho:</strong> ${produto.tamanho}</p>
          <p class="card-text"><strong>Preço:</strong> €${Number(produto.preco).toFixed(2)} - <strong>Estado:</strong> ${produto.condicao}</p>
          <p class="card-text"><strong>Disponibilidade:</strong> ${produto.disponibilidade}</p>

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${produto.id}')">Eliminar</button>
            <button class="btn btn-secondary btn-sm" onclick="toggleVisibility('${produto.id}')">
              ${produto.disponibilidade === "inativo" ? "Ativar" : "Inativar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  // Inserir imagem carregada
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
