import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
  authDomain: "resalesneakers-e17cb.firebaseapp.com",
  projectId: "resalesneakers-e17cb",
  storageBucket: "resalesneakers-e17cb.appspot.com",
  messagingSenderId: "698715655625",
  appId: "1:698715655625:web:fde7f7a7f2da0037792c18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const container = document.getElementById("produtosContainer");

let allProducts = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Por favor, faça login para ver os seus produtos.");
    window.location.href = "log.html";
    return;
  }

  await loadProducts(user.uid);
});

async function loadProducts(userId) {
  const q = query(
    collection(db, "produtos"),
    where("userId", "==", userId),
    orderBy("dataCriacao", "desc")
  );

  const snapshot = await getDocs(q);
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
}

function renderProductCard(produto) {
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.dataset.id = produto.id;

  card.innerHTML = `
    <div class="row g-0">
      <div class="col-md-4">
        <img src="${produto.imagemPrincipal}" class="img-fluid rounded-start" alt="${produto.nome}">
      </div>
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
