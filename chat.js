// Importa Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js ";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js ";

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

// Elementos del DOM
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const groupSelect = document.getElementById("group-select");

// Elementos nuevos para la lista de chats
const chatsList = document.getElementById("chats-list");

let currentUser = "";
let currentGroupId = "general"; // Grupo por defecto

// Lista de contactos (ahora vacía, se llena con localStorage o manual)
let users = [];

// Cargar nombre guardado (opcional)
const savedUser = localStorage.getItem("username");
if (savedUser) {
  usernameInput.value = savedUser;
  currentUser = savedUser;
}

// Cargar contactos guardados
const savedContacts = localStorage.getItem("contacts");
if (savedContacts) {
  users = JSON.parse(savedContacts);
}

// Escuchar cambios en el selector de grupo
if (groupSelect) {
  groupSelect.addEventListener("change", () => {
    currentGroupId = groupSelect.value;
    loadMessages();
  });
}

// Cargar mensajes filtrados por grupo
function loadMessages() {
  const q = query(
    collection(db, "messages"),
    where("groupId", "==", currentGroupId),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      addMessageToUI(data.username, data.text, data.timestamp, doc.id);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Enviar mensaje al hacer submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (!username || !message) return;

  currentUser = username;
  localStorage.setItem("username", username); // Guardar nombre

  // Guardar mensaje en Firestore con groupId
  addDoc(collection(db, "messages"), {
    username: username,
    text: message,
    timestamp: Date.now(),
    groupId: currentGroupId
  });

  messageInput.value = ""; // Limpiar campo de mensaje
});

// Mostrar mensaje en pantalla
function addMessageToUI(username, text, timestamp, docId) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  // Alternar posición según usuario
  if (username === currentUser) {
    msgDiv.classList.add("user2");
  } else {
    msgDiv.classList.add("user1");
  }

  // Formato de hora
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  msgDiv.innerHTML = `
    <strong>${username}:</strong> ${text}
    <small>${time}</small>
  `;

  // Solo mostrar botón de eliminar si es tu mensaje
  if (username === currentUser) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.background = "none";
    deleteBtn.style.border = "none";
    deleteBtn.style.fontSize = "16px";
    deleteBtn.title = "Eliminar mensaje";

    deleteBtn.onclick = function (e) {
      e.stopPropagation();
      deleteMessage(docId);
    };

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "space-between";
    container.style.alignItems = "center";

    const textWrapper = document.createElement("div");
    textWrapper.appendChild(msgDiv);

    container.appendChild(textWrapper);
    container.appendChild(deleteBtn);

    chatBox.appendChild(container);
  } else {
    chatBox.appendChild(msgDiv);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Eliminar un mensaje
function deleteMessage(docId) {
  const messageRef = doc(db, "messages", docId);
  deleteDoc(messageRef)
    .then(() => {
      console.log("Mensaje eliminado");
    })
    .catch((error) => {
      console.error("Error al borrar el mensaje: ", error);
    });
}

// Generar ID único para chats privados
function getPrivateChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// Función para agregar nuevo contacto
window.addContact = function () {
  const input = document.getElementById("friend-input");
  const newFriend = input.value.trim().toLowerCase();

  if (!newFriend) return alert("Por favor, escribe un nombre válido.");
  if (newFriend === currentUser) return alert("No puedes agregarte a ti mismo.");

  if (!users.includes(newFriend)) {
    users.push(newFriend);
    localStorage.setItem("contacts", JSON.stringify(users));
    input.value = "";
    showContacts(); // Volver a cargar la lista
  } else {
    alert("Este amigo ya está en la lista.");
  }
};

// Mostrar contactos dinámicamente
function showContacts() {
  const contactsList = document.getElementById("contacts-list");
  if (!contactsList) return;

  contactsList.innerHTML = "";

  users.forEach((user) => {
    if (user === currentUser) return;

    const li = document.createElement("li");
    li.textContent = user;

    li.addEventListener("click", () => {
      const privateGroupId = getPrivateChatId(currentUser, user);
      groupSelect.value = privateGroupId;
      currentGroupId = privateGroupId;
      loadMessages();
    });

    contactsList.appendChild(li);
  });
}

// Cargar contactos al iniciar
window.addEventListener("DOMContentLoaded", () => {
  showContacts();
  loadChatsList(); // 👉 Nueva función: carga los chats recientes
});

// ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇
// Nueva función: Carga los chats recientes desde Firebase
function loadChatsList() {
  if (!chatsList) return;

  const chatsRef = collection(db, "chats");

  onSnapshot(chatsRef, (snapshot) => {
    chatsList.innerHTML = ""; // Limpiar antes de cargar

    snapshot.forEach((docSnap) => {
      const chatData = docSnap.data();
      const chatItem = document.createElement("li");
      chatItem.className = "chat-item";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = chatData.name.charAt(0).toUpperCase(); // Primera letra como avatar

      const info = document.createElement("div");
      info.className = "chat-info";

      const name = document.createElement("strong");
      name.className = "chat-name";
      name.textContent = chatData.name;

      const lastMessage = document.createElement("p");
      lastMessage.className = "chat-message";
      lastMessage.textContent = chatData.lastMessage;

      const time = document.createElement("small");
      time.className = "chat-time";
      time.textContent = new Date(chatData.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      info.appendChild(name);
      info.appendChild(lastMessage);

      chatItem.appendChild(avatar);
      chatItem.appendChild(info);
      chatItem.appendChild(time);

      chatItem.addEventListener("click", () => {
        groupSelect.value = chatData.groupId;
        currentGroupId = chatData.groupId;
        loadMessages();
      });

      chatsList.appendChild(chatItem);
    });
  });
}