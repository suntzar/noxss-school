/**
 * effects.js
 *
 * Este arquivo é responsável por inicializar bibliotecas de efeitos visuais
 * de terceiros, como o Waves.js para o efeito de ondulação (ripple).
 *
 * Manter essa lógica separada ajuda a organizar melhor o código e facilita
 * a adição ou remoção de efeitos no futuro.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Verifica se a biblioteca Waves está disponível no escopo da janela.
  if (typeof Waves !== "undefined") {
    // Inicializa a biblioteca.
    Waves.init();

    // Aplica o efeito a uma seleção geral de elementos interativos.
    // Usamos 'waves-light' para um efeito de ondulação claro, que funciona
    // bem tanto em temas escuros quanto claros.
    Waves.attach(".noxss-btn--primary, .noxss-btn--secundary", ["waves-light"]);

    console.log("Efeito Waves inicializado com sucesso.");
  }
});
