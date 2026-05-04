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




// Paso 4
require('dotenv').config(); // Carga de variables de entorno desde .env 
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express(); 
app.use(express.json()); 
app.use(cors());


// Paso 5
const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT
});


// Paso 6
const verificarToken = (req, res, next) => {
    // Extracción del token del encabezado Authorization 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Se requiere token de seguridad." });
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


// Paso 7
app.post('/auth/registrar', async (req, res) => { 
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


// Paso 8
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM api_users WHERE email = $1', [email]);
 
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
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Paso 9
// Ruta pública: No requiere token
app.get('/tareas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tareas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Ruta protegida: Se añade el middleware verificarToken como segundo parámetro
app.post('/tareas', verificarToken, async (req, res) => {
    try {
        const { titulo, finalizada } = req.body;
        const result = await pool.query(
            'INSERT INTO tareas (titulo, finalizada) VALUES ($1, $2) RETURNING *', [titulo, finalizada]
        );
        res.status(201).json({ mensaje: 'Tarea creada', tarea: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Paso 10
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor seguro funcionando en: http://localhost:${PORT}`);
});