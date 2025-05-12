import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração Firebase
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
const storage = getStorage(app);

// Preview das imagens
const input = document.getElementById('imagemInput');
const preview = document.getElementById('preview');
let imagensSelecionadas = [];

input.addEventListener('change', () => {
  preview.innerHTML = '';
  imagensSelecionadas = Array.from(input.files).slice(0, 6); // Limita a 6

  imagensSelecionadas.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-img';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});
if (!nome || !estado || imagensSelecionadas.length === 0) {
    alert("Preenche todos os campos obrigatórios e seleciona ao menos 1 imagem.");
    return;
  }
  

// Envio do produto 
async function enviarProduto() {
  if (imagensSelecionadas.length === 0) {
    alert("Seleciona pelo menos uma imagem.");
    return;
  }

  const urls = [];

  for (const img of imagensSelecionadas) {
    const imgRef = ref(storage, `produtos/${Date.now()}_${img.name}`);
    await uploadBytes(imgRef, img);
    const url = await getDownloadURL(imgRef);
    urls.push(url);
  }

  await addDoc(collection(db, "produtos"), {
    nome: "Exemplo de produto",
    estado: "Novo",
    disponibilidade: "Venda",
    imagens: urls,
    data: new Date()
  });

  alert("Produto publicado com sucesso!");
  input.value = "";
  preview.innerHTML = "";
}
