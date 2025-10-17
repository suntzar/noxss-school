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

  // Armazena o estado de todos os modais inicializados
  const modals = new Map();

  // Elementos que podem receber foco do teclado
  const FOCUSABLE_ELEMENTS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

  let openModalStack = []; // Rastreia a pilha de modais abertos
  let backdropElement = null; // Referência ao elemento de backdrop único

  /**
   * Abre um modal específico.
   * @param {string} modalId - O ID do modal a ser aberto.
   * @param {HTMLElement} [triggerElement=null] - O elemento que acionou a abertura.
   */
  function openModal(modalId, triggerElement = null) {
    const modal = modals.get(modalId);
    if (!modal || modal.isOpen) {
      if (!modal) console.warn(`Noxss Modals: Modal com ID "${modalId}" não encontrado.`);
      return;
    }

    modal.triggerElement = triggerElement;
    modal.isOpen = true;

    if (openModalStack.length === 0) {
      document.body.style.overflow = "hidden"; // Impede o scroll do body apenas no primeiro modal
      // Cria e exibe o backdrop único
      if (!backdropElement) {
        backdropElement = document.createElement("div");
        backdropElement.className = "noxss-modal-backdrop";
        document.body.appendChild(backdropElement);
        // Força reflow para a animação de fade-in do backdrop
        void backdropElement.offsetWidth;
      }
      backdropElement.classList.add("is-open");
    }

    openModalStack.push(modalId);

    // Força um reflow para garantir que a transição de abertura funcione
    void modal.element.offsetWidth;

    modal.element.classList.add("is-open");

    // Move o foco para dentro do modal
    const firstFocusable = modal.element.querySelector(FOCUSABLE_ELEMENTS);
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Dispara um evento customizado para notificar que um modal foi aberto
    document.body.dispatchEvent(
      new CustomEvent("noxss:modal:open", {
        bubbles: true,
        detail: { modalId: modalId, modalElement: modal.element },
      })
    );
  }

  /**
   * Fecha um modal específico ou o último aberto na pilha.
   * @param {string} [modalId] - O ID do modal a ser fechado. Se omitido, fecha o último aberto.
   */
  function closeModal(modalId) {
    if (openModalStack.length === 0) return;

    const idToClose = modalId || openModalStack[openModalStack.length - 1];
    const modal = modals.get(idToClose);

    if (!modal || !modal.isOpen) return;

    // Remove da pilha de modais abertos
    openModalStack = openModalStack.filter((id) => id !== idToClose);

    modal.isOpen = false;
    modal.element.classList.remove("is-open"); // Inicia a animação de saída

    // Esconde o backdrop se este for o último modal a ser fechado
    if (openModalStack.length === 0 && backdropElement) {
      backdropElement.classList.remove("is-open");

      // Adiciona um listener para remover o backdrop do DOM após a animação de fade-out
      backdropElement.addEventListener(
        "transitionend",
        () => {
          if (backdropElement) backdropElement.remove();
          backdropElement = null;
        },
        { once: true }
      );
    }

    // Dispara um evento customizado para notificar que um modal foi fechado
    document.body.dispatchEvent(
      new CustomEvent("noxss:modal:close", {
        bubbles: true,
        detail: { modalId: idToClose, modalElement: modal.element },
      })
    );

    // Devolve o foco para o próximo modal na pilha ou para o elemento gatilho
    if (openModalStack.length > 0) {
      const nextActiveModalId = openModalStack[openModalStack.length - 1];
      const nextModal = modals.get(nextActiveModalId);
      const firstFocusable = nextModal?.element.querySelector(FOCUSABLE_ELEMENTS);
      if (firstFocusable) firstFocusable.focus();
    } else if (modal.triggerElement) {
      modal.triggerElement.focus();
    }

    // Restaura o scroll do body apenas quando o último modal for fechado
    if (openModalStack.length === 0) {
      document.body.style.overflow = "";
    }
  }

  /**
   * Gerencia a navegação por Tab para manter o foco dentro do modal ativo (focus trap).
   * @param {KeyboardEvent} event
   */
  function handleFocusTrap(event) {
    if (event.key !== "Tab" || openModalStack.length === 0) return;

    const activeModalId = openModalStack[openModalStack.length - 1];
    const activeModal = modals.get(activeModalId);
    if (!activeModal) return;

    const focusableElements = Array.from(activeModal.element.querySelectorAll(FOCUSABLE_ELEMENTS));
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: Se o foco está no primeiro elemento, move para o último.
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab: Se o foco está no último elemento, move para o primeiro.
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  const ModalsAPI = {
    init: function () {
      // 1. Encontra e armazena todos os modais declarados no HTML.
      const modalElements = document.querySelectorAll("[data-noxss-modal]");
      modalElements.forEach((modalEl) => {
        const modalId = modalEl.id;
        if (!modalId) {
          console.warn("Noxss Modals: Modal encontrado sem um ID. A inicialização foi ignorada.", modalEl);
          return;
        }
        modals.set(modalId, {
          element: modalEl,
          isOpen: false,
          triggerElement: null,
        });
      });

      // 2. Usa delegação de eventos para lidar com todos os cliques de forma eficiente.
      document.body.addEventListener("click", (event) => {
        const openTrigger = event.target.closest("[data-noxss-modal-open]");
        const closeTrigger = event.target.closest("[data-noxss-modal-close]");

        if (openTrigger) {
          event.preventDefault();
          const modalId = openTrigger.dataset.noxssModalOpen;
          if (modalId) openModal(modalId, openTrigger);
          return;
        }

        if (closeTrigger) {
          event.preventDefault();
          // Encontra o modal pai do botão de fechar
          const modalToClose = closeTrigger.closest(".noxss-modal");
          if (modalToClose) closeModal(modalToClose.id);
          return;
        }

        // Fecha ao clicar no backdrop (fundo)
        if (event.target.matches(".noxss-modal.is-open")) {
          closeModal(event.target.id);
        }
      });

      // 3. Listeners globais para fechar com 'Esc' e para o focus trap.
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && openModalStack.length > 0) {
          closeModal(); // Fecha o modal do topo da pilha
        }
        handleFocusTrap(event);
      });
    },

    open: openModal,
    close: closeModal, // Fecha o último modal aberto
  };

  Noxss.Modals = ModalsAPI;

  // Auto-inicialização
  document.addEventListener("DOMContentLoaded", () => Noxss.Modals.init());
})(window.Noxss, window, document);
