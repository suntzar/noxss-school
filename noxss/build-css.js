// build.js - Versão "Vanilla" Node.js, sem dependências externas

const fs = require('fs');
const path = require('path');

// --- Configuração ---
const inputDir = path.join(__dirname, 'css');
const inputFile = path.join(inputDir, 'noxss.css');
const outputDir = path.join(__dirname, 'dist');
const outputFile = path.join(outputDir, 'noxss.css');
const outputMinFile = path.join(outputDir, 'noxss.min.css');

console.log('🚀 Iniciando o processo de build da Noxss (modo nativo)...');

try {
    // 1. Garante que o diretório de saída 'dist/' exista
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    console.log(`✅ Diretório '${outputDir}/' pronto.`);

    // 2. Lê o arquivo de entrada principal
    const mainCss = fs.readFileSync(inputFile, 'utf8');

    let combinedCss = '';

    // 3. Processa cada linha para encontrar os @import
    const lines = mainCss.split('\n');
    for (const line of lines) {
        // Procura por linhas no formato @import url('...');
        if (line.trim().startsWith('@import')) {
            const importPathMatch = line.match(/url\(['"]?(.+?)['"]?\)/);
            if (importPathMatch) {
                const importedFile = importPathMatch[1];
                const fullPath = path.join(inputDir, importedFile);
                
                try {
                    console.log(`⚙️  Importando e juntando: ${importedFile}`);
                    const importedContent = fs.readFileSync(fullPath, 'utf8');
                    combinedCss += importedContent + '\n';
                } catch (e) {
                    console.error(`❌ Erro ao ler o arquivo importado: ${fullPath}`);
                    throw e; // Interrompe o build se um arquivo não for encontrado
                }
            }
        }
    }
    
    // 4. Adiciona um banner/cabeçalho
    const banner = `/*!\n * Noxss v1.0\n * Copyright ${new Date().getFullYear()} [Seu Nome]\n * Gerado em: ${new Date().toISOString()}\n */\n`;
    const finalCss = banner + combinedCss;

    // 5. Salva o arquivo compilado e legível
    fs.writeFileSync(outputFile, finalCss);
    console.log(`✅ Arquivo compilado salvo em: ${path.basename(outputFile)}`);

    // 6. Minificação Manual (Básica)
    console.log('⚙️  Minificando o CSS (método básico)...');
    let minifiedCss = finalCss;
    // Remove comentários /* ... */
    minifiedCss = minifiedCss.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove quebras de linha
    minifiedCss = minifiedCss.replace(/\r\n|\r|\n/g, '');
    // Remove espaços extras ao redor de { } : ; ,
    minifiedCss = minifiedCss.replace(/\s*([,;:{ P@} >])\s*/g, '$1');
    // Remove o último ponto-e-vírgula antes de um '}'
    minifiedCss = minifiedCss.replace(/;}/g, '}');
    
    fs.writeFileSync(outputMinFile, minifiedCss);
    console.log(`✅ Arquivo minificado salvo em: ${path.basename(outputMinFile)}`);

    console.log('\n🎉 Build concluído com sucesso!');

} catch (error) {
    console.error('\n❌ Erro durante o processo de build:');
    console.error(error);
    process.exit(1); // Encerra com erro
}
