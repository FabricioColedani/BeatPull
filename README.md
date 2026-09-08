# BeatPull

BeatPull es una aplicación de escritorio desarrollada con Electron para descargar audio y playlists de YouTube de forma rápida y visual. La app integra `yt-dlp` para gestionar descargas, permite seleccionar una carpeta de destino y ofrece modos básico y avanzado para adaptar la descarga a distintos casos de uso.

## Características

- Descarga de enlaces individuales y playlists de YouTube.
- Modo básico con presets de descarga rápida.
- Modo avanzado para personalizar formato, calidad, metadatos y portadas.
- Selección de carpeta de destino personalizada.
- Progreso en tiempo real con logs de consola.
- Interfaz moderna inspirada en Spotify con estilo oscuro.
- Compatibilidad con audio en formatos como MP3, M4A, FLAC, WAV, AAC y Opus.

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 18 o superior
- npm
- `yt-dlp` en tu sistema

### Instalar `yt-dlp`

En Windows puedes instalarlo con:

```bash
winget install yt-dlp
```

También puedes instalarlo con `pip`:

```bash
pip install yt-dlp
```

> La aplicación comprueba si `yt-dlp` está disponible al iniciar y muestra un aviso si no lo encuentra.

## Instalación

1. Clona este repositorio:

```bash
git clone <url-del-repositorio>
cd BeatPull
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia la aplicación:

```bash
npm start
```

## Scripts disponibles

```bash
npm start
```

Ejecuta la app en modo Electron.

```bash
npm run build-css
```

Compila los estilos con Tailwind en modo observación.

## Uso

1. Pega la URL de YouTube o de una playlist en el campo correspondiente.
2. Selecciona el modo:
   - Básico: usa presets predefinidos para descargas rápidas.
   - Avanzado: ajusta formato, calidad, metadatos y rango de playlist.
3. Elige la carpeta de destino si deseas guardar en otra ubicación.
4. Pulsa "DESCARGAR AHORA".
5. Puedes seguir el progreso y ver los logs en tiempo real.

## Estructura del proyecto

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

- `src/main/`: lógica principal de Electron, control de ventanas y gestión de descargas con `yt-dlp`.
- `src/renderer/`: interfaz gráfica, estilos y lógica del frontend.
- `assets/`: recursos visuales del proyecto.

## Recomendaciones

- Si vas a descargar playlists grandes, usa el modo avanzado para definir un rango o formato específico.
- Para mejor calidad, usa MP3 con `audio-quality 0` o FLAC/WAV según tus necesidades.
- Revisa la carpeta de descarga antes de iniciar para evitar mezclas de archivos.

## Solución de problemas

### `yt-dlp no encontrado`

La aplicación detecta si el binario no está instalado. Instálalo con `winget install yt-dlp` o `pip install yt-dlp` y vuelve a comprobar.

### No se inicia la aplicación

Verifica que todas las dependencias estén instaladas:

```bash
npm install
```

### Error al descargar

- Comprueba que la URL es válida.
- Verifica que la playlist o el video existan.
- Revisa la consola de logs dentro de la aplicación.

## Licencia

Este proyecto no especifica una licencia en este momento. Si quieres, puedes añadir una licencia como MIT o GPL para definir el uso permitido.

## Autor

Proyecto creado para descargar contenido de YouTube de manera práctica y con una interfaz sencilla. 

---

Si quieres, puedo dejarte también una versión más profesional del README con badges, capturas, y una sección de "Roadmap" para GitHub.
