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

})(window.Noxss, window, document);