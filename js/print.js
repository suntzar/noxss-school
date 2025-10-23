document.addEventListener("DOMContentLoaded", () => {
  const printableContent = document.getElementById("printable-content");
  const printBtn = document.getElementById("print-btn");
  const DB_KEY = "schoolAppDatabase_v2";
  const landscapeToggle = document.getElementById("landscape-toggle");
  const printOrientationStyle = document.getElementById("print-orientation-style");

  /**
   * Função de ordenação personalizada que prioriza strings que começam com letras sobre as que começam com números.
   */
  const customTurmaSort = (a, b) => {
    const aStartsWithNumber = /^\d/.test(a);
    const bStartsWithNumber = /^\d/.test(b);

    if (aStartsWithNumber && !bStartsWithNumber) return 1;
    if (!aStartsWithNumber && bStartsWithNumber) return -1;

    return a.localeCompare(b, undefined, { numeric: true });
  };

  /**
   * Atualiza a folha de estilo de impressão para definir a orientação da página.
   */
  const updatePrintOrientation = () => {
    if (landscapeToggle.checked) {
      printOrientationStyle.textContent = `
        @media print {
          @page { size: A4 landscape; margin: 1.5cm; }
        }
      `;
    } else {
      printOrientationStyle.textContent = `
        @media print {
          @page { size: A4 portrait; margin: 2cm; }
        }
      `;
    }
  };

  const loadAndRenderData = () => {
    const dbString = localStorage.getItem(DB_KEY);
    if (!dbString) {
      printableContent.innerHTML = "<h1>Erro</h1><p>Banco de dados não encontrado. Volte para a página principal e carregue os dados.</p>";
      return;
    }

    const database = JSON.parse(dbString);
    const { alunos, metadata } = database;
    const { escola, turmas } = metadata;

    const activeStudents = alunos.filter((aluno) => (aluno.status || "Ativo") === "Ativo");

    if (activeStudents.length === 0) {
      printableContent.innerHTML = `<h1>${escola || "Lista de Alunos"}</h1><p>Nenhum aluno ativo encontrado.</p>`;
      return;
    }

    const turmaMap = new Map(turmas.map((t) => [t.id, t]));

    const studentsByTurma = activeStudents.reduce((acc, student) => {
      const turma = turmaMap.get(student.turma_id) || { turma: "Sem Turma", turno: "" };
      const key = `${turma.turma} - ${turma.turno}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(student);
      return acc;
    }, {});

    // Ordena os alunos dentro de cada turma
    for (const key in studentsByTurma) {
      studentsByTurma[key].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    }

    // Ordena as turmas
    const sortedTurmas = Object.keys(studentsByTurma).sort(customTurmaSort);

    let html = `<h1>${escola || "Lista de Alunos Ativos"}</h1>`;

    sortedTurmas.forEach((turmaKey, index) => {
      const studentList = studentsByTurma[turmaKey];
      // Adiciona quebra de página antes de cada turma, exceto a primeira.
      html += `
        <div class="${index > 0 ? "page-break" : ""}">
        <h2>Turma: ${turmaKey}</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 3%;">#</th>
              <th style="width: 20%;">Nome do Aluno</th>
              <th style="width: 10%;">Nascimento</th>
              <th style="width: 8%;">Cor/Raça</th>
              <th style="width: 17%;">Nome da Mãe</th>
              <th style="width: 17%;">Nome do Pai</th>
              <th style="width: 10%;">Contato</th>
              <th style="width: 15%;">Endereço</th>
            </tr>
          </thead>
          <tbody>
            ${studentList
              .map(
                (student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.nome || "Não informado"}</td>
                <td>${student.nascimento || "Não informado"}</td>
                <td>${student.cor || "Não informado"}</td>
                <td>${student.mae || "Não informado"}</td>
                <td>${student.pai || "Não informado"}</td>
                <td>${(student.telefone || []).join(", ") || "Não informado"}</td>
                <td>${student.endereco || "Não informado"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        </div>
      `;
    });

    printableContent.innerHTML = html;
    // Exibe os controles de impressão após o conteúdo ser carregado
    const controls = document.querySelector(".print-controls");
    if (controls) controls.style.display = "flex";
  };

  printBtn.addEventListener("click", () => {
    // Esconde os botões e depois chama a impressão
    const controls = document.querySelector(".print-controls");
    controls.style.display = "none";
    window.print();
    // Mostra os botões novamente após a impressão ser fechada/cancelada
    setTimeout(() => {
      controls.style.display = "flex";
    }, 500);
  });

  landscapeToggle.addEventListener("change", updatePrintOrientation);

  // Inicia o processo
  loadAndRenderData();
  // Define a orientação inicial
  updatePrintOrientation();
});
