# Proyecto Práctica Veterinaria

Documentación general del proyecto **Proyecto-practica-Veterinaria**, rama `desarrollo`.

El proyecto está dividido en dos carpetas principales:

```txt
Proyecto-practica-Veterinaria/
├── client/   # Frontend React + Vite
└── server/   # Backend Node.js + Express + PostgreSQL
```

La aplicación está pensada como un sistema de gestión para una veterinaria. Actualmente incluye autenticación, navegación protegida, módulo comercial de productos, categorías y lotes, además de secciones preparadas para ventas, clientes, mascotas e historias clínicas.

---

## Tabla de contenidos

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura general](#estructura-general)
- [Instalación del proyecto](#instalación-del-proyecto)
- [Variables de entorno del backend](#variables-de-entorno-del-backend)
- [Ejecución en desarrollo](#ejecución-en-desarrollo)
- [Backend - Server](#backend---server)
- [Frontend - Client](#frontend---client)
- [Rutas de la API](#rutas-de-la-api)
- [Rutas del frontend](#rutas-del-frontend)
- [Flujo de autenticación](#flujo-de-autenticación)
- [Ejemplos de uso con Axios](#ejemplos-de-uso-con-axios)
- [Base de datos](#base-de-datos)
- [Observaciones técnicas](#observaciones-técnicas)
- [Mejoras recomendadas](#mejoras-recomendadas)

---

# Tecnologías utilizadas

## Backend

- Node.js
- Express
- PostgreSQL
- pg
- dotenv
- cors
- cookie-parser
- jsonwebtoken
- nodemon

## Frontend

- React
- Vite
- React Router DOM
- Axios
- JWT Decode
- CSS modular por componentes / estilos inyectados desde componentes

---

# Estructura general

```txt
Proyecto-practica-Veterinaria/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── FormularioEdicionProducto.jsx
│   │   │   ├── FormularioLote.jsx
│   │   │   ├── FormularioProductos.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── NuevaCategoria.jsx
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.css
│   │   │   │   └── Login.jsx
│   │   │   ├── clinica/
│   │   │   │   ├── Mascotas.jsx
│   │   │   │   └── historiasClinicas.jsx
│   │   │   ├── comercial/
│   │   │   │   ├── Clientes.jsx
│   │   │   │   ├── Productos.jsx
│   │   │   │   └── Ventas.jsx
│   │   │   └── home.jsx
│   │   ├── service/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── data/
    ├── src/
    │   ├── config/
    │   │   └── db.js
    │   ├── controllers/
    │   │   ├── product.controller.js
    │   │   └── user.controller.js
    │   ├── middlewares/
    │   ├── models/
    │   │   ├── product.model.js
    │   │   └── user.models.js
    │   ├── routes/
    │   │   ├── product.routes.js
    │   │   └── user.routes.js
    │   └── index.js
    └── package.json
```

---

# Instalación del proyecto

Clonar el repositorio:

```bash
git clone https://github.com/Rhagis/Proyecto-practica-Veterinaria.git
cd Proyecto-practica-Veterinaria
```

Cambiar a la rama de desarrollo:

```bash
git checkout desarrollo
```

Instalar dependencias del backend:

```bash
cd server
npm install
```

Instalar dependencias del frontend:

```bash
cd ../client
npm install
```

---

# Variables de entorno del backend

Dentro de la carpeta `server`, crear un archivo `.env`:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=nombre_de_tu_base_de_datos
DB_PASSWORD=tu_password
DB_PORT=5432

JWT_SECRET=tu_clave_secreta_para_jwt
```

> `JWT_SECRET` es obligatorio para que el backend pueda firmar y verificar los tokens JWT.

---

# Ejecución en desarrollo

## Backend

Desde la carpeta `server`:

```bash
npm run dev
```

Servidor disponible en:

```txt
http://localhost:3000
```

## Frontend

Desde la carpeta `client`:

```bash
npm run dev
```

Frontend disponible normalmente en:

```txt
http://localhost:5173
```

---

# Backend - Server

El backend está desarrollado con **Express** y se conecta a **PostgreSQL** usando `pg`.

Archivo principal:

```txt
server/src/index.js
```

En este archivo se configuran:

- Express.
- CORS para permitir peticiones desde `http://localhost:5173`.
- Lectura de JSON con `express.json()`.
- Cookies con `cookie-parser`.
- Rutas de usuarios bajo `/users`.
- Rutas de productos bajo `/products`.

```js
app.use('/users', userRoutes)
app.use('/products', productRoutes)
```

## Configuración CORS

El backend acepta peticiones desde el frontend de Vite:

```js
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
```

Esto permite trabajar con cookies desde Axios usando:

```js
withCredentials: true
```

---

# Frontend - Client

El frontend está desarrollado con **React + Vite**.

Archivo principal:

```txt
client/src/App.jsx
```

En `App.jsx` se definen las rutas principales de la aplicación usando `react-router-dom`.

## Componentes principales

### `Navbar.jsx`

Barra de navegación principal. Muestra los enlaces cuando existe un usuario autenticado.

Enlaces definidos:

- Productos
- Ventas
- Clientes
- Mascotas
- Historias Clínicas

También muestra:

- Usuario actual.
- Botón de cerrar sesión.

La barra valida la sesión consultando:

```txt
GET http://localhost:3000/users/comprobar
```

Y cierra sesión usando:

```txt
POST http://localhost:3000/users/logout
```

---

### `FormularioProductos.jsx`

Formulario para registrar productos.

Funciones principales:

- Carga categorías desde el backend.
- Valida campos obligatorios.
- Convierte valores numéricos antes de enviar.
- Envía el producto al backend.

Endpoint usado para cargar categorías:

```txt
GET /products/product/categorias
```

Endpoint usado para registrar productos:

```txt
POST /products/product/add
```

Campos manejados:

- `id_categoria`
- `nombre`
- `marca`
- `descripcion`
- `codigo_barras`
- `precio_costo`
- `precio_venta`
- `stock_minimo`
- `es_publico`
- `venta_al_publico`
- `fecha_vencimiento`
- `proveedor`

---

### `NuevaCategoria.jsx`

Componente usado dentro del formulario de productos para crear una nueva categoría sin salir del formulario.

Endpoint usado:

```txt
POST /products/product/addcategoria
```

Campos enviados:

- `nombre`
- `descripcion`

---

### `FormularioLote.jsx`

Formulario para registrar lotes de productos.

Endpoint usado:

```txt
POST /products/product/addlote
```

Campos manejados:

- `id_producto`
- `codigo_lote`
- `stock_inicial`
- `stock_actual`
- `fecha_vencimiento`
- `activo`

> Observación: en el frontend aparece `idProducto`, pero el backend espera `id_producto`. Conviene unificar ambos nombres para evitar errores al registrar lotes.

---

### `FormularioEdicionProducto.jsx`

Formulario visual para editar información comercial de un producto.

Campos principales:

- `precio_compra`
- `precio_venta`
- `stock_minimo`

> Observación: actualmente el componente valida y muestra un `alert`, pero no se ve una petición Axios conectada al endpoint de edición. Para conectar la edición real debería usar `PATCH /products/product/update/:id`.

---

### `Modal.jsx`

Componente reutilizable para mostrar formularios dentro de una ventana modal.

Se usa principalmente desde la página de productos para abrir:

- Alta de producto.
- Edición de producto.
- Alta de lote.

---

# Rutas de la API

URL base:

```txt
http://localhost:3000
```

---

## Usuarios

Prefijo:

```txt
/users
```

| Método | Ruta | Descripción | Requiere cookie |
|---|---|---|---|
| POST | `/users/login` | Inicia sesión y genera cookie con JWT | No |
| POST | `/users/logout` | Cierra sesión eliminando la cookie | Sí |
| GET | `/users/comprobar` | Comprueba si el token es válido | Sí |

---

### POST `/users/login`

Inicia sesión con usuario y contraseña.

#### Body esperado

```json
{
  "usuario": "admin",
  "password": "1234"
}
```

#### Respuesta exitosa

```json
{
  "message": "Logueado Correctamente",
  "user": {
    "id": 1,
    "usuario": "admin",
    "rol": "admin"
  }
}
```

Además, el backend crea una cookie llamada `token`.

#### Errores posibles

```json
{
  "message": "Username and password are required"
}
```

```json
{
  "message": "Invalid username or password"
}
```

---

### POST `/users/logout`

Cierra sesión eliminando la cookie `token`.

#### Respuesta exitosa

```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

### GET `/users/comprobar`

Verifica si la cookie `token` contiene un JWT válido.

#### Respuesta exitosa

```json
{
  "valid": true,
  "message": "Token válido",
  "user": {
    "id": 1,
    "usuario": "admin",
    "rol": "admin",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```

#### Error sin token

```json
{
  "message": "Acceso denegado"
}
```

#### Error con token inválido

```json
{
  "message": "Token inválido"
}
```

---

## Productos

Prefijo:

```txt
/products
```

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products/` | Lista todos los productos |
| GET | `/products/product/categorias` | Lista todas las categorías |
| GET | `/products/product/:id` | Obtiene un producto por ID |
| POST | `/products/product/add` | Registra un nuevo producto |
| POST | `/products/product/addlote` | Registra un lote de producto |
| POST | `/products/product/addcategoria` | Registra una nueva categoría |
| PATCH | `/products/product/update/:id` | Edita precios y stock mínimo de un producto |
| DELETE | `/products/product/delete/:id` | Elimina un producto |

---

### GET `/products/`

Lista todos los productos ordenados por ID ascendente.

#### Respuesta esperada

```json
[
  {
    "id": 1,
    "id_categoria": 2,
    "nombre": "Alimento balanceado",
    "marca": "Marca X",
    "descripcion": "Alimento para perros adultos",
    "codigo_barras": "779000000001",
    "precio_costo": 5000,
    "precio_venta": 7500,
    "stock_minimo": 5,
    "venta_al_publico": true
  }
]
```

---

### GET `/products/product/categorias`

Lista todas las categorías.

#### Respuesta esperada

```json
[
  {
    "id": 1,
    "nombre": "Alimentos",
    "descripcion": "Productos alimenticios para mascotas"
  }
]
```

---

### GET `/products/product/:id`

Obtiene un producto específico por ID.

#### Ejemplo

```txt
GET /products/product/1
```

#### Respuesta esperada

```json
[
  {
    "id": 1,
    "nombre": "Alimento balanceado",
    "precio_costo": 5000,
    "precio_venta": 7500
  }
]
```

---

### POST `/products/product/add`

Registra un nuevo producto.

#### Body esperado

```json
{
  "id_categoria": 1,
  "nombre": "Alimento balanceado",
  "marca": "Marca X",
  "descripcion": "Alimento para perros adultos",
  "codigo_barras": 779000000001,
  "precio_costo": 5000,
  "precio_venta": 7500,
  "stock_minimo": 5,
  "venta_al_publico": true
}
```

#### Respuesta exitosa

```json
{
  "message": "producto añadido con exito"
}
```

#### Error por campos vacíos

```json
{
  "message": "Error al añadir, existen campos vacios"
}
```

> Observación importante: el backend valida `venta_al_publico` usando `if (!venta_al_publico)`. Eso puede generar error cuando el valor sea `false`, aunque sea un boolean válido. Conviene validar con `venta_al_publico === undefined`.

---

### POST `/products/product/addcategoria`

Registra una nueva categoría.

#### Body esperado

```json
{
  "nombre": "Medicamentos",
  "descripcion": "Medicamentos y productos farmacológicos"
}
```

#### Respuesta exitosa

```json
{
  "message": "Categoria añadida con exito"
}
```

---

### POST `/products/product/addlote`

Registra un lote asociado a un producto.

#### Body esperado

```json
{
  "id_producto": 1,
  "codigo_lote": "AL-9981",
  "stock_inicial": 25,
  "stock_actual": 25,
  "fecha_vencimiento": "2027-06-01",
  "activo": true
}
```

#### Respuesta exitosa

```json
{
  "message": "Lote añadido con exito"
}
```

> Observación importante: el backend valida `activo` usando `if (!activo)`. Si `activo` llega en `false`, lo toma como campo vacío. Conviene validar con `activo === undefined`.

---

### PATCH `/products/product/update/:id`

Edita datos comerciales de un producto.

#### Parámetro

```txt
id = ID del producto
```

#### Body esperado

```json
{
  "precio_costo": 6000,
  "precio_venta": 8500,
  "stock_minimo": 10
}
```

#### Respuesta exitosa

```json
{
  "message": "Producto editado con exito"
}
```

> Observación técnica: en `product.model.js`, la función `editarProductoEnDB` define cuatro placeholders `$1`, `$2`, `$3`, `$4`, pero actualmente envía tres valores en el array. Debería enviar `[precio_costo, precio_venta, stock_minimo, id]`.

---

### DELETE `/products/product/delete/:id`

Elimina un producto por ID.

#### Ejemplo

```txt
DELETE /products/product/delete/1
```

#### Respuesta exitosa

```json
{
  "message": "producto eliminado con exito"
}
```

---

# Rutas del frontend

Las rutas están definidas en `client/src/App.jsx`.

| Ruta | Componente | Descripción | Protección |
|---|---|---|---|
| `/login` | `Login` | Pantalla de inicio de sesión | Pública |
| `/` | `Home` | Pantalla principal | Protegida |
| `/productos` | `Productos` | Módulo de productos | Protegida |
| `/productos/añadir` | `FormularioProductos` | Formulario de alta de producto | Protegida |
| `/ventas` | `Ventas` | Módulo de ventas | Protegida |
| `/clientes` | `Clientes` | Módulo de clientes | Protegida |
| `/mascotas` | `Mascotas` | Módulo de mascotas | Protegida |
| `/historias-clinicas` | `HistoriasClinicas` | Módulo de historias clínicas | Protegida |

La protección se realiza con el componente `VerificacionToken`, exportado desde:

```txt
client/src/pages/auth/Login.jsx
```

Este componente consulta:

```txt
GET /users/comprobar
```

Si el token no es válido o no existe, redirige a:

```txt
/login
```

---

# Flujo de autenticación

1. El usuario entra a `/login`.
2. Completa usuario y contraseña.
3. El frontend envía una petición a:

```txt
POST http://localhost:3000/users/login
```

4. El backend busca el usuario en la tabla `usuarios`.
5. Si los datos son correctos, genera un JWT.
6. El JWT se guarda en una cookie `httpOnly` llamada `token`.
7. El frontend redirige al usuario a `/`.
8. Las rutas protegidas consultan:

```txt
GET http://localhost:3000/users/comprobar
```

9. Si el token es válido, se permite el acceso.
10. Si el token no existe o es inválido, se redirige a `/login`.

---

# Ejemplos de uso con Axios

## Login

```js
axios.post(
  'http://localhost:3000/users/login',
  {
    usuario: 'admin',
    password: '1234'
  },
  {
    withCredentials: true
  }
)
```

## Comprobar token

```js
axios.get('http://localhost:3000/users/comprobar', {
  withCredentials: true
})
```

## Cerrar sesión

```js
axios.post(
  'http://localhost:3000/users/logout',
  {},
  {
    withCredentials: true
  }
)
```

## Obtener categorías

```js
axios.get('http://localhost:3000/products/product/categorias', {
  withCredentials: true
})
```

## Crear producto

```js
axios.post(
  'http://localhost:3000/products/product/add',
  {
    id_categoria: 1,
    nombre: 'Alimento balanceado',
    marca: 'Marca X',
    descripcion: 'Alimento para perros adultos',
    codigo_barras: 779000000001,
    precio_costo: 5000,
    precio_venta: 7500,
    stock_minimo: 5,
    venta_al_publico: true
  },
  {
    withCredentials: true
  }
)
```

## Crear categoría

```js
axios.post(
  'http://localhost:3000/products/product/addcategoria',
  {
    nombre: 'Alimentos',
    descripcion: 'Productos alimenticios para mascotas'
  },
  {
    withCredentials: true
  }
)
```

## Crear lote

```js
axios.post(
  'http://localhost:3000/products/product/addlote',
  {
    id_producto: 1,
    codigo_lote: 'AL-9981',
    stock_inicial: 25,
    stock_actual: 25,
    fecha_vencimiento: '2027-06-01',
    activo: true
  },
  {
    withCredentials: true
  }
)
```

---

# Base de datos

El backend usa PostgreSQL.

La conexión está en:

```txt
server/src/config/db.js
```

Variables usadas por la conexión:

```env
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=
```

Tablas usadas por el código actual:

- `usuarios`
- `productos`
- `categorias`
- `lotes`

## Tabla `usuarios`

El modelo de usuario ejecuta:

```sql
SELECT * FROM usuarios
```

Campos usados por el login:

- `id`
- `usuario`
- `password_hash`
- `rol`

> Observación: actualmente el login compara `password_hash` directamente con `password`. Para un sistema real conviene usar `bcrypt` y comparar con `bcrypt.compare()`.

## Tabla `productos`

Campos usados por el modelo:

- `id`
- `id_categoria`
- `nombre`
- `marca`
- `descripcion`
- `codigo_barras`
- `precio_costo`
- `precio_venta`
- `stock_minimo`
- `venta_al_publico`

## Tabla `categorias`

Campos usados:

- `id`
- `nombre`
- `descripcion`

## Tabla `lotes`

Campos usados:

- `id_producto`
- `codigo_lote`
- `stock_inicial`
- `stock_actual`
- `fecha_vencimiento`
- `activo`

---

# Observaciones técnicas

## 1. Diferencia entre `es_publico` y `venta_al_publico`

En el frontend aparece el campo:

```js
es_publico: false
```

Pero el backend espera:

```js
venta_al_publico
```

Conviene unificar el nombre del campo. Por ejemplo, usar siempre `venta_al_publico` en frontend y backend.

---

## 2. Diferencia entre `idProducto` e `id_producto`

En `FormularioLote.jsx` el estado inicial usa:

```js
idProducto: 1
```

Pero el backend espera:

```js
id_producto
```

Conviene cambiar el frontend a:

```js
id_producto: 1
```

---

## 3. Validaciones booleanas en backend

El backend valida campos booleanos con `!campo`. Esto puede generar errores cuando el valor sea `false`.

Ejemplo actual:

```js
if (!activo) {
  // error
}
```

Mejor:

```js
if (activo === undefined) {
  // error
}
```

Lo mismo aplica para:

```js
venta_al_publico
```

---

## 4. Edición de producto incompleta

El endpoint existe:

```txt
PATCH /products/product/update/:id
```

Pero el componente `FormularioEdicionProducto.jsx` todavía no realiza una petición Axios al backend.

---

## 5. Error en `editarProductoEnDB`

La query usa cuatro parámetros:

```sql
UPDATE productos
SET precio_costo = $1,
    precio_venta = $2,
    stock_minimo = $3
WHERE id = $4
RETURNING *
```

Pero se envían tres valores.

Debe corregirse así:

```js
const result = await db.query(query, [
  precio_costo,
  precio_venta,
  stock_minimo,
  id
])
```

---

## 6. Seguridad de contraseñas

Actualmente el login compara:

```js
u.password_hash === password
```

Para producción se recomienda:

```js
bcrypt.compare(password, user.password_hash)
```

---

## 7. SQL injection en búsqueda por ID

La función `obtenerProductoPorId` arma la query así:

```js
SELECT * FROM productos WHERE id = ${id}
```

Conviene usar consulta parametrizada:

```js
const { rows } = await db.query(
  'SELECT * FROM productos WHERE id = $1',
  [id]
)
```

---

# Mejoras recomendadas

- Agregar `bcrypt` para hashear contraseñas.
- Agregar middleware real de autenticación para proteger rutas del backend.
- Corregir nombres de campos entre frontend y backend.
- Corregir `editarProductoEnDB`.
- Agregar manejo centralizado de errores.
- Agregar validaciones con una librería como `zod`, `joi` o `express-validator`.
- Agregar variables de entorno para la URL base del frontend.
- Mover las llamadas Axios a una carpeta `service/api.js`.
- Implementar CRUD completo para clientes, ventas, mascotas e historias clínicas.
- Agregar documentación de la estructura SQL de la base de datos.
- Agregar colección de Postman o Thunder Client.

---

# Comandos útiles

## Backend

```bash
cd server
npm run dev
```

## Frontend

```bash
cd client
npm run dev
```

## Build del frontend

```bash
cd client
npm run build
```

## Preview del frontend

```bash
cd client
npm run preview
```

---

# Estado actual del proyecto

Actualmente el proyecto tiene implementado:

- Login con JWT en cookie.
- Validación de sesión desde el frontend.
- Navbar condicional según usuario logueado.
- Registro de productos.
- Registro de categorías.
- Registro de lotes.
- Rutas visuales para productos, ventas, clientes, mascotas e historias clínicas.
- Backend conectado a PostgreSQL.

Módulos pendientes o parcialmente implementados:

- CRUD completo de productos desde la interfaz.
- Edición real conectada al backend.
- Eliminación desde la interfaz.
- Gestión completa de ventas.
- Gestión completa de clientes.
- Gestión completa de mascotas.
- Gestión completa de historias clínicas.
- Seguridad avanzada de usuarios.

