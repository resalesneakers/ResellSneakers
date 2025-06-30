import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query,
  orderBy, onSnapshot, serverTimestamp
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

// Simulação: ID do vendedor e produto (passar por URL ou localStorage no real)
const vendedorId = "vendedor123";
const produtoId = "produto456";

onAuthStateChanged(auth, user => {
  if (user) {
    const userId = user.uid;
    const chatId = `${userId}_${vendedorId}_${produtoId}`;

    const chatRef = collection(db, "chats", chatId, "mensagens");
    const mensagensOrdenadas = query(chatRef, orderBy("data", "asc"));

    onSnapshot(mensagensOrdenadas, snapshot => {
      const container = document.getElementById("chat-container");
      container.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.textContent = `${msg.remetente === userId ? "Tu" : "Vendedor"}: ${msg.texto}`;
        container.appendChild(div);
      });
      container.scrollTop = container.scrollHeight;
    });

    document.getElementById("formMensagem").addEventListener("submit", async (e) => {
      e.preventDefault();
      const texto = document.getElementById("mensagem").value;
      if (!texto.trim()) return;

      await addDoc(chatRef, {
        remetente: userId,
        destinatario: vendedorId,
        texto,
        produtoId,
        data: serverTimestamp()
      });

      document.getElementById("mensagem").value = "";
    });
  } else {
    alert("É necessário fazer login para usar o chat.");
    window.location.href = "log.html";
  }
});
