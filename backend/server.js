const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'asistencia_bd',
    password: '12345678',
    port: 5432
});

// --- RUTA DE INICIO ---
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Asistencia funcionando correctamente' });
});

// --- ENTIDAD: ESTUDIANTES ---

// GET: Obtener todos los estudiantes
app.get('/estudiantes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estudiantes'); //
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET por ID: Obtener un estudiante específico
app.get('/estudiantes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM estudiantes WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear un nuevo estudiante
app.post('/estudiantes', async (req, res) => {
    try {
        const { nombre, email } = req.body; // Campos según
        const result = await pool.query(
            'INSERT INTO estudiantes (nombre, email) VALUES ($1, $2) RETURNING *',
            [nombre, email]
        );
        res.status(201).json({ mensaje: "Estudiante creado", estudiante: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar un estudiante
app.delete('/estudiantes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
        res.json({ mensaje: "Estudiante eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar un estudiante
app.put('/estudiantes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email } = req.body;

        const result = await pool.query(
            'UPDATE estudiantes SET nombre = $1, email = $2 WHERE id = $3 RETURNING *',
            [nombre, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        }

        res.json({ mensaje: "Estudiante actualizado", estudiante: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ENTIDAD: MATERIAS ---

// GET: Obtener todas las materias
app.get('/materias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM materias'); //
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear una nueva materia
app.post('/materias', async (req, res) => {
    try {
        const { nombre, id_profesor } = req.body; // Campos según
        const result = await pool.query(
            'INSERT INTO materias (nombre, id_profesor) VALUES ($1, $2) RETURNING *',
            [nombre, id_profesor]
        );
        res.status(201).json({ mensaje: "Materia creada", materia: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar una materia
app.delete('/materias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM materias WHERE id = $1', [id]);
        res.json({ mensaje: "Materia eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});

// PROFESORES
app.get('/profesores', async (req, res) => {
    const result = await pool.query('SELECT * FROM profesores');
    res.json(result.rows);
});

app.post('/profesores', async (req, res) => {
    const { nombre } = req.body;
    const result = await pool.query(
        'INSERT INTO profesores (nombre) VALUES ($1) RETURNING *',
        [nombre]
    );
    res.json(result.rows[0]);
});

app.put('/profesores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    const result = await pool.query(
        'UPDATE profesores SET nombre=$1 WHERE id=$2 RETURNING *',
        [nombre, id]
    );

    res.json(result.rows[0]);
});

app.delete('/profesores/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM profesores WHERE id=$1', [id]);
    res.json({ mensaje: "Profesor eliminado" });
});


// ================= CLASES =================

// GET
app.get('/clases', async (req, res) => {
    const result = await pool.query('SELECT * FROM clases');
    res.json(result.rows);
});

// POST
app.post('/clases', async (req, res) => {
    const { id_materia, fecha } = req.body;

    const result = await pool.query(
        'INSERT INTO clases (id_materia, fecha) VALUES ($1, $2) RETURNING *',
        [id_materia, fecha]
    );

    res.json(result.rows[0]);
});

// DELETE
app.delete('/clases/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM clases WHERE id=$1', [id]);
    res.json({ mensaje: "Clase eliminada" });
});

// ================= ASISTENCIAS =================

// GET
app.get('/asistencias', async (req, res) => {
    const result = await pool.query('SELECT * FROM asistencias');
    res.json(result.rows);
});

// POST
app.post('/asistencias', async (req, res) => {
    try {
        const { id_estudiante, id_clase, estado } = req.body;

        const result = await pool.query(
            'INSERT INTO asistencias (id_estudiante, id_clase, estado) VALUES ($1, $2, $3) RETURNING *',
            [id_estudiante, id_clase, estado]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/asistencias/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM asistencias WHERE id=$1', [id]);
    res.json({ mensaje: "Asistencia eliminada" });
});