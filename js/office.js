document.addEventListener("DOMContentLoaded", () => {
  const DB_KEY = "schoolAppDatabase_v2";

  // --- Elementos da UI de Controle ---
  const officeNumberInput = document.getElementById("office-number");
  const officeDateLineInput = document.getElementById("office-date-line");
  const officeRecipientInput = document.getElementById("office-recipient");
  const officeSubjectInput = document.getElementById("office-subject");
  const officeBodyEditor = document.getElementById("office-body-editor");
  const printBtn = document.getElementById("print-btn");

  // --- Elementos da UI de Renderização ---
  const renderedOfficeNumber = document.getElementById("rendered-office-number");
  const renderedOfficeDateLine = document.getElementById("rendered-office-date-line");
  const renderedOfficeRecipient = document.getElementById("rendered-office-recipient");
  const renderedOfficeSubject = document.getElementById("rendered-office-subject");
  const renderedOfficeBody = document.getElementById("rendered-office-body");
  const renderedGestorName = document.getElementById("rendered-gestor-name");

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

A Direção da Escola Municipal ${schoolMetadata.escola || "Nome da Escola"} vem, por meio deste, solicitar a este Departamento o envio de uma equipe técnica especializada para realizar uma análise e manutenção geral na rede elétrica de nossa unidade de ensino.

A visita se faz necessária para verificar as condições gerais da instalação, com especial atenção para o funcionamento dos **ares-condicionados** e dos **ventiladores**. Temos observado instabilidade no fornecimento de energia para alguns equipamentos e desejamos garantir que toda a estrutura elétrica esteja segura e operando de forma eficiente.

Diante do exposto, aguardamos o agendamento da visita técnica com a maior brevidade possível para assegurar o bem-estar e a segurança de nossas crianças e funcionários.

`,
  });

  // --- Funções Auxiliares ---
  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = today.toLocaleString("pt-BR", { month: "long" });
    const year = today.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const updateOfficePreview = () => {
    // Update header fields
    renderedOfficeNumber.textContent = officeNumberInput.value;
    renderedOfficeDateLine.textContent = officeDateLineInput.value;
    renderedOfficeRecipient.innerHTML = officeRecipientInput.value.replace(/\n/g, "<br>"); // Preserve line breaks
    renderedOfficeSubject.textContent = officeSubjectInput.value;

    // Update Markdown content
    const markdownText = easyMDE.value();
    renderedOfficeBody.innerHTML = marked.parse(markdownText);

    // Update signature
    renderedGestorName.textContent = schoolMetadata.gestor || "";
  };

  // --- Inicialização de Campos ---
  officeNumberInput.value = `OFÍCIO N° XX/${new Date().getFullYear()}`;
  officeDateLineInput.value = `${schoolMetadata.cidade || "Cidade"}, ${getFormattedDate()}.`;
  officeRecipientInput.value = `Ao Departamento de Administração e Serviços Gerais\nSecretaria Municipal de Educação - SEMED`; // Default recipient from the example image
  officeSubjectInput.value = `Assunto: `;

  // Set initial Markdown content (already done via EasyMDE initialValue)
  // easyMDE.value(`Prezado(a) Senhor(a) Gestor(a),\n\nA Direção da Escola Municipal ${schoolMetadata.escola || "Nome da Escola"} vem, por meio deste, solicitar a este Departamento o envio de uma equipe técnica especializada para realizar uma análise e manutenção geral na rede elétrica de nossa unidade de ensino.\n\nA visita se faz necessária para verificar as condições gerais da instalação, com especial atenção para o funcionamento dos **ares-condicionados** e dos **ventiladores**. Temos observado instabilidade no fornecimento de energia para alguns equipamentos e desejamos garantir que toda a estrutura elétrica esteja segura e operando de forma eficiente.\n\nDiante do exposto, aguardamos o agendamento da visita técnica com a maior brevidade possível para assegurar o bem-estar e a segurança de nossas crianças e funcionários.\n\n`);

  // --- Event Listeners ---
  officeNumberInput.addEventListener("input", updateOfficePreview);
  officeDateLineInput.addEventListener("input", updateOfficePreview);
  officeRecipientInput.addEventListener("input", updateOfficePreview);
  officeSubjectInput.addEventListener("input", updateOfficePreview);
  easyMDE.codemirror.on("change", updateOfficePreview); // Listen for changes in the EasyMDE editor

  printBtn.addEventListener("click", () => window.print());

  // --- Renderização Inicial ---
  updateOfficePreview();
});
