CREATE TABLE api_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table profesores (
    id serial primary key,
    nombre varchar(100) not null,
    especialidad varchar(100)
);

create table materias (
    id serial primary key,
    nombre varchar(100) not null,
    id_profesor int references profesores(id) on delete set null
);

create table estudiantes (
    id serial primary key,
    nombre varchar(100) not null,
    email varchar(100) unique not null
);

create table clases (
    id serial primary key,
    id_materia int references materias(id) on delete cascade,
    fecha date default current_date,
    hora_inicio time
);

create table asistencias (
    id serial primary key,
    id_estudiante int references estudiantes(id) on delete cascade,
    id_clase int references clases(id) on delete cascade,
    estado varchar(20) check (estado in ('presente', 'ausente', 'tardia')),
    observaciones text
);



-- PROFESORES
INSERT INTO profesores (nombre, especialidad) VALUES
('Carlos Méndez', 'Matemáticas'),
('Laura Gómez', 'Física'),
('Andrés Vargas', 'Historia'),
('María Rodríguez', 'Lengua'),
('Sofía Herrera', 'Química');

-- MATERIAS
INSERT INTO materias (nombre, id_profesor) VALUES
('Álgebra', 1),
('Mecánica', 2),
('Historia Universal', 3),
('Literatura', 4),
('Química Orgánica', 5);

-- ESTUDIANTES
INSERT INTO estudiantes (nombre, email) VALUES
('Juan Pérez', 'juan.perez@example.com'),
('Ana López', 'ana.lopez@example.com'),
('Luis Fernández', 'luis.fernandez@example.com'),
('Carla Sánchez', 'carla.sanchez@example.com'),
('Diego Morales', 'diego.morales@example.com');

-- CLASES
INSERT INTO clases (id_materia, fecha, hora_inicio) VALUES
(1, '2026-04-20', '08:00:00'),
(2, '2026-04-21', '09:00:00'),
(3, '2026-04-22', '10:00:00'),
(4, '2026-04-23', '11:00:00'),
(5, '2026-04-24', '12:00:00');

-- ASISTENCIAS
INSERT INTO asistencias (id_estudiante, id_clase, estado, observaciones) VALUES
(1, 1, 'presente', 'Llegó puntual'),
(2, 2, 'ausente', 'Falta sin justificar'),
(3, 3, 'tardia', 'Llegó 10 minutos tarde'),
(4, 4, 'presente', 'Participación activa'),
(5, 5, 'presente', 'Sin observaciones');