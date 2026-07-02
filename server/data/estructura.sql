-- 0. Limpieza de tablas pre-existentes
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS lotes; 
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS clientes;

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
    id_rol INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Carga de los Roles del Sistema
INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso total al sistema, gestión de usuarios y visualización de estadísticas de negocio.'),
('Veterinario', 'Gestión de historias clínicas de pacientes, consultas médicas y asignación/control de turnos.'),
('Administrativo/Vendedor', 'Control de inventario (stock), registro de ventas, facturación y atención en mostrador.');

-- 4. Carga de Usuarios de Prueba
INSERT INTO usuarios (nombre, usuario, email, password_hash, id_rol) VALUES 
('Carlos Gómez', 'CarlitosVet', 'admin@veterinaria.com', 'admin123', (SELECT id FROM roles WHERE nombre = 'Administrador')),
('Dra. Laura Martínez', 'LauritaVet', 'laura.vet@veterinaria.com', '$2y$10$S9bB7X4mF8gH2jK1l3m4n5o6p7q8r9s...', (SELECT id FROM roles WHERE nombre = 'Veterinario')),
('Matias Silva', 'MatiVet', 'ventas@veterinaria.com', '$2y$10$U7vW8x9y0z1a2b3c4d5e6f7g8h9i0j...', (SELECT id FROM roles WHERE nombre = 'Administrativo/Vendedor')),
('Matias Picasso','Matias', 'matias.picasso@veterinaria.com','pikachu17', (SELECT id FROM roles WHERE nombre = 'Administrador'));

-- 5. Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insertamos clientes ficticios
INSERT INTO clientes (nombre, apellido, dni, telefono, direccion) VALUES 
('Juan', 'Pérez', '38444555', '3329-154422', 'Mitre 1230, San Pedro'),
('María', 'Rodríguez', '40111222', '3329-155566', 'Pellegrini 450, San Pedro');

-- 7. Tabla de Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- 8. Tabla de Productos e Insumos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL, 
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(70),
    descripcion TEXT,
    codigo_barras VARCHAR(50) UNIQUE, 
    precio_costo DECIMAL(10, 2) NOT NULL DEFAULT 0.00, 
    precio_venta DECIMAL(10, 2),      
    stock_minimo INT NOT NULL DEFAULT 5,
    venta_al_publico BOOLEAN NOT NULL DEFAULT TRUE, 
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 9. Tabla de Lotes
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL, 
    stock_inicial INT NOT NULL,       
    stock_actual INT NOT NULL Check (stock_actual >= 0),        
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
    id_usuario INT NOT NULL,
    id_cliente INT NOT NULL,
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
-- 2/7/2026