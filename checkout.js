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
const finalizarBtn = document.getElementById("finalizar-btn");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    detalhesDiv.innerHTML = '<div class="alert alert-warning">Tens de fazer login para finalizar a compra.</div>';
    form.style.display = 'none';
    return;
  }

  // Buscar carrinho do utilizador
  const carrinhoRef = doc(db, 'carrinhos', user.uid);
  const carrinhoSnap = await getDoc(carrinhoRef);
  const carrinhoIds = carrinhoSnap.exists() ? (carrinhoSnap.data().produtos || []) : [];
  if (carrinhoIds.length === 0) {
    detalhesDiv.innerHTML = '<div class="alert alert-info">O teu carrinho está vazio.</div>';
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
    return `<div class='d-flex align-items-center mb-3'><img src='${p.imagemPrincipal || 'images/no-image.png'}' width='80' class='me-3 rounded shadow-sm'><div><h5 class='mb-1'>${p.nome}</h5><div class='text-muted'>Preço: €${p.preco}</div></div></div>`;
  }).join('') + `<h3 class='mt-4'>Total: €${total.toFixed(2)}</h3>`;

  form.style.display = 'block';
  finalizarBtn.disabled = false;

  form.onsubmit = async (e) => {
    e.preventDefault();
    finalizarBtn.disabled = true;
    finalizarBtn.textContent = 'Processando...';
    // Criar pedido na coleção 'compras' do utilizador
    await addDoc(collection(db, 'compras'), {
      userId: user.uid,
      produtos: produtos.map(p => ({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagemPrincipal })),
      total,
      data: new Date()
    });
    // Limpar carrinho
    await setDoc(carrinhoRef, { produtos: [] });
    mensagem.innerHTML = "<div class='alert alert-success'>Pagamento processado com sucesso! Obrigado pela compra.</div>";
    detalhesDiv.innerHTML = '';
    form.reset();
    form.style.display = 'none';
  };
});
