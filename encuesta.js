// encuesta.js - Encuesta de satisfacción
// Eventos desacoplados (addEventListener) + fetch con async/await

const form = document.querySelector("#formEncuesta");
const comentario = document.querySelector("#comentario");
const contador = document.querySelector("#contador");
const mensaje = document.querySelector("#mensajeEncuesta");
const btnEnviar = document.querySelector("#btnEnviar");

function mostrarMensaje(texto, tipo) {
    mensaje.classList.remove("mensaje-error", "mensaje-exito");
    mensaje.textContent = texto;
    mensaje.classList.add(tipo === "exito" ? "mensaje-exito" : "mensaje-error");
}

// Cuenta los caracteres que quedan en el textarea
function actualizarContador() {
    const restantes = comentario.maxLength - comentario.value.length;
    contador.textContent = restantes + " caracteres restantes";
    contador.classList.toggle("poco", restantes <= 20);
}

// Devuelve el radio elegido (o null) y marca en rojo el grupo si falta
function obtenerRespuesta(nombre) {
    const elegido = form.querySelector("input[name='" + nombre + "']:checked");
    const grupo = form.querySelector("input[name='" + nombre + "']").closest("fieldset");
    grupo.classList.toggle("sin-responder", !elegido);
    return elegido;
}

async function enviarEncuesta(datos) {
    // Simula el servidor: le pega a un .json local
    const respuesta = await fetch("respuesta_encuesta.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
        throw new Error("El servidor respondió con estado " + respuesta.status);
    }
    return await respuesta.json();
}

// Eventos
comentario.addEventListener("input", actualizarContador);

// Al elegir una opción, se quita la marca de error de ese grupo
form.querySelectorAll("input[type='radio']").forEach(function (radio) {
    radio.addEventListener("change", function () {
        radio.closest("fieldset").classList.remove("sin-responder");
    });
});

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const satisfaccion = obtenerRespuesta("satisfaccion");
    const recomienda = obtenerRespuesta("recomienda");

    if (!satisfaccion || !recomienda) {
        mostrarMensaje("Respondé las preguntas marcadas en rojo antes de enviar.", "error");
        return;
    }

    const datos = {
        satisfaccion: Number(satisfaccion.value),
        recomienda: recomienda.value,
        comentario: comentario.value.trim()
    };

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
        const resultado = await enviarEncuesta(datos);
        if (resultado.estado === "ok") {
            mostrarMensaje(resultado.mensaje + " (Satisfacción: " + datos.satisfaccion + "/5)", "exito");
            form.reset();
            actualizarContador();
        } else {
            mostrarMensaje("No pudimos registrar tu respuesta. Probá de nuevo.", "error");
        }
    } catch (err) {
        mostrarMensaje("Error de conexión: " + err.message, "error");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar encuesta";
    }
});
