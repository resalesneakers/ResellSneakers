const carrinhoDiv = document.getElementById("carrinho-lista");
const totalSpan = document.getElementById("total");
const finalizarBtn = document.getElementById("finalizar-compra");

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
