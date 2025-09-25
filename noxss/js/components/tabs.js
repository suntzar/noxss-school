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

})(window.Noxss, window, document);