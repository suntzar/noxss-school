/*!
 * Noxss JS v1.0
 * Copyright 2025 [Seu Nome]
 * Gerado em: 2025-07-15T06:31:23.079Z
 */
/* ==========================================================================
   Noxss Library: Core JavaScript
   - Cria o namespace global da biblioteca para evitar conflitos.
   - Este arquivo DEVE ser carregado antes de qualquer outro script de
     componente da Noxss.
   - Versão: 1.0.0
   ========================================================================== */

(function (window) {
    'use strict';

    /**
     * Cria o objeto global `Noxss` se ele ainda não existir.
     * Este objeto servirá como o namespace para todos os módulos e
     * funções da biblioteca, prevenindo a poluição do escopo global (window).
     *
     * Exemplo de uso em outros arquivos:
     * Noxss.Player = { ... };
     * Noxss.Tabs = { ... };
     */
    window.Noxss = window.Noxss || {};

    /**
     * (Opcional) Você pode adicionar aqui uma propriedade de versão
     * para facilitar a depuração.
     */
    window.Noxss.version = '1.0.0';

    /**
     * (Opcional) Um espaço para funções utilitárias que podem ser
     * usadas por múltiplos componentes.
     *
     * Exemplo:
     * Noxss.utils = {
     *   debounce: function(func, wait) { ... },
     *   throttle: function(func, limit) { ... }
     * };
     */
    window.Noxss.utils = window.Noxss.utils || {};


})(window);;

/* ==========================================================================
   Noxss Library: Alerts Component (JavaScript)
   - Lógica para tornar os alertas dispensáveis.
   - Versão: 1.0
   - Depende de: js/core.js
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }
    
    /**
     * Adiciona a classe de saída e remove o alerta do DOM após a animação.
     * @param {HTMLElement} alertElement - O elemento .noxss-alert a ser removido.
     */
    function dismissAlert(alertElement) {
        if (!alertElement) return;

        // Adiciona a classe que dispara a animação de saída do CSS.
        alertElement.classList.add('is-hiding');
        
        // Ouve o final da animação para remover o elemento do DOM de forma limpa.
        alertElement.addEventListener('animationend', () => {
            alertElement.remove();
        }, { once: true }); // O listener é removido automaticamente após ser executado.
    }

    const AlertsAPI = {
        /**
         * Inicializa todos os alertas dispensáveis na página ou dentro de um contêiner específico.
         * Procura por botões de fechar e adiciona os event listeners necessários.
         * @param {HTMLElement|Document} [container=document] - O contêiner para buscar os alertas.
         */
        init: function(container = document) {
            const closeButtons = container.querySelectorAll('.noxss-alert__close-btn');
            
            closeButtons.forEach(button => {
                // Previne que o mesmo botão seja inicializado múltiplas vezes.
                if (button.dataset.alertInitialized) return;

                const alertElement = button.closest('.noxss-alert');
                if (alertElement) {
                    button.addEventListener('click', (event) => {
                        event.preventDefault();
                        dismissAlert(alertElement);
                    });
                    button.dataset.alertInitialized = true;
                }
            });
        }
    };

    // Anexa a API ao namespace global da Noxss.
    Noxss.Alerts = AlertsAPI;

    // Auto-inicialização de todos os alertas na página quando o DOM estiver pronto.
    document.addEventListener('DOMContentLoaded', () => {
        Noxss.Alerts.init();
    });

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: FAB Component (JavaScript)
   - Versão: 1.3 (Controle de ação centralizado e desacoplado)
   - Gerencia o estado, ação e animação do Botão de Ação Flutuante.
   - Ouve o evento 'noxss:tab:change' para se atualizar.
   ========================================================================== */
(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário.");
        return;
    }

    const FabController = {
        fabElement: null,
        contentWrappers: [],
        activeWrapperIndex: 0,
        defaultIcon: 'plus',
        currentAction: null, // Armazena a ação atual: { type: 'modal'|'function', value: '...' }

        init: function(selector = '.noxss-fab') {
            this.fabElement = document.querySelector(selector);
            if (!this.fabElement) return;

            this.setupContentWrappers();
            this.bindEvents();
        },
        
        setupContentWrappers: function() {
            this.fabElement.innerHTML = '';
            for (let i = 0; i < 2; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'noxss-fab__content-wrapper';
                this.fabElement.appendChild(wrapper);
                this.contentWrappers.push(wrapper);
            }
        },

        bindEvents: function() {
            document.body.addEventListener('noxss:tab:change', (event) => {
                this.updateState(event.detail.targetPanel);
            });
            
            // O listener de clique agora é o único ponto que dispara a ação.
            this.fabElement.addEventListener('click', (event) => {
                this.executeAction(event);
            });
        },
        
        updateState: function(activePanel) {
            if (!this.fabElement) return;
            
            const isVisible = activePanel && activePanel.hasAttribute('data-fab-visible');
            this.fabElement.classList.toggle('is-hidden', !isVisible);

            if (isVisible) {
                this.updateContent(activePanel);
                
                // Armazena a ação em vez de modificar os atributos do DOM.
                if (activePanel.dataset.fabTarget) {
                    this.currentAction = { type: 'modal', value: activePanel.dataset.fabTarget };
                } else if (activePanel.dataset.fabAction) {
                    this.currentAction = { type: 'function', value: activePanel.dataset.fabAction };
                } else {
                    this.currentAction = null;
                }
            } else {
                this.currentAction = null; // Limpa a ação se o FAB for ocultado.
            }
        },

        updateContent: function(activePanel) {
            const nextContentHTML = this.getContentHTML(activePanel);
            const currentWrapper = this.contentWrappers[this.activeWrapperIndex];
            if (currentWrapper.innerHTML.trim() === nextContentHTML.trim()) return;

            const nextWrapperIndex = (this.activeWrapperIndex + 1) % 2;
            const nextWrapper = this.contentWrappers[nextWrapperIndex];
            
            nextWrapper.innerHTML = nextContentHTML;
            currentWrapper.classList.remove('is-active');
            nextWrapper.classList.add('is-active');
            
            this.activeWrapperIndex = nextWrapperIndex;
        },

        getContentHTML: function(activePanel) {
            if (activePanel.hasAttribute('data-fab-html')) {
                return activePanel.dataset.fabHtml;
            }
            if (window.feather) {
                const iconName = activePanel.dataset.fabIcon || this.defaultIcon;
                const icon = feather.icons[iconName] || feather.icons[this.defaultIcon];
                return icon.toSvg({ class: 'noxss-icon' });
            }
            return '<span style="font-size: 2rem; line-height: 1;">+</span>';
        },

        /**
         * Executa a ação armazenada baseada no contexto da aba ativa.
         * @param {Event} event - O evento de clique.
         */
        executeAction: function(event) {
            if (!this.currentAction) return;

            event.preventDefault();

            switch (this.currentAction.type) {
                case 'modal':
                    // Prioriza a API de modais da Noxss, se existir.
                    if (Noxss.Modals && typeof Noxss.Modals.open === 'function') {
                        const modalId = this.currentAction.value.replace(/^#/, '');
                        Noxss.Modals.open(modalId);
                    } 
                    // Fallback para o Bootstrap.
                    else if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
                        const modalEl = document.querySelector(this.currentAction.value);
                        if (modalEl) {
                            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                            modalInstance.show();
                        } else {
                             console.warn(`Noxss FAB: Modal com seletor "${this.currentAction.value}" não encontrado.`);
                        }
                    }
                    break;

                case 'function':
                    try {
                        new Function(this.currentAction.value)();
                    } catch (e) {
                        console.error(`Noxss FAB: Erro ao executar a ação "${this.currentAction.value}"`, e);
                    }
                    break;
            }
        }
    };

    // Anexa à biblioteca e auto-inicializa.
    Noxss.Fab = FabController;
    document.addEventListener('DOMContentLoaded', () => Noxss.Fab.init());

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Forms Component (JavaScript)
   - Lógica para aprimorar elementos de formulário, como o input range.
   - Versão: 1.0
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';
    if (!Noxss) { console.error("Noxss Core é necessário."); return; }

    const FormsAPI = {
        init: function() {
            this.initRangeSliders();
        },

        initRangeSliders: function(container = document) {
            const sliders = container.querySelectorAll('.noxss-range');
            sliders.forEach(slider => {
                if (slider.dataset.rangeInitialized) return;

                // Cria o wrapper e o tooltip dinamicamente
                const wrapper = document.createElement('div');
                wrapper.className = 'noxss-range-wrapper';
                slider.parentNode.insertBefore(wrapper, slider);
                wrapper.appendChild(slider);

                const tooltip = document.createElement('span');
                tooltip.className = 'noxss-range-tooltip';
                wrapper.appendChild(tooltip);

                // Função para atualizar o preenchimento e o tooltip
                const updateSlider = () => {
                    const min = parseFloat(slider.min) || 0;
                    const max = parseFloat(slider.max) || 100;
                    const value = parseFloat(slider.value);
                    
                    // Calcula a porcentagem
                    const percent = ((value - min) / (max - min)) * 100;
                    
                    // Atualiza a variável CSS para o gradiente
                    slider.style.setProperty('--value-percent', `${percent}%`);

                    // Atualiza o tooltip
                    tooltip.textContent = value;
                    // Posiciona o tooltip acima do polegar
                    tooltip.style.left = `calc(${percent}% + (${10 - percent * 0.2}px))`;
                };

                // Listeners de evento
                slider.addEventListener('input', updateSlider);
                slider.addEventListener('mousedown', () => wrapper.classList.add('is-active'));
                slider.addEventListener('touchstart', () => wrapper.classList.add('is-active'));
                slider.addEventListener('mouseup', () => wrapper.classList.remove('is-active'));
                slider.addEventListener('touchend', () => wrapper.classList.remove('is-active'));
                
                // Atualização inicial
                updateSlider();
                slider.dataset.rangeInitialized = true;
            });
        }
    };

    Noxss.Forms = FormsAPI;
    document.addEventListener('DOMContentLoaded', () => Noxss.Forms.init());

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Modals Component (JavaScript)
   - Lógica para controlar a interatividade e acessibilidade de modais.
   - Versão: 1.0
   - Depende de: js/core.js
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }

    // Armazena o estado de todos os modais inicializados
    const modals = new Map();

    // Elementos que podem receber foco do teclado
    const FOCUSABLE_ELEMENTS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

    let openModalId = null; // Rastreia o ID do modal atualmente aberto

    /**
     * Abre um modal específico.
     * @param {string} modalId - O ID do modal a ser aberto.
     */
    function openModal(modalId) {
        const modal = modals.get(modalId);
        if (!modal || modal.isOpen) return;

        openModalId = modalId;
        modal.element.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // Impede o scroll do body

        // Move o foco para dentro do modal
        const firstFocusable = modal.element.querySelector(FOCUSABLE_ELEMENTS);
        if (firstFocusable) {
            firstFocusable.focus();
        }

        modal.isOpen = true;
    }

    /**
     * Fecha o modal atualmente aberto.
     */
    function closeModal() {
        if (!openModalId) return;

        const modal = modals.get(openModalId);
        if (modal) {
            modal.element.classList.remove('is-open');
            document.body.style.overflow = ''; // Restaura o scroll do body
            modal.isOpen = false;
        }
        
        // Devolve o foco para o elemento que abriu o modal, se possível
        if (modal.triggerElement) {
            modal.triggerElement.focus();
        }
        
        openModalId = null;
    }

    /**
     * Gerencia a navegação por Tab (focus trap).
     * @param {KeyboardEvent} event 
     */
    function handleFocusTrap(event) {
        if (event.key !== 'Tab' || !openModalId) return;

        const modalElement = modals.get(openModalId)?.element;
        if (!modalElement) return;

        const focusableElements = Array.from(modalElement.querySelectorAll(FOCUSABLE_ELEMENTS));
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    const ModalsAPI = {
        init: function() {
            // Encontra todos os modais declarados no HTML
            const modalElements = document.querySelectorAll('[data-noxss-modal]');
            modalElements.forEach(modalEl => {
                const modalId = modalEl.id;
                if (!modalId) {
                    console.warn("Noxss Modals: Modal encontrado sem um ID. A inicialização foi ignorada.", modalEl);
                    return;
                }
                modals.set(modalId, {
                    element: modalEl,
                    isOpen: false,
                    triggerElement: null // Armazena quem abriu o modal
                });

                // Adiciona listener para fechar ao clicar no backdrop
                modalEl.addEventListener('click', (event) => {
                    if (event.target === modalEl) {
                        closeModal();
                    }
                });
            });

            // Encontra todos os gatilhos que abrem modais
            const openTriggers = document.querySelectorAll('[data-noxss-modal-open]');
            openTriggers.forEach(trigger => {
                const modalId = trigger.dataset.noxssModalOpen;
                trigger.addEventListener('click', (event) => {
                    const modal = modals.get(modalId);
                    if (modal) {
                        modal.triggerElement = event.currentTarget; // Guarda o gatilho
                    }
                    openModal(modalId);
                });
            });
            
            // Encontra todos os gatilhos que fecham modais
            const closeTriggers = document.querySelectorAll('[data-noxss-modal-close]');
            closeTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    closeModal();
                });
            });

            // Listeners globais para fechar com 'Esc' e para o focus trap
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && openModalId) {
                    closeModal();
                }
                handleFocusTrap(event);
            });
        },

        open: openModal,
        close: closeModal
    };

    Noxss.Modals = ModalsAPI;

    // Auto-inicialização
    document.addEventListener('DOMContentLoaded', () => Noxss.Modals.init());

})(window.Noxss, window, document);;

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

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Tabs Component (JavaScript)
   - Versão: 1.4 (Lógica do FAB completamente removida e desacoplada)
   - Lógica para abas deslizantes, com emissão de evento 'noxss:tab:change'.
   - Depende de: js/core.js
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }

    /**
     * Mede componentes de layout e ajusta variáveis CSS globais.
     * Crucial para o posicionamento dinâmico de elementos como o FAB.
     */
    function initLayoutAdjustments() {
        const bottomNav = document.querySelector('.noxss-navbar--bottom');
        const root = document.documentElement;
        if (bottomNav && bottomNav.offsetParent !== null) {
            root.style.setProperty('--noxss-safe-area-inset-bottom', `${bottomNav.offsetHeight}px`);
        } else {
            root.style.setProperty('--noxss-safe-area-inset-bottom', '0px');
        }
    }

    const Tabs = {
        /**
         * Propriedade pública para consultar a aba ativa a qualquer momento.
         * É atualizada pela função interna `updateActiveState`.
         */
        activeTabId: null,

        /**
         * Inicializa todos os sistemas de abas encontrados na página.
         * @param {string} [selector='.noxss-tabs'] - O seletor dos contêineres de abas.
         */
        init: function (selector = '.noxss-tabs') {
            document.querySelectorAll(selector).forEach(system => {
                if (system.dataset.tabsInitialized) return; // Previne re-inicialização
                this.setup(system);
                system.dataset.tabsInitialized = true;
            });
        },

        /**
         * Configura uma instância individual de um sistema de abas.
         * @param {HTMLElement} systemElement - O elemento contêiner .noxss-tabs.
         */
        setup: function (systemElement) {
            // --- 1. Seleção de Elementos ---
            const contentArea = systemElement.querySelector('.noxss-tabs__content-area');
            const panels = Array.from(systemElement.querySelectorAll('.noxss-tabs__panel'));
            
            // Seleciona todos os botões de controle de abas no documento
            const allButtons = Array.from(document.querySelectorAll(`[data-tab-id]`));

            if (!contentArea || panels.length === 0) {
                console.error("Noxss Tabs: Estrutura HTML (.noxss-tabs__content-area ou .noxss-tabs__panel) não encontrada.", systemElement);
                return;
            }

            // --- 2. Funções de Lógica e Estado ---
            let scrollTimeout;

            /**
             * Atualiza o estado ativo dos botões e emite o evento de mudança.
             * @param {string} activeTabId - O ID da aba que se tornou ativa.
             */
            const updateActiveState = (activeTabId) => {
                if (this.activeTabId === activeTabId) return; // Otimização: não faz nada se a aba já for a ativa.

                this.activeTabId = activeTabId; // Atualiza o estado público

                // Atualiza a classe '.is-active' nos botões corretos
                allButtons.forEach(button => {
                    // Garante que um botão só seja afetado se pertencer a este sistema de abas
                    const buttonControlsThisSystem = systemElement.querySelector(`#panel-${button.dataset.tabId}`);
                    if (buttonControlsThisSystem) {
                         button.classList.toggle('is-active', button.dataset.tabId === activeTabId);
                    }
                });
                
                // Dispara o evento customizado no elemento principal do sistema de abas
                systemElement.dispatchEvent(new CustomEvent('noxss:tab:change', {
                    bubbles: true, // Permite que o evento seja capturado por elementos pais (como o body)
                    detail: { 
                        activeTabId: activeTabId, 
                        targetPanel: document.getElementById(`panel-${activeTabId}`) 
                    }
                }));
            };
            
            /**
             * Rola a área de conteúdo para a aba especificada.
             * @param {string} tabId - O ID da aba de destino.
             */
            const switchToTab = (tabId) => {
                const panelIndex = panels.findIndex(p => p.id === `panel-${tabId}`);
                if (panelIndex !== -1) {
                    contentArea.scrollTo({
                        left: contentArea.offsetWidth * panelIndex,
                        behavior: 'smooth'
                    });
                }
            };
            
            // --- 3. Vinculação de Eventos ---

            // Adiciona listener de clique para cada botão que controla este sistema de abas
            allButtons.forEach(button => {
                if (systemElement.querySelector(`#panel-${button.dataset.tabId}`)) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        switchToTab(button.dataset.tabId);
                    });
                }
            });

            // Listener para o scroll (swipe) do usuário
            contentArea.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const currentIndex = Math.round(contentArea.scrollLeft / contentArea.offsetWidth);
                    const activePanel = panels[currentIndex];
                    if (activePanel) {
                        const activeTabId = activePanel.id.replace('panel-', '');
                        updateActiveState(activeTabId);
                    }
                }, 10); // Debounce rápido para resposta imediata
            });

            // Intersection Observer para animação de fade-in dos painéis
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    entry.target.classList.toggle('is-visible', entry.isIntersecting);
                });
            }, { root: contentArea, threshold: 0.4 });
            panels.forEach(panel => observer.observe(panel));
            
            // --- 4. Inicialização ---
            const defaultTabId = systemElement.dataset.defaultTab || panels[0]?.id.replace('panel-', '');
            if (defaultTabId) {
                setTimeout(() => {
                     const panelIndex = panels.findIndex(p => p.id === `panel-${defaultTabId}`);
                     if(panelIndex !== -1) {
                         contentArea.scrollTo({ left: contentArea.offsetWidth * panelIndex, behavior: 'auto' });
                         updateActiveState(defaultTabId);
                     }
                }, 150); // Delay para garantir que o layout esteja renderizado
            }
        }
    };

    Noxss.Tabs = Tabs;

    document.addEventListener('DOMContentLoaded', () => {
        initLayoutAdjustments();
        Noxss.Tabs.init();
        window.addEventListener('resize', initLayoutAdjustments);
    });

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Toasts Component (JavaScript)
   - Versão: 2.0 (Com posicionamento e direção customizáveis)
   - Lógica para criar, exibir e gerenciar notificações não-intrusivas.
   - Depende de: js/core.js
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }

    // Gerencia múltiplos contêineres, um para cada posição na tela.
    const containers = new Map();

    // Ícones Feather correspondentes a cada status.
    const ICONS = {
        success: '<i data-feather="check-circle" class="noxss-icon"></i>',
        danger: '<i data-feather="alert-circle" class="noxss-icon"></i>',
        warning: '<i data-feather="alert-triangle" class="noxss-icon"></i>',
        info: '<i data-feather="info" class="noxss-icon"></i>'
    };
    
    /**
     * Busca ou cria um contêiner de toast para uma posição específica no DOM.
     * @param {string} position - ex: 'top-right', 'bottom-center'.
     * @returns {HTMLElement} O elemento do contêiner.
     */
    function getOrCreateContainer(position) {
        if (containers.has(position)) {
            return containers.get(position);
        }

        const container = document.createElement('div');
        // Adiciona a classe base e a classe modificadora de posição.
        container.className = `noxss-toast-container noxss-toast-container--${position}`;
        document.body.appendChild(container);
        containers.set(position, container);
        return container;
    }
    
    /**
     * Adiciona a classe de saída e remove o toast do DOM após a animação.
     * @param {HTMLElement} toastElement 
     */
    function removeToast(toastElement) {
        toastElement.classList.add('is-hiding');
        
        // O listener 'animationend' garante que o elemento só seja removido
        // após a transição de saída do CSS ter terminado.
        toastElement.addEventListener('animationend', () => {
            toastElement.remove();
        }, { once: true });
    }

    const ToastsAPI = {
        /**
         * Exibe um novo toast com opções customizáveis.
         * @param {object|string} options - Um objeto de opções ou uma string de mensagem.
         * @param {string} options.message - O texto a ser exibido.
         * @param {string} [options.status='info'] - O tipo de toast (success, danger, warning, info).
         * @param {number} [options.duration=4000] - Duração em ms para o toast ficar visível.
         * @param {boolean} [options.closable=true] - Se deve mostrar um botão de fechar.
         * @param {string} [options.position='bottom-right'] - Posição na tela.
         */
        show: function(options) {
            // Permite chamar a função com apenas uma string para conveniência.
            if (typeof options === 'string') {
                options = { message: options };
            }

            const {
                message,
                status = 'info',
                duration = 4000,
                closable = true,
                position = 'bottom-right' // Nova opção de posicionamento!
            } = options;

            const container = getOrCreateContainer(position);
            const toastElement = document.createElement('div');
            toastElement.className = `noxss-toast noxss-toast--${status}`;
            
            const iconHTML = ICONS[status] || ICONS.info;

            const closeButtonHTML = closable 
                ? `<button class="noxss-toast__close-btn" aria-label="Fechar notificação"><i data-feather="x" class="noxss-icon"></i></button>`
                : '';

            toastElement.innerHTML = `
                <div class="noxss-toast__icon">${iconHTML}</div>
                <div class="noxss-toast__message">${message}</div>
                ${closeButtonHTML}
            `;

            // Adiciona ao contêiner correto. O CSS (flex-direction: column-reverse)
            // cuida do empilhamento visual correto para as posições inferiores.
            container.appendChild(toastElement);

            // Re-renderiza os ícones Feather que acabamos de adicionar ao DOM.
            if (window.feather) {
                window.feather.replace();
            }

            // Adiciona a lógica para o botão de fechar, se ele existir.
            const closeBtn = toastElement.querySelector('.noxss-toast__close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => removeToast(toastElement));
            }
            
            // Inicia o timer para auto-remoção do toast.
            setTimeout(() => {
                removeToast(toastElement);
            }, duration);
        }
    };

    // Anexa a API ao namespace global da Noxss.
    Noxss.Toasts = ToastsAPI;

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Typography (JavaScript) - v2.1 (Lógica Simplificada)
   - Gerencia Highlight.js e funcionalidade de "Copiar" para blocos de código.
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';

    if (!Noxss) {
        console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
        return;
    }

    const Typography = {
        init: function () {
            this.initCodeBlocks();
        },

        initCodeBlocks: function () {
            const codeBlocks = document.querySelectorAll('.noxss-code-block');
            if (codeBlocks.length === 0) return;

            // Verifica se o highlight.js está disponível
            if (typeof hljs === 'undefined') {
                console.warn('Noxss Typography: highlight.js (hljs) não foi encontrado.');
            }

            codeBlocks.forEach(blockWrapper => {
                const codeElement = blockWrapper.querySelector('pre code');
                if (codeElement) {
                    // 1. Aplica o highlighting, se disponível
                    if (typeof hljs !== 'undefined') {
                        hljs.highlightElement(codeElement);
                    }

                    // 2. Cria e adiciona o botão de cópia
                    this.createCopyButton(blockWrapper, codeElement);
                }
            });
        },

        /**
         * Cria, insere e adiciona a lógica a um botão de "Copiar" simplificado.
         * @param {HTMLElement} wrapper - O elemento .noxss-code-block.
         * @param {HTMLElement} codeElement - O elemento <code> cujo texto será copiado.
         */
        createCopyButton: function (wrapper, codeElement) {
            const button = document.createElement('button');
            button.className = 'noxss-copy-btn';
            button.setAttribute('aria-label', 'Copiar código');
            button.setAttribute('title', 'Copiar código'); // Tooltip para desktop

            // SVG do ícone de Copiar (Feather)
            const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            
            button.innerHTML = copyIcon;
            
            let timeoutId = null;

            button.addEventListener('click', () => {
                navigator.clipboard.writeText(codeElement.innerText).then(() => {
                    // Sucesso! Mostra feedback visual.
                    button.classList.add('copied');
                    button.setAttribute('aria-label', 'Copiado!');
                    button.setAttribute('title', 'Copiado!');

                    // Limpa qualquer timeout anterior para evitar múltiplos resets
                    clearTimeout(timeoutId);

                    // Volta ao estado original após 2 segundos
                    timeoutId = setTimeout(() => {
                        button.classList.remove('copied');
                        button.setAttribute('aria-label', 'Copiar código');
                        button.setAttribute('title', 'Copiar código');
                    }, 2000);

                }).catch(err => {
                    console.error('Noxss Typography: Falha ao copiar texto.', err);
                    button.setAttribute('aria-label', 'Erro ao copiar');
                    button.setAttribute('title', 'Erro ao copiar');
                });
            });

            // Insere o botão no início do contêiner para que o <pre> venha depois
            wrapper.insertBefore(button, wrapper.firstChild);
        }
    };

    Noxss.Typography = Typography;

    document.addEventListener('DOMContentLoaded', () => {
        Noxss.Typography.init();
    });

})(window.Noxss, window, document);;

/* ==========================================================================
   Noxss Library: Dynamic Theme Generator
   - Gera paletas de cores claras ou escuras a partir de uma cor de destaque.
   - Versão: 2.1
   - Ativado via atributos: data-noxss-theme-gen="dark|light" e data-noxss-palette-gen="#RRGGBB"
   ========================================================================== */

(function () {
    if (!window.Noxss) {
        window.Noxss = {};
    }

    const ThemeGenerator = {
        hexToHsl(hex) {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return null;
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;

            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        },
        
        hslToHex(h, s, l) {
            s /= 100;
            l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s,
                x = c * (1 - Math.abs((h / 60) % 2 - 1)),
                m = l - c/2,
                r = 0, g = 0, b = 0;
            if (0 <= h && h < 60) { r = c; g = x; b = 0; }
            else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
            else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
            else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
            else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
            else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
            r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
            g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
            b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        },

        generateDarkPalette(accentHsl) {
            const H = accentHsl.h;
            const textOnAccent = accentHsl.l > 55 ? '#111111' : '#FFFFFF';
            const accentColorHex = this.hslToHex(H, accentHsl.s, accentHsl.l);

            return {
                '--noxss-bg-main':              `hsl(${H}, 10%, 10%)`,
                '--noxss-bg-surface':           `hsl(${H}, 12%, 14%)`,
                '--noxss-bg-elements':          `hsl(${H}, 12%, 17%)`,
                '--noxss-border-color':         `hsl(${H}, 10%, 22%)`,
                '--noxss-text-primary':         `hsl(${H}, 25%, 95%)`,
                '--noxss-text-secondary':       `hsl(${H}, 15%, 65%)`,
                '--noxss-accent-primary':       accentColorHex,
                '--noxss-accent-primary-hover': `hsl(${H}, ${accentHsl.s}%, ${Math.min(100, accentHsl.l + 8)}%)`,
                '--noxss-accent-primary-rgb':   `${parseInt(accentColorHex.slice(1, 3), 16)}, ${parseInt(accentColorHex.slice(3, 5), 16)}, ${parseInt(accentColorHex.slice(5, 7), 16)}`,
                '--noxss-text-on-accent':       textOnAccent,
            };
        },

        generateLightPalette(accentHsl) {
            const H = accentHsl.h;
            
            let adjustedL = accentHsl.l;
            if (accentHsl.l > 75) {
                adjustedL = 65;
            }
            
            const accentColorHex = this.hslToHex(H, accentHsl.s, adjustedL);
            const textOnAccent = adjustedL > 55 ? '#111111' : '#FFFFFF';

            return {
                '--noxss-bg-main':              `hsl(${H}, 25%, 97%)`,
                '--noxss-bg-surface':           '#ffffff',
                '--noxss-bg-elements':          `hsl(${H}, 25%, 97%)`,
                '--noxss-border-color':         `hsl(${H}, 20%, 90%)`,
                '--noxss-text-primary':         `hsl(${H}, 10%, 20%)`,
                '--noxss-text-secondary':       `hsl(${H}, 8%, 45%)`,
                '--noxss-accent-primary':       accentColorHex,
                '--noxss-accent-primary-hover': `hsl(${H}, ${accentHsl.s}%, ${Math.max(0, adjustedL - 8)}%)`,
                '--noxss-accent-primary-rgb':   `${parseInt(accentColorHex.slice(1, 3), 16)}, ${parseInt(accentColorHex.slice(3, 5), 16)}, ${parseInt(accentColorHex.slice(5, 7), 16)}`,
                '--noxss-text-on-accent':       textOnAccent,
            };
        },
        
        buildCss(palette) {
             const baseColors = {
                '--noxss-color-success': '#28a745',
                '--noxss-color-danger':  '#dc3545',
                '--noxss-color-warning': '#ffc107',
             };
             const finalPalette = {...palette, ...baseColors};
             return Object.entries(finalPalette).map(([key, value]) => `${key}: ${value};`).join('\n');
        },

        apply(cssVariables) {
            let styleTag = document.getElementById('noxss-dynamic-palette');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'noxss-dynamic-palette';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `[data-theme="generated"] {\n${cssVariables}\n}`;
            document.documentElement.setAttribute('data-theme', 'generated');
        },

        init() {
            const processNode = (node) => {
                const themeMode = node.getAttribute('data-noxss-theme-gen') || 'dark';
                const colorValue = node.getAttribute('data-noxss-palette-gen');
                
                if (colorValue) {
                    const accentHsl = this.hexToHsl(colorValue);
                    if (!accentHsl) return;

                    let palette;
                    if (themeMode === 'light') {
                        palette = this.generateLightPalette(accentHsl);
                    } else {
                        palette = this.generateDarkPalette(accentHsl);
                    }
                    
                    const cssVariables = this.buildCss(palette);
                    this.apply(cssVariables);
                }
            };
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && (mutation.attributeName === 'data-noxss-theme-gen' || mutation.attributeName === 'data-noxss-palette-gen')) {
                        processNode(mutation.target);
                    }
                });
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-noxss-theme-gen', 'data-noxss-palette-gen']
            });

            processNode(document.documentElement);
        }
    };

    window.Noxss.ThemeGenerator = ThemeGenerator;
    document.addEventListener('DOMContentLoaded', () => window.Noxss.ThemeGenerator.init());
})();;

