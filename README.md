# BeatPull

BeatPull es una aplicación de escritorio construida con Electron para descargar audio de YouTube y playlists con una interfaz elegante y fácil de usar. La app usa `yt-dlp` como motor de descarga y ofrece dos modos: básico y avanzado, con personalización de formato, calidad, metadatos y ubicación de guardado.

## ✨ Características principales

- Descarga de videos y playlists desde YouTube.
- Modo básico con presets rápidos para uso general.
- Modo avanzado con opciones de:
  - formato de salida (`mp3`, `flac`, `m4a`, `wav`, `opus`, `aac`)
  - calidad de audio
  - incrustación de portada
  - metadatos
  - rango de playlist
- Selección personalizada de la carpeta de descarga.
- Progreso visual y logs en tiempo real.
- Interfaz oscura estilo Spotify con ventana personalizada de Electron.
- Comprobación automática de dependencias al iniciar.

## 🛠️ Stack tecnológico

- Electron
- JavaScript
- Tailwind CSS
- `yt-dlp`

## 📋 Requisitos

Antes de ejecutar la app, asegúrate de tener instalado:

- Node.js 18 o superior
- npm
- `yt-dlp` disponible en el sistema

### Instalar `yt-dlp`

En Windows:

```bash
winget install yt-dlp
```

O con pip:

```bash
pip install yt-dlp
```

> La aplicación comprueba si `yt-dlp` está instalado al iniciar y muestra un aviso si no lo está.

## 🚀 Instalación

### Opción 1: Descargar el ejecutable

Si ya tienes el archivo `.exe` compilado, puedes usarlo directamente sin instalar Node.js ni dependencias:

- Descarga la última versión desde la sección de releases o desde la carpeta de distribución del proyecto.
- Ejecuta `BeatPull.exe`.
- Si la app te pide instalar `yt-dlp`, sigue la instrucción mostrada en la interfaz.

### Opción 2: Ejecutar desde código fuente

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd BeatPull
```

2. Instala las dependencias:

```bash
npm install
```

3. Ejecuta la aplicación:

```bash
npm start
```

## 📜 Scripts disponibles

```bash
npm start
```

Inicia la aplicación Electron.

```bash
npm run build-css
```

Genera/actualiza los estilos con Tailwind en modo observación.

## ▶️ Cómo usar la app

1. Pega la URL del video o de la playlist en el campo principal.
2. Elige el modo:
   - Básico: usa presets predefinidos.
   - Avanzado: personaliza formato, calidad, metadatos y rango.
3. Selecciona una carpeta de destino si deseas cambiar la ubicación predeterminada.
4. Pulsa "DESCARGAR AHORA".
5. Observa el progreso y el log de la descarga en la consola interna.

## 🧩 Estructura del proyecto

```text
BeatPull/
├── assets/
│   └── logo.png
├── src/
│   ├── main/
│   │   ├── main.js
│   │   └── preload.js
│   └── renderer/
│       ├── index.html
│       ├── output.css
│       ├── renderer.js
│       └── styles.css
├── .gitignore
├── package.json
├── tailwind.config.js
├── README.md
└── package-lock.json
```

### Descripción de carpetas

- `src/main/`: ventana principal de Electron, IPC, validación de dependencias y ejecución de `yt-dlp`.
- `src/renderer/`: interfaz de usuario y comportamiento del frontend.
- `assets/`: recursos gráficos del proyecto.

## ⚙️ Comportamiento actual

La app incorpora estas funciones clave:

- `window-minimize`, `window-maximize` y `window-close` con control de ventana personalizado.
- `check-dependencies` para validar si `yt-dlp` está instalado.
- `select-directory` para elegir una carpeta de destino.
- `start-download` para lanzar el proceso de descarga con argumentos construidos dinámicamente.
- `download-progress` para mostrar porcentaje real de la descarga.
- `download-log` para visualizar salida de consola en la interfaz.

## 🧪 Solución de problemas

### `yt-dlp no encontrado`

Instálalo con:

```bash
winget install yt-dlp
```

Luego vuelve a comprobar desde la aplicación.

### No arranca la app

Verifica que las dependencias estén instaladas:

```bash
npm install
```

### La descarga falla

- Asegúrate de que la URL sea válida.
- Comprueba si el video o la playlist están disponibles.
- Revisa la consola interna de la aplicación.

## 📁 Licencia

Este proyecto está licenciado bajo Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).

Esta licencia permite compartir y adaptar el contenido, siempre que se reconozca la autoría y no se use con fines comerciales. No está permitida la reutilización comercial sin el permiso correspondiente.

## 👤 Proyecto

BeatPull está pensado como una herramienta práctica para descargar audio desde YouTube con una experiencia visual limpia y rápida.
