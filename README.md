# Gerenciador de Alunos - Noxss School

O **Gerenciador de Alunos** é uma aplicação web _single-page_ (SPA) e totalmente _client-side_ projetada para facilitar o cadastro e a organização de informações de estudantes em uma instituição de ensino. Todos os dados são armazenados localmente no navegador do usuário, garantindo privacidade e funcionamento offline.

O projeto se destaca por não necessitar de um backend ou banco de dados externo, utilizando `localStorage` para persistência de dados. Ele também inclui um mini-framework CSS/JS customizado chamado **Noxss**, construído para ser leve e modular.

---

## ✨ Funcionalidades Principais

- **Autenticação Simples**: Tela de login para proteger o acesso (credenciais: `admin`/`admin`).
- **Dashboard Inicial**: Visão geral com estatísticas rápidas sobre os alunos (total, por gênero, por turma).
- **Gerenciamento de Alunos (CRUD)**:
  - Adicionar, visualizar, editar e excluir alunos.
  - Campos detalhados: nome, CPF, data de matrícula, status (Ativo, Inativo, Transferido), filiação, contato, observações e mais.
- **Gerenciamento de Turmas**: Crie e edite turmas, associando professores e turnos.
- **Busca e Filtragem Avançada**:
  - Pesquise alunos por nome, CPF, filiação ou observações.
  - Filtre a lista de alunos por uma ou mais turmas.
- **Paginação**: Navegue facilmente por listas longas de alunos.
- **Portabilidade de Dados**:
  - **Exportar**: Baixe um backup completo de todos os dados (alunos, turmas, configurações) em um único arquivo `JSON`.
  - **Importar**: Carregue um arquivo `JSON` para restaurar ou migrar os dados, substituindo os existentes.
- **Geração de Relatórios**:
  - Página de impressão otimizada no formato A4.
  - Opção para gerar um arquivo `.docx` a partir da lista de alunos.
  - Gerador de Ofícios: Crie ofícios personalizados com um editor Markdown e preenchimento automático de dados da escola.
- **Customização da Interface**:
  - **Modo Claro/Escuro**: Alterne entre os temas com um clique.
  - **Paletas de Cores**: Escolha entre diversos temas estáticos e paletas de cores dinâmicas para personalizar a aparência da aplicação.
- **Design Responsivo**: Interface adaptada para uso em desktops, tablets e celulares.

---

## 🚀 Como Executar o Projeto

Como esta é uma aplicação puramente front-end, você não precisa de um servidor complexo. A maneira mais fácil de executá-la é usando uma extensão de servidor web local para evitar problemas com a política de mesma origem (CORS) do navegador.

1.  **Clone o repositório**:

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd noxss-school
    ```

2.  **Use um Servidor Local**:

    - **Com a extensão Live Server (VS Code)**:
      1.  Instale a extensão Live Server no Visual Studio Code.
      2.  Abra a pasta do projeto no VS Code.
      3.  Clique com o botão direito no arquivo `login.html` e selecione "Open with Live Server".
    - **Com Python**:
      Se você tiver Python instalado, navegue até a pasta do projeto no terminal e execute:
      ```bash
      # Para Python 3
      python -m http.server
      ```
    - **Com Node.js**:
      Se você tiver Node.js, instale o pacote `serve` globalmente e execute:
      ```bash
      npm install -g serve
      serve .
      ```

3.  **Acesse a aplicação**:
    Abra seu navegador e acesse o endereço fornecido pelo servidor local (geralmente `http://127.0.0.1:5500` ou `http://localhost:8000`). Você será direcionado para a página de login.

4.  **Login**:
    - **Usuário**: `admin`
    - **Senha**: `admin`

---

## 🛠️ Estrutura e Tecnologias

- **HTML5 Semântico**: Estrutura clara e acessível.
- **CSS3**: Estilização moderna com Variáveis CSS para theming.
- **JavaScript (ES6+)**: Lógica da aplicação, manipulação do DOM e gerenciamento de estado.
- **Noxss Framework (Custom)**:
  - Localizado em `/noxss`.
  - Um conjunto de componentes CSS e JS criados para este projeto.
  - Inclui scripts de build (`build-css.js`, `build-js.js`) em Node.js para concatenar e minificar os arquivos do framework em `noxss/dist/`.
- **Font Awesome**: Para iconografia.
- **html-to-docx-ts**: Biblioteca para exportar a lista de alunos para o formato DOCX.

### Estrutura de Arquivos

```
noxss-school/
├── assets/               # Ícones e imagens
├── css/
│   └── style.css         # Estilos customizados da aplicação
├── js/
│   ├── auth.js           # Script de proteção de rota
│   ├── print.js          # Lógica da página de impressão
│   └── script.js         # Lógica principal da aplicação
├── noxss/
│   ├── css/              # Arquivos-fonte do framework CSS
│   ├── js/               # Arquivos-fonte do framework JS
│   ├── dist/             # Arquivos compilados (noxss.css, noxss.js)
│   ├── build-css.js      # Script de build para o CSS
│   └── build-js.js       # Script de build para o JS
├── index.html            # Página principal da aplicação
├── login.html            # Página de login
├── print.html            # Página para impressão/exportação
└── README.md             # Este arquivo
```

---

## 🔧 Scripts de Build (Noxss)

O projeto inclui scripts para "compilar" os arquivos do mini-framework Noxss. Para executá-los, você precisa do Node.js instalado.

1.  Navegue até a pasta `/noxss`: `cd noxss`
2.  Execute os scripts para gerar os arquivos em `dist/`:

    ```bash
    # Para compilar o CSS
    node build-css.js

    # Para compilar o JavaScript
    node build-js.js
    ```
