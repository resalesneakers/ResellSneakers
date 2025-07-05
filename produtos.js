// produtos.js
import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const listaDiv = document.getElementById("lista-produtos");

function criarCardProduto(produto, id) {
  const imagem = (produto.imagens && produto.imagens[0]) ? produto.imagens[0] : 'https://via.placeholder.com/400x320?text=Sem+Imagem';
  const disponibilidade = produto.disponibilidade || 'Indefinido';
  const preco = produto.preco ? `€${produto.preco}` : '';
  const estado = produto.estado || produto.condicao || 'Usado';
  const marca = produto.marca || '';

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch mb-4">
      <div class="card shadow-sm h-100 w-100 product-card" style="border-radius: 18px; overflow: hidden; transition: box-shadow 0.2s; cursor: pointer;" onclick="window.location.href='produto-detalhe.html?id=${id}'">
        <div class="position-relative" style="height: 220px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
          <img src="${imagem}" class="card-img-top product-img" alt="${produto.nome}" style="max-height: 200px; width: auto; object-fit: contain; margin: auto;">
        </div>
        <div class="card-body d-flex flex-column">
          <div class="product-brand text-uppercase text-muted small mb-1">${marca}</div>
          <h5 class="product-name mb-1">${produto.nome || 'Produto'}</h5>
          <div class="d-flex justify-content-between align-items-center mt-2 mb-2">
            <div class="product-price fw-bold text-danger">${preco}</div>
            <div class="product-condition badge bg-light text-dark">${estado}</div>
          </div>
          <span class="badge bg-secondary mb-2">${disponibilidade}</span>
          <a href="produto-detalhe.html?id=${id}" class="btn btn-sm btn-outline-primary mt-auto w-100">Ver detalhes</a>
        </div>
      </div>
    </div>
  `;
}

function carregarProdutosRealtime() {
  onSnapshot(collection(db, "produtos"), (querySnapshot) => {
    listaDiv.innerHTML = '<div class="row" id="produtos-row"></div>';
    const row = document.getElementById('produtos-row');
    querySnapshot.forEach((doc) => {
      const produto = doc.data();
      const cardHTML = criarCardProduto(produto, doc.id);
      row.innerHTML += cardHTML;
    });
  });
}

carregarProdutosRealtime();
