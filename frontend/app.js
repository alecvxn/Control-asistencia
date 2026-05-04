const API = "http://localhost:3000";

// ================= ESTUDIANTES =================

async function cargarEstudiantes() {
    const res = await fetch(`${API}/estudiantes`);
    const data = await res.json();

    const tabla = document.getElementById("tablaEstudiantes");
    tabla.innerHTML = "";

    data.forEach(e => {
        tabla.innerHTML += `
        <tr>
            <td>${e.id}</td>
            <td>${e.nombre}</td>
            <td>${e.email}</td>
            <td>
                <button onclick="editarEst(${e.id}, '${e.nombre}', '${e.email}')">✏️</button>
                <button onclick="eliminarEst(${e.id})">❌</button>
            </td>
        </tr>`;
    });
}

async function crearEstudiante() {
    const nombre = document.getElementById("nombreEst").value;
    const email = emailEst.value;

    await fetch(`${API}/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email })
    });

    cargarEstudiantes();
}

async function eliminarEst(id) {
    await fetch(`${API}/estudiantes/${id}`, { method: "DELETE" });
    cargarEstudiantes();
}

async function editarEst(id, nombreActual, emailActual) {
    const nombre = prompt("Nuevo nombre:", nombreActual);
    const email = prompt("Nuevo email:", emailActual);

    await fetch(`${API}/estudiantes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email })
    });

    cargarEstudiantes();
}


// ================= PROFESORES =================

async function cargarProfesores() {
    const res = await fetch(`${API}/profesores`);
    const data = await res.json();

    const tabla = document.getElementById("tablaProfesores");
    tabla.innerHTML = "";

    data.forEach(p => {
        tabla.innerHTML += `
        <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>
                <button onclick="editarProf(${p.id}, '${p.nombre}')">✏️</button>
                <button onclick="eliminarProf(${p.id})">❌</button>
            </td>
        </tr>`;
    });
}

async function crearProfesor() {
    const nombre = nombreProf.value;

    await fetch(`${API}/profesores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    });

    cargarProfesores();
}

async function eliminarProf(id) {
    await fetch(`${API}/profesores/${id}`, { method: "DELETE" });
    cargarProfesores();
}

async function editarProf(id, nombreActual) {
    const nombre = prompt("Nuevo nombre:", nombreActual);

    await fetch(`${API}/profesores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    });

    cargarProfesores();
}


// ================= MATERIAS =================

async function cargarMaterias() {
    const res = await fetch(`${API}/materias`);
    const data = await res.json();

    const tabla = document.getElementById("tablaMaterias");
    tabla.innerHTML = "";

    data.forEach(m => {
        tabla.innerHTML += `
        <tr>
            <td>${m.id}</td>
            <td>${m.nombre}</td>
            <td>${m.id_profesor}</td>
            <td>
                <button onclick="eliminarMat(${m.id})">❌</button>
            </td>
        </tr>`;
    });
}

async function crearMateria() {
    const nombre = nombreMat.value;
    const id_profesor = profMat.value;

    await fetch(`${API}/materias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, id_profesor })
    });

    cargarMaterias();
}

async function eliminarMat(id) {
    await fetch(`${API}/materias/${id}`, { method: "DELETE" });
    cargarMaterias();
}

async function cargarClases() {
    const res = await fetch(`${API}/clases`);
    const data = await res.json();

    const tabla = document.getElementById("tablaClases");
    tabla.innerHTML = "";

    data.forEach(c => {
        tabla.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.id_materia}</td>
            <td>${c.fecha}</td>
            <td>
                <button onclick="eliminarClase(${c.id})">❌</button>
            </td>
        </tr>`;
    });
}

async function crearClase() {
    const id_materia = materiaClase.value;
    const fecha = fechaClase.value;

    await fetch(`${API}/clases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_materia, fecha })
    });

    cargarClases(); 
}

async function eliminarClase(id) {
    await fetch(`${API}/clases/${id}`, { method: "DELETE" });
    cargarClases();
}

async function cargarAsistencias() {
    const res = await fetch(`${API}/asistencias`);
    const data = await res.json();

    const tabla = document.getElementById("tablaAsistencias");
    tabla.innerHTML = "";

    data.forEach(a => {
        tabla.innerHTML += `
        <tr>
            <td>${a.id}</td>
            <td>${a.id_estudiante}</td>
            <td>${a.id_clase}</td>
            <td>${a.presente}</td>
            <td>
                <button onclick="eliminarAsis(${a.id})">❌</button>
            </td>
        </tr>`;
    });
}

async function crearAsistencia() {
    const id_estudiante = estAsis.value;
    const id_clase = claseAsis.value;
    const presente = presenteAsis.value === "true";

    await fetch(`${API}/asistencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante, id_clase, presente })
    });

    cargarAsistencias(); 
}

async function eliminarAsis(id) {
    await fetch(`${API}/asistencias/${id}`, { method: "DELETE" });
    cargarAsistencias();
}
// ================= INICIO =================

cargarEstudiantes();
cargarProfesores();
cargarMaterias();
cargarClases();
cargarAsistencias();