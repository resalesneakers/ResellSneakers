import { auth, db } from "./firebase-config.js";

// Remover tudo entre 'const firebaseConfig = {' até 'const app = initializeApp(firebaseConfig);'

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
