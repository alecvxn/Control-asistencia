data.forEach(colegio => {
        tabla.innerHTML += `
        <tr>
            <td>${colegio.id_colegio}</td>
            <td>${colegio.nombre}</td>
            <td>${colegio.direccion}</td>
            <td>${colegio.telefono}</td>
            <td>
                <button class="btn btn-warning btn-sm">Eliminar</button>
            </td>
        <tr>
        `;
    });