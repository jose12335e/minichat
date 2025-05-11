// Importa Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js ";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js ";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCh1nzOB7Zx3lPz5Ga-riPtXzZLVS-kf80",
  authDomain: "minichat-c2837.firebaseapp.com",
  projectId: "minichat-c2837",
  storageBucket: "minichat-c2837.appspot.com",
  messagingSenderId: "639801347073",
  appId: "1:639801347073:web:629e24f2bc784fbfa48400"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección 'messages'
const messagesRef = collection(db, 'messages');
const q = query(messagesRef, orderBy("timestamp", "asc"));

// Elementos del DOM
const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

let currentUser = "";

// Escuchar nuevos mensajes en tiempo real
onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    addMessageToUI(data.username, data.text, data.timestamp);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Enviar mensaje al hacer submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username || !message) return;

  currentUser = username;

  // Guardar mensaje en Firestore
  addDoc(collection(db, 'messages'), {
    username: username,
    text: message,
    timestamp: Date.now()
  });

  messageInput.value = ""; // Limpiar campo de mensaje
});

// Mostrar mensaje en pantalla
function addMessageToUI(username, text, timestamp) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');

  // Alternar posición según usuario
  if (username === currentUser) {
    msgDiv.classList.add('user2');
  } else {
    msgDiv.classList.add('user1');
  }

  // Formato de hora
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.innerHTML = `
    <strong>${username}:</strong> ${text}
    <small>${time}</small>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}