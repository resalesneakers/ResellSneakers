const carrinhoDiv = document.getElementById("carrinho-lista");
const totalSpan = document.getElementById("total");
const finalizarBtn = document.getElementById("finalizar-compra");
const resumoDiv = document.getElementById("resumo");

function carregarCarrinho() {
  // Obtem o carrinho do localStorage (espera-se que seja um JSON)
  const carrinhoJSON = localStorage.getItem("carrinho");
  if (!carrinhoJSON) return [];
  try {
    return JSON.parse(carrinhoJSON);
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarCarrinho() {
  let carrinho = carregarCarrinho();

  carrinhoDiv.innerHTML = "";
  let total = 0;

  if (carrinho.length === 0) {
    carrinhoDiv.innerHTML = `
      <div class="carrinho-vazio">
        <div class="icon">🛍️</div>
        <h3>O teu carrinho está vazio</h3>
        <p>Adiciona alguns produtos incríveis para começar!</p>
      </div>
    `;
    resumoDiv.style.display = "none";
    return;
  }

  carrinho.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "produto-item";
    div.innerHTML = `
      <div class="produto-content">
        <img src="${item.imagem}" alt="${item.nome}" class="produto-imagem" />
        <div class="produto-info">
          <h3>${item.nome}</h3>
          <div class="produto-preco">€${item.preco}</div>
        </div>
        <div class="produto-acoes">
          <button class="btn-remover" data-index="${index}">
            🗑️ Remover
          </button>
        </div>
      </div>
    `;
    carrinhoDiv.appendChild(div);
    total += parseFloat(item.preco);
  });

  totalSpan.textContent = total.toFixed(2);
  resumoDiv.style.display = "block";

  // Adicionar evento remover para os botões criados
  document.querySelectorAll('.btn-remover').forEach(button => {
    button.addEventListener('click', (e) => {
      const idx = e.currentTarget.getAttribute('data-index');
      removerProduto(parseInt(idx));
    });
  });
}

function removerProduto(index) {
  let carrinho = carregarCarrinho();

  // animação opcional
  const itemElem = document.querySelectorAll('.produto-item')[index];
  if (itemElem) itemElem.classList.add('fade-out');

  setTimeout(() => {
    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    atualizarCarrinho();
  }, 300);
}

finalizarBtn.addEventListener("click", () => {
  // Aqui colocar a lógica para checkout real ou redirecionamento
  alert("Redirecionando para o checkout...");
  // Exemplo: window.location.href = "checkout.html";
});

// Inicializar carregando o carrinho real
atualizarCarrinho();

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function atualizarCarrinho() {
  carrinhoDiv.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${item.nome}</h3>
      <p>Preço: €${item.preco}</p>
      <img src="${item.imagem}" width="100" />
      <button onclick="removerProduto(${index})">Remover</button>
      <hr/>
    `;
    carrinhoDiv.appendChild(div);
    total += parseFloat(item.preco);
  });

  totalSpan.textContent = total.toFixed(2);
}

window.removerProduto = (index) => {
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
};

finalizarBtn.addEventListener("click", () => {
  window.location.href = "checkout.html";
});

atualizarCarrinho();

