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

})(window.Noxss, window, document);