require('dotenv').config(); // Carga de variables de entorno desde .env
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


//--- REGISTRO

app.post('/auth/registro', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Generación de hash para evitar guardar contraseñas en texto plano
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await pool.query(
            'INSERT INTO api_users (email, password) VALUES ($1, $2) RETURNING id, email, creation_date',
            [email, hashedPassword]
        );
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar: " + error.message });
    }
});

//LOGIN
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM api_users WHERE email =$1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Credenciales incorrectas." });
        }
        const usuario = result.rows[0];
        // Comparación segura del password enviado vs el hash almacenado
        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        // Creación del token con tiempo de expiración de 2 horas
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//MIDDLEWARE DE AUTENTICACIÓN
const verificarToken = (req, res, next) => {
    // Extracción del token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Se requiere tokende seguridad." });
    }
    try {
        // Validación del token con la firma secreta
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado;
        next(); // Autoriza el paso al siguiente controlador
    } catch (error) {
        res.status(403).json({ error: "Token inválido o expirado." });
    }
};

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
app.post('/estudiantes', verificarToken, async (req, res) => {
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
app.delete('/estudiantes/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
        res.json({ mensaje: "Estudiante eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Actualizar un estudiante
app.put('/estudiantes/:id', verificarToken, async (req, res) => {
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
app.post('/materias', verificarToken, async (req, res) => {
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
app.delete('/materias/:id', verificarToken, async (req, res) => {
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

app.post('/profesores', verificarToken, async (req, res) => {
    const { nombre } = req.body;
    const result = await pool.query(
        'INSERT INTO profesores (nombre) VALUES ($1) RETURNING *',
        [nombre]
    );
    res.json(result.rows[0]);
});

app.put('/profesores/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    const result = await pool.query(
        'UPDATE profesores SET nombre=$1 WHERE id=$2 RETURNING *',
        [nombre, id]
    );

    res.json(result.rows[0]);
});

app.delete('/profesores/:id', verificarToken, async (req, res) => {
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
app.post('/clases', verificarToken, async (req, res) => {
    const { id_materia, fecha } = req.body;

    const result = await pool.query(
        'INSERT INTO clases (id_materia, fecha) VALUES ($1, $2) RETURNING *',
        [id_materia, fecha]
    );

    res.json(result.rows[0]);
});

// DELETE
app.delete('/clases/:id', verificarToken, async (req, res) => {
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
app.post('/asistencias', verificarToken, async (req, res) => {
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
app.delete('/asistencias/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM asistencias WHERE id=$1', [id]);
    res.json({ mensaje: "Asistencia eliminada" });
});