import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function mostrarResumo() {
  const container = document.getElementById("resumo-pedido");
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    container.innerHTML = "<p>O carrinho está vazio.</p>";
    document.getElementById("total").textContent = "";
    return;
  }

  let total = 0;
  container.innerHTML = "";

  for (const id of carrinho) {
    const docRef = doc(db, "produtos", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const produto = docSnap.data();
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${produto.nome} - €${produto.preco}</p>
      `;
      container.appendChild(div);
      total += Number(produto.preco);
    }
  }

  document.getElementById("total").textContent = "Total: €" + total.toFixed(2);
}

document.getElementById("formPagamento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const morada = document.getElementById("morada").value;
  const metodo = document.getElementById("metodo").value;
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert("Carrinho vazio.");
    return;
  }

  try {
    await addDoc(collection(db, "compras"), {
      nome,
      morada,
      metodo,
      produtos: carrinho,
      data: serverTimestamp()
    });

    document.getElementById("mensagemFinal").textContent = "Compra realizada com sucesso!";
    localStorage.removeItem("carrinho");
    document.getElementById("formPagamento").reset();
    document.getElementById("resumo-pedido").innerHTML = "";
    document.getElementById("total").textContent = "";
  } catch (error) {
    alert("Erro ao processar o pagamento. Tenta novamente.");
    console.error(error);
  }
});

mostrarResumo();
