// app.js - Módulo de Contacto y Consultas
// Eventos desacoplados (addEventListener) + fetch con async/await

const form = document.querySelector("#formContacto");
const mensaje = document.querySelector("#mensajeContacto");
const btnEnviar = document.querySelector("#btnEnviar");

function mostrarMensaje(texto, tipo) {
    mensaje.classList.remove("mensaje-error", "mensaje-exito");
    mensaje.textContent = texto;
    mensaje.classList.add(tipo === "exito" ? "mensaje-exito" : "mensaje-error");
}

// Devuelve un texto de error, o "" si todo está bien
function validar(datos) {
    if (datos.nombre === "" || datos.email === "" ||
        datos.servicio === "" || datos.consulta === "") {
        return "Completá todos los campos antes de enviar.";
    }
    if (!datos.email.includes("@") || !datos.email.includes(".")) {
        return "Ingresá un e-mail válido.";
    }
    return "";
}

async function enviarConsulta(datos) {
    // Simula el servidor: le pega a un .json local
    const respuesta = await fetch("respuesta.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
        throw new Error("El servidor respondió con estado " + respuesta.status);
    }
    return await respuesta.json();
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datos = {
        nombre: form.querySelector("#nombre").value.trim(),
        email: form.querySelector("#email").value.trim(),
        servicio: form.querySelector("#servicio").value.trim(),
        consulta: form.querySelector("#consulta").value.trim()
    };

    const error = validar(datos);
    if (error) {
        mostrarMensaje(error, "error");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
        const resultado = await enviarConsulta(datos);
        if (resultado.estado === "ok") {
            mostrarMensaje(resultado.mensaje, "exito");
            form.reset();
        } else {
            mostrarMensaje("No pudimos registrar tu consulta. Probá de nuevo.", "error");
        }
    } catch (err) {
        mostrarMensaje("Error de conexión: " + err.message, "error");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar consulta";
    }
});
