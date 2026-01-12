# OurTransferSSGL 🚀

**OurTransferSSGL** es una aplicación web moderna y segura diseñada para la transferencia eficiente de archivos dentro de entornos corporativos. Inspirada en la simplicidad de herramientas como WeTransfer, pero construida con la robustez necesaria para el manejo de datos empresariales, permite a los usuarios autenticados subir documentos a la nube y compartir enlaces de descarga temporales.

---

## ✨ Características Principales

-   **🔐 Autenticación Corporativa**: Acceso restringido mediante credenciales validadas contra una base de datos PostgreSQL segura.
-   **upload ☁️ Subida a la Nube**: Almacenamiento directo en **Azure Blob Storage**.
-   **⚡ Transferencias Rápidas**: Uso de *Shared Access Signatures (SAS)* para subidas y descargas directas sin sobrecargar el servidor de la aplicación.
-   **🔗 Enlaces Temporales**: Generación automática de enlaces públicos de descarga con expiración programada (24 horas) para garantizar la seguridad de la información.
-   **🎨 Interfaz UI/UX Premium**: Diseño moderno con efectos de partículas, soporte *Drag & Drop*, notificaciones *Toast* y feedback visual de progreso.
-   **📱 Diseño Responsivo**: Adaptado para funcionar perfectamente en dispositivos de escritorio y móviles.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza las últimas tecnologías del ecosistema web:

### Frontend
-   **React 19** & **Next.js 16**: Arquitectura basada en *App Router* para máximo rendimiento y SEO.
-   **Tailwind CSS v4**: Estilizado moderno y utilitario.
-   **Lucide React**: Iconografía ligera y consistente.
-   **TypeScript**: Tipado estático para mayor robustez y mantenibilidad.

### Backend (Serverless)
-   **Next.js API Routes**: Endpoints *serverless* para lógica de negocio.
-   **Azure SDK (`@azure/storage-blob`)**: Gestión de almacenamiento en la nube.
-   **PostgreSQL (`pg`)**: Gestión de base de datos relacional.
-   **Bcrypt.js**: Hashing seguro de contraseñas.

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo localmente:

### 1. Prerrequisitos
Asegúrate de tener instalado:
-   [Node.js](https://nodejs.org/) (v18 o superior)
-   npm o yarn

### 2. Clonar e Instalar
```bash
git clone <url-del-repositorio>
cd OurTransferSSGL
npm install
```

### 3. Configurar Entorno
Crea el archivo `.env.local` con las credenciales mencionadas en la sección anterior.

### 4. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto

```
OurTransferSSGL/
├── app/
│   ├── api/              # Endpoints del Backend (Login, SAS Token)
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página principal (Login + Upload)
├── components/           # Componentes reutilizables (Toast, UI)
├── public/               # Activos estáticos
└── ...config files       # Configuración (Tailwind, TypeScript, Next)
```

---

## 🔒 Seguridad

-   **SAS Tokens**: Los archivos nunca pasan por el servidor de Node.js durante la subida/bajada, sino que van directo a Azure, mejorando la seguridad y velocidad.
-   **Permisos Granulares**:
    -   *Subida*: Token de escritura válido por 10 minutos.
    -   *Descarga*: Token de lectura válido por 24 horas.
