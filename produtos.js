// produtos.js
import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getDownloadURL, ref as storageRef } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { storage } from "./firebase-config.js";

const listaDiv = document.getElementById("lista-produtos");

function criarCardProduto(produto, id) {
  let imagem = (produto.imagens && produto.imagens[0]) ? produto.imagens[0] : null;
  const disponibilidade = produto.disponibilidade || 'Indefinido';
  const preco = produto.preco ? `\u20ac${produto.preco}` : '';
  const estado = produto.estado || produto.condicao || 'Usado';
  const marca = produto.marca || '';

  // Cria o card sem a imagem, que será carregada depois
  const cardId = `produto-card-img-${id}`;
  let cardHTML = `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch mb-4">
      <div class="card shadow-sm h-100 w-100 product-card" style="border-radius: 18px; overflow: hidden; transition: box-shadow 0.2s; cursor: pointer;" onclick="window.location.href='produto-detalhe.html?id=${id}'">
        <div class="position-relative" style="height: 220px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
          <img id="${cardId}" class="card-img-top product-img" alt="${produto.nome}" style="max-height: 200px; width: auto; object-fit: contain; margin: auto;">
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
  setTimeout(() => {
    const imgEl = document.getElementById(cardId);
    if (imgEl) {
      if (imagem) {
        if (!imagem.startsWith('http')) {
          getDownloadURL(storageRef(storage, imagem)).then(url => {
            imgEl.src = url;
          }).catch(() => {
            imgEl.src = 'https://via.placeholder.com/400x320?text=Sem+Imagem';
          });
        } else {
          imgEl.src = imagem;
        }
      } else {
        imgEl.src = 'https://via.placeholder.com/400x320?text=Sem+Imagem';
      }
    }
  }, 0);
  return cardHTML;
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
