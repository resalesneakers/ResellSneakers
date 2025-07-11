import { auth, db, storage } from './firebase-config.js';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

let produtoId = null;
let user = null;
let produtoData = null;
let imagensAtuais = [];
let imagensRemovidas = [];
let novasImagens = [];

const urlParams = new URLSearchParams(window.location.search);
produtoId = urlParams.get('id');
if (!produtoId) {
  alert('Produto não especificado.');
  window.location.href = 'meus-produtos.html';
}

const form = document.getElementById('form-editar-produto');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const precoInput = document.getElementById('preco');
const imagensPreview = document.getElementById('imagens-preview');
const novasImagensInput = document.getElementById('novas-imagens');

function renderImagensPreview() {
  imagensPreview.innerHTML = '';
  imagensAtuais.forEach((url, idx) => {
    const div = document.createElement('div');
    div.className = 'img-preview-item';
    div.innerHTML = `<img src="${url}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;margin:5px;" />
      <button type="button" class="btn btn-danger btn-sm" data-idx="${idx}">Remover</button>`;
    div.querySelector('button').onclick = () => {
      imagensRemovidas.push(url);
      imagensAtuais.splice(idx, 1);
      renderImagensPreview();
    };
    imagensPreview.appendChild(div);
  });
}

novasImagensInput.addEventListener('change', (e) => {
  novasImagens = Array.from(e.target.files);
  // Preview das novas imagens
  novasImagens.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.margin = '5px';
      imagensPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

async function carregarProduto() {
  const produtoSnap = await getDoc(doc(db, 'produtos', produtoId));
  if (!produtoSnap.exists()) {
    alert('Produto não encontrado.');
    window.location.href = 'meus-produtos.html';
    return;
  }
  produtoData = produtoSnap.data();
  // Verifica se o usuário é o dono
  if (!user || (produtoData.vendedor !== user.uid && produtoData.userId !== user.uid)) {
    alert('Acesso negado.');
    window.location.href = 'meus-produtos.html';
    return;
  }
  tituloInput.value = produtoData.nome || '';
  descricaoInput.value = produtoData.descricao || '';
  precoInput.value = produtoData.preco || '';
  imagensAtuais = produtoData.imagens || [];
  renderImagensPreview();
}

async function uploadNovasImagens() {
  if (!novasImagens.length) return [];
  const uploadPromises = novasImagens.map((file, idx) => {
    const filePath = `produtos/${user.uid}/${Date.now()}_${idx}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', null, reject, async () => {
        try {
          const url = await getDownloadURL(fileRef);
          resolve(url);
        } catch (e) { reject(e); }
      });
    });
  });
  return Promise.all(uploadPromises);
}

async function removerImagensDoStorage() {
  const promises = imagensRemovidas.map(async (url) => {
    try {
      // Só remove se for do storage (não imagens externas)
      if (url.startsWith('https://firebasestorage')) {
        const refPath = url.split('/o/')[1].split('?')[0];
        const decodedPath = decodeURIComponent(refPath);
        const fileRef = storageRef(storage, decodedPath);
        await deleteObject(fileRef);
      }
    } catch (e) { /* ignora erro */ }
  });
  return Promise.all(promises);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.querySelector('button[type="submit"]').disabled = true;
  try {
    // Upload novas imagens
    const novasUrls = await uploadNovasImagens();
    // Remove imagens marcadas
    await removerImagensDoStorage();
    // Atualiza array final de imagens
    const imagensFinal = [...imagensAtuais, ...novasUrls];
    // Atualiza produto
    await updateDoc(doc(db, 'produtos', produtoId), {
      nome: tituloInput.value,
      descricao: descricaoInput.value,
      preco: parseFloat(precoInput.value),
      imagens: imagensFinal
    });
    alert('Produto atualizado com sucesso!');
    window.location.href = 'meus-produtos.html';
  } catch (err) {
    alert('Erro ao atualizar produto: ' + err.message);
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
});

onAuthStateChanged(auth, (u) => {
  if (!u) {
    alert('Faça login para editar produtos.');
    window.location.href = 'log.html';
    return;
  }
  user = u;
  carregarProduto();
}); 