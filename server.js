const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Mapeamento de extensões de arquivo para Content-Types para que o navegador saiba como processá-los.
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
    console.log(`Requisição recebida: ${req.url}`);

    // Constrói o caminho do arquivo, tratando a raiz (/) como index.html
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Pega a extensão do arquivo para determinar o mimeType
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                // Se o arquivo não for encontrado, retorna um erro 404
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>O recurso solicitado não foi encontrado.</p>', 'utf-8');
            } else {
                // Outro erro de servidor
                res.writeHead(500);
                res.end(`Erro do Servidor: ${error.code}`);
            }
        } else {
            // Se o arquivo for encontrado, serve com o contentType correto
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}).listen(PORT, () => {
    console.log(`Servidor local iniciado com sucesso em http://localhost:${PORT}`);
    console.log('Use Ctrl+C para parar o servidor.');
});
