document.addEventListener("DOMContentLoaded", () => {
  const DB_KEY = "schoolAppDatabase_v2";
  const OFFICE_DB_KEY = "noxssOfficeStates";

  // --- Elementos da UI de Controle ---
  const officeNumberInput = document.getElementById("office-number");
  const officeLocationInput = document.getElementById("office-location");
  const officeDatePicker = document.getElementById("office-date-picker");
  const officeRecipientInput = document.getElementById("office-recipient");
  const officeSubjectInput = document.getElementById("office-subject");
  const officeBodyEditor = document.getElementById("office-body-editor");
  const fontSizeInput = document.getElementById("font-size-input");
  const printBtn = document.getElementById("print-btn");
  const saveManualBtn = document.getElementById("save-manual-btn");
  const manageSavedBtn = document.getElementById("manage-saved-btn");
  const clearBtn = document.getElementById("clear-btn");

  // --- Elementos da UI de Renderização ---
  const renderedOfficeNumber = document.getElementById("rendered-office-number");
  const renderedOfficeDateLine = document.getElementById("rendered-office-date-line");
  const renderedOfficeRecipient = document.getElementById("rendered-office-recipient");
  const renderedOfficeSubject = document.getElementById("rendered-office-subject");
  const renderedOfficeBody = document.getElementById("rendered-office-body");
  const renderedGestorName = document.getElementById("rendered-gestor-name");
  const officeContent = document.getElementById("office-content");

  // --- Elementos do Modal de Gerenciamento ---
  const savedOfficesList = document.getElementById("saved-offices-list");

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
    element: officeBodyEditor, // This should be the textarea element
    spellChecker: false,
    minHeight: "300px",
    maxHeight: "500px",
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "guide"],
    initialValue: `Prezado(a) Senhor(a) Gestor(a),

A Direção da **${schoolMetadata.escola || "Nome da Escola"}** vem, por meio deste, apresentar um modelo de ofício e as funcionalidades de formatação disponíveis neste gerador.
Agradecemos a atenção e nos colocamos à disposição para quaisquer esclarecimentos.
`,
  });

  const exampleContent = `Prezado(a) Senhor(a) Gestor(a),

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

Agradecemos a atenção e nos colocamos à disposição para quaisquer esclarecimentos.`;

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
  const updatePageTitle = () => {
    const officeNumber = officeNumberInput.value.replace(/OFÍCIO N°\s*/i, "").trim();
    const subject = officeSubjectInput.value.replace(/Assunto:\s*/i, "").trim();

    const newTitle = `Ofício ${officeNumber} - ${subject}`;
    document.title = newTitle;
  };

  const getCurrentState = () => {
    const state = {
      number: officeNumberInput.value,
      location: officeLocationInput.value,
      date: officeDatePicker.value,
      recipient: officeRecipientInput.value,
      subject: officeSubjectInput.value,
      fontSize: fontSizeInput.value,
      body: easyMDE.value(),
    };
    return state;
  };

  const saveState = () => {
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
    officeDB.automatic = getCurrentState();
    localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
  };

  const loadStateFromObject = (state) => {
    if (!state) return;
    officeNumberInput.value = state.number || "";
    officeLocationInput.value = state.location || "";
    officeDatePicker.value = state.date || "";
    officeRecipientInput.value = state.recipient || "";
    officeSubjectInput.value = state.subject || "";
    fontSizeInput.value = state.fontSize || "11";
    easyMDE.value(state.body || "");
    updateOfficePreview();
    updatePageTitle();
  };

  const loadState = () => {
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY));
    if (officeDB && officeDB.automatic) {
      loadStateFromObject(officeDB.automatic);
      return true; // Indica que o estado foi carregado
    }
    return false; // Indica que nenhum estado foi carregado
  };

  const setDefaultValues = () => {
    // Limpa o estado automático ao resetar
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
    delete officeDB.automatic;
    localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));

    officeNumberInput.value = `OFÍCIO N° XX/${new Date().getFullYear()}`;
    officeLocationInput.value = schoolMetadata.cidade || "Cidade";
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Mês é 0-indexado
    const year = today.getFullYear();
    officeDatePicker.value = `${day}/${month}/${year}`;
    officeRecipientInput.value = `Ao Departamento de Administração e Serviços Gerais\nSecretaria Municipal de Educação - SEMED`;
    officeSubjectInput.value = `Assunto: `;
    fontSizeInput.value = "11";
    easyMDE.value(exampleContent);
    updateOfficePreview();
    updatePageTitle();
  };

  // --- Inicialização de Campos ---
  if (!loadState()) {
    // Se nenhum estado foi carregado, define os valores padrão.
    setDefaultValues();
  }

  // --- Event Listeners ---
  const inputsToUpdate = [officeNumberInput, officeLocationInput, officeDatePicker, officeRecipientInput, officeSubjectInput, fontSizeInput];
  inputsToUpdate.forEach((input) => {
    input.addEventListener("input", () => {
      updateOfficePreview();
      updatePageTitle();
      saveState();
    });
  });

  easyMDE.codemirror.on("change", () => {
    updateOfficePreview();
    updatePageTitle();
    saveState();
  });

  printBtn.addEventListener("click", () => window.print());

  saveManualBtn.addEventListener("click", () => {
    const defaultName = document.title;
    const name = prompt("Digite um nome para salvar este ofício:", defaultName);
    if (name) {
      const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
      const newState = {
        id: crypto.randomUUID(),
        name: name,
        savedAt: new Date().toISOString(),
        state: getCurrentState(),
      };
      officeDB.manual.push(newState);
      localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
      Noxss.Toasts.show({ message: "Ofício salvo com sucesso!", status: "success" });
    }
  });

  const renderSavedOffices = () => {
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
    const savedManual = officeDB.manual || [];

    if (savedManual.length === 0) {
      savedOfficesList.innerHTML = `<p class="text-secondary text-center p-3">Nenhum ofício salvo manualmente.</p>`;
      return;
    }

    savedOfficesList.innerHTML = savedManual
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)) // Mostra os mais recentes primeiro
      .map(
        (item) => `
        <li class="noxss-list-item">
            <div class="noxss-list-item__content">
                <div class="noxss-list-item__title">${item.name}</div>
                <div class="noxss-list-item__subtitle">Salvo em: ${new Date(item.savedAt).toLocaleString("pt-BR")}</div>
            </div>
            <div class="noxss-list-item__trailing d-flex gap-2">
                <button class="noxss-btn noxss-btn--secondary load-manual-btn" data-id="${item.id}">Carregar</button>
                <button class="noxss-btn noxss-btn--icon rename-manual-btn" data-id="${item.id}" title="Renomear"><i class="fa-solid fa-pen-to-square noxss-icon"></i></button>
                <button class="noxss-btn noxss-btn--icon delete-manual-btn" data-id="${item.id}" title="Excluir"><i class="fa-solid fa-trash noxss-icon"></i></button>
            </div>
        </li>
      `
      )
      .join("");
  };

  manageSavedBtn.addEventListener("click", () => {
    renderSavedOffices();
    Noxss.Modals.open("savedOfficesModal");
  });

  savedOfficesList.addEventListener("click", (e) => {
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
    const manualList = officeDB.manual || [];
    const targetId = e.target.closest("[data-id]")?.dataset.id;
    if (!targetId) return;

    const itemIndex = manualList.findIndex((item) => item.id === targetId);
    if (itemIndex === -1) return;

    if (e.target.closest(".load-manual-btn")) {
      loadStateFromObject(manualList[itemIndex].state);
      Noxss.Modals.close("savedOfficesModal");
      Noxss.Toasts.show({ message: "Ofício carregado!", status: "info" });
    } else if (e.target.closest(".rename-manual-btn")) {
      const newName = prompt("Digite o novo nome para o ofício:", manualList[itemIndex].name);
      if (newName) {
        manualList[itemIndex].name = newName;
        localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
        renderSavedOffices(); // Re-renderiza a lista
      }
    } else if (e.target.closest(".delete-manual-btn")) {
      if (confirm(`Tem certeza que deseja excluir o ofício "${manualList[itemIndex].name}"?`)) {
        manualList.splice(itemIndex, 1);
        localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
        renderSavedOffices(); // Re-renderiza a lista
      }
    }
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja começar um novo ofício? O conteúdo não salvo será perdido.")) {
      setDefaultValues();
    }
  });

  // --- Renderização Inicial ---
  updateOfficePreview();
  updatePageTitle();
});
