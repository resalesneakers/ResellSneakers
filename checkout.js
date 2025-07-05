import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase-config.js";

const params = new URLSearchParams(window.location.search);
const produtoId = params.get("id");

const detalhesDiv = document.getElementById("detalhes-produto");
const form = document.getElementById("form-pagamento");
const mensagem = document.getElementById("mensagem-pagamento");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Tens de fazer login primeiro.");
    window.location.href = "log.html";
    return;
  }

  // Buscar carrinho do utilizador
  const carrinhoRef = doc(db, 'carrinhos', user.uid);
  const carrinhoSnap = await getDoc(carrinhoRef);
  const carrinhoIds = carrinhoSnap.exists() ? (carrinhoSnap.data().produtos || []) : [];
  if (carrinhoIds.length === 0) {
    detalhesDiv.textContent = "O teu carrinho está vazio.";
    form.style.display = 'none';
    return;
  }
  // Buscar produtos reais
  const proms = carrinhoIds.map(id => getDoc(doc(db, 'produtos', id)));
  const prodsSnap = await Promise.all(proms);
  const produtos = prodsSnap.filter(doc => doc.exists()).map(doc => ({ id: doc.id, ...doc.data() }));
  let total = 0;
  detalhesDiv.innerHTML = produtos.map(p => {
    total += parseFloat(p.preco);
    return `<div style='margin-bottom:20px;'><h2>${p.nome}</h2><p>Preço: €${p.preco}</p><img src='${p.imagemPrincipal}' width='200'/></div>`;
  }).join('') + `<h3>Total: €${total.toFixed(2)}</h3>`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Criar pedido na coleção 'compras' do utilizador
    await addDoc(collection(db, 'compras'), {
      userId: user.uid,
      produtos: produtos.map(p => ({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagemPrincipal })),
      total,
      data: new Date()
    });
    // Limpar carrinho
    await setDoc(carrinhoRef, { produtos: [] });
    mensagem.textContent = "Pagamento processado com sucesso! Obrigado pela compra.";
    detalhesDiv.innerHTML = '';
    form.reset();
    form.style.display = 'none';
  });
});
