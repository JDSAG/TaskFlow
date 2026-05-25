const darkBtn = document.getElementById("btnDark");

darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

const firebaseConfig = {
    apiKey: "AIzaSyDVrm89RBr2lEh5S1rbAO96XtNEs5hzkPs",
    authDomain: "taskflow-6ec0b.firebaseapp.com",
    projectId: "taskflow-6ec0b",
    storageBucket: "taskflow-6ec0b.firebasestorage.app",
    messagingSenderId: "971450110427",
    appId: "1:971450110427:web:952bd47df4273dc495d7fe",
    measurementId: "G-D1L7TJXQZ0"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function carregarUsuarios() {
  const snapshot = await db.collection('usuarios').get()
  const corpo = document.getElementById('corpoTabela')

  snapshot.forEach(doc => {
    const u = doc.data()
    const linha = `
      <tr>
        <td>${doc.id}</td>
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td><button onclick="deletar('${doc.id}')">🗑️</button></td>
      </tr>
    `
    corpo.innerHTML += linha
  })
}

async function deletar(id) {
  const confirmou = confirm('Tem certeza que quer excluir este usuário?')
  
  if (confirmou) {
    await db.collection('usuarios').doc(id).delete()
    
    // Remove a linha da tabela sem precisar recarregar a página
    document.getElementById(`linha-${id}`).remove()
  }
}
