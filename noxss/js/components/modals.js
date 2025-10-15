/* ==========================================================================
   Noxss Library: Modals Component (JavaScript)
   - Lógica para controlar a interatividade e acessibilidade de modais.
   - Versão: 1.0
   - Depende de: js/core.js
   ========================================================================== */

(function (Noxss, window, document) {
  "use strict";

  if (!Noxss) {
    console.error("Noxss Core (core.js) é necessário, mas não foi encontrado.");
    return;
  }

  // Armazena os templates de modais declarados no HTML
  const modalTemplates = new Map();
  // Armazena as instâncias ativas (clones) dos modais abertos
  const activeModals = new Map();

  // Elementos que podem receber foco do teclado
  const FOCUSABLE_ELEMENTS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

  let openModalStack = []; // Rastreia a pilha de modais abertos

  /**
   * Abre um modal específico.
   * @param {string} templateId - O ID do template do modal a ser clonado e aberto.
   */
  function openModal(templateId, triggerElement = null) {
    const template = modalTemplates.get(templateId);
    if (!template) {
      console.warn(`Noxss Modals: Template de modal com ID "${templateId}" não encontrado.`);
      return;
    }

    // --- Lógica de Clonagem ---
    const clone = template.cloneNode(true);
    const instanceId = `${templateId}-${Date.now()}`;
    clone.id = instanceId;
    clone.classList.add("is-clone"); // Marca como uma instância clonada
    clone.removeAttribute("data-noxss-modal"); // Previne que o clone seja tratado como um template

    document.body.appendChild(clone);

    // Armazena a instância ativa
    activeModals.set(instanceId, {
      element: clone,
      triggerElement: triggerElement,
    });

    // Adiciona listeners de fechar específicos para esta instância
    clone.addEventListener("click", (event) => {
      if (event.target === clone) closeModal(instanceId);
    });
    clone.querySelectorAll("[data-noxss-modal-close]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(instanceId));
    });

    // --- Lógica de Abertura ---
    if (openModalStack.length === 0) {
      document.body.style.overflow = "hidden"; // Impede o scroll do body apenas no primeiro modal
    }

    openModalStack.push(instanceId);

    // Força um reflow para garantir que a transição de abertura funcione
    void clone.offsetWidth;

    clone.classList.add("is-open");

    // Move o foco para dentro do modal
    const firstFocusable = clone.querySelector(FOCUSABLE_ELEMENTS);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Fecha o modal atualmente aberto.
   * @param {string} [instanceId] - O ID da instância do modal a ser fechado. Se omitido, fecha o último aberto.
   */
  function closeModal(instanceId) {
    if (openModalStack.length === 0) {
      return;
    }

    // Se nenhum ID for fornecido, fecha o modal no topo da pilha.
    // Caso contrário, fecha o modal específico, mesmo que não seja o do topo.
    const instanceIdToClose = instanceId || openModalStack[openModalStack.length - 1];
    const stackIndex = openModalStack.findIndex((id) => id === instanceIdToClose);

    if (stackIndex === -1) return; // O modal não está (ou já não está mais) na pilha de abertos.

    openModalStack.splice(stackIndex, 1); // Remove o modal da pilha
    const modalInstance = activeModals.get(instanceIdToClose);

    if (!modalInstance) return;

    const modalElement = modalInstance.element;
    modalElement.classList.remove("is-open"); // Inicia a animação de saída

    // Remove o elemento do DOM após a animação
    modalElement.addEventListener(
      "transitionend",
      () => {
        modalElement.remove();
        activeModals.delete(instanceIdToClose);
      },
      { once: true }
    );

    // Devolve o foco para o elemento que abriu o modal, se possível
    if (modalInstance.triggerElement) {
      modalInstance.triggerElement.focus();
    }

    // Restaura o scroll do body apenas ao fechar o último modal
    if (openModalStack.length === 0) {
      document.body.style.overflow = "";
    }
  }

  /**
   * Gerencia a navegação por Tab (focus trap).
   * @param {KeyboardEvent} event
   */
  function handleFocusTrap(event) {
    if (event.key !== "Tab" || openModalStack.length === 0) return;

    const activeModalId = openModalStack[openModalStack.length - 1];
    const activeModalInstance = activeModals.get(activeModalId);
    if (!activeModalInstance) return;

    const focusableElements = Array.from(activeModalInstance.element.querySelectorAll(FOCUSABLE_ELEMENTS));
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  const ModalsAPI = {
    init: function () {
      // 1. Encontra e armazena todos os templates de modais declarados no HTML.
      const modalElements = document.querySelectorAll("[data-noxss-modal]");
      modalElements.forEach((modalEl) => {
        const modalId = modalEl.id;
        if (!modalId) {
          console.warn("Noxss Modals: Modal encontrado sem um ID. A inicialização foi ignorada.", modalEl);
          return;
        }
        // Armazena o próprio elemento como o template.
        modalTemplates.set(modalId, modalEl);
      });

      // 2. Usa delegação de eventos para lidar com todos os cliques de forma eficiente.
      document.body.addEventListener("click", (event) => {
        const openTrigger = event.target.closest("[data-noxss-modal-open]");
        const closeTrigger = event.target.closest("[data-noxss-modal-close]");

        if (openTrigger) {
          event.preventDefault();
          const modalId = openTrigger.dataset.noxssModalOpen;
          if (modalId) {
            openModal(modalId, openTrigger);
          }
        }

        if (closeTrigger) {
          event.preventDefault();
          // Encontra o modal pai do botão de fechar e obtém seu ID de instância
          const modalToClose = event.target.closest(".noxss-modal.is-clone");
          if (modalToClose) {
            closeModal(modalToClose.id);
          }
        }
      });

      // 3. Listeners globais para fechar com 'Esc' e para o focus trap.
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && openModalStack.length > 0) {
          // Fecha o modal do topo da pilha com a tecla 'Esc'
          closeModal(openModalStack[openModalStack.length - 1]);
        }
        handleFocusTrap(event);
      });
    },

    open: openModal,
    close: closeModal,
  };

  Noxss.Modals = ModalsAPI;

  // Auto-inicialização
  document.addEventListener("DOMContentLoaded", () => Noxss.Modals.init());
})(window.Noxss, window, document);
