import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Por favor, faça login para ver os seus produtos.");
    window.location.href = "log.html";
    return;
  }

  const q = query(collection(db, "produtos"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = "<p class='text-center'>Você ainda não publicou nenhum produto.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.innerHTML = `
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${data.imagemPrincipal}" class="img-fluid rounded-start" alt="${data.nome}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${data.nome}</h5>
            <p class="card-text"><strong>Marca:</strong> ${data.marca} | <strong>Tamanho:</strong> ${data.tamanho}</p>
            <p class="card-text"><strong>Preço:</strong> €${data.preco.toFixed(2)} - <strong>Estado:</strong> ${data.condicao}</p>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
});
