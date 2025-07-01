import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        nome: user.displayName || "Sem Nome",
        email: user.email,
        foto: user.photoURL || "",
        provider: user.providerData[0]?.providerId || "desconhecido",
        dataCriacao: serverTimestamp()
      });
      console.log("Usuário salvo no Firestore!");
    }
  }
});
