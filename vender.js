// vender.js compatível com home.js
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
  authDomain: "resalesneakers-e17cb.firebaseapp.com",
  databaseURL: "https://resalesneakers-e17cb-default-rtdb.firebaseio.com",
  projectId: "resalesneakers-e17cb",
  storageBucket: "resalesneakers-e17cb.appspot.com",
  messagingSenderId: "698715655625",
  appId: "1:698715655625:web:fde7f7a7f2da0037792c18",
  measurementId: "G-WVNMT06HJS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const form = document.getElementById("sellForm");
const imageInput = document.getElementById("imageInput");

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "log.html";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const files = imageInput.files;
    if (!files.length) return alert("Selecione pelo menos uma imagem.");

    const formData = new FormData(form);
    const urls = [];

    for (let i = 0; i < files.length; i++) {
      const storageRef = ref(storage, `produtos/${user.uid}/${Date.now()}-${files[i].name}`);
      await uploadBytes(storageRef, files[i]);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }

    const produto = {
      nome: formData.get("title"),
      marca: formData.get("brand"),
      modelo: formData.get("model"),
      tamanho: formData.get("size"),
      condicao: formData.get("condition"),
      preco: parseFloat(formData.get("price")) || 0,
      negociavel: formData.get("negotiable") === "yes",
      disponibilidade: formData.get("saleType") || "venda",
      descricao: formData.get("description"),
      localizacao: formData.get("location"),
      imagemPrincipal: urls[0],
      imagens: urls,
      visualizacoes: 0,
      favorito: false,
      verificado: false,
      dataCriacao: serverTimestamp(),
      userId: user.uid
    };

    try {
      await addDoc(collection(db, "produtos"), produto);
      alert("Produto publicado com sucesso!");
      window.location.href = "meus-produtos.html";
    } catch (error) {
      console.error("Erro ao publicar produto:", error);
      alert("Erro ao publicar produto.");
    }
  });
});
