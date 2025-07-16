let partida = "";
let jugador = "";

function unirse() {
  partida = document.getElementById("partidaId").value;
  jugador = document.getElementById("nombre").value;

  if (!partida || !jugador) {
    alert("Pon tu nombre y el ID de la partida");
    return;
  }

  db.ref(`partidas/${partida}/jugadores/${jugador}`).set({
    recargas: 0,
    fichas: 0
  });

  document.getElementById("panel").style.display = "block";
  escucharCambios();
}

function escucharCambios() {
  db.ref(`partidas/${partida}/jugadores`).on("value", snapshot => {
    const data = snapshot.val() || {};
    const div = document.getElementById("jugadores");
    div.innerHTML = "";

    Object.keys(data).forEach(nombre => {
      const j = data[nombre];
      div.innerHTML += `
        <div class="jugador">
          <strong>${nombre}</strong><br>
          Aportado: €${j.recargas}<br>
          <button onclick="recargar('${nombre}', 5)">+5€</button>
          <button onclick="recargar('${nombre}', 10)">+10€</button><br>
          Fichas: <input type="number" value="${j.fichas}" onchange="actualizarFichas('${nombre}', this.value)">
        </div>
      `;
    });
  });
}

function recargar(nombre, cantidad) {
  const ref = db.ref(`partidas/${partida}/jugadores/${nombre}/recargas`);
  ref.once("value").then(snap => {
    const actual = snap.val() || 0;
    ref.set(actual + cantidad);
  });
}

function actualizarFichas(nombre, valor) {
  db.ref(`partidas/${partida}/jugadores/${nombre}/fichas`).set(Number(valor));
}

function finalizarPartida() {
  db.ref(`partidas/${partida}/jugadores`).once("value").then(snapshot => {
    const jugadores = snapshot.val();
    let resumen = "<h2>Resultados</h2>";
    let totalAportado = 0;
    let totalFichas = 0;

    for (let nombre in jugadores) {
      const j = jugadores[nombre];
      const ganancia = j.fichas - j.recargas;
      resumen += `<p><strong>${nombre}</strong>: ${ganancia >= 0 ? "+" : ""}${ganancia}€</p>`;
      totalAportado += j.recargas;
      totalFichas += j.fichas;
    }

    resumen += `<p><em>Total aportado: €${totalAportado}, fichas finales: €${totalFichas}</em></p>`;
    document.getElementById("resultados").innerHTML = resumen;
  });
}
