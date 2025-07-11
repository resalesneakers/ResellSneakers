import {
  getFirestore, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { auth, db } from "./firebase-config.js";

const UID_ADMIN = "Up3RIVwJBGQVYWW3kPJCg0I5GIf1"; // Substituir pelo teu UID

onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== UID_ADMIN) {
    alert("Acesso restrito a administradores.");
    window.location.href = "home.html";
    return;
  }

  carregarEstatisticasRealtime();
});

function carregarEstatisticasRealtime() {
  onSnapshot(collection(db, "produtos"), (produtosSnap) => {
    onSnapshot(collection(db, "users"), (usersSnap) => {
      document.getElementById("total-produtos").textContent = produtosSnap.size;
      document.getElementById("total-users").textContent = usersSnap.size;

      let disponibilidade = {
        "venda": 0,
        "troca": 0,
        "venda e troca": 0
      };

      let condicao = {
        "novo": 0,
        "usado": 0
      };

      produtosSnap.forEach(doc => {
        const p = doc.data();
        const disp = p.disponibilidade?.toLowerCase() || "";
        const cond = p.condicao?.toLowerCase() || "";

        if (disponibilidade[disp] !== undefined) disponibilidade[disp]++;
        if (condicao[cond] !== undefined) condicao[cond]++;
      });

      desenharGrafico("grafico-disponibilidade", "Produtos por Disponibilidade", Object.keys(disponibilidade), Object.values(disponibilidade));
      desenharGrafico("grafico-condicao", "Produtos por Condição", Object.keys(condicao), Object.values(condicao));
    });
  });
}

function desenharGrafico(canvasId, titulo, labels, data) {
  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: titulo,
        data: data,
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo
        }
      }
    }
  });
}
