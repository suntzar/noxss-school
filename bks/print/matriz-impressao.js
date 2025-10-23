document.addEventListener("DOMContentLoaded", () => {
  const printContentEl = document.getElementById("printable-content");
  const printButton = document.getElementById("print-btn");
  const printControls = document.querySelector(".print-controls");

  // --- DADOS DE EXEMPLO ---
  // Em um caso real, estes dados viriam de uma API, localStorage, etc.
  const dadosExemplo = {
    titulo: "Relatório de Vendas - Q1 2024",
    secoes: [
      {
        subtitulo: "Vendas por Categoria",
        cabecalhos: ["Categoria", "Itens Vendidos", "Receita Total"],
        linhas: [
          ["Eletrônicos", "150", "R$ 250.000,00"],
          ["Vestuário", "450", "R$ 95.000,00"],
          ["Livros", "800", "R$ 40.000,00"],
        ],
      },
      {
        subtitulo: "Melhores Vendedores",
        cabecalhos: ["Vendedor", "Região", "Vendas"],
        linhas: [
          ["Ana Silva", "Sudeste", "R$ 80.000,00"],
          ["Carlos Souza", "Nordeste", "R$ 65.000,00"],
          ["Beatriz Lima", "Sul", "R$ 62.000,00"],
        ],
      },
    ],
  };

  /**
   * Gera o HTML a partir dos dados e o insere na página.
   * @param {object} dados - O objeto contendo os dados para o relatório.
   */
  function gerarConteudo(dados) {
    let html = `<h1>${dados.titulo}</h1>`;

    dados.secoes.forEach((secao, index) => {
      // Adiciona uma quebra de página antes da segunda seção em diante
      if (index > 0) {
        html += `<div class="page-break"></div>`;
      }

      html += `<h2>${secao.subtitulo}</h2>`;
      html += "<table>";
      html += "<thead><tr>";
      secao.cabecalhos.forEach((cabecalho) => {
        html += `<th>${cabecalho}</th>`;
      });
      html += "</tr></thead>";
      html += "<tbody>";
      secao.linhas.forEach((linha) => {
        html += "<tr>";
        linha.forEach((celula) => {
          html += `<td>${celula}</td>`;
        });
        html += "</tr>";
      });
      html += "</tbody>";
      html += "</table>";
    });

    printContentEl.innerHTML = html;
  }

  // Gera o conteúdo assim que a página carrega
  gerarConteudo(dadosExemplo);

  // Exibe os botões de controle após gerar o conteúdo
  if (printControls) {
    printControls.style.display = "flex";
  }

  // Adiciona o evento de clique para o botão de imprimir
  printButton.addEventListener("click", () => {
    window.print();
  });
});
