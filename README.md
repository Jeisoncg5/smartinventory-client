# SmartInventory AI - Frontend Web

## Descripcion general

Este workspace contiene el frontend del proyecto **SmartInventory AI**. Su funcion es ofrecer una interfaz visual para administrar productos, inventario, ventas y facturas, ademas de permitir la interaccion con el chatbot del sistema.

Este repositorio representa la capa que usa el usuario final. Aqui no vive la logica del negocio ni el modelo de IA; aqui vive la experiencia de uso.

## Rol dentro del proyecto general

El proyecto esta dividido en tres workspaces:

1. `ProjectNetIa`
   Backend de negocio en ASP.NET Core.
2. `smartinventory-ai-core-main`
   Servicio conversacional en FastAPI, LangChain y LangGraph.
3. `smartinventory-client`
   Frontend en React + TypeScript.

Flujo general:

`Usuario -> React -> Backend .NET -> Servicio AI -> Backend .NET -> Base de datos`

El frontend **solo consume la API .NET**. Nunca habla directamente con PostgreSQL ni con el modelo de IA.

## Objetivo del frontend

Este workspace busca resolver dos necesidades principales:

- administracion del sistema
- experiencia conversacional con el chatbot

Desde esta aplicacion se pueden visualizar y operar modulos como:

- productos
- inventario
- ventas
- facturas
- dashboard
- chatbot

## Tecnologias principales

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React

## Estructura del workspace

```text
smartinventory-client/
|-- public/
|-- src/
|   |-- services/      Conexion con la API .NET
|   |-- views/         Pantallas principales del sistema
|   |-- App.tsx        Layout principal y rutas
|   |-- main.tsx       Punto de entrada React
|   |-- App.css
|   |-- index.css
|-- index.html
|-- package.json
|-- vite.config.ts
|-- README.md
```

## Explicacion por carpetas

### `src/views`

Aqui estan las vistas principales del proyecto:

- `Dashboard`
- `Productos`
- `Inventario`
- `Ventas`
- `Facturas`
- `Chatbot`

Cada una representa una pantalla o modulo del sistema.

### `src/services`

Aqui se concentra la comunicacion con la API del backend. Por ejemplo:

- `api.ts`
- `productService.ts`
- `inventoryService.ts`
- `saleService.ts`
- `invoiceService.ts`
- `chatService.ts`
- `catalogService.ts`

Esto ayuda a separar la interfaz visual de la logica de llamadas HTTP.

### `src/App.tsx`

Define:

- el layout general
- la navegacion lateral
- las rutas principales
- el acceso visual al chatbot

## Que aprende un estudiante en este workspace

Este frontend permite practicar conceptos importantes de desarrollo web moderno:

- organizacion por vistas y servicios
- consumo de APIs REST
- manejo de estado local
- navegacion entre pantallas
- dise�o de interfaces administrativas
- integracion entre frontend y backend

## Relacion con el backend

La API base se configura en [src/services/api.ts](./src/services/api.ts) y por defecto apunta a:

- `http://localhost:5083/api`

Eso significa que, para probar este frontend correctamente, el backend `ProjectNetIa` debe estar corriendo.

## Relacion con el chatbot

El frontend no consulta directamente a Gemini ni al servicio FastAPI. En su lugar:

1. el usuario escribe un mensaje
2. React envia la solicitud al backend `.NET`
3. `.NET` reenvia el mensaje al servicio AI
4. la respuesta vuelve a React con un contrato controlado

Esto hace que el frontend se mantenga desacoplado de la logica de IA.

## Como ejecutar el proyecto

### 1. Instalar dependencias

Puedes usar `npm` o `pnpm`.

```powershell
npm install
```

### 2. Ejecutar en desarrollo

```powershell
npm run dev
```

### 3. Compilar para produccion

```powershell
npm run build
```

### 4. Vista previa de produccion

```powershell
npm run preview
```

## Requisitos recomendados

- Node.js instalado
- Backend `.NET` ejecutandose en `http://localhost:5083`
- Servicio AI ejecutandose si quieres probar el chatbot completo

## Modulos funcionales del frontend

### Dashboard

Muestra una vista general del sistema y sirve como entrada a la administracion.

### Productos

Permite consultar y administrar el catalogo de productos y variantes.

### Inventario

Permite revisar existencias y movimientos relacionados con disponibilidad.

### Ventas

Representa el flujo de ventas y el punto de venta.

### Facturas

Permite visualizar informacion de facturacion generada por el backend.

### Chatbot

Ofrece la interfaz conversacional para buscar productos y apoyar el proceso de compra.

