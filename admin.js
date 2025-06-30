import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);

// 👉 Substitui isto pelo teu UID de admin
const UID_ADMIN = "Up3RIVwJBGQVYWW3kPJCg0I5GIf1";

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Tens de fazer login.");
    window.location.href = "log.html";
    return;
  }

  if (user.uid !== UID_ADMIN) {
    alert("Acesso negado. Apenas administradores.");
    window.location.href = "home.html";
    return;
  }

  // 🔐 Carregar produtos apenas se for admin
  carregarProdutos();
});

const container = document.getElementById("produtos-container");

async function carregarProdutos() {
  const produtosSnap = await getDocs(collection(db, "produtos"));
  container.innerHTML = "";

  produtosSnap.forEach(docSnap => {
    const produto = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.margin = "10px 0";

    div.innerHTML = `
      <strong>${produto.nome}</strong><br>
      Preço: €${produto.preco}<br>
      Condição: ${produto.condicao}<br>
      Disponibilidade: ${produto.disponibilidade}<br>
      <img src="${produto.imagemPrincipal}" width="150"><br><br>
      <button onclick="eliminarProduto('${id}')">Eliminar</button>
    `;

    container.appendChild(div);
  });
}

window.eliminarProduto = async function (id) {
  const confirmacao = confirm("Tens a certeza que queres eliminar este produto?");
  if (confirmacao) {
    await deleteDoc(doc(db, "produtos", id));
    alert("Produto eliminado com sucesso.");
    carregarProdutos();
  }
  
};
async function exportarProdutos() {
  const produtosSnap = await getDocs(collection(db, "produtos"));
  let csv = "Nome,Preço,Condição,Disponibilidade,Marca\n";

  produtosSnap.forEach(doc => {
    const p = doc.data();
    csv += `"${p.nome}",${p.preco},"${p.condicao}","${p.disponibilidade}","${p.marca || ""}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.getElementById("download-link");
  link.href = url;
  link.download = "produtos.csv";
  link.style.display = "block";
  link.textContent = "Clique aqui para descarregar o ficheiro";
}

