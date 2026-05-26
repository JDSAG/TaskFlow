// scripts.js

// Importa as funções necessárias do SDK do Firebase
// Estas importações são o motivo pelo qual seu <script> precisa ser type="module"

// Verifica sessão
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuario) window.location.href = "index.html";

// Mostra o nome no header
document.getElementById("usuarioNome").textContent = `Olá, ${usuario.nome} 👋`;

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  sessionStorage.removeItem("usuario");
  window.location.href = "index.html";
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Sua configuração do projeto Firebase (aquela que você obteve do console)
const firebaseConfig = {
    apiKey: "AIzaSyDVrm89RBr2lEh5S1rbAO96XtNEs5hzkPs",
    authDomain: "taskflow-6ec0b.firebaseapp.com",
    projectId: "taskflow-6ec0b",
    storageBucket: "taskflow-6ec0b.firebasestorage.app",
    messagingSenderId: "971450110427",
    appId: "1:971450110427:web:952bd47df4273dc495d7fe",
    measurementId: "G-D1L7TJXQZ0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore e obtém uma referência ao serviço
const db = getFirestore(app);

// Referências aos elementos do DOM
const darkBtn = document.getElementById("btnDark");
const taskInput = document.getElementById("taskInput");
const btnAdd = document.getElementById("btnAdd");
const taskList = document.getElementById("taskList");

// Listener para o botão de modo escuro
darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// Função para renderizar uma tarefa no DOM
function renderizarTarefa(tarefa) {
    //Criar Div da tarefa
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    if (tarefa.concluido) {
        taskDiv.classList.add("completed");
    }
    // Armazena o ID do documento do Firestore no elemento DOM
    taskDiv.dataset.id = tarefa.id;

    // texto da tarefa
    const taskName = document.createElement("span");
    taskName.innerText = tarefa.descricao;

    //Area de botões 
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("task-buttons");

    //Botão Concluir
    const btnComplete = document.createElement("button");
    btnComplete.innerText = "✅";
    btnComplete.classList.add("btnComplete");

    btnComplete.addEventListener("click", async () => {
        const taskId = taskDiv.dataset.id;
        const estaConcluido = taskDiv.classList.contains("completed");
        // Alterna o status no Firestore
        await updateDoc(doc(db, "afazeres", taskId), { concluido: !estaConcluido });
        taskDiv.classList.toggle("completed"); // Atualiza o DOM
    });

    //Botão excluir
    const btnDelete = document.createElement("button");
    btnDelete.innerText = "❌";
    btnDelete.classList.add("btnDelete");

    btnDelete.addEventListener("click", async () => {
        const taskId = taskDiv.dataset.id;
        // Exclui do Firestore
        await deleteDoc(doc(db, "afazeres", taskId));
        taskDiv.remove(); // Remove do DOM
    });

    //Adicionar botões
    buttonDiv.appendChild(btnComplete);
    buttonDiv.appendChild(btnDelete);

    taskDiv.appendChild(taskName);
    taskDiv.appendChild(buttonDiv);
    taskList.appendChild(taskDiv);
}

// Função para carregar tarefas do Firestore
async function carregarTarefas() {
    taskList.innerHTML = ""; // Limpa a lista antes de recarregar
    const q = query(collection(db, "afazeres"), orderBy("dataCriacao", "asc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        renderizarTarefa({ id: doc.id, ...doc.data() });
    });
}

// Listener para o botão Adicionar
btnAdd.addEventListener("click", async () => {
    const taskText = taskInput.value.trim(); // .trim() para remover espaços em branco
    if (taskText === "") {
        alert("Digite uma tarefa!");
        return;
    }

    try {
        // Adiciona a tarefa ao Firestore
        const docRef = await addDoc(collection(db, "afazeres"), {
            descricao: taskText,
            concluido: false,
            dataCriacao: new Date()
        });

        // Renderiza a tarefa recém-adicionada
        renderizarTarefa({ id: docRef.id, descricao: taskText, concluido: false, dataCriacao: new Date() });

        taskInput.value = ""; // Limpa o input
        taskInput.focus(); // Coloca o foco de volta no input
    } catch (e) {
        console.error("Erro ao adicionar tarefa: ", e);
        alert("Erro ao adicionar tarefa. Verifique o console.");
    }
});

// Carrega as tarefas quando a página é carregada
document.addEventListener("DOMContentLoaded", carregarTarefas);
