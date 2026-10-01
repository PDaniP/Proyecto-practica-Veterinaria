-- 0. Limpieza de tablas pre-existentes
DROP TABLE IF EXISTS estudios_adjuntos;
DROP TABLE IF EXISTS vacunas;
DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS antecedentes;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS lotes; 
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS mascotas;
DROP TABLE IF EXISTS razas;
DROP TABLE IF EXISTS especies;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
-- 1. Creación de tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
-- 2. Crear la tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Carga de los Roles del Sistema
INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso total al sistema, gestión de usuarios y visualización de estadísticas de negocio.'),
('Veterinario', 'Gestión de historias clínicas de pacientes, consultas médicas y asignación/control de turnos.'),
('Administrativo/Vendedor', 'Control de inventario (stock), registro de ventas, facturación y atención en mostrador.');

-- 4. Carga de Usuarios de Prueba (Administrador general, Usuario: Admin, Contraseña: admin)
INSERT INTO usuarios (nombre, usuario, email, password_hash, id_rol) VALUES 
('Administrador', 'Admin', 'admin@gmail.com', '$2b$10$uH0.iNNUi9hykxRX5Xg1c.BZz.iFarkF9FPCLSVEW8meVjVl4kG82', (SELECT id FROM roles WHERE nombre = 'Administrador')),
('Carlos Gómez', 'CarlitosVet', 'admin@veterinaria.com', 'admin123', (SELECT id FROM roles WHERE nombre = 'Administrador')),
('Dra. Laura Martínez', 'LauritaVet', 'laura.vet@veterinaria.com', '$2y$10$S9bB7X4mF8gH2jK1l3m4n5o6p7q8r9s...', (SELECT id FROM roles WHERE nombre = 'Veterinario')),
('Matias Silva', 'MatiVet', 'ventas@veterinaria.com', '$2y$10$U7vW8x9y0z1a2b3c4d5e6f7g8h9i0j...', (SELECT id FROM roles WHERE nombre = 'Administrativo/Vendedor'));

-- 5. Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    telefono_alternativo VARCHAR(20),
    direccion VARCHAR(255),
    localidad VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 6. Insertamos clientes ficticios
INSERT INTO clientes (nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad) VALUES 
('Consumidor', 'Final', '99999999', 'consumidor@veterinaria.com', '0000000', '0000001', 'Mostrador', 'San Pedro', 'San Pedro'),
('sin dueño', 'sin dueño', '11111111', 'sin.dueño@veterinaria.com', '111111', '111112', 'Mostrador', 'San Pedro', 'San Pedro'),
('Juan', 'Pérez', '38444555', 'juan.perez@gmail.com', '3329-154422', '3329-154423', 'Mitre 1230, San Pedro', 'San Pedro', 'San Pedro'),
('María', 'Rodríguez', '40111222', 'maria.rodriguez@gmail.com', '3329-155566', '3329-155567', 'Pellegrini 450, San Pedro', 'San Pedro', 'San Pedro');

-- 7. Tabla de Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- 8. Tabla de Productos e Insumos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL, 
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(70),
    descripcion TEXT,
    codigo_barras VARCHAR(50) UNIQUE, 
    precio_costo DECIMAL(10, 2) NOT NULL DEFAULT 0.00, 
    precio_venta DECIMAL(10, 2),      
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    venta_al_publico BOOLEAN NOT NULL DEFAULT TRUE, 
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- 9. Tabla de Lotes
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL, 
    stock_inicial INTEGER NOT NULL,       
    stock_actual INTEGER NOT NULL CHECK (stock_actual >= 0),        
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL,  
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_producto_lote FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- 10. Inserción de Categorías (Agregué la categoría de servicios)
INSERT INTO categorias (nombre, descripcion) VALUES 
('Alimentos', 'Comida para perros, gatos y otras mascotas de venta libre.'),
('Accesorios y Juguetes', 'Correas, collares, juguetes, rascadores y elementos de paseo.'),
('Higiene y Cuidado Diario', 'Champús, acondicionadores, cuidado bucal, limpiadores óticos y estética.'),
('Medicamentos y Fármacos', 'Antibióticos, analgésicos y jarabes.'),
('Vacunas', 'Biológicos para planes de vacunación de caninos y felinos.'),
('Descartables e Insumos Médicos', 'Materiales de uso interno en clínica como jeringas, gasas y guantes.'),
('Servicios Clínicos y Estética', 'Consultas médicas, cirugías, internaciones, baños y peluquería.'); -- Corregir para que no se muestre en agregar productos(FRONT)
-- 11. Inserción de Productos de Prueba
INSERT INTO productos (id_categoria, nombre, marca, descripcion, precio_costo, precio_venta, stock_minimo, venta_al_publico) VALUES 
((SELECT id FROM categorias WHERE nombre = 'Alimentos'), 'Alimento Perro Adulto 15kg','DogChow', 'Comida premium para perros medianos', 40000.00, 55000.00, 5, TRUE),
((SELECT id FROM categorias WHERE nombre = 'Accesorios y Juguetes'), 'Correa Extensible Recorzada 5m','Pim', 'Correa color roja para perros hasta 20kg', 5000.00, 8500.00, 3, TRUE),
((SELECT id FROM categorias WHERE nombre = 'Accesorios y Juguetes'), 'Pelota de Goma Irrompible','Argentu', 'Juguete mordillo para cachorros', 1200.00, 2500.00, 5, TRUE),
((SELECT id FROM categorias WHERE nombre = 'Higiene y Cuidado Diario'), 'Champú Neutro para Mascotas 500ml','Loreal', 'Champú apto para el pH de perros y gatos', 1500.00, 3200.00, 4, TRUE),
((SELECT id FROM categorias WHERE nombre = 'Higiene y Cuidado Diario'), 'Limpiador de Oídos Solución Otica','Loreal', 'Limpiador para prevención de otitis', 2200.00, 4500.00, 2, TRUE),
((SELECT id FROM categorias WHERE nombre = 'Vacunas'), 'Vacuna Quíntuple Canina','China', 'Dosis inmunológica para cachorros', 3500.00, NULL, 10, FALSE),
((SELECT id FROM categorias WHERE nombre = 'Medicamentos y Fármacos'), 'Anestésico Inyectable 50ml','China', 'Frasco para cirugías programadas', 12000.00, NULL, 2, FALSE),
((SELECT id FROM categorias WHERE nombre = 'Descartables e Insumos Médicos'), 'Jeringas desc. 3ml (Caja x100)','China', 'Insumo clínico diario para aplicaciones', 4500.00, NULL, 3, FALSE);
-- 12. Inserción de Lotes de Prueba
INSERT INTO lotes (id_producto, codigo_lote, stock_inicial, stock_actual, fecha_vencimiento) VALUES 
((SELECT id FROM productos WHERE nombre = 'Alimento Perro Adulto 15kg' LIMIT 1), 'AL-9982', 20, 20, '2027-06-01'),
((SELECT id FROM productos WHERE nombre = 'Correa Extensible Recorzada 5m' LIMIT 1), 'ACC-001', 15, 15, '2030-01-01'),
((SELECT id FROM productos WHERE nombre = 'Pelota de Goma Irrompible' LIMIT 1), 'ACC-002', 30, 30, '2030-01-01'),
((SELECT id FROM productos WHERE nombre = 'Champú Neutro para Mascotas 500ml' LIMIT 1), 'HIG-551', 10, 10, '2028-03-15'),
((SELECT id FROM productos WHERE nombre = 'Limpiador de Oídos Solución Otica' LIMIT 1), 'HIG-882', 8, 8, '2027-11-20'),
((SELECT id FROM productos WHERE nombre = 'Vacuna Quíntuple Canina' LIMIT 1), 'VAC-26-A', 20, 20, '2026-10-15'), 
((SELECT id FROM productos WHERE nombre = 'Vacuna Quíntuple Canina' LIMIT 1), 'VAC-27-B', 30, 30, '2027-02-28'), 
((SELECT id FROM productos WHERE nombre = 'Anestésico Inyectable 50ml' LIMIT 1), 'MED-7712', 5, 5, '2026-12-05'),
((SELECT id FROM productos WHERE nombre = 'Jeringas desc. 3ml (Caja x100)' LIMIT 1), 'DES-0092', 8, 8, '2029-08-10');
-- 13. Tabla de ventas (CABECERA)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
	metodo_pago VARCHAR(50) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ventas_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- 14. Tabla de Servicios
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_venta NUMERIC(10,2) NOT NULL,
    id_categoria INTEGER REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    activo BOOLEAN DEFAULT true
);
-- 15. Tabla de detalle por venta
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id) NULL,   
    id_servicio INTEGER REFERENCES servicios(id) NULL, 
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    -- Restricción para que sea obligatoriamente uno u otro
    CONSTRAINT chk_producto_o_servicio CHECK (
        (id_producto IS NOT NULL AND id_servicio IS NULL) OR
        (id_producto IS NULL AND id_servicio IS NOT NULL)
    )
);
-- 16. Tabla de Mascotas
CREATE TABLE mascotas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    fecha_nacimiento DATE,
    peso DECIMAL(5,2),                 -- Peso de registro (máximo 999.99 kg) (Permitir actualizar en cualquier momento por la ficha clínica)
    genero VARCHAR(20),
    alergias TEXT,
    observaciones TEXT,
    numero_chip VARCHAR(30) UNIQUE,     -- Número de chip de identificación (opcional)
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_mascota FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- 17. Inserción de Mascotas de Prueba
INSERT INTO mascotas (id_cliente, nombre, especie, raza, fecha_nacimiento, peso, genero, alergias, observaciones, numero_chip) VALUES 
((SELECT id FROM clientes WHERE dni = '38444555' LIMIT 1), 'Roko', 'Perro', 'Perro', '2020-05-15', 20.50, 'Macho', 'Ninguna, es una bestia', 'Le falta un ojo', '012345678912345'),
((SELECT id FROM clientes WHERE dni = '40111222' LIMIT 1), 'Michi', 'Gato', 'Gato', '2022-11-10', 3.80, 'Hembra', 'Alergia a la penicilina', 'Le falta un pie', '123456789012345');
-- 18. Tabla de Antecedentes Médicos (patologías previas, cirugías, condiciones crónicas)
CREATE TABLE antecedentes (
    id SERIAL PRIMARY KEY,
    id_mascota INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'Quirúrgico', 'Enfermedad Crónica', 'Hereditario', 'Traumatismo'
    descripcion TEXT NOT NULL,
    fecha_diagnostico DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_antecedente_mascota FOREIGN KEY (id_mascota) 
        REFERENCES mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- 19. Tabla de Consultas Médicas
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    id_mascota INTEGER NOT NULL, -- Referencia a la mascota que se atiende
    id_veterinario INTEGER NOT NULL, -- Referencia a usuarios (con rol Veterinario)
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NOT NULL,
    peso_actual DECIMAL(5,2), -- Peso tomado en la sesión (para la evolución del paciente) - Podría también enviarse a la tabla de mascotas para actualizar el peso registrado
    temperatura DECIMAL(4,1), -- Ej: 38.5 °C
    diagnostico TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_consulta_mascota FOREIGN KEY (id_mascota) 
        REFERENCES mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_consulta_veterinario FOREIGN KEY (id_veterinario) 
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- 20. Tabla de Vacunas y Desparasitaciones aplicadas
CREATE TABLE vacunas (
    id SERIAL PRIMARY KEY,
    id_mascota INTEGER NOT NULL, -- Referencia a la mascota a la que se le aplica la vacuna
    id_veterinario INTEGER NOT NULL, -- Referencia a usuarios (con rol Veterinario)
    id_lote INTEGER, -- Opcional: vincula directamente con el lote de stock que usaste / Llamar desde la tabla de lotes para control de vencimientos y trazabilidad
    nombre_vacuna VARCHAR(100) NOT NULL, -- Ej: 'Quíntuple Canina', 'Antirrábica'
    fecha_aplicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    proxima_dosis DATE, -- Clave para alertas y recordatorios
    observaciones TEXT,
    CONSTRAINT fk_vacuna_mascota FOREIGN KEY (id_mascota) 
        REFERENCES mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_vacuna_veterinario FOREIGN KEY (id_veterinario) 
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_vacuna_lote FOREIGN KEY (id_lote)  -- Si la vacuna se aplicó desde un lote de stock, se registra el lote para control de vencimientos y trazabilidad
        REFERENCES lotes(id) ON DELETE SET NULL ON UPDATE CASCADE
);
-- 21. Tabla de Estudios Adjuntos (imágenes, radiografías, análisis de laboratorio, etc.) - NO CONTEMPLADA EN EL SPRINT 5, PERO SE DEJA LA ESTRUCTURA PARA FUTURO DESARROLLO
CREATE TABLE estudios_adjuntos (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL, -- Nombre descriptivo o de subida
    url_archivo VARCHAR(255) NOT NULL,    -- Ej: '/uploads/consultas/rx-torax-123.jpg'
    tipo_archivo VARCHAR(50),             -- Ej: 'image/jpeg', 'application/pdf' -- Se maneja desde el front con el FormData y en el back se usa el middleware multer para validar el tipo de archivo
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estudio_consulta FOREIGN KEY (id_consulta) 
        REFERENCES consultas(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- 22. Antecedentes de prueba
INSERT INTO antecedentes (id_mascota, tipo, descripcion, fecha_diagnostico) VALUES
((SELECT id FROM mascotas WHERE nombre = 'Roko' LIMIT 1), 'Traumatismo', 'Pérdida de ojo izquierdo por accidente previo.', '2023-04-10'),
((SELECT id FROM mascotas WHERE nombre = 'Michi' LIMIT 1), 'Alergia', 'Reacción alérgica severa a betalactámicos (Penicilina).', '2024-01-15');
-- 23. Consultas de prueba
INSERT INTO consultas (id_mascota, id_veterinario, motivo, peso_actual, temperatura, diagnostico, tratamiento, observaciones) VALUES
(
    (SELECT id FROM mascotas WHERE nombre = 'Roko' LIMIT 1),
    (SELECT id FROM usuarios WHERE usuario = 'LauritaVet' LIMIT 1),
    'Control anual y renguera en pata trasera derecha.',
    20.80,
    38.6,
    'Contractura muscular leve sin compromiso óseo.',
    'Reposo relativo por 5 días y Meloxicam cada 24hs.',
    'Evoluciona favorablemente del peso.'
),
(
    (SELECT id FROM mascotas WHERE nombre = 'Michi' LIMIT 1),
    (SELECT id FROM usuarios WHERE usuario = 'LauritaVet' LIMIT 1),
    'Falta de apetito y decaimiento general.',
    3.65,
    39.2,
    'Gastroenteritis leve por ingesta de cuerpo extraño.',
    'Dieta húmeda gastrointestinal y protector gástrico.',
    'Controlar hidratación en 48hs.'
);
-- 24. Vacunas de prueba (usando los lotes existentes de tu stock)
INSERT INTO vacunas (id_mascota, id_veterinario, id_lote, nombre_vacuna, fecha_aplicacion, proxima_dosis, observaciones) VALUES
(
    (SELECT id FROM mascotas WHERE nombre = 'Roko' LIMIT 1),
    (SELECT id FROM usuarios WHERE usuario = 'LauritaVet' LIMIT 1),
    (SELECT id FROM lotes WHERE codigo_lote = 'VAC-26-A' LIMIT 1),
    'Vacuna Quíntuple Canina',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'Toleró bien la aplicación sin reacciones adversas.'
),
(
    (SELECT id FROM mascotas WHERE nombre = 'Michi' LIMIT 1),
    (SELECT id FROM usuarios WHERE usuario = 'LauritaVet' LIMIT 1),
    NULL, -- Aplicada externamente en otra clínica
    'Triple Felina',
    CURRENT_DATE - INTERVAL '6 month',
    CURRENT_DATE + INTERVAL '6 month',
    'Refuerzo colocado según libreta sanitaria previa.'
);
-- 25. Creación de tablas de Especies y Razas
CREATE TABLE especies (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE razas (
    id SERIAL PRIMARY KEY,
    id_especie INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT fk_raza_especie FOREIGN KEY (id_especie) 
        REFERENCES especies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_especie_raza UNIQUE (id_especie, nombre)
);

-- 26. Inserción de 10 Especies y 10 Razas comunes por especie principal

-- 26.1 Carga de 10 Especies comunes
INSERT INTO especies (nombre, descripcion) VALUES
('Perro', 'Canino doméstico'),
('Gato', 'Felino doméstico'),
('Conejo', 'Lagomorfo doméstico'),
('Hurón', 'Mustélido doméstico'),
('Cobayo', 'Pequeño roedor doméstico'),
('Hámster', 'Pequeño roedor de compañía'),
('Ave', 'Aves de jaula o compañía (loros, canarios, etc.)'),
('Tortuga', 'Reptil quelonio terrestre o acuático'),
('Erizo', 'Erizo africano pigmeo'),
('Chinchilla', 'Roedor sudamericano de pelo denso');

-- 26.2 Carga de 10 Razas para Perro
INSERT INTO razas (id_especie, nombre) VALUES
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Mestizo / Criollo'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Labrador Retriever'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Golden Retriever'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Bulldog Francés'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Pastor Alemán'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Caniche / Poodle'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Beagle'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Rottweiler'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Boxer'),
((SELECT id FROM especies WHERE nombre = 'Perro'), 'Yorkshire Terrier');

-- 26.3 Carga de 10 Razas para Gato
INSERT INTO razas (id_especie, nombre) VALUES
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Común Europeo / Mestizo'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Siamés'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Persa'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Maine Coon'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Bengalí'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Ragdoll'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Sphynx / Esfinge'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'British Shorthair'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Azul Ruso'),
((SELECT id FROM especies WHERE nombre = 'Gato'), 'Angora Turco');

-- 26.4 Razas/Tipos representativos para las demás especies
INSERT INTO razas (id_especie, nombre) VALUES
((SELECT id FROM especies WHERE nombre = 'Conejo'), 'Cabeza de León'),
((SELECT id FROM especies WHERE nombre = 'Conejo'), 'Belier / Mini Lop'),
((SELECT id FROM especies WHERE nombre = 'Hurón'), 'Hurón Estándar'),
((SELECT id FROM especies WHERE nombre = 'Cobayo'), 'Cobayo de Pelo Corto (Americano)'),
((SELECT id FROM especies WHERE nombre = 'Cobayo'), 'Cobayo Abisinio'),
((SELECT id FROM especies WHERE nombre = 'Hámster'), 'Hámster Sirio / Dorado'),
((SELECT id FROM especies WHERE nombre = 'Hámster'), 'Hámster Ruso'),
((SELECT id FROM especies WHERE nombre = 'Ave'), 'Canario'),
((SELECT id FROM especies WHERE nombre = 'Ave'), 'Periquito Australiano'),
((SELECT id FROM especies WHERE nombre = 'Ave'), 'Ninfa / Carolina'),
((SELECT id FROM especies WHERE nombre = 'Tortuga'), 'Tortuga Terrestre Argentina'),
((SELECT id FROM especies WHERE nombre = 'Tortuga'), 'Tortuga de Orejas Rojas'),
((SELECT id FROM especies WHERE nombre = 'Erizo'), 'Erizo Africano Pigmeo'),
((SELECT id FROM especies WHERE nombre = 'Chinchilla'), 'Chinchilla Lanígera Estándar');