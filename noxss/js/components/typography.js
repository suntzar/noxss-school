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

})(window.Noxss, window, document);