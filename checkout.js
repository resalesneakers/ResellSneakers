import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
  authDomain: "resalesneakers-e17cb.firebaseapp.com",
  projectId: "resalesneakers-e17cb",
  storageBucket: "resalesneakers-e17cb.firebasestorage.app",
  messagingSenderId: "698715655625",
  appId: "1:698715655625:web:fde7f7a7f2da0037792c18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const params = new URLSearchParams(window.location.search);
const produtoId = params.get("id");

const detalhesDiv = document.getElementById("detalhes-produto");
const form = document.getElementById("form-pagamento");
const mensagem = document.getElementById("mensagem-pagamento");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Tens de fazer login primeiro.");
    window.location.href = "log.html";
    return;
  }

  if (!produtoId) {
    detalhesDiv.textContent = "Produto não encontrado.";
    return;
  }

  const docSnap = await getDoc(doc(db, "produtos", produtoId));
  if (!docSnap.exists()) {
    detalhesDiv.textContent = "Produto não encontrado.";
    return;
  }

  const produto = docSnap.data();
  detalhesDiv.innerHTML = `
    <h2>${produto.nome}</h2>
    <p>Preço: €${produto.preco}</p>
    <img src="${produto.imagemPrincipal}" width="200" />
  `;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mensagem.textContent = "Pagamento processado com sucesso! (simulação)";
    form.reset();
  });
});
