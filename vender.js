import { auth, db, storage } from './firebase-config.js';
document.addEventListener('DOMContentLoaded', () => {

let uploadedImages = [];
const imageInput = document.getElementById("imageInput");
async function uploadImages(userId) {
  const storageRef = storage.ref();
  
  console.log("📦 vender.js carregado");


  document.getElementById("progressContainer").classList.remove("d-none");
  
  const uploadPromises = uploadedImages.map((file, index) => {
    const fileRef = storageRef.child(`produtos/${userId}/${Date.now()}_${index}_${file.name}`);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload da imagem ${index + 1}: ${progress.toFixed(0)}%`);
          // Aqui podes atualizar uma barra de progresso visual
          progressBar.style.width = progress + '%';
          progressBar.textContent = Math.floor(progress) + '%';

        },
        (error) => reject(error),
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(resolve);
        }
      );
    });
  });

  return Promise.all(uploadPromises);
}




auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("Você precisa estar autenticado para publicar um produto.");
    window.location.href = "log.html";
    return;
  }

  const form = document.getElementById("sellForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    if (!uploadedImages.length) {
      alert("Por favor selecione ao menos uma imagem.");
      return;
    }

    form.classList.add("was-validated");

    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "A publicar...";

    try {
      const urls = await uploadImages(auth.currentUser.uid);

      const formData = new FormData(form);

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
        userId: auth.currentUser.uid
      };

      await db.collection("produtos").add(produto);

      alert("✅ Produto publicado com sucesso!");
      window.location.href = "meus-produtos.html";
    } catch (err) {
      console.error("Erro ao publicar produto:", err);
      alert("❌ Erro ao publicar produto.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Publicar";
    }
  });
});

const uploadContainer = document.getElementById('uploadContainer');
const preview = document.getElementById('imagePreviewContainer');
const progressBar = document.getElementById('progressFill');


// Disparar o input ao clicar no container
uploadContainer.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 6) {
    alert("Você só pode enviar no máximo 6 imagens.");
    imageInput.value = ""; // limpa
    return;
  }

  uploadedImages = files;
  showImagePreview(files);
});

function showImagePreview(files) {
  preview.innerHTML = '';
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '5px';
      img.style.margin = '5px';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

});

