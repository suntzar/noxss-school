// --- GERENCIADOR DE TEMA ---
const htmlElement = document.documentElement;
const MODE_KEY = "schoolAppThemeMode";
const PALETTE_KEY = "schoolAppPalette";

const palettes = {
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

const applyTheme = (mode, paletteName) => {
  const themeSwitcher = document.getElementById("theme-switcher");
  const palette = palettes[paletteName] || palettes["Azul Céu"];
  const paletteColor = palette[mode];

  htmlElement.setAttribute("data-noxss-theme-gen", mode);
  htmlElement.setAttribute("data-noxss-palette-gen", paletteColor);
  if (themeSwitcher) {
    themeSwitcher.innerHTML = mode === "dark" ? `<i data-feather="sun" class="noxss-icon"></i>` : `<i data-feather="moon" class="noxss-icon"></i>`;
  }
  if (window.feather) feather.replace();
  localStorage.setItem(MODE_KEY, mode);
  localStorage.setItem(PALETTE_KEY, paletteName);
};

// --- LÓGICA PRINCIPAL DO APLICATIVO ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica de Tema ---
  const themeSwitcher = document.getElementById("theme-switcher");
  const paletteSelect = document.getElementById("palette-select");
  paletteSelect.innerHTML = Object.keys(palettes)
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");
  const savedMode = localStorage.getItem(MODE_KEY);
  const savedPaletteName = localStorage.getItem(PALETTE_KEY) || "Azul Céu";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentMode = savedMode || (prefersDark ? "dark" : "light");
  applyTheme(currentMode, savedPaletteName);
  paletteSelect.value = savedPaletteName;
  themeSwitcher.addEventListener("click", () => {
    const currentMode = localStorage.getItem(MODE_KEY) || "light";
    const newMode = currentMode === "dark" ? "light" : "dark";
    applyTheme(newMode, localStorage.getItem(PALETTE_KEY));
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
      turmas: [],
    },
    alunos: [],
  };
  const DB_KEY = "schoolAppDatabase_v2";
  const JSONBIN_API_KEY = "$2a$10$s976JjTPuXOZQ.kCH7E6i.FdOJ0R2vLsy9rqYrlBLSMRXxmHnA552";
  const JSONBIN_BIN_ID = "68d5a70e43b1c97be9501077";
  const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

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

  // --- FUNÇÕES AUXILIARES ---
  const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

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
    let db = { metadata: { escola: "Nova Escola", localizacao: "", contato: "", turmas: [] }, alunos: [] };
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

  // --- UI & RENDERIZAÇÃO ---
  const createStudentCardHTML = (student, index) => {
    const safe = (text) => text || "Não informado";
    const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));
    const turma = turmaMap.get(student.turma_id) || { turma: "Sem Turma", turno: "" };
    const turmaNome = turma.turma === "Sem Turma" ? "Sem Turma" : `${turma.turma} - ${turma.turno}`;

    return `
      <div class="noxss-card__header">
        <h3 class="noxss-card__title">${safe(student.nome)}</h3>
        <div class="student-card-actions">
          <button class="noxss-btn noxss-btn--icon edit-btn" data-index="${index}" title="Editar"><i data-feather="edit-2" class="noxss-icon"></i></button>
          <button class="noxss-btn noxss-btn--icon delete-btn" data-type="student" data-index="${index}" title="Excluir"><i data-feather="trash-2" class="noxss-icon"></i></button>
        </div>
      </div>
      <div class="noxss-card__body student-card-body">
        <div class="student-card-main-info">
          <div class="student-status status-${(student.status || 'ativo').toLowerCase().replace(' ', '-')}">
            <span class="status-dot"></span>
            <span class="status-text">${safe(student.status)}</span>
          </div>
          <div class="info-item">
            <i data-feather="award" class="noxss-icon"></i>
            <span>${turmaNome}</span>
          </div>
          <div class="info-item">
            <i data-feather="gift" class="noxss-icon"></i>
            <span>${safe(student.nascimento)}</span>
          </div>
           <div class="info-item">
            <i data-feather="user" class="noxss-icon"></i>
            <span>${safe(student.sexo)}</span>
          </div>
        </div>
        <div class="student-card-secondary-info">
          <div class="info-item">
            <strong>Mãe:</strong> ${safe(student.mae)}
          </div>
          <div class="info-item">
            <strong>Pai:</strong> ${safe(student.pai)}
          </div>
          <div class="info-item">
            <strong>Telefone(s):</strong> ${Array.isArray(student.telefone) ? student.telefone.join(", ") : "Não informado"}
          </div>
          <div class="info-item">
            <strong>Endereço:</strong> ${safe(student.endereco)}
          </div>
        </div>
      </div>`;
  };

  const renderStudentList = (studentList = database.alunos) => {
    const searchTerm = searchInput.value.toLowerCase();
    const isSearching = searchTerm.length > 0;
    studentListContainer.innerHTML = "";

    if (studentList.length === 0) {
      placeholder.innerHTML = isSearching ? `<i data-feather="search" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Nenhum aluno encontrado.</p>` : `<i data-feather="users" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Nenhum aluno na lista.</p>`;
      studentListContainer.appendChild(placeholder);
    } else {
      const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));
      const grouped = studentList.reduce((acc, student) => {
        const turma = turmaMap.get(student.turma_id) || { turma: "Sem Turma", turno: "" };
        const key = `${turma.turma} - ${turma.turno}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
        return acc;
      }, {});

      Object.keys(grouped)
        .sort()
        .forEach((groupKey) => {
          if (!isSearching) {
            const title = document.createElement("h2");
            title.className = "turma-title";
            title.textContent = groupKey;
            studentListContainer.appendChild(title);
          }
          grouped[groupKey]
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
            .forEach((student) => {
              const originalIndex = database.alunos.indexOf(student);
              const card = document.createElement("div");
              card.className = "noxss-card noxss-card--interactive student-card";
              card.innerHTML = createStudentCardHTML(student, originalIndex);
              studentListContainer.appendChild(card);
            });
        });
    }
    feather.replace();
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

  const renderDashboard = () => {
    const dashboardContent = document.getElementById("dashboard-content");
    const students = database.alunos;
    if (students.length === 0) {
      dashboardContent.innerHTML = `<div id="placeholder" class="text-secondary"><i data-feather="pie-chart" style="width: 3rem; height: 3rem;"></i><p class="mt-3">Não há dados para exibir.</p></div>`;
      feather.replace();
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
    const createListItems = (data) =>
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => `<li class="noxss-list-item"><div class="noxss-list-item__content">${key}</div><strong class="noxss-list-item__trailing">${value}</strong></li>`)
        .join("");

    dashboardContent.innerHTML = `
            <div class="noxss-card-deck" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Total de Alunos</div><div class="stat-value">${total}</div></div><i class="noxss-icon stat-icon" data-feather="users"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Ativos</div><div class="stat-value">${activeStudentsCount}</div></div><i class="noxss-icon stat-icon" data-feather="user-check"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Transferidos</div><div class="stat-value">${transferredStudents}</div></div><i class="noxss-icon stat-icon" data-feather="user-x"></i></div></div>
                <div class="noxss-card noxss-card--stat"><div class="stat-content"><div><div class="stat-label">Alunos Inativos</div><div class="stat-value">${inactiveStudents}</div></div><i class="noxss-icon stat-icon" data-feather="user-minus"></i></div></div>
                <div class="noxss-card noxss-card--stat">
                    <div class="stat-content">
                        <div><div class="stat-label">Meninos (Ativos)</div><div class="stat-value">${activeStudentsByGender["Masculino"] || 0}</div></div>
                        <i class="noxss-icon stat-icon" data-feather="user"></i>
                    </div>
                </div>
                <div class="noxss-card noxss-card--stat">
                    <div class="stat-content">
                        <div><div class="stat-label">Meninas (Ativas)</div><div class="stat-value">${activeStudentsByGender["Feminino"] || 0}</div></div>
                        <i class="noxss-icon stat-icon" data-feather="user"></i>
                    </div>
                </div>
            </div>
            <div class="noxss-card-deck mt-4">
                <div class="noxss-card"><div class="noxss-card__header"><h3 class="noxss-card__title">Alunos Ativos por Turma</h3></div><ul class="noxss-list">${createListItems(byTurma)}</ul></div>
            </div>`;
    feather.replace();
  };

  const renderMetadata = () => {
    document.getElementById("meta-escola").value = database.metadata.escola || "";
    document.getElementById("meta-localizacao").value = database.metadata.localizacao || "";
    document.getElementById("meta-contato").value = database.metadata.contato || "";

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
                        <button class="noxss-btn noxss-btn--icon edit-turma-btn" data-id="${t.id}" title="Editar Turma"><i data-feather="edit-2" class="noxss-icon"></i></button>
                        <button class="noxss-btn noxss-btn--icon delete-btn" data-type="turma" data-id="${t.id}" title="Remover Turma"><i data-feather="trash-2" class="noxss-icon"></i></button>
                    </div>
                </li>
            `;
        })
        .join("") || '<p class="text-secondary text-center p-3">Nenhuma turma registrada.</p>';
    feather.replace();
  };

  // --- LÓGICA DE DADOS E EVENTOS ---
  const saveDatabase = (source = "local") => {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
    if (source !== "cloud") saveToJSONBin(database);
    // Re-render all relevant views
    renderMetadata();
    if (document.querySelector("#panel-alunos.is-visible")) renderStudentList();
    if (document.querySelector("#panel-dashboard.is-visible")) renderDashboard();
  };

  const openStudentModal = (student = null, index = -1) => {
    studentForm.reset();
    document.getElementById("studentIndex").value = index;
    document.getElementById("studentModalLabel").textContent = index === -1 ? "Adicionar Novo Aluno" : "Editar Aluno";

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
    Noxss.Modals.open("studentModal");
    setTimeout(() => document.getElementById("nome").focus(), 400);
  };

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
    const index = parseInt(document.getElementById("studentIndex").value, 10);
    const studentData = {
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
    };
    if (index === -1) database.alunos.push(studentData);
    else database.alunos[index] = studentData;
    saveDatabase();
    Noxss.Modals.close();
    Noxss.Toasts.show({ message: "Aluno salvo!", status: "success" });
  });

  metadataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    database.metadata.escola = document.getElementById("meta-escola").value;
    database.metadata.localizacao = document.getElementById("meta-localizacao").value;
    database.metadata.contato = document.getElementById("meta-contato").value;
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
      const index = parseInt(deleteBtn.dataset.index, 10);
      const student = database.alunos[index];
      modalTitle.textContent = "Confirmar Exclusão de Aluno";
      modalText.textContent = "Você tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita.";
      modalName.textContent = student.nome;
      Noxss.Modals.open("deleteConfirmModal");
      confirmBtn.onclick = () => {
        database.alunos.splice(index, 1);
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

  studentListContainer.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) openStudentModal(database.alunos[editBtn.dataset.index], editBtn.dataset.index);
  });

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    clearSearchBtn.style.display = term ? "block" : "none";
    const filtered = database.alunos.filter((s) => (s.nome || "").toLowerCase().includes(term) || (s.cpf || "").includes(term) || (s.mae || "").toLowerCase().includes(term) || (s.pai || "").toLowerCase().includes(term));
    renderStudentList(filtered);
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
    if (activeTabId === "dashboard") renderDashboard();
    if (activeTabId === "alunos") renderStudentList();
    if (activeTabId === "settings") renderMetadata(); // Renderiza metadados na aba de configurações
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

    const initialTab = document.querySelector(".noxss-tabs__panel.is-visible")?.id.replace("panel-", "") || "dashboard";
    document.querySelector(".noxss-tabs").dispatchEvent(new CustomEvent("noxss:tab:change", { detail: { activeTabId: initialTab } }));
  })();
});
