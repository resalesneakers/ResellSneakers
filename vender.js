// compat puro

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

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("Você precisa estar autenticado para publicar um produto.");
    window.location.href = "log.html";
    return;
  }

  const form = document.getElementById("sellForm");
  const imageInput = document.getElementById("imageInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const files = imageInput.files;
    if (!files.length) {
      alert("Por favor selecione ao menos uma imagem.");
      return;
    }

    const formData = new FormData(form);
    const urls = [];

    try {
      const btn = form.querySelector("button[type='submit']");
      btn.disabled = true;
      btn.textContent = "A publicar...";

      // upload imagens
      for (let i = 0; i < files.length; i++) {
        const storageRef = storage
          .ref(`produtos/${user.uid}/${Date.now()}-${files[i].name}`);
        await storageRef.put(files[i]);
        const url = await storageRef.getDownloadURL();
        urls.push(url);
      }

      const produto = {
        nome: formData.get("title"),
        marca: formData.get("brand") || "Desconhecida",
        modelo: formData.get("model") || "",
        tamanho: formData.get("size") || "",
        condicao: formData.get("condition") || "",
        preco: parseFloat(formData.get("price")) || 0,
        negociavel: formData.get("negotiable") === "yes",
        disponibilidade: formData.get("saleType") || "venda",
        descricao: formData.get("description") || "",
        localizacao: formData.get("location") || "",
        imagemPrincipal: urls[0],
        imagens: urls,
        visualizacoes: 0,
        favorito: false,
        verificado: false,
        dataCriacao: new Date(),
        userId: user.uid
      };

      await db.collection("produtos").add(produto);

      alert("✅ Produto publicado com sucesso!");
      window.location.href = "meus-produtos.html";
    } catch (err) {
      console.error("Erro ao publicar produto:", err);
      alert("❌ Erro ao publicar produto.");
    }
  });
});
