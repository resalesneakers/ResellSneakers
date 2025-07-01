import { auth, db, storage } from "./firebase-config.js";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

let uploadedImages = [];
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("imagePreviewContainer");
const progressBar = document.getElementById("progressFill");
const progressContainer = document.getElementById("progressContainer");
const progressText = document.getElementById("progressText");

function showImagePreview(files) {
  preview.innerHTML = '';
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "5px";
      img.style.margin = "5px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

imageInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 6) {
    alert("Você só pode enviar no máximo 6 imagens.");
    imageInput.value = "";
    return;
  }
  uploadedImages = files;
  showImagePreview(files);
});

function uploadImages(userId) {
  progressContainer.classList.remove("d-none");
  const uploadPromises = uploadedImages.map((file, index) => {
    const filePath = `produtos/${userId}/${Date.now()}_${index}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `A carregar imagens... ${Math.floor(progress)}%`;
        },
        reject,
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  });

  return Promise.all(uploadPromises);
}

onAuthStateChanged(auth, (user) => {
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
      const urls = await uploadImages(user.uid);
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
        dataCriacao: serverTimestamp(),
        userId: user.uid,
      };

      await addDoc(collection(db, "produtos"), produto);

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
