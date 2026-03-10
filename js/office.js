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
  const clearBtn = document.getElementById("clear-btn");
  const toggleMoreBtn = document.getElementById("toggle-more-btn");

  // --- Estado da UI ---
  let showAllOffices = false;

  // --- Elementos do Gerenciamento de Ofícios Salvos ---
  const savedOfficesContainer = document.getElementById("saved-offices-container");
  const savedOfficesList = document.getElementById("saved-offices-list");

  // --- Carregamento de Dados ---
  let database = JSON.parse(localStorage.getItem(DB_KEY));
  const schoolMetadata = database ? database.metadata : { escola: "Nome da Escola", gestor: "Gestor(a)", cidade: "Cidade" };

  // --- Inicialização do EasyMDE ---
  const easyMDE = new EasyMDE({
    element: officeBodyEditor,
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

---

> Para citações ou trechos que necessitam de ênfase especial, o bloco de citação é uma excelente ferramenta.
> O uso de três traços (---) cria uma quebra de página manual.

Agradecemos a atenção e nos colocamos à disposição para quaisquer esclarecimentos.`;

  // --- Elementos da UI de Renderização (Agora dinâmicos) ---
  const pagesContainer = document.getElementById("pages-container");
  const pageTemplate = document.getElementById("page-template");
  const headerTemplate = document.getElementById("header-template");

  // --- Funções Auxiliares ---
  const generateUUID = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  };

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
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1000) {
        return new Date(year, month, day);
      }
    }
    return new Date();
  };

  const createNewPage = () => {
    const fragment = pageTemplate.content.cloneNode(true);
    const page = fragment.querySelector(".page-container");
    const content = page.querySelector(".office-content");
    const signature = page.querySelector(".signature-block");
    
    // Aplicar tamanho da fonte
    const fontSize = fontSizeInput.value || 11;
    content.style.fontSize = `${fontSize}pt`;
    signature.style.fontSize = `${fontSize}pt`;
    
    // Esconder assinatura por padrão (será mostrada na última)
    signature.style.display = "none";
    
    return { page, content, signature };
  };

  const updateOfficePreview = () => {
    // Limpar contêiner de páginas
    pagesContainer.innerHTML = "";

    // Renderizar Markdown completo em um elemento temporário para medição
    const markdownText = easyMDE.value();
    const tempDiv = document.createElement("div");
    tempDiv.classList.add("office-body-markdown");
    tempDiv.innerHTML = marked.parse(markdownText);
    
    // Adicionar Atenciosamente ao final se não houver
    if (!markdownText.toLowerCase().includes("atenciosamente")) {
        const closing = document.createElement("p");
        closing.className = "office-closing";
        closing.textContent = "Atenciosamente,";
        tempDiv.appendChild(closing);
    }

    const fontSize = fontSizeInput.value || 11;
    const location = officeLocationInput.value;
    const selectedDate = parseDateString(officeDatePicker.value);
    const formattedDateLine = `${location}, ${getFormattedDate(selectedDate)}.`;
    const gestorName = schoolMetadata.gestor || "";

    // Iniciar primeira página
    let current = createNewPage();
    pagesContainer.appendChild(current.page);

    // Adicionar Cabeçalho na primeira página
    const headerFrag = headerTemplate.content.cloneNode(true);
    headerFrag.querySelector(".rendered-office-number").textContent = officeNumberInput.value;
    headerFrag.querySelector(".rendered-office-date-line").textContent = formattedDateLine;
    headerFrag.querySelector(".rendered-office-recipient").innerHTML = officeRecipientInput.value.replace(/\n/g, "<br>");
    headerFrag.querySelector(".rendered-office-subject").textContent = officeSubjectInput.value;
    current.content.appendChild(headerFrag);

    // Distribuir elementos nas páginas
    const elements = Array.from(tempDiv.children);

    elements.forEach((el) => {
        // Clonar elemento para teste
        const clone = el.cloneNode(true);
        
        // Se for uma quebra de página manual (HR)
        if (el.tagName === "HR") {
            current = createNewPage();
            pagesContainer.appendChild(current.page);
            return;
        }

        current.content.appendChild(clone);

        // Verificar se estourou a página
        // A medição exata depende do elemento estar no DOM e renderizado
        if (current.content.scrollHeight > current.content.offsetHeight) {
            current.content.removeChild(clone);
            current = createNewPage();
            pagesContainer.appendChild(current.page);
            current.content.appendChild(clone);
        }
    });

    // Mostrar assinatura na última página
    let lastPageData = current;
    lastPageData.signature.style.display = "block";
    lastPageData.signature.querySelector(".rendered-gestor-name").textContent = gestorName;
    
    // Verificar se a assinatura causou estouro na última página
    if (lastPageData.content.scrollHeight > lastPageData.content.offsetHeight) {
        // Se estourou, oculta na página atual e cria uma nova só para a assinatura
        lastPageData.signature.style.display = "none";
        const finalPage = createNewPage();
        pagesContainer.appendChild(finalPage.page);
        finalPage.signature.style.display = "block";
        finalPage.signature.querySelector(".rendered-gestor-name").textContent = gestorName;
    }
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
        id: generateUUID(),
        name: name,
        savedAt: new Date().toISOString(),
        state: getCurrentState(),
      };
      officeDB.manual.push(newState);
      localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
      alert("Ofício salvo com sucesso!");
      renderSavedOffices(); // Atualiza a lista automaticamente
    }
  });

  const renderSavedOffices = () => {
    const officeDB = JSON.parse(localStorage.getItem(OFFICE_DB_KEY)) || { automatic: {}, manual: [] };
    const savedManual = officeDB.manual || [];

    if (savedManual.length === 0) {
      savedOfficesList.innerHTML = `<p class="text-secondary text-center p-3">Nenhum ofício salvo manualmente.</p>`;
      toggleMoreBtn.style.display = "none";
      return;
    }

    const sortedManual = savedManual.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    const displayedManual = showAllOffices ? sortedManual : sortedManual.slice(0, 5);

    if (savedManual.length > 5) {
      toggleMoreBtn.style.display = "block";
      toggleMoreBtn.textContent = showAllOffices ? "Ver Menos" : "Ver Mais";
    } else {
      toggleMoreBtn.style.display = "none";
    }

    savedOfficesList.innerHTML = displayedManual
      .map(
        (item) => `
        <li class="saved-office-item" data-id="${item.id}">
            <div>
                <strong style="display: block; color: #343a40;">${item.name}</strong>
                <small style="color: #6c757d;">Salvo em: ${new Date(item.savedAt).toLocaleString("pt-BR")}</small>
            </div>
            <div class="button-group">
                <button class="control-btn load-manual-btn">Carregar</button>
                <button class="control-btn overwrite-manual-btn" title="Sobrescrever com o conteúdo atual"><i class="fa-solid fa-save"></i></button>
                <button class="control-btn rename-manual-btn" title="Renomear"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="control-btn delete-manual-btn" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        </li>
      `
      )
      .join("");
  };

  toggleMoreBtn.addEventListener("click", () => {
    showAllOffices = !showAllOffices;
    renderSavedOffices();
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
      // Removido o fechamento da seção, pois agora ela é fixa.
    } else if (e.target.closest(".overwrite-manual-btn")) {
      if (confirm(`Tem certeza que deseja sobrescrever o ofício "${manualList[itemIndex].name}" com o conteúdo atual do editor?`)) {
        manualList[itemIndex].state = getCurrentState();
        manualList[itemIndex].savedAt = new Date().toISOString();
        localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
        alert("Ofício sobrescrito com sucesso!");
        renderSavedOffices(); // Re-renderiza a lista
      }
    } else if (e.target.closest(".rename-manual-btn")) {
      const newName = prompt("Digite o novo nome para o ofício:", manualList[itemIndex].name);
      if (newName && newName.trim() !== "") {
        manualList[itemIndex].name = newName.trim();
        localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
        renderSavedOffices();
      }
    } else if (e.target.closest(".delete-manual-btn")) {
      if (confirm(`Tem certeza que deseja excluir o ofício "${manualList[itemIndex].name}"?`)) {
        manualList.splice(itemIndex, 1);
        localStorage.setItem(OFFICE_DB_KEY, JSON.stringify(officeDB));
        renderSavedOffices(); // Re-renderiza a lista
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.is-open").forEach((modal) => modal.classList.remove("is-open"));
    }
  });
  // --- Renderização Inicial ---
  updateOfficePreview();
  updatePageTitle();
  renderSavedOffices(); // Garante que a lista apareça no carregamento inicial

  clearBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja começar um novo ofício? O conteúdo não salvo será perdido.")) {
      setDefaultValues();
    }
  });
});
