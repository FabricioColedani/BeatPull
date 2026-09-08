document.addEventListener('DOMContentLoaded', () => {
    // Estado de la aplicación
    let customDownloadPath = null;
    let downloadQueue = [];
    let isDownloading = false;
    let currentMetadata = null;
    let lastDownloadedFilePath = null;
    let currentMode = 'basico';
    let selectedPreset = '1';

    // Elementos del DOM
    const urlInput = document.getElementById('url-input');
    const btnDownload = document.getElementById('btn-download');
    const btnAddQueue = document.getElementById('btn-add-queue');
    const metadataCard = document.getElementById('metadata-card');
    const clipboardToast = document.getElementById('clipboard-toast');
    const historyList = document.getElementById('history-list');

    // Cambios de Modo (Básico vs Avanzado)
    const modeBasicBtn = document.getElementById('mode-basic-btn');
    const modeAdvancedBtn = document.getElementById('mode-advanced-btn');
    const sectionBasic = document.getElementById('section-basic');
    const sectionAdvanced = document.getElementById('section-advanced');

    // ==========================================
    // SISTEMA DE NOTIFICACIONES FLOTANTES (TOASTS)
    // ==========================================
    function showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        
        const styles = {
            error: { border: 'border-red-500/40', bg: 'bg-red-950/80', text: 'text-red-200', icon: '❌' },
            success: { border: 'border-[#1DB954]/40', bg: 'bg-zinc-900/90', text: 'text-zinc-100', icon: '✅' },
            warning: { border: 'border-amber-500/40', bg: 'bg-amber-950/80', text: 'text-amber-200', icon: '⚠️' },
            info: { border: 'border-blue-500/40', bg: 'bg-zinc-900/90', text: 'text-zinc-200', icon: 'ℹ️' }
        }[type] || { border: 'border-blue-500/40', bg: 'bg-zinc-900/90', text: 'text-zinc-200', icon: 'ℹ️' };

        toast.className = `pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl glass-panel border ${styles.border} ${styles.bg} ${styles.text} shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-medium`;
        toast.innerHTML = `
            <span class="text-sm shrink-0">${styles.icon}</span>
            <span class="flex-1 leading-snug">${message}</span>
            <button class="btn-close-toast text-zinc-500 hover:text-white text-xs px-1">✕</button>
        `;

        toast.querySelector('.btn-close-toast').onclick = () => toast.remove();

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ==========================================
    // NAVEGACIÓN Y PESTAÑAS
    // ==========================================
    modeBasicBtn.onclick = () => {
        currentMode = 'basico';
        modeBasicBtn.className = 'px-3.5 py-1 text-xs font-semibold rounded-full bg-[#1DB954] text-black transition-all';
        modeAdvancedBtn.className = 'px-3.5 py-1 text-xs font-semibold rounded-full text-zinc-400 hover:text-white transition-all';
        sectionBasic.classList.remove('hidden');
        sectionAdvanced.classList.add('hidden');
    };

    modeAdvancedBtn.onclick = () => {
        currentMode = 'avanzado';
        modeAdvancedBtn.className = 'px-3.5 py-1 text-xs font-semibold rounded-full bg-[#1DB954] text-black transition-all';
        modeBasicBtn.className = 'px-3.5 py-1 text-xs font-semibold rounded-full text-zinc-400 hover:text-white transition-all';
        sectionAdvanced.classList.remove('hidden');
        sectionBasic.classList.add('hidden');
    };

    // Selección de Tarjeta Predefinida en Modo Básico
    const presetCards = document.querySelectorAll('.preset-card');
    presetCards.forEach(card => {
        card.onclick = () => {
            presetCards.forEach(c => {
                c.className = 'preset-card text-left p-4 rounded-2xl glass-panel border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/50 transition-all';
                const dot = c.querySelector('span');
                if (dot) dot.className = 'w-3.5 h-3.5 rounded-full border-2 border-zinc-600 shrink-0';
            });

            card.className = 'preset-card active text-left p-4 rounded-2xl glass-panel border border-[#1DB954] bg-zinc-800/80 transition-all';
            const activeDot = card.querySelector('span');
            if (activeDot) activeDot.className = 'w-3.5 h-3.5 rounded-full border-2 border-[#1DB954] bg-[#1DB954] shrink-0';

            selectedPreset = card.getAttribute('data-preset');
        };
    });

    // Pestañas Descargar / Historial
    document.getElementById('nav-main').onclick = (e) => {
        document.getElementById('view-main').classList.remove('hidden');
        document.getElementById('view-history').classList.add('hidden');
        e.target.className = 'px-3 py-1 text-xs font-semibold rounded-full text-white bg-zinc-800';
        document.getElementById('nav-history').className = 'px-3 py-1 text-xs font-semibold rounded-full text-zinc-400 hover:text-white';
    };

    document.getElementById('nav-history').onclick = (e) => {
        document.getElementById('view-history').classList.remove('hidden');
        document.getElementById('view-main').classList.add('hidden');
        e.target.className = 'px-3 py-1 text-xs font-semibold rounded-full text-white bg-zinc-800';
        document.getElementById('nav-main').className = 'px-3 py-1 text-xs font-semibold rounded-full text-zinc-400 hover:text-white';
        renderHistory();
    };

    // ==========================================
    // CONTROLES DE VENTANA E IPC
    // ==========================================
    document.getElementById('btn-minimize').onclick = () => window.electronAPI.minimizeWindow();
    document.getElementById('btn-maximize').onclick = () => window.electronAPI.maximizeWindow();
    document.getElementById('btn-close').onclick = () => window.electronAPI.closeWindow();

    // Actualizador de yt-dlp
    document.getElementById('btn-update-ytdlp').onclick = async () => {
        const icon = document.getElementById('icon-update-ytdlp');
        if (icon) icon.classList.add('animate-spin', 'text-[#1DB954]');
        showToast('Comprobando actualizaciones de yt-dlp...', 'info', 3000);

        const res = await window.electronAPI.updateYtdlp();
        if (icon) icon.classList.remove('animate-spin', 'text-[#1DB954]');

        if (res.success) {
            showToast('Motor yt-dlp actualizado con éxito.', 'success');
        } else {
            showToast('Error al actualizar yt-dlp.', 'error');
        }
    };

    // ==========================================
    // PORTAPAPELES Y LIVE METADATA
    // ==========================================
    let lastClipboardText = '';
    window.addEventListener('focus', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.includes('youtube.com/') && text !== lastClipboardText && text !== urlInput.value) {
                lastClipboardText = text;
                clipboardToast.classList.remove('hidden');
            }
        } catch (_) {}
    });

    document.getElementById('btn-toast-add').onclick = () => {
        urlInput.value = lastClipboardText;
        clipboardToast.classList.add('hidden');
        fetchLiveMetadata(lastClipboardText);
    };

    document.getElementById('btn-toast-close').onclick = () => clipboardToast.classList.add('hidden');

    document.getElementById('btn-paste').onclick = async () => {
        urlInput.value = await navigator.clipboard.readText();
        fetchLiveMetadata(urlInput.value);
    };

    let debounceTimer;
    urlInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fetchLiveMetadata(urlInput.value.trim()), 600);
    });

    async function fetchLiveMetadata(url) {
        if (!url || !url.startsWith('http')) return metadataCard.classList.add('hidden');
        metadataCard.classList.remove('hidden');
        document.getElementById('meta-title').innerText = 'Obteniendo metadatos...';
        
        const data = await window.electronAPI.getMetadata(url);
        if (data) {
            currentMetadata = data;
            document.getElementById('meta-thumb').src = data.thumbnail;
            document.getElementById('meta-title').innerText = data.title;
            document.getElementById('meta-uploader').innerText = data.uploader;
            document.getElementById('meta-duration').innerText = data.duration;
        } else {
            document.getElementById('meta-title').innerText = 'No se pudieron extraer metadatos';
            showToast('No se obtuvo información de esta URL.', 'warning');
        }
    }

    // ==========================================
    // PARÁMETROS Y PROCESAMIENTO DE DESCARGA
    // ==========================================
    function getArgs(url) {
        if (currentMode === 'basico') {
            switch (selectedPreset) {
                case '1':
                    return ['-o', '%(title)s.%(ext)s', url];
                case '2':
                    return ['-x', '--audio-format', 'opus', '--embed-thumbnail', '--embed-metadata', '-o', '%(title)s.%(ext)s', url];
                case '3':
                    return ['-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', '%(playlist_index)s - %(title)s.%(ext)s', url];
                case '4':
                default:
                    return ['-x', '--audio-format', 'mp3', '--audio-quality', '0', '--embed-thumbnail', '--embed-metadata', '-o', '%(title)s.%(ext)s', url];
            }
        } else {
            const format = document.getElementById('adv-format').value;
            const quality = document.getElementById('adv-quality').value;
            const thumb = document.getElementById('adv-thumb').checked;
            const metadata = document.getElementById('adv-metadata').checked;

            const args = ['-x', '--audio-format', format, '--audio-quality', quality];
            if (thumb) args.push('--embed-thumbnail');
            if (metadata) args.push('--embed-metadata');
            args.push('-o', '%(title)s.%(ext)s', url);
            return args;
        }
    }

    // Gestor de Cola
    btnAddQueue.onclick = () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast('Ingresa una URL antes de añadir a la cola.', 'warning');
            return;
        }
        downloadQueue.push({ url, title: currentMetadata?.title || url });
        urlInput.value = '';
        metadataCard.classList.add('hidden');
        updateQueueUI();
        showToast('Añadido a la cola de descargas.', 'info');
    };

    function updateQueueUI() {
        const container = document.getElementById('queue-container');
        const list = document.getElementById('queue-list');
        const count = document.getElementById('queue-count');
        
        count.innerText = downloadQueue.length;
        if (downloadQueue.length === 0) return container.classList.add('hidden');
        
        container.classList.remove('hidden');
        list.innerHTML = downloadQueue.map((item, idx) => `
            <div class="flex justify-between items-center text-xs bg-zinc-900/80 p-2 rounded-xl border border-white/5">
                <span class="truncate pr-2">${idx + 1}. ${item.title}</span>
                <span class="text-[10px] text-zinc-500 font-mono">En espera</span>
            </div>
        `).join('');
    }

    btnDownload.onclick = () => {
        if (isDownloading) return;
        const url = urlInput.value.trim();
        if (url) downloadQueue.push({ url, title: currentMetadata?.title || url });
        
        if (downloadQueue.length === 0) {
            showToast('Debes ingresar un enlace de YouTube válido.', 'warning');
            return;
        }
        
        processNextInQueue();
    };

    function processNextInQueue() {
        if (downloadQueue.length === 0) {
            isDownloading = false;
            btnDownload.disabled = false;
            btnDownload.classList.remove('opacity-50');
            return;
        }

        isDownloading = true;
        btnDownload.disabled = true;
        btnDownload.classList.add('opacity-50');

        const currentItem = downloadQueue.shift();
        updateQueueUI();

        document.getElementById('progress-container').classList.remove('hidden');
        document.getElementById('progress-status').innerText = `Descargando: ${currentItem.title}`;

        const args = getArgs(currentItem.url);
        window.electronAPI.startDownload({ argsArray: args, downloadPath: customDownloadPath });
    }

    // Listeners IPC del Proceso
    window.electronAPI.onProgress((pct) => {
        document.getElementById('progress-bar').style.width = `${pct}%`;
        document.getElementById('progress-text').innerText = `${pct}%`;
    });

    window.electronAPI.onLog((log) => {
        const consoleLog = document.getElementById('console-log');
        consoleLog.value += log;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    });

    window.electronAPI.onFilePath((path) => { lastDownloadedFilePath = path; });

    window.electronAPI.onComplete((code) => {
        const success = code === 0;
        
        if (success) {
            showToast('Descarga finalizada con éxito.', 'success');
        } else {
            showToast('Ocurrió un error. Consulta la consola STDOUT.', 'error', 6000);
        }

        window.electronAPI.sendNotification({ 
            title: success ? 'Descarga Completada' : 'Error en Descarga', 
            body: lastDownloadedFilePath || 'Proceso finalizado.' 
        });
        
        saveHistory({
            title: currentMetadata?.title || 'Archivo Descargado',
            path: lastDownloadedFilePath,
            date: new Date().toLocaleTimeString(),
            success
        });

        processNextInQueue();
    });

    // ==========================================
    // HISTORIAL Y DIRECTORIOS
    // ==========================================
    function saveHistory(item) {
        const history = JSON.parse(localStorage.getItem('bp_history') || '[]');
        history.unshift(item);
        localStorage.setItem('bp_history', JSON.stringify(history.slice(0, 30)));
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('bp_history') || '[]');
        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-xs text-zinc-500">Sin historial registrado.</p>';
            return;
        }

        historyList.innerHTML = history.map((item) => `
            <div class="glass-panel p-3.5 rounded-2xl flex items-center justify-between">
                <div class="overflow-hidden mr-3">
                    <h4 class="text-xs font-bold text-white truncate">${item.title}</h4>
                    <p class="text-[10px] font-mono text-zinc-400 truncate">${item.path || 'Ruta no disponible'}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    ${item.path ? `<button onclick="window.electronAPI.showInFolder('${item.path.replace(/\\/g, '\\\\')}')" class="bg-zinc-800 hover:bg-zinc-700 text-xs px-2.5 py-1.5 rounded-xl border border-white/5">📂 Abrir</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    document.getElementById('btn-clear-history').onclick = () => {
        localStorage.removeItem('bp_history');
        renderHistory();
        showToast('Historial borrado.', 'info');
    };

    document.getElementById('btn-select-folder').onclick = async () => {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            customDownloadPath = path;
            document.getElementById('folder-path-display').innerText = path;
            showToast('Ubicación de descarga actualizada.', 'info');
        }
    };
});