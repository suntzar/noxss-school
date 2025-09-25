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

})(window.Noxss, window, document);