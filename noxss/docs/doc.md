# Documentação Noxss v1.1

Bem-vindo à documentação oficial da Noxss, uma biblioteca de componentes e utilitários CSS/JS de código aberto, projetada com uma filosofia "App-First" para acelerar o desenvolvimento de interfaces de aplicativos web modernos, responsivos e temáticos.

---

## 1. Começando (Getting Started)

Esta seção guiará você pelos passos iniciais para instalar e configurar a Noxss em seu projeto.

### 1.1. Introdução

A Noxss não é apenas uma coleção de estilos, mas um pequeno framework de UI focado em resolver problemas comuns no desenvolvimento de aplicativos, como:

*   **Tematização Avançada:** Mude a aparência inteira do seu aplicativo com uma única linha de HTML, ou gere temas completos e dinâmicos a partir de uma única cor.
*   **Layout de App:** Uma estrutura de layout pronta para criar interfaces de tela cheia com navbars e conteúdo rolável.
*   **Componentes Reutilizáveis:** De botões e formulários a modais e toasts, a Noxss oferece componentes prontos e consistentes.
*   **Classes Utilitárias:** Um sistema atômico para construir layouts e estilos customizados rapidamente, sem sair do seu HTML.

### 1.2. Instalação e Uso

A maneira mais fácil de começar é incluir os arquivos CSS e JS da Noxss diretamente no seu arquivo HTML.

#### Estrutura HTML Básica

Copie e cole este template inicial em seu arquivo `index.html`. Ele já inclui a estrutura recomendada e os links para os arquivos da biblioteca.

```html
<!doctype html>
<html lang="pt-br"> <!-- O tema Dark é o padrão -->
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meu App com Noxss</title>

    <!-- 1. CSS da Noxss -->
    <link rel="stylesheet" href="path/to/noxss/dist/noxss.css" />

    <!-- 2. Dependências Opcionais (se for usar os componentes) -->
    <script defer src="https://unpkg.com/feather-icons"></script>
    
    <!-- 3. Scripts da Noxss (no final do body) -->
    <script src="path/to/noxss/dist/noxss.js"></script>
    <script src="path/to/noxss/js/components/palette.js"></script> <!-- Opcional: Para geração de temas -->
    
    <!-- 4. Script de Inicialização (se necessário) -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (window.feather) {
                feather.replace({ class: 'noxss-icon' });
            }
        });
    </script>
</body>
</html>
```
> **Nota:** Lembre-se de substituir `path/to/` pelos caminhos corretos para os arquivos da Noxss.

### 1.3. Configuração Principal

A Noxss é controlada por atributos `data-*` simples na sua estrutura HTML.

#### Temas Estáticos (Light & Dark)

Para usar os temas predefinidos, adicione o atributo `data-theme` à sua tag `<html>`.

```html
<!-- Para usar o tema claro -->
<html lang="pt-br" data-theme="light"></html>

<!-- Para usar o tema escuro (padrão) -->
<html lang="pt-br" data-theme="dark"></html>
```

#### Layout de Aplicativo

Para criar uma interface de aplicativo de tela cheia, adicione `data-noxss-layout="app"` à sua tag `<body>`.

```html
<body data-noxss-layout="app">
    <div class="noxss-layout">
        <!-- ... -->
    </div>
</body>
```

---

## 2. Core e Utilitários

Esta seção aborda os conceitos centrais, convenções e as novas ferramentas de tematização e utilitários da Noxss.

### 2.1. Variáveis (Design Tokens)

A Noxss é construída sobre um sistema de variáveis CSS (`custom properties`). Isso permite a customização da aparência da Noxss ou a criação de seus próprios temas estáticos sobrescrevendo essas variáveis.

| Variável                     | Propósito                                       |
| ---------------------------- | ----------------------------------------------- |
| `--noxss-accent-primary`     | A cor principal de destaque da sua marca.       |
| `--noxss-bg-main`            | A cor de fundo principal da página/app.         |
| `--noxss-text-primary`       | A cor de texto principal.                       |
| `--noxss-border-color`       | A cor padrão para bordas e divisores.           |

### 2.2. Ícones

A Noxss é agnóstica a bibliotecas de ícones. Para garantir consistência, use a classe `.noxss-icon` em seu elemento de ícone (`<i>` ou `<svg>`).

```html
<button class="noxss-btn">
    <i data-feather="home" class="noxss-icon"></i>
    <span>Início</span>
</button>
```

### 2.3. Gerador de Tema Dinâmico (NOVO)

Este é um dos recursos mais poderosos da Noxss. Inspirado no Material You, ele permite gerar uma paleta de cores completa e acessível (seja clara ou escura) a partir de uma única cor de destaque. Isso é feito de forma declarativa, diretamente no seu HTML.

#### Como Usar

Para ativar o gerador, adicione dois atributos ao seu elemento `<html>`:

1.  `data-noxss-palette-gen`: Define a cor de destaque em formato hexadecimal.
2.  `data-noxss-theme-gen`: Define o modo do tema (`dark` ou `light`).

```html
<!doctype html>
<!-- Gera um tema escuro baseado na cor roxa -->
<html lang="pt-br" data-noxss-theme-gen="dark" data-noxss-palette-gen="#8a2be2">

<!-- Gera um tema claro baseado na cor verde -->
<html lang="pt-br" data-noxss-theme-gen="light" data-noxss-palette-gen="#198754">
```

#### Atributos

| Atributo                  | Valores Aceitos                 | Propósito                                                                      |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `data-noxss-palette-gen`  | Cor hexadecimal (`#RRGGBB`)     | A cor principal que servirá de base para gerar toda a paleta.                  |
| `data-noxss-theme-gen`    | `dark` \| `light`                 | Define o modo do tema. Se omitido ou inválido, o padrão será **`dark`**.      |

#### Como Funciona

Ao detectar esses atributos, o script `palette.js` executa um algoritmo que:
1.  Converte a cor de destaque para o formato HSL (Matiz, Saturação, Luminosidade).
2.  Usa o **Matiz (Hue)** como a "alma" da paleta, garantindo harmonia cromática.
3.  Gera cores de fundo, texto e bordas com valores de saturação e luminosidade apropriados para o modo (claro ou escuro) escolhido.
4.  **Ajusta o contraste automaticamente:** Se você escolher uma cor de destaque muito clara para um tema claro (ex: amarelo), o script a escurecerá para garantir a legibilidade.
5.  Injeta as novas variáveis CSS em uma tag `<style>` no `<head>` e ativa o tema com `data-theme="generated"`.

---

## 3. Componentes de Layout

Os componentes de layout são a espinha dorsal para a criação de interfaces de aplicativos de página única (SPA) com a Noxss. Eles fornecem a estrutura para navbars, conteúdo rolável e navegação por abas.

Para usar estes componentes, lembre-se de adicionar `data-noxss-layout="app"` à sua tag `<body>`.

### 3.1. Estrutura (`.noxss-layout`)

O `.noxss-layout` é o contêiner principal do seu aplicativo. Ele usa Flexbox para organizar a tela em três seções verticais: uma barra superior, uma área de conteúdo principal que se expande, e uma barra inferior.

**Estrutura Básica:**

```html
<body data-noxss-layout="app">
    <div class="noxss-layout">

        <!-- 1. Barra de Navegação Superior -->
        <nav class="noxss-navbar">
            <!-- ... -->
        </nav>

        <!-- 2. Conteúdo Principal -->
        <main class="noxss-layout__content">
            <!-- O Sistema de Abas ou outro conteúdo vai aqui -->
        </main>

        <!-- 3. Barra de Navegação Inferior (opcional, para mobile) -->
        <nav class="noxss-navbar noxss-navbar--bottom d-md-none">
            <!-- ... -->
        </nav>

    </div>
</body>
```

### 3.2. Barras de Navegação (`.noxss-navbar`)

A Noxss fornece um componente de navbar flexível para o topo e o rodapé do seu app.

#### Navbar Superior

Use a classe `.noxss-navbar` para a barra superior. É ideal para exibir o título do aplicativo e ações globais.

```html
<nav class="noxss-navbar">
    <a class="noxss-navbar__brand" href="#">
        <i data-feather="box" class="noxss-icon"></i>
        <span>Meu App</span>
    </a>
    
    <!-- Botão de ação opcional no canto -->
    <button class="noxss-btn noxss-btn--icon" style="margin-left: auto;">
        <i data-feather="user" class="noxss-icon"></i>
    </button>
</nav>
```

#### Navbar Inferior

Adicione a classe modificadora `.noxss-navbar--bottom` para criar a barra de navegação inferior. Ela é comumente usada para a navegação principal em dispositivos móveis e geralmente é escondida em telas maiores com classes utilitárias como `.d-md-none`.

```html
<nav class="noxss-navbar noxss-navbar--bottom d-md-none">
    <!-- Botões que controlam as abas -->
    <button class="noxss-tabs__nav-button is-active" data-tab-id="home">
        <i data-feather="home" class="noxss-icon"></i>
    </button>
    <button class="noxss-tabs__nav-button" data-tab-id="search">
        <i data-feather="search" class="noxss-icon"></i>
    </button>
    <!-- ... -->
</nav>
```
> **Nota:** Os botões dentro da navbar inferior usam a classe `.noxss-tabs__nav-button`, pois sua função está ligada ao componente de Abas.

### 3.3. Sistema de Abas (`.noxss-tabs`)

Este é o componente central para a navegação do seu aplicativo. Ele cria painéis de conteúdo deslizantes (swipe) que são sincronizados com os botões de navegação.

**Estrutura Completa:**

```html
<!-- Coloque dentro do .noxss-layout__content -->
<div class="noxss-tabs" data-default-tab="home">

    <!-- 1. Cabeçalho de Abas (Desktop) -->
    <div class="noxss-tabs__header d-none d-md-flex">
        <button class="noxss-tabs__header-button" data-tab-id="home">Início</button>
        <button class="noxss-tabs__header-button" data-tab-id="profile">Perfil</button>
    </div>

    <!-- 2. Área de Conteúdo Deslizante -->
    <div class="noxss-tabs__content-area">

        <!-- Painel 1 -->
        <div class="noxss-tabs__panel" id="panel-home">
            <!-- Conteúdo da aba Início -->
        </div>

        <!-- Painel 2 -->
        <div class="noxss-tabs__panel" id="panel-profile">
            <!-- Conteúdo da aba Perfil -->
        </div>

    </div>
</div>
```

**Conectando Botões e Painéis:**
*   Cada botão de controle (seja no `__header` ou na `navbar--bottom`) precisa de um atributo `data-tab-id="meu-id"`.
*   Cada painel de conteúdo precisa de um `id` correspondente no formato `id="panel-meu-id"`.

**API JavaScript:**
O sistema de abas emite um evento customizado sempre que uma aba é trocada. Você pode "ouvir" esse evento para executar ações.

```javascript
const tabSystem = document.querySelector('.noxss-tabs');

tabSystem.addEventListener('noxss:tab:change', (event) => {
    const newTabId = event.detail.activeTabId;
    console.log(`O usuário mudou para a aba: ${newTabId}`);
    // Ex: Atualizar o título da página, buscar novos dados, etc.
});
```

### 3.4. FAB (Botão de Ação Flutuante)

O `.noxss-fab` é um botão que "flutua" sobre a interface para a ação principal da tela. Sua visibilidade e conteúdo podem ser controlados dinamicamente por cada painel de aba.

**Uso Básico:**
Adicione o botão no final do seu HTML, fora do `.noxss-layout`.

```html
<button class="noxss-fab">
    <!-- O conteúdo é gerenciado pelo JS -->
</button>
```

**Controle Contextual:**
Adicione atributos `data-fab-*` ao seu `.noxss-tabs__panel` para controlar o FAB quando aquele painel estiver ativo.

```html
<!-- Este painel mostrará o FAB com um ícone de 'plus' -->
<div class="noxss-tabs__panel" id="panel-tasks" data-fab-visible>
    ...
</div>

<!-- Este painel mostrará o FAB com um ícone de 'edit' -->
<div class="noxss-tabs__panel" id="panel-edit-post" data-fab-visible data-fab-icon="edit">
    ...
</div>

<!-- Este painel usa um ícone Font Awesome no FAB -->
<div class="noxss-tabs__panel" id="panel-users" data-fab-visible data-fab-html="<i class='fas fa-user-plus noxss-icon'></i>">
    ...
</div>

<!-- Este painel chama uma função JS ao clicar no FAB -->
<div class="noxss-tabs__panel" id="panel-form" data-fab-visible data-fab-action="meuApp.salvarFormulario()">
    ...
</div>
```

| Atributo            | Propósito                                              |
| ------------------- | ------------------------------------------------------ |
| `data-fab-visible`  | Torna o FAB visível para este painel.                  |
| `data-fab-icon`     | Define o ícone (Feather) a ser exibido.                |
| `data-fab-html`     | Define um HTML customizado para o conteúdo do FAB.     |
| `data-fab-action`   | Define uma função JS a ser executada no clique.        |
| `data-fab-target`   | Define o alvo de um modal a ser aberto.                |

---

---

## 4. Componentes de Conteúdo

Estes componentes são os blocos de construção para exibir suas informações de forma clara, organizada e esteticamente agradável.

### 4.1. Tipografia

A Noxss fornece estilos consistentes para todos os elementos de texto padrão, garantindo legibilidade e uma hierarquia visual clara.

**Exemplo de Elementos:**

```html
<!-- Hierarquia de Títulos -->
<h1>Título Nível 1</h1>
<h2>Título Nível 2</h2>
<h3>Título Nível 3 (com cor de destaque)</h3>

<!-- Parágrafo com elementos inline -->
<p>
    Este é um parágrafo com um <a href="#">link</a>.
    Use <strong>texto forte</strong> para ênfase e 
    <mark>para destacar</mark> informações.
    Atalhos de teclado como <kbd>Ctrl</kbd> + <kbd>C</kbd> também são estilizados.
</p>

<!-- Citação -->
<blockquote>
    "A simplicidade é o último grau de sofisticação."
</blockquote>
```

#### Blocos de Código com Highlight

Para exibir blocos de código com realce de sintaxe e um botão de "copiar", use o contêiner `.noxss-code-block`.

**Estrutura:**

```html
<div class="noxss-code-block">
    <pre><code class="language-javascript">// Seu código vai aqui
function hello() {
  console.log("Olá, Noxss!");
}</code></pre>
</div>
```

*   **Dependência:** Requer a biblioteca `highlight.js`.
*   **Linguagem:** Adicione a classe `language-*` (ex: `language-javascript`, `language-css`) ao elemento `<code>` para o realce correto.
*   **Funcionalidade:** O botão de cópia é adicionado automaticamente via JavaScript.

#### Tabelas

Tabelas são estilizadas com um design limpo, linhas zebradas e cabeçalho destacado.

```html
<table>
    <thead>
        <tr>
            <th>Produto</th>
            <th>Status</th>
            <th>Preço</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Noxss Library</td>
            <td><mark>Ativo</mark></td>
            <td>Grátis</td>
        </tr>
        <tr>
            <td>Módulo de IA</td>
            <td>Em desenvolvimento</td>
            <td>-</td>
        </tr>
    </tbody>
</table>
```

### 4.2. Cards (`.noxss-card`)

Cards são contêineres flexíveis para agrupar conteúdo relacionado.

**Estrutura Base:**

```html
<div class="noxss-card">
    <div class="noxss-card__header">
        <div class="noxss-card__title">Título do Card</div>
    </div>
    <div class="noxss-card__body">
        <p>Conteúdo principal do card.</p>
    </div>
    <div class="noxss-card__footer">
        <button class="noxss-btn noxss-btn--secondary">Ação</button>
    </div>
</div>
```

#### Variantes de Cards

Use classes modificadoras para alterar a aparência e o propósito do card.

| Classe                       | Propósito                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `.noxss-card--interactive`   | Adiciona efeito de hover, ideal para cards que são links.               |
| `.noxss-card--accent`        | Adiciona uma borda de destaque colorida para chamar atenção.             |
| `.noxss-card--success` (e outras cores) | Adiciona uma borda com cor semântica (sucesso, perigo, etc.). |
| `.noxss-card--stat`          | Layout otimizado para exibir uma métrica ou estatística de dashboard.   |
| `.noxss-card--ghost`         | Estilo "fantasma" com fundo transparente e borda tracejada.               |
| `.noxss-card--flat`          | Remove a `box-shadow` para um visual mais plano.                        |
| `.noxss-card--media-top`     | Ajusta o layout para uma imagem no topo do card.                          |

#### Layout de Grupo (`.noxss-card-deck`)

Para criar um grid responsivo de cards, envolva-os com a classe `.noxss-card-deck`.

```html
<div class="noxss-card-deck">
    <div class="noxss-card"><!-- Card 1 --></div>
    <div class="noxss-card"><!-- Card 2 --></div>
    <div class="noxss-card"><!-- Card 3 --></div>
</div>
```

### 4.3. Listas (`.noxss-list`)

Use listas para exibir conjuntos de dados verticais, como menus, configurações ou feeds.

**Estrutura de Item de Lista:**
O `.noxss-list-item` é um contêiner flex com três "slots" para máxima flexibilidade.

```html
<li class="noxss-list-item">
    <!-- Slot Esquerdo: Ícone, Avatar, etc. -->
    <div class="noxss-list-item__leading">
        <div class="noxss-list-item__icon">
            <i class="noxss-icon" data-feather="user"></i>
        </div>
    </div>
    
    <!-- Slot Central: Conteúdo principal -->
    <div class="noxss-list-item__content">
        <div class="noxss-list-item__title">Título do Item</div>
        <div class="noxss-list-item__subtitle">Subtítulo ou descrição</div>
    </div>

    <!-- Slot Direito: Ação, Metadado, Switch, etc. -->
    <div class="noxss-list-item__trailing">
        <i class="noxss-icon" data-feather="chevron-right"></i>
    </div>
</li>
```
**Variantes:**
*   `.noxss-list--inset`: Agrupa a lista com fundo e bordas próprias.
*   `.noxss-list-item--interactive`: Adiciona feedback de hover para itens clicáveis.
*   `.noxss-list-item__icon--success` (e outras cores): Estiliza o fundo do ícone com cores semânticas.

---

---

## 5. Componentes de Interação e Feedback

Estes componentes são a ponte entre o usuário e seu aplicativo. Eles permitem a entrada de dados, a execução de ações e fornecem feedback claro sobre o que está acontecendo no sistema.

### 5.1. Botões (`.noxss-btn`)

O componente de botão é a forma mais fundamental de interação. A Noxss oferece uma variedade de estilos para diferentes contextos.

**Uso Básico:**
```html
<button class="noxss-btn noxss-btn--primary">
    <i data-feather="check" class="noxss-icon"></i>
    <span>Ação Primária</span>
</button>

<button class="noxss-btn noxss-btn--secondary">
    Ação Secundária
</button>
```

**Variantes Principais:**

| Classe                 | Propósito                                        |
| ---------------------- | ------------------------------------------------ |
| `.noxss-btn--primary`  | A ação principal e mais importante.              |
| `.noxss-btn--secondary`| Ação secundária ou alternativa.                    |
| `.noxss-btn--success`  | Para ações de confirmação (ex: Salvar).          |
| `.noxss-btn--danger`   | Para ações destrutivas (ex: Excluir).            |
| `.noxss-btn--warning`  | Para ações que exigem atenção.                   |
| `.noxss-btn--link`     | Aparência de um link, mas com comportamento de botão. |
| `.noxss-btn--icon`     | Botão circular para conter apenas um ícone.        |

### 5.2. Formulários

Formulários são estilizados para serem limpos, consistentes e totalmente compatíveis com os temas Light e Dark.

**Estrutura Recomendada:**
Agrupe cada campo com seu `label` em um `.noxss-form-group` para um espaçamento correto.

```html
<form>
    <div class="noxss-form-group">
        <label for="email" class="noxss-label">Endereço de E-mail</label>
        <input type="email" id="email" class="noxss-input" placeholder="seu@email.com">
    </div>

    <div class="noxss-form-group">
        <label for="plano" class="noxss-label">Plano</label>
        <select id="plano" class="noxss-select">
            <option>Básico</option>
            <option>Premium</option>
        </select>
    </div>
    
    <div class="noxss-form-group">
        <label class="noxss-check">
            <input type="checkbox" checked>
            <span class="noxss-check-control"></span>
            <span>Aceito os termos</span>
        </label>
    </div>

    <button type="submit" class="noxss-btn noxss-btn--primary">Enviar</button>
</form>
```

### 5.3. Modais e Diálogos (`.noxss-modal`)

Use modais para interações que exigem o foco total do usuário.

**Como Usar:**
1.  **O Gatilho:** Adicione `data-noxss-modal-open="ID_DO_MODAL"` a qualquer botão ou link.
2.  **O Modal:** Crie a estrutura do modal e coloque-a no final do seu `<body>`.

**Estrutura do Modal:**

```html
<!-- O Modal (geralmente no final do body) -->
<div class="noxss-modal" id="meu-modal" data-noxss-modal>
    <div class="noxss-modal__dialog">
        <div class="noxss-modal__header">
            <h3 class="noxss-modal__title">Título do Modal</h3>
            <button class="noxss-btn noxss-btn--icon noxss-modal__close-btn" data-noxss-modal-close>
                <i data-feather="x" class="noxss-icon"></i>
            </button>
        </div>
        <div class="noxss-modal__body">
            <p>Conteúdo do modal...</p>
        </div>
        <div class="noxss-modal__footer">
            <button class="noxss-btn noxss-btn--secondary" data-noxss-modal-close>Cancelar</button>
            <button class="noxss-btn noxss-btn--primary">Confirmar</button>
        </div>
    </div>
</div>
```

**API JavaScript:**
Você também pode controlar modais via JavaScript:
`Noxss.Modals.open('meu-modal');`
`Noxss.Modals.close();`

### 5.4. Toasts e Notificações

Para feedback rápido e não intrusivo. Os toasts são criados e gerenciados inteiramente via JavaScript.

**Como Usar:**
Chame a função `Noxss.Toasts.show()` com um objeto de opções.

```javascript
// Exemplo de um toast de sucesso
Noxss.Toasts.show({
    message: 'Seu perfil foi salvo com sucesso!',
    status: 'success', // success, danger, warning, info
    duration: 3000,    // em milissegundos
    position: 'top-center' // ex: top-right, bottom-center, etc.
});
```
> O sistema cria e remove os elementos do DOM automaticamente.

### 5.5. Loaders (Indicadores de Carregamento)

Use loaders para informar ao usuário que uma ação está em andamento.

#### Spinners

Ideal para ações rápidas ou para uso dentro de botões. O spinner de pontos pulsantes é elegante e moderno.

```html
<!-- Spinner padrão -->
<div class="noxss-spinner">
    <div class="noxss-spinner-point-1"></div>
    <div class="noxss-spinner-point-2"></div>
    <div class="noxss-spinner-point-3"></div>
</div>

<!-- Spinner grande com cor primária -->
<div class="noxss-spinner noxss-spinner--lg" style="color: var(--noxss-accent-primary)">
    <!-- ... pontos ... -->
</div>
```

#### Barras de Progresso

Para tarefas mais longas, como uploads ou processos de várias etapas.

```html
<!-- Barra de progresso determinada -->
<div class="noxss-progress">
    <div class="noxss-progress__bar" style="width: 40%;"></div>
</div>

<!-- Barra de progresso indeterminada (com listras animadas) -->
<div class="noxss-progress noxss-progress--indeterminate">
    <div class="noxss-progress__bar"></div>
</div>
```

### 5.6. Alertas (`.noxss-alert`)

Alertas são usados para exibir mensagens importantes e contextuais que permanecem na tela até que sejam dispensadas pelo usuário (se essa opção for fornecida). São ideais para notificações de status de formulários, erros de sistema ou dicas informativas.

**Estrutura Básica:**
A estrutura de um alerta é flexível, permitindo a inclusão de um ícone, um título, o conteúdo principal e um botão para fechar.

```html
<div class="noxss-alert noxss-alert--success">
    <!-- Slot opcional para o ícone -->
    <div class="noxss-alert__icon">
        <i data-feather="check-circle" class="noxss-icon"></i>
    </div>
    
    <!-- Contêiner principal da mensagem -->
    <div class="noxss-alert__content">
        <strong class="noxss-alert__title">Sucesso!</strong>
        Sua operação foi concluída.
    </div>
    
    <!-- Botão opcional para dispensar o alerta -->
    <button class="noxss-alert__close-btn" aria-label="Fechar alerta">
        <i data-feather="x" class="noxss-icon"></i>
    </button>
</div>
```
> A funcionalidade de fechar o alerta é ativada automaticamente pelo JavaScript da Noxss (`alerts.js`) sempre que um `.noxss-alert__close-btn` é encontrado dentro de um `.noxss-alert`.

#### Variantes de Status

Use classes modificadoras para alterar a cor e o significado do alerta, comunicando visualmente sua intenção.

| Classe                  | Propósito                                                |
| ----------------------- | -------------------------------------------------------- |
| `.noxss-alert--info`    | **(Padrão)** Para informações gerais ou dicas. Usa a cor de destaque principal. |
| `.noxss-alert--success` | Para confirmar que uma ação foi bem-sucedida.            |
| `.noxss-alert--warning` | Para avisos que exigem a atenção do usuário.             |
| `.noxss-alert--danger`  | Para indicar erros críticos ou falhas em operações.      |

**Exemplo de um Alerta de Erro:**
```html
<div class="noxss-alert noxss-alert--danger">
    <div class="noxss-alert__icon">
        <i data-feather="x-octagon" class="noxss-icon"></i>
    </div>
    <div class="noxss-alert__content">
        <strong class="noxss-alert__title">Falha na Autenticação</strong>
        O nome de usuário ou a senha estão incorretos.
    </div>
</div>
```

---

---

## 6. Componentes Especiais

Esta seção cobre componentes mais complexos ou de nicho que a Noxss oferece.

### 6.1. Player de Música (`.noxss-player-compact`)

A Noxss inclui um componente de player de áudio compacto e elegante, ideal para incorporar faixas de música ou podcasts em seu aplicativo. Ele é controlado inteiramente via JavaScript e é capaz de ler metadados (título, artista, arte do álbum) diretamente dos arquivos MP3, se disponíveis.

**Dependência:** Requer a biblioteca `jsmediatags.min.js` para a funcionalidade completa de leitura de metadados.

#### Estrutura HTML

Para usar o player, você precisa incluir sua estrutura base no seu HTML. O JavaScript da Noxss irá encontrá-lo pelo `id` e o tornará funcional.

```html
<div class="noxss-player-compact" id="meuPlayer">
    <img src="" alt="Album Art" class="noxss-album-art" />
    <div class="noxss-track-info">
        <h3 class="noxss-title">Carregando...</h3>
        <p class="noxss-artist"></p>
    </div>
    <div class="noxss-controls">
        <button class="noxss-control-button noxss-prev-button" aria-label="Anterior" disabled>
            <i data-feather="skip-back" class="noxss-icon"></i>
        </button>
        <button class="noxss-control-button noxss-play-pause" aria-label="Play" disabled>
            <!-- O ícone de play/pause é inserido pelo JS -->
        </button>
        <button class="noxss-control-button noxss-next-button" aria-label="Próximo" disabled>
            <i data-feather="skip-forward" class="noxss-icon"></i>
        </button>
    </div>
    <!-- O elemento de áudio real fica escondido -->
    <audio class="noxss-audio-player" style="display: none;"></audio>
</div>
```

#### API JavaScript

Todo o controle do player é feito através da API `Noxss.Player`.

##### `Noxss.Player.setPlaylist(playerId, songUrls, playImmediately, repeatMode)`

Esta é a função principal para carregar músicas no player.

*   `playerId` (string, obrigatório): O `id` do elemento do player no seu HTML.
*   `songUrls` (array, obrigatório): Um array de strings com as URLs das suas faixas de áudio.
*   `playImmediately` (boolean, opcional, padrão: `false`): Se `true`, a primeira música começará a tocar imediatamente. Se `false`, os metadados da primeira música serão pré-carregados e exibidos.
*   `repeatMode` (string, opcional, padrão: `'all'`): Define o comportamento de repetição.
    *   `'all'`: Repete a playlist inteira.
    *   `'one'`: Repete a faixa atual continuamente.
    *   `'none'`: Toca a playlist uma vez e para.

**Exemplo de Uso:**

```javascript
// Define uma playlist para o player com id="meuPlayer"
const minhaPlaylist = [
    'path/to/musica1.mp3',
    'path/to/musica2.mp3',
    'path/to/musica3.mp3'
];

// Carrega a playlist, pré-carrega a primeira faixa, e define para tocar uma única vez
Noxss.Player.setPlaylist('meuPlayer', minhaPlaylist, false, 'none');
```

##### `Noxss.Player.setRepeatMode(playerId, mode)`

Permite alterar o modo de repetição de um player que já está ativo.

*   `playerId` (string, obrigatório): O `id` do player.
*   `mode` (string, obrigatório): O novo modo de repetição (`'all'`, `'one'`, ou `'none'`).

**Exemplo de Uso:**

```javascript
// Suponha que um botão no seu app altere o modo de repetição
const repeatButton = document.getElementById('meu-botao-repeat');
repeatButton.addEventListener('click', () => {
    // Altera o modo do player para repetir apenas uma música
    Noxss.Player.setRepeatMode('meuPlayer', 'one');
});
```

---

## 7. Classes Utilitárias (NOVO)

A Noxss agora inclui um sistema de classes utilitárias (ou atômicas) para acelerar o desenvolvimento, permitindo aplicar estilos granulares diretamente no HTML. Isso é ideal para prototipagem rápida, ajustes finos e construção de layouts customizados sem escrever CSS adicional.

### 7.1. Estrutura e Nomenclatura

*   **Prefixo:** Todas as classes utilitárias começam com `u-` para evitar conflitos.
*   **Separador:** Usa-se hífen (`-`) para separar a propriedade do valor (ex: `u-d-flex`).
*   **Responsividade:** As classes podem ser prefixadas com breakpoints (`md:`, `lg:`) para serem aplicadas apenas a partir daquele tamanho de tela.

**Estrutura:** `[breakpoint\:]u-[propriedade]-[valor]`
*   **Exemplo 1:** `u-p-3` (aplica `padding` da escala 3 em todos os tamanhos).
*   **Exemplo 2:** `md\:u-text-center` (centraliza o texto em telas médias e maiores).

### 7.2. Espaçamento (Margin & Padding)

Usa uma escala de `0` a `5` baseada na variável `--noxss-spacing-base`.

| Classe     | Propriedade(s) CSS                    |
| ---------- | ------------------------------------- |
| `u-m-{n}`  | `margin`                              |
| `u-mt-{n}` | `margin-top`                          |
| `u-mb-{n}` | `margin-bottom`                       |
| `u-ms-{n}` | `margin-left` (start)                 |
| `u-me-{n}` | `margin-right` (end)                  |
| `u-mx-{n}` | `margin-left` & `margin-right`        |
| `u-my-{n}` | `margin-top` & `margin-bottom`        |
| `u-p-{n}`  | `padding`                             |
| `u-pt-{n}` | `padding-top`                         |
| `u-pb-{n}` | `padding-bottom`                      |
| `u-ps-{n}` | `padding-left` (start)                |
| `u-pe-{n}` | `padding-right` (end)                 |
| `u-px-{n}` | `padding-left` & `padding-right`      |
| `u-py-{n}` | `padding-top` & `padding-bottom`      |

### 7.3. Layout (Display & Flexbox)

| Classe                  | Propriedade CSS                                  |
| ----------------------- | ------------------------------------------------ |
| `u-d-block`             | `display: block`                                 |
| `u-d-flex`              | `display: flex`                                  |
| `u-d-none`              | `display: none`                                  |
| `u-flex-row`            | `flex-direction: row`                            |
| `u-flex-col`            | `flex-direction: column`                         |
| `u-justify-start`       | `justify-content: flex-start`                    |
| `u-justify-center`      | `justify-content: center`                        |
| `u-justify-between`     | `justify-content: space-between`                 |
| `u-align-center`        | `align-items: center`                            |
| `u-align-stretch`       | `align-items: stretch`                           |
| `u-gap-{n}`             | `gap` (com a mesma escala de espaçamento)        |

### 7.4. Tipografia e Cores

| Classe                  | Propriedade CSS                                  |
| ----------------------- | ------------------------------------------------ |
| `u-text-center`         | `text-align: center`                             |
| `u-font-bold`           | `font-weight: 700`                               |
| `u-font-semibold`       | `font-weight: 600`                               |
| `u-text-primary`        | `color: var(--noxss-text-primary)`               |
| `u-text-secondary`      | `color: var(--noxss-text-secondary)`             |
| `u-text-accent`         | `color: var(--noxss-accent-primary)`             |

### 7.5. Design Responsivo

A Noxss usa uma abordagem **mobile-first**. As classes sem prefixo se aplicam a todos os tamanhos de tela. Para aplicar um estilo apenas a partir de um certo breakpoint, adicione o prefixo correspondente.

| Prefixo   | Breakpoint Mínimo | Exemplo de Classe    | Significado                                            |
| --------- | ----------------- | -------------------- | ------------------------------------------------------ |
| (nenhum)  | `0px`             | `u-flex-col`         | A direção será `column` em todas as telas.             |
| `md:`     | `768px`           | `md\:u-flex-row`     | A direção será `row` em telas de 768px ou mais.        |
| `lg:`     | `992px`           | `lg\:u-p-5`          | O `padding` será da escala 5 em telas grandes e maiores. |

**Exemplo Prático:**

```html
<!--
  - Começa como um flexbox em coluna.
  - Em telas médias (md) e maiores, torna-se uma linha.
  - O espaçamento (gap) aumenta em telas grandes (lg).
-->
<div class="u-d-flex u-flex-col md:u-flex-row u-gap-2 lg:u-gap-5">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```
```