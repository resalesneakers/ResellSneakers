import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, doc, addDoc, setDoc, getDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('produto');
let vendedorId = urlParams.get('vendedor');

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("É necessário fazer login para usar o chat.");
    window.location.href = "log.html";
    return;
  }
  const currentUser = user;
  let otherUserId = vendedorId;
  let chatId = null;
  if (productId && productId !== 'undefined') {
    chatId = [productId, ...[currentUser.uid, otherUserId].sort()].join('_');
  } else {
    chatId = `direct_${[currentUser.uid, otherUserId].sort().join('_')}`;
  }
  // Garantir documento da conversa
  const conversaRef = doc(db, 'conversas', chatId);
  let conversaSnap = await getDoc(conversaRef);
  if (!conversaSnap.exists()) {
    await setDoc(conversaRef, {
      participantes: [currentUser.uid, otherUserId],
      timestamp: serverTimestamp(),
      ultimaMensagem: ''
    });
    conversaSnap = await getDoc(conversaRef);
  } else {
    const data = conversaSnap.data();
    if (!data.participantes || !Array.isArray(data.participantes) || data.participantes.length < 2) {
      await setDoc(conversaRef, {
        ...data,
        participantes: [currentUser.uid, otherUserId]
      }, { merge: true });
    }
  }
  // Mensagens
  const mensagensRef = collection(db, 'conversas', chatId, 'mensagens');
  const mensagensOrdenadas = query(mensagensRef, orderBy('timestamp'));
  const container = document.getElementById("chat-container");
  onSnapshot(mensagensOrdenadas, snapshot => {
    container.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.textContent = `${msg.from === currentUser.uid ? "Tu" : "Outro"}: ${msg.text}`;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  });
  document.getElementById("formMensagem").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("mensagem").value.trim();
    if (!text) return;
    await addDoc(mensagensRef, {
      text,
      from: currentUser.uid,
      to: otherUserId,
      productId: productId || null,
      timestamp: serverTimestamp()
    });
    await setDoc(conversaRef, {
      ultimaMensagem: text,
      timestamp: serverTimestamp()
    }, { merge: true });
    document.getElementById("mensagem").value = "";
  });
});
