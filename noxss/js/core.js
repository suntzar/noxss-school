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


})(window);