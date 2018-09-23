const http = require('http');
const fs = require('fs');
const EOL = require('os').EOL;

const fileService = require('./services/file.service');

// Loading the file index.html displayed to the client
console.log('Server started to serve stuff');
let server = http.createServer(function (req, res) {
    fs.readFile('./views/index.html', 'utf-8', (error, text) => {
        fs.readFile('./logs/log.txt', 'utf-8', (error, content) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            if (error) {
                res.end(text);
            } else {
                let arr = String(content).split(EOL);
                arr = arr.filter(Boolean);
                console.log(arr.length);
                if (arr.lenth <= 3) {
                    let string = arr.toString().replace(/\n/g, '</br>');
                    res.end(string + text);
                } else {
                    arr = arr.slice(Math.max(arr.length - 3));
                    console.log(arr.length);;
                    let string = arr.toString().replace(/\n/g, '</br>');
                    res.end(string + text);
                }
            }
        });
    });
});

fileService.checkFile(server);
server.listen(3000);