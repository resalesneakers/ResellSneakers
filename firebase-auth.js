import { auth, db } from "./firebase-config.js";

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    // Atualiza sempre os dados do usuário
    await setDoc(userRef, {
      uid: user.uid,
      nome: user.displayName || "Sem Nome",
      email: user.email,
      foto: user.photoURL || "",
      provider: user.providerData[0]?.providerId || "desconhecido",
      dataCriacao: serverTimestamp()
    }, { merge: true });
    console.log("Usuário salvo/atualizado no Firestore!");
  }
});
