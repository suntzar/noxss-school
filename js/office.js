document.addEventListener("DOMContentLoaded", () => {
  const DB_KEY = "schoolAppDatabase_v2";

  // --- Elementos da UI de Controle ---
  const officeNumberInput = document.getElementById("office-number");
  const officeLocationInput = document.getElementById("office-location");
  const officeDatePicker = document.getElementById("office-date-picker");
  const officeRecipientInput = document.getElementById("office-recipient");
  const officeSubjectInput = document.getElementById("office-subject");
  const officeBodyEditor = document.getElementById("office-body-editor");
  const fontSizeInput = document.getElementById("font-size-input");
  const printBtn = document.getElementById("print-btn");

  // --- Elementos da UI de Renderização ---
  const renderedOfficeNumber = document.getElementById("rendered-office-number");
  const renderedOfficeDateLine = document.getElementById("rendered-office-date-line");
  const renderedOfficeRecipient = document.getElementById("rendered-office-recipient");
  const renderedOfficeSubject = document.getElementById("rendered-office-subject");
  const renderedOfficeBody = document.getElementById("rendered-office-body");
  const renderedGestorName = document.getElementById("rendered-gestor-name");
  const officeContent = document.getElementById("office-content");
  const signatureBlock = document.querySelector(".signature-block");

  // --- Carregamento de Dados ---
  let database = JSON.parse(localStorage.getItem(DB_KEY));
  if (!database) {
    renderedOfficeBody.innerHTML = `<p style="color: red; text-align: center;">Erro: Banco de dados não encontrado. Volte para a página principal e carregue os dados.</p>`;
    return;
  }

  const schoolMetadata = database.metadata;

  // --- Inicialização do EasyMDE ---
  const easyMDE = new EasyMDE({
    element: officeBodyEditor,
    spellChecker: false,
    minHeight: "300px",
    maxHeight: "500px",
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "guide"],
    initialValue: `Prezado(a) Senhor(a) Gestor(a),

A Direção da **${schoolMetadata.escola || "Nome da Escola"}** vem, por meio deste, apresentar um modelo de ofício e as funcionalidades de formatação disponíveis neste gerador.

Este editor utiliza a sintaxe *Markdown*, que permite formatar o texto de maneira simples e intuitiva, como demonstrado abaixo.

### Exemplo de Estrutura de Ofício

É possível criar seções com títulos para organizar o documento.

#### 1. Introdução
Nesta seção, o remetente se apresenta e introduz o assunto principal do ofício. O uso de **negrito** é ideal para destacar nomes ou termos importantes.

#### 2. Desenvolvimento
Aqui, os argumentos são detalhados. Pode-se usar listas para elencar itens, como:
- Solicitação de materiais didáticos;
- Relatório de frequência dos alunos;
- Cronograma de atividades para o próximo semestre.

> Para citações ou trechos que necessitam de ênfase especial, o bloco de citação é uma excelente ferramenta.

Agradecemos a atenção e nos colocamos à disposição para quaisquer esclarecimentos.

`,
  });

  // --- Funções Auxiliares ---
  const getFormattedDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const parseDateString = (dateString) => {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
      const year = parseInt(parts[2], 10);
      // Verifica se a data é válida (ex: ano com 4 dígitos)
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1000) {
        return new Date(year, month, day);
      }
    }
    return new Date(); // Retorna a data atual como fallback se o formato for inválido
  };

  const updateOfficePreview = () => {
    // Update header fields
    renderedOfficeNumber.textContent = officeNumberInput.value;
    renderedOfficeRecipient.innerHTML = officeRecipientInput.value.replace(/\n/g, "<br>"); // Preserve line breaks
    renderedOfficeSubject.textContent = officeSubjectInput.value;

    // Combine location and formatted date
    const location = officeLocationInput.value;
    const selectedDate = parseDateString(officeDatePicker.value);
    renderedOfficeDateLine.textContent = `${location}, ${getFormattedDate(selectedDate)}.`;

    // Update Markdown content
    const markdownText = easyMDE.value();
    renderedOfficeBody.innerHTML = marked.parse(markdownText);

    // Update font size
    const fontSize = fontSizeInput.value || 13;
    officeContent.style.fontSize = `${fontSize}pt`;
    signatureBlock.style.fontSize = `${fontSize}pt`;

    // Update signature
    renderedGestorName.textContent = schoolMetadata.gestor || "";
  };

  // --- Inicialização de Campos ---
  officeNumberInput.value = `OFÍCIO N° XX/${new Date().getFullYear()}`;
  officeLocationInput.value = schoolMetadata.cidade || "Cidade";
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mês é 0-indexado
  const year = today.getFullYear();
  officeDatePicker.value = `${day}/${month}/${year}`;
  officeRecipientInput.value = `Ao Departamento de Administração e Serviços Gerais\nSecretaria Municipal de Educação - SEMED`; // Default recipient from the example image
  officeSubjectInput.value = `Assunto: `;

  // --- Event Listeners ---
  officeNumberInput.addEventListener("input", updateOfficePreview);
  officeLocationInput.addEventListener("input", updateOfficePreview);
  officeDatePicker.addEventListener("input", updateOfficePreview);
  officeRecipientInput.addEventListener("input", updateOfficePreview);
  officeSubjectInput.addEventListener("input", updateOfficePreview);
  fontSizeInput.addEventListener("input", updateOfficePreview);
  easyMDE.codemirror.on("change", updateOfficePreview); // Listen for changes in the EasyMDE editor

  printBtn.addEventListener("click", () => window.print());

  // --- Renderização Inicial ---
  updateOfficePreview();
});
