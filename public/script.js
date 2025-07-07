
let user = {userId:null, puntajeTotal: 0}; // Simulación de usuario
let listOfUsers = []; // Lista de usuarios
let lenguaje = 'es'; // Idioma por defecto
let isLoggedIn = !!user?.userId ;

const stateListeners = [];
const quiz=[];

const appState = new Proxy(
  {
    user: null,
    lenguaje: 'es',
    puntos: 0,
    intentos: 0,
  },
  {
    set(target, prop, value) {
      target[prop] = value;

      // Notificar a todos los listeners
      stateListeners.forEach(listener => listener(prop, value));
      return true;
    }
  }
);

function onAppStateChange(callback) {
  stateListeners.push(callback);
}



document.addEventListener('DOMContentLoaded', () => {

  // Cargar usuarios desde el backend
  fetch('/usuarios')
    .then(res => res.json())
    .then(data => {
      data.forEach(user => {
        listOfUsers.push(user);
      });
    });

      // Cargar usuarios desde el backend
  fetch('/cuestionario')
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        quiz.push(item);
      });
    });


});



onAppStateChange((key, value) => {
  if (key === 'user' || key === 'lenguaje') {
    renderNavbar();
  }
   const spinBtn = document.getElementById("spinButton");
    if (value && value.userId) {
      spinBtn.style.display = "block";
    } else {
      spinBtn.style.display = "none";
    }
});



renderNavbar();
function renderNavbar() {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  // Elimina navbar previo si existe
  const navbarOld = document.getElementById("navbar");
  if (navbarOld) navbarOld.remove();

  const isLoggedIn = !!appState.user;



  // Elimina navbar previo si existe
  if (navbarOld) navbarOld.remove();

  // Crea el nuevo navbar
  const navbar = document.createElement("div");
  navbar.id = "navbar";
  navbar.style.display = "flex";
  navbar.style.justifyContent = "space-between";
  navbar.style.alignItems = "center";
  navbar.style.background = "#d32f2f";
  navbar.style.color = "white";
  navbar.style.padding = "10px 20px";
  navbar.style.fontFamily = "Arial, sans-serif";
  navbar.style.fontSize = "16px";


  navbar.innerHTML = `
    <div class="navbar-left">
      <img src="assets/mx.svg" alt="Español" class="flag" id="flag-mx" title="Español">
      <img src="assets/us.svg" alt="English" class="flag" id="flag-us" title="English">
    </div>
    <div class="navbar-center">
      <strong id="welcome-message">
        ${
          !isLoggedIn
            ? lenguaje === "es"
              ? "Bienvenido al hackatón 2025"
              : "Welcome to the Hackathon 2025"
            : `<strong>ID de empleado:</strong> ${appState.user.userId} <strong>Score:</strong> <span id="score">${appState.user.puntos}</span>`
        }
      </strong>
    </div>
    <div class="navbar-right">
      ${
        !isLoggedIn
          ? `<button class="button-login"> Login</button>`
          : `<button class="button-logout">Logout</button>`
      }
    </div>
  `;

  container.appendChild(navbar);

  // Activar bandera seleccionada
  setActiveFlag(lenguaje);

  // Listeners de idioma
  document.getElementById("flag-mx").addEventListener("click", () => {
      setActiveFlag('es');

  
  });

  document.getElementById("flag-us").addEventListener("click", () => {
  setActiveFlag('en');

  
  });

    const loginBtn = document.querySelector(".button-login");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      crearPopupLogin(appState.lenguaje, onLogin);
    });
  }
  const logoutBtn = document.querySelector(".button-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      appState.user = null;
      appState.puntos = 0;
      renderNavbar();
    });
  }
}

function setActiveFlag(lang) {
  const mx = document.getElementById("flag-mx");
  const us = document.getElementById("flag-us");

  mx.classList.remove("active-flag");
  us.classList.remove("active-flag");

  if (lang === "es") mx.classList.add("active-flag");
  if (lang === "en") us.classList.add("active-flag");
}


function crearPopupLogin(lenguaje = "es", onLogin = () => {}) {
  //if (document.getElementById("login-modal")) return; // Evitar duplicados

  const textos = {
    es: {
      titulo: "Registro a hackatón",
      usuario: "Id de usuario",
      name : "Nombre",
      ingresar: "Ingresar",
      cerrar: "Cerrar",
      error: "Por favor ingresa todos los campos.",
    },
    en: {
      titulo: "Sign In",
      usuario: "Username",
      name : "Name",
      ingresar: "Login",
      cerrar: "Close",
      error: "Please fill in all fields.",
    },
  };

  const t = textos[lenguaje] || textos.es;

  const modal = document.createElement("div");
  modal.id = "login-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease forwards;
  `;

modal.innerHTML = `
  <div style="
    background: white;
    padding: 28px 32px;
    border-radius: 12px;
    min-width: 320px;
    font-family: 'Segoe UI', Arial, sans-serif;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    animation: scaleIn 0.3s ease;
  ">
    <h2 style="
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      color: #c5002e;
    ">${t.titulo}</h2>

    <label style="font-size: 14px; color: #333;">${t.usuario}</label>
    <input id="login-clave" 
      type="number" 
      inputmode="numeric" 
      placeholder="●●●●●●●●" 
      style="
        width: 100%;
        padding: 10px 12px;
        font-size: 16px;
        border: 1.5px solid #ccc;
        border-radius: 6px;
        margin-bottom: 16px;
        outline: none;
        transition: border 0.3s ease;
      "
    />
    <label style="font-size: 14px; color: #333;">${t.name}</label>
    <input id="login-name" 
      type="string" 
      inputmode="string" 
      placeholder="name" 
      style="
        width: 100%;
        padding: 10px 12px;
        font-size: 16px;
        border: 1.5px solid #ccc;
        border-radius: 6px;
        margin-bottom: 16px;
        outline: none;
        transition: border 0.3s ease;
      "
    />
    <div id="login-error" style="color: red; display: none; font-size: 13px; margin-bottom: 12px;">${t.error}</div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="login-cerrar" style="
        background: none;
        border: none;
        color: #999;
        font-size: 14px;
        cursor: pointer;
      ">${t.cerrar}</button>

      <button id="login-enviar" style="
        background-color: #c5002e;
        color: white;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      ">${t.ingresar}</button>
    </div>
  </div>
`;
;

  document.body.appendChild(modal);

  // Eventos
  document.getElementById("login-cerrar").onclick = () => modal.remove();

  document.getElementById("login-enviar").onclick = () => {
     const usuario = document.getElementById("login-clave").value.trim();
    const name =document.getElementById("login-name").value.trim();
    
    const usersList = listOfUsers.map(u => u.id);

    if (!usuario || !name) {
      const error = document.getElementById("login-error");
      error.style.display = "block";
    } else if (usersList.includes(usuario)) {
      
      const getUser = listOfUsers.find(u => u.id === usuario);
      console.log("getUser", getUser);
      appState.user = {
        userId: getUser.id,
        name: getUser.name,
        puntos: parseInt(getUser.puntos) || 0,
        intentos: parseInt(getUser.intentos) || 0,
        };

      listOfUsers.push(usuario);
      modal.remove();
    } else {
      modal.remove();
      onLogin({ 
        id: usuario,
        name: name,
        puntos: 0,
        intentos: 0,
      });
    }
  };

 
}

function onLogin( usuario ) {
  fetch('/agregar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams( usuario )
  })
  .then(res => {
    if (res.ok) {
      alert(`¡Usuario ${usuario.id} agregado exitosamente!`);
      appState.user = {
        userId: usuario.id,
        name: usuario.name,
        puntos: 0
      };

      // Opcional: recargar tabla si estás en la vista principal
      location.reload();
    } else {
      alert("Error al agregar usuario");
    }
  });
}



// Crear espiral
const board = document.querySelector('.board');
const circles = [];

function createSpiral(total, startRadius, radiusStep, startAngle, angleStep, startNumber, pointStart, pointStep) {
  for (let i = 0; i < total; i++) {
    const reversedIndex = total - 1 - i;
    const radius = startRadius + reversedIndex * radiusStep;
    const angle = startAngle + reversedIndex * angleStep;
    const centerX = 350;
    const centerY = 350;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    const number = startNumber + i;
    const points = pointStart - i * pointStep;

    circle.innerHTML = `<span>${number}</span><small>${points}pt</small>`;
    board.appendChild(circle);
    circles.push(circle);
  }
}


createSpiral(36, 60, 9, Math.PI * 1.5, 0.45, 1, 500, 10);

// Spin logic
const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('result');
let isSpinning = false;

spinButton.addEventListener('click', () => {

   if (appState.user.intentos >= 3) {
    mostrarPopupPago(() => {
      if (appState.user.puntos >= 100) {
        appState.user.puntos -= 100;
        appState.user.intentos += 1;
        renderNavbar();
        spinButton.click(); // Reiniciar el giro
      } else {
        alert("No tienes suficientes puntos para girar.");
        return;

      }
    });
  }

  if (isSpinning) return;
 
  
  isSpinning = true;
  resultDisplay.textContent = '';

  const totalSteps = Math.floor(Math.random() * 20) ;
  let currentIndex = 0;
  let step = 0;
  let delay = 100;

  function highlightNext() {
    circles.forEach(c => c.classList.remove('active'));
    const circle = circles[currentIndex];
    circle.classList.add('active');

    if (step < totalSteps) {
      step++;
      currentIndex = (currentIndex + 1) % circles.length;
      delay += 15;
      setTimeout(highlightNext, delay);
    } else {
      isSpinning = false;

      let result = parseInt(circle.querySelector('span').textContent);
      resultDisplay.textContent = '';
      const activelenguaje = document.getElementById("flag-mx").classList.contains("active-flag") ? "es" : "en";

  // Asume que ya existe: const quiz = [...] (la lista de preguntas precargadas)
  result=1;
  const pregunta = quiz.find(p => +p.index === 1 && p.lenguaje === activelenguaje);


  const popup = document.getElementById("popup-number");

if (!pregunta) {
  popup.innerHTML = `El número ganador es: ${result} <br>❌ Sin pregunta disponible.`;
} else {
  popup.innerHTML = `
    🎯 Número: <strong>${result}</strong><br><br>
    <strong>${pregunta["pregunta"]}</strong><br>
    <button id="btn-a">A) ${pregunta["respuesta a"]}</button><br>
    <button id="btn-b">B) ${pregunta["respuesta b"]}</button><br>
    <button id="btn-c">C) ${pregunta["respuesta c"]}</button>
  `;

  document.getElementById("btn-a").addEventListener("click", () => {
    window.evaluarRespuesta({
      seleccionada: 'a',
      correcta: pregunta["correcta"],
      puntos: parseInt(pregunta["puntos"]),
    });
  });

  document.getElementById("btn-b").addEventListener("click", () => {
    window.evaluarRespuesta({
      seleccionada: 'b',
      correcta: pregunta["correcta"],
      puntos: parseInt(pregunta["puntos"]),
    });
  });

  document.getElementById("btn-c").addEventListener("click", () => {
    window.evaluarRespuesta({
      seleccionada: 'c',
      correcta: pregunta["correcta"],
      puntos: parseInt(pregunta["puntos"]),
    });
  });
}

document.getElementById("popup").classList.remove("hidden");

    }
  }

  highlightNext();
});

document.getElementById("popup-close").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

window.evaluarRespuesta = function ({ seleccionada, correcta, puntos }) {
  const popup = document.getElementById("popup-number");
  if (!popup) return;

  popup.innerHTML = "";
  const isCorrect = seleccionada === correcta;
  let mensaje = "";

  if (isCorrect) {
    appState.user.puntos += puntos;
    appState.user.intentos += 1;

    mensaje = `✅ ¡Correcto! Ganaste ${puntos} punto(s).<br>`;
    actualizarUsuario({ 
  userId: appState.user.userId, 
  puntajeTotal: appState.user.puntos, 
  intentos: appState.user.intentos 
});
  renderNavbar();

  } else {
    mensaje = `❌ Incorrecto. </strong>".<br>`;
    const img = document.createElement("img");
    img.src = "assets/perro.jpg";
    img.alt = "Perro triste";
    img.style.width = "150px";
    img.style.marginTop = "10px";
    popup.appendChild(img);
  }

  const resultado = document.createElement("div");
  resultado.innerHTML = "<br>" + mensaje + `Puntaje acumulado: <strong>${appState?.user?.puntos || 0}</strong>`;
  popup.appendChild(resultado);
};


function actualizarUsuario({ userId, puntajeTotal, intentos }) {
  fetch('/actualizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, puntos: puntajeTotal, intentos })
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo actualizar el usuario");
      return res.json();
    })
    .then(data => {
      console.log("Usuario actualizado:", data);
    })
    .catch(err => {
      console.error("Error actualizando usuario:", err);
    });
}


function mostrarPopupPago(onConfirmar) {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(0,0,0,0.6)';
  popup.style.display = 'flex';
  popup.style.justifyContent = 'center';
  popup.style.alignItems = 'center';
  popup.style.zIndex = '2000';

  popup.innerHTML = `
    <div style="background:white; padding:30px; border-radius:10px; max-width:350px; text-align:center;">
      <h3 style="color:#c5002e;">⚠️ Atención</h3>
      <p>Has consumido tus giros gratis.<br>¿Deseas girar por <strong>100 puntos</strong>?</p>
      <div style="margin-top:20px; display:flex; justify-content:space-around;">
        <button id="popup-cancelar" style="padding:8px 16px;">Cancelar</button>
        <button id="popup-confirmar" style="padding:8px 16px; background-color:#c5002e; color:white; border:none;">Girar</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("popup-cancelar").onclick = () => {
    popup.remove();
  };

  document.getElementById("popup-confirmar").onclick = () => {
    popup.remove();
    onConfirmar();
     // Ejecutar la acción de confirmación
  };
}

