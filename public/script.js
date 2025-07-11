
let user = {id:null, puntajeTotal: 0}; // Simulación de usuario
let listOfUsers = []; // Lista de usuarios
let isLoggedIn = !!user?.id ;

const stateListeners = [];
const quiz=[];

const appState = new Proxy(
  {
    user: null,
    lenguaje: 'es',
    puntos: 0,
    intentos: 0,
    date: new Date().toISOString(),
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


const textosRanking = {
  es: {
    titulo: "🏅 Ranking",
    id: "ID",
    puntos: "Puntos",
    fecha: "Fecha",
    cerrar: "✖"
  },
  en: {
    titulo: "🏅 Ranking",
    id: "Employee ID",
    puntos: "Points",
    fecha: "Date",
    cerrar: "✖"
  }
};

const textSpin = {
  es: "Girar",
  en: "Spin"
};


function onAppStateChange(callback) {
  stateListeners.push(callback);
}

document.addEventListener('DOMContentLoaded', () => {

  renderNavbar();
  setActiveFlag(appState.lenguaje);

  // Cargar usuarios y cuestionario desde el backend
  fetch('/usuarios')
    .then((res) => res.json())
    .then((data) => listOfUsers.push(...data));

  fetch('/cuestionario')
    .then((res) => res.json())
    .then((data) => quiz.push(...data));
});

onAppStateChange((key, value) => {
  if (key === 'user' || key === 'lenguaje') {
    renderNavbar();
  }

  const spinBtn = document.getElementById('spinButton');
  if (spinBtn) {
    spinBtn.textContent = appState.lenguaje === 'es' ? '🎰 Girar' : '🎰 Spin';
    spinBtn.style.display = appState.user?.id ? 'block' : 'none';
  }
});









function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const navbarOld = document.getElementById('navbar');
  if (navbarOld) navbarOld.remove();

  const isLoggedIn = !!appState.user;

  const navbar = document.createElement('div');
  navbar.id = 'navbar';
  navbar.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #d32f2f;
    color: white;
    padding: 10px 20px;
    font-family: Arial, sans-serif;
    font-size: 16px;
  `;

  navbar.innerHTML = `
    <div class="navbar-left">
      <img src="assets/mx.svg" alt="Español" class="flag" id="flag-mx" title="Español">
      <img src="assets/us.svg" alt="English" class="flag" id="flag-us" title="English">
    </div>
    <div class="navbar-center">
      <strong id="welcome-message">
        ${
          !isLoggedIn
            ? appState.lenguaje === 'es'
              ? "Bienvenido al hackatón 2025"
              : "Welcome to the Hackathon 2025"
            : `<strong>ID de empleado:</strong> ${appState.user.id} <strong>Puntos:</strong> <span id="score">${formatNumberWithCommas(appState.user.puntos)}</span>  <strong>Intentos:</strong> <span id="attempts">${formatNumberWithCommas(appState.user.intentos)}</span>`
        }
      </strong>
    </div>
    <div class="navbar-right">
      ${
        !isLoggedIn
          ? `<button class="button-login">Login</button>`
          : `<button class="button-logout">Logout</button>`
      }
    </div>
  `;

  container.appendChild(navbar);


  document.getElementById('flag-mx')?.addEventListener('click', () => setActiveFlag('es'));
  document.getElementById('flag-us')?.addEventListener('click', () => setActiveFlag('en'));

  pintarBanderaActiva(appState.lenguaje);

  const loginBtn = document.querySelector('.button-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      crearPopupLogin();
    });
  }

  const logoutBtn = document.querySelector('.button-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      appState.user = null;
      appState.puntos = 0;
      appState.intentos = 0;
    });
  }
}
// ✅ Esta solo modifica el DOM (no toca appState)
function pintarBanderaActiva(lang) {
  const mx = document.getElementById('flag-mx');
  const us = document.getElementById('flag-us');

  mx?.classList.remove('active-flag');
  us?.classList.remove('active-flag');

  if (lang === 'es') mx?.classList.add('active-flag');
  if (lang === 'en') us?.classList.add('active-flag');
}

// 🔁 Esta sí cambia el estado global
function setActiveFlag(lang) {
  appState.lenguaje = lang;
}




function crearPopupLogin() {
  //if (document.getElementById("login-modal")) return; // Evitar duplicados

  const textos = {
    es: {
      titulo: "Registro a hackatón",
      usuario: "ID de empleado",
      name : "Nombre(s)",
      surname: "Apellido",
      ingresar: "Ingresar",
      cerrar: "Cerrar",
      error: "Por favor ingresa todos los campos.",
    },
    en: {
      titulo: "Register for Hackathon",
      usuario: "Employee ID",
      name : "Name(s)",
      surname: "Surname",
      ingresar: "Login",
      cerrar: "Close",
      error: "Please fill in all fields.",
    },
  };

  const t = textos[appState.lenguaje] || textos.es;

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
  type="text" 
  inputmode="numeric" 
  placeholder="●●●●●●●●" 
  maxlength="8"
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
      type="text" 
      inputmode="text" 
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
      <label style="font-size: 14px; color: #333;">${t.name}</label>
    <input id="login-surname" 
      type="text" 
      inputmode="text" 
      placeholder="surname" 
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
    const surname = document.getElementById("login-surname").value.trim();
    
    const usersList = listOfUsers.map(u => u.id);

    if (!usuario || !name) {
      const error = document.getElementById("login-error");
      error.style.display = "block";
    } else if (usersList.includes(usuario)) {
      
      const getUser = listOfUsers.find(u => u.id === usuario);
      appState.user = getUser;

      listOfUsers.push(usuario);
      modal.remove();
    } else {
      modal.remove();
      onLogin({ 
        id: usuario,
        name: name
      });
    }
  };

 
}

function onLogin(usuario) {
  fetch('/agregar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(usuario)
  })
  .then(res => {
     if (res.ok) {
    appState.user = { ...usuario, puntos: 0, intentos: 0 };
    renderNavbar(); // Evita múltiples renders
    setActiveFlag(appState.lenguaje);
  }else {
      alert("Error al agregar usuario");
    }
  });
}


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

    // Tamaño decreciente
    const size = 60 - (i * 0.8);
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    // Degradado de rojo
    const redIntensity = 255 - i * 5;
    circle.style.backgroundColor = `rgb(${Math.max(redIntensity, 120)}, 20, 20)`;

    // Estilos generales
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.display = 'flex';
    circle.style.flexDirection = 'column';
    circle.style.alignItems = 'center';
    circle.style.justifyContent = 'center';
    circle.style.color = 'white';
    circle.style.fontFamily = 'Arial, sans-serif';
    circle.style.fontWeight = 'bold';
    circle.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';
    circle.style.textAlign = 'center';

    // 🏁 Centro con banderas (igual que antes)
  const centerContainer = document.createElement('div');
  centerContainer.className = 'centerpiece';

  const flagMX = document.createElement('img');
  flagMX.src = 'assets/mx.svg';
  flagMX.style.width = '36px';

  const flagUS = document.createElement('img');
  flagUS.src = 'assets/us.svg';
  flagUS.style.width = '36px';
centerContainer.appendChild(flagMX);
  centerContainer.appendChild(flagUS);
  board.appendChild(centerContainer);

    // Contenido del círculo
    const number = startNumber + i;
    const points = pointStart - i * pointStep;
    circle.innerHTML = `<span>${number}</span><small>${points}pt</small>`;

    board.appendChild(circle);
    circles.push(circle);
  }
}

createSpiral(36, 60, 9, Math.PI * 1.5, 0.45, 1, 500, 10);


let isSpinning = false;
const resultDisplay = document.getElementById('result');
const spinButton = document.getElementById('spinButton');

spinButton.addEventListener('click', () => {
  if (isSpinning) return;



  if (appState.user.intentos<3) {
  
    renderNavbar();
    iniciarGiro(); // 🎯 Gira directo
  } else {
    // Mostrar popup y solo girar si acepta
    mostrarPopupPago(() => {
      if (appState.user.puntos >= 100) {
        appState.user.puntos -= 100;
        appState.user.intentos += 1;
        actualizarUsuario(appState.user);
        renderNavbar();
        iniciarGiro(); // 🎯 Solo gira si acepta
      } else {
        alert(`${appState.lenguaje === "es" ? "No tienes suficientes puntos para girar." : "You don't have enough points to spin."}`);
      }
    });
  }
});



function iniciarGiro() {
  if (isSpinning) return;
  isSpinning = true;
  resultDisplay.textContent = '';

  const totalSteps = Math.floor(Math.random() * 20)+50;
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



      const pregunta = quiz.find(p => +p.index === result && p.lenguaje === activelenguaje);
      const popup = document.getElementById("popup-number");

      if (!pregunta) {
        popup.innerHTML = `${appState.lenguaje === "es" ? "El número ganador es" : "The winning number is"}: ${result} <br>❌ ${appState.lenguaje === "es" ? "Sin pregunta disponible." : "No question available."}`;
      } else {
        popup.innerHTML = `
           ${appState.lenguaje === "es" ? "Número" : "Number"}: <strong>${result}</strong><br><br>
          <strong>${pregunta["pregunta"]}</strong><br>
          <button class="button-quiz" id="btn-a">A) ${pregunta["respuesta a"]}</button><br>
          <button class="button-quiz" id="btn-b">B) ${pregunta["respuesta b"]}</button><br>
          <button class="button-quiz" id="btn-c">C) ${pregunta["respuesta c"]}</button>
        `;

        ["a", "b", "c"].forEach(op => {
          document.getElementById(`btn-${op}`).addEventListener("click", () => {
            window.evaluarRespuesta({
              seleccionada: op,
              correcta: pregunta["correcta"],
              puntos: parseInt(pregunta["puntos"]),
            });
          });
        });
      }

      document.getElementById("popup").classList.remove("hidden");
    }
  }

  highlightNext();
}


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
    mensaje = `✅ ${appState.lenguaje === "es" ? "¡Correcto!" : "Correct!"} ${appState.lenguaje === "es" ? "Ganaste" : "You won"} ${puntos} ${appState.lenguaje === "es" ? "punto(s)." : "point(s)."}<br>`;
    renderNavbar();

  } else {
    mensaje = `❌ ${appState.lenguaje === "es" ? "Incorrecto. " : "Incorrect. "}<strong>Incorrecto. </strong>.<br>`;
    const img = document.createElement("img");
    img.src = "assets/perro.jpg";
    img.alt = "Perro triste";
    img.style.width = "150px";
    img.style.marginTop = "10px";
    popup.appendChild(img);
    appState.user.intentos += 1;
    renderNavbar();
  }
  
      actualizarUsuario({ 
  id: appState.user.id, 
  puntajeTotal: appState.user.puntos, 
  intentos: appState.user.intentos,
  ...appState.user
});

  const resultado = document.createElement("div");
  resultado.innerHTML = "<br>" + mensaje + `${appState.lenguaje === "es" ? "Puntaje acumulado" : "Total score"}: <strong>${appState?.user?.puntos || 0}</strong>`;
  popup.appendChild(resultado);
};


function actualizarUsuario( newState) {
  fetch('/actualizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newState)
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

document.getElementById('mostrar-ranking').addEventListener('click', () => {
  const lenguaje = document.getElementById("flag-mx").classList.contains("active-flag") ? "es" : "en";
  const t = textosRanking[lenguaje];

  // Mostrar el modal
  const modal = document.getElementById('ranking-modal');
  modal.classList.remove('hidden');

  // Traducir textos
  document.querySelector('.ranking-content h2').textContent = t.titulo;
  document.querySelector('#tabla-usuarios thead').innerHTML = `
    <tr>
      <th>${t.id}</th>
      <th>${t.puntos}</th>
      <th>${t.fecha}</th>
    </tr>
  `;

  // Cargar datos
  fetch('/usuarios')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tabla-usuarios tbody');
      tbody.innerHTML = '';

      data.sort((a, b) => (b.puntajeTotal || 0) - (a.puntajeTotal || 0));

      data.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.id}</td>
          <td>${Number(user.puntajeTotal || 0).toLocaleString()}</td>
          <td>${new Date(user.fecha).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error('Error al cargar el ranking:', err);
    });
});

// Cerrar el modal
document.getElementById('cerrar-ranking').addEventListener('click', () => {
  document.getElementById('ranking-modal').classList.add('hidden');
});




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
      <h3 style="color:#c5002e;">⚠️ ${appState.lenguaje === "es" ? "Atención" : "Attention"}</h3>
      <p>${appState.lenguaje === "es" ? "Has consumido tus giros gratis." : "You have used your free spins."}<br>${appState.lenguaje === "es" ? "¿Deseas girar por" : "Do you want to spin for"} <strong>100 puntos</strong>?</p>
      <div style="margin-top:20px; display:flex; justify-content:space-around;">
        <button id="popup-cancelar" style="padding:8px 16px;">${appState.lenguaje === "es" ? "Cancelar" : "Cancel"}</button>
        <button id="popup-confirmar" style="padding:8px 16px; background-color:#c5002e; color:white; border:none;">${appState.lenguaje === "es" ? "Girar" : "Spin"}</button>
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

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


