// Importar Firestore desde Firebase
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

// Obtener una referencia a la base de datos Firestore
const db = getFirestore();

// Elementos del DOM
const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

let currentUser = "";

// Escuchar nuevos mensajes desde Firebase
const messagesRef = collection(db, 'messages');
const q = query(messagesRef, orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
  chatBox.innerHTML = ""; // Limpiar chat antes de actualizar
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
    <strong>${username}</strong>: ${text}
    <small>${time}</small>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}