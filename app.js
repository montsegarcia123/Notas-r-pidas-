if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(() => {
    console.log('Service Worker registrado');
  });
}

let db;
const request = indexedDB.open("NotasDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  cargarNotas();
};

request.onerror = function() {
  console.error("Error al abrir la base de datos");
};

document.getElementById("notaForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const notaTexto = document.getElementById("notaInput").value;
  guardarNota(notaTexto);
  document.getElementById("notaInput").value = '';
});

function guardarNota(texto) {
  const transaction = db.transaction(["notas"], "readwrite");
  const store = transaction.objectStore("notas");
  const nota = { texto: texto, fecha: new Date().toLocaleString() };
  store.add(nota);
  cargarNotas();
}

function cargarNotas() {
  const transaction = db.transaction(["notas"], "readonly");
  const store = transaction.objectStore("notas");
  const request = store.getAll();

  request.onsuccess = function() {
    const notasList = document.getElementById("notasList");
    notasList.innerHTML = '';
    request.result.forEach(nota => {
      const li = document.createElement("li");
      li.textContent = `${nota.texto} (Guardado el ${nota.fecha})`;
      notasList.appendChild(li);
    });
  };
}

// Notificaciones Push (opcional)
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration.showNotification("¡Bienvenido a Notas Rápidas!", {
        body: "Comienza a crear y guardar tus notas.",
        icon: "icons/icon-192x192.png"
      });
    });
  }
});
