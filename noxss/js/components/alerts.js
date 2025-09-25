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

})(window.Noxss, window, document);