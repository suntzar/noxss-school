// build-js.js - Versão "Vanilla" Node.js para combinar e minificar arquivos JS

const fs = require('fs');
const path = require('path');

// --- Configuração ---
const jsInputDir = path.join(__dirname, 'js'); // Diretório base dos seus arquivos JS
const jsOutputDir = path.join(__dirname, 'dist'); // O mesmo diretório de saída 'dist'
const jsOutputFile = path.join(jsOutputDir, 'noxss.js');
const jsOutputMinFile = path.join(jsOutputDir, 'noxss.min.js');

// -----------------------------------------------------------------------------
// IMPORTANTE: Defina a ordem de concatenação dos arquivos aqui.
// O arquivo 'core.js' DEVE ser o primeiro.
// -----------------------------------------------------------------------------
const jsFilesToCombine = [
    'core.js',
    'components/alerts.js',
    'components/fab.js',       // Usando a versão mais recente que você forneceu
    'components/forms.js',
    'components/modals.js',
    'components/player.js',
    'components/tabs.js',
    'components/toasts.js',
    'components/typography.js',
    'components/palette.js'
    // Adicione outros componentes aqui se necessário
];

console.log('🚀 Iniciando o processo de build da Noxss JS (modo nativo)...');

try {
    // 1. Garante que o diretório de saída 'dist/' exista
    if (!fs.existsSync(jsOutputDir)) {
        fs.mkdirSync(jsOutputDir, { recursive: true });
    }
    console.log(`✅ Diretório '${jsOutputDir}/' pronto.`);

    let combinedJs = '';

    // 2. Lê e combina cada arquivo na ordem especificada
    for (const file of jsFilesToCombine) {
        const fullPath = path.join(jsInputDir, file);
        try {
            console.log(`   + Juntando: ${file}`);
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            // Adiciona o conteúdo do arquivo, um ponto e vírgula para segurança, e duas quebras de linha
            combinedJs += fileContent + ';\n\n';
        } catch (e) {
            console.error(`❌ Erro ao ler o arquivo: ${fullPath}`);
            throw e; // Interrompe o build se um arquivo não for encontrado
        }
    }

    // 3. Adiciona um banner/cabeçalho
    const banner = `/*!\n * Noxss JS v1.0\n * Copyright ${new Date().getFullYear()} [Seu Nome]\n * Gerado em: ${new Date().toISOString()}\n */\n`;
    const finalJs = banner + combinedJs;

    // 4. Salva o arquivo compilado e legível
    fs.writeFileSync(jsOutputFile, finalJs);
    console.log(`✅ Arquivo JS compilado salvo em: ${path.basename(jsOutputFile)}`);

    // 5. Minificação Manual (Básica e Segura para JS)
    console.log('⚙️  Minificando o JS (método básico)...');
    let minifiedJs = finalJs;
    // Remove comentários de bloco /* ... */
    minifiedJs = minifiedJs.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove comentários de linha // ...
    minifiedJs = minifiedJs.replace(/\/\/(.*)/g, '');
    // Remove linhas em branco e espaços no início/fim de cada linha
    minifiedJs = minifiedJs.replace(/^\s*|\s*$/gm, '');
    // Remove quebras de linha (substitui por um espaço para não quebrar a sintaxe)
    minifiedJs = minifiedJs.replace(/(\r\n|\n|\r)/gm, ' ');
    // Remove múltiplos espaços em branco
    minifiedJs = minifiedJs.replace(/\s+/g, ' ');

    fs.writeFileSync(jsOutputMinFile, minifiedJs);
    console.log(`✅ Arquivo JS minificado salvo em: ${path.basename(jsOutputMinFile)}`);
    console.log('\n⚠️  Aviso: A minificação é básica. Para produção, considere usar uma ferramenta como Terser.');

    console.log('\n🎉 Build do JavaScript concluído com sucesso!');

} catch (error) {
    console.error('\n❌ Erro durante o processo de build do JavaScript:');
    console.error(error);
    process.exit(1); // Encerra com erro
}