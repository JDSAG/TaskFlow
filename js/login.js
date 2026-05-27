// login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =====================
// CONFIG FIREBASE
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyDVrm89RBr2lEh5S1rbAO96XtNEs5hzkPs",
  authDomain: "taskflow-6ec0b.firebaseapp.com",
  projectId: "taskflow-6ec0b",
  storageBucket: "taskflow-6ec0b.firebasestorage.app",
  messagingSenderId: "971450110427",
  appId: "1:971450110427:web:952bd47df4273dc495d7fe",
  measurementId: "G-D1L7TJXQZ0"
};

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================
// ALTERNÂNCIA DE ABAS
// =====================
window.trocarAba = function(aba) {
  const formLogin    = document.getElementById("formLogin");
  const formRegistro = document.getElementById("formRegistro");
  const tabLogin     = document.getElementById("tabLogin");
  const tabRegistro  = document.getElementById("tabRegistro");
  const indicator    = document.getElementById("tabIndicator");


  if (aba === "login") {
    formLogin.classList.remove("hidden");
    formRegistro.classList.add("hidden");
    tabLogin.classList.add("active");
    tabRegistro.classList.remove("active");
    indicator.classList.remove("direita");
  } else {
    formLogin.classList.add("hidden");
    formRegistro.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabRegistro.classList.add("active");
    indicator.classList.add("direita");
  }

  // Limpa mensagens ao trocar de aba
  mostrarMensagem("msgLogin", "", "");
  mostrarMensagem("msgRegistro", "", "");
};

// =====================
// UTILITÁRIOS
// =====================
function mostrarMensagem(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = "mensagem " + tipo;
}

function setLoading(btnId, carregando) {
  const btn = document.getElementById(btnId);
  btn.disabled = carregando;
  btn.textContent = carregando ? "Aguarde..." : btn.dataset.label;
}

// =====================
// REGISTRO
// =====================
document.getElementById("btnRegistro").addEventListener("click", async () => {
  const nome  = document.getElementById("regNome").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const senha = document.getElementById("regSenha").value;

  // Validações
  if (!nome || !email || !senha) {
    mostrarMensagem("msgRegistro", "Preencha todos os campos.", "erro");
    return;
  }
  if (senha.length < 6) {
    mostrarMensagem("msgRegistro", "Senha deve ter no mínimo 6 caracteres.", "erro");
    return;
  }
  function validarEmail(email){
    return regexEmail.test(email)
  }
  if (!validarEmail(email)) {
    mostrarMensagem("msgRegistro", "Email invalido.", "erro");
    return;
  }
  function validarSenhaForte(senha){
    return regexSenha.test(senha)
  }
  if (!validarSenhaForte(senha)) {
    mostrarMensagem("msgRegistro", "Senha fraca! Tenha no mínimo 1 caractere especial, 1 numero, e 1 letra maiúscula.", "erro");
    return;
  }
  if (nome.length < 1){
    mostrarMensagem("msgRegistro", "Nome invalido. Deve ter no mínimo 2 caracteres", "erro");
    return;
  }
  setLoading("btnRegistro", true);
  
  try {
    // Verifica se email já existe
    const queryEmail = query(collection(db, "usuarios"), where("email", "==", email));
    const snapshotEmail = await getDocs(queryEmail);

    if (!snapshotEmail.empty) {
      mostrarMensagem("msgRegistro", "Este email já está cadastrado.", "erro");
      setLoading("btnRegistro", false);
      return;
    }

    //Verificação de ADM
    const role = email.endsWith("@admin.com") ? "admin":"user";
    if(role === "admin"){
      const queryAdminRole = query(collection(db, "usuarios"), where("role", "==", "admin"));
      const snapshotAdminRole = await getDocs(queryAdminRole);

      if (snapshotAdminRole.size >= 3) {
      mostrarMensagem("msgRegistro", "Máximo: 3 Admin Users", "erro");
      setLoading("btnRegistro", false);
      return;
    }
  };

    // Cria o usuário no Firestore
    await addDoc(collection(db, "usuarios"), {
      nome,
      email,
      senha,
      role,
      dataCriacao: new Date()
    });

    mostrarMensagem("msgRegistro", "Conta criada! Faça login.", "sucesso");

    // Limpa os campos
    document.getElementById("regNome").value  = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regSenha").value = "";

    // Redireciona para aba de login após 1.5s
    setTimeout(() => trocarAba("login"), 1500);

  } catch (err) {
    console.error(err);
    mostrarMensagem("msgRegistro", "Erro ao criar conta. Tente novamente.", "erro");
  }

  setLoading("btnRegistro", false);
});

// =====================
// LOGIN
// =====================
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value;

  if (!email || !senha) {
    mostrarMensagem("msgLogin", "Preencha email e senha.", "erro");
    return;
  }

  setLoading("btnLogin", true);

  try {
    // Busca usuário pelo email
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      mostrarMensagem("msgLogin", "Email não encontrado.", "erro");
      setLoading("btnLogin", false);
      return;
    }

    const docUsuario = snapshot.docs[0];
    const usuario = docUsuario.data();

    // Verifica a senha
    if (usuario.senha !== senha) {
      mostrarMensagem("msgLogin", "Senha incorreta.", "erro");
      setLoading("btnLogin", false);
      return;
    }

    // Salva sessão
    sessionStorage.setItem("usuario", JSON.stringify({
      id:   docUsuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    }));



    mostrarMensagem("msgLogin", `Bem-vindo, ${usuario.nome}! 👋`, "sucesso");

    // Redireciona conforme o role
    setTimeout(() => {
      if (usuario.role === "admin") {
        window.location.href = "view_admin.html";
      } else {
        window.location.href = "view_user.html";
      }
    }, 1000);

  } catch (err) {
    console.error(err);
    mostrarMensagem("msgLogin", "Erro ao fazer login. Tente novamente.", "erro");
  }

  setLoading("btnLogin", false);
});

// =====================
// LABELS PARA O LOADING
// =====================
document.getElementById("btnLogin").dataset.label    = "Entrar";
document.getElementById("btnRegistro").dataset.label = "Criar conta";