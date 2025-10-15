// --- GERENCIADOR DE TEMA ---
const htmlElement = document.documentElement;
const MODE_KEY = "schoolAppThemeMode";
const THEME_KEY = "schoolAppTheme"; // Nova chave para armazenar o tema/paleta selecionado

const staticThemes = {
  "Noxss Padrão": { dark: "dark", light: "light" },
  "Púrpura Imperial": { dark: "purpura-dark", light: "purpura-light" },
  "Azul Real": { dark: "azul-real-dark", light: "azul-real-light" },
  "Verde Sereno": { dark: "verde-sereno-dark", light: "verde-sereno-light" },
  Neutro: { dark: "neutro-dark", light: "neutro-light" },
};

const dynamicPalettes = {
  "Azul Céu": { light: "#3b82f6", dark: "#60a5fa" },
  "Verde Esmeralda": { light: "#059669", dark: "#10b981" },
  "Roxo Violeta": { light: "#7c3aed", dark: "#8b5cf6" },
  "Âmbar Dourado": { light: "#d97706", dark: "#f59e0b" },
  "Rosa Moderno": { light: "#e11d48", dark: "#f43f5e" },
  "Ciano Fresco": { light: "#06b6d4", dark: "#22d3ee" },
  "Vermelho Rubi": { light: "#dc2626", dark: "#f87171" },
  "Índigo Profundo": { light: "#4f46e5", dark: "#818cf8" },
  "Verde-azulado (Teal)": { light: "#0d9488", dark: "#2dd4bf" },
  "Lima Vibrante": { light: "#65a30d", dark: "#a3e635" },
  "Laranja Entardecer": { light: "#f97316", dark: "#fb923c" },
  "Magenta Elétrico": { light: "#d946ef", dark: "#f0abfc" },
  "Verde Floresta": { light: "#16a34a", dark: "#4ade80" },
  "Azul Cobalto": { light: "#0ea5e9", dark: "#7dd3fc" },
  "Grafite Sóbrio": { light: "#6b7280", dark: "#d1d5db" },
};

const applyTheme = (mode, themeName) => {
  // Limpa atributos de temas anteriores
  htmlElement.removeAttribute("data-theme");
  htmlElement.removeAttribute("data-noxss-theme-gen");
  htmlElement.removeAttribute("data-noxss-palette-gen");

  if (staticThemes[themeName]) {
    // É um tema estático (manual)
    const themeValue = staticThemes[themeName][mode];
    htmlElement.setAttribute("data-theme", themeValue);
  } else {
    // É uma paleta dinâmica
    const palette = dynamicPalettes[themeName] || dynamicPalettes["Azul Céu"];
    const paletteColor = palette[mode];
    htmlElement.setAttribute("data-noxss-theme-gen", mode);
    htmlElement.setAttribute("data-noxss-palette-gen", paletteColor);
  }

  localStorage.setItem(MODE_KEY, mode);
  localStorage.setItem(THEME_KEY, themeName);
};

// --- LÓGICA PRINCIPAL DO APLICATIVO ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica de Tema ---
  const themeSwitcher = document.getElementById("theme-switcher");
  const paletteSelect = document.getElementById("palette-select");

  // Popula o select com temas estáticos e paletas dinâmicas
  const staticOptions = Object.keys(staticThemes).map((name) => `<option value="${name}">${name}</option>`);
  const dynamicOptions = Object.keys(dynamicPalettes).map((name) => `<option value="${name}">${name}</option>`);
  paletteSelect.innerHTML = `
    <optgroup label="Temas Manuais">${staticOptions.join("")}</optgroup>
    <optgroup label="Paletas Dinâmicas">${dynamicOptions.join("")}</optgroup>
  `;

  const savedMode = localStorage.getItem(MODE_KEY);
  const savedThemeName = localStorage.getItem(THEME_KEY) || "Noxss Padrão";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentMode = savedMode || (prefersDark ? "dark" : "light");

  applyTheme(currentMode, savedThemeName);
  paletteSelect.value = savedThemeName;

  themeSwitcher.addEventListener("click", () => {
    const currentMode = localStorage.getItem(MODE_KEY) || "light";
    const newMode = currentMode === "dark" ? "light" : "dark";
    applyTheme(newMode, localStorage.getItem(THEME_KEY));
  });
  paletteSelect.addEventListener("change", (e) => {
    applyTheme(localStorage.getItem(MODE_KEY), e.target.value);
  });

  // --- ESTRUTURA DE DADOS ---
  let database = {
    metadata: {
      escola: "Nome da Escola",
      localizacao: "Endereço da Escola",
      contato: "Telefone/Email",
      studentsPerPage: 20,
      turmas: [],
    },
    alunos: [],
  };
  const DB_KEY = "schoolAppDatabase_v2";
  const JSONBIN_API_KEY = "$2a$10$s976JjTPuXOZQ.kCH7E6i.FdOJ0R2vLsy9rqYrlBLSMRXxmHnA552";
  const JSONBIN_BIN_ID = "68d5a70e43b1c97be9501077";
  const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

  // --- ESTADO DA UI ---
  let currentPage = 1;
  let selectedTurmaIds = new Set();

  // --- REFERÊNCIAS DE ELEMENTOS ---
  const studentListContainer = document.getElementById("student-list-container");
  const placeholder = document.getElementById("placeholder");
  const searchInput = document.getElementById("searchInput");
  const studentForm = document.getElementById("studentForm");
  const fileInput = document.getElementById("jsonFileInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const metadataForm = document.getElementById("metadataForm");
  const turmaForm = document.getElementById("turmaForm");
  const turmasListEl = document.getElementById("turmas-list");
  const confirmLoadBtn = document.getElementById("confirmLoadBtn");
  const statusSelect = document.getElementById("status");
  const paginationContainer = document.getElementById("pagination-container");
  const logoutBtn = document.getElementById("logout-btn");
  const transferenciaWrapper = document.getElementById("transferencia-field-wrapper");
  const turmaFilterToggle = document.getElementById("turma-filter-toggle");
  const turmaFilterOptions = document.getElementById("turma-filter-options");

  // --- FUNÇÕES AUXILIARES ---
  const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

  const formatCPF = (cpf) => {
    if (!cpf) return "CPF: Não informado";
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length === 11) {
      return cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf; // Retorna o original se não for formatável
  };

  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFD") // Separa os caracteres dos seus acentos
      .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
      .replace(/ç/g, "c"); // Trata o 'ç' como 'c'
  };
  // --- MIGRAÇÃO E COMPATIBILIDADE ---
  function migrateData(db) {
    let migrationPerformed = false;
    // Verifica se a migração é necessária (turmas sem ID)
    if (db.metadata.turmas.length > 0 && !db.metadata.turmas[0].id) {
      console.log("Iniciando migração de dados para o novo formato de turmas...");
      const turmaMap = new Map();

      // 1. Adiciona IDs às turmas existentes e cria um mapa de lookup
      db.metadata.turmas.forEach((turma) => {
        const newId = generateId();
        turma.id = newId;
        const key = `${(turma.turma || "").trim().toUpperCase()}-${(turma.turno || "").trim().toUpperCase()}`;
        turmaMap.set(key, newId);
      });
      migrationPerformed = true;
    }

    // Migração do campo de professor único para professor1 e professor2
    if (db.metadata.turmas.length > 0 && db.metadata.turmas.some((t) => t.hasOwnProperty("professor"))) {
      console.log("Iniciando migração de dados de professores...");
      db.metadata.turmas.forEach((turma) => {
        turma.professor1 = turma.professor || "";
        turma.professor2 = turma.professor2 || ""; // Garante que o campo exista
        delete turma.professor;
      });

      // 2. Atualiza os alunos para usar turma_id
      db.alunos.forEach((aluno) => {
        if (aluno.turma && aluno.turno) {
          const key = `${(aluno.turma || "").trim().toUpperCase()}-${(aluno.turno || "").trim().toUpperCase()}`;
          if (turmaMap.has(key)) {
            aluno.turma_id = turmaMap.get(key);
          }
          delete aluno.turma;
          delete aluno.turno;
        }
      });
      migrationPerformed = true;
    }
    // Verifica se a migração de alunos é necessária (alunos com turma/turno)
    if (db.alunos.length > 0 && db.alunos[0].turma) {
      console.log("Iniciando migração de dados de alunos...");
      const turmaMap = new Map(
        db.metadata.turmas.map((t) => {
          const key = `${(t.turma || "").trim().toUpperCase()}-${(t.turno || "").trim().toUpperCase()}`;
          return [key, t.id];
        })
      );

      db.alunos.forEach((aluno) => {
        if (aluno.turma && aluno.turno) {
          const key = `${(aluno.turma || "").trim().toUpperCase()}-${(aluno.turno || "").trim().toUpperCase()}`;
          if (turmaMap.has(key)) {
            aluno.turma_id = turmaMap.get(key);
          }
          delete aluno.turma;
          delete aluno.turno;
        }
      });
      migrationPerformed = true;
    }

    if (migrationPerformed) {
      Noxss.Toasts.show({
        message: "Banco de dados atualizado para o novo formato.",
        status: "info",
      });
      console.log("Migração concluída.", db);
    }
    return db;
  }

  function processLoadedData(data) {
    let db = { metadata: { escola: "Nova Escola", localizacao: "", contato: "", turmas: [], studentsPerPage: 20 }, alunos: [] };
    if (Array.isArray(data)) {
      // Formato mais antigo (só array de alunos)
      db.alunos = data;
    } else if (data && typeof data === "object" && data.alunos) {
      // Formato novo ou intermediário
      db = data;
    }
    return migrateData(db);
  }

  // --- API (jsonbin.io) ---
  async function fetchFromJSONBin() {
    if (!JSONBIN_API_KEY.startsWith("$2") || !JSONBIN_BIN_ID) return null;
    try {
      const res = await fetch(`${JSONBIN_URL}/latest`, { headers: { "X-Master-Key": JSONBIN_API_KEY } });
      if (!res.ok) throw new Error(`Erro na API: ${res.statusText}`);
      const data = await res.json();
      Noxss.Toasts.show({ message: "Dados sincronizados da nuvem.", status: "info", duration: 2000 });
      return data.record;
    } catch (error) {
      console.error("Falha ao buscar dados do jsonbin.io:", error);
      Noxss.Toasts.show({ message: "Falha ao conectar à nuvem. Usando dados locais.", status: "warning" });
      return null;
    }
  }

  async function saveToJSONBin(data) {
    if (!JSONBIN_API_KEY.startsWith("$2") || !JSONBIN_BIN_ID) return;
    try {
      const res = await fetch(JSONBIN_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Erro na API ao salvar: ${res.statusText}`);
    } catch (error) {
      console.error("Falha ao salvar dados no jsonbin.io:", error);
    }
  }

  // --- LÓGICA DE FILTRAGEM ---
  const renderTurmaFilter = () => {
    const sortedTurmas = [...database.metadata.turmas].sort((a, b) => `${a.turma}-${a.turno}`.localeCompare(`${b.turma}-${b.turno}`));

    turmaFilterOptions.innerHTML = sortedTurmas
      .map((turma) => {
        const isChecked = selectedTurmaIds.has(turma.id);
        return `
          <label class="noxss-check">
            <input type="checkbox" class="turma-filter-checkbox" data-turma-id="${turma.id}" ${isChecked ? "checked" : ""}>
            <span class="noxss-check-control"></span>
            <span>${turma.turma} - ${turma.turno}</span>
          </label>
        `;
      })
      .join("");
  };

  const updateAndRenderStudentList = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const normalizedTerm = normalizeText(searchTerm);

    const filteredByTurma = database.alunos.filter((student) => selectedTurmaIds.has(student.turma_id));

    const filteredBySearch =
      normalizedTerm.length > 0
        ? filteredByTurma.filter((s) => {
            return ["nome", "mae", "pai", "observacoes"].some((field) => normalizeText((s[field] || "").toLowerCase()).includes(normalizedTerm)) || (s.cpf || "").replace(/\D/g, "").includes(normalizedTerm);
          })
        : filteredByTurma;

    renderStudentList(filteredBySearch, searchTerm);
  };

  // --- UI & RENDERIZAÇÃO ---
  const highlightText = (text, term, highlightClass = "search-highlight") => {
    if (!term || !text) return text || "";

    const normalizedText = normalizeText(text).toLowerCase();
    const normalizedTerm = normalizeText(term).toLowerCase();
    const termLength = normalizedTerm.length;
    let result = "";
    let lastIndex = 0;
    let startIndex = normalizedText.indexOf(normalizedTerm);

    while (startIndex !== -1) {
      // Adiciona o texto desde a última correspondência até a atual
      result += text.substring(lastIndex, startIndex);
      // Adiciona o segmento destacado, pegando do texto original
      result += `<mark class="${highlightClass}">${text.substring(startIndex, startIndex + termLength)}</mark>`;
      // Atualiza o último índice
      lastIndex = startIndex + termLength;
      // Procura a próxima ocorrência
      startIndex = normalizedText.indexOf(normalizedTerm, lastIndex);
    }

    // Adiciona o restante do texto após a última correspondência
    result += text.substring(lastIndex);
    return result;
  };

  const highlightCpfMatch = (formattedCpf, unformattedCpf, searchTerm) => {
    const cleanSearchTerm = searchTerm.replace(/\D/g, "");
    if (!cleanSearchTerm) return formattedCpf;

    const matchIndex = unformattedCpf.indexOf(cleanSearchTerm);
    if (matchIndex === -1) return formattedCpf;

    const matchEndIndex = matchIndex + cleanSearchTerm.length;

    let result = "";
    let digitCount = 0;
    let inHighlight = false;

    for (const char of formattedCpf) {
      const isDigit = /\d/.test(char);

      if (isDigit) {
        const wasInHighlight = inHighlight;
        inHighlight = digitCount >= matchIndex && digitCount < matchEndIndex;

        if (inHighlight && !wasInHighlight) result += `<mark class="search-highlight">`;
        if (!inHighlight && wasInHighlight) result += `</mark>`;

        digitCount++;
      }
      result += char;
    }

    if (inHighlight) result += `</mark>`;
    return result;
  };

  const createStudentCardHTML = (student, searchTerm = "") => {
    const safe = (text) => text || "Não informado";

    const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));
    const turma = turmaMap.get(student.turma_id) || { turma: "Sem Turma", turno: "" };
    const turmaNome = turma.turma === "Sem Turma" ? "Sem Turma" : `${turma.turma} - ${turma.turno}`;

    const unformattedCpf = (student.cpf || "").replace(/\D/g, "");
    const isCpfMatch = searchTerm && unformattedCpf.includes(searchTerm.replace(/\D/g, ""));

    const highlightedNome = highlightText(safe(student.nome), searchTerm, "search-highlight--name");
    const highlightedMae = highlightText(safe(student.mae), searchTerm);
    const highlightedPai = highlightText(safe(student.pai), searchTerm);
    const highlightedObservacoes = highlightText(safe(student.observacoes), searchTerm);
    const cpfDisplay = isCpfMatch ? highlightCpfMatch(formatCPF(student.cpf), unformattedCpf, searchTerm) : formatCPF(student.cpf);

    return `
      <div class="noxss-card__header">
        <div class="student-card-avatar noxss-card__leading">
            <i class="fa-solid fa-user-circle"></i>
        </div>
        <h3 class="noxss-card__title u-mb-0">${highlightedNome}</h3>
        <div class="student-card-actions">
          <button class="noxss-btn noxss-btn--icon view-btn" data-id="${student.id}" title="Visualizar"><i class="fa-solid fa-eye noxss-icon"></i></button>
          <button class="noxss-btn noxss-btn--icon edit-btn" data-id="${student.id}" title="Editar"><i class="fa-solid fa-pen-to-square noxss-icon"></i></button>
          <button class="noxss-btn noxss-btn--icon delete-btn" data-type="student" data-id="${student.id}" title="Excluir"><i class="fa-solid fa-trash noxss-icon"></i></button>
        </div>
      </div>
      <div class="noxss-card__body student-card-body">
        <div class="student-card-info-grid">
          <div class="student-card-main-info">
            <div class="student-status status-${(student.status || "ativo").toLowerCase().replace(" ", "-")}">
              <span class="status-dot"></span>
              <span class="status-text">${safe(student.status)}</span>
            </div>
            ${
              student.status === "Transferido" && student.data_transferencia
                ? `
            <div class="info-item">
                <i class="fa-solid fa-arrow-right-from-bracket noxss-icon"></i>
                <span>Transf. em: ${safe(student.data_transferencia)}</span>
            </div>`
                : ""
            }
            <div class="info-item">
              <i class="fa-solid fa-calendar-day noxss-icon"></i>
              <span>Matrícula: ${safe(student.data_matricula)}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-chalkboard-user noxss-icon"></i>
              <span>${turmaNome}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-id-card noxss-icon"></i>
              <span>${cpfDisplay}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-cake-candles noxss-icon"></i>
              <span>${safe(student.nascimento)}</span>
            </div>
             <div class="info-item">
              <i class="fa-solid ${student.sexo === "Feminino" ? "fa-venus" : student.sexo === "Masculino" ? "fa-mars" : "fa-genderless"} noxss-icon"></i>
              <span>${safe(student.sexo)}</span>
            </div>
          </div>
          <div class="student-card-secondary-info">
            <div class="info-item">
              <span><strong>Mãe:</strong> ${highlightedMae}</span>
            </div>
            <div class="info-item">
              <span><strong>Pai:</strong> ${highlightedPai}</span>
            </div>
            <div class="info-item">
              <strong>Telefone(s):</strong> ${Array.isArray(student.telefone) ? student.telefone.join(", ") : "Não informado"}
            </div>
            <div class="info-item">
              <strong>Endereço:</strong> ${safe(student.endereco)}
            </div>
            <div class="info-item">
              <strong>Cor/Raça:</strong> ${safe(student.cor)}
            </div>
          </div>
        </div>
      </div>
      ${
        student.observacoes
          ? `
      <div class="noxss-card__footer student-card-footer">
        <div class="info-item">
            <i class="fa-solid fa-message noxss-icon"></i>
            <span class="text-wrap">${highlightedObservacoes}</span>
        </div>
      </div>`
          : ""
      }`;
  };

  const renderPaginationControls = (totalItems, itemsPerPage) => {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return;

    const createPageElement = (content, page, isDisabled = false, isActive = false) => {
      if (content === "...") {
        const ellipsis = document.createElement("span");
        ellipsis.className = "page-ellipsis";
        ellipsis.innerHTML = "&hellip;";
        return ellipsis;
      }

      const btn = document.createElement("button");
      btn.className = `noxss-btn noxss-btn--icon page-btn ${isActive ? "is-active" : ""}`;
      btn.innerHTML = content;
      btn.disabled = isDisabled;
      btn.dataset.page = page;
      return btn;
    };

    // Botão "Anterior"
    paginationContainer.appendChild(createPageElement('<i class="fa-solid fa-chevron-left noxss-icon"></i>', currentPage - 1, currentPage === 1));

    // Lógica para exibir os botões de página com reticências
    const maxVisibleButtons = 7; // Total máximo de botões (incluindo reticências)
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createPageElement(i, i, false, i === currentPage));
      }
    } else {
      // Sempre mostrar a primeira página
      paginationContainer.appendChild(createPageElement(1, 1, false, currentPage === 1));

      // Reticências no início
      if (currentPage > 3) {
        paginationContainer.appendChild(createPageElement("..."));
      }

      // Páginas ao redor da página atual
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageElement(i, i, false, i === currentPage));
      }

      // Reticências no final
      if (currentPage < totalPages - 2) {
        paginationContainer.appendChild(createPageElement("..."));
      }

      // Sempre mostrar a última página
      paginationContainer.appendChild(createPageElement(totalPages, totalPages, false, currentPage === totalPages));
    }

    // Botão "Próximo"
    paginationContainer.appendChild(createPageElement('<i class="fa-solid fa-chevron-right noxss-icon"></i>', currentPage + 1, currentPage === totalPages));
  };

  const renderStudentList = (studentList = database.alunos, searchTerm = "") => {
    if (!searchTerm) {
      searchTerm = searchInput.value.toLowerCase();
    }
    const isSearching = searchTerm.length > 0;
    studentListContainer.innerHTML = "";

    const studentsPerPage = database.metadata.studentsPerPage || 20;
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const paginatedStudents = studentList.slice(startIndex, endIndex);

    // Se não houver alunos na lista inteira (antes da paginação)
    if (studentList.length === 0) {
      placeholder.innerHTML = isSearching ? `<i class="fa-solid fa-search" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Nenhum aluno encontrado.</p>` : `<i class="fa-solid fa-users" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Nenhum aluno na lista.</p>`;
      studentListContainer.appendChild(placeholder);
      paginationContainer.innerHTML = ""; // Limpa a paginação
    } else {
      const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));

      // Agrupa os alunos paginados por turma
      const paginatedGrouped = paginatedStudents.reduce((acc, student) => {
        const turma = turmaMap.get(student.turma_id) || { turma: "Sem Turma", turno: "" };
        const key = `${turma.turma} - ${turma.turno}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
        return acc;
      }, {});

      // Ordena as chaves do grupo (nomes das turmas)
      const sortedGroupKeys = Object.keys(paginatedGrouped).sort();

      // Renderiza os grupos
      if (sortedGroupKeys.length === 0 && studentList.length > 0) {
        // Caso em que há resultados na busca, mas não nesta página
        placeholder.innerHTML = `<i class="fa-solid fa-search" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Nenhum aluno encontrado nesta página.</p>`;
        studentListContainer.appendChild(placeholder);
      } else {
        sortedGroupKeys.forEach((groupKey) => {
          // Não mostra o título da turma se estiver buscando, para uma lista mais limpa
          if (!isSearching) {
            const title = document.createElement("h2");
            title.className = "turma-title";
            title.textContent = groupKey;
            studentListContainer.appendChild(title);
          }

          paginatedGrouped[groupKey]
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
            .forEach((student) => {
              const card = document.createElement("div");
              card.className = "noxss-card noxss-card--interactive student-card";
              card.innerHTML = createStudentCardHTML(student, searchTerm);
              studentListContainer.appendChild(card);
            });
        });
      }

      renderPaginationControls(studentList.length, studentsPerPage);
    }
  };

  // Função auxiliar para calcular a idade a partir da data de nascimento (dd/mm/aaaa)
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const parts = dobString.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const birthDate = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const renderInicio = () => {
    // Atualiza o cabeçalho da escola (conteúdo da antiga aba 'Início')
    const { escola, localizacao } = database.metadata;
    document.getElementById("home-school-name").textContent = escola || "Nome da Escola";
    document.getElementById("home-school-location").textContent = localizacao || "Endereço não configurado";

    const dashboardContent = document.getElementById("dashboard-content");
    const students = database.alunos;
    if (students.length === 0) {
      dashboardContent.innerHTML = `<div id="placeholder" class="text-secondary"><i class="fa-solid fa-chart-pie" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Não há dados para exibir.</p></div>`;
      return;
    }

    // Novas estatísticas
    const total = students.length;
    const activeStudentList = students.filter((s) => (s.status || "Ativo") === "Ativo");
    const activeStudentsCount = activeStudentList.length;
    const transferredStudents = students.filter((s) => s.status === "Transferido").length;
    const inactiveStudents = students.filter((s) => s.status === "Inativo").length;

    // Contagem de gênero apenas para alunos ativos
    const activeStudentsByGender = activeStudentList.reduce((acc, s) => {
      const gender = s.sexo || "Não informado";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));
    const byTurma = activeStudentList.reduce((acc, s) => {
      const turma = turmaMap.get(s.turma_id) || { turma: "Sem Turma", turno: "" };
      const key = `${turma.turma} - ${turma.turno}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byTurno = activeStudentList.reduce((acc, s) => {
      const turma = turmaMap.get(s.turma_id) || { turno: "Sem Turno" };
      const turnoKey = turma.turno || "Sem Turno";
      acc[turnoKey] = (acc[turnoKey] || 0) + 1;
      return acc;
    }, {});

    const byTurmaAndGender = activeStudentList.reduce((acc, s) => {
      const turma = turmaMap.get(s.turma_id) || { turma: "Sem Turma", turno: "" };
      const turmaKey = `${turma.turma} - ${turma.turno}`;
      const gender = s.sexo || "Não informado";
      if (!acc[turmaKey]) acc[turmaKey] = { Masculino: 0, Feminino: 0, "Não informado": 0 };
      acc[turmaKey][gender]++;
      return acc;
    }, {});

    const byTurnoAndGender = activeStudentList.reduce((acc, s) => {
      const turma = turmaMap.get(s.turma_id) || { turno: "Sem Turno" };
      const turnoKey = turma.turno || "Sem Turno";
      const gender = s.sexo || "Não informado";
      if (!acc[turnoKey]) acc[turnoKey] = { Masculino: 0, Feminino: 0, "Não informado": 0 };
      acc[turnoKey][gender]++;
      return acc;
    }, {});

    const createListItems = (data) =>
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => `<li class="noxss-list-item"><div class="noxss-list-item__content">${key}</div><strong class="noxss-list-item__trailing">${value}</strong></li>`)
        .join("");

    const createGenderListItems = (data) =>
      Object.entries(data)
        .sort()
        .map(([key, value]) => `<li class="noxss-list-item"><div class="noxss-list-item__content">${key}</div><div class="noxss-list-item__trailing d-flex gap-3"><span class="info-item"><i class="fa-solid fa-mars noxss-icon"></i> ${value["Masculino"] || 0}</span> <span class="info-item"><i class="fa-solid fa-venus noxss-icon"></i> ${value["Feminino"] || 0}</span></div></li>`)
        .join("");

    dashboardContent.innerHTML = `
            <div class="noxss-card-deck" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Total de Alunos</div><div class="stat-value">${total}</div></div><i class="noxss-icon stat-icon fa-solid fa-users"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Ativos</div><div class="stat-value">${activeStudentsCount}</div></div><i class="noxss-icon stat-icon fa-solid fa-user-check"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Transferidos</div><div class="stat-value">${transferredStudents}</div></div><i class="noxss-icon stat-icon fa-solid fa-user-xmark"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Inativos</div><div class="stat-value">${inactiveStudents}</div></div><i class="noxss-icon stat-icon fa-solid fa-user-minus"></i></div></div>
                <div class="noxss-card noxss-card--stat">
                    <div class="stat-content">
                        <div><div class="stat-label">Meninos (Ativos)</div><div class="stat-value">${activeStudentsByGender["Masculino"] || 0}</div></div>
                        <i class="noxss-icon stat-icon fa-solid fa-mars"></i>
                    </div>
                </div>
                <div class="noxss-card noxss-card--stat">
                    <div class="stat-content">
                        <div><div class="stat-label">Meninas (Ativas)</div><div class="stat-value">${activeStudentsByGender["Feminino"] || 0}</div></div>
                        <i class="noxss-icon stat-icon fa-solid fa-venus"></i>
                    </div>
                </div>
            </div>
            <div class="noxss-card-deck mt-4">
                <div class="noxss-card"><div class="noxss-card__header"><h3 class="noxss-card__title">Alunos Ativos por Turma</h3></div><ul class="noxss-list">${createListItems(byTurma)}</ul></div>
                <div class="noxss-card"><div class="noxss-card__header"><h3 class="noxss-card__title">Alunos Ativos por Turno</h3></div><ul class="noxss-list">${createListItems(byTurno)}</ul></div>
                <div class="noxss-card"><div class="noxss-card__header"><h3 class="noxss-card__title">Gênero por Turma (Ativos)</h3></div><ul class="noxss-list">${createGenderListItems(byTurmaAndGender)}</ul></div>
                <div class="noxss-card"><div class="noxss-card__header"><h3 class="noxss-card__title">Gênero por Turno (Ativos)</h3></div><ul class="noxss-list">${createGenderListItems(byTurnoAndGender)}</ul></div>
            </div>`;
  };

  const renderMetadata = () => {
    document.getElementById("meta-escola").value = database.metadata.escola || "";
    document.getElementById("meta-localizacao").value = database.metadata.localizacao || "";
    document.getElementById("meta-contato").value = database.metadata.contato || "";
    document.getElementById("meta-students-per-page").value = database.metadata.studentsPerPage || 20;

    turmasListEl.innerHTML =
      database.metadata.turmas
        .sort((a, b) => `${a.turma}-${a.turno}`.localeCompare(`${b.turma}-${b.turno}`))
        .map((t) => {
          const prof1 = t.professor1 || "Não definido";
          const prof2 = t.professor2 ? ` e ${t.professor2}` : "";
          const professores = `${prof1}${prof2}`;

          return `
                <li class="noxss-list-item">
                    <div class="noxss-list-item__content">
                        <div class="noxss-list-item__title">${t.turma} - ${t.turno}</div>
                        <div class="noxss-list-item__subtitle">Professor(es): ${professores}</div>
                    </div>
                    <div class="noxss-list-item__trailing">
                        <button class="noxss-btn noxss-btn--icon edit-turma-btn" data-id="${t.id}" title="Editar Turma"><i class="fa-solid fa-pen-to-square noxss-icon"></i></button>
                        <button class="noxss-btn noxss-btn--icon delete-btn" data-type="turma" data-id="${t.id}" title="Remover Turma"><i class="fa-solid fa-trash noxss-icon"></i></button>
                    </div>
                </li>
            `;
        })
        .join("") || '<p class="text-secondary text-center p-3">Nenhuma turma registrada.</p>';
  };

  // --- LÓGICA DE DADOS E EVENTOS ---
  const saveDatabase = (source = "local") => {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
    if (source !== "cloud") saveToJSONBin(database);
    // Re-render all relevant views
    renderMetadata();
    if (document.querySelector("#panel-alunos.is-visible")) updateAndRenderStudentList();
    if (document.querySelector("#panel-inicio.is-visible")) renderInicio();
  };

  const openStudentModal = (student = null) => {
    studentForm.reset();
    document.getElementById("studentId").value = student ? student.id : ""; // Usa o ID do aluno
    document.getElementById("studentModalLabel").textContent = student ? "Editar Aluno" : "Adicionar Novo Aluno";

    const turmaSelect = document.getElementById("turma_id");
    turmaSelect.innerHTML =
      '<option value="">Selecione uma turma...</option>' +
      database.metadata.turmas
        .sort((a, b) => `${a.turma}-${a.turno}`.localeCompare(`${b.turma}-${b.turno}`))
        .map((t) => `<option value="${t.id}">${t.turma} - ${t.turno}</option>`)
        .join("");

    if (student) {
      Object.keys(student).forEach((key) => {
        const input = document.getElementById(key);
        if (input) input.value = Array.isArray(student[key]) ? student[key].join(", ") : student[key];
      });
    }

    // Toggle visibility of transferencia field based on status
    if (statusSelect.value === "Transferido") {
      transferenciaWrapper.style.display = "block";
    } else {
      transferenciaWrapper.style.display = "none";
      document.getElementById("data_transferencia").value = ""; // Clear value when hidden
    }

    Noxss.Modals.open("studentModal");
    setTimeout(() => document.getElementById("nome").focus(), 400);
  };

  statusSelect.addEventListener("change", (e) => {
    if (e.target.value === "Transferido") {
      transferenciaWrapper.style.display = "block";
    } else {
      transferenciaWrapper.style.display = "none";
      document.getElementById("data_transferencia").value = ""; // Clear value when hidden
    }
  });

  const openTurmaModal = (turma = null) => {
    turmaForm.reset();
    document.getElementById("turmaId").value = turma ? turma.id : "";
    document.getElementById("turmaModalLabel").textContent = turma ? "Editar Turma" : "Adicionar Nova Turma";
    if (turma) {
      document.getElementById("turma-nome").value = turma.turma;
      document.getElementById("turma-turno").value = turma.turno;
      document.getElementById("turma-professor1").value = turma.professor1 || "";
      document.getElementById("turma-professor2").value = turma.professor2 || "";
    }
    Noxss.Modals.open("turmaModal");
    setTimeout(() => document.getElementById("turma-nome").focus(), 400);
  };

  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Lê o ID do formulário primeiro.
    const studentId = document.getElementById("studentId").value;

    // 2. Define um "molde" para o objeto do aluno, garantindo que todas as chaves existam.
    const studentTemplate = {
      id: null,
      nome: "",
      cpf: "",
      status: "Ativo",
      turma_id: "",
      nascimento: "",
      sexo: "",
      mae: "",
      pai: "",
      telefone: [],
      endereco: "",
      cor: "",
      observacoes: "",
      data_matricula: "",
      data_transferencia: "",
    };

    // 3. Coleta os dados do formulário e mescla com o molde.
    const studentData = {
      ...studentTemplate,
      nome: document.getElementById("nome").value.trim(),
      cpf: document.getElementById("cpf").value.trim(),
      status: document.getElementById("status").value,
      turma_id: document.getElementById("turma_id").value,
      nascimento: document.getElementById("nascimento").value.trim(),
      sexo: document.getElementById("sexo").value,
      mae: document.getElementById("mae").value.trim(),
      pai: document.getElementById("pai").value.trim(),
      telefone: document
        .getElementById("telefone")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      endereco: document.getElementById("endereco").value.trim(),
      cor: document.getElementById("cor").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),
      data_matricula: document.getElementById("data_matricula").value.trim(),
      data_transferencia: document.getElementById("data_transferencia").value.trim(),
    };

    // 4. Lógica para Editar ou Adicionar
    if (studentId) {
      // MODO EDIÇÃO: O aluno já existe.
      studentData.id = studentId; // Garante que o ID seja mantido.
      const index = database.alunos.findIndex((s) => s.id === studentId);
      if (index > -1) {
        database.alunos[index] = studentData; // Substitui o aluno antigo pelos novos dados.
      }
    } else {
      // MODO CRIAÇÃO: É um novo aluno.
      studentData.id = crypto.randomUUID(); // Gera um UUID v4 padrão.
      database.alunos.push(studentData); // Adiciona ao banco de dados.
    }
    saveDatabase();
    Noxss.Modals.close();
    Noxss.Toasts.show({ message: "Aluno salvo!", status: "success" });
  });

  metadataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    database.metadata.escola = document.getElementById("meta-escola").value;
    database.metadata.localizacao = document.getElementById("meta-localizacao").value;
    database.metadata.contato = document.getElementById("meta-contato").value;
    database.metadata.studentsPerPage = parseInt(document.getElementById("meta-students-per-page").value, 10) || 20;
    saveDatabase();
    Noxss.Toasts.show({ message: "Metadados salvos!", status: "success" });
  });

  turmaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("turmaId").value;
    const turmaData = {
      id: id || generateId(),
      turma: document.getElementById("turma-nome").value.trim().toUpperCase(),
      turno: document.getElementById("turma-turno").value.trim().toUpperCase(),
      professor1: document.getElementById("turma-professor1").value.trim(),
      professor2: document.getElementById("turma-professor2").value.trim(),
    };

    if (!turmaData.turma || !turmaData.turno) {
      Noxss.Toasts.show({ message: "Nome da turma e turno são obrigatórios.", status: "danger" });
      return;
    }

    const existingIndex = database.metadata.turmas.findIndex((t) => t.id === id);
    if (existingIndex > -1) {
      database.metadata.turmas[existingIndex] = turmaData;
    } else {
      database.metadata.turmas.push(turmaData);
    }
    saveDatabase();
    Noxss.Modals.close("turmaModal");
    Noxss.Toasts.show({ message: "Turma salva!", status: "success" });
  });

  document.getElementById("add-student-btn").addEventListener("click", () => openStudentModal());
  document.getElementById("add-turma-btn").addEventListener("click", () => openTurmaModal());

  turmasListEl.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-turma-btn");
    if (editBtn) {
      const turma = database.metadata.turmas.find((t) => t.id === editBtn.dataset.id);
      if (turma) openTurmaModal(turma);
    }
  });

  document.body.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    if (!deleteBtn) return;

    const type = deleteBtn.dataset.type;
    const modalTitle = document.getElementById("deleteConfirmTitle");
    const modalText = document.getElementById("deleteConfirmText");
    const modalName = document.getElementById("deleteConfirmName");
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    if (type === "student") {
      const studentId = deleteBtn.dataset.id;
      const student = database.alunos.find((s) => s.id === studentId);
      modalTitle.textContent = "Confirmar Exclusão de Aluno";
      modalText.textContent = "Você tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita.";
      modalName.textContent = student.nome;
      Noxss.Modals.open("deleteConfirmModal");
      confirmBtn.onclick = () => {
        database.alunos = database.alunos.filter((s) => s.id !== studentId);
        saveDatabase();
        Noxss.Modals.close();
        Noxss.Toasts.show({ message: "Aluno removido.", status: "danger" });
      };
    } else if (type === "turma") {
      const id = deleteBtn.dataset.id;
      const turma = database.metadata.turmas.find((t) => t.id === id);
      const studentCount = database.alunos.filter((s) => s.turma_id === id).length;

      modalTitle.textContent = "Confirmar Exclusão de Turma";
      modalName.textContent = `${turma.turma} - ${turma.turno}`;

      if (studentCount > 0) {
        modalText.innerHTML = `Não é possível remover esta turma, pois existem <strong>${studentCount} aluno(s)</strong> vinculados a ela.`;
        confirmBtn.style.display = "none";
      } else {
        modalText.textContent = "Você tem certeza que deseja remover esta turma? Esta ação não pode ser desfeita.";
        confirmBtn.style.display = "inline-flex";
      }

      Noxss.Modals.open("deleteConfirmModal");
      confirmBtn.onclick = () => {
        const turmaIndex = database.metadata.turmas.findIndex((t) => t.id === id);
        if (turmaIndex > -1) database.metadata.turmas.splice(turmaIndex, 1);
        saveDatabase();
        Noxss.Modals.close();
        Noxss.Toasts.show({ message: "Turma removida.", status: "danger" });
      };
    }
  });

  const renderStudentDetailsModal = (student) => {
    const modalBody = document.getElementById("viewStudentModalBody");
    const safe = (text, fallback = "Não informado") => text || fallback;

    const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));
    const turma = turmaMap.get(student.turma_id) || {};

    const createStatusAlert = (status) => {
      const statusMap = {
        Ativo: { icon: "check-circle", cssClass: "success", text: "Este aluno está frequentando as aulas normalmente." },
        Inativo: { icon: "minus-circle", cssClass: "secondary", text: "Este aluno não está mais ativo no sistema." },
        Transferido: { icon: "arrow-right-circle", cssClass: "warning", text: `Este aluno foi transferido na data: ${safe(student.data_transferencia)}.` },
      };
      const config = statusMap[status] || statusMap["Inativo"];
      return `
            <div class="noxss-alert noxss-alert--${config.cssClass} mb-4">
                <div class="noxss-alert__icon">
                    <i class="fa-solid ${config.icon} noxss-icon"></i>
                </div>
                <div class="noxss-alert__content">
                    <strong class="noxss-alert__title">Status: ${status}</strong>
                    ${config.text}
                </div>
            </div>
        `;
    };

    const createListItem = (icon, label, value) => {
      if (!value || value === "Não informado" || value === "CPF: Não informado") return "";
      return `
            <li class="noxss-list-item">
                <div class="noxss-list-item__leading">
                    <div class="noxss-list-item__icon">
                        <i class="fa-solid ${icon} noxss-icon"></i>
                    </div>
                </div>
                <div class="noxss-list-item__content">
                    <div class="noxss-list-item__title">${label}</div>
                </div>
                <div class="noxss-list-item__trailing">
                    <span class="detail-value">${value}</span>
                </div>
            </li>
        `;
    };

    const html = `
      <div class="student-details-container">
        <div class="student-details-header mb-4">
          <div class="student-details-avatar">
            <i class="fa-solid fa-user-circle"></i>
          </div>
          <h2 class="student-name">${safe(student.nome)}</h2>
        </div>

        ${createStatusAlert(student.status)}

        <div class="noxss-card noxss-card--flat mt-4">
            <div class="noxss-card__header"><h3 class="noxss-card__title">Dados Pessoais</h3></div>
            <ul class="noxss-list">
                ${createListItem("fa-id-card", "CPF", formatCPF(student.cpf))}
                ${createListItem("fa-cake-candles", "Nascimento", safe(student.nascimento))}
                ${createListItem(student.sexo === "Feminino" ? "fa-venus" : student.sexo === "Masculino" ? "fa-mars" : "fa-genderless", "Sexo", safe(student.sexo))}
                ${createListItem("fa-palette", "Cor/Raça", safe(student.cor))}
            </ul>
        </div>

        <div class="noxss-card noxss-card--flat mt-4">
            <div class="noxss-card__header"><h3 class="noxss-card__title">Dados Escolares</h3></div>
            <ul class="noxss-list">
                ${createListItem("fa-chalkboard-user", "Turma", `${safe(turma.turma, "N/A")} - ${safe(turma.turno, "N/A")}`)}
                ${createListItem("fa-user", "Professor(a) titular 1", safe(turma.professor1))}
                ${createListItem("fa-user", "Professor(a) titular 2", safe(turma.professor2))}
                ${createListItem("fa-calendar-day", "Data de Matrícula", safe(student.data_matricula))}
            </ul>
        </div>

        <div class="noxss-card noxss-card--flat mt-4">
            <div class="noxss-card__header"><h3 class="noxss-card__title">Filiação e Contato</h3></div>
            <ul class="noxss-list">
                ${createListItem("fa-person-breastfeeding", "Mãe", safe(student.mae))}
                ${createListItem("fa-person", "Pai", safe(student.pai))}
                ${createListItem("fa-phone", "Telefone(s)", student.telefone && student.telefone.length ? student.telefone.join(", ") : "")}
                ${createListItem("fa-map-pin", "Endereço", safe(student.endereco))}
            </ul>
        </div>

        ${
          student.observacoes
            ? `
        <div class="noxss-card noxss-card--flat mt-4">
            <div class="noxss-card__header"><h3 class="noxss-card__title">Observações</h3></div>
            <div class="noxss-card__body">
                <p class="text-secondary" style="white-space: pre-wrap;">${safe(student.observacoes)}</p>
            </div>
        </div>
        `
            : ""
        }
      </div>
    `;
    modalBody.innerHTML = html;
  };

  studentListContainer.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      const student = database.alunos.find((s) => s.id === editBtn.dataset.id);
      if (student) openStudentModal(student);
      return;
    }

    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      const student = database.alunos.find((s) => s.id === viewBtn.dataset.id);
      if (!student) return;
      renderStudentDetailsModal(student);
      Noxss.Modals.open("viewStudentModal");
    }
  });

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    currentPage = 1; // Reseta para a primeira página a cada nova busca
    clearSearchBtn.style.display = term ? "block" : "none";
    updateAndRenderStudentList();
  });

  turmaFilterToggle.addEventListener("click", () => {
    turmaFilterOptions.classList.toggle("is-open");
    turmaFilterToggle.querySelector(".filter-chevron").classList.toggle("is-open");
  });

  turmaFilterOptions.addEventListener("change", (e) => {
    if (e.target.classList.contains("turma-filter-checkbox")) {
      const turmaId = e.target.dataset.turmaId;
      if (e.target.checked) selectedTurmaIds.add(turmaId);
      else selectedTurmaIds.delete(turmaId);
      currentPage = 1; // Reseta a página ao mudar o filtro
      updateAndRenderStudentList();
    }
  });

  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;

    currentPage = parseInt(btn.dataset.page, 10);
    updateAndRenderStudentList();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
  });

  let fileToLoad = null;

  document.getElementById("load-list-btn").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    fileToLoad = file; // Armazena o arquivo para ser usado depois
    Noxss.Modals.open("loadConfirmModal"); // Abre o modal de confirmação
    fileInput.value = ""; // Limpa o input para permitir selecionar o mesmo arquivo novamente
  });

  confirmLoadBtn.addEventListener("click", () => {
    if (!fileToLoad) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target.result);
        database = processLoadedData(loadedData);
        saveDatabase();
        Noxss.Toasts.show({ message: "Banco de dados carregado com sucesso!", status: "success" });
        document.querySelector(".noxss-tabs").dispatchEvent(new CustomEvent("noxss:tab:change", { detail: { activeTabId: "dashboard" } }));
      } catch (error) {
        Noxss.Toasts.show({ message: `Arquivo JSON inválido: ${error.message}`, status: "danger" });
      }
    };
    reader.readAsText(fileToLoad);
    Noxss.Modals.close("loadConfirmModal");
    fileToLoad = null; // Limpa a referência ao arquivo
  });

  document.getElementById("download-list-btn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `database_alunos_${new Date().toISOString().split("T")[0]}.json`);
    dl.click();
    dl.remove();
    Noxss.Toasts.show({ message: "Download iniciado.", status: "info" });
  });

  document.querySelector(".noxss-tabs").addEventListener("noxss:tab:change", (event) => {
    const activeTabId = event.detail.activeTabId;
    if (activeTabId === "inicio") renderInicio();
    if (activeTabId === "alunos") updateAndRenderStudentList();
    if (activeTabId === "settings") renderMetadata(); // Renderiza metadados na aba de configurações
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
  });

  // --- INICIALIZAÇÃO ---
  (async () => {
    const cloudData = await fetchFromJSONBin();
    let dataToProcess = cloudData || JSON.parse(localStorage.getItem(DB_KEY) || "null");

    if (!dataToProcess) {
      // Fallback para o formato mais antigo
      const oldData = JSON.parse(localStorage.getItem("schoolAppStudents") || "null");
      if (oldData) dataToProcess = oldData;
    }

    database = processLoadedData(dataToProcess);
    saveDatabase(cloudData ? "cloud" : "local");

    // Inicializa o filtro de turmas com todas selecionadas
    selectedTurmaIds = new Set(database.metadata.turmas.map((t) => t.id));
    renderTurmaFilter();

    const initialTab = document.querySelector(".noxss-tabs").dataset.defaultTab || "inicio";
    document.querySelector(".noxss-tabs").dispatchEvent(new CustomEvent("noxss:tab:change", { detail: { activeTabId: initialTab } }));
  })();
});
