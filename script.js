// script.js
import { app, auth, db, storage } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.getElementById("btn-signup").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById("msg").innerText = "Conta criada com sucesso!";
  } catch (error) {
    document.getElementById("msg").innerText = error.message;
  }
});

document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("msg").innerText = "Login bem-sucedido!";
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } catch (error) {
    document.getElementById("msg").innerText = error.message;
  }
});
