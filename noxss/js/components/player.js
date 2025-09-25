/* ==========================================================================
   Noxss Library: Player Component
   - Versão: 5.2 (Implementação de Modos de Reprodução e Polimento Final)
   - Lógica robusta para o componente de player de música compacto.
   - Depende de: js/core.js e jsmediatags.min.js
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }

    // --- 1. Configuração e Constantes ---
    const SVG_ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const SVG_ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    const DEFAULT_ALBUM_ART_SRC = "noxss/assets/preview/disc.jpg";
    
    const REPEAT_NONE = 'none';
    const REPEAT_ALL = 'all';
    const REPEAT_ONE = 'one';
    
    const playersData = new Map();

    // --- 2. Funções Auxiliares Puras ---
    function getFallbackTitle(url) {
        try {
            return decodeURIComponent(url.split('/').pop().replace(/\.[^/.]+$/, ""));
        } catch (e) {
            return "Título Desconhecido";
        }
    }

    // --- 3. Funções de Manipulação da UI ---
    function renderTrackInfo(ui, info) {
        ui.title.textContent = info.title || "Título Desconhecido";
        ui.artist.textContent = info.artist || "Artista Desconhecido";
        if (info.pictureData) {
            const { data, format } = info.pictureData;
            let base64String = "";
            for (let i = 0; i < data.length; i++) base64String += String.fromCharCode(data[i]);
            ui.albumArt.src = `data:${format};base64,${window.btoa(base64String)}`;
        } else {
            ui.albumArt.src = DEFAULT_ALBUM_ART_SRC;
        }
    }
    
    function renderPlayerState(ui, state) {
        ui.playPause.innerHTML = state.isPlaying ? SVG_ICON_PAUSE : SVG_ICON_PLAY;
        ui.playPause.classList.toggle("noxss-active", state.isPlaying);
        ui.playPause.disabled = !state.controlsEnabled;
        ui.prev.disabled = !state.controlsEnabled || !state.hasPrev;
        ui.next.disabled = !state.controlsEnabled || !state.hasNext;
    }

    // --- 4. Funções de Lógica Principal ---
    async function fetchAndRenderMetadata(playerId, songUrl) {
        const data = playersData.get(playerId);
        if (!data) return;
        if (typeof window.jsmediatags === 'undefined') {
            renderTrackInfo(data.ui, { title: getFallbackTitle(songUrl) });
            return;
        }
        try {
            const response = await fetch(songUrl);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const blob = await response.blob();
            window.jsmediatags.read(blob, {
                onSuccess: (tag) => {
                    renderTrackInfo(data.ui, { title: tag.tags.title, artist: tag.tags.artist, pictureData: tag.tags.picture });
                },
                onError: () => {
                    renderTrackInfo(data.ui, { title: getFallbackTitle(songUrl) });
                }
            });
        } catch (error) {
            renderTrackInfo(data.ui, { title: getFallbackTitle(songUrl) });
        }
    }
    
    async function loadTrack(playerId, index) {
        const data = playersData.get(playerId);
        if (!data || index < 0 || index >= data.playlist.length) return;
        data.currentIndex = index;
        const songUrl = data.playlist[index];
        renderTrackInfo(data.ui, { title: "Carregando...", artist: getFallbackTitle(songUrl) });
        renderPlayerState(data.ui, { isPlaying: false, controlsEnabled: false });
        await fetchAndRenderMetadata(playerId, songUrl);
        data.ui.audio.src = songUrl;
        renderPlayerState(data.ui, { isPlaying: false, controlsEnabled: true, hasPrev: index > 0, hasNext: index < data.playlist.length - 1 });
    }

    async function playSongAtIndex(playerId, index) {
        const data = playersData.get(playerId);
        if (!data) return;
        if (data.currentIndex === index && data.ui.audio.src) {
            data.ui.audio.play();
            return;
        }
        data.currentIndex = index;
        const songUrl = data.playlist[index];
        renderTrackInfo(data.ui, { title: "Carregando...", artist: getFallbackTitle(songUrl) });
        renderPlayerState(data.ui, { isPlaying: false, controlsEnabled: false });
        await fetchAndRenderMetadata(playerId, songUrl);
        data.ui.audio.src = songUrl;
        try {
            await data.ui.audio.play();
        } catch (err) { /* Autoplay bloqueado */ }
    }

    // --- 5. Função de Inicialização de Instância ---
    function initializeInstance(playerElement) {
        const playerId = playerElement.id;
        if (!playerId || playersData.has(playerId)) return;
        const ui = { audio: playerElement.querySelector(".noxss-audio-player"), albumArt: playerElement.querySelector(".noxss-album-art"), title: playerElement.querySelector(".noxss-title"), artist: playerElement.querySelector(".noxss-artist"), playPause: playerElement.querySelector(".noxss-play-pause"), prev: playerElement.querySelector(".noxss-prev-button"), next: playerElement.querySelector(".noxss-next-button") };
        if (!ui.audio) { console.error(`Noxss Player (${playerId}): Elemento <audio> não encontrado.`); return; }

        playersData.set(playerId, { playlist: [], currentIndex: -1, repeatMode: REPEAT_ALL, ui });

        ui.audio.addEventListener('play', () => {
            const data = playersData.get(playerId);
            renderPlayerState(ui, { isPlaying: true, controlsEnabled: true, hasPrev: data.currentIndex > 0, hasNext: data.currentIndex < data.playlist.length - 1 });
        });
        ui.audio.addEventListener('pause', () => {
            const data = playersData.get(playerId);
            renderPlayerState(ui, { isPlaying: false, controlsEnabled: data.playlist.length > 0, hasPrev: data.currentIndex > 0, hasNext: data.currentIndex < data.playlist.length - 1 });
        });
        ui.audio.addEventListener('ended', () => {
            const data = playersData.get(playerId);
            let nextIndex;
            switch (data.repeatMode) {
                case REPEAT_ONE:
                    nextIndex = data.currentIndex;
                    break;
                case REPEAT_ALL:
                    nextIndex = (data.currentIndex + 1) % data.playlist.length;
                    break;
                case REPEAT_NONE:
                default:
                    if (data.currentIndex < data.playlist.length - 1) {
                        nextIndex = data.currentIndex + 1;
                    } else {
                        renderTrackInfo(data.ui, { title: "Fim da playlist", artist: "" });
                        renderPlayerState(data.ui, { isPlaying: false, controlsEnabled: true, hasPrev: true, hasNext: false });
                        data.ui.audio.src = "";
                        return;
                    }
                    break;
            }
            playSongAtIndex(playerId, nextIndex);
        });
        ui.audio.addEventListener('error', () => renderTrackInfo(ui, { title: "Erro ao carregar" }));
        ui.playPause.addEventListener('click', () => {
            const data = playersData.get(playerId);
            if (ui.audio.paused) {
                if (data.currentIndex === -1 && data.playlist.length > 0) {
                    playSongAtIndex(playerId, 0);
                } else if (data.currentIndex !== -1) {
                    ui.audio.play();
                }
            } else {
                ui.audio.pause();
            }
        });
        ui.next.addEventListener('click', () => {
            const data = playersData.get(playerId);
            const nextIndex = (data.repeatMode === REPEAT_ALL && data.currentIndex === data.playlist.length - 1)
                ? 0
                : data.currentIndex + 1;
            if(nextIndex < data.playlist.length) playSongAtIndex(playerId, nextIndex);
        });
        ui.prev.addEventListener('click', () => {
            const data = playersData.get(playerId);
            if (data.currentIndex > 0) playSongAtIndex(playerId, data.currentIndex - 1);
        });
        renderTrackInfo(ui, { title: "Noxss Player", artist: "Pronto" });
        renderPlayerState(ui, { isPlaying: false, controlsEnabled: false });
    }

    // --- 6. API Pública do Player ---
    const PlayerAPI = {
        initById: (playerId) => {
            const playerElement = document.getElementById(playerId);
            if (playerElement) initializeInstance(playerElement);
        },
        setPlaylist: (playerId, songUrls, playImmediately = false, repeatMode = REPEAT_ALL) => {
            const data = playersData.get(playerId);
            if (!data) {
                console.error(`Noxss Player (${playerId}): Player não inicializado.`);
                return;
            }
            data.playlist = songUrls || [];
            data.currentIndex = -1;
            data.repeatMode = [REPEAT_NONE, REPEAT_ALL, REPEAT_ONE].includes(repeatMode) ? repeatMode : REPEAT_ALL;
            data.ui.audio.src = "";
            if (data.playlist.length > 0) {
                if (playImmediately) {
                    playSongAtIndex(playerId, 0);
                } else {
                    loadTrack(playerId, 0);
                }
            } else {
                renderTrackInfo(data.ui, { title: "Playlist vazia" });
                renderPlayerState(data.ui, { isPlaying: false, controlsEnabled: false });
            }
        },
        setRepeatMode: (playerId, mode) => {
            const data = playersData.get(playerId);
            if (data && [REPEAT_NONE, REPEAT_ALL, REPEAT_ONE].includes(mode)) {
                data.repeatMode = mode;
            } else {
                console.error(`Noxss Player (${playerId}): Modo de repetição inválido ou player não encontrado.`);
            }
        }
    };

    Noxss.Player = PlayerAPI;

    document.addEventListener('DOMContentLoaded', () => {
        const playersOnPage = document.querySelectorAll('.noxss-player-compact[id]');
        playersOnPage.forEach(playerEl => PlayerAPI.initById(playerEl.id));
    });

})(window.Noxss, window, document);