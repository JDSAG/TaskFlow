import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// BOTÃO DARK MODE
const darkBtn = document.getElementById("btnDark");

darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});



// BOTÃO LOGOUT
const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", () => {
  // redireciona
  window.location.href = "index.html";

});




// CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDVrm89RBr2lEh5S1rbAO96XtNEs5hzkPs",
    authDomain: "taskflow-6ec0b.firebaseapp.com",
    projectId: "taskflow-6ec0b",
    storageBucket: "taskflow-6ec0b.firebasestorage.app",
    messagingSenderId: "971450110427",
    appId: "1:971450110427:web:952bd47df4273dc495d7fe",
    measurementId: "G-D1L7TJXQZ0"
};




// INICIALIZA FIREBASE
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);




// CARREGA USUÁRIOS
async function carregarUsuarios() {

  const corpo = document.getElementById("corpoTabela");

  corpo.innerHTML = "";

  try {

    const querySnapshot = await getDocs(
      collection(db, "usuarios")
    );

    querySnapshot.forEach((documento) => {

      const usuario = documento.data();

      const tr = document.createElement("tr");

      tr.id = `linha-${documento.id}`;

      tr.innerHTML = `
        <td>${documento.id}</td>
        <td>${usuario.nome || "-"}</td>
        <td>${usuario.email || "-"}</td>
        <td>${usuario.role || "-"}</td>

        <td>
          <button class="btnDelete">
            🗑️
          </button>
        </td>
      `;

      // botão deletar
      const btnDelete = tr.querySelector(".btnDelete");

      btnDelete.addEventListener("click", async () => {

        const confirmou = confirm(
          "Deseja excluir este usuário?"
        );

        if (!confirmou) return;

        try {

          await deleteDoc(
            doc(db, "usuarios", documento.id)
          );

          tr.remove();

          alert("Usuário deletado!");

        } catch (erro) {

          console.error(erro);

          alert("Erro ao deletar.");
        }

      });

      corpo.appendChild(tr);

    });

  } catch (erro) {

    console.error(
      "Erro ao carregar usuários:",
      erro
    );

    alert("Erro ao buscar usuários.");
  }

}
  // GRAFICS EM BARRA
try {

  const snapshot = await getDocs(
    collection(db, "usuarios")
  );

  let usuarios = 0;
  snapshot.forEach((doc) => {
    const user = doc.data();
    if(user.role === "user"){
      usuarios++;
    }
  });


  // PEGA A BARRA
  const barra =
    document.getElementById("barraUsuarios");

  // DEFINE ALTURA
  barra.style.height =
    `${usuarios * 15}px`;
    
  // MOSTRA QUANTIDADE
  barra.textContent = usuarios;

} catch (err) {
  console.error(err);
}

// EXECUTA
carregarUsuarios();

