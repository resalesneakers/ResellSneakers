// produtos.js
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const listaDiv = document.getElementById("lista-produtos");

// A coleção no Firestore deve se chamar 'produtos'
async function carregarProdutos() {
  const querySnapshot = await getDocs(collection(db, "produtos"));

  querySnapshot.forEach((doc) => {
    const produto = doc.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${produto.imagens?.[0] || 'https://via.placeholder.com/300'}" alt="Imagem do produto" />
      <h3>${produto.nome}</h3>
      <p>Estado: ${produto.estado}</p>
      <p>Disponibilidade: ${produto.disponibilidade}</p>
    `;
    listaDiv.appendChild(card);
  });
}

carregarProdutos();
