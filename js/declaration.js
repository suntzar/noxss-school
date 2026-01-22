document.addEventListener("DOMContentLoaded", () => {
  const DB_KEY = "schoolAppDatabase_v2";

  // --- Elementos da UI ---
  const studentSelect = document.getElementById("student-select");
  const declarationTypeSelect = document.getElementById("declaration-type-select");
  const declarationContentEl = document.getElementById("declaration-content");
  const printBtn = document.getElementById("print-btn");

  // --- Carregamento de Dados ---
  let database = JSON.parse(localStorage.getItem(DB_KEY));
  if (!database) {
    declarationContentEl.innerHTML = `<p style="color: red; text-align: center;">Erro: Banco de dados não encontrado. Volte para a página principal e carregue os dados.</p>`;
    return;
  }

  const turmaMap = new Map(database.metadata.turmas.map((t) => [t.id, t]));

  // --- Funções de Formatação Dinâmica ---

  const formatSchoolInfo = (school) => {
    const inepInfo = school.inep ? ` (INEP: ${school.inep})` : "";
    const schoolName = school.escola ? `<strong>${school.escola}</strong>` : "";
    // Para mostrar o inep no corpo da seclaração em casos especificos, use : return `${schoolName}${inepInfo}`;
    return `${schoolName}`;
  };

  const formatFiliacao = (student) => {
    const mae = student.mae;
    const pai = student.pai;
    if (mae && pai) {
      return `, filho(a) de ${mae} e ${pai}`;
    } else if (mae) {
      return `, filho(a) de ${mae}`;
    } else if (pai) {
      return `, filho(a) de ${pai}`;
    }
    return ""; // Retorna string vazia se não houver pai nem mãe
  };

  // --- Modelos de Declaração ---
  const declarationTemplates = {
    matricula: {
      name: "Declaração de Matrícula",
      title: "DECLARAÇÃO DE MATRÍCULA",
      generateBody: (student, school, turma) => `Declaramos para os devidos fins que <strong>${student.nome.toUpperCase()}</strong>${formatFiliacao(student)}, nascido(a) em ${student.nascimento || "__/__/____"}, está regularmente matriculado(a) na instituição de ensino ${formatSchoolInfo(school)}, no ano letivo de ${new Date().getFullYear()}, cursando o(a) <strong>${turma.turma}</strong> no turno <strong>${turma.turno}</strong>.`,
    },
    transferencia: {
      name: "Declaração de Transferência",
      title: "DECLARAÇÃO DE TRANSFERÊNCIA",
      generateBody: (student, school, turma) => `Declaramos para os devidos fins que <strong>${student.nome.toUpperCase()}</strong>${formatFiliacao(student)}, esteve regularmente matriculado(a) na instituição de ensino ${formatSchoolInfo(school)} no ano letivo de ${new Date().getFullYear()}, cursando o(a) <strong>${turma.turma}</strong> no turno <strong>${turma.turno}</strong>, tendo solicitado transferência nesta data.`,
    },
    conclusao: {
      name: "Declaração de Conclusão",
      title: "DECLARAÇÃO DE CONCLUSÃO",
      generateBody: (student, school, turma) => `Declaramos para os devidos fins que <strong>${student.nome.toUpperCase()}</strong>, nascido(a) em ${student.nascimento || "__/__/____"}${formatFiliacao(student)}, concluiu o(a) <strong>${turma.turma}</strong> na instituição de ensino ${formatSchoolInfo(school)}.<br /><br />Situação: Aprovado(a)`,
    },
  };

  // --- MODELO ANTIGO DE DECLARAÇÃO DE CONCLUSÃO ---
  // generateBody: (student, school, turma) => `Declaramos para os devidos fins que <strong>${student.nome.toUpperCase()}</strong>${formatFiliacao(student)}, nascido(a) em ${student.nascimento || "__/__/____"}, concluiu com aproveitamento o(a) <strong>${turma.turma}</strong> na instituição de ensino ${formatSchoolInfo(school)}, no ano letivo de ${new Date().getFullYear()}.`,

  // --- Funções Auxiliares ---
  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = today.toLocaleString("pt-BR", { month: "long" });
    const year = today.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  // --- Renderização e Lógica Principal ---

  /**
   * Gera e renderiza o conteúdo completo da declaração.
   */
  const renderDeclaration = () => {
    const studentId = studentSelect.value;
    const declarationType = declarationTypeSelect.value;

    if (!studentId || !declarationType) {
      declarationContentEl.innerHTML = `<p style="text-align: center; margin-top: 5cm; color: #888">Selecione um aluno e um tipo de declaração para começar.</p>`;
      return;
    }

    const student = database.alunos.find((s) => s.id === studentId);
    const template = declarationTemplates[declarationType];
    const school = database.metadata;
    const turma = turmaMap.get(student.turma_id) || { turma: "[TURMA NÃO ENCONTRADA]", turno: "[TURNO NÃO ENCONTRADO]" };

    const bodyText = template.generateBody(student, school, turma);

    const dateLine = school.cidade ? `${school.cidade}, ${getFormattedDate()}.` : `${getFormattedDate()}.`;

    declarationContentEl.innerHTML = `
      <h2 style="text-align: center; font-size: 14pt; margin: 4cm 0 2cm 0; font-weight: bold;">${template.title}</h2>

      <p class="body-text">
        ${bodyText}
        <br />
        <br />
        Por ser a expressão da verdade dato e assino a presente declaração, para que surta os devidos efeitos legais.
      </p>

      <p class="date-line">
        ${dateLine}
      </p>

      <div class="signature-block">
        <img class="gest-sig" src="assets/halysson-sig.png">
        <div class="signature-line"></div>
        <div class="signature-title">
          <strong>${school.gestor || ""}</strong><br>
          <span>Assinatura do Gestor(a)</span>
        </div>
      </div>
    `;
  };

  /**
   * Popula os selects com os dados do banco.
   */
  const populateSelects = () => {
    // Popula alunos
    const sortedStudents = [...database.alunos].sort((a, b) => a.nome.localeCompare(b.nome));
    studentSelect.innerHTML =
      '<option value="">-- Selecione um Aluno --</option>' +
      sortedStudents
        .map((student) => {
          const turma = turmaMap.get(student.turma_id);
          const turmaLabel = turma ? `(${turma.turma} - ${turma.turno})` : "(Sem Turma)";
          return `<option value="${student.id}">${student.nome} ${turmaLabel}</option>`;
        })
        .join("");

    // Popula tipos de declaração
    declarationTypeSelect.innerHTML =
      '<option value="">-- Tipo de Declaração --</option>' +
      Object.entries(declarationTemplates)
        .map(([key, { name }]) => `<option value="${key}">${name}</option>`)
        .join("");
  };

  // --- Event Listeners ---
  studentSelect.addEventListener("change", renderDeclaration);
  declarationTypeSelect.addEventListener("change", renderDeclaration);
  printBtn.addEventListener("click", () => window.print());

  // --- Inicialização ---
  populateSelects();
  renderDeclaration(); // Renderiza o estado inicial (placeholder)
});
