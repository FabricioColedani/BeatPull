document.addEventListener('DOMContentLoaded', async () => {
    let customDownloadPath = null;
    let currentMode = 'basic';

    // Controles Ventana
    document.getElementById('btn-minimize')?.addEventListener('click', () => window.electronAPI.minimizeWindow());
    document.getElementById('btn-maximize')?.addEventListener('click', () => window.electronAPI.maximizeWindow());
    document.getElementById('btn-close')?.addEventListener('click', () => window.electronAPI.closeWindow());

    // Pegar Portapapeles
    document.getElementById('btn-paste')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('url-input').value = text;
        } catch (err) {
            console.error('Error al acceder al portapapeles:', err);
        }
    });

    const btnDownload = document.getElementById('btn-download');
    const btnSelectFolder = document.getElementById('btn-select-folder');
    const folderPathDisplay = document.getElementById('folder-path-display');
    const consoleLog = document.getElementById('console-log');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const modal = document.getElementById('dependency-modal');

    // Modos
    const tabBasic = document.getElementById('tab-basic');
    const tabAdvanced = document.getElementById('tab-advanced');
    const panelBasic = document.getElementById('panel-basic');
    const panelAdvanced = document.getElementById('panel-advanced');
    const advIsPlaylist = document.getElementById('adv-is-playlist');
    const advRangeContainer = document.getElementById('adv-range-container');

    // Dependencias
    if (window.electronAPI) {
        const hasDeps = await window.electronAPI.checkDependencies();
        if (!hasDeps) modal.classList.remove('hidden');
    }

    document.getElementById('btn-recheck')?.addEventListener('click', async () => {
        const recheck = await window.electronAPI.checkDependencies();
        if (recheck) modal.classList.add('hidden');
    });

    // Alternar pestañas
    tabBasic.addEventListener('click', () => {
        currentMode = 'basic';
        tabBasic.className = 'px-3 py-1 text-[11px] font-bold rounded-full bg-[#1DB954] text-black transition-all';
        tabAdvanced.className = 'px-3 py-1 text-[11px] font-bold rounded-full text-zinc-400 hover:text-white transition-all';
        panelBasic.classList.remove('hidden');
        panelAdvanced.classList.add('hidden');
    });

    tabAdvanced.addEventListener('click', () => {
        currentMode = 'advanced';
        tabAdvanced.className = 'px-3 py-1 text-[11px] font-bold rounded-full bg-[#1DB954] text-black transition-all';
        tabBasic.className = 'px-3 py-1 text-[11px] font-bold rounded-full text-zinc-400 hover:text-white transition-all';
        panelAdvanced.classList.remove('hidden');
        panelBasic.classList.add('hidden');
    });

    advIsPlaylist.addEventListener('change', (e) => {
        if (e.target.checked) advRangeContainer.classList.remove('hidden');
        else advRangeContainer.classList.add('hidden');
    });

    // Selector Carpeta
    btnSelectFolder.addEventListener('click', async () => {
        const selectedPath = await window.electronAPI.selectDirectory();
        if (selectedPath) {
            customDownloadPath = selectedPath;
            folderPathDisplay.innerText = selectedPath;
        }
    });

    function buildAdvancedArgs(url) {
        const format = document.getElementById('adv-format').value;
        let quality = document.getElementById('adv-quality').value;
        const thumb = document.getElementById('adv-thumb').checked;
        const metadata = document.getElementById('adv-metadata').checked;
        const isPlaylist = document.getElementById('adv-is-playlist').checked;
        const range = document.getElementById('adv-range').value.trim();

        if (format === 'flac' || format === 'wav') quality = '0';

        const args = ['-x', '--audio-format', format, '--audio-quality', quality];
        if (thumb) args.push('--embed-thumbnail');
        if (metadata) args.push('--embed-metadata', '--parse-metadata', 'title:%(artist)s - %(title)s');

        if (isPlaylist) {
            args.push('-o', '%(playlist_title,playlist)s/%(playlist_index)s - %(title)s.%(ext)s');
            if (range && range.toLowerCase() !== 'all') args.push('-I', range);
        } else {
            args.push('-o', '%(artist,uploader)s - %(title)s.%(ext)s');
        }

        args.push(url);
        return args;
    }

    // Iniciar
    btnDownload.addEventListener('click', () => {
        const url = document.getElementById('url-input')?.value.trim();
        if (!url) return alert('Por favor, ingresa una URL.');

        let args = [];
        if (currentMode === 'basic') {
            const selectedFlow = document.querySelector('input[name="flow"]:checked')?.value || '1';
            switch (selectedFlow) {
                case '1': args = ['-o', '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s', '--yes-playlist', url]; break;
                case '2': args = ['-x', '--audio-format', 'opus', '--embed-thumbnail', '--add-metadata', '--parse-metadata', 'playlist_title:%(album)s', '-o', '%(playlist_title)s/%(title)s.%(ext)s', url]; break;
                case '3': args = ['-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', '%(playlist_index)02d - %(title)s.%(ext)s', url]; break;
                case '4': args = ['-f', 'ba/b', '-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', '%(playlist_index)s - %(title)s.%(ext)s', url]; break;
            }
        } else {
            args = buildAdvancedArgs(url);
        }

        consoleLog.value = `[BeatPull] Comando: yt-dlp ${args.join(' ')}\n\nIniciando...\n`;
        progressContainer.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressBar.className = 'bg-[#1DB954] h-full rounded-full transition-all duration-300';
        progressText.innerText = '0%';
        btnDownload.disabled = true;
        btnDownload.classList.add('opacity-50');

        window.electronAPI.startDownload({ argsArray: args, downloadPath: customDownloadPath });
    });

    // Escuchadores
    window.electronAPI.onProgress((percentage) => {
        progressBar.style.width = `${percentage}%`;
        progressText.innerText = `${percentage}%`;
    });

    window.electronAPI.onLog((logData) => {
        consoleLog.value += logData;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    });

    window.electronAPI.onComplete((code) => {
        btnDownload.disabled = false;
        btnDownload.classList.remove('opacity-50');
        if (code === 0) {
            progressText.innerText = '¡Completado!';
            progressBar.className = 'bg-blue-500 h-full rounded-full';
        } else {
            progressText.innerText = 'Error';
            progressBar.className = 'bg-red-500 h-full rounded-full';
        }
    });
});